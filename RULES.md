# RULES.md

Every threshold, band, and assumption the engine uses, and why. Values live in
[`backend/src/seed/data.js`](backend/src/seed/data.js) — this document explains
them; changing a rule means editing that file (or, once seeded, the `RuleConfig`
document in MongoDB) and re-seeding. No code change required.

All percentages below are plain numbers (`55` means 55%), not fractions.

## 1. Employment and credit tiering

What every other rule keys off. An employment type maps to one of four risk
buckets; a credit score maps to one of three tiers.

| What | Value | Why | Source |
|---|---|---|---|
| Salaried → `salaried` | — | Payslip-verifiable, most stable | Judgement |
| Self-employed + ITR shown → `self_employed_itr` | — | Declared income is tax-verified | Judgement |
| Self-employed, no ITR (cash/bank statement only) → `self_employed_cash` | — | Declared income is self-reported, unverifiable | Judgement |
| Informal (gig, daily wage) → `informal` | — | No formal income proof exists at all | Judgement |
| Credit score ≥ 750 | `high` tier | Common industry cutoff for "prime" | Judgement, informed by public bank rate-card cutoffs |
| Credit score 650–749 | `mid` tier | — | Judgement |
| Credit score < 650, **or unknown** | `low` tier | Unknown is never assumed good — brief's rule 3 | Challenge brief |

## 2. Affordability — O2 and O4's numbers

Two ceilings are computed and the smaller one is recommended.

**Lender ceiling** = `netMonthlyIncome × FOIR cap % ÷ 100 − existingMonthlyEMI`

| Employment type | High tier | Mid tier | Low tier |
|---|---|---|---|
| Salaried | 55% | 50% | 40% |
| Self-employed (ITR) | 45% | 45% | 35% |
| Self-employed (cash) | 35% | 35% | 30% |
| Informal | 30% | 30% | 25% |

*Why these numbers:* FOIR (Fixed Obligation to Income Ratio) caps in this range
are common across Indian personal-loan underwriting; unverified and informal
income get progressively tighter caps because the income itself carries more
uncertainty, independent of repayment intent. **Source: judgement**, calibrated
to publicly-known lender FOIR conventions — not sourced from a specific RBI
circular, since FOIR limits are lender policy, not a regulatory mandate.

**Borrower-safe ceiling** = `(netMonthlyIncome − existingMonthlyEMI − monthlyHouseholdExpenses − savingsBuffer) × disposableIncomeFoirCap ÷ 100`

| What | Value | Why |
|---|---|---|
| Savings buffer | 10% of net income | Reserved before anything else — an emergency-fund floor. Judgement. |
| Disposable-income FOIR cap | 35% | Of what's genuinely left over, only just over a third is committed to a new EMI, leaving room for irregular expenses the must-questions don't ask about. Judgement — deliberately conservative for a self-assessment tool. |

The **recommended ceiling is `min(lender, borrower-safe)`** — usually the
borrower-safe number, which is the point of O2: showing the borrower the
lender will likely offer more than what's actually safe to take.

Four optional additional answers adjust the inputs to both ceilings before
the percentages above are applied — each one either does nothing (unanswered)
or moves the number in one clear direction:

| Additional answer | Effect | Why |
|---|---|---|
| Co-applicant income | Added in full to income before the FOIR % is applied | Both applicants are jointly liable, so the combined income is what a lender actually underwrites against. Judgement — no discount applied, unlike some lenders' partial-weighting practice. |
| Variable income share | Income haircut by `share% × 30%` | The rupee is real, but a variable share of it is less certain to land next month. 30% is a judgement discount, not a specific lender's formula. |
| Emergency savings ≥ 6 months | Savings buffer drops from 10% to 5% of income | A real cushion means less needs to be held back for a new EMI. |
| Emergency savings = 0 (answered, not skipped) | Savings buffer rises from 10% to 15% | No cushion at all means more should be held back, not less. |
| Upcoming large expense | Spread over 12 months and subtracted from monthly leftover | A known future hit to cash flow is still a hit to what's safely available today. |

*Known limitation:* for the secured product, real lenders underwrite
substantially against the collateral's value, not just declared income. This
engine still applies the same income-based ceiling even after routing to a
secured product — it doesn't yet size the loan against collateral value beyond
the LTV gate below. Documented, not fixed, given the time box.

## 3. Product routing — O3

| Rule | Value | Why |
|---|---|---|
| Collateral offered and loan-to-value ≤ 65% | Route to **Secured Loan (Property/Gold-backed)**, 9–12% band | Collateral should always win on cost when it clears a conservative LTV bar — this is what routes Ravi to a secured product against his shop premises. Judgement on the 65% LTV cutoff, in line with typical LAP practice. |
| Purpose = `vehicle`, no qualifying collateral | **Two-Wheeler Loan**, 11–15% | The vehicle itself is collateral-adjacent — cheaper than an unsecured personal loan for the same purpose. Judgement. |
| Purpose = `business`, no qualifying collateral | **Business Loan (Unsecured)**, 14–24% | Weaker income verification than salaried, and business cash flow is inherently less predictable. Judgement. |
| Everything else | **Personal Loan (Unsecured)**, 10.5–22% | Default product for salaried/self-employed borrowers without collateral. Judgement, rate band informed by public personal-loan rate cards circa 2025–26. |

## 4. Fair rate band — narrowing within the product's band, O3

The product's full band is a range across all borrowers; the engine narrows it
to this borrower's likely slice:

| Credit tier | Position in band |
|---|---|
| High | Bottom 35% of the band |
| Mid | Middle 40% (25%–65% of the way through) |
| Low / unknown | Top 45% of the band |

Each **hard** risk flag (§6) pushes the band up further, capped at the
product's stated maximum — it can narrow the borrower's slice toward the worse
end of the band, but never quote a rate outside what the product itself
allows. **Source: judgement** — a simplified, explainable stand-in for a real
underwriting scorecard.

Answering **income stability** nudges the band a smaller amount than a risk
flag would: ≥ 36 months of the same income moves both ends down 0.5 points;
under 12 months moves them up 0.5 points. Answering **an offer already
received** doesn't change the band at all — it's compared against the band
instead, and that comparison is what the Negotiation Card shows (§8).

**All-in APR** = rate band + (`processingFeePct ÷ (tenureMonths ÷ 12)`),
i.e. the one-time processing fee spread evenly across the borrower's actual
tenure (§5's age cap, if it applies) and added to the nominal rate.

*Known limitation:* this is a straight-line approximation, not a true
IRR-based APR (which is what RBI's Key Fact Statement disclosure actually
requires from regulated lenders). Close enough to sanity-check a lender's
quote; not precise enough to cite as a legal APR.

## 5. Loan amount and EMI — O2 and O4

- **Tenure** is `min(product.maxTenureMonths, (retirementAge − age) × 12)` —
  a loan should finish before retirement, not just before the product's own
  cap. Retirement age is 60. Judgement, but a standard lending convention.
- Loan amount is derived from an EMI ceiling via the standard reducing-balance
  EMI formula, run in reverse, at the midpoint of the fair rate band and that
  tenure.
- O4's three tenure options are shown at 25%, 50%, and 100% of that same
  tenure (rounded to the nearest 6 months) — enough to show the
  shorter-tenure/higher-EMI trade-off without listing every possible tenure.
- **Stress test**: income drops 20%, or the rate rises 2 percentage points
  (whichever the answers make more relevant is up to the frontend to
  present — the engine returns both the assumption and the result).
  Both figures are judgement, chosen to be a meaningful but not extreme shock.

## 6. Risk flags — O1

| Flag | Trigger | Severity | Why |
|---|---|---|---|
| `BOUNCE` | 1 bounced payment in the last 6 months | Soft | A single bounce can be a one-off. |
| `BOUNCE` | 2+ bounced payments in the last 6 months | Hard | A pattern, not an accident. |
| `HIGH_COST_DEBT` | Existing debt outstanding at ≥ 24% APR | Hard | 24% is roughly where "expensive but formal" becomes "loan-shark-adjacent" — consolidating this should come before taking on more debt. Judgement. |
| `HIGH_UTILISATION` | Credit card utilisation ≥ 75% | Soft | A widely-used early-warning line for revolving-credit stress. Judgement. |
| `HIGH_UTILISATION` | Credit card utilisation ≥ 90% | Hard | Very little headroom left on existing credit. Judgement. |

**Verdict (O1) logic:**

| Condition | Decision |
|---|---|
| 2+ hard flags | **Don't borrow** |
| 1 hard flag, or the requested amount's EMI is > 30% over the safe ceiling (> 60% if the loan is productive, see below) | **Borrow less** |
| Otherwise | **Borrow** |

The 30%-over threshold is judgement — a deliberate buffer so "borrow less"
doesn't fire on every borrower who's asked for one rupee more than the exact
ceiling. If the borrower answers **expected return on a productive loan**
and that return clearly beats the cost of borrowing (more than 3 points over
the fair rate's midpoint — not just matching it, since costs can move against
you), the threshold relaxes to 60% over instead of 30%. Judgement, and the
only place a business case is allowed to soften the verdict.

## 7. Confidence — "widens with silence"

Confidence is the share of *applicable* additional questions the borrower
actually answered (a question that doesn't apply to their employment type
isn't held against them):

| Answered share of applicable additional questions | Confidence |
|---|---|
| ≥ 60% | High |
| 25%–59% | Medium |
| < 25% | Low |

Must-questions alone always land in "low" confidence by design — the app
still produces all four outputs, just with the widest bands and this label
attached. Judgement on the two cutoffs.

## 8. Negotiation Card — comparing against an offer already received

If the borrower has already been quoted a rate, the Negotiation Card compares
it to the fair band instead of restating it:

| Where the offer sits | Message |
|---|---|
| Above the fair band's max | "That's above fair. Ask for [band]." |
| Below the fair band's min | "That's already better than fair for your profile." |
| Inside the band | "That's within the fair range." |

This is the challenge brief's own example made literal: lender quotes 14%,
card says fair is 11–12.5%.

## 9. What this app deliberately does not model

- No bureau pull, no real credit report — `creditScore` is a self-declared
  number, or unknown.
- No real KYC, no lender-specific policy — every band here is a general
  self-assessment, not a quote from an actual bank.
- Secured-product loan sizing doesn't yet fully reflect collateral value
  (§2's known limitation).
- APR is a straight-line approximation, not IRR-based (§4's known limitation).
- The variable-income haircut (§2) and the income-stability and productive-
  return nudges (§4, §6) are flat judgement figures — a real underwriting
  model would derive these from actual default data, not a fixed percentage.

These are flagged here, and in the app's own copy, rather than silently
assumed away.
