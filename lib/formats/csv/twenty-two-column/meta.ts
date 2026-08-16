import type { FormatMeta } from "../../types";

export const meta: FormatMeta = {
  id: "twenty_two_column",
  formatType: "csv",
  label: "22-Column CSV",
  description:
    "Tab-delimited invoice file with UPC/GTIN identifiers and per-line SAC-style charges (promo discount, state tax, deposit, misc.).",
  fileExtension: ".csv",
};
