import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DayPlanItem } from '../types/plan';
import { Calendar, ChevronDown } from 'lucide-react';

interface DayPlanProps {
  dayPlan: DayPlanItem[];
}

export const DayPlan: React.FC<DayPlanProps> = ({ dayPlan }) => {
  // Open Day 1 by default
  const [openDays, setOpenDays] = useState<number[]>([1]);

  if (!dayPlan || dayPlan.length === 0) return null;

  const toggleDay = (day: number) => {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const expandAll = () => {
    setOpenDays(dayPlan.map((d) => d.day));
  };

  const collapseAll = () => {
    setOpenDays([]);
  };

  return (
    <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl p-6 border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed] dark:border-[#333336]">
        <div>
          <h3 className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#ff6b35]" />
            <span>Day-by-Day Itinerary</span>
          </h3>
          <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
            Carefully paced daily schedule optimized for Indian transit
          </p>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-medium text-[#86868b] dark:text-[#a1a1a6]">
          <button
            type="button"
            onClick={expandAll}
            className="hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors cursor-pointer"
          >
            Expand all
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors cursor-pointer"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Accordion list */}
      <div className="space-y-3 pt-2">
        {dayPlan.map((item) => {
          const isOpen = openDays.includes(item.day);
          return (
            <div
              key={item.day}
              className={`rounded-xl border transition-colors overflow-hidden ${
                isOpen
                  ? 'border-[#ff6b35]/40 bg-[#fafafa]/50 dark:bg-[#2c2c2e]/40'
                  : 'border-[#e8e8ed] dark:border-[#333336] bg-white dark:bg-[#1d1d1f]'
              }`}
            >
              <button
                type="button"
                id={`day-accordion-btn-${item.day}`}
                onClick={() => toggleDay(item.day)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer focus:outline-none focus-visible:bg-[#fafafa] dark:focus-visible:bg-[#2c2c2e]"
              >
                <div className="flex items-center gap-3 pr-2">
                  <span className="w-7 h-7 rounded-full bg-[#1d1d1f] dark:bg-[#ff6b35] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                    D{item.day}
                  </span>
                  <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {item.title}
                  </span>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#86868b] dark:text-[#a1a1a6] shrink-0"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 text-[14px] text-[#48484a] dark:text-[#a1a1a6] leading-relaxed border-t border-[#e8e8ed]/60 dark:border-[#333336]">
                      <p>{item.details}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
