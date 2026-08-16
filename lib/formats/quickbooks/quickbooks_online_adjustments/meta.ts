import type { FormatMeta } from "../../types";

export const meta: FormatMeta = {
  id: "quickbooks_online_adjustments",
  formatType: "quickbooks",
  label: "QuickBooks Online Adjustments",
  description:
    "Tab-delimited AR-ledger export (QuickBooks Online). Same raw-row/netting shape as QuickBooks Inbound, with Name/Memo-Description/Rate columns.",
  fileExtension: ".txt",
};
