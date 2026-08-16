import fs from "node:fs";
import path from "node:path";
import type { FormatModule } from "../../types";
import { meta } from "./meta";
import { qbOnlineSchema, qbOnlineInvoiceSchema, type QbOnlineInvoice } from "./schema";
import { fields } from "./fields";
import { renderQbOnline } from "./render";

export const qbOnlineModule: FormatModule<QbOnlineInvoice> = {
  ...meta,
  schema: qbOnlineSchema,
  itemSchema: qbOnlineInvoiceSchema,
  fields,
  render: renderQbOnline,
  promptGuidance: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/quickbooks/quickbooks_online_adjustments/rules.md"),
    "utf-8"
  ),
  sample: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/quickbooks/quickbooks_online_adjustments/sample.txt"),
    "utf-8"
  ),
  guide: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/quickbooks/quickbooks_online_adjustments/guide.md"),
    "utf-8"
  ),
};
