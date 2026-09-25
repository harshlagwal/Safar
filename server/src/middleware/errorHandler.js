import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url} - ${err.code || 'UNKNOWN'}:`, err.message);

  // 1. Zod request validation error (400)
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue?.message || 'Invalid request payload';
    return res.status(400).json({
      error: {
        code: 'VALIDATION_FAILED',
        message,
      },
    });
  }

  // 2. Custom validation or bad request error (400)
  if (err.code === 'VALIDATION_FAILED') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: err.message || 'Validation failed',
      },
    });
  }

  // 2a. Missing API Key (400)
  if (err.code === 'MISSING_API_KEY') {
    return res.status(400).json({
      error: {
        code: 'MISSING_API_KEY',
        message: err.message || 'Gemini API Key is required. Please provide your Google AI Studio API key.',
      },
    });
  }

  // 3. Not Found (404)
  if (err.code === 'NOT_FOUND') {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: err.message || 'Resource not found',
      },
    });
  }

  // 4. Rate Limited (429)
  if (err.code === 'RATE_LIMITED') {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: err.message || 'Rate limit exceeded',
      },
    });
  }

  // 4a. Email already taken (409 or MongoDB duplicate key 11000)
  if (err.code === 'EMAIL_TAKEN' || err.code === 11000) {
    return res.status(409).json({
      error: {
        code: 'EMAIL_TAKEN',
        message: 'An account with this email already exists',
      },
    });
  }

  // 4b. Invalid credentials (401)
  if (err.code === 'INVALID_CREDENTIALS') {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: err.message || 'Invalid email or password',
      },
    });
  }

  // 4b-1. Invalid Google Token (401)
  if (err.code === 'INVALID_GOOGLE_TOKEN') {
    return res.status(401).json({
      error: {
        code: 'INVALID_GOOGLE_TOKEN',
        message: err.message || 'Google token verification failed',
      },
    });
  }


  // 4c. Unauthorized (401)
  if (err.code === 'UNAUTHORIZED') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: err.message || 'Authentication required',
      },
    });
  }

  // 4d. Forbidden (403)
  if (err.code === 'FORBIDDEN') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: err.message || 'Access denied',
      },
    });
  }

  // 5. AI Bad Output (502)
  if (err.code === 'AI_BAD_OUTPUT') {
    return res.status(502).json({
      error: {
        code: 'AI_BAD_OUTPUT',
        message: 'AI generated response failed validation. Please retry.',
      },
    });
  }

  // 6. AI Timeout (504)
  if (err.code === 'AI_TIMEOUT') {
    return res.status(504).json({
      error: {
        code: 'AI_TIMEOUT',
        message: 'AI planning service timed out after 30s. Please retry.',
      },
    });
  }

  // 7. Generic Server Error (500) - NEVER leak stack traces
  const status = err.status || 500;
  return res.status(status).json({
    error: {
      code: 'SERVER_ERROR',
      message: 'An unexpected internal server error occurred. Please try again.',
    },
  });
}
