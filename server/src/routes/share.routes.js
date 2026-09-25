import { Router } from 'express';
import { getSharedTrip } from '../controllers/trip.controller.js';

const router = Router();

router.get('/share/:shareId', getSharedTrip);

export default router;
