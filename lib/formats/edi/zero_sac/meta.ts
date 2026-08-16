import type { FormatMeta } from "../../types";

export const meta: FormatMeta = {
  id: "zero_sac",
  formatType: "edi",
  label: "EDI 810 (Zero SAC Inbound)",
  description:
    "Standard X12 810 exercising the zero-quantity line-item rule: a zero IT102 quantity should be loaded downstream as quantity 1 / price 0.00.",
  fileExtension: ".txt",
};
