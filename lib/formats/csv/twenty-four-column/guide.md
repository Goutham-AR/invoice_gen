# 24-Column CSV

## What this is

The full CSV variant: everything in the 22-column format (tab-delimited mechanics, UPC/GTIN identifiers, promo/tax/deposit/misc. charges, calculated extended price — see that guide for all of it) plus two more per-line charge columns for local tax jurisdictions.

## What's new versus the 22-column variant

| Column | Meaning | Required |
|---|---|---|
| `County_tax` | Per-line county tax amount | No — SAC code `H730` |
| `City_tax` | Per-line city tax amount | No — SAC code `H630` |

That's the entire difference. Everything else — header fields, UPC/GTIN, promotional discount, state tax, deposit, misc. charge, extended price calculation, credit/return sign conventions — behaves exactly as documented in the 22-column guide.

## Why this variant exists

Some jurisdictions layer county and city tax on top of state tax as separate line items rather than folding them into `State_tax`. If a test scenario needs to distinguish "how does the pipeline handle three separate tax jurisdictions on one line" from "how does it handle a single combined tax figure," this is the variant that can represent it — the 22-column format can only carry one tax amount per line.

## Prompting tips

- *"...with state, county, and city tax all present on the same line"* is the scenario this variant exists to cover — it can't be expressed in the 22-column format.
- Everything else from the 22-column guide's prompting tips (mixed charges, extended-price overrides, partial identifiers) applies here unchanged.
