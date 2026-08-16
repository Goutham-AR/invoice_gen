import { describe, expect, it } from "vitest";
import { renderCsv12 } from "./render";
import type { Csv12Invoice } from "./schema";

describe("renderCsv12", () => {
  it("renders a header row and one row per line item, defaulting due date to invoice date", () => {
    const invoice: Csv12Invoice = {
      divisionId: "7385",
      invoiceNumber: "INV1",
      invoiceDate: "02/04/2026",
      vendorStoreId: "1234567",
      poNumber: "PO-1",
      lineItems: [
        { quantityShipped: 2, uom: "CA", itemNumber: "ITEM1", description: "Widget", unitPrice: 20 },
      ],
    };

    const output = renderCsv12([invoice]);
    const [header, row] = output.split("\n");

    expect(header).toBe(
      "Division_id\tinvoice_number\tinvoice_date\tVendor_store_id\tinvoice_due_date\tPo_number\tpo_date\tquantity_shipped\tQuantity_uom\titem_number\tproduct_description\tunit_price"
    );
    expect(row).toBe("7385\tINV1\t02/04/2026\t1234567\t02/04/2026\tPO-1\t\t2\tCA\tITEM1\tWidget\t20");
  });

  it("passes through negative quantity/price as credit-return indicators unchanged", () => {
    const invoice: Csv12Invoice = {
      divisionId: "1",
      invoiceNumber: "INV2",
      invoiceDate: "01/01/2026",
      vendorStoreId: "V1",
      lineItems: [
        { quantityShipped: -3, uom: "EA", itemNumber: "ITEM2", description: "Return", unitPrice: 10 },
      ],
    };

    const [, row] = renderCsv12([invoice]).split("\n");
    const cols = row.split("\t");
    expect(cols[7]).toBe("-3");
  });

  it("emits one row per invoice per line item across multiple invoices", () => {
    const invoices: Csv12Invoice[] = [
      {
        divisionId: "1",
        invoiceNumber: "A",
        invoiceDate: "01/01/2026",
        vendorStoreId: "V1",
        lineItems: [
          { quantityShipped: 1, uom: "EA", itemNumber: "I1", description: "D1", unitPrice: 1 },
          { quantityShipped: 2, uom: "EA", itemNumber: "I2", description: "D2", unitPrice: 2 },
        ],
      },
      {
        divisionId: "2",
        invoiceNumber: "B",
        invoiceDate: "01/02/2026",
        vendorStoreId: "V2",
        lineItems: [{ quantityShipped: 1, uom: "EA", itemNumber: "I3", description: "D3", unitPrice: 3 }],
      },
    ];

    const lines = renderCsv12(invoices).split("\n");
    expect(lines).toHaveLength(4); // header + 3 line-item rows
  });
});
