# 12-Column CSV

## What this is

This is a **comma-delimited flat file**. Every row is one line item, and the invoice-level fields (division, invoice number, date, customer, PO info) repeat on every row that belongs to that invoice. There's no separate "header block" and "detail block": the whole file is one table, with a single header row at the top (and even that header row is optional — files may arrive with or without it).

This is the minimal of the three CSV variants: just enough to represent a shipment. It carries no UPC/GTIN identifiers, no per-line charges (tax, deposit, discount), and no extended price column — if your test scenario needs any of those, use the 22- or 24-column variant instead.

## Field reference

| Column | Meaning | Required |
|---|---|---|
| `Division_id` | Vendor's FTS system ID | Yes |
| `invoice_number` | Invoice number, up to 22 chars | Yes |
| `invoice_date` | `M/DD/YYYY` | Yes |
| `Vendor_store_id` | The retailer's customer/store ID | Yes |
| `invoice_due_date` | `M/DD/YYYY` | No — defaults to `invoice_date` if blank |
| `Po_number` | Purchase order number | No |
| `po_date` | PO date, `M/DD/YYYY` | No |
| `quantity_shipped` | Numeric, up to 2 decimals | Yes |
| `Quantity_uom` | One of `BO`, `EA`, `CA`, `KE`, `DS` | Yes |
| `item_number` | Vendor's SKU, up to 20 chars | Yes |
| `product_description` | Up to 80 chars | Yes |
| `unit_price` | Numeric, up to 4 decimals | Yes |

## Credit and return lines

There are two ways a line item can represent a credit or return, and they aren't equivalent:

- **Negative `quantity_shipped`** (e.g. `-6`) is the *standard* way to flag a credit/return line. This is what you should reach for by default when a prompt asks for a return.
- **Negative `unit_price`** (e.g. `-27.50`) is a *nonstandard* indicator — it's accepted by the format, but it's the unusual case. Use it specifically when you want to exercise the "nonstandard credit indicator" path, not as your default credit mechanism.

The two can combine (e.g. a negative-quantity line with a negative price is a plausible edge case) but most real files pick one convention per line.

## Prompting tips

- To test a return: *"...with a credit/return line item using a negative quantity"* (standard) or *"...using a negative unit price instead"* (nonstandard).
- Since there's no due-date column requirement, you can omit due date entirely and check that it falls back to the invoice date.
- Because this variant has no charge columns, prompts asking for taxes/discounts/deposits won't have anywhere to land here — ask for the 22- or 24-column variant instead.
