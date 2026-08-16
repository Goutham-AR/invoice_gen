import type { QbInboundInvoice, QbInboundRow } from "./schema";

const COLUMNS = [
  "Trans #",
  "Type",
  "Date",
  "Num",
  "Source Name",
  "Item",
  "Item Description",
  "Qty",
  "Sales Price",
  "Due Date",
  "P. O. #",
  "UPC CODE",
] as const;

function cell(value: string | number | undefined): string {
  return value === undefined ? "" : String(value);
}

function headerRow(inv: QbInboundInvoice): string {
  const byColumn: Record<(typeof COLUMNS)[number], string> = {
    "Trans #": "",
    Type: inv.transactionType,
    Date: inv.date,
    Num: inv.num,
    "Source Name": inv.sourceName,
    Item: "",
    "Item Description": "",
    Qty: "",
    "Sales Price": "",
    "Due Date": cell(inv.dueDate),
    "P. O. #": cell(inv.poNumber),
    "UPC CODE": "",
  };
  return COLUMNS.map((c) => byColumn[c]).join("\t");
}

function lineRow(row: QbInboundRow): string {
  const byColumn: Record<(typeof COLUMNS)[number], string> = {
    "Trans #": "",
    Type: "",
    Date: "",
    Num: "",
    "Source Name": "",
    Item: cell(row.item),
    "Item Description": cell(row.itemDescription),
    Qty: cell(row.qty),
    "Sales Price": cell(row.salesPrice),
    "Due Date": "",
    "P. O. #": "",
    "UPC CODE": cell(row.upcCode),
  };
  return COLUMNS.map((c) => byColumn[c]).join("\t");
}

export function renderQbInbound(invoices: QbInboundInvoice[]): string {
  const lines: string[] = [COLUMNS.join("\t")];
  invoices.forEach((inv, idx) => {
    if (idx > 0) lines.push("", "");
    lines.push(headerRow(inv));
    for (const row of inv.rows) lines.push(lineRow(row));
  });
  return lines.join("\n");
}
