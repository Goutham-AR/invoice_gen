import Link from "next/link";
import { groupedRegistry } from "@/lib/formats/registry";

const GROUP_LABELS: Record<string, string> = { csv: "CSV", edi: "EDI", quickbooks: "QuickBooks" };

export default function DocsIndex() {
  const groups = groupedRegistry();

  return (
    <div className="mx-auto max-w-4xl px-8 py-12 space-y-10">
      <header>
        <h1 className="font-display italic text-3xl text-ink">Format reference</h1>
        <p className="text-sm text-ink-muted mt-2 max-w-lg">
          Field definitions, business rules, and a reference sample for every supported format
          and variant.
        </p>
      </header>

      {groups.map((g) => (
        <section key={g.formatType}>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-3">
            {GROUP_LABELS[g.formatType] ?? g.formatType}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {g.modules.map((m) => (
              <Link
                key={m.id}
                href={`/docs/${m.formatType}/${m.id}`}
                className="rounded-xl border border-hairline bg-surface p-4 hover:border-ledger/50 hover:bg-ledger-tint/40 transition-colors"
              >
                <div className="font-medium text-sm text-ink">{m.label}</div>
                <p className="text-xs text-ink-muted mt-1">{m.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
