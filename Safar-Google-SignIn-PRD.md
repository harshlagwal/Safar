# SAFAR — Google Sign-In PRD (v1.4)
### "Continue with Google" — 100% free, no Firebase, apna hi MongoDB + JWT

---

## 0. Seedha Jawab + Golden Rule

**Cost: ₹0 hamesha.** Google OAuth 2.0 free hai — koi card nahi, koi
billing account nahi, koi per-login charge nahi. Direct integration hai
(Firebase skip) — users tumhare hi MongoDB me rahenge, JWT bhi apna hi.

**Current data na bigde:**
1. Koi existing endpoint ka contract change nahi — sirf ek naya
   `POST /api/auth/google`.
2. Existing email+password users ka login waise hi chalega — Google
   se aane pe agar email match ho to **account link** hoga, duplicate
   nahi banega.
3. `users` schema me **additive** fields only. Ek dhyan: `passwordHash`
   required tha — Google-only users ke liye **optional** karna padega
   (migration: existing docs already hash rakhte hain, safe).

---

## 1. Complete Flow

```
USER                 FRONTEND                    BACKEND                GOOGLE
  |  "Continue with     |                          |                      |
  |  Google" click      |                          |                      |
  |-------------------->| Google popup khulta hai  |                      |
  |  Google me email    |                          |                      |
  |  select karo        |                          |                      |
  |<--------------------| Google ek ID token       |                      |
  |                     | (credential) deta hai     |                      |
  |                     |                          |                      |
  |                     | POST /api/auth/google    |                      |
  |                     | { credential: token }    |                      |
  |                     |------------------------->| token verify -------->|
  |                     |                          |<-- payload: ----------|
  |                     |                          |  { sub, email, name, |
  |                     |                          |   picture } (verified)|
  |                     |                          |                      |
  |                     |                          | MongoDB: email match?|
  |                     |                          |  haan → googleId set |
  |                     |                          |        (link account)|
  |                     |                          |  nahi → naya user    |
  |                     |                          |  (isVerified: true)  |
  |                     |                          | apna JWT issue       |
  |                     |<-- 200 { token, user } --|                      |
  |  Logged in! 🎉      | AuthContext me save      |                      |
```

**Security note:** ID token Google ke server pe hi verify hota hai
(google-auth-library, public keys se). Frontend kabhi bhi khud
"main Google se aaya hoon" claim nahi kar sakta — token ke bina kuch nahi.

---

## 2. Architecture (existing layers me fit)

```
server/src/
  services/
    google.service.js   ← NAYA: verifyIdToken — Google ka token check
                           (google-auth-library ka OAuth2Client)
  controllers/
    auth.controller.js   ← + googleAuth handler (find-or-link-or-create)
  routes/auth.routes.js  ← + POST /api/auth/google (rate limited 10/min/IP)
  models/User.js         ← additive fields (Section 3)
```

Frontend me `@react-oauth/google` package (official Google Identity
Services ka React wrapper).

---

## 3. DB Changes (additive)

```js
// User schema me add:
googleId:  { type: String, unique: true, sparse: true }, // Google ka 'sub'
avatarUrl: String,                                       // profile pic (optional)
provider:  { type: String, enum: ["email", "google"], default: "email" },

// passwordHash: required → optional (Google users ke paas password nahi)
// + index:
db.users.createIndex({ googleId: 1 })
```

**Email conflict rule (important):** agar Google email kisi existing
user se match kare → wahi user login ho jata hai + `googleId` set
(password bhi chalega aage se). Naya account kabhi nahi banta.
Google user ka `isVerified: true` hamesha.

---

## 4. Env Vars

```
# server/.env — sirf ek (client ID public hota hai, secret nahi hai)
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com

# client/.env — same client ID
VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```
Is flow me **client secret ki zaroorat nahi** — ID token verification
ke liye sirf client ID chahiye. (Secret tab chahiye hota jab server
side authorization code flow karte.)

---

## 5. Tumhara homework — Google Cloud Console (10 min, free)

1. **console.cloud.google.com** → sign in with Google → "New Project" →
   naam: `Safar` → Create
2. Left menu → **APIs & Services → OAuth consent screen**:
   - User type: **External** → Create
   - App name: `Safar`, support email apni Gmail → Save
   - Scopes wale step me **openid, email, profile** (by default milte hain)
   - **Test users** me apni Gmail add kar do (test mode me sirf ye
     login kar sakte hain — 100 tak free)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Type: **Web application**
   - **Authorized JavaScript origins**: `http://localhost:3000`
     (deploy ke baad `https://safar-tumhara.vercel.app` add karna)
   - **Create** → jo **Client ID** mile (`....apps.googleusercontent.com`)
     copy karo — wahi dono `.env` me jaayega
4. Bas. Koi card, koi billing — kuch enable nahi karna.

*(Test mode 100 users tak kaafi hai. Baad me "Publish app" free hai —
basic email/profile scopes ke liye verification bhi nahi lagti.)*

---

## 6. Antigravity Prompt (backend)

```
Add Google Sign-In to my Express auth. Do NOT change any existing
endpoint's contract. Install google-auth-library.

ENV: GOOGLE_CLIENT_ID in .env + .env.example.

NEW SERVICE src/services/google.service.js:
export async function verifyGoogleToken(credential):
new OAuth2Client(process.env.GOOGLE_CLIENT_ID), await
client.verifyIdToken({ idToken: credential, audience:
GOOGLE_CLIENT_ID }); return the verified payload
({ sub, email, name, picture }); throw on failure.

USER MODEL: add googleId (String, unique, sparse), avatarUrl (String),
provider enum ["email","google"] default "email". Change passwordHash
from required to optional (existing users already have it; Google-only
users won't). Index on googleId.

NEW ROUTE POST /api/auth/google (rate limit 10/min/IP), body
{ credential } zod-validated as non-empty string:
1. verifyGoogleToken → payload. If invalid → 401 INVALID_GOOGLE_TOKEN.
2. Find user by googleId OR by payload.email (lowercase).
3. Found → set googleId/avatarUrl if missing (link account).
   Not found → create { name: payload.name, email: payload.email,
   googleId: payload.sub, avatarUrl: payload.picture, provider:
   "google", isVerified: true } (NO passwordHash).
4. Sign my existing JWT { sub: user._id } 7d, respond
   200 { token, user: { id, name, email } } — same shape as login.
   Uniform error shape everywhere.

TESTS (google.service mocked): valid token new user → 201-style 200 +
user created with isVerified true; valid token existing email → same
user id returned, googleId linked, no duplicate; garbage token → 401;
missing credential → 400.
```

## 7. AI Studio Prompt (frontend)

```
Add "Continue with Google" to my React app. Install
@react-oauth/google. VITE_GOOGLE_CLIENT_ID is in .env.

SETUP: wrap the app root with <GoogleOAuthProvider
clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> (inside router).

LOGIN + SIGNUP pages, below the form, Apple-style divider
("— ya phir —", 12px, #86868b) then a "Continue with Google" button:
white surface, 1px #e8e8ed border, 9999px radius, height 48px,
Google's official 4-color "G" SVG icon + "Continue with Google"
16px #1d1d1f. Dark mode: surface #1d1d1f, border #333336, text #f5f5f7.
whileTap scale 0.98. On click use GoogleLogin/useGoogleLogin flow to
get the JWT credential, then POST it as { credential } to
${API}/api/auth/google. On success: same AuthContext login path as
normal login (store token, fetch user, navigate home, toast
"Welcome, {name}!"). On error: inline banner "Google login fail ho
gaya, dobara try karein".

Do not change existing email/password forms or any other page.
Add "Google" as a login method hint nowhere else — navbar avatar
behavior stays identical.
```

---

## 8. Verification Checklist

- [ ] Google button popup kholta hai, email select karne pe login ho jata hai
- [ ] MongoDB me user bana — `provider: "google"`, `isVerified: true`, **passwordHash nahi hai**
- [ ] Same email se pehle password signup karke, phir Google se login → **wahi account** (duplicate nahi)
- [ ] Us linked user ka password login ab bhi chalta hai
- [ ] Dark mode me button sahi dikhta hai
- [ ] Purane users ka login/trips sab pehle jaise (regression)
- [ ] Google Cloud Console me origins me localhost:3000 hi hai (deploy pe add karna)
