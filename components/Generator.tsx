"use client";

import { useMemo, useState } from "react";
import { groupedClientRegistry, getClientModule } from "@/lib/formats/clientRegistry";
import AppSidebar from "@/components/sidebar/AppSidebar";
import FormatTree, { type TreeModule } from "@/components/sidebar/FormatTree";

type GenerateResponse = { records: unknown[]; renderedText: string; variantId: string };
type ErrorResponse = { error: string };

const groups = groupedClientRegistry();

const GROUP_LABELS: Record<string, string> = { csv: "CSV", edi: "EDI", quickbooks: "QuickBooks" };

export default function Generator() {
  const [formatType, setFormatType] = useState(groups[0].formatType);
  const [variantId, setVariantId] = useState(groups[0].modules[0].id);
  const [prompt, setPrompt] = useState("");
  const [records, setRecords] = useState<unknown[] | null>(null);
  const [renderedText, setRenderedText] = useState("");
  const [editorText, setEditorText] = useState("");
  const [fixupInstruction, setFixupInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [fixupLoading, setFixupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");

  const currentGroup = groups.find((g) => g.formatType === formatType) ?? groups[0];
  const currentVariant = currentGroup.modules.find((m) => m.id === variantId) ?? currentGroup.modules[0];
  const currentModule = useMemo(() => getClientModule(formatType, variantId), [formatType, variantId]);

  function handleSelectVariant(m: TreeModule) {
    setFormatType(m.formatType);
    setVariantId(m.id);
  }

  function applyResult(data: GenerateResponse) {
    setRecords(data.records);
    setRenderedText(data.renderedText);
    setEditorText(JSON.stringify(data.records, null, 2));
    setEditorError(null);
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, formatType, variantId }),
      });
      const data = (await res.json()) as GenerateResponse | ErrorResponse;
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Generation failed.");
        return;
      }
      applyResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleApplyEdit() {
    if (!currentModule) return;
    setEditorError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(editorText);
    } catch {
      setEditorError("Not valid JSON.");
      return;
    }
    const result = currentModule.schema.safeParse(parsed);
    if (!result.success) {
      setEditorError(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"));
      return;
    }
    setRecords(result.data);
    setRenderedText(currentModule.render(result.data));
  }

  async function handleFixup() {
    if (!records || !fixupInstruction.trim()) return;
    setFixupLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formatType, variantId, records, instruction: fixupInstruction }),
      });
      const data = (await res.json()) as GenerateResponse | ErrorResponse;
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Edit failed.");
        return;
      }
      applyResult(data);
      setFixupInstruction("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Edit failed.");
    } finally {
      setFixupLoading(false);
    }
  }

  function handleDownload() {
    if (!currentModule) return;
    const blob = new Blob([renderedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${variantId}${currentModule.fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(renderedText);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy"), 1500);
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeNav="generator">
        <FormatTree
          groups={groups}
          isActive={(m) => m.id === variantId}
          onSelect={handleSelectVariant}
        />
      </AppSidebar>

      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-3xl px-8 py-12 space-y-8">
          <header>
            <h1 className="font-display italic text-3xl text-ink">Generate an invoice fixture</h1>
            <p className="text-sm text-ink-muted mt-2 max-w-lg">
              Describe the invoices you need in plain text — who, when, and any edge case to
              exercise. The format and variant come from the sidebar.
            </p>
          </header>

          <section className="rounded-xl border border-hairline bg-surface p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono uppercase tracking-wider text-ink-muted">
                {GROUP_LABELS[formatType] ?? formatType}
              </span>
              <span className="text-hairline">/</span>
              <span className="font-medium text-ledger">{currentVariant.label}</span>
            </div>
            <p className="text-xs text-ink-muted -mt-2">{currentVariant.description}</p>

            <textarea
              className="w-full rounded-lg border border-hairline bg-paper px-3.5 py-3 h-28 text-sm placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger"
              placeholder='e.g. "Generate 3 invoices for customer 7385, one with a credit/return line item"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-ledger text-white text-sm font-medium disabled:opacity-50 hover:bg-ledger/90 transition-colors"
            >
              {loading ? "Generating…" : "Generate"}
            </button>
          </section>

          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger-tint text-danger px-4 py-3 text-sm whitespace-pre-wrap">
              {error}
            </div>
          )}

          {records && (
            <>
              <section className="rounded-xl border border-hairline bg-surface overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-ink">Output</h2>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-stamp/40 text-stamp bg-stamp-tint">
                      {currentModule?.fileExtension}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="text-xs border border-hairline rounded-md px-2.5 py-1 text-ink-muted hover:text-ink hover:border-ink/30 transition-colors"
                    >
                      {copyLabel}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="text-xs border border-hairline rounded-md px-2.5 py-1 text-ink-muted hover:text-ink hover:border-ink/30 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
                <pre className="w-full overflow-x-auto px-5 py-4 text-xs font-mono leading-relaxed whitespace-pre text-ink">
                  {renderedText}
                </pre>
              </section>

              <section className="rounded-xl border border-hairline bg-surface p-5 space-y-2">
                <h2 className="text-sm font-medium text-ink">Fix it with a prompt</h2>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-hairline bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger"
                    placeholder='e.g. "make invoice 2 a credit/return line"'
                    value={fixupInstruction}
                    onChange={(e) => setFixupInstruction(e.target.value)}
                  />
                  <button
                    onClick={handleFixup}
                    disabled={fixupLoading}
                    className="px-4 py-2 rounded-md border border-hairline text-sm text-ink hover:border-ledger hover:text-ledger disabled:opacity-50 transition-colors"
                  >
                    {fixupLoading ? "Applying…" : "Apply"}
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-hairline bg-surface p-5 space-y-2">
                <h2 className="text-sm font-medium text-ink">Edit structured data</h2>
                <textarea
                  className="w-full rounded-lg border border-hairline bg-paper px-3.5 py-3 h-56 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger"
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                />
                {editorError && (
                  <p className="text-xs text-danger whitespace-pre-wrap">{editorError}</p>
                )}
                <button
                  onClick={handleApplyEdit}
                  className="text-xs border border-hairline rounded-md px-3 py-1.5 text-ink-muted hover:text-ink hover:border-ink/30 transition-colors"
                >
                  Re-render
                </button>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
