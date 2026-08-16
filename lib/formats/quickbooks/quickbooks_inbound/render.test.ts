import { describe, expect, it } from "vitest";
import { renderQbInbound } from "./render";
import type { QbInboundInvoice } from "./schema";

describe("renderQbInbound", () => {
  it("writes a header row with invoice fields and separate raw ledger rows per item", () => {
    const invoice: QbInboundInvoice = {
      transactionType: "Invoice",
      date: "06/10/2025",
      num: "SP-QBI-56",
      sourceName: "mandi15",
      dueDate: "08/30/2025",
      rows: [{ item: "QB-vdk3", itemDescription: "vdk-desc1", qty: 1, salesPrice: 170.5 }],
    };

    const lines = renderQbInbound([invoice]).split("\n");
    expect(lines[0]).toBe(
      "Trans #\tType\tDate\tNum\tSource Name\tItem\tItem Description\tQty\tSales Price\tDue Date\tP. O. #\tUPC CODE"
    );
    expect(lines[1]).toBe("\tInvoice\t06/10/2025\tSP-QBI-56\tmandi15\t\t\t\t\t08/30/2025\t\t");
    expect(lines[2]).toBe("\t\t\t\t\tQB-vdk3\tvdk-desc1\t1\t170.5\t\t\t");
  });

  it("writes raw duplicate/triplicate reversal rows as-is, without netting them", () => {
    const invoice: QbInboundInvoice = {
      transactionType: "Invoice",
      date: "06/10/2025",
      num: "SP-QBI-57",
      sourceName: "mandi15",
      rows: [
        { item: "QB-whiskey2", itemDescription: "whiskey-desc", qty: -1, salesPrice: 96 },
        { item: "QB-whiskey2", itemDescription: "whiskey-desc", qty: -1, salesPrice: 48 },
        { item: "QB-whiskey2", itemDescription: "whiskey-desc", qty: 1, salesPrice: 48 },
      ],
    };

    const lines = renderQbInbound([invoice]).split("\n");
    // header + 1 invoice header row + 3 raw rows, none merged
    expect(lines).toHaveLength(5);
  });

  it("separates invoice record sets with exactly 2 blank lines", () => {
    const invoice = (num: string): QbInboundInvoice => ({
      transactionType: "Invoice",
      date: "06/10/2025",
      num,
      sourceName: "mandi15",
      rows: [{ item: "I1", itemDescription: "D1", qty: 1, salesPrice: 1 }],
    });

    const lines = renderQbInbound([invoice("A"), invoice("B")]).split("\n");
    // header(0), invA header(1), invA row(2), blank(3), blank(4), invB header(5), invB row(6)
    expect(lines[3]).toBe("");
    expect(lines[4]).toBe("");
    expect(lines[5]).toContain("\tB\t");
  });
});
