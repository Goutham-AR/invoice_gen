import type { QbOnlineInvoice, QbOnlineRow } from "./schema";

const COLUMNS = [
  "Transaction Type",
  "Date",
  "Num",
  "Name",
  "Memo/Description",
  "Qty",
  "Rate",
  "Due Date",
  "P. O. #",
  "UPC CODE",
] as const;

function cell(value: string | number | undefined): string {
  return value === undefined ? "" : String(value);
}

function headerRow(inv: QbOnlineInvoice): string {
  const byColumn: Record<(typeof COLUMNS)[number], string> = {
    "Transaction Type": inv.transactionType,
    Date: inv.date,
    Num: inv.num,
    Name: inv.name,
    "Memo/Description": "",
    Qty: "",
    Rate: "",
    "Due Date": cell(inv.dueDate),
    "P. O. #": cell(inv.poNumber),
    "UPC CODE": "",
  };
  return COLUMNS.map((c) => byColumn[c]).join("\t");
}

function lineRow(row: QbOnlineRow): string {
  const byColumn: Record<(typeof COLUMNS)[number], string> = {
    "Transaction Type": "",
    Date: "",
    Num: "",
    Name: "",
    "Memo/Description": row.description,
    Qty: cell(row.qty),
    Rate: cell(row.rate),
    "Due Date": "",
    "P. O. #": "",
    "UPC CODE": cell(row.upcCode),
  };
  return COLUMNS.map((c) => byColumn[c]).join("\t");
}

export function renderQbOnline(invoices: QbOnlineInvoice[]): string {
  const lines: string[] = [COLUMNS.join("\t")];
  invoices.forEach((inv, idx) => {
    if (idx > 0) lines.push("", "");
    lines.push(headerRow(inv));
    for (const row of inv.rows) lines.push(lineRow(row));
  });
  return lines.join("\n");
}
