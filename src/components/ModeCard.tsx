import React from 'react';
import { motion } from 'motion/react';
import { Bus, Train, Bike, Car, Plane, Sparkles, Check } from 'lucide-react';
import { TransportMode } from '../types/plan';

export interface TransportOption {
  id: TransportMode;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  emoji: string;
}

export const TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'bus',
    label: 'Bus',
    sublabel: 'Overnight Volvo & sleeper',
    icon: <Bus className="w-5 h-5" />,
    emoji: '🚌',
  },
  {
    id: 'train',
    label: 'Train',
    sublabel: 'Vande Bharat, Rajdhani, Express',
    icon: <Train className="w-5 h-5" />,
    emoji: '🚆',
  },
  {
    id: 'bike',
    label: 'Bike',
    sublabel: 'Royal Enfield & ghat touring',
    icon: <Bike className="w-5 h-5" />,
    emoji: '🏍️',
  },
  {
    id: 'car',
    label: 'Car',
    sublabel: 'Self-drive SUV or outstation cab',
    icon: <Car className="w-5 h-5" />,
    emoji: '🚗',
  },
  {
    id: 'flight',
    label: 'Flight',
    sublabel: 'Fast direct connections',
    icon: <Plane className="w-5 h-5" />,
    emoji: '✈️',
  },
  {
    id: 'ai',
    label: 'AI decides',
    sublabel: 'Optimal balance of time & budget',
    icon: <Sparkles className="w-5 h-5 text-[#ff6b35]" />,
    emoji: '✨',
  },
];

interface ModeCardProps {
  option: TransportOption;
  selected?: boolean;
  onSelect: (mode: TransportMode) => void;
}

export const ModeCard: React.FC<ModeCardProps> = ({ option, selected, onSelect }) => {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3, transition: { duration: 0.18, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(option.id)}
      id={`mode-card-${option.id}`}
      className={`relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer w-full flex flex-col justify-between min-h-[105px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35] ${
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

      <div className="flex items-center gap-2.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            selected ? 'bg-[#ff6b35]/10 text-[#ff6b35]' : 'bg-[#f2f2f5] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7]'
          }`}
        >
          {option.icon}
        </div>
        <span className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
          {option.label}
        </span>
      </div>

      <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-2 leading-tight">
        {option.sublabel}
      </p>
    </motion.button>
  );
};
