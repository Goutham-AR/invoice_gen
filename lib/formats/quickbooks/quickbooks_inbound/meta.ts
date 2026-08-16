import type { FormatMeta } from "../../types";

export const meta: FormatMeta = {
  id: "quickbooks_inbound",
  formatType: "quickbooks",
  label: "QuickBooks Inbound",
  description:
    "Tab-delimited AR-ledger export. Line items are raw ledger rows (possibly duplicated/reversed) that net to zero on ingestion.",
  fileExtension: ".txt",
};
