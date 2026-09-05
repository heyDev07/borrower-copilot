# Borrower Copilot

A self-assessment tool for Indian borrowers, built for the Lokta build challenge.

Before a borrower walks into a lender, this app answers four questions from what
they tell it — no login, no bureau pull, nothing stored:

1. Should I borrow at all?
2. How much am I really eligible for?
3. What's a fair interest rate for me?
4. What EMI should I agree to?

It then hands them a one-page **Negotiation Card** to use in the branch.

## Status

Built in small phases, backend first. See commit history for progress.

| Phase | What | Status |
|---|---|---|
| 1 | Backend scaffold (Express, health check) | ✅ |
| 2 | Rules config models + seed data (MongoDB) | ✅ |
| 3 | Rules engine (affordability, routing, risk, rate) | ✅ |
| 4 | Assessment API | ✅ |
| 5 | RULES.md | ✅ |
| 6 | Frontend scaffold (Vite + React) | ✅ |
| 7 | Question flow | ⏳ |
| 8 | Results + Negotiation Card | ⏳ |

See [RULES.md](RULES.md) for every threshold the engine uses, and why.

## Stack

MERN — MongoDB, Express, React, Node. MongoDB holds only the rules
configuration (rate bands, FOIR limits, the question bank), never borrower
answers. Every borrower session is stateless: answers in, a card out.

## Running locally

Backend: see [backend/README.md](backend/README.md).
Frontend: see [frontend/README.md](frontend/README.md).

## The brief

The original challenge document is at [docs/challenge-brief.html](docs/challenge-brief.html).
