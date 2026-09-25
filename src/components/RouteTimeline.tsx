import React from 'react';
import { motion } from 'motion/react';
import { RouteHop } from '../types/plan';
import { MapPin, Navigation, Clock, ArrowRight } from 'lucide-react';

interface RouteTimelineProps {
  route: RouteHop[];
  originName?: string;
  destinationName?: string;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  route,
  originName,
  destinationName,
}) => {
  if (!route || route.length === 0) return null;

  return (
    <div className="relative py-2">
      {/* Origin Milestone */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-[#ff6b35] text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-[#ff6b35]/15">
          <MapPin className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#ff6b35]">
            Origin Point
          </span>
          <h4 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {originName || route[0]?.from || 'Start'}
          </h4>
        </div>
      </div>

      {/* Vertical Timeline Track & Hops */}
      <div className="relative pl-4 ml-4 space-y-6">
        {/* Animated Connector Line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute left-0 top-0 bottom-4 w-0.5 bg-gradient-to-b from-[#ff6b35] via-[#ff8c5a] to-[#34c759] origin-top"
        />

        {route.map((hop, index) => (
          <motion.div
            key={`hop-${index}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative pl-6"
          >
            {/* Hop Point Node */}
            <div className="absolute -left-[21px] top-4 w-3.5 h-3.5 rounded-full bg-white dark:bg-[#1d1d1f] border-2 border-[#ff6b35] shadow-xs" />

            {/* Hop Detail Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow hover:border-[#ff6b35]/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e8e8ed]/60 dark:border-[#333336]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {hop.from}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#86868b] dark:text-[#a1a1a6] shrink-0" />
                  <span className="text-[15px] font-semibold text-[#ff6b35]">
                    {hop.to}
                  </span>
                </div>

                <span className="text-[12px] font-medium text-[#86868b] dark:text-[#a1a1a6] bg-[#fafafa] dark:bg-[#2c2c2e] px-2.5 py-1 rounded-full border border-[#e8e8ed] dark:border-[#333336] self-start sm:self-auto">
                  {hop.state}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-3">
                <div className="flex items-center gap-1.5 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <Navigation className="w-3.5 h-3.5 text-[#ff6b35]" />
                  <span>{hop.km} km</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  <Clock className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6]" />
                  <span>~{hop.hours} hrs</span>
                </div>
              </div>

              {hop.note && (
                <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-2.5 leading-relaxed bg-[#fafafa] dark:bg-[#2c2c2e] p-2.5 rounded-xl border border-[#e8e8ed]/50 dark:border-[#333336]">
                  <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">Note:</strong> {hop.note}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Destination Milestone */}
      <div className="flex items-center gap-3 mt-6">
        <div className="w-8 h-8 rounded-full bg-[#34c759] text-white flex items-center justify-center shadow-sm shrink-0 ring-4 ring-[#34c759]/15">
          <MapPin className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#34c759]">
            Destination Arrival
          </span>
          <h4 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            {destinationName || route[route.length - 1]?.to || 'Destination'}
          </h4>
        </div>
      </div>
    </div>
  );
};
