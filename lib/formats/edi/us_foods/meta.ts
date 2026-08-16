import type { FormatMeta } from "../../types";

export const meta: FormatMeta = {
  id: "us_foods",
  formatType: "edi",
  label: "EDI 810 (US Foods)",
  description:
    "US Foods variant of the X12 810: BIG07 credit/debit indicator, TXI tax segments, LB unit of measure, and an expanded SAC code set.",
  fileExtension: ".txt",
};
