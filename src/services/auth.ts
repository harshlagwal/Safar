export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}


export interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'safar-token';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentUserId(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.sub || null;
    }
  } catch {
    return null;
  }
  return null;
}

function handleUnauthorized() {
  removeToken();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
    window.location.href = '/login';
  }
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err: any = new Error(data?.error?.message || 'Failed to create account');
    err.code = data?.error?.code;
    throw err;
  }

  const data: AuthResponse = await res.json();
  // Do not store token on signup so user signs in manually
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      const err: any = new Error('Email ya password galat hai');
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }
    const err: any = new Error(data?.error?.message || 'Login failed');
    err.code = data?.error?.code;
    throw err;
  }

  const data: AuthResponse = await res.json();
  setToken(data.token);
  return data;
}

export async function googleAuth(credential: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credential }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err: any = new Error(data?.error?.message || 'Google login fail ho gaya, dobara try karein');
    err.code = data?.error?.code;
    throw err;
  }

  const data: AuthResponse = await res.json();
  setToken(data.token);
  return data;
}

export async function getMe(): Promise<{ user: User }> {

  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const data = await res.json().catch(() => ({}));
    const err: any = new Error(data?.error?.message || 'Authentication failed');
    err.code = data?.error?.code;
    throw err;
  }

  return res.json();
}

export interface UserTripSummary {
  tripId: string;
  destination: string;
  tripType: string;
  transportMode: string;
  perPersonCost: { min: number; max: number } | null;
  shareId: string;
  createdAt: string;
}

export async function getUserTrips(): Promise<UserTripSummary[]> {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required to fetch user trips');
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/trips`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const data = await res.json().catch(() => ({}));
    const err: any = new Error(data?.error?.message || 'Failed to fetch trips');
    err.code = data?.error?.code;
    throw err;
  }

  return res.json();
}

export async function saveTripBackend(tripId: string): Promise<any> {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required to save trip');
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/trips/${tripId}/save`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'Failed to save trip to account');
  }

  return res.json();
}

export async function deleteTripBackend(tripId: string): Promise<boolean> {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required to delete trip');
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/trips/${tripId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'Failed to delete trip from account');
  }

  return true;
}

export async function deleteAccountApi(): Promise<boolean> {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required to delete account');
  }

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/auth/account`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || 'Failed to delete account');
  }

  return true;
}

export async function requestForgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data?.error?.message || 'Failed to send reset code');
    err.code = data?.error?.code;
    throw err;
  }

  return data;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(data?.error?.message || 'Failed to reset password');
    err.code = data?.error?.code;
    throw err;
  }

  return data;
}

