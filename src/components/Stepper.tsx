import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface StepperProps {
  id?: string;
  label?: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({
  id = 'stepper',
  label,
  sublabel,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}) => {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1d1d1f] rounded-2xl border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow">
      <div>
        {label && <p className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{label}</p>}
        {sublabel && <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">{sublabel}</p>}
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          id={`${id}-decrease`}
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label || 'value'}`}
          className="w-10 h-10 rounded-full border border-[#e8e8ed] dark:border-[#333336] bg-[#fafafa] dark:bg-[#2c2c2e] hover:bg-[#f2f2f5] dark:hover:bg-[#3a3a3c] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]"
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </motion.button>

        <div className="min-w-[60px] text-center">
          <span className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
            {value}
          </span>
          {unit && <span className="text-[14px] text-[#86868b] dark:text-[#a1a1a6] ml-1">{unit}</span>}
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          id={`${id}-increase`}
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Increase ${label || 'value'}`}
          className="w-10 h-10 rounded-full border border-[#e8e8ed] dark:border-[#333336] bg-[#fafafa] dark:bg-[#2c2c2e] hover:bg-[#f2f2f5] dark:hover:bg-[#3a3a3c] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
};
