# Walkthrough

Written, not recorded — a screen recording of the live app covering the same
ground as [RUNTHROUGHS.md](RUNTHROUGHS.md) can replace this if preferred.

## What the five minutes would show

1. **Open the app.** No login screen — straight into the must-questions.
   The header shows a live backend connection check, so a wiring problem
   would be obvious immediately rather than failing silently later.
2. **Fill the must-questions.** Pick "self-employed" as the work type and
   watch the income-proof question appear — it wasn't there for "salaried."
   Submit with only these ~8 answered.
3. **See the provisional card.** All four outputs render immediately, at
   their widest bands, labelled "confidence: low." Nothing is blocked behind
   more questions — this is a legitimate, honest answer on its own.
4. **Answer one more question** — collateral value, say. Submit again. The
   product visibly changes from an unsecured loan to a secured one, the rate
   band drops by close to ten points, and the eligible amount roughly
   doubles. This is the adaptive loop: one answer, one clear, visible effect.
5. **Read the Negotiation Card.** The one screen meant to leave the app —
   verdict, product, amount, rate band, APR, EMI ceiling, and the one
   sentence that explains all of it.

## What's next

- **Size secured loans against collateral, not just income.** Documented in
  RULES.md §2 as the biggest known gap: Ravi's numbers are still bounded by
  his declared income even after routing to a secured product, when a real
  lender would size primarily against the ₹45L asset. This is the single
  highest-value fix if the project continued.
- **A real APR (IRR-based), not the straight-line approximation** in RULES.md
  §4 — closer to what an actual Key Fact Statement would disclose.
- **Kannada and Hindi.** Ravi and Anita are the two personas least likely to
  be comfortable reading a financial tool in English only. This matters more
  than most engineering polish would.
- **A lightweight admin view over the `RuleConfig`/`Product`/`Question`
  collections** — right now, "change a rule live" means editing a MongoDB
  document by hand, which is fine for this build's follow-up interview but
  not for anyone else who'd need to maintain it.
- **Automated tests.** Every number in this build was verified by hand
  against a real running instance (see the commit history — each phase was
  actually run, seeded, and hit over HTTP before being pushed), which caught
  a real bug (§ below) but doesn't scale as a long-term practice. A test
  suite over `engine/` — pure functions, no I/O — would be cheap to add and
  is the most obvious next commit.
- **A shareable/printable Negotiation Card** — right now it's a screen, not
  something that survives leaving the browser tab.

## What we'd cut, if the time box were tighter

- **The stress test in O4.** Genuinely useful, but the least load-bearing of
  the four outputs if something had to go — the other three carry the app's
  core argument on their own.
- **`offerReceivedRate` and its Negotiation Card comparison.** A nice, direct
  answer to the brief's own example ("lender quotes 14%...") but the one
  addition that's more feature than foundation.
- **Two of the four loan products.** Personal (unsecured) and Secured would
  cover Priya and Ravi; Business and Two-Wheeler exist mainly to give Ravi
  and Anita a more specific answer than "personal loan for everything."

## A bug this process actually caught

Worth naming rather than glossing over: after Phases 1–7 were built and
pushed, testing Ravi with an added `coApplicantIncome` answer returned
**identical** numbers to not answering it at all. A quick audit found that
only 9 of the question bank's 21 fields were ever read anywhere in the
engine — the rest were seeded with `affects` metadata that the code never
actually implemented. That's a direct violation of the brief's own rule
("every additional question must change an output... if it never moves a
number, cut it"). Phase 8 wired up the remaining eight fields properly
rather than deleting them, and RULES.md documents each one now. Left alone,
this would have quietly cost points on exactly the criterion it's scored
against — catching it before submission, not during the follow-up
interview, is the point of testing every phase against a real running
instance instead of trusting the code by inspection alone.
