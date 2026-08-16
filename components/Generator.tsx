"use client";

import { useMemo, useState } from "react";
import { groupedClientRegistry, getClientModule } from "@/lib/formats/clientRegistry";

type GenerateResponse = { records: unknown[]; renderedText: string; variantId: string };
type ErrorResponse = { error: string };

const groups = groupedClientRegistry();

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
  const currentModule = useMemo(
    () => getClientModule(formatType, variantId),
    [formatType, variantId]
  );

  function selectFormatType(next: string) {
    setFormatType(next);
    const group = groups.find((g) => g.formatType === next);
    if (group) setVariantId(group.modules[0].id);
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
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Invoice Fixture Generator</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Describe the invoices you need in plain text, pick a format and variant, and generate
          realistic test files.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Format type</label>
          <select
            className="w-full border rounded-md px-3 py-2 bg-transparent"
            value={formatType}
            onChange={(e) => selectFormatType(e.target.value)}
          >
            {groups.map((g) => (
              <option key={g.formatType} value={g.formatType}>
                {g.formatType.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Variant</label>
          <select
            className="w-full border rounded-md px-3 py-2 bg-transparent"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          >
            {currentGroup.modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-500 mt-1">{currentVariant.description}</p>
        </div>
      </section>

      <section>
        <label className="block text-sm font-medium mb-1">Prompt</label>
        <textarea
          className="w-full border rounded-md px-3 py-2 h-28 bg-transparent"
          placeholder='e.g. "Generate 3 invoices for customer 7385, one with a credit/return line item"'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-3 px-4 py-2 rounded-md bg-black text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </section>

      {error && (
        <div className="border border-red-400 text-red-600 rounded-md px-3 py-2 text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}

      {records && (
        <>
          <section>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-medium">Output ({currentModule?.fileExtension})</h2>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="text-xs border rounded-md px-2 py-1">
                  {copyLabel}
                </button>
                <button onClick={handleDownload} className="text-xs border rounded-md px-2 py-1">
                  Download
                </button>
              </div>
            </div>
            <pre className="w-full overflow-x-auto border rounded-md px-3 py-2 text-xs font-mono whitespace-pre">
              {renderedText}
            </pre>
          </section>

          <section>
            <h2 className="text-sm font-medium mb-1">Fix it with a prompt</h2>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-md px-3 py-2 bg-transparent"
                placeholder='e.g. "make invoice 2 a credit/return line"'
                value={fixupInstruction}
                onChange={(e) => setFixupInstruction(e.target.value)}
              />
              <button
                onClick={handleFixup}
                disabled={fixupLoading}
                className="px-4 py-2 rounded-md border disabled:opacity-50"
              >
                {fixupLoading ? "Applying…" : "Apply"}
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium mb-1">Edit structured data</h2>
            <textarea
              className="w-full border rounded-md px-3 py-2 h-56 font-mono text-xs bg-transparent"
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
            />
            {editorError && (
              <p className="text-xs text-red-600 whitespace-pre-wrap mt-1">{editorError}</p>
            )}
            <button onClick={handleApplyEdit} className="mt-2 text-xs border rounded-md px-3 py-1.5">
              Re-render
            </button>
          </section>
        </>
      )}
    </div>
  );
}
