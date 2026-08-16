import fs from "node:fs";
import path from "node:path";
import type { FormatModule } from "../../types";
import { meta } from "./meta";
import { usFoodsSchema, type UsFoodsInvoice } from "./schema";
import { fields } from "./fields";
import { renderUsFoods } from "./render";

export const usFoodsModule: FormatModule<UsFoodsInvoice> = {
  ...meta,
  schema: usFoodsSchema,
  fields,
  render: renderUsFoods,
  promptGuidance: fs.readFileSync(path.join(process.cwd(), "lib/formats/edi/us_foods/rules.md"), "utf-8"),
  sample: fs.readFileSync(path.join(process.cwd(), "lib/formats/edi/us_foods/sample.txt"), "utf-8"),
};
