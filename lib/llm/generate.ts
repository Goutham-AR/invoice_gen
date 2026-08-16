import { z } from "zod";
import type { FormatModule } from "../formats/types";
import { getLlmClient, getLlmModel } from "./client";

const MAX_REPAIR_ATTEMPTS = 2;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type GenerateResult<T> = { ok: true; records: T[] } | { ok: false; error: string };

async function callLlm(messages: ChatMessage[]): Promise<string> {
  const client = getLlmClient();
  const model = getLlmModel();
  const completion = await client.chat.completions.create({
    model,
    messages,
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("LLM returned an empty response.");
  return content;
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

function buildSystemPrompt<T>(module: FormatModule<T>): string {
  const jsonSchema = z.toJSONSchema(module.schema as unknown as z.ZodType);

  return [
    `You generate synthetic test invoice data used to exercise an invoice ingestion pipeline for the "${module.label}" format (${module.description}).`,
    `Respond with ONLY a JSON object of the form {"invoices": [...]}, where "invoices" is a JSON array conforming to this JSON Schema:`,
    JSON.stringify(jsonSchema),
    `Format-specific business rules you must honor when deciding field values:`,
    module.promptGuidance,
    [
      "Rules:",
      "- Only include optional fields you have a real basis for; omit ones the request gives no reason to set.",
      "- For anything the request doesn't specify, invent plausible realistic values consistent with each field's type/example.",
      "- Do not invent values for fields the schema does not define (e.g. computed totals, segment counts) — those are handled outside your output.",
      "- If the request does not specify a count of invoices, generate exactly 1.",
      "- Output raw JSON only: no markdown fences, no commentary.",
    ].join("\n"),
  ].join("\n\n");
}

async function runValidateRepairLoop<T>(
  module: FormatModule<T>,
  messages: ChatMessage[]
): Promise<GenerateResult<T>> {
  const working = [...messages];

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    let raw: string;
    try {
      raw = await callLlm(working);
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

export async function generateRecords<T>(
  module: FormatModule<T>,
  prompt: string
): Promise<GenerateResult<T>> {
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(module) },
    { role: "user", content: prompt },
  ];
  return runValidateRepairLoop(module, messages);
}

export async function editRecords<T>(
  module: FormatModule<T>,
  records: T[],
  instruction: string
): Promise<GenerateResult<T>> {
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
  return runValidateRepairLoop(module, messages);
}
