import type { FieldMeta } from "@/lib/formats/types";

export default function FieldTable({ fields }: { fields: FieldMeta[] }) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-neutral-100 dark:bg-neutral-900">
          <tr className="text-left">
            <th className="px-3 py-2 font-medium">Field</th>
            <th className="px-3 py-2 font-medium">Data Type</th>
            <th className="px-3 py-2 font-medium">Mandatory</th>
            <th className="px-3 py-2 font-medium">Scope</th>
            <th className="px-3 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.key} className="border-t align-top">
              <td className="px-3 py-2 font-mono text-xs">{f.label}</td>
              <td className="px-3 py-2 text-xs">{f.dataType}</td>
              <td className="px-3 py-2 text-xs">{f.mandatory ? "Mandatory" : "Optional"}</td>
              <td className="px-3 py-2 text-xs">{f.scope}</td>
              <td className="px-3 py-2 text-xs text-neutral-500">{f.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
