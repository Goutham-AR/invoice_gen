import fs from "node:fs";
import path from "node:path";
import type { FormatModule } from "../../types";
import { meta } from "./meta";
import { edi810Schema, edi810InvoiceSchema, type Edi810Invoice } from "./schema";
import { fields } from "./fields";
import { renderEdi810 } from "./render";

export const edi810Module: FormatModule<Edi810Invoice> = {
  ...meta,
  schema: edi810Schema,
  itemSchema: edi810InvoiceSchema,
  fields,
  render: renderEdi810,
  promptGuidance: fs.readFileSync(path.join(process.cwd(), "lib/formats/edi/edi_810/rules.md"), "utf-8"),
  sample: fs.readFileSync(path.join(process.cwd(), "lib/formats/edi/edi_810/sample.txt"), "utf-8"),
  guide: fs.readFileSync(path.join(process.cwd(), "lib/formats/edi/edi_810/guide.md"), "utf-8"),
};
