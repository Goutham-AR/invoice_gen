// The "CSV" formats in this codebase are actually tab-delimited flat files (confirmed
// against the reference sample's raw bytes), one row per line item, with invoice
// header fields repeated on every row and a single header row for the whole file.

export type CsvColumn<TInvoice, TLine> = {
  header: string;
  get: (invoice: TInvoice, lineItem: TLine) => string | number | undefined | null;
};

function csvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (/[\t\n"]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function renderTabDelimited<TInvoice, TLine>(
  columns: CsvColumn<TInvoice, TLine>[],
  invoices: TInvoice[],
  getLineItems: (invoice: TInvoice) => TLine[]
): string {
  const header = columns.map((c) => c.header).join("\t");
  const rows = invoices.flatMap((inv) =>
    getLineItems(inv).map((li) => columns.map((c) => csvCell(c.get(inv, li))).join("\t"))
  );
  return [header, ...rows].join("\n");
}
