# SAFAR — BACKEND PRD (v1.0)
### Build in Antigravity IDE — Node.js + Express + MongoDB + Gemini API

---

## 0. Golden Rule

The frontend is already built and live with a FIXED API contract. The backend's
job is to serve **exactly that contract** — same endpoints, same JSON shapes
(see Section 4). If a field name differs even slightly, the frontend breaks.
Copy the schemas from this PRD verbatim into code.

---

## 1. Goal

A REST API that: receives a trip form (origin, destination, budget, luggage,
transport mode, trip type), calls Google Gemini to generate a route plan,
validates the AI response, saves it to MongoDB, and returns clean JSON. Later:
saved trips, sharing, user accounts.

---

## 2. Tech Stack (fixed)

| Piece | Choice | Why |
|---|---|---|
| Runtime | Node.js 20 + Express | Same language as React frontend, JSON-native |
| Language | JavaScript (ESM) | Consistent with frontend, agent-friendly |
| DB | MongoDB Atlas + Mongoose | Free M0 tier, flexible trip schema |
| AI | Google Gemini — `@google/genai` SDK, model `gemini-2.0-flash` | Fast, cheap, good structured output |
| Validation | `zod` | Validate request AND AI response |
| Rate limit | `express-rate-limit` | Protect Gemini quota |
| Security | `helmet`, `cors`, `dotenv` | Baseline hardening |
| Tests | `jest` + `supertest` | Route tests with a fake Gemini |

**Never** put the Gemini API key in code, in git, or in any response. Only
`process.env.GEMINI_API_KEY`, loaded from `.env` (git-ignored).

---

## 3. Architecture

```
server/
  src/
    server.js            → express app, middleware chain, listen
    config/env.js        → validates all env vars at boot (fail fast)
    routes/
      plan.routes.js     → POST /api/plan
      trip.routes.js     → GET /api/trips/:id, POST /api/trips/:id/regenerate
      share.routes.js    → GET /api/share/:shareId
      health.routes.js   → GET /api/health
    controllers/
      plan.controller.js → orchestrates: validate → generate → persist → respond
    services/
      gemini.service.js  → builds prompt, calls Gemini, extracts JSON
      trip.service.js    → DB reads/writes, shareId generation (nanoid)
    models/
      Trip.js            → Mongoose schema
    validators/
      plan.schema.js     → zod schema for the REQUEST body
      aiResult.schema.js → zod schema for the GEMINI RESPONSE (the law)
    middleware/
      rateLimiter.js     → 20 req / hour / IP on /api/plan
      errorHandler.js    → single error shape, no stack leaks
  .env                   → PORT, MONGO_URI, GEMINI_API_KEY, CORS_ORIGIN
  .env.example           → same keys, empty values (committed)
```

**Request flow (the one that matters — POST /api/plan):**

```
1. rateLimiter        → reject if over quota (429)
2. zod validate body  → reject if invalid (400, with field errors)
3. gemini.service      → build prompt (Section 5) → call Gemini
4. aiResult.schema     → validate AI JSON; if fail → ONE retry with
                         "Return ONLY valid JSON" appended; still fail → 502
5. sanity guard        → perPersonCost.max must be ≤ budget (log warning
                         if AI overshot; clamp tips, don't fail the request)
6. trip.service        → create Trip doc, generate 8-char shareId
7. respond 200         → exact frontend contract JSON
```

Layers never skip: routes only route, controllers orchestrate, services do
work, models define data. No DB calls inside gemini.service, no Gemini calls
inside trip.service. This makes each piece testable in isolation.

---

## 4. API Contract (MUST match the frontend exactly)

### Request
`POST /api/plan`
```json
{
  "tripType": "friends | college | vacation",
  "origin": "Delhi",
  "destination": "Manali",
  "days": 3,
  "travellers": 4,
  "luggage": "light | medium | heavy",
  "budget": 12000,
  "transportMode": "bus | train | bike | car | flight | ai"
}
```
Zod rules: days 1–30 int; travellers 1–20 int; budget 500–100000 int;
origin ≠ destination; strings trimmed, 2–50 chars.

### Response 200 — EXACTLY this shape
```json
{
  "tripId": "67f0a1b2c3d4e5f6a7b8c9d0",
  "summary": "One-line plan summary",
  "modeRecommendation": { "chosen": "bus", "reason": "Best fit for ₹12,000 for 4 people" },
  "route": [
    { "from": "Delhi", "to": "Chandigarh", "state": "Delhi → Haryana → Punjab",
      "km": 245, "hours": 5, "note": "Optional halt suggestion" }
  ],
  "costs": [ { "item": "Bus tickets (onward+return)", "min": 2400, "max": 3200 } ],
  "totalCost": { "min": 9800, "max": 13500 },
  "perPersonCost": { "min": 2450, "max": 3375 },
  "dayPlan": [ { "day": 1, "title": "Delhi → Manali", "details": "Overnight Volvo…" } ],
  "checklist": [ "ID proofs", "Power bank" ],
  "tips": [ "Book bus 2 weeks ahead for 20% cheaper fares" ],
  "shareId": "aB3xKm9Q"
}
```
Field rules: `route[].km` & `hours` positive numbers; `dayPlan[].day`
1-based sequential; all min ≤ max in cost pairs.

### Other endpoints
| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | `{ status: "ok", db: "connected" }` |
| GET | `/api/trips/:id` | Full saved trip (same shape as plan response) |
| POST | `/api/trips/:id/regenerate` | New AI plan using the saved form, updates doc |
| GET | `/api/share/:shareId` | Read-only trip by shareId |

### Error shape (ALL errors, uniform)
```json
{ "error": { "code": "INVALID_BUDGET", "message": "Budget must be between 500 and 100000" } }
```
Codes: `VALIDATION_FAILED` (400) · `RATE_LIMITED` (429) · `AI_BAD_OUTPUT` (502) ·
`AI_TIMEOUT` (504, 30s timeout on Gemini call) · `NOT_FOUND` (404) ·
`SERVER_ERROR` (500, generic message only — never stack traces).

---

## 5. Gemini Integration (the core service)

**Model:** `gemini-2.0-flash`, temperature 0.4, timeout 30s, one retry.

**System instruction (sent with every call):**
```
You are SafarAI, an expert Indian travel planner. You know real Indian
routes, state highways, railway lines, bus corridors, realistic 2024-25
prices in INR, and practical trip logistics. Always respond with ONLY
valid JSON — no markdown, no code fences, no commentary.
```

**User prompt template (filled from the request):**
```
Plan a {tripType} trip from {origin} to {destination}, India, for {days}
days, {travellers} travellers, luggage: {luggage}, total budget ₹{budget},
preferred transport: {transportMode} (if "ai", you choose the best mode and
explain why).

Rules:
- Route must use real Indian cities/states in the correct direction.
- If luggage is heavy, do not recommend bike.
- If budget can't cover the preferred mode, recommend the closest
  affordable alternative and say so in the reason.
- Costs must be realistic INR ranges (min ≤ max).
- dayPlan must cover exactly {days} days.
- checklist must fit the trip type (college trips include ID documents
  and permission items; friends trips include budget-split reminder).
- Return ONLY JSON with this exact schema:
{ summary: string,
  modeRecommendation: { chosen: string, reason: string },
  route: [{ from: string, to: string, state: string, km: number,
            hours: number, note: string }],
  costs: [{ item: string, min: number, max: number }],
  totalCost: { min: number, max: number },
  perPersonCost: { min: number, max: number },
  dayPlan: [{ day: number, title: string, details: string }],
  checklist: [string], tips: [string] }
```

**Response handling:**
1. Strip markdown fences if present (`\`\`\`json` … `\`\`\``).
2. `JSON.parse` → validate against `aiResult.schema.js` (zod).
3. Fail → retry ONCE with: "Your last response was not valid JSON
   matching the schema. Return ONLY the JSON object."
4. Fail again → 502 `AI_BAD_OUTPUT`. Log the raw text server-side only.
5. Success → pass to `trip.service` to persist.

---

## 6. MongoDB Schema (Mongoose)

```js
const tripSchema = new mongoose.Schema({
  // the form (what the user asked)
  form: {
    tripType: { type: String, enum: ["friends","college","vacation"], required: true },
    origin: String, destination: String,
    days: Number, travellers: Number,
    luggage: { type: String, enum: ["light","medium","heavy"] },
    budget: Number,
    transportMode: { type: String, enum: ["bus","train","bike","car","flight","ai"] }
  },
  // the AI plan (what we answered)
  plan: {
    summary: String,
    modeRecommendation: { chosen: String, reason: String },
    route: [{ from: String, to: String, state: String, km: Number, hours: Number, note: String }],
    costs: [{ item: String, min: Number, max: Number }],
    totalCost: { min: Number, max: Number },
    perPersonCost: { min: Number, max: Number },
    dayPlan: [{ day: Number, title: String, details: String }],
    checklist: [String], tips: [String]
  },
  shareId: { type: String, unique: true, index: true },   // 8-char nanoid
  createdAt: { type: Date, default: Date.now }
});
```
One collection for v1 (`trips`). Users collection comes with auth in v1.1.

---

## 7. Middleware & Security

- `helmet()` on all routes
- CORS: only `CORS_ORIGIN` from env (the frontend's URL), no wildcard in prod
- Rate limit: `/api/plan` 20/hour/IP; global 100/hour/IP
- Body limit 10kb (the form is tiny — anything bigger is abuse)
- Gemini call: 30s timeout (AbortController)
- Errors: uniform shape, no internals leaked, all logged with request id
- Mongoose buffers reconnection automatically; health route checks `mongoose.connection.readyState`

---

## 8. Environment

`.env` (never committed; `.env.example` committed with empty values):
```
PORT=5000
MONGO_URI=<Atlas connection string>
GEMINI_API_KEY=<from Google AI Studio>
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

---

## 9. Tests (minimum bar)

- POST /api/plan with valid body, Gemini mocked → 200, response matches
  frontend schema (one test asserts the FULL shape key-by-key)
- Invalid body (budget 50, days 0, origin===destination) → 400 VALIDATION_FAILED
- Gemini returns garbage twice → 502 AI_BAD_OUTPUT
- Rate limiter fires on 21st call → 429
- GET /api/share/:shareId round-trips a saved trip

---

## 10. Deployment

- Render/Railway: Node service, start `node src/server.js`, health check
  path `/api/health`
- Set all 4 env vars in the dashboard
- MongoDB Atlas: allow Render's outbound IPs, M0 free tier
- After deploy: run one real end-to-end plan request from the frontend

---

## 11. FRONTEND CLEANUP (do this first — mock data removal)

Before connecting the real backend, clean the frontend:

1. Delete `src/mocks/` folder entirely (plan.js and any other mock files).
2. Rewrite `src/services/api.js` — remove the mock branch. It becomes a
   single real implementation:
   ```js
   const API_URL = import.meta.env.VITE_API_URL;
   export async function createPlan(formData) {
     const res = await fetch(`${API_URL}/api/plan`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(formData),
     });
     if (!res.ok) {
       const err = await res.json().catch(() => ({}));
       throw new Error(err?.error?.message || "Plan generate nahi ho paya, try again");
     }
     return res.json();
   }
   ```
3. Create `.env` in the frontend: `VITE_API_URL=http://localhost:5000`
   (later the deployed backend URL). Remove any old mock-mode comments/logic.
4. Keep localStorage saved-trips working, but when `API_URL` is set, prefer
   `tripId` + `/api/trips/:id` for reloading saved plans.
5. Handle the backend's error shape: show `err.error.message` in the
   existing retry card on `/generating`.

---

## 12. Copy-Paste Build Prompt for Antigravity

```
Build the backend for "Safar", an AI travel planner. Stack: Node.js 20 +
Express (ESM) + MongoDB via Mongoose + Google Gemini via @google/genai
(model gemini-2.0-flash) + zod + express-rate-limit + helmet + cors.
No TypeScript. No auth yet.

Structure:
server/src/{server.js, config/env.js, routes/, controllers/, services/,
models/, validators/, middleware/} exactly as a layered app:
routes route only, controllers orchestrate, services do work.

ENV (fail fast at boot if missing): PORT, MONGO_URI, GEMINI_API_KEY,
CORS_ORIGIN.

ENDPOINTS:
1. GET /api/health → { status:"ok", db:"connected"|"down" }
2. POST /api/plan — rate limited 20/hour/IP, zod-validate the body:
   { tripType: friends|college|vacation, origin, destination (≠ origin,
   2–50 chars), days 1–30, travellers 1–20, luggage: light|medium|heavy,
   budget 500–100000, transportMode: bus|train|bike|car|flight|ai }.
   Then call gemini.service with temperature 0.4, 30s timeout:
   system prompt: "You are SafarAI, an expert Indian travel planner...
   respond with ONLY valid JSON." User prompt includes all form fields,
   the rule "heavy luggage → never recommend bike", "if budget can't
   cover preferred mode, suggest closest affordable alternative", and the
   exact response JSON schema:
   { summary, modeRecommendation{chosen,reason}, route[{from,to,state,km,
   hours,note}], costs[{item,min,max}], totalCost{min,max},
   perPersonCost{min,max}, dayPlan[{day,title,details}], checklist[],
   tips[] }.
   Strip markdown fences, JSON.parse, zod-validate against the same
   schema; on failure retry the Gemini call ONCE with "Return ONLY valid
   JSON"; still bad → 502 { error:{ code:"AI_BAD_OUTPUT", message } }.
   Success → save Mongoose Trip {form, plan, shareId (8-char nanoid)} →
   respond 200 with { tripId, ...plan fields..., shareId }.
3. GET /api/trips/:id → full saved trip (200) or 404 NOT_FOUND.
4. POST /api/trips/:id/regenerate → re-run Gemini with the stored form,
   update the doc, return the new plan.
5. GET /api/share/:shareId → read-only trip by shareId.

All errors use one uniform shape { error:{ code, message } } with codes
VALIDATION_FAILED 400, RATE_LIMITED 429, AI_BAD_OUTPUT 502, AI_TIMEOUT
504, NOT_FOUND 404, SERVER_ERROR 500. helmet() + CORS only from
CORS_ORIGIN + JSON body limit 10kb. Include .env.example, a jest +
supertest suite with the Gemini service mocked, and a README with local
setup steps.
```

---

## 13. Acceptance Checklist

- [ ] `POST /api/plan` with a real form returns 200 JSON the frontend renders with zero changes
- [ ] Invalid budget/day values → clean 400, not a crash
- [ ] Gemini garbage twice → 502, server stays up
- [ ] Rate limit kicks in on the 21st request in an hour
- [ ] Trip persists — restart server, `GET /api/trips/:id` still works
- [ ] Share link works: `/api/share/:shareId` returns the trip
- [ ] API key appears nowhere except `.env` (grep the repo to confirm)
- [ ] CORS: requests from the frontend URL succeed; others blocked
