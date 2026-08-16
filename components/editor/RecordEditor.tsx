"use client";

import { z } from "zod";
import type { FieldMeta } from "@/lib/formats/types";
import { setAt, removeAt, type PathKey } from "@/lib/editor/pathUtils";
import { defaultValue } from "@/lib/editor/schemaIntrospect";
import FieldEditor from "./FieldEditor";

export default function RecordEditor({
  records,
  itemSchema,
  fields,
  onChange,
}: {
  records: unknown[];
  itemSchema: z.ZodTypeAny;
  fields: FieldMeta[];
  onChange: (records: unknown[]) => void;
}) {
  const fieldsByKey = new Map(fields.map((f) => [f.key, f]));

  function handleSet(path: PathKey[], value: unknown) {
    onChange(setAt(records, path, value) as unknown[]);
  }

  function handleRemove(path: PathKey[]) {
    onChange(removeAt(records, path) as unknown[]);
  }

  function addInvoice() {
    onChange([...records, defaultValue(itemSchema, true)]);
  }

  function removeInvoice(idx: number) {
    onChange(records.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      {records.map((record, idx) => (
        <div key={idx} className="rounded-xl border border-hairline bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-stamp">
              Invoice {idx + 1}
            </span>
            {records.length > 1 && (
              <button
                type="button"
                onClick={() => removeInvoice(idx)}
                className="text-xs text-ink-muted hover:text-danger transition-colors"
              >
                Remove invoice
              </button>
            )}
          </div>
          <FieldEditor
            schema={itemSchema}
            value={record}
            dataPath={[idx]}
            metaPath=""
            fieldsByKey={fieldsByKey}
            onSet={handleSet}
            onRemove={handleRemove}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addInvoice}
        className="text-xs border border-hairline rounded-md px-3 py-1.5 text-ink-muted hover:text-ink hover:border-ink/30 transition-colors"
      >
        + Add invoice
      </button>
    </div>
  );
}
