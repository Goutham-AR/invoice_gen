"use client";

import { useEffect, useState } from "react";

type Rule = { id: string; text: string; enabled: boolean; createdAt: string };

export default function RulesManager() {
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [newRuleText, setNewRuleText] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rules")
      .then((res) => res.json())
      .then((data: { rules: Rule[] }) => setRules(data.rules))
      .catch(() => setError("Failed to load rules."));
  }, []);

  async function addRule() {
    const text = newRuleText.trim();
    if (!text) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to add rule.");
      const data = (await res.json()) as { rule: Rule };
      setRules((current) => [...(current ?? []), data.rule]);
      setNewRuleText("");
    } catch {
      setError("Failed to add rule.");
    } finally {
      setAdding(false);
    }
  }

  async function toggleRule(rule: Rule) {
    const nextEnabled = !rule.enabled;
    setRules((current) =>
      (current ?? []).map((r) => (r.id === rule.id ? { ...r, enabled: nextEnabled } : r))
    );
    try {
      const res = await fetch(`/api/rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setError("Failed to update rule.");
      setRules((current) =>
        (current ?? []).map((r) => (r.id === rule.id ? { ...r, enabled: rule.enabled } : r))
      );
    }
  }

  async function deleteRule(id: string) {
    const previous = rules;
    setRules((current) => (current ?? []).filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/rules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setError("Failed to delete rule.");
      setRules(previous);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-12 space-y-8">
      <header>
        <h1 className="font-display italic text-3xl text-ink">Rules</h1>
        <p className="text-sm text-ink-muted mt-2 max-w-lg">
          Standing instructions injected into every generation and fix-it prompt, across every
          format and variant — extra units of measure, a decimal precision limit, anything you
          want applied consistently without repeating it in every prompt.
        </p>
      </header>

      <section className="rounded-xl border border-hairline bg-surface p-6 space-y-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-hairline bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger"
            placeholder='e.g. "Round all prices to 2 decimal places" or "Allow KG as a unit of measure"'
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRule()}
          />
          <button
            onClick={addRule}
            disabled={adding || !newRuleText.trim()}
            className="px-4 py-2 rounded-md bg-ledger text-white text-sm font-medium disabled:opacity-50 hover:bg-ledger/90 transition-colors"
          >
            {adding ? "Adding…" : "Add rule"}
          </button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </section>

      <section className="space-y-2">
        {rules === null && <p className="text-sm text-ink-muted">Loading…</p>}
        {rules?.length === 0 && (
          <p className="text-sm text-ink-muted italic">No rules yet — add one above.</p>
        )}
        {rules?.map((rule) => (
          <div
            key={rule.id}
            className={`flex items-center gap-3 rounded-lg border border-hairline bg-surface px-4 py-3 ${
              rule.enabled ? "" : "opacity-50"
            }`}
          >
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={() => toggleRule(rule)}
              className="shrink-0"
            />
            <span className="flex-1 text-sm text-ink">{rule.text}</span>
            <button
              onClick={() => deleteRule(rule.id)}
              className="text-xs text-ink-muted hover:text-danger transition-colors shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
