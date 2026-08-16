import Link from "next/link";
import type { ReactNode } from "react";

export default function AppSidebar({
  activeNav,
  children,
}: {
  activeNav: "generator" | "docs";
  children: ReactNode;
}) {
  const navItemClass = (active: boolean) =>
    `px-2.5 py-1.5 rounded-md text-sm ${
      active ? "bg-ledger-tint text-ledger font-medium" : "text-ink-muted hover:bg-paper hover:text-ink"
    }`;

  return (
    <aside className="w-64 shrink-0 border-r border-hairline bg-surface flex flex-col h-screen sticky top-0">
      <div className="px-5 pt-6 pb-4 border-b border-hairline">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display italic text-xl text-ink">Ledger</span>
          <span className="font-mono text-[10px] tracking-wider text-stamp uppercase">Fixtures</span>
        </Link>
        <p className="text-xs text-ink-muted mt-1">Invoice format generator</p>
      </div>

      <nav className="px-3 py-3 border-b border-hairline flex flex-col gap-0.5">
        <Link href="/" className={navItemClass(activeNav === "generator")}>
          Generator
        </Link>
        <Link href="/docs" className={navItemClass(activeNav === "docs")}>
          Format docs
        </Link>
      </nav>

      <div className="flex-1 overflow-y-auto px-3 py-3">{children}</div>
    </aside>
  );
}
