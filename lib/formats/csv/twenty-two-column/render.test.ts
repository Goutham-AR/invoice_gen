import { describe, expect, it } from "vitest";
import { renderCsv22 } from "./render";
import type { Csv22Invoice } from "./schema";

const COLUMNS = [
  "Division_id",
  "Invoice_number",
  "Invoice_date",
  "Vendor_store_id",
  "Invoice_due_date",
  "Po_number",
  "po_date",
  "ref_invoice_number",
  "quantity_shipped",
  "Quantity_uom",
  "Item_number",
  "upc_pack",
  "upc_case",
  "gtin_id",
  "product_description",
  "unit_price",
  "promotional_discount",
  "State_tax",
  "deposit_amount",
  "miscellaneous_charge",
  "extended_price",
  "packs_per_case",
];

function col(row: string, name: string): string {
  return row.split(",")[COLUMNS.indexOf(name)];
}

describe("renderCsv22", () => {
  it("computes extended_price as quantity * unit price when omitted", () => {
    const invoice: Csv22Invoice = {
      divisionId: "1",
      invoiceNumber: "I1",
      invoiceDate: "01/01/2026",
      vendorStoreId: "V1",
      lineItems: [
        { quantityShipped: 3, uom: "CA", itemNumber: "IT1", description: "D1", unitPrice: 10 },
      ],
    };

    const [, row] = renderCsv22([invoice]).split("\n");
    expect(col(row, "extended_price")).toBe("30");
  });

  it("honors an explicit extended_price override instead of computing it", () => {
    const invoice: Csv22Invoice = {
      divisionId: "1",
      invoiceNumber: "I1",
      invoiceDate: "01/01/2026",
      vendorStoreId: "V1",
      lineItems: [
        {
          quantityShipped: 2,
          uom: "EA",
          itemNumber: "IT2",
          description: "D2",
          unitPrice: 5,
          extendedPrice: 100,
        },
      ],
    };

    const [, row] = renderCsv22([invoice]).split("\n");
    expect(col(row, "extended_price")).toBe("100");
  });

  it("leaves optional charge columns blank when not provided", () => {
    const invoice: Csv22Invoice = {
      divisionId: "1",
      invoiceNumber: "I1",
      invoiceDate: "01/01/2026",
      vendorStoreId: "V1",
      lineItems: [
        { quantityShipped: 1, uom: "EA", itemNumber: "IT1", description: "D1", unitPrice: 1 },
      ],
    };

    const [, row] = renderCsv22([invoice]).split("\n");
    expect(col(row, "promotional_discount")).toBe("");
    expect(col(row, "State_tax")).toBe("");
    expect(col(row, "deposit_amount")).toBe("");
  });
});
