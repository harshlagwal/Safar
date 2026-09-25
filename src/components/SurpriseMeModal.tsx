import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Mountain,
  Palmtree,
  Sun,
  Landmark,
  Building2,
  MapPin,
  Compass,
} from 'lucide-react';
import { CURATED_DESTINATIONS, Destination, DestinationVibe } from '../data/destinations';
import { Button } from './Button';

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  currentTravellers: number;
  onSelectDestination: (dest: Destination) => void;
}

const VIBE_META: Record<
  DestinationVibe,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  mountain: { label: 'Mountain', icon: Mountain, color: '#0071e3' },
  beach: { label: 'Beach', icon: Palmtree, color: '#00a844' },
  desert: { label: 'Desert', icon: Sun, color: '#ff9500' },
  heritage: { label: 'Heritage', icon: Landmark, color: '#af52de' },
  city: { label: 'City & Culture', icon: Building2, color: '#ff6b35' },
};

export const SurpriseMeModal: React.FC<SurpriseMeModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  currentTravellers,
  onSelectDestination,
}) => {
  const [budget, setBudget] = useState(currentBudget || 12000);
  const [travellers, setTravellers] = useState(currentTravellers || 2);
  const [spinKey, setSpinKey] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBudget(currentBudget || 12000);
      setTravellers(currentTravellers || 2);
      setSpinKey((prev) => prev + 1);
    }
  }, [isOpen, currentBudget, currentTravellers]);

  // Per-person budget
  const perPersonBudget = useMemo(() => {
    return Math.max(1000, Math.round(budget / Math.max(1, travellers)));
  }, [budget, travellers]);

  // Pick 3 random candidate destinations matching or close to the budget
  const candidateDestinations = useMemo(() => {
    // Score based on budget suitability
    const eligible = CURATED_DESTINATIONS.filter((d) => {
      // If destination min budget is within perPersonBudget * 1.3
      return d.budgetBand[0] <= perPersonBudget * 1.35;
    });

    const pool = eligible.length >= 3 ? eligible : CURATED_DESTINATIONS;

    // Shuffle pool with spinKey seed
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [perPersonBudget, spinKey]);

  const handleSpinAgain = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setSpinKey((k) => k + 1);
      setIsSpinning(false);
    }, 280);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-3xl bg-[#ffffff] dark:bg-[#1c1c1e] rounded-3xl border border-[#e8e8ed] dark:border-[#333336] shadow-2xl overflow-hidden z-10 my-auto"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 pb-4 border-b border-[#e8e8ed] dark:border-[#2c2c2e] flex items-start justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b35]/10 text-[#ff6b35] text-[12px] font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SURPRISE ME 🎲</span>
              </div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Kahan jana chahte ho?
              </h2>
              <p className="text-[14px] text-[#86868b] dark:text-[#a1a1a6]">
                Budget aur travellers batao — AI aapke liye 3 curated destinations pick karega.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-full bg-[#f2f2f5] dark:bg-[#2c2c2e] text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Budget & Travellers Selector Bar */}
          <div className="px-6 sm:px-8 py-4 bg-[#fafafa] dark:bg-[#161617] border-b border-[#e8e8ed] dark:border-[#2c2c2e] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#86868b] dark:text-[#a1a1a6]">Budget:</span>
                <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums">
                  ₹{budget.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="h-4 w-px bg-[#e8e8ed] dark:bg-[#333336]" />

              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#86868b] dark:text-[#a1a1a6]">Travellers:</span>
                <span className="text-[14px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums">
                  {travellers} {travellers > 1 ? 'people' : 'person'}
                </span>
              </div>

              <div className="h-4 w-px bg-[#e8e8ed] dark:bg-[#333336] hidden sm:block" />

              <span className="text-[12px] font-medium text-[#ff6b35] bg-[#ff6b35]/10 px-2.5 py-0.5 rounded-full">
                ~₹{perPersonBudget.toLocaleString('en-IN')}/person
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSpinAgain}
              disabled={isSpinning}
              className="ml-auto"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>Spin again</span>
            </Button>
          </div>

          {/* Destination Cards Grid */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {candidateDestinations.map((dest, idx) => {
                const vibe = VIBE_META[dest.vibe];
                const VibeIcon = vibe.icon;
                const isBudgetFit = perPersonBudget >= dest.budgetBand[0];

                return (
                  <motion.div
                    key={`${dest.name}-${spinKey}`}
                    initial={{ opacity: 0, y: 16, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: idx * 0.1,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="p-5 rounded-2xl bg-white dark:bg-[#252528] border border-[#e8e8ed] dark:border-[#38383a] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${vibe.color}15`,
                            color: vibe.color,
                          }}
                        >
                          <VibeIcon className="w-3 h-3" />
                          <span>{vibe.label}</span>
                        </span>

                        {isBudgetFit && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>budget-fit ✓</span>
                          </span>
                        )}
                      </div>

                      {/* Title & State */}
                      <div>
                        <h3 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight group-hover:text-[#ff6b35] transition-colors">
                          {dest.name}
                        </h3>
                        <p className="text-[12px] text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#ff6b35]" />
                          <span>{dest.state}</span>
                        </p>
                      </div>

                      {/* Tagline */}
                      <p className="text-[12.5px] text-[#515154] dark:text-[#c7c7cc] line-clamp-2 leading-relaxed">
                        {dest.tagline}
                      </p>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {dest.highlights.slice(0, 2).map((h) => (
                          <span
                            key={h}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#f2f2f5] dark:bg-[#333336] text-[#6e6e73] dark:text-[#a1a1a6]"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 mt-3 border-t border-[#f2f2f5] dark:border-[#333336]">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectDestination(dest)}
                        className="w-full"
                      >
                        <span>Plan this trip</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
