import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Users, Copy, Check, AlertCircle, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/format';
import { useToast } from '../context/ToastContext';

interface BudgetSplitProps {
  tripId?: string;
  totalCost?: { min: number; max: number };
  perPersonCost?: { min: number; max: number };
  travellers: number;
}

interface MemberSplit {
  name: string;
  amount: number;
}

export const BudgetSplit: React.FC<BudgetSplitProps> = ({
  tripId = 'default',
  totalCost,
  perPersonCost,
  travellers,
}) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'equal' | 'custom'>('equal');

  const count = Math.max(1, travellers || 1);
  const baseCost = perPersonCost?.min || (totalCost ? Math.round(totalCost.min / count) : 0);
  const totalTarget = totalCost?.min || baseCost * count;

  const storageKey = `safar-split-${tripId}`;

  // Initialize member list
  const [members, setMembers] = useState<MemberSplit[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === count) {
          return parsed;
        }
      }
    } catch {}

    return Array.from({ length: count }, (_, i) => ({
      name: `Traveller ${i + 1}`,
      amount: baseCost,
    }));
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(members));
    } catch {}
  }, [members, storageKey]);

  // Update member name
  const handleNameChange = (index: number, newName: string) => {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], name: newName };
      return next;
    });
  };

  // Update member custom amount
  const handleAmountChange = (index: number, newAmount: number) => {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], amount: Math.max(0, newAmount || 0) };
      return next;
    });
  };

  // Copy list to clipboard
  const handleCopyList = () => {
    const lines = members.map((m) => {
      const amt = mode === 'equal' ? baseCost : m.amount;
      return `${m.name}: ${formatINR(amt)}`;
    });
    const text = `💰 Safar Trip Split (${mode === 'equal' ? 'Equal' : 'Custom'}):\n${lines.join('\n')}`;

    navigator.clipboard.writeText(text).then(
      () => showToast('Split list copied ✓', 'success'),
      () => showToast('Split list copied', 'info')
    );
  };

  // Calculation for custom mode
  const currentTotal = members.reduce((sum, m) => sum + (m.amount || 0), 0);
  const difference = totalTarget - currentTotal;

  if (count <= 1) {
    return null; // Don't show split panel if solo traveler
  }

  return (
    <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow overflow-hidden mt-4">
      {/* Accordion Trigger Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left hover:bg-[#fafafa] dark:hover:bg-[#262629] transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#ff6b35]/10 text-[#ff6b35] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              Split the bill across {count} travellers
            </h3>
            <p className="text-[12px] text-[#86868b] dark:text-[#a1a1a6]">
              Equal share: <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{formatINR(baseCost)}</span> per person
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-[#86868b] dark:text-[#a1a1a6]"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="border-t border-[#e8e8ed] dark:border-[#333336] px-6 py-5 bg-[#fafafa] dark:bg-[#161617]"
          >
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="inline-flex p-1 rounded-xl bg-[#e8e8ed] dark:bg-[#2c2c2e] text-[13px] font-medium">
                <button
                  type="button"
                  onClick={() => setMode('equal')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'equal'
                      ? 'bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold'
                      : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                  }`}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    mode === 'custom'
                      ? 'bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7] shadow-xs font-semibold'
                      : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                  }`}
                >
                  Custom Amounts
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyList}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#ff6b35] hover:text-[#e45525] bg-[#ff6b35]/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy list</span>
              </button>
            </div>

            {/* EQUAL SPLIT MODE */}
            {mode === 'equal' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] block">
                      Each person pays
                    </span>
                    <span className="text-[24px] font-bold text-[#ff6b35] tracking-tight">
                      {formatINR(baseCost)}
                    </span>
                  </div>
                  <div className="text-right text-[12px] text-[#86868b] dark:text-[#a1a1a6]">
                    <span>Total pool: </span>
                    <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {formatINR(baseCost * count)}
                    </span>
                  </div>
                </div>

                {/* Member Names list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {members.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336]"
                    >
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={`Traveller ${idx + 1}`}
                        className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] bg-transparent outline-none flex-1 pr-2 placeholder-[#86868b] dark:placeholder-[#a1a1a6]/50"
                      />
                      <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] shrink-0">
                        {formatINR(baseCost)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOM SPLIT MODE */}
            {mode === 'custom' && (
              <div className="space-y-4">
                {/* Live Mismatch Status Indicator */}
                <div
                  className={`p-3.5 rounded-xl text-[13px] font-medium flex items-center gap-2 ${
                    difference === 0
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                      : difference > 0
                      ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                      : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                  }`}
                >
                  {difference === 0 ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Exact match! Poora budget barabar assign ho gaya.</span>
                    </>
                  ) : difference > 0 ? (
                    <>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formatINR(difference)} bacha hai — kisko add karna hai?</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formatINR(Math.abs(difference))} zyada ho gaya hai budget se.</span>
                    </>
                  )}
                </div>

                {/* Member Input Rows */}
                <div className="space-y-2">
                  {members.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336]"
                    >
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={`Traveller ${idx + 1}`}
                        className="text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] bg-transparent outline-none flex-1 placeholder-[#86868b] dark:placeholder-[#a1a1a6]/50"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[13px] font-medium text-[#86868b] dark:text-[#a1a1a6]">₹</span>
                        <input
                          type="number"
                          value={member.amount || ''}
                          onChange={(e) => handleAmountChange(idx, parseInt(e.target.value, 10) || 0)}
                          placeholder="0"
                          className="w-24 text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] text-right bg-[#f2f2f5] dark:bg-[#000000] border border-transparent dark:border-[#333336] px-2 py-1 rounded-lg outline-none focus:ring-1 focus:ring-[#ff6b35]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
