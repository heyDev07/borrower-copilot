# Three run-throughs

Every number below came from a real call to `POST /api/assess` against the
seeded rules config — nothing here is hand-calculated or rounded for effect.
See [RULES.md](RULES.md) for why each rule produces what it produces.

---

## Priya, 29 — Bengaluru, salaried

### Questions asked (8 must-questions — `incomeProofType` is skipped; salaried doesn't need it)

| Question | Answer |
|---|---|
| How would you describe your work? | Salaried |
| What is this loan for? | Wedding |
| How much do you want to borrow? | ₹8,00,000 |
| What is your net monthly income? | ₹1,10,000 |
| What do you currently pay in EMIs each month? | ₹14,000 |
| What are your essential monthly household expenses? | ₹28,000 (rent) |
| What is your age? | 29 |
| What is your credit score, if you know it? | 780 |

### Provisional read (confidence: low)

| Output | Result |
|---|---|
| O1 | **Borrow** — the requested amount fits within her safe EMI ceiling |
| O2 | Lender might sanction up to ₹20,66,856. Safe number: **₹8,86,748** |
| O3 | Personal Loan (Unsecured), **10.5–14.5%**, all-in APR 10.9–14.9% |
| O4 | EMI ceiling **₹19,950/month**. Stress test (20% income drop or +2pt rate): would no longer be affordable |

### She answers 2 more questions

*Income stability: 60 months. Emergency savings: 6 months.*

Confidence stays **low** (2 of 10 applicable additional questions for a
salaried borrower is 20% — under the 25% floor for "medium") — but the two
answers each earned their keep individually: a long income history nudges
the rate band down, a real savings cushion frees up part of the buffer.

| Output | Before | After |
|---|---|---|
| O2 safe amount | ₹8,86,748 | **₹9,77,829** |
| O3 rate band | 10.5–14.5% | **10.5–14%** |
| O4 EMI ceiling | ₹19,950 | **₹21,875** |

### Negotiation Card

> **Borrow** — Personal Loan (Unsecured) — **10.5–14%** (APR 10.9–14.4%) —
> use **₹9,77,829** — EMI ceiling **₹21,875/month**
> *"Fair for your profile is 10.5–14%, because the requested amount fits
> within your safe EMI ceiling."*

---

## Ravi, 42 — Mysuru, self-employed (kirana owner)

### Questions asked (9 must-questions — `incomeProofType` appears; self-employed needs it)

| Question | Answer |
|---|---|
| How would you describe your work? | Self-employed |
| What is this loan for? | Business |
| How much do you want to borrow? | ₹15,00,000 |
| What is your net monthly income? | ₹35,000 |
| What do you currently pay in EMIs each month? | ₹0 |
| What are your essential monthly household expenses? | ₹20,000 |
| What is your age? | 42 |
| What is your credit score, if you know it? | Unknown |
| What income proof can you show? | ITR |

*A judgement call worth stating plainly: Ravi's actual cash income is
₹40,000–80,000/month, but only his ITR figure (~₹35,000/month) is something
this tool credits him for once he selects "ITR" as his proof type — see
RULES.md §1. This is the single biggest reason his numbers below look tight
relative to how his shop is actually doing.*

### Provisional read (confidence: low)

| Output | Result |
|---|---|
| O1 | **Borrow less** — the EMI for ₹15,00,000 would run **924%** over his safe ceiling |
| O2 | Lender might sanction up to ₹4,45,828. Safe number: **₹1,46,486** |
| O3 | Business Loan (Unsecured), **19.5–24%** — no credit score and unverifiable cash flow put him at the top of the band |
| O4 | EMI ceiling **₹4,025/month** |

This is the provisional read working exactly as intended: on ITR income
alone, a ₹15L ask against a ₹35k/month declared income is a bad idea at an
unsecured rate. It's also incomplete — Ravi owns his shop premises outright.

### He answers: does he have collateral? — ₹45,00,000 (the shop, unencumbered)

Loan-to-value = ₹15,00,000 ÷ ₹45,00,000 = **33%**, comfortably under the 65%
cutoff. Product routing flips.

| Output | Before | After |
|---|---|---|
| O3 product | Business Loan (Unsecured) | **Secured Loan (Property/Gold-backed)** |
| O3 rate band | 19.5–24% | **10.7–12%** |
| O2 safe amount | ₹1,46,486 | **₹3,47,381** |
| O1 | 924% over ceiling | **332% over ceiling** (still "borrow less") |

### He answers one more: co-applicant income — ₹18,000/month (his wife's teaching income)

| Output | Before | After |
|---|---|---|
| O2 safe amount | ₹3,47,381 | **₹8,36,734** |
| O4 EMI ceiling | ₹4,025 | **₹9,695** |
| O1 | 332% over ceiling | **79% over ceiling** (still "borrow less" — ₹15L is still more than he should take, but the gap has closed from "no" to "close") |

### Negotiation Card

> **Borrow less** — Secured Loan (Property/Gold-backed) — **10.7–12%**
> (APR 10.8–12.1%) — use **₹8,36,734**, not ₹15,00,000 — EMI ceiling
> **₹9,695/month**
> *"Fair for your profile is 10.7–12%, because the EMI for ₹15,00,000 would
> run about 79% over your safe ceiling."*

Two answers took Ravi from "don't take this loan" to "here's a specific,
lower number that's actually safe, at a rate a third of what he'd have paid
unsecured." That's the adaptive loop's entire job.

---

## Anita, 35 — Hubballi, informal (delivery rider + tailoring)

### Questions asked (8 must-questions — `incomeProofType` appears; informal needs it)

| Question | Answer |
|---|---|
| How would you describe your work? | Informal |
| What is this loan for? | Vehicle |
| How much do you want to borrow? | ₹1,50,000 |
| What is your net monthly income? | ₹28,000 |
| What do you currently pay in EMIs each month? | ₹0 *(see note)* |
| What are your essential monthly household expenses? | ₹16,000 |
| What is your age? | 35 |
| What is your credit score, if you know it? | Unknown |
| What income proof can you show? | None |

*Note: Anita doesn't think of her app-loan repayments as "EMI" when asked
generically — a realistic gap the must-question alone doesn't catch. It
shows up two questions later.*

### Provisional read (confidence: low)

| Output | Result |
|---|---|
| O1 | **Borrow less** — the EMI for ₹1,50,000 would run **59%** over her safe ceiling |
| O2 | Lender might sanction up to ₹2,04,522. Safe number: **₹94,080** |
| O3 | Two-Wheeler Loan (Asset-linked), **13.2–15%** |
| O4 | EMI ceiling **₹3,220/month** |

Already "borrow less" on affordability alone — before her existing debt or
her bounce are known.

### She answers 3 more: existing debt outstanding (₹35,000), its average rate (30%), and bounces in the last 6 months (1)

| Output | Before | After |
|---|---|---|
| Risk flags | none | `BOUNCE` (soft), **`HIGH_COST_DEBT`** (hard — 30% is above the 24% line) |
| O1 reason | "EMI 59% over ceiling" | **"Existing debt at 30% — above the 24% high-cost line"** |
| Confidence | low | **medium** (3 of 10 applicable questions answered) |
| O2 / O4 | unchanged | unchanged — these three answers move O1's *reason*, not the ceiling itself |

The verdict was already "borrow less"; what changed is *why* — and that
matters, because the real fix for Anita isn't a smaller scooter loan, it's
that her existing debt is more expensive than anything a formal lender would
quote her.

**Is "don't borrow" reachable here?** Yes — tested directly: if her bounce
count were 2 instead of 1, `HIGH_COST_DEBT` (hard) plus `BOUNCE` (now also
hard) would be two hard flags, and O1 flips to **`dont_borrow`**, reason:
*"2 bounced payment(s) in the last 6 months; Existing debt at 30% — above
the 24% high-cost line."* At exactly one bounce, as the brief describes her,
the app correctly treats it as a single flag, not a pattern.

### Negotiation Card

> **Borrow less** — Two-Wheeler Loan (Asset-linked) — **13.2–15%**
> (APR 13.7–15.5%) — use **₹94,080**, not ₹1,50,000 — EMI ceiling
> **₹3,220/month**
> *"Fair for your profile is 13.2–15%, because existing debt at 30% — above
> the 24% high-cost line."*

What she can actually act on tomorrow: a smaller scooter loan sized to
₹94,080 instead of ₹1,50,000, and a clear, specific reason her real problem
right now is the 30% debt, not the vehicle.
