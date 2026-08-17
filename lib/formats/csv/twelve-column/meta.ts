import type { FormatMeta } from "../../types";

export const meta: FormatMeta = {
  id: "twelve_column",
  formatType: "csv",
  label: "12-Column CSV",
  description: "Minimal comma-delimited invoice file: header + core line-item fields only.",
  fileExtension: ".csv",
};
