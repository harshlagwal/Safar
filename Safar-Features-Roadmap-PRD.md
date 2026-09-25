# SAFAR — New Features Roadmap PRD (v1.5)
### 8 Features · All Free · Zero Breakage · Current Design System

---

## 0. Golden Rules (har feature pe apply)

1. **Backend break nahi hoga** — Phase 1-2 me backend ko **zero changes**.
   Phase 3 (Group Voting) hi naya backend maangta hai — wo bhi sirf
   **additive, isolated** (naye collections/routes; existing kuch nahi).
2. **Existing data/features untouched** — koi schema change nahi, koi
   endpoint ka contract change nahi, saved trips/PDF/share sab waise.
3. **Design = current website** — same tokens (Inter + saffron #ff6b35,
   #fafafa/#000, cards 16px, pill buttons), same dark mode, same Apple
   algorithm: calm, whitespace, transform/opacity-only animations,
   `prefers-reduced-motion` respected, har new page smoothness rules
   (Safar-Smooth-Performance-Prompt wale) follow karega.
4. **Free check**: Sab features ₹0 — koi paid API nahi. Weather =
   Open-Meteo (free, bina key, 10k calls/day). Voting = khud ka backend.
   Baaki sab static/local logic.

---

## Phase 1 — Zero Backend (pure frontend) — pehle ye

### F1 · "Surprise Me" 🎲
**Kya:** Landing + Plan form pe naya button. User sirf **budget + origin +
travellers** deta hai → frontend **curated destination list** (30 tagged:
budget-band, vibe — pahad/beach/desert/city, season) me se 3 random
candidates spin-animation ke saath dikhata hai → user ek chunta hai →
**existing `POST /api/plan`** hi call hota hai (transportMode: "ai").
**Backend: zero change** — normal plan hi ban raha hai.

**UI:** Plan form ke top pe "Ya phir… Surprise Me ✨" subtle link →
full-screen modal (glass bg): spinning destination cards (0.8s stagger),
"Spin again" + "Plan this" buttons. Cards: destination name + vibe icon +
"budget-fit" badge (₹ budget band se match). Data: `src/data/destinations.js`
— 30 entries, easily editable.

### F2 · "Agli Chhutti" Detector 📅
**Kya:** Landing page pe ek strip/section — "Agli chhutti: Diwali —
3 din ka break" + "3 din + budget ₹10,000 = ye 5 trips sambhav" (F1 ki
destinations se filtered). Click → seedhi plan form pre-filled (days =
long-weekend length).

**Data:** `src/data/holidays.js` — static list (name, date, day,
longWeekend boolean). Logic client-side: aaj se agla long weekend =
holiday ± weekend adjacency. List editable hai — dates tum update kar sakte ho.

### F3 · Trip Weather 🌤️
**Kya:** Result page pe naya section "Mausam" — destination ka forecast
(trip dates ke liye) + auto packing hints ("Woolens zaroori 🧥",
"Umbrella le jao ☂️" — checklist me automatically add karne ka option).

**API:** `api.open-meteo.com` — direct frontend se (CORS allowed, koi key
nahi). **Honest limit:** 16 din aage tak hi forecast — usse door ke trips
ke liye "season-average" dikhao (static climate data file), forecast ke
liye "trip ke 2 hafte pehle wapas dekho" note. Cache: localStorage 1 ghante.

### F4 · Kharcha Tracker v1 💰
**Kya:** Result/Trips page se "Track kharcha" — actual expenses entry
(category: travel/stay/food/activities/other), budget vs actual live bar,
overspending pe red hint. **v1: sirf localStorage** (per tripId) —
**backend zero change**. Cloud sync Phase 3 me optional.

**UI:** Apple-style — thin progress bars, category chips, + button se
inline entry. Sab kuch transform/opacity animations.

### F5 · Hindi UI Toggle 🇮🇳
**Kya:** Navbar me "अ / A" toggle → poora UI Hindi me. `react-i18next`,
2 locales (`hi`, `en`), default `en`, choice localStorage me. RTL nahi
(Hindi LTR hai — tension nahi).

**Important font detail:** **Inter me Devanagari nahi hai!** Hindi ke
liye font stack me **Noto Sans Devanagari** pair karo:
`font-family: Inter, "Noto Sans Devanagari", sans-serif` — dono Google
Fonts se free. Buttons/brand "Safar" English hi rahenge.

---

## Phase 2 — Frontend + content (zero backend)

### F6 · Parent Share Mode 👨‍👩‍👧
**Kya:** Result page pe "Share with parents" → parent-optimized read-only
page (same existing `GET /api/share/:shareId` data se — **zero backend
change**): route summary, dates, **wapas kab**, stay area, group size,
total cost + "sab kuch planned hai" tone, emergency numbers (112, state
tourism helpline — static), aur "Plan ko app me dekho" link.

**Design:** simple, bada font (parents!), print-friendly, zero jargon —
"AI itinerary" nahi, "poora plan" bolo. Share URL me `?view=parent` —
koi naya endpoint nahi. Custom emergency contacts (Phase 3 me optional).

### F7 · Trip Collections / SEO Pages 📈
**Kya:** 5-6 static collection pages: "₹5,000 ke neeche best college
trips", "December me snow", "Monsoon getaways", "Diwali long weekend
trips" — har page me 6-8 destination cards (F1 ki destinations data +
curated copy) → click = plan form pre-filled. Meta tags, OG image
(logo + tricolor), sitemap.xml, clean URLs (`/collections/under-5000`).

**Kyu:** Google se free organic traffic — ye engine hai. Content
tumhara, URL structure clean, har page Lighthouse 90+.

---

## Phase 3 — Backend additive (sirf iske liye, isolated)

### F8 · Group Voting 🗳️
**Kya:** Trip owner invite link banata hai → dost join ( naam + 4-digit
code, no login needed) → options pe vote (destinations/modes/dates) →
live results bars. Winner ke saath "Plan this" → normal plan flow.

**Backend (additive only — existing users/trips/routes ko koi touch nahi):**
- Naye collections: `polls` (tripContext, options[{id,label}], createdAt),
  `votes` (pollId, voterName, optionId, updatedAt) — 2 hi, isolated
- Naye routes: `POST /api/polls` (create), `GET /api/polls/:id`,
  `POST /api/polls/:id/vote` (10s cooldown per voter) — naya
  `poll.routes.js`, existing files me sirf 1 line import
- Polling only (5s interval) — WebSocket/WebRTC nahi, simple
- Rate limited, poll 7 din baad auto-expire (expiry check on read)

*(Custom parent contacts + kharcha cloud sync bhi isi phase me ho sakta
hai — dono optional, additive fields only.)*

---

## Implementation Order + Prompts

**Order:** F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8. Har feature ke baad
regression: ek trip plan karo, PDF + WhatsApp share + dark mode check.

### AI Studio Prompt — Phase 1 (F1-F5, ek-ek karke ya ek saath)

```
Add 5 new features to my React app. HARD RULES: zero backend/API
changes — everything works with existing endpoints and localStorage;
use my current design system exactly (Inter + saffron #ff6b35 accent,
#fafafa/#000 themes, 16px cards, pill buttons, dark mode variants,
Apple-calm animations: transform/opacity only, staggered reveals
0.8s cubic-bezier(0.25,0.1,0.25,1), prefers-reduced-motion respected).

F1 SURPRISE ME: create src/data/destinations.js with 30 Indian
destinations { name, lat, vibe: mountain|beach|desert|city|heritage,
budgetBand: [min,max], bestMonths: [] }. On the Plan page add a subtle
"Ya phir… Surprise Me ✨" link above the form opening a glass modal:
user picks budget + travellers → 3 random budget-fitting destinations
shown as spinning cards (staggered pop-in, 0.8s) with vibe icon and
"budget-fit ✓" badge; "Spin again" rerolls, "Plan this trip" prefills
and submits the EXISTING /api/plan flow with transportMode "ai".

F2 AGLI CHHUTTI: create src/data/holidays.js (editable list of Indian
public holidays 2026-2027: name, date, day). Add a Landing page section:
compute the next long weekend (holiday adjacent to Sat/Sun), show
"Agli chhutti: <name> — <N> din ka break" plus 5 matching destinations
from the data (filtered by budget band + bestMonths). Each card
"Plan karo" prefills the form with days = break length.

F3 TRIP WEATHER: on the Result page add a "Mausam" section: call
api.open-meteo.com (latitude/longitude of destination, daily forecast,
NO API key, direct fetch) — if trip dates are within 16 days show the
forecast with min/max temps and weather icons; otherwise show static
season info from a src/data/climate.js (per-destination averages) with
a note "Trip ke 2 hafte pehle exact mausam yahin dikhega". Cache
responses in localStorage for 1 hour. Add packing hints derived from
the forecast (rain → "Umbrella ☂️", temp < 10 → "Woolens 🧥") with a
one-tap "checklist me add karo" button.

F4 KHARCHA TRACKER: add a "Track kharcha" panel accessible from Result
and Trips pages: per-trip expense entries {category: travel|stay|food|
activities|other, note, amount} stored in localStorage keyed by tripId.
Show budget vs actual thin progress bars per category + total, red
hint on overspend, inline add/edit/delete with smooth height
animations. en-IN number formatting.

F5 HINDI UI: add react-i18next with two locales (en default, hi).
Create translation files for ALL user-facing strings (nav, hero, form
labels/buttons, result sections, errors). Navbar toggle "अ/A" persisted
in localStorage. CRITICAL: pair fonts — "Noto Sans Devanagari" (Google
Fonts) added alongside Inter in the font stack; keep "Safar" brand
wordmark in Latin script. No RTL needed.

Do not touch any existing API service files, the map, auth, PDF, or
WhatsApp share code paths beyond adding i18n wrappers around strings.
After each feature, verify a full plan journey + dark mode still work.
```

### Phase 2 Prompt (F6-F7) — frontend-only

```
F6 PARENT SHARE MODE: on the Result page add "Share with parents 👨‍👩‍👧"
(next to existing share). It opens the SAME public share data (existing
GET /api/share/:shareId — zero backend change) but rendered in a
parent-friendly view at /share/:id?view=parent: larger fonts (18px
body), calm tone ("Poora plan, dates aur kharcha neeche hai"),
sections: Trip overview (where/when/RETURN DATE highlighted), route
summary, stay area, group size, total + per-person cost, static
emergency block (112 national emergency, state tourism helpline from
a small src/data/helplines.js), print-friendly (a print stylesheet:
hide buttons, black on white). No jargon, no "AI" wording.

F7 COLLECTIONS: add 6 static collection pages under /collections/
(under-5000-college-trips, snow-in-december, monsoon-getaways,
diwali-long-weekend, beach-escapes, himalayan-escapes) using the
destinations data with short SEO copy blocks. Each destination card
prefills the plan form. Add meta title/description + OG tags per page,
react-helmet-async or router-native, a public sitemap.xml and clean
anchor text links in the footer. All pages Lighthouse 90+, same design
system, dark mode included.
```

### Phase 3 Prompt (F8) — Antigravity, additive only

```
Add group voting to my Express backend — ADDITIVE ONLY: do not modify
any existing route, model, or middleware registration beyond a single
app.use for the new router. New: models Poll.js { tripContext: Mixed,
options: [{ id: String, label: String }], createdBy: String, expiresAt:
Date (7 days), createdAt } and Vote.js { pollId, voterName, optionId,
updatedAt } with indexes. New routes in poll.routes.js mounted at
/api/polls: POST / (create poll, zod-validated), GET /:id (poll + tallied
results, 404 if expired or missing), POST /:id/vote (body { voterName,
optionId }; one vote per voterName — upsert; 10s cooldown per voter;
404 on expired). Uniform error shape, helmet + rate limit (30/hour/IP)
reuse existing middleware. Jest tests with mocked DB layer. Frontend
(AI Studio, separate prompt): poll page /poll/:id — create poll UI from
Result page ("Dosto se poochho"), share poll link (WhatsApp), vote
buttons with live tallies (5s polling), winner → "Plan this trip" →
prefill plan form. Design system + smoothness rules same as always.
```

---

## Acceptance Checklist (overall)

- [ ] Har feature ke baad: 1 full trip (plan → result → save → share) regression
- [ ] PDF + WhatsApp share + Google login har phase ke end me chal rahe hain
- [ ] Sab naye pages dark mode + reduced-motion + mobile me sahi
- [ ] Open-Meteo console me koi key/error nahi; localStorage cache kaam karta hai
- [ ] Hindi toggle: poori site switch, refresh pe yaad, fonts sahi (Devanagari crisp)
- [ ] Parent view incognito me bina login khulta hai, print clean
- [ ] Collections pages Google Lighthouse 90+; sitemap.xml live
- [ ] Voting: 2 phones se test (vote + results update), 7-din expiry ka test
