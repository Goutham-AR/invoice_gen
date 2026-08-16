import fs from "node:fs";
import path from "node:path";
import type { FormatModule } from "../../types";
import { meta } from "./meta";
import { qbInboundSchema, qbInboundInvoiceSchema, type QbInboundInvoice } from "./schema";
import { fields } from "./fields";
import { renderQbInbound } from "./render";

export const qbInboundModule: FormatModule<QbInboundInvoice> = {
  ...meta,
  schema: qbInboundSchema,
  itemSchema: qbInboundInvoiceSchema,
  fields,
  render: renderQbInbound,
  promptGuidance: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/quickbooks/quickbooks_inbound/rules.md"),
    "utf-8"
  ),
  sample: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/quickbooks/quickbooks_inbound/sample.txt"),
    "utf-8"
  ),
  guide: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/quickbooks/quickbooks_inbound/guide.md"),
    "utf-8"
  ),
};
