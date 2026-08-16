import { describe, expect, it } from "vitest";
import { setAt, removeAt } from "./pathUtils";

describe("setAt", () => {
  it("sets a top-level key without mutating the original", () => {
    const original = { a: 1 };
    const result = setAt(original, ["a"], 2);
    expect(result).toEqual({ a: 2 });
    expect(original).toEqual({ a: 1 });
  });

  it("sets a nested object path, creating missing intermediates", () => {
    const result = setAt({}, ["shipTo", "name"], "Acme");
    expect(result).toEqual({ shipTo: { name: "Acme" } });
  });

  it("sets a value inside an array by index without mutating the original array", () => {
    const original = { lineItems: [{ qty: 1 }, { qty: 2 }] };
    const result = setAt(original, ["lineItems", 1, "qty"], 99) as typeof original;
    expect(result.lineItems).toEqual([{ qty: 1 }, { qty: 99 }]);
    expect(original.lineItems[1].qty).toBe(2);
  });

  it("replaces the whole value when the path is empty", () => {
    expect(setAt({ a: 1 }, [], { b: 2 })).toEqual({ b: 2 });
  });
});

describe("removeAt", () => {
  it("deletes an object key", () => {
    const result = removeAt({ a: 1, b: 2 }, ["b"]) as Record<string, unknown>;
    expect(result).toEqual({ a: 1 });
    expect("b" in result).toBe(false);
  });

  it("removes an array element by splicing, shifting later indices down", () => {
    const result = removeAt([10, 20, 30], [1]);
    expect(result).toEqual([10, 30]);
  });

  it("deletes a nested optional field without touching siblings", () => {
    const original = { shipTo: { name: "Acme", zip: "12345" } };
    const result = removeAt(original, ["shipTo", "zip"]) as typeof original;
    expect(result.shipTo).toEqual({ name: "Acme" });
    expect(original.shipTo.zip).toBe("12345");
  });
});
