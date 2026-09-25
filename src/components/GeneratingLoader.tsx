import { useEffect, useState } from "react";

/**
 * Safar — GeneratingLoader
 * Apple-style brand loader: origin dot → S-route draws itself →
 * destination pin pops → pulse travels the route forever.
 * Theme-aware (html.dark), reduced-motion safe. Zero dependencies.
 *
 * Usage: <GeneratingLoader title="Generating your trip…" />
 */

const DEFAULT_TEXTS = [
  "Checking routes…",
  "Comparing bus & train fares…",
  "Fitting your ₹ budget…",
  "Packing your checklist…",
];

const CSS = `
.sl-route { stroke: #1d1d1f; }
.dark .sl-route { stroke: #f5f5f7; }

.sl-wrap { display:flex; flex-direction:column; align-items:center; gap:24px; }
.sl-mark { width:150px; height:145px; }

.sl-origin {
  transform-origin: 44px 56px;
  animation: sl-pop .45s cubic-bezier(.25,.1,.25,1) both;
}
.sl-route {
  stroke-dasharray: 700; stroke-dashoffset: 700;
  animation: sl-draw 1.1s .15s cubic-bezier(.65,0,.35,1) forwards;
}
.sl-pin-pop {
  transform-origin: 184px 162px;
  animation: sl-pinpop .55s 1.15s cubic-bezier(.34,1.56,.64,1) both;
}
.sl-pin-pulse {
  transform-origin: 184px 162px;
  animation: sl-pinpulse 2.4s 1.85s ease-in-out infinite;
}
.sl-travel {
  offset-path: path("M44 56 C112 14 202 50 174 102 C148 150 62 128 70 176 C78 220 150 238 184 162");
  offset-rotate: 0deg;
  animation: sl-travel 1.7s 1.8s cubic-bezier(.45,.05,.55,.95) infinite;
  opacity: 0;
}

@keyframes sl-draw    { to { stroke-dashoffset: 0; } }
@keyframes sl-pop     { from { transform: scale(0); opacity:0 } to { transform: scale(1); opacity:1 } }
@keyframes sl-pinpop  { from { transform: scale(0); } to { transform: scale(1); } }
@keyframes sl-pinpulse{ 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
@keyframes sl-travel  { 0% { offset-distance:0%; opacity:0 } 8% { opacity:1 }
                        85% { opacity:1 } 100% { offset-distance:100%; opacity:0 } }


.sl-title { font-size:17px; font-weight:600; letter-spacing:-0.02em;
            color:#1d1d1f; text-align:center; }
.sl-sub   { font-size:14px; margin-top:10px; color:#86868b; text-align:center;
            transition: opacity .3s; }
.dark .sl-title { color:#f5f5f7; } .dark .sl-sub { color:#a1a1a6; }

.sl-bar    { width:170px; height:3px; border-radius:3px; margin:16px auto 0;
             overflow:hidden; position:relative; background:#e8e8ed; }
.dark .sl-bar { background:#333336; }
.sl-bar::after {
  content:""; position:absolute; inset:0;
  background: linear-gradient(90deg, transparent, #ff6b35, #ffffff, #138808, transparent);
  animation: sl-sweep 1.6s linear infinite;
}
@keyframes sl-sweep { from { transform: translateX(-100%) } to { transform: translateX(100%) } }

@media (prefers-reduced-motion: reduce) {
  .sl-route { stroke-dashoffset:0; animation:none; }
  .sl-origin, .sl-pin-pop, .sl-pin-pulse, .sl-travel, .sl-bar::after { animation:none; }
  .sl-travel { display:none; }
}
`;

export default function GeneratingLoader({
  title = "Generating your trip…",
  texts = DEFAULT_TEXTS,
  intervalMs = 2000,
}: {
  title?: string;
  texts?: string[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % texts.length);
        setFading(false);
      }, 300);
    }, intervalMs);
    return () => clearInterval(t);
  }, [texts.length, intervalMs]);

  return (
    <div className="sl-wrap">
      <style>{CSS}</style>
      <svg className="sl-mark" viewBox="16 6 230 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(-8,0)">
          <path
            className="sl-route"
            d="M44 56 C112 14 202 50 174 102 C148 150 62 128 70 176 C78 220 150 238 184 162"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle className="sl-origin" cx="44" cy="56" r="12" fill="#ff6b35" />
          <g transform="translate(25.8,22.7) scale(0.86)">
            <g className="sl-pin-pop">
              <g className="sl-pin-pulse">
                <path
                  d="M184 118 C211.2 118 231.2 138 231.2 162 C231.2 192.8 184 238 184 238 C184 238 136.8 192.8 136.8 162 C136.8 138 156.8 118 184 118 Z"
                  fill="#ff6b35"
                />
                <circle cx="184" cy="162" r="17" fill="#ffffff" />
              </g>
            </g>
          </g>
          <circle className="sl-travel" r="7" fill="#ff6b35" />
        </g>
      </svg>

      <div>
        <div className="sl-title">{title}</div>
        <div className="sl-sub" style={{ opacity: fading ? 0 : 1 }}>{texts[idx]}</div>
        <div className="sl-bar" />
      </div>
    </div>
  );
}
