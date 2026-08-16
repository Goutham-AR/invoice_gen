# EDI 810 (Standard)

## What this is

A standard ANSI X12 810 Invoice transaction, version 004010 — the "Fintech standard" that the other three EDI variants in this app (Encompass, US Foods, Zero SAC) are each a variation on. In the real world this file arrives via manual upload to a web portal or FTP; AS2 is technically supported but rarely used, and SFTP isn't supported at all. None of that affects the file's content, only how it's delivered — irrelevant for a generated test fixture, but useful context if you're wondering why FTP/AS2 don't show up anywhere in the schema.

## Structure, top to bottom

Every invoice is one **transaction set**, wrapped in an EDI envelope:

```
ISA  → interchange envelope (sender/receiver IDs, control numbers)
GS   → functional group envelope
  ST   → start of this transaction set
  BIG  → invoice date, invoice number, PO date/number, reference invoice number
  N1*ST → ship-to name and customer number
  N1*SF → ship-from (vendor) identity
  N3   → ship-to street address
  N4   → ship-to city/state/zip
  N1*RE → remit-to / interchange identity
  ITD  → payment due date
  FOB  → shipping terms
  [ repeated per line item: ]
    IT1  → quantity, UOM, unit price, UPC pack/case, item number
    PID  → product description
    SAC* → zero or more allowance/charge lines
    PO4  → packs per case
  TDS  → invoice total
  CTT  → line item count
  SE   → end of transaction set
GE   → end of functional group
IEA  → end of interchange
```

The envelope segments (`ISA`/`GS`/`GE`/`IEA`) and the segment/control-number bookkeeping (`SE01`'s segment count, control numbers matching between `ST`/`SE` and `GS`/`GE`) are mechanical — this generator computes them for you. What you control through a prompt is everything from `BIG` down through the line items.

## Credit and return lines

- **Negative `IT102` (quantity)** is the standard indicator for a credit/return line item.
- **Negative `IT104` (price)** is a nonstandard indicator — accepted, but the unusual case. Prefer the quantity-based signal unless you're specifically testing the nonstandard path.

## Allowance/charge (`SAC`) lines

Each `SAC` segment carries an indicator, a 4-character code, and an amount:

- **`A` (allowance)** — subtract this amount from the line/invoice.
- **`C` (charge)** — add this amount.
- Amounts are **implied-decimal**: `3300` means $33.00, not $3,300. The generator handles this conversion — when you're describing a scenario in a prompt, just say the real dollar amount (e.g. "a $33 promotional credit"), not the implied-decimal integer.

Common codes you'll see across the EDI variants: `C110` (deposit), `F810` (promotional credit/discount), `H850` (tax), `H730`/`H630` (county/city tax). US Foods uses a substantially larger code set — see that variant's guide.

## A documentation correction worth knowing about

The source specification for this format lists the product description (`PID`) as element position 10. Every real reference file for this format — and the actual published X12 810 standard — puts it at **position 5** instead. This generator follows position 5 (matching both the real samples and the standard), on the assumption the "position 10" in the original spec text is a copy/paste error rather than an intentional deviation. If you're cross-checking generated output against that original spec document, this is the one place they won't literally match — everything else follows the documented positions exactly.

## Prompting tips

- *"...with a $33 promotional allowance and a $60 beverage deposit"* exercises two SAC lines with opposite indicators on one line item.
- *"...where the quantity is negative to represent a return"* is the standard credit path; explicitly ask for "a negative unit price instead" to exercise the nonstandard one.
- If you don't specify ship-to address details, the generator will still produce a structurally valid file — those fields are optional.
