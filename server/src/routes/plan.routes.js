import { Router } from 'express';
import { createPlan } from '../controllers/plan.controller.js';
import { planRateLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/plan', planRateLimiter, optionalAuth, createPlan);

export default router;
