import { z } from "zod";
import type { FormatModule } from "../formats/types";
import { getLlmClient, getLlmModel } from "./client";

const MAX_REPAIR_ATTEMPTS = 2;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type GenerateResult<T> = { ok: true; records: T[] } | { ok: false; error: string };

/** Emitted as each invoice streams in, then a final authoritative result. */
export type StreamEvent<T> =
  | { type: "record"; record: T; records: T[] }
  | { type: "done"; records: T[] }
  | { type: "error"; message: string };

async function callLlm(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
  const client = getLlmClient();
  const model = getLlmModel();
  const completion = await client.chat.completions.create(
    { model, messages, response_format: { type: "json_object" }, temperature: 0.7 },
    { signal }
  );
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("LLM returned an empty response.");
  return content;
}

type StreamDelta = { content?: string | null; reasoning_content?: string | null };

/** Streams response text only — reasoning-model "thinking" tokens (delta.reasoning_content) are never yielded. */
async function* streamLlmContent(
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<string> {
  const client = getLlmClient();
  const model = getLlmModel();
  const stream = await client.chat.completions.create(
    { model, messages, response_format: { type: "json_object" }, temperature: 0.7, stream: true },
    { signal }
  );
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta as StreamDelta | undefined;
    if (delta?.content) yield delta.content;
  }
}

/** Reasoning models (e.g. served via sglang) can prepend a <think> block even in json_object mode. */
function stripThinkBlock(raw: string): string {
  return raw.replace(/^\s*<think>[\s\S]*?<\/think>\s*/i, "");
}

/** Models in json_object mode typically wrap the array under a key; unwrap defensively. */
function extractArray(raw: string): unknown {
  const parsed = JSON.parse(stripThinkBlock(raw));
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") {
    const arrayValue = Object.values(parsed as Record<string, unknown>).find((v) =>
      Array.isArray(v)
    );
    if (arrayValue) return arrayValue;
  }
  return parsed;
}

/**
 * Incrementally scans a growing text buffer for the `"invoices": [...]` array (or a
 * bare top-level array as a fallback) and returns the raw text of each top-level
 * object as soon as it closes — brace-depth tracking works regardless of how deeply
 * nested an item's own fields are, since we only act on transitions back to depth 0.
 */
export function createIncrementalItemParser() {
  let buffer = "";
  let scanPos = -1; // -1 = array start not yet located
  let depth = 0;
  let itemStart = -1;
  let inString = false;
  let escapeNext = false;
  let arrayClosed = false;

  function locateArrayStart(buf: string): number {
    const key = buf.indexOf('"invoices"');
    if (key !== -1) {
      return buf.indexOf("[", key); // -1 if the '[' hasn't streamed in yet
    }
    const trimmed = buf.trimStart();
    if (trimmed.startsWith("[")) {
      return buf.length - trimmed.length;
    }
    return -1;
  }

  return {
    push(chunk: string): string[] {
      buffer += chunk;
      const items: string[] = [];
      if (arrayClosed) return items;

      if (scanPos === -1) {
        const arrStart = locateArrayStart(buffer);
        if (arrStart === -1) return items;
        scanPos = arrStart + 1;
      }

      for (; scanPos < buffer.length; scanPos++) {
        const ch = buffer[scanPos];
        if (inString) {
          if (escapeNext) escapeNext = false;
          else if (ch === "\\") escapeNext = true;
          else if (ch === '"') inString = false;
          continue;
        }
        if (ch === '"') {
          inString = true;
          continue;
        }
        if (ch === "{") {
          if (depth === 0) itemStart = scanPos;
          depth++;
          continue;
        }
        if (ch === "}") {
          depth = Math.max(depth - 1, -1);
          if (depth === 0 && itemStart !== -1) {
            items.push(buffer.slice(itemStart, scanPos + 1));
            itemStart = -1;
          }
          continue;
        }
        if (ch === "]" && depth === 0) {
          arrayClosed = true;
          break;
        }
      }
      return items;
    },
  };
}

function currentDateLine(): string {
  const now = new Date();
  const iso = now.toISOString().slice(0, 10);
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  return `Today's date is ${iso} (${weekday}). Use this as the reference point for any relative date the request implies (e.g. "due in 30 days", "last month's invoice", "dated yesterday") — do not default to a date from your training data.`;
}

function buildSystemPrompt<T>(module: FormatModule<T>): string {
  const jsonSchema = z.toJSONSchema(module.schema as unknown as z.ZodType);

  return [
    `You generate synthetic test invoice data used to exercise an invoice ingestion pipeline for the "${module.label}" format (${module.description}).`,
    currentDateLine(),
    `Respond with ONLY a JSON object of the form {"invoices": [...]}, where "invoices" is a JSON array conforming to this JSON Schema:`,
    JSON.stringify(jsonSchema),
    `Format-specific business rules you must honor when deciding field values:`,
    module.promptGuidance,
    [
      "Rules:",
      "- Populate mandatory fields only, by default. Do NOT add an optional field unless the request gives a concrete, specific reason to set it (e.g. \"with a promotional discount\" is a reason to set that one optional field; a generic request for invoices is not a reason to fill in every optional field you can invent a plausible value for).",
      "- When you do have reason to set an optional field, invent a plausible realistic value consistent with its type/example — but the default for any optional field, absent that reason, is to leave it out of the object entirely (not null, not empty string — omitted).",
      "- For mandatory fields, which must always be present, invent plausible realistic values consistent with each field's type/example when the request doesn't specify them.",
      "- Do not invent values for fields the schema does not define (e.g. computed totals, segment counts) — those are handled outside your output.",
      "- If the request does not specify a count of invoices, generate exactly 1.",
      "- Output raw JSON only: no markdown fences, no commentary.",
    ].join("\n"),
  ].join("\n\n");
}

async function runValidateRepairLoop<T>(
  module: FormatModule<T>,
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<GenerateResult<T>> {
  const working = [...messages];

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    let raw: string;
    try {
      raw = await callLlm(working, signal);
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "LLM request failed." };
    }

    let candidate: unknown;
    try {
      candidate = extractArray(raw);
    } catch {
      working.push({ role: "assistant", content: raw });
      working.push({
        role: "user",
        content: "That was not valid JSON. Respond again with ONLY the JSON object described above.",
      });
      continue;
    }

    const result = module.schema.safeParse(candidate);
    if (result.success) {
      return { ok: true, records: result.data };
    }

    working.push({ role: "assistant", content: raw });
    working.push({
      role: "user",
      content: `Your JSON did not match the schema. Issues:\n${JSON.stringify(
        result.error.issues,
        null,
        2
      )}\n\nFix these and resend the complete JSON object.`,
    });
  }

  return {
    ok: false,
    error: `LLM output failed schema validation after ${MAX_REPAIR_ATTEMPTS + 1} attempts.`,
  };
}

async function* runStreamingPass<T>(
  module: FormatModule<T>,
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<StreamEvent<T>> {
  const parser = createIncrementalItemParser();
  const validRecords: T[] = [];
  let rawBuffer = "";

  try {
    for await (const delta of streamLlmContent(messages, signal)) {
      if (signal?.aborted) return;
      rawBuffer += delta;
      for (const itemText of parser.push(delta)) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(itemText);
        } catch {
          continue;
        }
        const result = module.itemSchema.safeParse(parsed);
        if (result.success) {
          validRecords.push(result.data);
          yield { type: "record", record: result.data, records: [...validRecords] };
        }
      }
    }
  } catch (err) {
    if (signal?.aborted) return;
    yield { type: "error", message: err instanceof Error ? err.message : "LLM request failed." };
    return;
  }

  if (signal?.aborted) return;

  // Authoritative pass over the full accumulated response — catches array-level
  // constraints and anything the incremental scan missed.
  let candidate: unknown;
  try {
    candidate = extractArray(rawBuffer);
  } catch {
    candidate = undefined;
  }

  const fullResult = candidate !== undefined ? module.schema.safeParse(candidate) : undefined;
  if (fullResult?.success) {
    yield { type: "done", records: fullResult.data };
    return;
  }

  // Fall back to the non-streaming repair loop, seeded with what the model already said.
  const working: ChatMessage[] = [
    ...messages,
    { role: "assistant", content: rawBuffer },
    {
      role: "user",
      content: fullResult
        ? `Your JSON did not match the schema. Issues:\n${JSON.stringify(
            fullResult.error.issues,
            null,
            2
          )}\n\nFix these and resend the complete JSON object.`
        : "That was not valid JSON. Respond again with ONLY the JSON object described above.",
    },
  ];

  const repaired = await runValidateRepairLoop(module, working, signal);
  if (repaired.ok) {
    yield { type: "done", records: repaired.records };
  } else {
    yield { type: "error", message: repaired.error };
  }
}

export function generateRecordsStream<T>(
  module: FormatModule<T>,
  prompt: string,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent<T>> {
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(module) },
    { role: "user", content: prompt },
  ];
  return runStreamingPass(module, messages, signal);
}

export function editRecordsStream<T>(
  module: FormatModule<T>,
  records: T[],
  instruction: string,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent<T>> {
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(module) },
    {
      role: "user",
      content: `Current invoice data (JSON array):\n${JSON.stringify(
        records,
        null,
        2
      )}\n\nApply this instruction and return the complete, updated JSON array (not a diff, not just the changed parts): ${instruction}`,
    },
  ];
  return runStreamingPass(module, messages, signal);
}
