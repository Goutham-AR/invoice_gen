# EDI 810 (US Foods)

## What this is

The same X12 810 skeleton as the [standard EDI 810](/docs/edi/edi_810) — read that guide first for the segment order and envelope mechanics. US Foods layers on more differences than any other variant here: a dedicated credit/debit indicator, an extra unit of measure, per-line tax segments, and a substantially larger set of charge codes.

## Credit and debit: BIG07 is the real signal

Every other EDI variant in this app relies on sign conventions (negative quantity/price) to flag a credit or return line. US Foods gives you an explicit field for it instead: **`BIG07`**, the credit/debit indicator, written as `CR` (Credit Invoice) or `DI` (Debit Invoice) at the invoice level.

When `BIG07` is present, **treat it as the principal signal** — it's more reliable than inferring credit/debit from signs. US Foods still also writes both `IT102` (quantity) *and* `IT104` (price) as negative on credit line items, so the two signals agree; you don't have to choose one or the other when generating a credit scenario, but if you're specifically testing "does the ingestion pipeline trust `BIG07` over the signs (or vice versa)," you can deliberately set them to disagree.

## The LB unit of measure

US Foods' `IT103` (unit of measure) can be `CA`, `EA`, or **`LB`** — the pound, unique to this variant among the four EDI formats here. A couple of things follow from that:

- **`IT102` (quantity) can be a decimal** when the UOM is `LB` — e.g. `38.63` (there's no such thing as a fractional case or each).
- **Price reconciliation uses standard rounding.** The worked example from the spec: `38.63 LB × $2.31/LB = $89.2353`, which rounds to `$89.24` — and that rounded figure is exactly what should show up in the `CTP03` element as the line's net total, so it can be used to verify the calculation without re-deriving it downstream.
- This file represents what US Foods actually sends *to* you — so a generated fixture with `LB` UOM should keep `LB` as written. (A note elsewhere in the source spec about converting `LB` to `EA` describes what a *downstream outbound* integration does with the value afterward, not something this format's own file should do to itself.)

## Line-item taxes: TXI segments

Where other EDI variants roll tax into a per-line `SAC` charge, US Foods gives line-item tax its own segment: **`TXI`**, appearing once per line item, representing that line's net tax. Ingestion should map it to **SAC code `H850`**.

There's also a **summary-level `TXI`** at the bottom of the invoice, and which one you're looking at matters — `TXI01` tells you the record type:

- **`LS`** — state/local sales tax assessed against the invoice's net total. **This should be loaded** as a summary SAC record.
- **`TX`** — the sum of *all* taxes already assessed at both the line and summary level. This is reference/reconciliation data only — **loading it would double-count** everything the line-level `TXI` segments already captured.

If you're generating a fixture to test that an ingestion pipeline correctly ignores `TX` while loading `LS`, this is exactly the scenario to ask for.

## Brand label and other IT1 additions

US Foods' `IT1` segment carries several elements beyond the standard positions: a basis-of-price code (`PE`/`PP`/`UM`), manufacturer part number, substitute product number, and — notably — **`IT123`, the brand label** (e.g. `ACCLAIM`), which this app captures and exposes as its own field.

## Expanded SAC code set

On top of the codes shared with other variants (`C110` deposit, `F810` promotional credit), US Foods adds: `A170` (adjustments), `B950` (damaged merchandise), `C040` (delivery), `C650` (energy surcharge / fuel adjustment), `D240` (freight), `F340` (pick-up), `F800` (promotional allowance), `G970` (small order charge), `H625` (beverage tax), `H840` (transportation tax), `H850` (tax). Same `A`/`C` indicator and implied-decimal amount rules as every other variant.

## Prompting tips

- *"...a credit invoice where BIG07 is CR and the line items are negative"* is the standard, fully-agreeing credit scenario.
- *"...a line item priced in LB with a fractional quantity like 38.63"* exercises the decimal-quantity/rounding path unique to this variant.
- *"...with a line-item TXI tax and a summary-level LS tax"* tests the tax-loading path; add a `TX`-type summary tax in a separate generation to confirm it's correctly treated as reference-only.
- *"...with an energy surcharge and a delivery charge"* reaches into the expanded SAC code set other variants don't have.
