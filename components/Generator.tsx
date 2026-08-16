"use client";

import { useMemo, useRef, useState } from "react";
import { groupedClientRegistry, getClientModule } from "@/lib/formats/clientRegistry";
import { consumeNdjson } from "@/lib/streamClient";
import AppSidebar from "@/components/sidebar/AppSidebar";
import FormatTree, { type TreeModule } from "@/components/sidebar/FormatTree";

type ErrorResponse = { error: string };

const groups = groupedClientRegistry();

const GROUP_LABELS: Record<string, string> = { csv: "CSV", edi: "EDI", quickbooks: "QuickBooks" };

export default function Generator() {
  const [formatType, setFormatType] = useState(groups[0].formatType);
  const [variantId, setVariantId] = useState(groups[0].modules[0].id);
  const [prompt, setPrompt] = useState("");
  const [records, setRecords] = useState<unknown[] | null>(null);
  const [renderedText, setRenderedText] = useState("");
  const [fixupInstruction, setFixupInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [fixupLoading, setFixupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");

  const abortRef = useRef<AbortController | null>(null);

  const currentGroup = groups.find((g) => g.formatType === formatType) ?? groups[0];
  const currentVariant = currentGroup.modules.find((m) => m.id === variantId) ?? currentGroup.modules[0];
  const currentModule = useMemo(() => getClientModule(formatType, variantId), [formatType, variantId]);

  const busy = loading || fixupLoading;

  function handleSelectVariant(m: TreeModule) {
    if (m.formatType === formatType && m.id === variantId) return;
    abortRef.current?.abort();
    setFormatType(m.formatType);
    setVariantId(m.id);
    setRecords(null);
    setRenderedText("");
    setError(null);
    setFixupInstruction("");
  }

  function handleCancel() {
    abortRef.current?.abort();
  }

  async function runStream(
    url: string,
    body: unknown,
    setBusy: (v: boolean) => void
  ): Promise<void> {
    setBusy(true);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({ error: "Request failed." }))) as ErrorResponse;
        setError(data.error ?? "Request failed.");
        return;
      }

      await consumeNdjson(res, (line) => {
        if (line.type === "record" || line.type === "done") {
          setRecords(line.records);
          setRenderedText(line.renderedText);
        } else if (line.type === "error") {
          setError(line.message);
        }
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Cancelled by the user — not an error.
      } else {
        setError(err instanceof Error ? err.message : "Request failed.");
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  async function handleGenerate() {
    setRecords(null);
    setRenderedText("");
    await runStream("/api/generate", { prompt, formatType, variantId }, setLoading);
  }

  async function handleFixup() {
    if (!records || !fixupInstruction.trim()) return;
    const instruction = fixupInstruction;
    await runStream("/api/edit", { formatType, variantId, records, instruction }, setFixupLoading);
    setFixupInstruction((current) => (current === instruction ? "" : current));
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={busy}
                className="px-4 py-2 rounded-md bg-ledger text-white text-sm font-medium disabled:opacity-50 hover:bg-ledger/90 transition-colors"
              >
                {loading ? "Generating…" : "Generate"}
              </button>
              {busy && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-md border border-hairline text-sm text-ink-muted hover:text-ink hover:border-ink/30 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
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
                    {loading && (
                      <span className="text-[10px] text-ink-muted animate-pulse">streaming…</span>
                    )}
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
                <pre className="w-full max-h-96 overflow-auto px-5 py-4 text-xs font-mono leading-relaxed whitespace-pre text-ink">
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
                    disabled={busy}
                    className="px-4 py-2 rounded-md border border-hairline text-sm text-ink hover:border-ledger hover:text-ledger disabled:opacity-50 transition-colors"
                  >
                    {fixupLoading ? "Applying…" : "Apply"}
                  </button>
                  {fixupLoading && (
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-md border border-hairline text-sm text-ink-muted hover:text-ink hover:border-ink/30 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
