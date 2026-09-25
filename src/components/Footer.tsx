import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);
  const [zoomScale, setZoomScale] = useState(0.65);
  const [translateY, setTranslateY] = useState(25);

  // Direct, ultra-responsive scroll listener (100% solid vibrant color, smooth scale zoom)
  useEffect(() => {
    const handleScroll = () => {
      const el = footerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When footer approaches bottom of viewport: progress goes from 0.0 to 1.0
      // Scrolling down: zooms in. Scrolling up: zooms out.
      const visibleRange = windowHeight * 0.85 + rect.height;
      const distanceFromBottom = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, distanceFromBottom / visibleRange));

      // Smooth zoom: 0.65 (compact) -> 1.08 (full-width showcase)
      const currentScale = 0.65 + progress * 0.43;
      const currentY = (1 - progress) * 25;

      setZoomScale(currentScale);
      setTranslateY(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      id="main-footer"
      className="border-t border-[#e8e8ed] dark:border-[#27272a] bg-white dark:bg-[#000000] mt-auto overflow-hidden"
    >
      {/* 1. Massive Antigravity-Style Showcase Wordmark with 100% Solid Vibrant Color & Scroll Zoom */}
      <div className="w-full px-4 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14 flex items-center justify-center select-none overflow-hidden">
        <span
          className="text-center font-black tracking-[-0.055em] leading-[0.82] text-[#ea580c] dark:text-[#ff6b35] select-none"
          style={{
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
            fontSize: 'clamp(3.75rem, 17vw, 15.5rem)',
            transform: `translate3d(0, ${translateY}px, 0) scale(${zoomScale})`,
            transformOrigin: 'center center',
            display: 'inline-block',
            willChange: 'transform',
            transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
            textRendering: 'optimizeLegibility',
          }}
        >
          safar
        </span>
      </div>

      {/* 2. Brand & Navigation Row (Below Safar Wordmark) */}
      <div className="border-t border-[#e8e8ed] dark:border-[#27272a] bg-[#fafafa]/60 dark:bg-[#0a0a0c]/60">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo + Tagline */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                aria-label="Safar — home"
                className="opacity-85 hover:opacity-100 transition-opacity duration-200"
              >
                <Logo variant="full" height={24} />
              </Link>
              <span className="text-[14px] font-semibold text-[#475569] dark:text-[#cbd5e1]">
                | Har Safar. Perfectly Planned.
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-8 text-[14px] font-semibold text-[#334155] dark:text-[#e2e8f0]">
              <Link to="/" className="hover:text-[#ea580c] dark:hover:text-[#ff6b35] transition-colors">
                Home
              </Link>
              <Link to="/plan" className="hover:text-[#ea580c] dark:hover:text-[#ff6b35] transition-colors">
                Plan Route
              </Link>
              <Link to="/trips" className="hover:text-[#ea580c] dark:hover:text-[#ff6b35] transition-colors">
                Saved Trips
              </Link>
            </div>

            {/* Made for Indian travellers */}
            <div className="text-[13px] font-semibold text-[#475569] dark:text-[#cbd5e1] flex items-center gap-2 bg-white dark:bg-[#18181b] px-3.5 py-1.5 rounded-full border border-[#e2e8f0] dark:border-[#27272a] shadow-xs">
              <span>Made for Indian travellers</span>
              <span className="text-[15px]">🇮🇳</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Specs Bar */}
      <div className="border-t border-[#e8e8ed]/80 dark:border-[#27272a] bg-white dark:bg-[#000000]">
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#64748b] dark:text-[#94a3b8] gap-3">
          <p className="font-medium">© {new Date().getFullYear()} Safar. All rights reserved.</p>
          <p className="flex items-center gap-2 font-semibold">
            <span>₹500 to ₹1,00,000 Budget Planner</span>
            <span className="text-[#cbd5e1] dark:text-[#3f3f46]">•</span>
            <span>Instant Route Timeline</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
