import { describe, expect, it } from "vitest";
import { renderCsv24 } from "./render";
import type { Csv24Invoice } from "./schema";

describe("renderCsv24", () => {
  it("includes County_tax and City_tax as the final two columns", () => {
    const invoice: Csv24Invoice = {
      divisionId: "1",
      invoiceNumber: "I1",
      invoiceDate: "01/01/2026",
      vendorStoreId: "V1",
      lineItems: [
        {
          quantityShipped: 3,
          uom: "CA",
          itemNumber: "IT1",
          description: "D1",
          unitPrice: 40,
          depositAmount: 2,
          miscellaneousCharge: 1,
          countyTax: 2,
          cityTax: 2,
        },
      ],
    };

    const [header, row] = renderCsv24([invoice]).split("\n");
    const headerCols = header.split(",");
    expect(headerCols[headerCols.length - 2]).toBe("County_tax");
    expect(headerCols[headerCols.length - 1]).toBe("City_tax");

    const rowCols = row.split(",");
    expect(rowCols[rowCols.length - 2]).toBe("2");
    expect(rowCols[rowCols.length - 1]).toBe("2");

    const extendedIdx = headerCols.indexOf("extended_price");
    expect(rowCols[extendedIdx]).toBe("120"); // 3 * 40; charge columns don't feed into extended_price
  });

  it("computes extended_price from quantity * unit price only (charges are separate columns)", () => {
    const invoice: Csv24Invoice = {
      divisionId: "1",
      invoiceNumber: "I1",
      invoiceDate: "01/01/2026",
      vendorStoreId: "V1",
      lineItems: [
        { quantityShipped: 3, uom: "CA", itemNumber: "IT1", description: "D1", unitPrice: 40 },
      ],
    };

    const [header, row] = renderCsv24([invoice]).split("\n");
    const extendedIdx = header.split(",").indexOf("extended_price");
    expect(row.split(",")[extendedIdx]).toBe("120");
  });
});
