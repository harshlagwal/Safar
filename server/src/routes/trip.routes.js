import { Router } from 'express';
import { listTrips, getTrip, regenerateTrip, saveTrip, deleteTrip, sendTripEmailHandler } from '../controllers/trip.controller.js';
import { planRateLimiter } from '../middleware/rateLimiter.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/trips - List user's saved trips (requires auth)
router.get('/trips', requireAuth, listTrips);

// POST /api/trips/:id/save - Save/associate trip with logged-in user
router.post('/trips/:id/save', requireAuth, saveTrip);

// DELETE /api/trips/:id - Delete a trip from MongoDB (checks ownership if userId is set)
router.delete('/trips/:id', optionalAuth, deleteTrip);

// GET /api/trips/:id - Read saved trip (checks ownership if userId is set)
router.get('/trips/:id', optionalAuth, getTrip);

// POST /api/trips/:id/regenerate - Re-run Gemini plan
router.post('/trips/:id/regenerate', planRateLimiter, optionalAuth, regenerateTrip);

// POST /api/trips/:id/send-email - Email itinerary
router.post('/trips/:id/send-email', planRateLimiter, optionalAuth, sendTripEmailHandler);

export default router;
