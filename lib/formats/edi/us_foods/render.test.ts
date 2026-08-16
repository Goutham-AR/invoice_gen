import { describe, expect, it } from "vitest";
import { renderUsFoods } from "./render";
import type { UsFoodsInvoice } from "./schema";

function findSegment(output: string, tag: string): string[] {
  const line = output.split("\n").find((l) => l.startsWith(`${tag}*`) || l === `${tag}~`);
  if (!line) throw new Error(`Segment ${tag} not found in output`);
  return line.replace(/~$/, "").split("*");
}

describe("renderUsFoods", () => {
  it("writes BIG07 as the credit/debit indicator", () => {
    const invoice: UsFoodsInvoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      creditDebitIndicator: "CR",
      shipTo: { name: "Acme", vendorStoreId: "S1" },
      lineItems: [{ quantity: 1, uom: "CA", unitPrice: 1, itemNumber: "P1", description: "D1" }],
    };

    const parts = findSegment(renderUsFoods([invoice]), "BIG");
    expect(parts[7]).toBe("CR"); // parts[0]="BIG", parts[k] = position k
  });

  it("places brand label at IT1 position 22/23 and preserves LB unit of measure", () => {
    const invoice: UsFoodsInvoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      shipTo: { name: "Acme", vendorStoreId: "S1" },
      lineItems: [
        {
          quantity: 38.63,
          uom: "LB",
          unitPrice: 2.31,
          itemNumber: "P1",
          description: "D1",
          brandLabel: "ACCLAIM",
        },
      ],
    };

    const parts = findSegment(renderUsFoods([invoice]), "IT1");
    expect(parts[2]).toBe("38.63"); // position2 quantity
    expect(parts[3]).toBe("LB"); // position3 uom, not converted to EA
    expect(parts[4]).toBe("2.31"); // position4 unit price
    expect(parts[10]).toBe("UK"); // position10 item number qualifier
    expect(parts[11]).toBe("P1"); // position11 item number
    expect(parts[22]).toBe("BL"); // position22 brand qualifier
    expect(parts[23]).toBe("ACCLAIM"); // position23 brand label
  });

  it("maps line-item tax to a TXI segment and includes it in the invoice total", () => {
    const invoice: UsFoodsInvoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      shipTo: { name: "Acme", vendorStoreId: "S1" },
      lineItems: [
        {
          quantity: 1,
          uom: "EA",
          unitPrice: 10,
          itemNumber: "P1",
          description: "D1",
          lineTax: { amount: 1.9 },
        },
      ],
    };

    const output = renderUsFoods([invoice]);
    expect(output).toContain("TXI*H850*1.9~");
    expect(output).toContain("TDS*1190~"); // (10 + 1.9) * 100
  });

  it("writes a summary-level TXI segment when summaryTax is provided", () => {
    const invoice: UsFoodsInvoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      shipTo: { name: "Acme", vendorStoreId: "S1" },
      lineItems: [{ quantity: 1, uom: "EA", unitPrice: 10, itemNumber: "P1", description: "D1" }],
      summaryTax: { type: "LS", amount: 5, percent: 8.25 },
    };

    const parts = findSegment(renderUsFoods([invoice]), "TXI");
    expect(parts[1]).toBe("LS");
    expect(parts[2]).toBe("5");
    expect(parts[3]).toBe("8.25");
  });
});
