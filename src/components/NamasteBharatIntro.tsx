import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import indiaStatesData from '../assets/india-states.json';
import { INDIA_OUTER_PERIMETER_PATH } from '../assets/india-outer-path';
import { ArrowRight } from 'lucide-react';

interface NamasteBharatIntroProps {
  onComplete?: () => void;
  durationMs?: number;
}

export const NamasteBharatIntro: React.FC<NamasteBharatIntroProps> = ({
  onComplete,
  durationMs = 3200,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs]);

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 650);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          key="namaste-intro-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
          }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1], // Apple signature cubic-bezier curve
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#070709] select-none overflow-hidden"
        >
          {/* Ambient Warm Golden/Saffron Radial Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{
                scale: [0.95, 1.08, 1],
                opacity: [0.28, 0.48, 0.32],
              }}
              transition={{
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'mirror',
              }}
              className="w-[500px] sm:w-[680px] h-[500px] sm:h-[680px] rounded-full bg-gradient-to-tr from-[#ff6b35]/20 via-[#ffa000]/15 to-transparent blur-[120px]"
            />
          </div>

          {/* Top-Right Clean Apple Skip Pill */}
          <div className="absolute top-6 right-6 z-30">
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              type="button"
              onClick={handleDismiss}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium text-[#86868b] dark:text-[#a1a1a6] hover:text-[#ff6b35] dark:hover:text-[#ff6b35] bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-md border border-[#e8e8ed] dark:border-[#2c2c2e] shadow-xs cursor-pointer transition-all hover:scale-105"
            >
              <span>छोड़ें / Skip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Main Hero Container: Proportionally locked to 600:650 map ratio */}
          <div className="relative w-full max-w-[560px] md:max-w-[600px] aspect-[600/650] max-h-[82vh] flex items-center justify-center">
            {/* 1. India Map with Revolving Outer Tricolor Laser Beam */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.85,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full h-full flex items-center justify-center filter drop-shadow-[0_12px_32px_rgba(255,107,53,0.12)] dark:drop-shadow-[0_16px_40px_rgba(0,0,0,0.85)]"
            >
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 1040,
                  center: [82.8, 22.2],
                }}
                width={600}
                height={650}
                viewBox="0 0 600 650"
                className="w-full h-full object-contain overflow-visible"
              >
                <defs>
                  {/* Subtle Neon Glow Filter for the revolving outer beam */}
                  <filter id="appleOuterGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Flowing Indian Tricolor Gradient */}
                  <linearGradient id="appleTricolorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B35" />
                    <stop offset="32%" stopColor="#FF8833" />
                    <stop offset="50%" stopColor="#FFFFFF" />
                    <stop offset="68%" stopColor="#00C853" />
                    <stop offset="100%" stopColor="#008822" />
                  </linearGradient>
                </defs>

                {/* Base India States (Light subtle borders, NO internal laser) */}
                <Geographies geography={indiaStatesData as any}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="currentColor"
                        stroke="#f0f0f3"
                        strokeWidth={0.5}
                        className="text-[#fbfbfe] dark:text-[#111114] dark:stroke-[#202024] transition-colors duration-500"
                        style={{ outline: 'none' }}
                      />
                    ))
                  }
                </Geographies>

                {/* Delicate Static Outer Border */}
                <path
                  d={INDIA_OUTER_PERIMETER_PATH}
                  fill="none"
                  stroke="#ff6b35"
                  strokeWidth={1.2}
                  strokeOpacity={0.3}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* REVOLVING TRICOLOR RGB BEAM — SMOOTH CONTINUOUS PERIMETER ONLY */}
                <g pointerEvents="none">
                  {/* Outer soft aura */}
                  <motion.path
                    d={INDIA_OUTER_PERIMETER_PATH}
                    fill="none"
                    stroke="url(#appleTricolorGradient)"
                    strokeWidth={4.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#appleOuterGlow)"
                    strokeDasharray="400 1400"
                    animate={{
                      strokeDashoffset: [1800, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      ease: 'linear',
                      repeat: Infinity,
                    }}
                    opacity={0.85}
                  />

                  {/* Crisp laser core */}
                  <motion.path
                    d={INDIA_OUTER_PERIMETER_PATH}
                    fill="none"
                    stroke="url(#appleTricolorGradient)"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="400 1400"
                    animate={{
                      strokeDashoffset: [1800, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      ease: 'linear',
                      repeat: Infinity,
                    }}
                    opacity={1}
                  />
                </g>
              </ComposableMap>
            </motion.div>

            {/* 2. Typography Positioned at Central India (Bhopal/MP Heartland: 38% X, 48% Y) */}
            <div
              className="absolute pointer-events-none z-10 flex flex-col items-center text-center"
              style={{
                left: '37.5%',
                top: '48%',
                transform: 'translate(-50%, -50%)',
                width: 'min(270px, 46vw)',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.75,
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col items-center w-full"
              >
                {/* Headline: नमस्ते भारत with generous line-height so 'े' matra is prominent & unclipped */}
                <h1 className="text-[23px] sm:text-[27px] md:text-[29px] font-black tracking-normal leading-[1.35] pt-2 pb-0.5 bg-gradient-to-r from-[#ff4500] via-[#ff6b35] to-[#ffa500] bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(255,107,53,0.35)] whitespace-nowrap">
                  नमस्ते भारत
                </h1>

                {/* Subtitle: सफ़र आपका स्वागत करता है */}
                <p className="text-[13px] sm:text-[14.5px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-snug mt-0.5 filter drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)] dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] whitespace-nowrap">
                  सफ़र आपका स्वागत करता है
                </p>

                {/* Micro tagline */}
                <p className="text-[10px] sm:text-[11px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6] tracking-wide mt-1 whitespace-nowrap">
                  अतुल्य भारत का स्मार्ट AI यात्रा साथी
                </p>

                {/* Apple-style Linear Progress Line */}
                <div className="pt-2.5 w-20 sm:w-28">
                  <div className="w-full h-1 bg-[#ff6b35]/20 dark:bg-[#333336]/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: (durationMs - 200) / 1000,
                        ease: 'linear',
                      }}
                      className="w-full h-full origin-left bg-gradient-to-r from-[#ff4500] to-[#ffa500] rounded-full shadow-[0_0_8px_rgba(255,107,53,0.6)]"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
