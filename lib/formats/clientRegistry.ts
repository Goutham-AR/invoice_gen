// fs-free registry: safe to import from client components. Built directly from each
// variant's meta/schema/fields/render (never its index.ts, which reads rules.md/sample
// off disk via `fs` and would break the browser bundle).
import type { ClientFormatModule } from "./types";

import { meta as csv12Meta } from "./csv/twelve-column/meta";
import { csv12Schema } from "./csv/twelve-column/schema";
import { fields as csv12Fields } from "./csv/twelve-column/fields";
import { renderCsv12 } from "./csv/twelve-column/render";

import { meta as csv22Meta } from "./csv/twenty-two-column/meta";
import { csv22Schema } from "./csv/twenty-two-column/schema";
import { fields as csv22Fields } from "./csv/twenty-two-column/fields";
import { renderCsv22 } from "./csv/twenty-two-column/render";

import { meta as csv24Meta } from "./csv/twenty-four-column/meta";
import { csv24Schema } from "./csv/twenty-four-column/schema";
import { fields as csv24Fields } from "./csv/twenty-four-column/fields";
import { renderCsv24 } from "./csv/twenty-four-column/render";

import { meta as edi810Meta } from "./edi/edi_810/meta";
import { edi810Schema } from "./edi/edi_810/schema";
import { fields as edi810Fields } from "./edi/edi_810/fields";
import { renderEdi810 } from "./edi/edi_810/render";

import { meta as encompassMeta } from "./edi/encompass_edi_810/meta";
import { encompassSchema } from "./edi/encompass_edi_810/schema";
import { fields as encompassFields } from "./edi/encompass_edi_810/fields";
import { renderEncompass } from "./edi/encompass_edi_810/render";

import { meta as usFoodsMeta } from "./edi/us_foods/meta";
import { usFoodsSchema } from "./edi/us_foods/schema";
import { fields as usFoodsFields } from "./edi/us_foods/fields";
import { renderUsFoods } from "./edi/us_foods/render";

import { meta as zeroSacMeta } from "./edi/zero_sac/meta";
import { zeroSacSchema } from "./edi/zero_sac/schema";
import { fields as zeroSacFields } from "./edi/zero_sac/fields";
import { renderZeroSac } from "./edi/zero_sac/render";

import { meta as qbInboundMeta } from "./quickbooks/quickbooks_inbound/meta";
import { qbInboundSchema } from "./quickbooks/quickbooks_inbound/schema";
import { fields as qbInboundFields } from "./quickbooks/quickbooks_inbound/fields";
import { renderQbInbound } from "./quickbooks/quickbooks_inbound/render";

import { meta as qbOnlineMeta } from "./quickbooks/quickbooks_online_adjustments/meta";
import { qbOnlineSchema } from "./quickbooks/quickbooks_online_adjustments/schema";
import { fields as qbOnlineFields } from "./quickbooks/quickbooks_online_adjustments/fields";
import { renderQbOnline } from "./quickbooks/quickbooks_online_adjustments/render";

// Each variant's render() has a concrete (non-unknown) parameter type, so assigning it
// into this heterogeneous array requires erasing to the common ClientFormatModule
// shape — safe here because lookups always pair a module with its own data.
export const clientRegistry: ClientFormatModule[] = [
  { ...csv12Meta, schema: csv12Schema, fields: csv12Fields, render: renderCsv12 } as ClientFormatModule,
  { ...csv22Meta, schema: csv22Schema, fields: csv22Fields, render: renderCsv22 } as ClientFormatModule,
  { ...csv24Meta, schema: csv24Schema, fields: csv24Fields, render: renderCsv24 } as ClientFormatModule,
  { ...edi810Meta, schema: edi810Schema, fields: edi810Fields, render: renderEdi810 } as ClientFormatModule,
  { ...encompassMeta, schema: encompassSchema, fields: encompassFields, render: renderEncompass } as ClientFormatModule,
  { ...usFoodsMeta, schema: usFoodsSchema, fields: usFoodsFields, render: renderUsFoods } as ClientFormatModule,
  { ...zeroSacMeta, schema: zeroSacSchema, fields: zeroSacFields, render: renderZeroSac } as ClientFormatModule,
  { ...qbInboundMeta, schema: qbInboundSchema, fields: qbInboundFields, render: renderQbInbound } as ClientFormatModule,
  { ...qbOnlineMeta, schema: qbOnlineSchema, fields: qbOnlineFields, render: renderQbOnline } as ClientFormatModule,
];

export function getClientModule(formatType: string, variantId: string): ClientFormatModule | undefined {
  return clientRegistry.find((m) => m.formatType === formatType && m.id === variantId);
}

export function groupedClientRegistry(): { formatType: string; modules: ClientFormatModule[] }[] {
  const types = Array.from(new Set(clientRegistry.map((m) => m.formatType)));
  return types.map((formatType) => ({
    formatType,
    modules: clientRegistry.filter((m) => m.formatType === formatType),
  }));
}
