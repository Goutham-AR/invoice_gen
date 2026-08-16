import fs from "node:fs";
import path from "node:path";
import type { FormatModule } from "../../types";
import { meta } from "./meta";
import { csv22Schema, csv22InvoiceSchema, type Csv22Invoice } from "./schema";
import { fields } from "./fields";
import { renderCsv22 } from "./render";

export const csv22Module: FormatModule<Csv22Invoice> = {
  ...meta,
  schema: csv22Schema,
  itemSchema: csv22InvoiceSchema,
  fields,
  render: renderCsv22,
  promptGuidance: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/csv/twenty-two-column/rules.md"),
    "utf-8"
  ),
  sample: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/csv/twenty-two-column/sample.csv"),
    "utf-8"
  ),
  guide: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/csv/twenty-two-column/guide.md"),
    "utf-8"
  ),
};
