import fs from "node:fs";
import path from "node:path";
import type { FormatModule } from "../../types";
import { meta } from "./meta";
import { csv24Schema, type Csv24Invoice } from "./schema";
import { fields } from "./fields";
import { renderCsv24 } from "./render";

export const csv24Module: FormatModule<Csv24Invoice> = {
  ...meta,
  schema: csv24Schema,
  fields,
  render: renderCsv24,
  promptGuidance: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/csv/twenty-four-column/rules.md"),
    "utf-8"
  ),
  sample: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/csv/twenty-four-column/sample.csv"),
    "utf-8"
  ),
  guide: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/csv/twenty-four-column/guide.md"),
    "utf-8"
  ),
};
