import { describe, expect, it } from "vitest";
import { renderQbOnline } from "./render";
import type { QbOnlineInvoice } from "./schema";

describe("renderQbOnline", () => {
  it("writes header and row columns in the documented order", () => {
    const invoice: QbOnlineInvoice = {
      transactionType: "Invoice",
      date: "10/17/2025",
      num: "INV_1710_Q1",
      name: "1234567",
      dueDate: "11/22/2025",
      rows: [{ description: "QProd-0001", qty: -1.45, rate: 75 }],
    };

    const lines = renderQbOnline([invoice]).split("\n");
    expect(lines[0]).toBe(
      "Transaction Type\tDate\tNum\tName\tMemo/Description\tQty\tRate\tDue Date\tP. O. #\tUPC CODE"
    );
    expect(lines[1]).toBe("Invoice\t10/17/2025\tINV_1710_Q1\t1234567\t\t\t\t11/22/2025\t\t");
    expect(lines[2]).toBe("\t\t\t\tQProd-0001\t-1.45\t75\t\t\t");
  });

  it("keeps raw duplicate rows for a netting scenario unmerged", () => {
    const invoice: QbOnlineInvoice = {
      transactionType: "Invoice",
      date: "10/17/2025",
      num: "INV_1710_Q1",
      name: "1234567",
      rows: [
        { description: "Old Fashioned - 375ml", qty: -48.345, rate: 15 },
        { description: "Old Fashioned - 750ml", qty: -12.234, rate: 30 },
      ],
    };

    const lines = renderQbOnline([invoice]).split("\n");
    expect(lines).toHaveLength(4); // header + invoice header row + 2 raw rows
  });
});
