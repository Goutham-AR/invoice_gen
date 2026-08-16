import type { FieldMeta } from "../../types";
import { fields as edi810Fields } from "../edi_810/fields";

export const fields: FieldMeta[] = [
  ...edi810Fields.map((f) =>
    f.key === "lineItems[].quantity" || f.key === "lineItems[].unitPrice"
      ? { ...f, notes: `${f.notes ?? ""} Written with 3 zero-padded decimals (e.g. "6.000" = 6).`.trim() }
      : f
  ),
  {
    key: "lineItems[].lineItemCost",
    label: "PO402 Line-Item Cost",
    dataType: "Double",
    mandatory: false,
    scope: "lineItem",
    notes: "Encompass's own extended-cost total for the line, used for reconciliation",
  },
];
