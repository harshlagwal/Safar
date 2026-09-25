import React from 'react';
import { CostItem, CostRange } from '../types/plan';
import { formatINR } from '../utils/format';
import { IndianRupee, Users, ExternalLink } from 'lucide-react';
import { detectBookingType, buildBookingLink } from '../utils/bookingLinks';
import { BudgetSplit } from './BudgetSplit';

interface CostBreakdownProps {
  costs: CostItem[];
  totalCost: CostRange;
  perPersonCost: CostRange;
  travellers?: number;
  origin?: string;
  destination?: string;
  modeChosen?: string;
  tripId?: string;
}

export const CostBreakdown: React.FC<CostBreakdownProps> = ({
  costs,
  totalCost,
  perPersonCost,
  travellers = 1,
  origin = '',
  destination = '',
  modeChosen = '',
  tripId = 'default',
}) => {
  if (!costs || costs.length === 0) return null;

  // Maximum cost among line items to scale range bars visually
  const maxLineCost = Math.max(...costs.map((c) => c.max), 1);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl p-6 border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e8ed] dark:border-[#333336]">
          <div>
            <h3 className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-[#ff6b35]" />
              <span>Budget & Cost Breakdown</span>
            </h3>
            <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
              Transparent estimates covering transport, accommodation, and essentials
            </p>
          </div>

          {travellers > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2f2f5] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-[#f5f5f7] text-[13px] font-medium self-start sm:self-auto">
              <Users className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6]" />
              <span>Split for {travellers} people</span>
            </div>
          )}
        </div>

        {/* Cost Line Items with Visual Range Bars & Booking Deep-Links */}
        <div className="space-y-4">
          {costs.map((item, idx) => {
            const barWidthPercent = Math.min(Math.max((item.max / maxLineCost) * 100, 15), 100);
            const bookingType = detectBookingType(item.item);
            const bookingLink = bookingType ? buildBookingLink(bookingType, origin, destination) : null;
            const isHighlighted =
              modeChosen && bookingType && modeChosen.toLowerCase().includes(bookingType.toLowerCase());

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex flex-wrap justify-between items-baseline gap-2 text-[14px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{item.item}</span>
                    {bookingLink && (
                      <a
                        href={bookingLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                          isHighlighted
                            ? 'bg-[#ff6b35]/10 text-[#ff6b35] border border-[#ff6b35]/40 font-semibold shadow-2xs hover:bg-[#ff6b35]/20'
                            : 'bg-[#f2f2f5] dark:bg-[#2c2c2e] text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-[#e8e8ed] dark:hover:bg-[#3a3a3c]'
                        }`}
                      >
                        <span>{bookingLink.label}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    )}
                  </div>
                  <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums">
                    {formatINR(item.min)} – {formatINR(item.max)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f2f2f5] dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-[#ff8c5a] to-[#ff6b35] rounded-full transition-all duration-500"
                    style={{ width: `${barWidthPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total and Per-Person Cost Callout */}
        <div className="p-4 rounded-xl bg-[#fafafa] dark:bg-[#2c2c2e] border border-[#e8e8ed] dark:border-[#333336] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6]">
              Estimated Total Cost
            </span>
            <div className="text-[24px] sm:text-[26px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight tabular-nums">
              {formatINR(totalCost.min)} – {formatINR(totalCost.max)}
            </div>
          </div>

          {travellers > 1 && (
            <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-[#e8e8ed] dark:border-[#333336]">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#ff6b35]">
                Per Person Share
              </span>
              <div className="text-[20px] sm:text-[22px] font-bold text-[#ff6b35] tracking-tight tabular-nums">
                {formatINR(perPersonCost.min)} – {formatINR(perPersonCost.max)}
                <span className="text-[13px] font-normal text-[#86868b] dark:text-[#a1a1a6] ml-1">/ person</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget Split Panel below cost breakdown */}
      {travellers > 1 && (
        <BudgetSplit
          tripId={tripId}
          totalCost={totalCost}
          perPersonCost={perPersonCost}
          travellers={travellers}
        />
      )}
    </div>
  );
};
