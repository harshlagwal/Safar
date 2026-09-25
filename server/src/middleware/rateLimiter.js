import rateLimit from 'express-rate-limit';

// Global limiter: 100 requests / hour / IP
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests from this IP. Please try again later.',
      },
    });
  },
});

// Plan generation limiter: 20 requests / hour / IP
export const planRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded: maximum 20 trip plan requests per hour per IP.',
      },
    });
  },
});

// Auth limiter: 10 requests / hour / IP
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many authentication attempts. Please try again in an hour.',
      },
    });
  },
});

