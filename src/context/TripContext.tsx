import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { PlanRequest, PlanResponse, SavedTrip } from '../types/plan';
import { fetchTripPlan } from '../services/api';
import { useAuth } from './AuthContext';
import { getUserTrips, UserTripSummary, deleteTripBackend } from '../services/auth';
import {
  getCurrentPlan,
  setCurrentPlan,
  getSavedTrips,
  saveTripToStorage,
  deleteSavedTrip,
  isTripSaved,
  getTripChecklist,
  saveTripChecklist,
} from '../services/storage';

interface TripContextValue {
  currentPlan: PlanResponse | null;
  savedTrips: SavedTrip[];
  userTrips: UserTripSummary[];
  loadingUserTrips: boolean;
  tripsCount: number;
  isGenerating: boolean;
  error: string | null;
  lastRequest: PlanRequest | null;
  setLastRequest: (req: PlanRequest | null) => void;
  setCurrentPlanDirectly: (plan: PlanResponse | null) => void;
  generateTrip: (request: PlanRequest) => Promise<PlanResponse | null>;
  saveCurrentTrip: () => boolean;
  removeSavedTrip: (tripId: string) => void;
  deleteServerTrip: (tripId: string) => Promise<boolean>;
  refreshUserTrips: () => Promise<void>;
  isCurrentSaved: boolean;
  checkItemInTrip: (tripId: string, item: string) => void;
  checkedItems: string[];
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlanState] = useState<PlanResponse | null>(() => getCurrentPlan());
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>(() => getSavedTrips());
  const [userTrips, setUserTrips] = useState<UserTripSummary[]>([]);
  const [loadingUserTrips, setLoadingUserTrips] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<PlanRequest | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Refresh server trips for logged in user
  const refreshUserTrips = useCallback(async () => {
    if (!user) {
      setUserTrips([]);
      setLoadingUserTrips(false);
      return;
    }
    setLoadingUserTrips(true);
    try {
      const data = await getUserTrips();
      setUserTrips(data);
    } catch (err) {
      console.error('[TripContext] Failed to load server trips:', err);
    } finally {
      setLoadingUserTrips(false);
    }
  }, [user]);

  // Load user trips on auth state change
  useEffect(() => {
    if (user) {
      refreshUserTrips();
      setSavedTrips(getSavedTrips());
    } else {
      setUserTrips([]);
      setSavedTrips([]);
      setLoadingUserTrips(false);
    }
  }, [user, refreshUserTrips]);

  useEffect(() => {
    if (currentPlan?.tripId) {
      setCheckedItems(getTripChecklist(currentPlan.tripId));
    } else {
      setCheckedItems([]);
    }
  }, [currentPlan?.tripId]);

  const setCurrentPlanDirectly = (plan: PlanResponse | null) => {
    setCurrentPlanState(plan);
    setCurrentPlan(plan);
    if (plan?.tripId) {
      setCheckedItems(getTripChecklist(plan.tripId));
    }
  };

  const generateTrip = async (request: PlanRequest): Promise<PlanResponse | null> => {
    setIsGenerating(true);
    setError(null);
    setLastRequest(request);

    // Enforce 2.5s minimum display time for generating screen as required in PRD Section 5 F3
    const startTime = Date.now();

    try {
      const plan = await fetchTripPlan(request);
      const elapsed = Date.now() - startTime;
      const minDelay = 2500;
      if (elapsed < minDelay) {
        await new Promise((r) => setTimeout(r, minDelay - elapsed));
      }

      setCurrentPlanDirectly(plan);
      setIsGenerating(false);

      // Refresh server trips if logged in so state & badge stay immediately updated
      if (user) {
        refreshUserTrips();
      }

      return plan;
    } catch (err: unknown) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise((r) => setTimeout(r, 2000 - elapsed));
      }
      const message = err instanceof Error ? err.message : 'Route nahi ban paya, ek baar try karein?';
      setError(message);
      setIsGenerating(false);
      return null;
    }
  };

  const saveCurrentTrip = (): boolean => {
    if (!currentPlan) return false;
    const success = saveTripToStorage(currentPlan);
    if (success) {
      setSavedTrips(getSavedTrips());
    }
    return success;
  };

  const removeSavedTrip = (tripId: string) => {
    deleteSavedTrip(tripId);
    setSavedTrips(getSavedTrips());
  };

  const deleteServerTrip = async (tripId: string): Promise<boolean> => {
    try {
      await deleteTripBackend(tripId);
      setUserTrips((prev) => prev.filter((t) => t.tripId !== tripId));
      return true;
    } catch (err) {
      console.error('[TripContext] Failed to delete server trip:', err);
      throw err;
    }
  };

  const checkItemInTrip = (tripId: string, item: string) => {
    const current = getTripChecklist(tripId);
    let updated: string[];
    if (current.includes(item)) {
      updated = current.filter((i) => i !== item);
    } else {
      updated = [...current, item];
    }
    saveTripChecklist(tripId, updated);
    setCheckedItems(updated);
  };

  const isCurrentSaved = currentPlan ? isTripSaved(currentPlan.tripId) : false;

  // Authentic trip count: only authenticated users have saved trips count. Guests always have 0.
  const tripsCount = user ? userTrips.length : 0;

  return (
    <TripContext.Provider
      value={{
        currentPlan,
        savedTrips,
        userTrips,
        loadingUserTrips,
        tripsCount,
        isGenerating,
        error,
        lastRequest,
        setLastRequest,
        setCurrentPlanDirectly,
        generateTrip,
        saveCurrentTrip,
        removeSavedTrip,
        deleteServerTrip,
        refreshUserTrips,
        isCurrentSaved,
        checkItemInTrip,
        checkedItems,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
