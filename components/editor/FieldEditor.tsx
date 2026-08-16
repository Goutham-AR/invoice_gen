"use client";

import { z } from "zod";
import type { FieldMeta } from "@/lib/formats/types";
import type { PathKey } from "@/lib/editor/pathUtils";
import { unwrapOptional, defaultValue, humanize } from "@/lib/editor/schemaIntrospect";

export type FieldEditorProps = {
  schema: z.ZodTypeAny;
  value: unknown;
  dataPath: PathKey[];
  metaPath: string;
  fieldsByKey: Map<string, FieldMeta>;
  onSet: (path: PathKey[], value: unknown) => void;
  onRemove: (path: PathKey[]) => void;
  label?: string;
};

const inputClass =
  "w-full rounded-md border border-hairline bg-paper px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ledger/40 focus:border-ledger";

function RemoveButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="text-ink-muted hover:text-danger transition-colors text-xs leading-none px-1"
    >
      ×
    </button>
  );
}

export default function FieldEditor({
  schema,
  value,
  dataPath,
  metaPath,
  fieldsByKey,
  onSet,
  onRemove,
  label,
}: FieldEditorProps) {
  const { inner, optional } = unwrapOptional(schema);
  const meta = fieldsByKey.get(metaPath);
  const key = String(dataPath[dataPath.length - 1] ?? "");
  const displayLabel = label ?? meta?.label ?? humanize(key);

  if (optional && value === undefined) {
    return (
      <div className="flex items-center gap-2 py-1 text-xs">
        <span className="text-ink-muted w-36 shrink-0 truncate">{displayLabel}</span>
        <button
          type="button"
          onClick={() => onSet(dataPath, defaultValue(inner, true))}
          className="text-ledger hover:underline"
        >
          + Add
        </button>
        {meta?.notes && <span className="text-ink-muted/70 truncate">{meta.notes}</span>}
      </div>
    );
  }

  if (inner instanceof z.ZodObject) {
    const shape = inner.shape as Record<string, z.ZodTypeAny>;
    const obj = (value ?? {}) as Record<string, unknown>;
    const shapeKeys = Object.keys(shape);
    const arrayKeys = shapeKeys.filter((k) => unwrapOptional(shape[k]).inner instanceof z.ZodArray);
    const scalarKeys = shapeKeys.filter((k) => !arrayKeys.includes(k));

    return (
      <div className="space-y-3">
        {scalarKeys.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {scalarKeys.map((k) => (
              <FieldEditor
                key={k}
                schema={shape[k]}
                value={obj[k]}
                dataPath={[...dataPath, k]}
                metaPath={metaPath ? `${metaPath}.${k}` : k}
                fieldsByKey={fieldsByKey}
                onSet={onSet}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
        {arrayKeys.map((k) => (
          <FieldEditor
            key={k}
            schema={shape[k]}
            value={obj[k]}
            dataPath={[...dataPath, k]}
            metaPath={metaPath ? `${metaPath}.${k}` : k}
            fieldsByKey={fieldsByKey}
            onSet={onSet}
            onRemove={onRemove}
          />
        ))}
      </div>
    );
  }

  if (inner instanceof z.ZodArray) {
    const items = Array.isArray(value) ? value : [];
    const elementSchema = inner.element as z.ZodTypeAny;
    const arrayLabel = meta?.label ?? humanize(key);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {arrayLabel}
          </span>
          <button
            type="button"
            onClick={() => onSet(dataPath, [...items, defaultValue(elementSchema, true)])}
            className="text-xs text-ledger hover:underline"
          >
            + Add row
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="relative rounded-lg border border-hairline bg-paper/60 p-3 pr-8">
              <span className="absolute top-2 left-3 font-mono text-[10px] text-ink-muted">
                #{idx + 1}
              </span>
              <div className="mt-4">
                <FieldEditor
                  schema={elementSchema}
                  value={item}
                  dataPath={[...dataPath, idx]}
                  metaPath={`${metaPath}[]`}
                  fieldsByKey={fieldsByKey}
                  onSet={onSet}
                  onRemove={onRemove}
                />
              </div>
              <div className="absolute top-2 right-2">
                <RemoveButton onClick={() => onRemove([...dataPath, idx])} title="Remove row" />
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-ink-muted italic">No rows yet.</p>
          )}
        </div>
      </div>
    );
  }

  const removable = optional && value !== undefined;

  if (inner instanceof z.ZodEnum) {
    const options = inner.options as string[];
    return (
      <label className="block text-xs">
        <span className="text-ink-muted">{displayLabel}</span>
        <div className="flex items-center gap-1 mt-0.5">
          <select
            className={inputClass}
            value={typeof value === "string" ? value : options[0]}
            onChange={(e) => onSet(dataPath, e.target.value)}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {removable && <RemoveButton onClick={() => onRemove(dataPath)} title="Unset field" />}
        </div>
      </label>
    );
  }

  if (inner instanceof z.ZodNumber) {
    return (
      <label className="block text-xs">
        <span className="text-ink-muted">{displayLabel}</span>
        <div className="flex items-center gap-1 mt-0.5">
          <input
            type="number"
            className={inputClass}
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onSet(dataPath, e.target.value === "" ? 0 : Number(e.target.value))}
          />
          {removable && <RemoveButton onClick={() => onRemove(dataPath)} title="Unset field" />}
        </div>
      </label>
    );
  }

  if (inner instanceof z.ZodBoolean) {
    return (
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onSet(dataPath, e.target.checked)}
        />
        <span className="text-ink-muted">{displayLabel}</span>
        {removable && <RemoveButton onClick={() => onRemove(dataPath)} title="Unset field" />}
      </label>
    );
  }

  // ZodString and any unhandled leaf type fall back to a plain text input.
  return (
    <label className="block text-xs">
      <span className="text-ink-muted">{displayLabel}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <input
          type="text"
          className={inputClass}
          value={typeof value === "string" ? value : value === undefined ? "" : String(value)}
          placeholder={meta?.example}
          onChange={(e) => onSet(dataPath, e.target.value)}
        />
        {removable && <RemoveButton onClick={() => onRemove(dataPath)} title="Unset field" />}
      </div>
    </label>
  );
}
