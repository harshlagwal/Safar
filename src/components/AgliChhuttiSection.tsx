import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { getNextUpcomingBreak } from '../data/holidays';
import { CURATED_DESTINATIONS, Destination } from '../data/destinations';
import { Button } from './Button';

export const AgliChhuttiSection: React.FC = () => {
  const navigate = useNavigate();

  const breakInfo = useMemo(() => {
    return getNextUpcomingBreak();
  }, []);

  // Filter 5 matching destination getaways suitable for this long-weekend length
  const recommendedDestinations = useMemo(() => {
    // Pick destinations with min budget <= 6000 or suitable for quick 3-4 day breaks
    const getaways = CURATED_DESTINATIONS.filter((d) => {
      // Best for 3-4 day breaks: hill stations, cultural cities, weekend beaches
      return d.budgetBand[0] <= 6000;
    });

    return getaways.slice(0, 5);
  }, []);

  const handlePlanDestination = (dest: Destination) => {
    const avgBudget = Math.round((dest.budgetBand[0] + dest.budgetBand[1]) / 2);
    navigate(
      `/plan?destination=${encodeURIComponent(dest.name)}&days=${breakInfo.breakDays}&budget=${avgBudget}`
    );
  };

  const formattedDate = useMemo(() => {
    try {
      const d = new Date(breakInfo.holiday.date);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return breakInfo.holiday.date;
    }
  }, [breakInfo.holiday.date]);

  return (
    <section className="py-16 sm:py-20 border-t border-[#e8e8ed] dark:border-[#333336] bg-[#fafafa] dark:bg-[#000000]">
      <div className="max-w-[1200px] mx-auto px-6 space-y-10">
        {/* Banner Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ff6b35]/10 text-[#ff6b35] text-[12.5px] font-semibold tracking-wide">
              <Calendar className="w-3.5 h-3.5" />
              <span>AGLI CHHUTTI DETECTOR 📅</span>
            </div>

            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-[#0c0c0e] dark:text-[#f5f5f7] tracking-tight">
              Agli chhutti:{' '}
              <span className="text-[#ea580c] dark:text-[#ff6b35] underline decoration-[#ea580c]/30 underline-offset-4">
                {breakInfo.holiday.name}
              </span>
              {' '}— {breakInfo.breakDays} din ka break
            </h2>

            <p className="text-[15px] sm:text-[16px] text-[#374151] dark:text-[#d1d5db] font-medium max-w-2xl leading-relaxed">
              {formattedDate} ({breakInfo.holiday.day}) • {breakInfo.tagline} {breakInfo.breakDays} din aur budget ke hisaab se ye 5 shandaar trips turant plan ho sakti hain:
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/plan?days=${breakInfo.breakDays}`)}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#ff6b35] hover:text-[#e45525] transition-colors self-start md:self-auto cursor-pointer"
          >
            <span>Custom plan banayein</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Destination Cards Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {recommendedDestinations.map((dest, idx) => {
            const minBudget = dest.budgetBand[0];

            return (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="p-5 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow flex flex-col justify-between group hover:border-[#ff6b35]/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="capitalize text-[11px] font-semibold text-[#ff6b35] bg-[#ff6b35]/10 px-2 py-0.5 rounded-full">
                      {dest.vibe}
                    </span>
                    <span className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{breakInfo.breakDays} Din</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[18px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight group-hover:text-[#ff6b35] transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-[12px] text-[#86868b] dark:text-[#a1a1a6] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#ff6b35]" />
                      <span>{dest.state}</span>
                    </p>
                  </div>

                  <p className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6] line-clamp-2 leading-relaxed">
                    {dest.tagline}
                  </p>

                  <div className="pt-1">
                    <span className="text-[12px] text-[#86868b] dark:text-[#a1a1a6]">
                      Starting from{' '}
                      <strong className="text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold">
                        ₹{minBudget.toLocaleString('en-IN')}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#f2f2f5] dark:border-[#2c2c2e]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlanDestination(dest)}
                    className="w-full text-[13px]"
                  >
                    <span>Plan karo</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
