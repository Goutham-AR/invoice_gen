# QuickBooks Online Adjustments

## What this is

Mechanically identical to [QuickBooks Inbound](/docs/quickbooks/quickbooks_inbound): the same tab-delimited AR-ledger export shape, the same duplicate/triplicate netting behavior, the same credit/return-via-sign-inversion logic, the same two-blank-lines-between-invoices separation, and the same four record levels (header row, invoice header, line-item rows, optional footer). **Read that guide first** — everything there about *why* rows repeat and how netting works applies here unchanged. This guide only covers what's different.

## Column vocabulary differences

| QuickBooks Inbound | QuickBooks Online Adjustments | Notes |
|---|---|---|
| `Source Name` | `Name` | Still does double duty as customer name *and* number |
| `Item` + `Item Description` | `Memo/Description` **or** `Product/Service` | See below |
| `Sales Price` | `Rate` | Same meaning, different column name |

The description column is the one genuinely different piece of behavior: a file will contain **either** `Memo/Description` **or** `Product/Service` — never both — and whichever one is present maps to **both** the vendor product number **and** the product description simultaneously. There's no separate item-number column at all in this variant; one text field carries both meanings.

As with Inbound, **unit of measure isn't present in the file** — it's resolved the same way, externally, defaulting to `EA`.

## Column alignment rule

The source documentation for this variant spells out explicitly what both QuickBooks variants actually do structurally: on an invoice's **header row**, only the header-level fields (transaction type, date, num, name, due date) are populated — every line-item column is left as an empty tab-separated cell. On a **line-item row**, only the line-item fields are populated — every header-level column is left empty. This is what keeps every row in the file the same column width despite each row only "meaning" a subset of the columns.

## Prompting tips

- Same netting/credit scenarios as [QuickBooks Inbound](/docs/quickbooks/quickbooks_inbound) apply here — *"...a duplicate reversal pair for one product"*, *"...a return line with a positive quantity"*, *"...a zero-rate line that should be dropped"*.
- *"...using Memo/Description instead of Product/Service"* (or vice versa) is worth generating as two separate invoices if you want to confirm both paths are handled — a single real file only ever uses one or the other.
