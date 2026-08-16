import type { FormatMeta } from "../../types";

export const meta: FormatMeta = {
  id: "encompass_edi_810",
  formatType: "edi",
  label: "EDI 810 (Encompass)",
  description:
    "Encompass accounting system variant of the X12 810: quantity/price written to 3 decimal places, plus a PO4 line-item cost reconciliation value.",
  fileExtension: ".txt",
};
