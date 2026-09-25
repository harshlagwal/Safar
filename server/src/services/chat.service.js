import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

const SYSTEM_INSTRUCTION = `You are Safar AI, a warm, expert Indian travel assistant inside the Safar trip-planning app. Answer travel questions: destinations, routes, budgets in INR, best seasons, packing, safety, trains/buses, food. Be concise and friendly — use short paragraphs and lists, Hinglish tone if the user writes in Hinglish. If asked something unrelated to travel, gently steer back: 'Main travel expert hoon — trip ke baare me kuch poochho!'. Never invent exact live prices; give realistic ranges. If tripContext is provided, you are answering about that specific trip.`;

function stripMarkdownFences(text) {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

/**
 * Builds Google GenAI content structure from messages array
 */
function buildGeminiContents(messages, tripContext) {
  // Take last 10 messages max
  const recentMessages = messages.slice(-10);

  const contents = [];

  // If tripContext is present, inject it into the first user message or as a system prelude
  let contextPrefix = '';
  if (tripContext && typeof tripContext === 'object') {
    const { origin, destination, days, budget } = tripContext;
    const parts = [];
    if (origin) parts.push(`Origin: ${origin}`);
    if (destination) parts.push(`Destination: ${destination}`);
    if (days) parts.push(`Duration: ${days} days`);
    if (budget) parts.push(`Budget: ₹${budget}`);
    if (parts.length > 0) {
      contextPrefix = `[Current Trip Context: ${parts.join(', ')}]\n\n`;
    }
  }

  for (let i = 0; i < recentMessages.length; i++) {
    const msg = recentMessages[i];
    const role = msg.role === 'assistant' ? 'model' : 'user';
    let text = msg.content || '';

    // If it's the latest user message and contextPrefix exists, prepend context
    if (i === recentMessages.length - 1 && role === 'user' && contextPrefix) {
      text = `${contextPrefix}User Question: ${text}`;
    }

    contents.push({
      role,
      parts: [{ text }],
    });
  }

  return contents;
}

/**
 * Invokes Gemini with timeout and model fallback
 */
async function callGeminiChat(contents, apiKey) {
  const activeKey = apiKey || env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!activeKey) {
    const err = new Error('No Gemini API key available on server');
    err.code = 'MISSING_API_KEY';
    err.status = 500;
    throw err;
  }

  const ai = new GoogleGenAI({ apiKey: activeKey });
  const primaryModel = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const candidateModels = [
    primaryModel,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash-lite',
  ];
  const modelsToTry = candidateModels.filter((m, idx, arr) => m && arr.indexOf(m) === idx);
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const timeoutErr = new Error(`AI request timed out after 30s (${model})`);
          timeoutErr.code = 'AI_TIMEOUT';
          timeoutErr.status = 504;
          reject(timeoutErr);
        }, 30000);
      });

      const apiPromise = ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.6,
        },
      });

      const result = await Promise.race([apiPromise, timeoutPromise]);
      if (result?.text) {
        return stripMarkdownFences(result.text);
      }
    } catch (err) {
      lastError = err;
      console.warn(`[ChatService] Model ${model} failed, trying fallback:`, err.message || err);

      if (err.code === 'AI_TIMEOUT') {
        throw err;
      }

      // Small 800ms backoff before next model attempt
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  const outputErr = new Error(lastError?.message || 'Failed to generate response from AI');
  outputErr.code = 'AI_BAD_OUTPUT';
  outputErr.status = 502;
  throw outputErr;
}

/**
 * Fallback OpenRouter chat caller using client-supplied key
 */
async function callOpenRouterChat(messages, tripContext, openRouterKey) {
  if (!openRouterKey) return null;

  const recentMessages = messages.slice(-10);
  let contextPrefix = '';
  if (tripContext && typeof tripContext === 'object') {
    const { origin, destination, days, budget } = tripContext;
    const parts = [];
    if (origin) parts.push(`Origin: ${origin}`);
    if (destination) parts.push(`Destination: ${destination}`);
    if (days) parts.push(`Duration: ${days} days`);
    if (budget) parts.push(`Budget: ₹${budget}`);
    if (parts.length > 0) {
      contextPrefix = `[Current Trip Context: ${parts.join(', ')}]\n\n`;
    }
  }

  const openAiMessages = [{ role: 'system', content: SYSTEM_INSTRUCTION }];

  for (let i = 0; i < recentMessages.length; i++) {
    const msg = recentMessages[i];
    let content = msg.content || '';
    if (i === recentMessages.length - 1 && msg.role === 'user' && contextPrefix) {
      content = `${contextPrefix}User Question: ${content}`;
    }
    openAiMessages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content,
    });
  }

  const models = ['google/gemini-2.0-flash-001', 'meta-llama/llama-3.3-70b-instruct'];
  let lastError = null;
  for (const model of models) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://safar.travel',
          'X-Title': 'Safar India Travel Chat',
        },
        body: JSON.stringify({
          model,
          messages: openAiMessages,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const reply = data?.choices?.[0]?.message?.content;
        if (reply) return reply;
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData?.error?.message || `OpenRouter error (${res.status})`;
        lastError = new Error(msg);
        console.warn(`[OpenRouterChat] Model ${model} error: ${msg}`);
      }
    } catch (err) {
      lastError = err;
      console.warn(`[OpenRouterChat] Model ${model} failed, trying next:`, err.message);
    }
  }

  throw lastError || new Error('Failed to generate response from OpenRouter');
}

/**
 * Main chat service entrypoint
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} [tripContext]
 * @param {Object} [options]
 * @param {string} [options.apiKey]
 * @param {string} [options.openRouterKey]
 * @returns {Promise<string>}
 */
export async function chatWithSafarAI(messages, tripContext, options = {}) {
  const apiKey = options?.apiKey || null;
  const openRouterKey = options?.openRouterKey || null;

  // Case 1: Direct OpenRouter if user provided OpenRouter key and did not provide custom Gemini key
  if (openRouterKey && !apiKey) {
    console.log('[ChatRouter] Direct execution via client-provided OpenRouter key...');
    const orReply = await callOpenRouterChat(messages, tripContext, openRouterKey);
    return orReply;
  }

  // Case 2: Neither key provided and server has no key
  if (!apiKey && !env.GEMINI_API_KEY && !openRouterKey) {
    const err = new Error('No AI API key provided. Please connect your free Google Gemini or OpenRouter key.');
    err.code = 'MISSING_API_KEY';
    err.status = 401;
    throw err;
  }

  const contents = buildGeminiContents(messages, tripContext);

  // Attempt 1
  try {
    const reply = await callGeminiChat(contents, apiKey);
    if (!reply) {
      throw new Error('Empty response from AI');
    }
    return reply;
  } catch (err1) {
    // If Gemini failed (rate limit, high demand, quota, or missing key) and OpenRouter key is present:
    if (openRouterKey) {
      console.warn(`[ChatRouter] Gemini failed (${err1.message || err1}), immediately falling back to OpenRouter...`);
      const orReply = await callOpenRouterChat(messages, tripContext, openRouterKey);
      if (orReply) return orReply;
    }

    if (err1.code === 'MISSING_API_KEY') {
      throw err1;
    }

    if (err1.code === 'AI_TIMEOUT') {
      throw err1;
    }

    console.warn('[ChatService] Attempt 1 failed, retrying once...', err1.message || err1);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Attempt 2 (Retry once internally)
    try {
      const reply = await callGeminiChat(contents, apiKey);
      if (!reply) {
        throw new Error('Empty response from AI after retry');
      }
      return reply;
    } catch (err2) {
      // Check OpenRouter fallback before throwing
      if (openRouterKey) {
        console.warn('[ChatRouter] Gemini retry failed, attempting client OpenRouter fallback...');
        const orReply = await callOpenRouterChat(messages, tripContext, openRouterKey);
        if (orReply) return orReply;
      }

      if (!err2.code) {
        err2.code = 'AI_BAD_OUTPUT';
        err2.status = 502;
      }
      throw err2;
    }
  }
}
