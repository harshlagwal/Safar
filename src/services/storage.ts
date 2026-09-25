import { PlanResponse, SavedTrip } from '../types/plan';

const STORAGE_KEYS = {
  SAVED_TRIPS: 'safar_saved_trips',
  CURRENT_PLAN: 'safar_current_plan',
  CHECKLIST_PREFIX: 'safar_checklist_',
};

// Purge any stale legacy unauthenticated saved trips from prior sessions
if (typeof window !== 'undefined') {
  try {
    const token = localStorage.getItem('safar_token');
    if (!token) {
      localStorage.removeItem(STORAGE_KEYS.SAVED_TRIPS);
    }
  } catch {
    // safe fallback
  }
}

export function getSavedTrips(): SavedTrip[] {
  try {
    // Only return saved trips if user is authenticated
    if (typeof window !== 'undefined' && !localStorage.getItem('safar_token')) {
      return [];
    }
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_TRIPS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved trips from localStorage', e);
    return [];
  }
}

export function saveTripToStorage(plan: PlanResponse): boolean {
  try {
    const trips = getSavedTrips();
    const existingIndex = trips.findIndex((t) => t.id === plan.tripId);

    const savedTrip: SavedTrip = {
      id: plan.tripId,
      savedAt: new Date().toISOString(),
      plan,
      checkedItems: getTripChecklist(plan.tripId),
    };

    if (existingIndex >= 0) {
      trips[existingIndex] = savedTrip;
    } else {
      trips.unshift(savedTrip);
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(trips));
    return true;
  } catch (e) {
    console.error('Failed to save trip to localStorage', e);
    return false;
  }
}

export function deleteSavedTrip(tripId: string): void {
  try {
    const trips = getSavedTrips().filter((t) => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(trips));
    localStorage.removeItem(`${STORAGE_KEYS.CHECKLIST_PREFIX}${tripId}`);
  } catch (e) {
    console.error('Failed to delete trip from localStorage', e);
  }
}

export function clearAllSavedTrips(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVED_TRIPS);
  } catch (e) {
    console.error('Failed to clear saved trips from localStorage', e);
  }
}

export function isTripSaved(tripId: string): boolean {
  const trips = getSavedTrips();
  return trips.some((t) => t.id === tripId);
}

export function setCurrentPlan(plan: PlanResponse | null): void {
  try {
    if (plan) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(plan));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAN);
    }
  } catch (e) {
    console.error('Failed to store current plan', e);
  }
}

export function getCurrentPlan(): PlanResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get current plan', e);
    return null;
  }
}

export function getTripChecklist(tripId: string): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.CHECKLIST_PREFIX}${tripId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to get trip checklist', e);
    return [];
  }
}

export function saveTripChecklist(tripId: string, items: string[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.CHECKLIST_PREFIX}${tripId}`, JSON.stringify(items));
    // Also update in saved trips if saved
    const trips = getSavedTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      trip.checkedItems = items;
      localStorage.setItem(STORAGE_KEYS.SAVED_TRIPS, JSON.stringify(trips));
    }
  } catch (e) {
    console.error('Failed to save trip checklist', e);
  }
}
