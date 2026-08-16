import type { FieldMeta } from "../../types";
import { fields as edi810Fields } from "../edi_810/fields";

export const fields: FieldMeta[] = edi810Fields.map((f) =>
  f.key === "lineItems[].quantity"
    ? { ...f, notes: "0 is a valid test value: downstream should load it as quantity 1 / price 0.00. Negative = standard credit/return indicator." }
    : f
);
