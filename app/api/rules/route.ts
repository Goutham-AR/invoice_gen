import { NextResponse } from "next/server";
import { z } from "zod";
import { listRules, createRule } from "@/lib/rules/store";

export async function GET() {
  return NextResponse.json({ rules: listRules() });
}

const createSchema = z.object({ text: z.string().trim().min(1) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Rule text is required." }, { status: 400 });
  }
  const rule = createRule(parsed.data.text);
  return NextResponse.json({ rule }, { status: 201 });
}
