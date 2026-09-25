import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { aiResultSchema } from '../validators/aiResult.schema.js';

const SYSTEM_INSTRUCTION = `You are SafarAI, an expert Indian travel planner. You know real Indian
routes, state highways, railway lines, bus corridors, realistic 2024-25
prices in INR, and practical trip logistics. Always respond with ONLY
valid JSON — no markdown, no code fences, no commentary.`;

function buildUserPrompt(form) {
  const isAiMode = !form.transportMode || form.transportMode.toLowerCase() === 'ai';
  const chosenModeCapitalized = form.transportMode
    ? form.transportMode.charAt(0).toUpperCase() + form.transportMode.slice(1)
    : 'Travel';

  const transportInstruction = isAiMode
    ? `The user selected "ai": You choose the most optimal transport mode (Train, Flight, Car, Bike, or Bus) considering distance, terrain, and budget. Explain your reasoning in modeRecommendation.reason.`
    : `The user has EXPLICITLY selected transport mode: "${form.transportMode}".
CRITICAL: YOU MUST STRICTLY USE THIS CHOSEN MODE ("${form.transportMode}") as the primary journey method. DO NOT change, downgrade, or substitute it with a different mode (for instance, never replace flight with bus, or bike with train).
modeRecommendation.chosen MUST be "${chosenModeCapitalized}".
Ensure the journey includes practical door-to-door transit legs:
- If "flight": Provide door-to-door transit: (1) Local cab/taxi from ${form.origin} to nearest commercial airport, (2) Flight journey to destination airport, (3) Cab from destination airport to ${form.destination}/hotel.
- If "train": Provide complete rail transit: (1) Transit to nearest railway station, (2) Specific Express/Superfast train route (e.g. Shatabdi/Vande Bharat/Mail), (3) Station to hotel/city center transit.
- If "car": Provide highway road trip route: major National/State Highways (e.g. NH-44, expressway), driving times, tolls, fuel stops, and parking.
- If "bike": Provide scenic motorcycle route: highway numbers, fuel stops, road conditions, and safety riding tips.
- If "bus": Provide interstate Volvo/sleeper bus route: boarding ISBT terminal, journey, rest stops, and arrival point.`;

  return `Plan a ${form.tripType} trip from ${form.origin} to ${form.destination}, India, for ${form.days}
days, ${form.travellers} travellers, luggage: ${form.luggage}, total budget ₹${form.budget}.

Transport Requirement:
${transportInstruction}

Rules:
- Route must use real Indian cities/states in the correct geographic sequence.
- Costs must be realistic INR ranges (min ≤ max) covering transit tickets/fuel/cabs, accommodation, food, and sightseeing for all ${form.travellers} travellers.
- dayPlan must cover exactly ${form.days} days.
- checklist must fit the trip type and chosen transport (e.g. flights require valid Govt ID & web check-in reminder; bikes require helmet, riding jacket & puncture kit).
- Return ONLY JSON with this exact schema:
{ "summary": string,
  "modeRecommendation": { "chosen": string, "reason": string },
  "route": [{ "from": string, "to": string, "state": string, "km": number,
            "hours": number, "note": string }],
  "costs": [{ "item": string, "min": number, "max": number }],
  "totalCost": { "min": number, "max": number },
  "perPersonCost": { "min": number, "max": number },
  "dayPlan": [{ "day": number, "title": string, "details": string }],
  "checklist": [string], "tips": [string] }`;
}

function stripMarkdownFences(text) {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

function parseNum(val, fallback = 0) {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? fallback : num;
  }
  return fallback;
}

function fixCostPair(pair) {
  if (!pair || typeof pair !== 'object') return { min: 0, max: 0 };
  let min = Math.max(0, parseNum(pair.min, 0));
  let max = Math.max(0, parseNum(pair.max, min));
  if (min > max) [min, max] = [max, min];
  return { min, max };
}

function sanitizeAiOutput(data) {
  if (!data || typeof data !== 'object') return data;

  // Sanitize modeRecommendation
  if (!data.modeRecommendation || typeof data.modeRecommendation !== 'object') {
    data.modeRecommendation = { chosen: 'Bus / Train', reason: 'Optimal route and budget efficiency.' };
  } else {
    data.modeRecommendation = {
      chosen: String(data.modeRecommendation.chosen || 'Bus / Train'),
      reason: String(data.modeRecommendation.reason || 'Optimal route and budget efficiency.').padEnd(5, '.'),
    };
  }

  // Sanitize summary
  data.summary = String(data.summary || 'A curated travel itinerary tailored for your trip.').padEnd(5, '.');

  // Sanitize route
  if (Array.isArray(data.route)) {
    data.route = data.route.map((hop) => ({
      from: String(hop.from || 'Origin'),
      to: String(hop.to || 'Destination'),
      state: String(hop.state || 'India'),
      km: Math.max(1, parseNum(hop.km, 100)),
      hours: Math.max(0.5, parseNum(hop.hours, 2)),
      note: String(hop.note || ''),
    }));
  }

  // Sanitize costs
  if (Array.isArray(data.costs)) {
    data.costs = data.costs.map((c) => {
      const fixed = fixCostPair(c);
      return {
        item: String(c.item || 'Travel & Stay'),
        min: fixed.min,
        max: fixed.max,
      };
    });
  }

  // Sanitize totalCost and perPersonCost
  data.totalCost = fixCostPair(data.totalCost);
  data.perPersonCost = fixCostPair(data.perPersonCost);

  // Sanitize dayPlan
  if (Array.isArray(data.dayPlan)) {
    data.dayPlan = data.dayPlan.map((d, idx) => ({
      day: Math.max(1, Math.floor(parseNum(d.day, idx + 1))),
      title: String(d.title || `Day ${idx + 1}`),
      details: String(d.details || 'Explore local attractions and enjoy sightseeing.'),
    }));
  }

  // Sanitize checklist and tips
  if (Array.isArray(data.checklist)) {
    data.checklist = data.checklist.map((c) => String(c).trim()).filter(Boolean);
  }
  if (!data.checklist || data.checklist.length === 0) {
    data.checklist = ['Valid Government ID', 'Emergency cash & card', 'Essential medicines'];
  }

  if (Array.isArray(data.tips)) {
    data.tips = data.tips.map((t) => String(t).trim()).filter(Boolean);
  }
  if (!data.tips || data.tips.length === 0) {
    data.tips = ['Reserve tickets and stays in advance during peak travel periods.'];
  }

  return data;
}

async function callGeminiRaw(promptText, apiKey = null) {
  const effectiveKey = apiKey || env.GEMINI_API_KEY;
  if (!effectiveKey) {
    const err = new Error('Gemini API Key is required. Please provide your Google AI Studio API key.');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const ai = new GoogleGenAI({ apiKey: effectiveKey });

  const primaryModel = env.GEMINI_MODEL || 'gemini-2.5-flash';
  // Resilient multi-tier model pool based on available Gemini models
  const candidateModels = [
    primaryModel,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash-lite',
  ];
  // Deduplicate preserving order
  const modelsToTry = candidateModels.filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      // 45s timeout per model attempt to prevent premature AI_TIMEOUT on complex itineraries
      const timeoutPromise = new Promise((_, reject) => {
        const timer = setTimeout(() => {
          const err = new Error(`Gemini API call to ${model} timed out`);
          err.code = 'AI_TIMEOUT';
          reject(err);
        }, 45000);
        timer.unref?.();
      });

      const apiPromise = ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const result = await Promise.race([apiPromise, timeoutPromise]);
      if (result?.text) {
        return result.text;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[GeminiService] Model ${model} encountered error, trying fallback if available:`, err.message || err);

      // If 503 UNAVAILABLE, 429 rate limited, or timeout, wait 1.2s before trying next model
      const isTemporaryDemandSpike =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.code === 'AI_TIMEOUT' ||
        String(err?.message || '').includes('503') ||
        String(err?.message || '').includes('high demand');

      if (isTemporaryDemandSpike && i < modelsToTry.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    }
  }

  throw lastError || new Error('All Gemini model attempts failed');
}

/**
 * On-the-fly OpenRouter execution when client provides x-openrouter-api-key
 * No API key is ever saved on the backend server.
 */
async function callOpenRouterRaw(promptText, openRouterKey) {
  if (!openRouterKey) {
    const err = new Error('OpenRouter API Key is required.');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const models = [
    'google/gemini-2.0-flash-001',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-chat',
  ];

  let lastError = null;

  for (const model of models) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://safar.travel',
          'X-Title': 'Safar India Travel Planner',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: promptText },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `OpenRouter HTTP ${res.status}`);
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        return content;
      }
    } catch (err) {
      lastError = err;
      console.warn(`[OpenRouterService] Model ${model} failed, trying next fallback:`, err.message || err);
    }
  }

  throw lastError || new Error('OpenRouter fallback failed');
}

export async function generatePlanWithGemini(formData, options = {}) {
  const prompt = buildUserPrompt(formData);
  const customKey = options.apiKey || null;
  const openRouterKey = options.openRouterKey || null;

  // Case 1: Direct OpenRouter if user provided OpenRouter key and did not provide custom Gemini key
  if (openRouterKey && !customKey) {
    console.log('[AiRouter] Direct execution via client-provided OpenRouter key...');
    const rawResponse = await callOpenRouterRaw(prompt, openRouterKey);
    const parsed = JSON.parse(stripMarkdownFences(rawResponse));
    const sanitized = sanitizeAiOutput(parsed);
    return aiResultSchema.parse(sanitized);
  }

  // Case 2: Neither key provided and server has no key
  if (!customKey && !env.GEMINI_API_KEY && !openRouterKey) {
    const err = new Error('No AI API key provided. Please connect your free Google Gemini or OpenRouter key.');
    err.code = 'MISSING_API_KEY';
    err.status = 401;
    throw err;
  }

  const runner = options.callGemini || ((p) => callGeminiRaw(p, customKey));
  let rawResponse = '';

  // Attempt 1
  try {
    rawResponse = await runner(prompt);
    const parsed = JSON.parse(stripMarkdownFences(rawResponse));
    const sanitized = sanitizeAiOutput(parsed);
    const validated = aiResultSchema.parse(sanitized);
    return validated;
  } catch (err1) {
    // If Gemini failed (rate limit 429, 503 high demand, quota, or missing key) and OpenRouter key is present:
    if (openRouterKey) {
      console.warn(`[AiRouter] Gemini failed (${err1.message || err1}), immediately failing over to OpenRouter...`);
      try {
        const fallbackRaw = await callOpenRouterRaw(prompt, openRouterKey);
        const parsed = JSON.parse(stripMarkdownFences(fallbackRaw));
        const sanitized = sanitizeAiOutput(parsed);
        return aiResultSchema.parse(sanitized);
      } catch (orErr) {
        console.error('[AiRouter] OpenRouter fallback also failed:', orErr.message);
      }
    }

    if (err1.code === 'MISSING_API_KEY') {
      throw err1;
    }

    console.warn('[GeminiService] Attempt 1 failed or returned invalid JSON, retrying once...', err1.message || err1);

    // Brief 1.5s pause before Attempt 2
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Attempt 2 (Retry with strict JSON reminder)
    const retryPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON matching the schema with no markdown formatting.`;
    try {
      rawResponse = await runner(retryPrompt);
      const parsed2 = JSON.parse(stripMarkdownFences(rawResponse));
      const sanitized2 = sanitizeAiOutput(parsed2);
      const validated2 = aiResultSchema.parse(sanitized2);
      return validated2;
    } catch (err2) {
      if (err2.code === 'MISSING_API_KEY') throw err2;

      console.error('[GeminiService] Attempt 2 failed. Checking OpenRouter fallback...');

      // Seamless OpenRouter fallback if client supplied an OpenRouter key in headers
      if (openRouterKey) {
        console.warn('[AiRouter] Gemini attempts exhausted. Seamlessly switching to user OpenRouter key...');
        try {
          const fallbackRaw = await callOpenRouterRaw(retryPrompt, openRouterKey);
          const parsedFallback = JSON.parse(stripMarkdownFences(fallbackRaw));
          const sanitizedFallback = sanitizeAiOutput(parsedFallback);
          return aiResultSchema.parse(sanitizedFallback);
        } catch (orErr) {
          console.error('[AiRouter] OpenRouter fallback also failed:', orErr.message);
        }
      }

      const aiBadOutputError = new Error('AI output failed schema validation after retry');
      aiBadOutputError.code = 'AI_BAD_OUTPUT';
      throw aiBadOutputError;
    }
  }
}
