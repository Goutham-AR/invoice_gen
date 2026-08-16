# QuickBooks Inbound

## What this is

A tab-delimited `.txt` export from QuickBooks (originally an Excel export, re-importable as tab-delimited CSV). Unlike every other format in this app, it isn't a clean invoice document — it's an **AR (accounts receivable) ledger**, designed to net to zero rather than to state one final number per line. That distinction drives almost everything else about how this format behaves, and it's the reason this format models each line item as a **raw ledger row** rather than a pre-summed total: the whole point of generating this format is being able to produce the same messy, pre-netting shape a real QuickBooks export contains.

## File shape

- **Row 1**: column headers, always present, always the first line of the file.
- **One row per invoice header**: the first line of each invoice's record set, carrying invoice-level fields only (line-item columns left blank).
- **One or more line-item rows** beneath each header, carrying line-item fields only (invoice-level columns left blank).
- **Invoice record sets are separated by exactly two blank lines.**

Column order isn't fixed, and files occasionally carry extra, unsupported columns (with or without data) that should simply be ignored.

## Why the same product can appear two or three times

This is the single most important thing to understand about this format. Because it's an AR ledger, a product can be written to the file **once, twice, or in triplicate**, with the extra entries acting as reversals that net against the "real" sale line. The documented netting rules:

**Standard single line (most common case)**
```
Flavor 32oz Pouch  |  -1  |  96
```
Invert the sign → `qty 1 @ $96` is the single resulting line item.

**Duplicate (2 rows)**
```
Flavor 32oz Pouch  |  -1  |  96
Flavor 32oz Pouch  |   1  |  48
```
Invert both signs → `1 @ 96` and `-1 @ 48` → net dollar amount `96 − 48 = 48` → resulting single line item is `qty 1 @ $48`.

**Triplicate (3 rows)**
```
Flavor 32oz Pouch  |  -1  |  96
Flavor 32oz Pouch  |  -1  |  48
Flavor 32oz Pouch  |   1  |  48
```
Invert all three → `1 @ 96`, `1 @ 48`, `-1 @ 48` → net dollar amount `96 + 48 − 48 = 96` → resulting single line item is `qty 1 @ $96`.

**Zero-price lines are dropped, not netted**
Any row with a `0` Sales Price is omitted entirely on load, regardless of whether its quantity is positive or negative:
```
Flavor 32oz Pouch  |  -1  |  0     ← omitted
Flavor 32oz Pouch  |   1  |  0     ← omitted
```

If your goal is to test that an ingestion pipeline correctly nets duplicate/triplicate rows down to one line item, this is exactly the scenario to generate — ask for the raw, un-netted rows explicitly (this app's generator produces the file *as QuickBooks would export it*, not the already-netted result).

## Credit and return lines

Credit/return line items are written with a **positive** quantity and price in the raw file. Once the standard sign-inversion above is applied, that positive quantity becomes negative — which is what makes it subtract from the invoice total. A worked example from the source data (a keg order with several lines, one of them effectively a return once netted):

```
Lemon Glow 1/6 BBL Keg   qty 5   @ 59.50
Oh Sure    1/6 BBL Keg   qty 3   @ 59.50
Pool Party 1/6 BBL Keg   qty 3   @ 56.00
Oh Sure    1/2 BBL Keg   qty 1   @ 129.50
Greenskeep 1/2 BBL Keg   qty 1   @ 129.50
Keg Deposit              qty 13  @ 30.00
```
After inverting every quantity: `-5, -3, -3, -1, -1, -13` — net invoice total: **−$1,293.00**.

## Column vocabulary specific to this variant

- **`Source Name`** does double duty as both customer name *and* customer number (there's no separate customer-number column).
- **`Item`** and **`Item Description`** can each stand in for the other: if `Item` is blank, the item number is sourced from `Item Description` instead, and vice versa. At least one of the two should be present.
- **Unit of measure isn't in this file at all.** It's looked up externally by vendor ID + product number, defaulting to `EA` if nothing matches — there's no UOM field for this generator to fill in.

## Prompting tips

- *"...a triplicate reversal scenario for one product"* directly targets the netting logic above — be explicit that you want the raw duplicate rows, not a single netted line.
- *"...a return line with a positive quantity that should net negative"* tests the credit/return-via-inversion path.
- *"...a line with zero sales price"* tests that it gets dropped rather than loaded as a zero-value line.
- *"...an item with no Item column, only a description"* tests the item-number/description fallback sourcing.
