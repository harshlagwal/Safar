import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import healthRoutes from './routes/health.routes.js';
import planRoutes from './routes/plan.routes.js';
import tripRoutes from './routes/trip.routes.js';
import shareRoutes from './routes/share.routes.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration (supports configured origin and local dev ports 3000, 5173, etc.)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isLocal =
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:');
      if (isLocal || origin === env.CORS_ORIGIN) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Body parser with 10mb limit for PDF attachments and requests
app.use(express.json({ limit: '10mb' }));

// Global rate limiter
app.use(globalRateLimiter);

// API Routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', planRoutes);
app.use('/api', tripRoutes);
app.use('/api', shareRoutes);
app.use('/api', chatRoutes);

// 404 Fallback Handler
app.use((req, res, next) => {
  const err = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  err.code = 'NOT_FOUND';
  next(err);
});

// Uniform Error Handler
app.use(errorHandler);

// Database Connection & Server Boot
export async function startServer() {
  if (env.MONGO_URI) {
    try {
      await mongoose.connect(env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err.message);
    }
  } else {
    console.warn('⚠️ No MONGO_URI provided; database operations will fail.');
  }

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Safar Backend listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  return server;
}

// Start only if directly executed
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
