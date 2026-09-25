# SAFAR — Logo Files + Antigravity Placement Prompt

## Files you received

| File | Use |
|---|---|
| `safar-logo.svg` | Horizontal lockup (icon + "Safar") — **light mode** header/footer |
| `safar-logo-dark.svg` | Same lockup, white path + white text — **dark mode** |
| `safar-logo-icon.svg` | Icon only — light backgrounds |
| `safar-logo-icon-dark.svg` | Icon only, white route — dark backgrounds |
| `safar-logo-pin.svg` | Compact pin mark — favicon / app icon (light) |
| `safar-logo-pin-dark.svg` | Pin mark, light pin — dark backgrounds |
| `favicon-32.png` | Ready favicon |
| `safar-logo-preview.png` | All variants preview sheet |

The wordmark uses the site's Inter font (weight 600) — it renders
perfectly on the website because Inter is already loaded.

## The story behind the mark

Ek origin dot → ek S-curve route → ek destination pin. **S = Safar =
route.** Saffron (#ff6b35) = tumhara accent. Poora mark ek hi line me
likha ja sakta hai: "har safar ek route hai."

---

## Paste this prompt in Antigravity

```
I'm giving you the official Safar logo files (SVG). Add them to the
React app.

STEP 1 — Copy files into src/assets/logo/:
safar-logo.svg, safar-logo-dark.svg, safar-logo-icon.svg,
safar-logo-icon-dark.svg, safar-logo-pin.svg, safar-logo-pin-dark.svg
and favicon-32.png into public/.

STEP 2 — Create a Logo component (src/components/Logo.jsx):
- Props: variant ("full" | "icon"), height (default 28).
- Renders the SVG inline (import as React components or inline the SVG
  code so CSS can control it).
- Theme-aware: in dark mode use the -dark variants (route + text in
  white); light mode uses the normal ones. Follow the existing
  dark-mode class/variable system.
- Never stretch: preserveAspectRatio="xMidYMid meet", width auto from
  height.

STEP 3 — HEADER: replace the current text wordmark with <Logo
variant="full" height={28} />. Keep the small "India AI" tag next to
it exactly as it is. The logo replaces only the "Safar" text + old
icon. Alt/aria-label: "Safar — home". Clicking it navigates to "/".

STEP 4 — FOOTER: same logo, height 22, at 60% opacity (hover → 100%,
0.2s ease). Above the footer link columns.

STEP 5 — FAVICON: in index.html <head>:
<link rel="icon" type="image/png" href="/favicon-32.png" />
Also add <link rel="apple-touch-icon" href="/favicon-32.png" />.
Optionally also link safar-logo-pin.svg as an SVG icon fallback.

STEP 6 — OTHER PLACES:
- Loading/generating screen: <Logo variant="icon" height={64} /> with
  a soft pulse animation instead of any old placeholder.
- PDF header: replace the text-only "SAFAR" wordmark with the icon
  (icon-only variant) — keep the thin saffron strip.

RULES:
- Do not recolor, filter, add drop-shadows to, or modify the logo
  SVGs — they are final brand assets.
- Do not change any existing layout/spacing around them beyond
  replacing the old wordmark.
- Verify both themes: light header/footer shows dark logo, dark
  header/footer shows white version — no invisible logos, no white
  text on white.
```

---

## Brand rules (future ke liye)

- Minimum size: full lockup 22px height, icon 16px — usse chhota kabhi nahi
- Clear space: chaaro taraf logo ki height ke 50% jitna khali space
- Colors: sirf #ff6b35 + near-black/white — gradients, shadows, outline kabhi nahi
- Loading states me icon-only use karo, lockup nahi
