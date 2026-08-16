import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type Rule = {
  id: string;
  text: string;
  enabled: boolean;
  createdAt: string;
};

// Single-user, file-backed for now — swap this module for a DB-backed one later
// without touching callers (API routes, the prompt builder).
const RULES_FILE = path.join(process.cwd(), "data", "rules.json");

function readAll(): Rule[] {
  try {
    const raw = fs.readFileSync(RULES_FILE, "utf-8");
    return JSON.parse(raw) as Rule[];
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

function writeAll(rules: Rule[]): void {
  fs.mkdirSync(path.dirname(RULES_FILE), { recursive: true });
  fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2), "utf-8");
}

export function listRules(): Rule[] {
  return readAll();
}

export function getEnabledRuleTexts(): string[] {
  return readAll()
    .filter((r) => r.enabled)
    .map((r) => r.text);
}

export function createRule(text: string): Rule {
  const rule: Rule = { id: randomUUID(), text, enabled: true, createdAt: new Date().toISOString() };
  const rules = readAll();
  rules.push(rule);
  writeAll(rules);
  return rule;
}

export function updateRule(id: string, patch: Partial<Pick<Rule, "text" | "enabled">>): Rule | null {
  const rules = readAll();
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rules[idx] = { ...rules[idx], ...patch };
  writeAll(rules);
  return rules[idx];
}

export function deleteRule(id: string): boolean {
  const rules = readAll();
  const next = rules.filter((r) => r.id !== id);
  if (next.length === rules.length) return false;
  writeAll(next);
  return true;
}
