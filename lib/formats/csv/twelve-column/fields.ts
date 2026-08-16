import type { FieldMeta } from "../../types";

export const fields: FieldMeta[] = [
  { key: "divisionId", label: "Division_id", dataType: "Numeric", mandatory: true, scope: "header", example: "1000", notes: "Vendor FTS id" },
  { key: "invoiceNumber", label: "invoice_number", dataType: "Alphanumeric (22 max)", mandatory: true, scope: "header", example: "212121AN" },
  { key: "invoiceDate", label: "invoice_date", dataType: "M/DD/YYYY", mandatory: true, scope: "header", example: "03/15/2005" },
  { key: "vendorStoreId", label: "Vendor_store_id", dataType: "Alphanumeric (80 max)", mandatory: true, scope: "header", example: "BCD111", notes: "Retailer customer id" },
  { key: "invoiceDueDate", label: "invoice_due_date", dataType: "M/DD/YYYY", mandatory: false, scope: "header", example: "03/15/2005", notes: "Pulled from invoice_date if omitted" },
  { key: "poNumber", label: "Po_number", dataType: "Alphanumeric (22 max)", mandatory: false, scope: "header", example: "212144AN" },
  { key: "poDate", label: "po_date", dataType: "M/DD/YYYY", mandatory: false, scope: "header", example: "03/15/2005" },
  { key: "lineItems[].quantityShipped", label: "quantity_shipped", dataType: "Numeric, up to 2 decimals", mandatory: true, scope: "lineItem", example: "25.00", notes: "Negative = credit/return (standard indicator)" },
  { key: "lineItems[].uom", label: "Quantity_uom", dataType: "BO, EA, CA, KE, DS", mandatory: true, scope: "lineItem" },
  { key: "lineItems[].itemNumber", label: "item_number", dataType: "Alphanumeric (20 max)", mandatory: true, scope: "lineItem", example: "12912901BUD" },
  { key: "lineItems[].description", label: "product_description", dataType: "Alphanumeric (80 max)", mandatory: true, scope: "lineItem" },
  { key: "lineItems[].unitPrice", label: "unit_price", dataType: "Numeric, up to 4 decimals", mandatory: true, scope: "lineItem", example: "2.7300", notes: "Negative = nonstandard credit/return indicator" },
];
