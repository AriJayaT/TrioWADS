import express from 'express';
import { getCSATDistribution, getRecentFeedback } from '../controllers/ratingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Only admins can access CSAT data
router.get('/distribution', protect, authorize('admin'), getCSATDistribution);
router.get('/recent', protect, authorize('admin'), getRecentFeedback);

export default router;
