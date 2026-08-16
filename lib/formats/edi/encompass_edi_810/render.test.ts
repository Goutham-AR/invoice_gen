import { describe, expect, it } from "vitest";
import { renderEncompass } from "./render";
import type { EncompassInvoice } from "./schema";

describe("renderEncompass", () => {
  it("writes IT102/IT104 zero-padded to 3 decimals", () => {
    const invoice: EncompassInvoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      shipTo: { name: "Acme", vendorStoreId: "S1" },
      lineItems: [
        { quantity: 6, uom: "EA", unitPrice: 33.5, itemNumber: "P1", description: "Widget" },
      ],
    };

    const output = renderEncompass([invoice]);
    const it1 = output.split("\n").find((l) => l.startsWith("IT1*"))!;
    const parts = it1.replace(/~$/, "").split("*");
    expect(parts[2]).toBe("6.000");
    expect(parts[4]).toBe("33.500");
  });

  it("writes a PO402 line-item cost reconciliation value alongside packs per case", () => {
    const invoice: EncompassInvoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      shipTo: { name: "Acme", vendorStoreId: "S1" },
      lineItems: [
        {
          quantity: 1,
          uom: "EA",
          unitPrice: 44.55,
          itemNumber: "P1",
          description: "Widget",
          packsPerCase: 4,
          lineItemCost: 44.55,
        },
      ],
    };

    const output = renderEncompass([invoice]);
    expect(output).toContain("PO4*4*44.55~");
  });

  it("omits PO4 entirely when neither packsPerCase nor lineItemCost is provided", () => {
    const invoice: EncompassInvoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      shipTo: { name: "Acme", vendorStoreId: "S1" },
      lineItems: [{ quantity: 1, uom: "EA", unitPrice: 1, itemNumber: "P1", description: "D1" }],
    };

    expect(renderEncompass([invoice])).not.toContain("PO4");
  });
});
