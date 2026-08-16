import type { FieldMeta } from "@/lib/formats/types";

export default function FieldTable({ fields }: { fields: FieldMeta[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-hairline">
            <th className="px-4 py-2.5 font-medium text-xs text-ink-muted uppercase tracking-wide">
              Field
            </th>
            <th className="px-4 py-2.5 font-medium text-xs text-ink-muted uppercase tracking-wide">
              Data type
            </th>
            <th className="px-4 py-2.5 font-medium text-xs text-ink-muted uppercase tracking-wide">
              Required
            </th>
            <th className="px-4 py-2.5 font-medium text-xs text-ink-muted uppercase tracking-wide">
              Scope
            </th>
            <th className="px-4 py-2.5 font-medium text-xs text-ink-muted uppercase tracking-wide">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, idx) => (
            <tr key={f.key} className={idx > 0 ? "border-t border-hairline" : ""}>
              <td className="px-4 py-2.5 font-mono text-xs text-ink align-top whitespace-nowrap">
                {f.label}
              </td>
              <td className="px-4 py-2.5 text-xs text-ink-muted align-top">{f.dataType}</td>
              <td className="px-4 py-2.5 align-top">
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                    f.mandatory
                      ? "border-ledger/40 text-ledger bg-ledger-tint"
                      : "border-hairline text-ink-muted"
                  }`}
                >
                  {f.mandatory ? "required" : "optional"}
                </span>
              </td>
              <td className="px-4 py-2.5 text-xs text-ink-muted align-top">{f.scope}</td>
              <td className="px-4 py-2.5 text-xs text-ink-muted align-top">{f.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
