import { NextResponse } from "next/server";
import { z } from "zod";
import { updateRule, deleteRule } from "@/lib/rules/store";

const patchSchema = z.object({
  text: z.string().trim().min(1).optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const rule = updateRule(id, parsed.data);
  if (!rule) {
    return NextResponse.json({ error: "Rule not found." }, { status: 404 });
  }
  return NextResponse.json({ rule });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = deleteRule(id);
  if (!removed) {
    return NextResponse.json({ error: "Rule not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
