import { describe, expect, it } from "vitest";
import { renderEdi810 } from "./render";
import type { Edi810Invoice } from "./schema";

describe("renderEdi810", () => {
  it("renders a full transaction set with correct segment content and SE segment count", () => {
    const invoice: Edi810Invoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV1",
      poNumber: "PO1",
      dueDate: "20260201",
      shipTo: {
        name: "Acme",
        vendorStoreId: "STORE1",
        address1: "123 Main St",
        city: "Anytown",
        state: "TX",
        zip: "75001",
      },
      lineItems: [
        {
          quantity: 2,
          uom: "EA",
          unitPrice: 10,
          upcPack: "0001",
          upcCase: "0002",
          itemNumber: "ITEM1",
          description: "Widget",
          charges: [{ indicator: "C", code: "C110", amount: 5 }],
        },
      ],
    };

    const lines = renderEdi810([invoice]).split("\n");

    expect(lines[0].startsWith("ISA*00")).toBe(true);
    expect(lines[1].startsWith("GS*IN*8388")).toBe(true);
    expect(lines[2]).toBe("ST*810*1~");
    expect(lines[3]).toBe("BIG*20260101*INV1**PO1~");
    expect(lines[4]).toBe("N1*ST*Acme*9*STORE1~");
    expect(lines[5]).toBe("N1*SF*Blue Bell Creameries, LP*1*8388~");
    expect(lines[6]).toBe("N3*123 Main St~");
    expect(lines[7]).toBe("N4*Anytown*TX*75001~");
    expect(lines[8]).toBe("N1*RE**9*GOODYGOODY~");
    expect(lines[9]).toBe("ITD******20260201~");
    expect(lines[10]).toBe("FOB*PP~");
    expect(lines[11]).toBe("IT1*1*2*EA*10**UP*0001*UP*0002*VN*ITEM1~");
    expect(lines[12]).toBe("PID*F****Widget~");
    expect(lines[13]).toBe("SAC*C*C110***500*******06~");
    expect(lines[14]).toBe("TDS*2500~"); // (2*10 + 5) * 100 implied cents
    expect(lines[15]).toBe("CTT*1~");
    expect(lines[16]).toBe("SE*15*1~"); // 13 body segments + ST + SE
    expect(lines[17].startsWith("GE*1*")).toBe(true);
    expect(lines[18].startsWith("IEA*1*")).toBe(true);
    expect(lines).toHaveLength(19);
  });

  it("carries a negative IT102 quantity through unchanged as the credit/return indicator", () => {
    const invoice: Edi810Invoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV2",
      shipTo: { name: "Acme", vendorStoreId: "STORE1" },
      lineItems: [
        { quantity: -3, uom: "EA", unitPrice: 10, itemNumber: "ITEM1", description: "Return" },
      ],
    };

    const output = renderEdi810([invoice]);
    expect(output).toContain("IT1*1*-3*EA*10*");
    expect(output).toContain("TDS*-3000~"); // -3 * 10 * 100
  });

  it("increments the ST/SE control number per invoice in a batch", () => {
    const base: Edi810Invoice = {
      invoiceDate: "20260101",
      invoiceNumber: "INV",
      shipTo: { name: "Acme", vendorStoreId: "STORE1" },
      lineItems: [{ quantity: 1, uom: "EA", unitPrice: 1, itemNumber: "I1", description: "D1" }],
    };

    const output = renderEdi810([base, { ...base, invoiceNumber: "INV2" }]);
    expect(output).toContain("ST*810*1~");
    expect(output).toContain("ST*810*2~");
    expect(output.match(/^GE\*2\*/m)).not.toBeNull();
  });
});
