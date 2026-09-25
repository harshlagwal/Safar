import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { fetchSharedTrip } from '../services/api';
import { PlanResponse } from '../types/plan';
import { formatINR } from '../utils/format';
import { RouteTimeline } from '../components/RouteTimeline';
import { CostBreakdown } from '../components/CostBreakdown';
import { DayPlan } from '../components/DayPlan';
import { Button } from '../components/Button';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Share2,
  Loader2,
} from 'lucide-react';

export const Share: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentPlan, savedTrips } = useTrip();

  const [remotePlan, setRemotePlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local fallback from memory/localStorage
  const localPlan =
    savedTrips.find((t) => t.id === id || t.plan.shareId === id)?.plan ||
    (currentPlan?.tripId === id || currentPlan?.shareId === id ? currentPlan : null);

  useEffect(() => {
    if (localPlan) {
      setRemotePlan(localPlan);
      return;
    }

    if (id) {
      setLoading(true);
      setError(null);
      fetchSharedTrip(id)
        .then((plan) => {
          setRemotePlan(plan);
        })
        .catch((err) => {
          console.warn('Could not fetch shared trip:', err.message);
          setError(err.message || 'Shared trip not found');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, localPlan]);

  const matchedPlan = remotePlan || localPlan;

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-28 flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#000000]">
        <Loader2 className="w-8 h-8 text-[#ff6b35] animate-spin mb-4" />
        <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6]">Loading shared trip plan...</p>
      </div>
    );
  }

  if (error || !matchedPlan) {
    return (
      <div className="min-h-screen pt-32 pb-28 flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#000000] px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-500 flex items-center justify-center mb-4">
          <MapPin className="w-6 h-6" />
        </div>
        <h2 className="text-[22px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">Trip Not Found</h2>
        <p className="text-[14px] text-[#86868b] dark:text-[#a1a1a6] mt-1 mb-6 max-w-sm">
          This shared trip link might be invalid or has expired.
        </p>
        <Link to="/plan">
          <Button variant="primary">
            <span>Create your own trip plan</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>
    );
  }

  const originName =
    matchedPlan.request?.origin || matchedPlan.route?.[0]?.from || 'Origin';
  const destinationName =
    matchedPlan.request?.destination ||
    matchedPlan.route?.[matchedPlan.route.length - 1]?.to ||
    'Destination';
  const travellers = matchedPlan.request?.travellers || 1;
  const days = matchedPlan.request?.days || matchedPlan.dayPlan?.length || 3;

  return (
    <div className="min-h-screen pt-20 pb-28 bg-[#fafafa] dark:bg-[#000000]">
      <div className="max-w-[840px] mx-auto px-6 space-y-8">
        {/* Read-Only Header Badge as specified in PRD Section 5 F6 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1d1d1f] dark:bg-[#2c2c2e] border border-transparent dark:border-[#333336] text-white dark:text-[#f5f5f7] text-[13px] font-medium self-start">
            <Share2 className="w-3.5 h-3.5 text-[#ff6b35]" />
            <span>Shared Travel Plan</span>
          </div>

          <Link to="/plan">
            <Button size="sm" variant="primary">
              <span>Plan your own trip</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#86868b] dark:text-[#a1a1a6]">
            <span className="flex items-center gap-1 font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
              <MapPin className="w-3.5 h-3.5 text-[#ff6b35]" />
              {originName} ➔ {destinationName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {days} {days === 1 ? 'Day' : 'Days'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {travellers} {travellers === 1 ? 'Traveller' : 'Travellers'}
            </span>
          </div>

          <div>
            <h1 className="text-[32px] sm:text-[44px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">
              {destinationName}
            </h1>
            {matchedPlan.summary && (
              <p className="text-[17px] text-[#86868b] dark:text-[#a1a1a6] mt-2 leading-relaxed">
                {matchedPlan.summary}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[#e8e8ed] dark:border-[#333336] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {matchedPlan.modeRecommendation && (
              <div className="flex items-start sm:items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-full bg-[#f2f2f5] dark:bg-[#000000] border border-[#e8e8ed] dark:border-[#333336] text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff6b35]" />
                  <span>{matchedPlan.modeRecommendation.chosen}</span>
                </div>
                <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] leading-tight">
                  {matchedPlan.modeRecommendation.reason}
                </p>
              </div>
            )}

            {matchedPlan.perPersonCost && (
              <div className="sm:text-right shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] block">
                  Per Person Est.
                </span>
                <span className="text-[22px] font-bold text-[#ff6b35] tracking-tight tabular-nums">
                  {formatINR(matchedPlan.perPersonCost.min)} – {formatINR(matchedPlan.perPersonCost.max)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Route Timeline */}
        {matchedPlan.route && matchedPlan.route.length > 0 && (
          <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl p-6 sm:p-8 border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-4">
            <h2 className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#ff6b35]" />
              <span>Interstate Route Timeline</span>
            </h2>
            <RouteTimeline
              route={matchedPlan.route}
              originName={originName}
              destinationName={destinationName}
            />
          </div>
        )}

        {/* Cost Breakdown */}
        {matchedPlan.costs && matchedPlan.totalCost && (
          <CostBreakdown
            costs={matchedPlan.costs}
            totalCost={matchedPlan.totalCost}
            perPersonCost={matchedPlan.perPersonCost || { min: 0, max: 0 }}
            travellers={travellers}
          />
        )}

        {/* Day-by-Day Accordion */}
        {matchedPlan.dayPlan && matchedPlan.dayPlan.length > 0 && (
          <DayPlan dayPlan={matchedPlan.dayPlan} />
        )}

        {/* Checklist Read-Only List */}
        {matchedPlan.checklist && matchedPlan.checklist.length > 0 && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-3">
            <h3 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Recommended Packing Items
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px] text-[#48484a] dark:text-[#a1a1a6]">
              {matchedPlan.checklist.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-[#fafafa] dark:bg-[#000000] p-2.5 rounded-xl border border-[#e8e8ed]/60 dark:border-[#333336]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA to plan own trip */}
        <div className="p-8 rounded-2xl bg-[#1d1d1f] dark:bg-[#161617] border border-transparent dark:border-[#333336] text-white text-center space-y-4">
          <h3 className="text-[22px] font-bold">Inspired by this route?</h3>
          <p className="text-[15px] text-white/70 max-w-md mx-auto">
            Create your own customized travel plan with real routes, budget fit, and day-by-day guides.
          </p>
          <Link to="/plan">
            <Button size="lg" variant="primary">
              <span>Plan your trip</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
