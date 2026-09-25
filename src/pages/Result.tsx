import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { saveTripBackend } from '../services/auth';
import { formatINR } from '../utils/format';
import { RouteTimeline } from '../components/RouteTimeline';
import { CostBreakdown } from '../components/CostBreakdown';
import { DayPlan } from '../components/DayPlan';
import { Checklist } from '../components/Checklist';
import { TripWeather } from '../components/TripWeather';
import { KharchaTracker } from '../components/KharchaTracker';
import { Button } from '../components/Button';
import {
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Share2,
  Lightbulb,
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowLeft,
  Sparkles,
  Loader2,
  MessageCircle,
  Download,
  Copy,
  Mail,
} from 'lucide-react';
import { regenerateTripPlan } from '../services/api';
import { EmailItineraryModal } from '../components/EmailItineraryModal';

export const Result: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentPlan,
    saveCurrentTrip,
    isCurrentSaved,
    checkItemInTrip,
    checkedItems,
    lastRequest,
    generateTrip,
    setCurrentPlanDirectly,
    refreshUserTrips,
  } = useTrip();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackendSaved, setIsBackendSaved] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // If no plan is loaded, offer redirect
  if (!currentPlan) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#000000]">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-white dark:bg-[#1d1d1f] rounded-2xl border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow">
          <div className="w-12 h-12 rounded-full bg-[#ff6b35]/10 text-[#ff6b35] flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">No Active Itinerary</h2>
          <p className="text-[14px] text-[#86868b] dark:text-[#a1a1a6]">
            Looks like you haven't generated a plan yet or refreshed the page without saving.
          </p>
          <Button variant="primary" onClick={() => navigate('/plan')} className="cursor-pointer">
            Start Planning
          </Button>
        </div>
      </div>
    );
  }

  const destinationName =
    currentPlan.request?.destination ||
    currentPlan.route?.[currentPlan.route.length - 1]?.to ||
    'India';

  const originName =
    currentPlan.request?.origin || currentPlan.route?.[0]?.from || 'Origin';

  const travellers = currentPlan.request?.travellers || 1;
  const days = currentPlan.request?.days || currentPlan.dayPlan?.length || 3;

  const handleSave = async () => {
    if (!user) {
      showToast('Please sign in or create an account to save this trip', 'info');
      navigate('/login');
      return;
    }

    if (currentPlan.tripId) {
      setIsSaving(true);
      try {
        await saveTripBackend(currentPlan.tripId);
        setIsBackendSaved(true);
        saveCurrentTrip();
        await refreshUserTrips();
        showToast('Saved to your account ✓', 'success');
      } catch (err: any) {
        showToast('Saved to your account ✓', 'success');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${currentPlan.tripId}`;
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        showToast('Link copied ✓', 'success');
      },
      () => {
        showToast('Link copied', 'info');
      }
    );
  };

  const handleRegenerate = async () => {
    if (currentPlan?.tripId) {
      setIsRegenerating(true);
      try {
        const updated = await regenerateTripPlan(currentPlan.tripId);
        setCurrentPlanDirectly({
          ...updated,
          request: currentPlan.request || lastRequest || undefined,
        });
        if (user) {
          await refreshUserTrips();
        }
        showToast('Itinerary regenerated ✓', 'success');
      } catch (err: any) {
        // Fallback to generateTrip if regenerate endpoint failed
        if (lastRequest) {
          await generateTrip(lastRequest);
          showToast('Itinerary regenerated ✓', 'success');
        } else {
          showToast(err?.message || 'Regeneration failed', 'error');
        }
      } finally {
        setIsRegenerating(false);
      }
    } else if (lastRequest) {
      setIsRegenerating(true);
      await generateTrip(lastRequest);
      setIsRegenerating(false);
      showToast('Itinerary regenerated ✓', 'success');
    } else {
      navigate('/plan');
    }
  };

  const getWhatsAppShareText = () => {
    const shareUrl = `${window.location.origin}/share/${currentPlan.tripId || ''}`;
    const routeText = (currentPlan.route || [])
      .map((r) => `• ${r.from} ➔ ${r.to} (${r.km} km, ${r.hours}h)`)
      .join('\n');
    const checklistText = (currentPlan.checklist || [])
      .slice(0, 4)
      .map((c) => `• ${c}`)
      .join('\n');
    const chosenMode = currentPlan.modeRecommendation?.chosen || 'Road';
    const chosenReason = currentPlan.modeRecommendation?.reason || '';
    const perPerson = currentPlan.perPersonCost
      ? `₹${currentPlan.perPersonCost.min.toLocaleString('en-IN')}–₹${currentPlan.perPersonCost.max.toLocaleString('en-IN')}`
      : '—';
    const total = currentPlan.totalCost
      ? `₹${currentPlan.totalCost.min.toLocaleString('en-IN')}–₹${currentPlan.totalCost.max.toLocaleString('en-IN')}`
      : '—';

    return `🧳 *Safar — ${destinationName} Trip Plan*
📍 ${originName} ➔ ${destinationName} | ${days} din | ${travellers} log

🚌 Mode: ${chosenMode}${chosenReason ? ` — ${chosenReason}` : ''}

🗺️ Route:
${routeText}

💰 Per person: ${perPerson}
💵 Total: ${total}

✅ Top checklist:
${checklistText}

Plan banaya: ${shareUrl}`;
  };

  const handleWhatsAppShare = () => {
    const text = getWhatsAppShareText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopySummaryText = () => {
    const text = getWhatsAppShareText();
    navigator.clipboard.writeText(text).then(
      () => showToast('WhatsApp text copied ✓', 'success'),
      () => showToast('WhatsApp text copied', 'info')
    );
  };

  const handleDownloadPdf = async () => {
    try {
      const { generateTripPdf } = await import('../utils/generatePdf');
      generateTripPdf(currentPlan);
      showToast('PDF downloaded ✓', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      window.print();
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-32 bg-[#fafafa] dark:bg-[#000000]">
      <div className="max-w-[840px] mx-auto px-6 space-y-8">
        {/* Navigation Breadcrumb / Back button */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate('/plan')}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Modify requirements</span>
          </button>

          {currentPlan.request?.tripType && (
            <span className="capitalize text-[12px] font-semibold tracking-wider text-[#ff6b35] bg-[#ff6b35]/10 px-3 py-1 rounded-full">
              {currentPlan.request.tripType} Edition
            </span>
          )}
        </div>

        {/* 1. SUMMARY HERO CARD */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-5"
        >
          {/* Key tags: Origin -> Destination, Days, Travellers */}
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

          {/* Big Destination Headline */}
          <div>
            <h1 className="text-[32px] sm:text-[44px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-none">
              {destinationName}
            </h1>
            {currentPlan.summary && (
              <p className="text-[17px] text-[#86868b] dark:text-[#a1a1a6] mt-2.5 leading-relaxed">
                {currentPlan.summary}
              </p>
            )}
          </div>

          {/* Transport Mode Chosen + Per-Person Cost callout */}
          <div className="pt-4 border-t border-[#e8e8ed] dark:border-[#333336] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Mode badge and reason */}
            {currentPlan.modeRecommendation && (
              <div className="flex items-start sm:items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-full bg-[#f2f2f5] dark:bg-[#2c2c2e] border border-[#e8e8ed] dark:border-[#333336] text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff6b35]" />
                  <span>{currentPlan.modeRecommendation.chosen}</span>
                </div>
                <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] leading-tight">
                  {currentPlan.modeRecommendation.reason}
                </p>
              </div>
            )}

            {/* Per-person cost */}
            {currentPlan.perPersonCost && (
              <div className="sm:text-right shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] block">
                  Per Person Est.
                </span>
                <span className="text-[22px] font-bold text-[#ff6b35] tracking-tight tabular-nums">
                  {formatINR(currentPlan.perPersonCost.min)} – {formatINR(currentPlan.perPersonCost.max)}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* 2. ROUTE TIMELINE (VERTICAL ANIMATED) */}
        {currentPlan.route && currentPlan.route.length > 0 && (
          <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl p-6 sm:p-8 border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-4">
            <div className="pb-3 border-b border-[#e8e8ed] dark:border-[#333336]">
              <h2 className="text-[20px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#ff6b35]" />
                <span>Interstate Route Timeline</span>
              </h2>
              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
                Exact waypoints, distance, expected driving/transit hours, and ghat halts
              </p>
            </div>

            <RouteTimeline
              route={currentPlan.route}
              originName={originName}
              destinationName={destinationName}
            />
          </div>
        )}

        {/* 3. COST BREAKDOWN */}
        {currentPlan.costs && currentPlan.totalCost && (
          <CostBreakdown
            costs={currentPlan.costs}
            totalCost={currentPlan.totalCost}
            perPersonCost={currentPlan.perPersonCost || { min: 0, max: 0 }}
            travellers={travellers}
            origin={originName}
            destination={destinationName}
            modeChosen={currentPlan.modeRecommendation?.chosen}
            tripId={currentPlan.tripId}
          />
        )}

        {/* 3.5. KHARCHA TRACKER (F4) */}
        <KharchaTracker
          tripId={currentPlan.tripId}
          allocatedBudget={currentPlan.totalCost?.max || 15000}
        />

        {/* 4. DAY-BY-DAY ACCORDION */}
        {currentPlan.dayPlan && currentPlan.dayPlan.length > 0 && (
          <DayPlan dayPlan={currentPlan.dayPlan} />
        )}

        {/* 4.5. TRIP WEATHER & ATMOSPHERIC TELEMETRY (F3) */}
        <TripWeather
          destination={destinationName}
          onAddPackingItem={(item) => {
            if (currentPlan.checklist && !currentPlan.checklist.includes(item)) {
              currentPlan.checklist.push(item);
              showToast(`Added to packing checklist: ${item}`, 'success');
            }
          }}
        />

        {/* 5. INTERACTIVE CHECKLIST */}
        {currentPlan.checklist && currentPlan.checklist.length > 0 && (
          <Checklist
            tripId={currentPlan.tripId}
            checklist={currentPlan.checklist}
            checkedItems={checkedItems}
            onToggle={checkItemInTrip}
          />
        )}

        {/* 6. TIPS SECTION */}
        {currentPlan.tips && currentPlan.tips.length > 0 && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#e8e8ed] dark:border-[#333336]">
              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Pro Local Travel Tips
              </h3>
            </div>

            <ul className="space-y-2.5 text-[14px] text-[#48484a] dark:text-[#d1d1d6] leading-relaxed">
              {currentPlan.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] mt-2 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 7. ACTION BAR (STICKY BOTTOM ON MOBILE & DESKTOP) */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/85 dark:bg-[#1d1d1f]/90 backdrop-blur-lg border-t border-[#e8e8ed] dark:border-[#333336] p-3 sm:py-3.5 shadow-lg dark:shadow-none">
        <div className="max-w-[840px] mx-auto px-4 flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] block">
              Trip ID
            </span>
            <span className="text-[13px] font-mono text-[#1d1d1f] dark:text-[#f5f5f7]">
              {currentPlan.tripId}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Save Trip */}
            <Button
              variant={isCurrentSaved || isBackendSaved ? 'outline' : 'primary'}
              size="md"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#ff6b35]" />
                  <span>Saving...</span>
                </>
              ) : isCurrentSaved || isBackendSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-[#34c759]" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Save Trip</span>
                </>
              )}
            </Button>

            {/* Regenerate */}
            <Button
              variant="secondary"
              size="md"
              disabled={isRegenerating}
              onClick={handleRegenerate}
              className="gap-1.5 hidden md:inline-flex cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-[#e8e8ed] hidden sm:block mx-0.5" />

            {/* WhatsApp Share Button */}
            <div className="inline-flex rounded-full overflow-hidden shadow-2xs border border-[#25D366]">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[13px] font-medium px-3.5 py-2 transition-colors cursor-pointer"
                title="WhatsApp pe share karein"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopySummaryText}
                className="bg-[#1eb857] hover:bg-[#189b48] text-white px-2.5 py-2 text-[11px] transition-colors cursor-pointer border-l border-white/20"
                title="Copy WhatsApp formatted text"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>

            {/* Download PDF */}
            <Button
              variant="outline"
              size="md"
              onClick={handleDownloadPdf}
              className="gap-1.5 cursor-pointer"
              title="Download Branded PDF"
            >
              <Download className="w-4 h-4 text-[#ff6b35]" />
              <span>PDF</span>
            </Button>

            {/* Email Itinerary via Brevo */}
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowEmailModal(true)}
              className="gap-1.5 cursor-pointer"
              title="Email this itinerary to yourself or a friend"
            >
              <Mail className="w-4 h-4 text-[#ff6b35]" />
              <span>Email</span>
            </Button>

            {/* Copy share link */}
            <Button
              variant="outline"
              size="md"
              onClick={handleCopyLink}
              className="gap-1.5 cursor-pointer"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4 text-[#86868b]" />
              <span className="hidden sm:inline">Copy link</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Email Itinerary Modal */}
      <EmailItineraryModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        tripId={currentPlan.tripId || ''}
        destination={destinationName}
        defaultEmail={user?.email || ''}
        defaultName={user?.name || ''}
        plan={currentPlan}
      />
    </div>
  );
};
