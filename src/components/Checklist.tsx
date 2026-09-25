import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, ListChecks } from 'lucide-react';

interface ChecklistProps {
  tripId: string;
  checklist: string[];
  checkedItems: string[];
  onToggle: (tripId: string, item: string) => void;
}

export const Checklist: React.FC<ChecklistProps> = ({
  tripId,
  checklist,
  checkedItems,
  onToggle,
}) => {
  if (!checklist || checklist.length === 0) return null;

  const completedCount = checklist.filter((item) => checkedItems.includes(item)).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl p-6 border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e8e8ed] dark:border-[#333336]">
        <div>
          <h3 className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-[#ff6b35]" />
            <span>Essential Travel Checklist</span>
          </h3>
          <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
            Tap items as you pack — progress saves automatically
          </p>
        </div>

        {/* Progress status */}
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#86868b] dark:text-[#a1a1a6]">
          <div className="w-24 h-2 bg-[#f2f2f5] dark:bg-[#000000] border border-transparent dark:border-[#333336] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#34c759] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="tabular-nums font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {completedCount}/{checklist.length} packed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {checklist.map((item, idx) => {
          const isDone = checkedItems.includes(item);
          return (
            <motion.button
              key={idx}
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={() => onToggle(tripId, item)}
              id={`checklist-item-${idx}`}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35] ${
                isDone
                  ? 'bg-[#fafafa] dark:bg-[#161617] border-[#e8e8ed] dark:border-[#333336] text-[#86868b] dark:text-[#a1a1a6]'
                  : 'bg-white dark:bg-[#1d1d1f] border-[#e8e8ed] dark:border-[#333336] text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-[#ff6b35]/40 hover:bg-[#fafafa]/40 dark:hover:bg-[#2c2c2e]/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-[#34c759] fill-[#34c759]/10" />
                ) : (
                  <Circle className="w-5 h-5 text-[#d1d1d6] dark:text-[#555558] hover:text-[#ff6b35] transition-colors" />
                )}
              </div>

              <span
                className={`text-[14px] leading-snug transition-all ${
                  isDone ? 'line-through opacity-60' : 'font-medium'
                }`}
              >
                {item}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
