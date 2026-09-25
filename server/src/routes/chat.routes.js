import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { chatWithSafarAI } from '../services/chat.service.js';

const router = Router();

// Dedicated chat rate limiter: 30 requests / hour / IP (skipped if user brings their own Gemini API key)
const chatRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // If client provides their own Gemini or OpenRouter API key, skip server IP rate limit
    const clientKey =
      req.headers['x-gemini-api-key'] ||
      req.headers['x-gemini-key'] ||
      req.headers['x-openrouter-api-key'] ||
      req.headers['x-openrouter-key'];
    return Boolean(clientKey && clientKey.trim().length > 10);
  },
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded: 30 requests per hour on free server tier. Connect your Google Gemini or OpenRouter API key to chat without limits.',
      },
    });
  },
});

const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(['user', 'assistant'], {
              errorMap: () => ({ message: 'role must be either "user" or "assistant"' }),
            }),
            content: z.string().trim().min(1, 'Message cannot be empty'),
          })
          .superRefine((val, ctx) => {
            if (val.role === 'user' && val.content.length > 4000) {
              ctx.addIssue({
                code: z.ZodIssueCode.too_big,
                maximum: 4000,
                type: 'string',
                inclusive: true,
                message: 'User message cannot exceed 4000 characters',
              });
            }
            if (val.role === 'assistant' && val.content.length > 25000) {
              ctx.addIssue({
                code: z.ZodIssueCode.too_big,
                maximum: 25000,
                type: 'string',
                inclusive: true,
                message: 'Assistant message in history cannot exceed 25000 characters',
              });
            }
          })
      )
      .min(1, 'Messages array must contain at least 1 message')
      .max(20, 'Conversation history cannot exceed 20 messages'),
    tripContext: z
      .object({
        origin: z.string().optional(),
        destination: z.string().optional(),
        days: z.number().optional(),
        budget: z.number().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (!Array.isArray(data?.messages) || data.messages.length === 0) return true;
      const last = data.messages[data.messages.length - 1];
      return last && last.role === 'user';
    },
    {
      message: 'The last message in conversation history must be from "user"',
      path: ['messages'],
    }
  );

router.post('/chat', chatRateLimiter, async (req, res, next) => {
  try {
    const parseResult = chatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return res.status(400).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Invalid chat request body',
        },
      });
    }

    const { messages, tripContext } = parseResult.data;
    const apiKey = req.headers['x-gemini-api-key'] || req.headers['x-gemini-key'] || req.query.apiKey || null;
    const openRouterKey = req.headers['x-openrouter-api-key'] || req.headers['x-openrouter-key'] || null;

    const options = { apiKey };
    if (openRouterKey) {
      options.openRouterKey = openRouterKey;
    }

    const reply = await chatWithSafarAI(messages, tripContext, options);

    return res.status(200).json({ reply });
  } catch (err) {
    // If error has a recognized code/status, return uniform error shape
    const status = err.status || (err.code === 'AI_TIMEOUT' ? 504 : err.code === 'AI_BAD_OUTPUT' ? 502 : 500);
    const code = err.code || 'AI_ERROR';
    const message = err.message || 'Error processing your chat request';

    return res.status(status).json({
      error: {
        code,
        message,
      },
    });
  }
});

export default router;
