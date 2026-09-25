import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  TripType,
  LuggageType,
  TransportMode,
  PlanRequest,
} from '../types/plan';
import { useTrip } from '../context/TripContext';
import { INDIAN_CITIES } from '../data/cities';
import { Destination } from '../data/destinations';
import { SegmentedControl, Option } from '../components/SegmentedControl';
import { Input } from '../components/Input';
import { Stepper } from '../components/Stepper';
import { LuggageSelector } from '../components/LuggageSelector';
import { BudgetSlider } from '../components/BudgetSlider';
import { ModeCard, TRANSPORT_OPTIONS } from '../components/ModeCard';
import { Button } from '../components/Button';
import { getStoredGeminiApiKey, getStoredOpenRouterApiKey } from '../services/api';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { SurpriseMeModal } from '../components/SurpriseMeModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  MapPin,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  Briefcase,
  Dices,
} from 'lucide-react';

export const Plan: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setLastRequest } = useTrip();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [tripType, setTripType] = useState<TripType>('friends');
  const [origin, setOrigin] = useState<string>('Delhi');
  const [destination, setDestination] = useState<string>('Manali');
  const [days, setDays] = useState<number>(3);
  const [travellers, setTravellers] = useState<number>(4);
  const [luggage, setLuggage] = useState<LuggageType>('light');
  const [budget, setBudget] = useState<number>(12000);
  const [transportMode, setTransportMode] = useState<TransportMode>('bus');

  // Surprise Me Modal state
  const [surpriseModalOpen, setSurpriseModalOpen] = useState(false);

  // Sync URL search params if arriving from Agli Chhutti or Collections
  useEffect(() => {
    const qDest = searchParams.get('destination');
    const qDays = searchParams.get('days');
    const qBudget = searchParams.get('budget');
    const qOrigin = searchParams.get('origin');
    if (qDest) setDestination(qDest);
    if (qDays && !isNaN(Number(qDays))) setDays(Math.max(1, Number(qDays)));
    if (qBudget && !isNaN(Number(qBudget))) setBudget(Math.max(1000, Number(qBudget)));
    if (qOrigin) setOrigin(qOrigin);
  }, [searchParams]);

  // API Key modal prompt state
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<PlanRequest | null>(null);

  // Validation errors & shake state
  const [errors, setErrors] = useState<{ origin?: string; destination?: string; general?: string }>({});
  const [shake, setShake] = useState(false);

  const tripTypeOptions: Option<TripType>[] = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'friends', label: 'Friends Trip' },
    { value: 'college', label: 'College Trip' },
  ];

  const cityOptions = useMemo(
    () =>
      INDIAN_CITIES.map((c) => (
        <option key={c.name} value={c.name}>
          {c.state}
        </option>
      )),
    []
  );

  // Calculate completion progress for sticky top bar
  const calculateProgress = (): number => {
    let completed = 0;
    if (tripType) completed++;
    if (origin.trim()) completed++;
    if (destination.trim() && destination.trim().toLowerCase() !== origin.trim().toLowerCase()) completed++;
    if (days >= 1) completed++;
    if (travellers >= 1) completed++;
    if (luggage) completed++;
    if (budget >= 500) completed++;
    if (transportMode) completed++;
    return Math.round((completed / 8) * 100);
  };

  const validate = (): boolean => {
    const newErrors: { origin?: string; destination?: string; general?: string } = {};

    if (!origin.trim()) {
      newErrors.origin = 'Origin city is required';
    }

    if (!destination.trim()) {
      newErrors.destination = 'Destination is required';
    } else if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      newErrors.destination = 'Destination must be different from origin city';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    const request: PlanRequest = {
      tripType,
      origin: origin.trim(),
      destination: destination.trim(),
      days,
      travellers,
      luggage,
      budget,
      transportMode,
    };

    // Step 1: User MUST be signed in (Strict Policy)
    if (!user) {
      showToast('Please sign in or create an account to plan your journey', 'info');
      setLastRequest(request);
      navigate('/login', { state: { from: { pathname: '/plan' } } });
      return;
    }

    // Step 2: Logged-in user must provide their Gemini or OpenRouter API key
    const hasKey = !!getStoredGeminiApiKey() || !!getStoredOpenRouterApiKey();
    if (!hasKey) {
      setPendingRequest(request);
      setApiKeyModalOpen(true);
      return;
    }

    setLastRequest(request);
    navigate('/generating');
  };

  const handleApiKeySuccess = (provider?: 'gemini' | 'openrouter') => {
    if (provider === 'openrouter') {
      showToast('OpenRouter API Key saved ✓', 'success');
    } else {
      showToast('Google Gemini API Key saved ✓', 'success');
    }
    if (pendingRequest) {
      setLastRequest(pendingRequest);
      navigate('/generating');
    }
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen pt-20 pb-28 bg-[#fafafa] dark:bg-[#000000]">
      {/* Sticky Progress Bar at the top */}
      <div className="fixed top-16 inset-x-0 z-30 bg-[#fafafa]/90 dark:bg-[#161617]/90 backdrop-blur-md border-b border-[#e8e8ed] dark:border-[#333336] px-6 py-2.5">
        <div className="max-w-[760px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
            <Compass className="w-4 h-4 text-[#ff6b35]" />
            <span>Trip Plan Builder</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium text-[#86868b] dark:text-[#a1a1a6] tabular-nums">
              {progress}% Ready
            </span>
            <div className="w-24 sm:w-36 h-2 bg-[#e8e8ed] dark:bg-[#333336] rounded-full overflow-hidden">
              <motion.div
                className="w-full h-full bg-[#ff6b35] rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Single-Column Apple-style form */}
      <div className="max-w-[760px] mx-auto px-6 pt-8">
        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Header */}
          <div className="text-center sm:text-left space-y-2">
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              Design your journey.
            </h1>
            <p className="text-[17px] text-[#86868b] dark:text-[#a1a1a6]">
              Fill out your travel parameters to get a state-wise itinerary and exact budget breakdown.
            </p>
          </div>

          {/* Subtle Surprise Me Banner */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-1 py-1 bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-sm p-3 rounded-2xl border border-[#e8e8ed] dark:border-[#333336]">
            <span className="text-[13.5px] text-[#86868b] dark:text-[#a1a1a6]">
              Confused where to go with this budget?
            </span>
            <button
              type="button"
              onClick={() => setSurpriseModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#ff6b35] hover:text-[#e45525] bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer select-none"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ya phir… Surprise Me 🎲</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* 1. Trip Type */}
            <div className="bg-white dark:bg-[#1d1d1f] p-6 rounded-2xl border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-3">
              <label className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                1. What kind of trip is this?
              </label>
              <SegmentedControl
                id="trip-type-segmented"
                options={tripTypeOptions}
                value={tripType}
                onChange={(val) => setTripType(val as TripType)}
              />
            </div>

            {/* 2 & 3. Origin and Destination with Datalist */}
            <div className="bg-white dark:bg-[#1d1d1f] p-6 rounded-2xl border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-5">
              <label className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                2. Where are you travelling from and to?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    id="origin-city-input"
                    label="Origin City"
                    list="indian-cities-list"
                    placeholder="e.g., Delhi, Mumbai, Bengaluru"
                    value={origin}
                    onChange={(e) => {
                      setOrigin(e.target.value);
                      if (errors.origin) setErrors((prev) => ({ ...prev, origin: undefined }));
                    }}
                    error={errors.origin}
                    leftIcon={<MapPin className="w-4 h-4" />}
                    required
                  />
                </div>

                <div>
                  <Input
                    id="destination-city-input"
                    label="Destination"
                    list="indian-cities-list"
                    placeholder="e.g., Manali, Goa, Coorg"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      if (errors.destination) setErrors((prev) => ({ ...prev, destination: undefined }));
                    }}
                    error={errors.destination}
                    leftIcon={<MapPin className="w-4 h-4 text-[#ff6b35]" />}
                    required
                  />
                </div>
              </div>

              {/* Datalist of Indian cities (memoized) */}
              <datalist id="indian-cities-list">
                {cityOptions}
              </datalist>

              {/* Quick shortcut pills for popular routes */}
              <div className="pt-2 flex items-center gap-2 flex-wrap text-[12px] text-[#86868b] dark:text-[#a1a1a6]">
                <span>Popular routes:</span>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('Delhi');
                    setDestination('Manali');
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#fafafa] dark:bg-[#2c2c2e] hover:bg-[#f2f2f5] dark:hover:bg-[#3a3a3c] border border-[#e8e8ed] dark:border-[#333336] text-[#1d1d1f] dark:text-[#f5f5f7] cursor-pointer"
                >
                  Delhi → Manali
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('Mumbai');
                    setDestination('Goa');
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#fafafa] dark:bg-[#2c2c2e] hover:bg-[#f2f2f5] dark:hover:bg-[#3a3a3c] border border-[#e8e8ed] dark:border-[#333336] text-[#1d1d1f] dark:text-[#f5f5f7] cursor-pointer"
                >
                  Mumbai → Goa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('Bengaluru');
                    setDestination('Coorg');
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#fafafa] dark:bg-[#2c2c2e] hover:bg-[#f2f2f5] dark:hover:bg-[#3a3a3c] border border-[#e8e8ed] dark:border-[#333336] text-[#1d1d1f] dark:text-[#f5f5f7] cursor-pointer"
                >
                  Bengaluru → Coorg
                </button>
              </div>
            </div>

            {/* 4 & 5. Duration and Travellers Steppers */}
            <div className="space-y-4">
              <label className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block pl-1">
                3. Group & Duration
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Stepper
                  id="duration-stepper"
                  label="Duration"
                  sublabel="Pacing of stops & nights"
                  value={days}
                  min={1}
                  max={30}
                  unit={days === 1 ? 'day' : 'days'}
                  onChange={setDays}
                />

                <Stepper
                  id="travellers-stepper"
                  label="Travellers"
                  sublabel="Splits lodging & cabs"
                  value={travellers}
                  min={1}
                  max={20}
                  unit={travellers === 1 ? 'person' : 'people'}
                  onChange={setTravellers}
                />
              </div>
            </div>

            {/* 6. Luggage */}
            <div className="bg-white dark:bg-[#1d1d1f] p-6 rounded-2xl border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-4">
              <label className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                4. Luggage Setup
              </label>
              <LuggageSelector value={luggage} onChange={setLuggage} />
            </div>

            {/* 7. Budget Slider */}
            <div className="space-y-2">
              <label className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block pl-1">
                5. Total Estimated Trip Budget
              </label>
              <BudgetSlider value={budget} onChange={setBudget} />
            </div>

            {/* 8. Transport Mode */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                  6. Preferred Mode of Travel
                </label>
                <span className="text-[13px] text-[#ff6b35] font-medium">Single select</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TRANSPORT_OPTIONS.map((opt) => (
                  <ModeCard
                    key={opt.id}
                    option={opt}
                    selected={transportMode === opt.id}
                    onSelect={setTransportMode}
                  />
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 flex flex-col items-center">
              <Button
                type="submit"
                size="lg"
                variant="primary"
                id="generate-plan-submit-btn"
                className="w-full sm:w-auto min-w-[280px] shadow-lg text-[17px] font-semibold cursor-pointer"
              >
                <span>Generate my plan</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-3 flex items-center gap-1.5 text-center">
                <Sparkles className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span>Instant calculations • Powered by Google Gemini</span>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Bring-Your-Own Gemini or OpenRouter API Key Modal Popup */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onSuccess={handleApiKeySuccess}
        title="Enter AI API Key to Plan"
        description="To keep Safar fast and unlimited for all travellers, please enter your free Google Gemini or OpenRouter API key to proceed."
      />

      {/* F1: Surprise Me Destination Modal */}
      <SurpriseMeModal
        isOpen={surpriseModalOpen}
        onClose={() => setSurpriseModalOpen(false)}
        currentBudget={budget}
        currentTravellers={travellers}
        onSelectDestination={(dest) => {
          setDestination(dest.name);
          setSurpriseModalOpen(false);
          showToast(`Surprise picked: ${dest.name} ✨`, 'success');
        }}
      />
    </div>
  );
};
