import { z } from "zod";
import { getModule } from "@/lib/formats/registry";
import { editRecordsStream } from "@/lib/llm/generate";

const requestSchema = z.object({
  formatType: z.string(),
  variantId: z.string(),
  records: z.array(z.unknown()),
  instruction: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
  }

  const { formatType, variantId, records, instruction } = parsed.data;
  const variantModule = getModule(formatType, variantId);
  if (!variantModule) {
    return new Response(
      JSON.stringify({ error: `Unknown format/variant: ${formatType}/${variantId}` }),
      { status: 404 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));

      try {
        for await (const event of editRecordsStream(variantModule, records, instruction, request.signal)) {
          if (event.type === "error") {
            send(event);
            continue;
          }
          send({ ...event, renderedText: variantModule.render(event.records) });
        }
      } catch (err) {
        if (!request.signal.aborted) {
          send({ type: "error", message: err instanceof Error ? err.message : "Edit failed." });
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      // Client disconnected; request.signal already carries the abort through to the LLM call.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
