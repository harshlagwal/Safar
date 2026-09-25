import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, ShieldCheck, Cloud, Share2, MapPin, CheckCircle2 } from 'lucide-react';

interface Slide {
  id: number;
  tag: string;
  badgeIcon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
}

const slides: Slide[] = [
  {
    id: 0,
    tag: 'Safar Kya Hai?',
    badgeIcon: Compass,
    title: 'India’s Smartest AI Travel Planner',
    subtitle: 'Real Indian routes & realistic INR budgets',
    description:
      'Safar designs complete customized itineraries covering state highways, express trains, flights, local food stops, and door-to-door transit in seconds.',
    highlights: ['Accurate 2024-25 INR Costs', 'Door-to-Door Transit', 'Real Highway & Train Routes'],
  },
  {
    id: 1,
    tag: 'Why Use Safar?',
    badgeIcon: Sparkles,
    title: 'Effortless Planning, Zero Headache',
    subtitle: 'Tailored for friends, college trips & families',
    description:
      'No more chaotic spreadsheets or confusing group chats. Get smart packing checklists tailored to your luggage and vehicle, plus local insider tips.',
    highlights: ['Luggage-Aware Checklists', 'Multi-Modal Route Options', 'Split-Expense Ready'],
  },
  {
    id: 2,
    tag: 'Cloud Sync & Share',
    badgeIcon: Cloud,
    title: 'Your Itineraries, Everywhere',
    subtitle: 'Sync across devices & share with 1-click',
    description:
      'Save your trips securely to your account. Download clean, printable offline PDFs and share live itineraries with travel companions instantly.',
    highlights: ['Real-Time Cloud Backup', 'Printable Offline PDFs', 'Instant Shareable Links'],
  },
];

export const AuthSlideshow: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = slides[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="hidden md:flex flex-col justify-between w-[380px] lg:w-[410px] shrink-0 p-8 rounded-3xl bg-gradient-to-br from-[#f5f5f7] via-[#fafafa] to-[#f0f0f3] dark:from-[#1c1c1e] dark:via-[#161618] dark:to-[#121214] border border-[#e8e8ed] dark:border-[#2c2c2e] relative overflow-hidden"
    >
      {/* Subtle background ambient glow */}
      <div className="absolute -top-20 -left-20 w-52 h-52 bg-[#ff6b35]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-[#ff6b35]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-[#2c2c2e]/80 border border-[#e8e8ed] dark:border-[#3a3a3c] shadow-xs">
          <BadgeIcon className="w-3.5 h-3.5 text-[#ff6b35]" />
          <span className="text-[12px] font-semibold text-[#ff6b35] tracking-wide">
            {slide.tag}
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#86868b] dark:text-[#a1a1a6] tabular-nums">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>

      {/* Center Animated Slide Content */}
      <div className="relative z-10 my-auto py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <h2 className="text-[22px] lg:text-[24px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight tracking-tight">
                {slide.title}
              </h2>
              <p className="text-[13px] font-medium text-[#ff6b35]">
                {slide.subtitle}
              </p>
            </div>

            <p className="text-[13.5px] leading-relaxed text-[#86868b] dark:text-[#a1a1a6]">
              {slide.description}
            </p>

            {/* Highlights Chips */}
            <div className="pt-2 flex flex-col gap-2">
              {slide.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-[12.5px] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Progress Bar & Pagination Pills */}
      <div className="relative z-10 pt-4 flex items-center justify-between border-t border-[#e8e8ed] dark:border-[#2c2c2e]">
        <div className="flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="relative h-2 rounded-full transition-all duration-300 cursor-pointer overflow-hidden"
              style={{
                width: currentSlide === idx ? '36px' : '10px',
                backgroundColor: currentSlide === idx ? '#ff6b35' : 'rgba(134, 134, 139, 0.25)',
              }}
            />
          ))}
        </div>

        <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] font-medium">
          Auto-updating
        </span>
      </div>
    </div>
  );
};
