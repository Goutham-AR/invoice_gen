import fs from "node:fs";
import path from "node:path";
import type { FormatModule } from "../../types";
import { meta } from "./meta";
import { csv12Schema, csv12InvoiceSchema, type Csv12Invoice } from "./schema";
import { fields } from "./fields";
import { renderCsv12 } from "./render";

export const csv12Module: FormatModule<Csv12Invoice> = {
  ...meta,
  schema: csv12Schema,
  itemSchema: csv12InvoiceSchema,
  fields,
  render: renderCsv12,
  promptGuidance: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/csv/twelve-column/rules.md"),
    "utf-8"
  ),
  sample: fs.readFileSync(path.join(process.cwd(), "lib/formats/csv/twelve-column/sample.csv"), "utf-8"),
  guide: fs.readFileSync(path.join(process.cwd(), "lib/formats/csv/twelve-column/guide.md"), "utf-8"),
};
