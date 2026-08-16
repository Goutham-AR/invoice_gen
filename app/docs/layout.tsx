import type { ReactNode } from "react";
import DocsSidebar from "@/components/sidebar/DocsSidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DocsSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
