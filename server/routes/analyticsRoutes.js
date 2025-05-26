import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getResolutionByPriority,
  getResolutionTimeTrend,
  getTicketVolumeTrend,
  getSystemOverview
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/resolution-by-priority', protect, authorize('admin'), getResolutionByPriority);
router.get('/resolution-time-trend', protect, authorize('admin'), getResolutionTimeTrend);
router.get('/ticket-volume-trend', protect, authorize('admin'), getTicketVolumeTrend);
router.get('/system-overview', protect, authorize('admin'), getSystemOverview);

export default router;