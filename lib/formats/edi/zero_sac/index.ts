import fs from "node:fs";
import path from "node:path";
import type { FormatModule } from "../../types";
import { meta } from "./meta";
import { zeroSacSchema, type ZeroSacInvoice } from "./schema";
import { fields } from "./fields";
import { renderZeroSac } from "./render";

export const zeroSacModule: FormatModule<ZeroSacInvoice> = {
  ...meta,
  schema: zeroSacSchema,
  fields,
  render: renderZeroSac,
  promptGuidance: fs.readFileSync(path.join(process.cwd(), "lib/formats/edi/zero_sac/rules.md"), "utf-8"),
  sample: fs.readFileSync(path.join(process.cwd(), "lib/formats/edi/zero_sac/sample.txt"), "utf-8"),
  guide: fs.readFileSync(path.join(process.cwd(), "lib/formats/edi/zero_sac/guide.md"), "utf-8"),
};
