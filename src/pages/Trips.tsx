import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/format';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { UserTripSummary } from '../services/auth';
import { fetchTripById } from '../services/api';
import {
  MapPin,
  Calendar,
  Compass,
  Trash2,
  ArrowRight,
  Cloud,
  Loader2,
  LogIn,
} from 'lucide-react';

export const Trips: React.FC = () => {
  const navigate = useNavigate();
  const {
    savedTrips,
    userTrips,
    loadingUserTrips,
    deleteServerTrip,
    removeSavedTrip,
    setCurrentPlanDirectly,
  } = useTrip();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [openingTripId, setOpeningTripId] = useState<string | null>(null);

  const handleOpenServerTrip = async (summary: UserTripSummary) => {
    const localMatch = savedTrips.find((s) => s.id === summary.tripId);
    if (localMatch) {
      setCurrentPlanDirectly(localMatch.plan);
      navigate('/result');
      return;
    }

    setOpeningTripId(summary.tripId);
    try {
      const fullPlan = await fetchTripById(summary.tripId);
      setCurrentPlanDirectly(fullPlan);
      navigate('/result');
    } catch (err: any) {
      showToast(err?.message || 'Could not open trip', 'error');
    } finally {
      setOpeningTripId(null);
    }
  };

  const handleDeleteServerTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    try {
      await deleteServerTrip(tripId);
      removeSavedTrip(tripId);
      showToast('Trip deleted from account & database ✓', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete trip', 'error');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-28 bg-[#f5f5f7] dark:bg-[#000000]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-[#d2d2d7] dark:border-[#333336]">
          <div>
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
              My Trips
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#86868b] dark:text-[#a1a1a6] mt-1">
              {user
                ? `Welcome, ${user.name}. Here are your saved journeys synced to your account.`
                : 'Sign in to access and manage your personal itineraries.'}
            </p>
          </div>

          <Link to="/plan">
            <Button variant="primary" size="md">
              <span>Plan New Trip</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Loading state: layout-matched skeleton shimmer blocks */}
        {user && loadingUserTrips && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" aria-busy="true" aria-label="Loading trips">
            {[1, 2, 3].map((i) => (
              <div
                key={`trip-skeleton-${i}`}
                className="p-6 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-[#e8e8ed] dark:border-[#333336] apple-card-shadow space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-20 bg-[#e8e8ed] dark:bg-[#2c2c2e] rounded-full" />
                  <div className="h-5 w-16 bg-[#e8e8ed] dark:bg-[#2c2c2e] rounded-full" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3.5 w-24 bg-[#e8e8ed] dark:bg-[#2c2c2e] rounded-md" />
                  <div className="h-7 w-40 bg-[#e8e8ed] dark:bg-[#2c2c2e] rounded-md" />
                </div>
                <div className="flex gap-3 pt-2">
                  <div className="h-4 w-20 bg-[#e8e8ed] dark:bg-[#2c2c2e] rounded-md" />
                  <div className="h-4 w-20 bg-[#e8e8ed] dark:bg-[#2c2c2e] rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LOGGED IN USER: Server trips */}
        {user && !loadingUserTrips && (
          <>
            {userTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTrips.map((trip) => {
                  const isOpening = openingTripId === trip.tripId;
                  const dateFormatted = trip.createdAt
                    ? new Date(trip.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : null;

                  return (
                    <motion.div
                      key={trip.tripId}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="cursor-pointer"
                      onClick={() => handleOpenServerTrip(trip)}
                    >
                      <Card hoverable className="p-6 h-full flex flex-col justify-between relative group">
                        <div className="space-y-4">
                          {/* Top bar: Trip Type Tag & Share link */}
                          <div className="flex items-center justify-between">
                            <span className="capitalize text-[11px] font-semibold tracking-wider text-[#ff6b35] bg-[#ff6b35]/10 px-2.5 py-1 rounded-full">
                              {trip.tripType || 'Trip'}
                            </span>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Cloud className="w-3 h-3" /> Synced
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteServerTrip(e, trip.tripId)}
                                aria-label="Delete saved trip"
                                className="w-7 h-7 rounded-full text-[#86868b] dark:text-[#a1a1a6] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Destination Title */}
                          <div>
                            <div className="flex items-center gap-1.5 text-[13px] text-[#86868b] dark:text-[#a1a1a6] mb-1">
                              <MapPin className="w-3.5 h-3.5 text-[#ff6b35]" />
                              <span>Destination</span>
                            </div>
                            <h3 className="text-[24px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight group-hover:text-[#ff6b35] transition-colors">
                              {trip.destination}
                            </h3>
                          </div>

                          {/* Key details */}
                          <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#86868b] dark:text-[#a1a1a6] pt-1">
                            {dateFormatted && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {dateFormatted}
                              </span>
                            )}
                            {trip.transportMode && (
                              <>
                                <span>•</span>
                                <span className="uppercase font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                                  {trip.transportMode}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Bottom Per-Person Cost */}
                        <div className="pt-4 mt-4 border-t border-[#d2d2d7] dark:border-[#333336] flex items-center justify-between">
                          <div>
                            <span className="text-[11px] uppercase tracking-wider text-[#86868b] dark:text-[#a1a1a6] block font-medium">
                              Per Person
                            </span>
                            <span className="text-[18px] font-bold text-[#ff6b35] tabular-nums">
                              {trip.perPersonCost
                                ? `${formatINR(trip.perPersonCost.min)}`
                                : '—'}
                            </span>
                          </div>

                          <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            {isOpening ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff6b35]" />
                            ) : (
                              <>
                                <span>View Plan</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#ff6b35]" />
                              </>
                            )}
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Empty state for logged-in user */
              <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto space-y-5">
                <div className="w-20 h-20 rounded-full bg-[#f2f2f5] dark:bg-[#1d1d1f] border border-transparent dark:border-[#333336] text-[#86868b] dark:text-[#a1a1a6] flex items-center justify-center">
                  <Compass className="w-10 h-10 stroke-[1.5]" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-[22px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                    No saved trips yet
                  </h2>
                  <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                    Plan your next Indian vacation and your customized routes and budgets will automatically be saved here.
                  </p>
                </div>

                <Link to="/plan" className="pt-2">
                  <Button size="lg" variant="primary">
                    <span>Start Planning</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {/* GUEST: Clean Apple-style sign-in state (never leaks cross-session guest data) */}
        {!user && (
          <div className="py-16 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff6b35]/15 to-[#ff6b35]/5 border border-[#ff6b35]/20 flex items-center justify-center shadow-xs">
              <Compass className="w-10 h-10 text-[#ff6b35] stroke-[1.75]" />
            </div>

            <div className="space-y-2.5">
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                Sign in to view your trips
              </h2>
              <p className="text-[15px] sm:text-[16px] text-[#86868b] dark:text-[#a1a1a6] leading-relaxed max-w-md mx-auto">
                Your saved journeys and itineraries are securely linked to your account. Sign in or register to access and manage your plans.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full justify-center shadow-sm">
                  <LogIn className="w-4 h-4 mr-1.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full justify-center">
                  <span>Create Account</span>
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-[#e8e8ed] dark:border-[#333336] w-full">
              <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">
                Planning your first itinerary?{' '}
                <Link to="/plan" className="text-[#ff6b35] font-semibold hover:underline">
                  Start Planning
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
