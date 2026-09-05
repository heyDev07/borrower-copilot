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

MongoDB is optional for now — the server still starts without it (it just
warns). It becomes required from Phase 2 onward, once the rules config
lives in the database.

> On macOS, port 5000 is sometimes taken by AirPlay Receiver. If you get
> `EADDRINUSE`, set `PORT=5050` in `.env` (or disable AirPlay Receiver in
> System Settings → General → AirDrop & Handoff).

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
