# Frontend

React (Vite), plain CSS, no UI library. Talks to the backend over `fetch` —
see `src/api.js` for the three calls it makes.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # edit VITE_API_URL if your backend isn't on :5000
npm run dev
```

Opens on `http://localhost:5173`. Requires the backend running (see
[../backend/README.md](../backend/README.md)) — the header shows a live
"Backend: connected / unreachable" status so you know immediately if it's
not wired up.
