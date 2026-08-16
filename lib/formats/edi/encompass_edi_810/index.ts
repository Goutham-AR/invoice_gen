import fs from "node:fs";
import path from "node:path";
import type { FormatModule } from "../../types";
import { meta } from "./meta";
import { encompassSchema, type EncompassInvoice } from "./schema";
import { fields } from "./fields";
import { renderEncompass } from "./render";

export const encompassModule: FormatModule<EncompassInvoice> = {
  ...meta,
  schema: encompassSchema,
  fields,
  render: renderEncompass,
  promptGuidance: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/edi/encompass_edi_810/rules.md"),
    "utf-8"
  ),
  sample: fs.readFileSync(
    path.join(process.cwd(), "lib/formats/edi/encompass_edi_810/sample.txt"),
    "utf-8"
  ),
};
