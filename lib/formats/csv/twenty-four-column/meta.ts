import type { FormatMeta } from "../../types";

export const meta: FormatMeta = {
  id: "twenty_four_column",
  formatType: "csv",
  label: "24-Column CSV",
  description:
    "Full comma-delimited invoice file: adds per-line county/city tax on top of the 22-column set.",
  fileExtension: ".csv",
};
