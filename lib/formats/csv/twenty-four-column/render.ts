import { renderTabDelimited, type CsvColumn } from "../shared";
import type { Csv24Invoice, Csv24LineItem } from "./schema";

function extendedPrice(li: Csv24LineItem): number {
  return li.extendedPrice ?? li.quantityShipped * li.unitPrice;
}

const columns: CsvColumn<Csv24Invoice, Csv24LineItem>[] = [
  { header: "Division_id", get: (inv) => inv.divisionId },
  { header: "Invoice_number", get: (inv) => inv.invoiceNumber },
  { header: "Invoice_date", get: (inv) => inv.invoiceDate },
  { header: "Vendor_store_id", get: (inv) => inv.vendorStoreId },
  { header: "Invoice_due_date", get: (inv) => inv.invoiceDueDate ?? inv.invoiceDate },
  { header: "Po_number", get: (inv) => inv.poNumber },
  { header: "po_date", get: (inv) => inv.poDate },
  { header: "ref_invoice_number", get: (inv) => inv.refInvoiceNumber },
  { header: "quantity_shipped", get: (_inv, li) => li.quantityShipped },
  { header: "Quantity_uom", get: (_inv, li) => li.uom },
  { header: "Item_number", get: (_inv, li) => li.itemNumber },
  { header: "upc_pack", get: (_inv, li) => li.upcPack },
  { header: "upc_case", get: (_inv, li) => li.upcCase },
  { header: "gtin_id", get: (_inv, li) => li.gtinId },
  { header: "product_description", get: (_inv, li) => li.description },
  { header: "unit_price", get: (_inv, li) => li.unitPrice },
  { header: "promotional_discount", get: (_inv, li) => li.promotionalDiscount },
  { header: "State_tax", get: (_inv, li) => li.stateTax },
  { header: "deposit_amount", get: (_inv, li) => li.depositAmount },
  { header: "miscellaneous_charge", get: (_inv, li) => li.miscellaneousCharge },
  { header: "extended_price", get: (_inv, li) => extendedPrice(li) },
  { header: "packs_per_case", get: (_inv, li) => li.packsPerCase },
  { header: "County_tax", get: (_inv, li) => li.countyTax },
  { header: "City_tax", get: (_inv, li) => li.cityTax },
];

export function renderCsv24(invoices: Csv24Invoice[]): string {
  return renderTabDelimited(columns, invoices, (inv) => inv.lineItems);
}
