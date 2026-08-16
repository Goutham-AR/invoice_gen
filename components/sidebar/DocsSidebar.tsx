"use client";

import { usePathname } from "next/navigation";
import { groupedClientRegistry } from "@/lib/formats/clientRegistry";
import AppSidebar from "./AppSidebar";
import FormatTree, { type TreeModule } from "./FormatTree";

const groups = groupedClientRegistry();

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <AppSidebar activeNav="docs">
      <FormatTree
        groups={groups}
        isActive={(m) => pathname === `/docs/${m.formatType}/${m.id}`}
        hrefFor={(m: TreeModule) => `/docs/${m.formatType}/${m.id}`}
      />
    </AppSidebar>
  );
}
