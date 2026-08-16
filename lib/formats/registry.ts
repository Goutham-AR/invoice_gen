// Server-only registry (reads rules.md/sample via fs through each variant's index.ts).
// Used by API routes and docs pages. Never import this from a client component.
import type { FormatModule, FormatType } from "./types";

import { csv12Module } from "./csv/twelve-column";
import { csv22Module } from "./csv/twenty-two-column";
import { csv24Module } from "./csv/twenty-four-column";
import { edi810Module } from "./edi/edi_810";
import { encompassModule } from "./edi/encompass_edi_810";
import { usFoodsModule } from "./edi/us_foods";
import { zeroSacModule } from "./edi/zero_sac";
import { qbInboundModule } from "./quickbooks/quickbooks_inbound";
import { qbOnlineModule } from "./quickbooks/quickbooks_online_adjustments";

// Each variant module has a concrete (non-unknown) TInvoice, so this array erases to
// the common FormatModule shape — safe here because lookups always pair a module
// with its own data.
export const registry: FormatModule[] = [
  csv12Module,
  csv22Module,
  csv24Module,
  edi810Module,
  encompassModule,
  usFoodsModule,
  zeroSacModule,
  qbInboundModule,
  qbOnlineModule,
] as FormatModule[];

export function getModule(formatType: string, variantId: string): FormatModule | undefined {
  return registry.find((m) => m.formatType === formatType && m.id === variantId);
}

export function groupedRegistry(): { formatType: FormatType; modules: FormatModule[] }[] {
  const types = Array.from(new Set(registry.map((m) => m.formatType)));
  return types.map((formatType) => ({
    formatType,
    modules: registry.filter((m) => m.formatType === formatType),
  }));
}
