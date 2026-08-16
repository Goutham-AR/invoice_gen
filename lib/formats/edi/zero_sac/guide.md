# EDI 810 (Zero SAC Inbound)

## What this is

Structurally identical to the [standard EDI 810](/docs/edi/edi_810) — same segments, same envelope, same field positions. This variant exists to document (and let you deliberately exercise) one specific edge case: **zero-quantity line items**, plus a reminder about how `SAC` amounts are encoded. If you don't need either of those two things, this variant behaves exactly like the standard one — read that guide for everything else.

## The zero-quantity rule

When `IT102` (quantity) is sent as `0`, a downstream ingestion system should **load it as quantity 1, with `IT104` (price) loaded as `0.00`** — rather than dropping the line, or loading it as a literal zero-quantity line.

This matters for testing because "zero quantity" isn't an error case here — it's a meaningful, valid signal (think: a sample, a promotional free item, a placeholder line) that has a specific, documented interpretation. If your ingestion pipeline either rejects zero-quantity lines outright or loads them verbatim as quantity 0, this variant is how you'd catch that.

## SAC amounts, again

`SAC` charge amounts on this variant follow the same implied-decimal convention as every other EDI variant here — a written value like `3300` represents `$33.00`. This variant's source documentation calls that out explicitly (framed as "written as an integer, with 2-digit values converted right of the decimal"), which is the same rule as the standard 810, just worth restating since it's easy to assume "zero SAC" in the variant's name implies something about the `SAC` segment itself. It doesn't — the name refers to the file's origin/routing, not a difference in charge encoding. The `A` (subtract) / `C` (add) indicator convention is unchanged too.

## Prompting tips

- *"...with a zero-quantity line item"* is the scenario this variant exists to cover.
- Combine it with a real line item in the same invoice (*"...and a normal line item at $40"*) to test that the ingestion pipeline handles a mixed invoice correctly rather than only being exercised in isolation.
- Credit/return conventions, `SAC` charge codes, and everything else follow the standard EDI 810 guide unchanged.
