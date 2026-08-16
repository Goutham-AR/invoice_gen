import type { FieldMeta } from "../../types";

export const fields: FieldMeta[] = [
  { key: "transactionType", label: "Transaction Type", dataType: "Invoice or Credit Memo", mandatory: true, scope: "header" },
  { key: "date", label: "Date", dataType: "M/DD/YYYY", mandatory: true, scope: "header" },
  { key: "num", label: "Num", dataType: "Alphanumeric", mandatory: true, scope: "header", notes: "Invoice number" },
  { key: "name", label: "Name", dataType: "Alphanumeric", mandatory: true, scope: "header", notes: "Serves as both customer name and customer number" },
  { key: "poNumber", label: "P. O. #", dataType: "Alphanumeric", mandatory: false, scope: "header" },
  { key: "dueDate", label: "Due Date", dataType: "M/DD/YYYY", mandatory: false, scope: "header", notes: "Pulled from Date if omitted" },
  { key: "rows[].description", label: "Memo/Description", dataType: "Alphanumeric", mandatory: true, scope: "lineItem", notes: "Serves as both vendor product number and product description" },
  { key: "rows[].qty", label: "Qty", dataType: "Numeric", mandatory: true, scope: "lineItem", notes: "Raw ledger row quantity; may repeat with inverted sign for netting scenarios" },
  { key: "rows[].rate", label: "Rate", dataType: "Numeric", mandatory: true, scope: "lineItem" },
  { key: "rows[].upcCode", label: "UPC CODE", dataType: "String", mandatory: false, scope: "lineItem" },
];
