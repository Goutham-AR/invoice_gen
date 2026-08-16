import { describe, expect, it } from "vitest";
import { createIncrementalItemParser } from "./generate";

describe("createIncrementalItemParser", () => {
  it("emits each item as soon as its closing brace arrives, single push", () => {
    const parser = createIncrementalItemParser();
    const items = parser.push('{"invoices":[{"a":1},{"b":2}]}');
    expect(items.map((i) => JSON.parse(i))).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("works when the response is split across many arbitrary chunks", () => {
    const parser = createIncrementalItemParser();
    const full = '{"invoices":[{"a":1,"nested":{"x":true}},{"b":"hello"}]}';
    const chunkSize = 3;
    const items: string[] = [];
    for (let i = 0; i < full.length; i += chunkSize) {
      items.push(...parser.push(full.slice(i, i + chunkSize)));
    }
    expect(items.map((i) => JSON.parse(i))).toEqual([{ a: 1, nested: { x: true } }, { b: "hello" }]);
  });

  it("does not miscount braces that appear inside string values", () => {
    const parser = createIncrementalItemParser();
    const items = parser.push(
      '{"invoices":[{"description":"contains a } brace and a { one too"},{"b":2}]}'
    );
    expect(items.map((i) => JSON.parse(i))).toEqual([
      { description: "contains a } brace and a { one too" },
      { b: 2 },
    ]);
  });

  it("handles escaped quotes inside strings without exiting string mode early", () => {
    const parser = createIncrementalItemParser();
    const items = parser.push('{"invoices":[{"note":"she said \\"hi\\""},{"b":2}]}');
    expect(items.map((i) => JSON.parse(i))).toEqual([{ note: 'she said "hi"' }, { b: 2 }]);
  });

  it("supports a bare top-level array as a fallback (no invoices wrapper key)", () => {
    const parser = createIncrementalItemParser();
    const items = parser.push('[{"a":1},{"b":2}]');
    expect(items.map((i) => JSON.parse(i))).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("emits nothing further once the array has closed, ignoring trailing wrapper content", () => {
    const parser = createIncrementalItemParser();
    const items = parser.push('{"invoices":[{"a":1}],"note":"trailing {} braces"}');
    expect(items.map((i) => JSON.parse(i))).toEqual([{ a: 1 }]);
  });

  it("emits nothing while an item is still incomplete", () => {
    const parser = createIncrementalItemParser();
    const items = parser.push('{"invoices":[{"a":1,"b":');
    expect(items).toEqual([]);
  });
});
