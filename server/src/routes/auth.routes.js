import { Router } from 'express';
import { signup, login, getMe, deleteAccount, forgotPassword, resetPassword, googleAuth } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/auth/signup', authRateLimiter, signup);
router.post('/auth/login', authRateLimiter, login);
router.post('/auth/google', authRateLimiter, googleAuth);
router.post('/auth/forgot-password', authRateLimiter, forgotPassword);
router.post('/auth/reset-password', authRateLimiter, resetPassword);
router.get('/auth/me', requireAuth, getMe);
router.delete('/auth/account', requireAuth, deleteAccount);


export default router;
