import React from 'react';
import { motion } from 'motion/react';

export interface Option<T extends string> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  id?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  id = 'segmented-control',
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      id={id}
      className={`inline-flex p-1 bg-[#f2f2f5] dark:bg-[#1d1d1f] rounded-full border border-[#e8e8ed] dark:border-[#333336] relative select-none w-full max-w-lg ${className}`}
      role="radiogroup"
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            id={`${id}-${opt.value}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 flex-1 py-2 px-3 text-[14px] sm:text-[15px] font-medium transition-colors duration-200 flex items-center justify-center gap-1.5 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35] ${
              isSelected ? 'text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold' : 'text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={`segment-pill-${id}`}
                className="absolute inset-0 bg-white dark:bg-[#2c2c2e] rounded-full shadow-xs border border-black/5 dark:border-white/10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
              {opt.icon && <span>{opt.icon}</span>}
              <span>{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
