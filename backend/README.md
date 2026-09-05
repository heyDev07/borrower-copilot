# Backend

Stateless Express API. MongoDB stores only the rules configuration (rate
bands, FOIR limits, the question bank) — never a borrower's answers.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # edit MONGO_URI if you're not running Mongo locally
npm run dev
```

Server starts on `http://localhost:5000`. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

MongoDB is required from this point on — it holds the rules config the
API reads on every request. Start it, then seed it once:

```bash
npm run seed
```

> On macOS, port 5000 is sometimes taken by AirPlay Receiver. If you get
> `EADDRINUSE`, set `PORT=5050` in `.env` (or disable AirPlay Receiver in
> System Settings → General → AirDrop & Handoff).

## API

Stateless — nothing here persists a borrower's answers.

**`GET /api/health`** — liveness check.

**`GET /api/questions`** — the full question bank (must + additional),
each tagged with `tier`, `appliesTo`, and which outputs it `affects`.
The frontend decides which to ask and in what order.

**`POST /api/assess`** — runs the rules engine once and returns O1–O4
plus the Negotiation Card. Body:

```json
{
  "answers": {
    "employmentType": "salaried",
    "purpose": "wedding",
    "loanAmountRequested": 800000,
    "netMonthlyIncome": 110000,
    "existingMonthlyEMI": 14000,
    "monthlyHouseholdExpenses": 28000,
    "age": 29,
    "creditScore": 780
  }
}
```

Only the must-questions above are required; any additional answers
(`collateralValue`, `pastBounceCount6m`, ...) narrow the result further.
See `src/seed/data.js` for the full field list.

## Folder structure

```
src/
  config/     database connection
  models/     Mongoose schemas — the rules config, not borrower data
  engine/     pure functions: affordability, routing, risk, rate, verdict
  routes/     Express routes
  controllers/ request handlers, call into engine/
  seed/       populates MongoDB with the initial rules config
```
