import React, { useState } from 'react';
import { formatINR, getBudgetTierLabel } from '../utils/format';
import { Sparkles, Coins } from 'lucide-react';

interface BudgetSliderProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const BudgetSlider: React.FC<BudgetSliderProps> = ({
  id = 'budget-slider',
  value,
  onChange,
  min = 500,
  max = 100000,
  step = 500,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const tier = getBudgetTierLabel(value);

  // Calculate percentage for gradient track
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  return (
    <div id={id} className="w-full bg-white dark:bg-[#1d1d1f] p-6 rounded-2xl border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow">
      {/* Header: Budget Display */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <span className="text-[13px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#ff6b35]" /> Estimated Budget
          </span>
          <p className="text-[32px] sm:text-[36px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
            {formatINR(value)}
          </p>
        </div>

        {/* Dynamic Tier Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fafafa] dark:bg-[#2c2c2e] border border-[#e8e8ed] dark:border-[#333336] self-start sm:self-auto">
          <span
            className={`w-2 h-2 rounded-full ${
              value < 3000
                ? 'bg-amber-500'
                : value <= 15000
                ? 'bg-emerald-500'
                : value <= 40000
                ? 'bg-indigo-500'
                : 'bg-[#ff6b35]'
            }`}
          />
          <span className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{tier.label}</span>
        </div>
      </div>

      {/* Slider Input */}
      <div className="relative py-3">
        <input
          type="range"
          id={`${id}-input`}
          min={min}
          max={max}
          step={step}
          value={value}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2.5 bg-[#f2f2f5] dark:bg-[#2c2c2e] rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-150"
          style={{
            background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${percentage}%, var(--border, #e8e8ed) ${percentage}%, var(--border, #e8e8ed) 100%)`,
          }}
        />

        <style>{`
          #${id}-input::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #ff6b35;
            box-shadow: ${isDragging ? '0 0 0 8px rgba(255, 107, 53, 0.25)' : '0 2px 8px rgba(0,0,0,0.15)'};
            cursor: grab;
            transition: box-shadow 0.2s ease, transform 0.1s ease;
          }
          #${id}-input::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(1.08);
          }
          #${id}-input::-moz-range-thumb {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #ff6b35;
            box-shadow: ${isDragging ? '0 0 0 8px rgba(255, 107, 53, 0.25)' : '0 2px 8px rgba(0,0,0,0.15)'};
            cursor: grab;
            transition: box-shadow 0.2s ease, transform 0.1s ease;
          }
        `}</style>
      </div>

      {/* Range Min & Max indicators */}
      <div className="flex justify-between text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1 font-medium">
        <span>₹500 (Thrift)</span>
        <span>₹50,000</span>
        <span>₹1,00,000 (Luxury)</span>
      </div>

      {/* Dynamic Sub-caption / Insight */}
      <div className="mt-4 p-3 bg-[#fafafa] dark:bg-[#2c2c2e] rounded-xl border border-[#e8e8ed]/80 dark:border-[#333336] flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#ff6b35] mt-0.5 shrink-0" />
        <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
          <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">{tier.label}:</strong> {tier.description}
        </p>
      </div>
    </div>
  );
};
