import React from 'react';
import { motion } from 'motion/react';
import { LuggageType } from '../types/plan';
import { Backpack, Briefcase, Luggage, Check, Info } from 'lucide-react';

interface LuggageOption {
  id: LuggageType;
  title: string;
  weight: string;
  desc: string;
  icon: React.ReactNode;
}

const LUGGAGE_OPTIONS: LuggageOption[] = [
  {
    id: 'light',
    title: 'Light',
    weight: '< 7 kg',
    desc: 'Cabin backpack or daypack. Great for bikes and quick bus transfers.',
    icon: <Backpack className="w-5 h-5" />,
  },
  {
    id: 'medium',
    title: 'Medium',
    weight: '7 – 15 kg',
    desc: 'Standard trolley or duffel. Fits easily on trains, cabs & overhead bins.',
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: 'heavy',
    title: 'Heavy',
    weight: '> 15 kg',
    desc: 'Multi-bag setup or large suitcases. Ideal for self-drive cars & long vacations.',
    icon: <Luggage className="w-5 h-5" />,
  },
];

interface LuggageSelectorProps {
  id?: string;
  value: LuggageType;
  onChange: (val: LuggageType) => void;
}

export const LuggageSelector: React.FC<LuggageSelectorProps> = ({
  id = 'luggage-selector',
  value,
  onChange,
}) => {
  return (
    <div id={id} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {LUGGAGE_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              id={`${id}-${opt.id}`}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(opt.id)}
              className={`p-4 rounded-2xl text-left border cursor-pointer relative flex flex-col justify-between min-h-[120px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35] ${
                selected
                  ? 'bg-white dark:bg-[#1d1d1f] border-[#ff6b35] ring-2 ring-[#ff6b35]/20 shadow-md dark:shadow-none'
                  : 'bg-white dark:bg-[#1d1d1f] border-[#e8e8ed] dark:border-[#333336] hover:border-[#d1d1d6] dark:hover:border-[#48484a] apple-card-shadow'
              }`}
            >
              {selected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#ff6b35] text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selected ? 'bg-[#ff6b35]/10 text-[#ff6b35]' : 'bg-[#f2f2f5] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7]'
                  }`}
                >
                  {opt.icon}
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug">
                    {opt.title}
                  </h4>
                  <span className="text-[12px] font-medium text-[#ff6b35] bg-[#ff6b35]/10 px-2 py-0.5 rounded-full">
                    {opt.weight}
                  </span>
                </div>
              </div>

              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-3 leading-relaxed">
                {opt.desc}
              </p>
            </motion.button>
          );
        })}
      </div>

      <p className="text-[12px] text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1.5 pl-1">
        <Info className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6]" />
        <span>Luggage affects which transport we suggest.</span>
      </p>
    </div>
  );
};
