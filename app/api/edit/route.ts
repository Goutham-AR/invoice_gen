import { NextResponse } from "next/server";
import { z } from "zod";
import { getModule } from "@/lib/formats/registry";
import { editRecords } from "@/lib/llm/generate";

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
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { formatType, variantId, records, instruction } = parsed.data;
  const variantModule = getModule(formatType, variantId);
  if (!variantModule) {
    return NextResponse.json({ error: `Unknown format/variant: ${formatType}/${variantId}` }, { status: 404 });
  }

  const result = await editRecords(variantModule, records, instruction);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  let renderedText: string;
  try {
    renderedText = variantModule.render(result.records);
  } catch (err) {
    return NextResponse.json(
      { error: `Rendering failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ records: result.records, renderedText, variantId });
}
