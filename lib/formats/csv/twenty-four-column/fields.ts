import type { FieldMeta } from "../../types";
import { fields as csv22Fields } from "../twenty-two-column/fields";

export const fields: FieldMeta[] = [
  ...csv22Fields,
  { key: "lineItems[].countyTax", label: "County_tax", dataType: "Numeric, up to 4 decimals", mandatory: false, scope: "charge", notes: "SAC H730" },
  { key: "lineItems[].cityTax", label: "City_tax", dataType: "Numeric, up to 4 decimals", mandatory: false, scope: "charge", notes: "SAC H630" },
];
