import { PlanRequest, PlanResponse } from '../types/plan';
import { getToken, getCurrentUserId } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getApiKeyStorageKey(): string {
  const userId = getCurrentUserId();
  return userId ? `safar_gemini_api_key_${userId}` : 'safar_gemini_api_key_guest';
}

function getOpenRouterStorageKey(): string {
  const userId = getCurrentUserId();
  return userId ? `safar_openrouter_api_key_${userId}` : 'safar_openrouter_api_key_guest';
}

export function getStoredGeminiApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  const storageKey = getApiKeyStorageKey();
  return localStorage.getItem(storageKey);
}

export function setStoredGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    const storageKey = getApiKeyStorageKey();
    localStorage.setItem(storageKey, key.trim());
  }
}

export function removeStoredGeminiApiKey(): void {
  if (typeof window !== 'undefined') {
    const storageKey = getApiKeyStorageKey();
    localStorage.removeItem(storageKey);
    // Also clean up legacy un-namespaced key if present
    localStorage.removeItem('safar_gemini_api_key');
  }
}

export function getStoredOpenRouterApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  const storageKey = getOpenRouterStorageKey();
  return localStorage.getItem(storageKey);
}

export function setStoredOpenRouterApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    const storageKey = getOpenRouterStorageKey();
    localStorage.setItem(storageKey, key.trim());
  }
}

export function removeStoredOpenRouterApiKey(): void {
  if (typeof window !== 'undefined') {
    const storageKey = getOpenRouterStorageKey();
    localStorage.removeItem(storageKey);
    localStorage.removeItem('safar_openrouter_api_key');
  }
}

export async function fetchTripPlan(formData: PlanRequest): Promise<PlanResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiKey = getStoredGeminiApiKey();
  if (apiKey) {
    headers['x-gemini-api-key'] = apiKey;
  }

  const openRouterKey = getStoredOpenRouterApiKey();
  if (openRouterKey) {
    headers['x-openrouter-api-key'] = openRouterKey;
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/plan`, {
    method: 'POST',
    headers,
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Plan generate nahi ho paya, try again');
  }

  const data = await res.json();
  return {
    ...data,
    request: formData,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

export async function fetchTripById(id: string): Promise<PlanResponse> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/trips/${id}`, {
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Trip not found');
  }
  return res.json();
}

export async function fetchSharedTrip(shareId: string): Promise<PlanResponse> {
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/share/${shareId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Shared trip not found');
  }
  return res.json();
}

export async function regenerateTripPlan(id: string): Promise<PlanResponse> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const apiKey = getStoredGeminiApiKey();
  if (apiKey) {
    headers['x-gemini-api-key'] = apiKey;
  }

  const openRouterKey = getStoredOpenRouterApiKey();
  if (openRouterKey) {
    headers['x-openrouter-api-key'] = openRouterKey;
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/trips/${id}/regenerate`, {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to regenerate plan');
  }

  return res.json();
}

export async function deleteTripApi(tripId: string): Promise<boolean> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/trips/${tripId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to delete trip from database');
  }

  return true;
}

export async function sendTripEmailApi(
  tripId: string,
  toEmail: string,
  recipientName?: string,
  pdfBase64?: string,
  filename?: string
): Promise<{ success: boolean; message: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/trips/${tripId}/send-email`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ toEmail, recipientName, pdfBase64, filename }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to send itinerary email');
  }

  return data;
}

