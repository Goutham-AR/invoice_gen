# 22-Column CSV

## What this is

The same tab-delimited, one-row-per-line-item shape as the 12-column variant (see that guide for the file mechanics and the due-date fallback rule), extended with three things the minimal variant can't represent: **product identifiers** (UPC pack/case, GTIN), **per-line charges** (promotional discount, state tax, deposit, misc. charge), and a **reference invoice number** at the header level.

## What's new versus the 12-column variant

| Column | Meaning | Required |
|---|---|---|
| `ref_invoice_number` | Points at a related prior invoice, up to 22 chars | No |
| `upc_pack` | Pack-level UPC, 12 digits preferred | No |
| `upc_case` | Case-level UPC, 12 digits preferred | No |
| `gtin_id` | Global Trade Item Number, 14 digits | No |
| `promotional_discount` | Per-line promo discount amount | No — SAC code `F810` |
| `State_tax` | Per-line state tax amount | No — SAC code `H850` |
| `deposit_amount` | Per-line deposit (e.g. bottle/keg deposit) | No — SAC code `C110` |
| `miscellaneous_charge` | Per-line misc. charge | No — SAC code `I131` |
| `extended_price` | The line's total (quantity × unit price) | No — **calculated automatically if omitted** |
| `packs_per_case` | Units per case | No |

The `SAC code` notes aren't decoration — they're the same charge-type vocabulary the EDI 810 variants use in their `SAC` segments. A promotional discount here and a `SAC*A*F810*...` segment there represent the identical business concept in two different formats. If you're testing that your ingestion pipeline treats a CSV promo discount and an EDI F810 charge the same way, generate one invoice in each format with matching amounts.

## Extended price

`extended_price` is the one column where "leave it blank" and "fill it in" mean genuinely different things for testing purposes:

- **Omit it** to exercise the "calculate from quantity × unit price" path.
- **Provide an explicit value** to exercise a scenario where the file's stated total *doesn't* match quantity × unit price — useful for testing reconciliation/validation logic downstream.

## Credit and return lines

Same convention as the 12-column variant: negative `quantity_shipped` is the standard credit/return indicator; negative `unit_price` is the accepted nonstandard one. See the 12-column guide for detail — it's identical here.

## Prompting tips

- *"...with a promotional discount and a deposit charge on one line"* exercises two SAC-style charges at once.
- *"...where extended_price doesn't match quantity times unit price"* deliberately tests the override path rather than the calculated one.
- *"...with a GTIN but no UPC codes"* is a realistic partial-identifier scenario worth generating on its own.
