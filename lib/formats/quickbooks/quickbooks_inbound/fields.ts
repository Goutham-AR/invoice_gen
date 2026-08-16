import type { FieldMeta } from "../../types";

export const fields: FieldMeta[] = [
  { key: "transactionType", label: "Type", dataType: "Invoice or Credit Memo", mandatory: true, scope: "header" },
  { key: "date", label: "Date", dataType: "M/DD/YYYY", mandatory: true, scope: "header", example: "3/15/2005" },
  { key: "num", label: "Num", dataType: "Alphanumeric", mandatory: true, scope: "header", example: "2124", notes: "Invoice number" },
  { key: "sourceName", label: "Source Name", dataType: "Alphanumeric", mandatory: true, scope: "header", example: "Fogo de Chao - Brea CA", notes: "Serves as both customer name and customer number" },
  { key: "poNumber", label: "P. O. #", dataType: "Alphanumeric", mandatory: false, scope: "header" },
  { key: "dueDate", label: "Due Date", dataType: "M/DD/YYYY", mandatory: false, scope: "header" },
  { key: "rows[].item", label: "Item", dataType: "Alphanumeric", mandatory: false, scope: "lineItem", notes: "Vendor product number; sourced from Item Description if blank" },
  { key: "rows[].itemDescription", label: "Item Description", dataType: "Alphanumeric", mandatory: false, scope: "lineItem", notes: "Sourced from Item if blank" },
  { key: "rows[].qty", label: "Qty", dataType: "Numeric", mandatory: true, scope: "lineItem", notes: "Raw ledger row quantity; may repeat with inverted sign for netting scenarios" },
  { key: "rows[].salesPrice", label: "Sales Price", dataType: "Numeric", mandatory: true, scope: "lineItem" },
  { key: "rows[].upcCode", label: "UPC CODE", dataType: "String", mandatory: false, scope: "lineItem" },
];
