import { getStoredGeminiApiKey, getStoredOpenRouterApiKey } from './api';
import { getToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface TripContext {
  origin?: string;
  destination?: string;
  days?: number;
  budget?: number;
}

export interface ChatResponse {
  reply: string;
}

/**
 * Sends conversation messages to Safar AI chat backend
 */
export async function postChat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  tripContext?: TripContext
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

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

  // Defensively sanitize and cap lengths so the client request never fails validation
  const sanitizedMessages = messages.map((m) => {
    const trimmed = (m.content || '').trim();
    if (m.role === 'user') {
      return {
        role: m.role,
        content: trimmed.length > 4000 ? trimmed.slice(0, 4000) : trimmed,
      };
    } else {
      return {
        role: m.role,
        content: trimmed.length > 20000 ? trimmed.slice(0, 20000) : trimmed,
      };
    }
  });

  const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: sanitizedMessages,
      tripContext,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data?.error?.message || 'Safar AI is unable to respond right now. Please try again.';
    const err = new Error(errorMsg);
    (err as any).code = data?.error?.code;
    (err as any).status = res.status;
    throw err;
  }

  return data.reply;
}
