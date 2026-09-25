import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import indiaStatesData from '../assets/india-states.json';
import mainlandPathData from '../assets/mainland-path.json';
import precomputedCapitals from '../assets/capital-positions.json';

export interface CapitalItem {
  state: string;
  capital: string;
  lat: number;
  lng: number;
  famous: string[];
  isMetro?: boolean;
}

// 28 States + 8 UTs (Chandigarh merged into one dot representing Haryana, Punjab, and Chandigarh UT)
export const ALL_CAPITALS: CapitalItem[] = [
  // Northern Region
  { state: 'Jammu & Kashmir (UT)', capital: 'Srinagar', lat: 34.08, lng: 74.80, famous: ['Gulmarg', 'Dal Lake'] },
  { state: 'Ladakh (UT)', capital: 'Leh', lat: 34.15, lng: 77.58, famous: ['Pangong Lake', 'Nubra Valley'] },
  { state: 'Himachal Pradesh', capital: 'Shimla', lat: 31.10, lng: 77.17, famous: ['Manali', 'Spiti Valley'] },
  {
    state: 'Haryana • Punjab • UT',
    capital: 'Chandigarh',
    lat: 30.73,
    lng: 76.78,
    famous: ['Rock Garden', 'Sukhna Lake', 'Golden Temple Amritsar', 'Kurukshetra'],
  },
  { state: 'Uttarakhand', capital: 'Dehradun', lat: 30.32, lng: 78.03, famous: ['Rishikesh', 'Valley of Flowers'] },
  {
    state: 'Delhi (NCT)',
    capital: 'New Delhi',
    lat: 28.61,
    lng: 77.21,
    famous: ['India Gate', 'Red Fort', 'Qutub Minar'],
    isMetro: true,
  },

  // North-East & Eastern Himalayas
  { state: 'Sikkim', capital: 'Gangtok', lat: 27.33, lng: 88.61, famous: ['Tsomgo Lake', 'Nathu La'] },
  { state: 'Arunachal Pradesh', capital: 'Itanagar', lat: 27.08, lng: 93.61, famous: ['Tawang', 'Ziro Valley'] },
  { state: 'Assam', capital: 'Dispur', lat: 26.14, lng: 91.84, famous: ['Kaziranga', 'Kamakhya Temple'] },
  { state: 'Meghalaya', capital: 'Shillong', lat: 25.57, lng: 91.88, famous: ['Cherrapunji', 'Dawki'] },
  { state: 'Nagaland', capital: 'Kohima', lat: 25.67, lng: 94.11, famous: ['Hornbill Festival', 'Dzükou Valley'] },
  { state: 'Manipur', capital: 'Imphal', lat: 24.82, lng: 93.94, famous: ['Loktak Lake'] },
  { state: 'Mizoram', capital: 'Aizawl', lat: 23.73, lng: 92.72, famous: ['Vantawng Falls'] },
  { state: 'Tripura', capital: 'Agartala', lat: 23.83, lng: 91.28, famous: ['Ujjayanta Palace', 'Neermahal'] },

  // Middle & Western Region
  { state: 'Rajasthan', capital: 'Jaipur', lat: 26.91, lng: 75.79, famous: ['Hawa Mahal', 'Udaipur', 'Jaisalmer'] },
  { state: 'Uttar Pradesh', capital: 'Lucknow', lat: 26.85, lng: 80.95, famous: ['Taj Mahal Agra', 'Varanasi'] },
  { state: 'Bihar', capital: 'Patna', lat: 25.59, lng: 85.14, famous: ['Bodh Gaya', 'Nalanda'] },
  { state: 'Gujarat', capital: 'Gandhinagar', lat: 23.22, lng: 72.65, famous: ['Rann of Kutch', 'Statue of Unity'] },
  { state: 'Madhya Pradesh', capital: 'Bhopal', lat: 23.26, lng: 77.41, famous: ['Khajuraho', 'Sanchi'] },
  { state: 'Jharkhand', capital: 'Ranchi', lat: 23.34, lng: 85.31, famous: ['Betla', 'Deoghar'] },
  {
    state: 'West Bengal',
    capital: 'Kolkata',
    lat: 22.57,
    lng: 88.36,
    famous: ['Darjeeling', 'Sundarbans'],
    isMetro: true,
  },
  { state: 'Chhattisgarh', capital: 'Raipur', lat: 21.25, lng: 81.63, famous: ['Chitrakote Falls', 'Bastar'] },
  { state: 'DNH & Daman-Diu (UT)', capital: 'Daman', lat: 20.40, lng: 72.83, famous: ['Diu Fort', 'Devka Beach'] },
  { state: 'Odisha', capital: 'Bhubaneswar', lat: 20.30, lng: 85.82, famous: ['Konark Sun Temple', 'Puri Jagannath'] },
  {
    state: 'Maharashtra',
    capital: 'Mumbai',
    lat: 19.07,
    lng: 72.87,
    famous: ['Ajanta-Ellora', 'Lonavala'],
    isMetro: true,
  },

  // Southern Region & Islands
  { state: 'Telangana', capital: 'Hyderabad', lat: 17.39, lng: 78.49, famous: ['Charminar', 'Golconda Fort'] },
  { state: 'Andhra Pradesh', capital: 'Amaravati', lat: 16.51, lng: 80.39, famous: ['Tirupati', 'Araku Valley'] },
  { state: 'Goa', capital: 'Panaji', lat: 15.49, lng: 73.83, famous: ['Baga Beach', 'Old Goa'] },
  {
    state: 'Karnataka',
    capital: 'Bengaluru',
    lat: 12.97,
    lng: 77.59,
    famous: ['Hampi', 'Coorg', 'Mysuru'],
    isMetro: true,
  },
  {
    state: 'Tamil Nadu',
    capital: 'Chennai',
    lat: 13.08,
    lng: 80.27,
    famous: ['Meenakshi Temple Madurai', 'Ooty'],
    isMetro: true,
  },
  { state: 'Puducherry (UT)', capital: 'Puducherry', lat: 11.93, lng: 79.83, famous: ['Auroville', 'Promenade Beach'] },
  {
    state: 'Andaman & Nicobar (UT)',
    capital: 'Port Blair',
    lat: 11.62,
    lng: 92.73,
    famous: ['Radhanagar Beach', 'Cellular Jail'],
  },
  { state: 'Lakshadweep (UT)', capital: 'Kavaratti', lat: 10.57, lng: 72.64, famous: ['Agatti', 'Coral Islands'] },
  {
    state: 'Kerala',
    capital: 'Thiruvananthapuram',
    lat: 8.52,
    lng: 76.94,
    famous: ['Alleppey Backwaters', 'Munnar'],
  },
];

// Rich, high-vibrancy dot colors tailored by latitude zone and theme
function getBrightDotColor(y: number, isDark: boolean): { base: string; glow: string; isWhite: boolean } {
  if (isDark) {
    if (y < 235) {
      // Northern zone: brightened saffron #FFB35C
      return { base: '#FFB35C', glow: 'rgba(255, 179, 92, 0.45)', isWhite: false };
    } else if (y <= 380) {
      // Middle zone: brightened white #FFFFFF (with faint 1.5px ring at 40% opacity)
      return { base: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.35)', isWhite: true };
    } else {
      // Southern zone: brightened green #2EAA3D
      return { base: '#2EAA3D', glow: 'rgba(46, 170, 61, 0.45)', isWhite: false };
    }
  } else {
    // LIGHT MODE — MUST STAY EXACTLY AS TODAY:
    if (y < 235) {
      return { base: '#FF6B00', glow: 'rgba(255, 107, 0, 0.45)', isWhite: false };
    } else if (y <= 380) {
      return { base: '#FF9500', glow: 'rgba(255, 149, 0, 0.45)', isWhite: false };
    } else {
      return { base: '#00A844', glow: 'rgba(0, 168, 68, 0.45)', isWhite: false };
    }
  }
}

const IndiaMapSvgComponent: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [hoveredCapital, setHoveredCapital] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Viewport intersection observer to completely halt infinite GPU loops when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '120px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Progressive hydration: let Hero text and initial DOM paint first with 0ms delay
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsReady(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Instant theme awareness via MutationObserver on html.dark
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Pre-projected, sub-pixel accurate mainland outline path (0ms runtime overhead)
  const mainlandOutlinePath = mainlandPathData.path;

  // Pre-projected capital coordinates (0ms runtime overhead)
  const capitalPositions = precomputedCapitals as Record<string, { x: number; y: number; item: CapitalItem }>;

  // 50ms debounced hover handler for smooth performance
  const handleDotMouseEnter = useCallback((capitalName: string) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredCapital(capitalName);
    }, 50);
  }, []);

  const handleDotMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredCapital(null);
    }, 50);
  }, []);

  const activeCapitalPos = hoveredCapital ? capitalPositions[hoveredCapital] : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none antigravity-gpu-layer transition-opacity duration-300 ${
        isReady ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
          center: [82.8, 22.5],
        }}
        width={600}
        height={650}
        viewBox="0 0 600 650"
        className="w-full h-auto overflow-visible"
      >
        <defs>
          {/* Flame Border Tricolor Gradient: Top Orange/Saffron -> Mid White -> Down Green */}
          <linearGradient
            id="indiaFlameBorderGradient"
            x1="0"
            y1="85"
            x2="0"
            y2="585"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FF5500" />
            <stop offset="22%" stopColor="#FF7700" />
            <stop offset="48%" stopColor="#FFFFFF" />
            <stop offset="52%" stopColor="#FFFFFF" />
            <stop offset="78%" stopColor="#00A844" />
            <stop offset="100%" stopColor="#007E33" />
          </linearGradient>

          {/* Flame Border Glow Filter */}
          <filter id="flameBorderGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Dark Mode Subtle Outer Perimeter Soft Glow Filter (6px blur, color #ff6b35 at 8% opacity) */}
          <filter id="darkPerimeterGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
            </feMerge>
          </filter>

          {/* Dot Glow Filter for active hover state */}
          <filter id="activeDotGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. OUTER BORDER FLAME LAYER (Top Orange, Mid White, Down Green) */}
        {mainlandOutlinePath && (
          <g className="flame-outer-border-layer" pointerEvents="none">
            {/* Soft pulsating flame glow - GPU opacity animated via CSS (0% CPU load) */}
            <path
              d={mainlandOutlinePath}
              fill="none"
              stroke="url(#indiaFlameBorderGradient)"
              strokeWidth={6.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#flameBorderGlow)"
              className={!prefersReducedMotion && isInView ? 'antigravity-flame-pulse' : ''}
              opacity={0.8}
            />

            {/* Crisp flame core border */}
            <path
              d={mainlandOutlinePath}
              fill="none"
              stroke="url(#indiaFlameBorderGradient)"
              strokeWidth={2.2}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.95}
            />
          </g>
        )}

        {/* Subtle Outer Perimeter Glow in Dark Mode (color #ff6b35 at 8% opacity, 6px blur) */}
        {isDark && mainlandOutlinePath && (
          <path
            d={mainlandOutlinePath}
            fill="none"
            stroke="#ff6b35"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#darkPerimeterGlow)"
            opacity={0.08}
            pointerEvents="none"
          />
        )}

        {/* 2. ORIGINAL ACCURATE INDIA STATES BASE (Theme-aware: Light #e8e8ed / Dark #1d1d1f) */}
        <Geographies geography={indiaStatesData as any}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={isDark ? '#1d1d1f' : '#e8e8ed'}
                stroke={isDark ? '#333336' : '#ffffff'}
                strokeWidth={0.5}
                className="outline-none transition-colors duration-300"
                style={{ outline: 'none' }}
              />
            ))
          }
        </Geographies>

        {/* 3. BRIGHT & CLEAN BLINKING CAPITAL DOTS (Theme-aware tricolor stops) */}
        <g className="capitals-layer">
          {ALL_CAPITALS.map((item, idx) => {
            const pos = capitalPositions[item.capital];
            if (!pos) return null;

            const isAnyHovered = hoveredCapital !== null;
            const isHovered = hoveredCapital === item.capital;
            const isDimmed = isAnyHovered && !isHovered;

            // Sizing: base dots 6px (r=3), Metro hubs 8.5px (r=4.25), Hovered 11px (r=5.5)
            const baseRadius = item.isMetro ? 4.25 : 3.0;
            const dotRadius = isHovered ? 5.5 : baseRadius;
            const dotOpacity = isHovered ? 1.0 : isDimmed ? 0.35 : 1.0;

            const { base: dotColor, glow: glowColor, isWhite } = getBrightDotColor(pos.y, isDark);
            const blinkDelay = (idx % 6) * 0.35;

            return (
              <g
                key={item.capital}
                className="cursor-pointer"
                onMouseEnter={() => handleDotMouseEnter(item.capital)}
                onMouseLeave={handleDotMouseLeave}
                aria-label={`${item.capital}, ${item.state}`}
              >
                {/* Generous hit target for effortless hover */}
                <circle cx={pos.x} cy={pos.y} r={14} fill="transparent" />

                {/* Hover glow aura */}
                {isHovered && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={dotRadius + 6}
                    fill={dotColor}
                    opacity={0.4}
                    filter="url(#activeDotGlow)"
                    pointerEvents="none"
                    className="transition-all duration-200"
                  />
                )}

                {/* Clean, Bright, Solid Capital Dot with Hardware-Accelerated CSS Luminance */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={dotRadius}
                  fill={dotColor}
                  stroke={isDark ? (isWhite ? '#FFFFFF' : '#1d1d1f') : '#ffffff'}
                  strokeWidth={isDark && isWhite ? 0 : item.isMetro ? 1.8 : 1.4}
                  className={`transition-all duration-150 ${
                    !isHovered && !isDimmed && !prefersReducedMotion && isInView
                      ? 'antigravity-dot-pulse'
                      : ''
                  }`}
                  style={{
                    opacity: isHovered ? 1.0 : isDimmed ? 0.35 : 0.9,
                    animationDelay: `${blinkDelay}s`,
                    filter: `drop-shadow(0 1px 2.5px ${glowColor})`,
                  }}
                />

                {/* In dark mode, each white dot gets a faint 1.5px ring at 40% opacity so it reads on dark */}
                {isDark && isWhite && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={dotRadius + 1.8}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    strokeOpacity={0.4}
                    pointerEvents="none"
                  />
                )}

                {/* Center Core Sparkle on Metro Hubs */}
                {item.isMetro && !isDimmed && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={1.1}
                    fill={isDark && isWhite ? '#1d1d1f' : '#ffffff'}
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}
        </g>
      </ComposableMap>

      {/* 4. RICH HOVER TOOLTIP CARD (Smart Boundary Clamping for All Corners: Left, Right, Top, Bottom) */}
      <AnimatePresence>
        {activeCapitalPos && (() => {
          const xPercent = (activeCapitalPos.x / 600) * 100;
          const yPercent = (activeCapitalPos.y / 650) * 100;

          // Vertical placement: top edge capitals (y < 28%) open DOWNWARD, all others open UPWARD
          const isNearTop = yPercent < 28;
          const yTranslate = isNearTop ? '16px' : 'calc(-100% - 16px)';

          // Horizontal alignment:
          // Left edge (x < 26%, e.g. Lakshadweep, Gujarat, Daman, Mumbai): anchor near left edge to avoid clipping on left
          // Right edge (x > 72%, e.g. Nagaland, Manipur, Mizoram, Arunachal, Port Blair): anchor near right edge to avoid clipping on right
          // Center: center-aligned (-50%)
          let xTranslate = '-50%';
          let notchLeft = '50%';

          if (xPercent < 26) {
            xTranslate = '-12%';
            notchLeft = '14%';
          } else if (xPercent > 72) {
            xTranslate = '-88%';
            notchLeft = '86%';
          }

          return (
            <div
              key={activeCapitalPos.item.capital}
              style={{
                position: 'absolute',
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                transform: `translate(${xTranslate}, ${yTranslate})`,
                zIndex: 50,
                pointerEvents: 'none',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="relative min-w-[210px] max-w-[285px] bg-white dark:bg-[#1d1d1f] rounded-[12px] p-[10px_14px] shadow-[0_12px_36px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.7)] border border-[#e8e8ed] dark:border-[#333336]"
              >
                {/* Capital Name & State Name */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-tight">
                      {activeCapitalPos.item.capital}
                    </span>
                    {activeCapitalPos.item.isMetro && (
                      <span className="text-[9.5px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#ff6b35]/10 text-[#ff6b35]">
                        Metro Hub
                      </span>
                    )}
                  </div>
                  <span className="text-[12px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5 leading-snug">
                    {activeCapitalPos.item.state}
                  </span>
                </div>

                {/* Famous Places Chips */}
                {activeCapitalPos.item.famous && activeCapitalPos.item.famous.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#f0f0f2] dark:border-[#333336]">
                    <div className="text-[11px] font-medium text-[#86868b] dark:text-[#a1a1a6] mb-1.5 flex items-center gap-1">
                      <span>Famous:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeCapitalPos.item.famous.map((place) => {
                        const { base: accentColor } = getBrightDotColor(activeCapitalPos.y, isDark);
                        return (
                          <span
                            key={place}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#f0f0f2] dark:bg-[#2a2a2e] text-[#1d1d1f] dark:text-[#f5f5f7]"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: accentColor }}
                            />
                            {place}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pointer Notch */}
                <div
                  style={{ left: notchLeft }}
                  className={`absolute -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white dark:bg-[#1d1d1f] border-[#e8e8ed] dark:border-[#333336] ${
                    isNearTop
                      ? '-top-1.5 border-t border-l'
                      : '-bottom-1.5 border-b border-r'
                  }`}
                />
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export const IndiaMapSvg = React.memo(IndiaMapSvgComponent);
