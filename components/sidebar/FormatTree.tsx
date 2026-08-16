import Link from "next/link";

export type TreeModule = {
  id: string;
  formatType: string;
  label: string;
  description: string;
};

export type TreeGroup = { formatType: string; modules: TreeModule[] };

/**
 * Real structural facts about each variant (column/segment count, record shape) —
 * not decorative numbering. This is the one place the design spends its accent color.
 */
const STAMPS: Record<string, string> = {
  twelve_column: "12 col",
  twenty_two_column: "22 col",
  twenty_four_column: "24 col",
  edi_810: "810",
  encompass_edi_810: "810",
  us_foods: "810",
  zero_sac: "810",
  quickbooks_inbound: "AR ledger",
  quickbooks_online_adjustments: "AR ledger",
};

const GROUP_LABELS: Record<string, string> = {
  csv: "CSV",
  edi: "EDI",
  quickbooks: "QuickBooks",
};

function StampPill({ variantId }: { variantId: string }) {
  const stamp = STAMPS[variantId];
  if (!stamp) return null;
  return (
    <span className="shrink-0 font-mono text-[10px] leading-none px-1.5 py-1 rounded border border-stamp/40 text-stamp bg-stamp-tint">
      {stamp}
    </span>
  );
}

export default function FormatTree({
  groups,
  isActive,
  onSelect,
  hrefFor,
}: {
  groups: TreeGroup[];
  isActive: (m: TreeModule) => boolean;
  onSelect?: (m: TreeModule) => void;
  hrefFor?: (m: TreeModule) => string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g.formatType}>
          <div className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1">
            {GROUP_LABELS[g.formatType] ?? g.formatType}
          </div>
          <ul className="flex flex-col gap-0.5">
            {g.modules.map((m) => {
              const active = isActive(m);
              const itemClass = `group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm w-full text-left transition-colors ${
                active ? "bg-ledger-tint text-ledger" : "text-ink-muted hover:bg-paper hover:text-ink"
              }`;
              const content = (
                <>
                  <span className="truncate">{m.label}</span>
                  <StampPill variantId={m.id} />
                </>
              );
              return (
                <li key={m.id}>
                  {hrefFor ? (
                    <Link href={hrefFor(m)} className={itemClass}>
                      {content}
                    </Link>
                  ) : (
                    <button type="button" onClick={() => onSelect?.(m)} className={itemClass}>
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
