# EDI 810 (Encompass)

## What this is

The same X12 810 skeleton as the [standard EDI 810](/docs/edi/edi_810) — same segments, same envelope, same overall order — produced by vendors on the **Encompass** accounting system. Encompass differs in exactly two places: how it writes quantity/price decimals, and an extra reconciliation value tucked into the `PO4` segment. Everything else (credit/return sign conventions, `SAC` charge indicators and implied-decimal amounts, segment order) is identical to the standard variant — read that guide first if you haven't.

## Quantity and price formatting

Encompass writes `IT102` (quantity) and `IT104` (price) as decimal strings **zero-padded to 3 places right of the decimal** — `6` is written as `6.000`, not `6`. This generator applies that formatting automatically to every line item's quantity and price.

Two things worth knowing if you're testing edge cases here:

- Recent changes to the service provider's export mean **quantity is no longer written with decimal precision** in practice (it behaves like a whole number, just still formatted as `X.000`), while **price can legitimately carry hundredths or thousandths** — e.g. a fractional cent from a broken-case calculation.
- Broken-case pricing is exactly why the `PO4` reconciliation value below exists.

## The PO4 line-item cost value

Where the standard 810's `PO4` segment only carries packs-per-case, Encompass's `PO4` carries a **second element**: the line's own calculated extended cost (a double-precision value), independent of `quantity × price`. This exists because when `IT104` carries extra decimal precision, naively multiplying quantity by the truncated/rounded price can produce a total that doesn't match what Encompass itself billed for the line — the `PO402` value is Encompass's own answer to "what should this line's cost actually be," provided so a downstream system can reconcile against it rather than trust the multiplication.

The source documentation for this variant actually describes three different reconciliation strategies a downstream system could use when `IT104` carries an extended/exponential decimal:

1. **Load as-is and trust PO402** — simplest, but not recommended: load `IT102`/`IT104` verbatim, add the line's SAC charges to `PO402`, and use that sum as the extended cost.
2. **Compare, then decide** — calculate `IT102 × IT104` the normal way and compare it against `PO402`. If they match, proceed normally; if they don't, use `PO402` as the basis for the extended-cost calculation instead.
3. **Reconcile against the invoice total (what Legacy actually does)** — if the invoice's `TDS` total doesn't match the sum of calculated line-item costs, push the difference into a line's cost as a rounding adjustment so the total reconciles exactly.

None of that reconciliation logic is something this *generator* needs to perform — it's downstream behavior. But it's exactly the kind of scenario this format exists to let you test: generate a line item where `quantity × unitPrice` doesn't cleanly equal `lineItemCost`, and see how your ingestion pipeline resolves the mismatch.

## Prompting tips

- *"...with a broken-case quantity where the line cost doesn't quite match quantity times price"* is the scenario `PO402` exists for — set `lineItemCost` to a value slightly off from `quantity × unitPrice`.
- If you don't need to test the reconciliation edge case, you can omit `lineItemCost` entirely and the `PO4` segment will just carry packs-per-case, same as the standard variant.
- Credit/return, SAC charges, and everything else follows the [standard EDI 810](/docs/edi/edi_810) guide unchanged.
