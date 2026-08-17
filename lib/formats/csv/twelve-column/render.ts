import { renderCsv, type CsvColumn } from "../shared";
import type { Csv12Invoice, Csv12LineItem } from "./schema";

const columns: CsvColumn<Csv12Invoice, Csv12LineItem>[] = [
  { header: "Division_id", get: (inv) => inv.divisionId },
  { header: "invoice_number", get: (inv) => inv.invoiceNumber },
  { header: "invoice_date", get: (inv) => inv.invoiceDate },
  { header: "Vendor_store_id", get: (inv) => inv.vendorStoreId },
  { header: "invoice_due_date", get: (inv) => inv.invoiceDueDate ?? inv.invoiceDate },
  { header: "Po_number", get: (inv) => inv.poNumber },
  { header: "po_date", get: (inv) => inv.poDate },
  { header: "quantity_shipped", get: (_inv, li) => li.quantityShipped },
  { header: "Quantity_uom", get: (_inv, li) => li.uom },
  { header: "item_number", get: (_inv, li) => li.itemNumber },
  { header: "product_description", get: (_inv, li) => li.description },
  { header: "unit_price", get: (_inv, li) => li.unitPrice },
];

export function renderCsv12(invoices: Csv12Invoice[]): string {
  return renderCsv(columns, invoices, (inv) => inv.lineItems);
}
