import { describe, expect, it } from "vitest";
import { renderZeroSac } from "./render";
import type { ZeroSacInvoice } from "./schema";

describe("renderZeroSac", () => {
  it("writes a zero IT102 quantity through unchanged (downstream loads it as qty 1 / price 0.00)", () => {
    const invoice: ZeroSacInvoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      shipTo: { name: "Acme", vendorStoreId: "S1" },
      lineItems: [
        { quantity: 0, uom: "EA", unitPrice: 5, itemNumber: "P1", description: "Zero qty line" },
      ],
    };

    const output = renderZeroSac([invoice]);
    const it1 = output.split("\n").find((l) => l.startsWith("IT1*"))!;
    expect(it1).toBe("IT1*1*0*EA*5******VN*P1~");
  });

  it("writes SAC charge totals as implied-decimal integers", () => {
    const invoice: ZeroSacInvoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      shipTo: { name: "Acme", vendorStoreId: "S1" },
      lineItems: [
        {
          quantity: 1,
          uom: "EA",
          unitPrice: 1,
          itemNumber: "P1",
          description: "D1",
          charges: [{ indicator: "A", code: "F810", amount: 33 }],
        },
      ],
    };

    const output = renderZeroSac([invoice]);
    expect(output).toContain("SAC*A*F810***3300*******06~");
  });
});
