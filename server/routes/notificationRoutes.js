import express from 'express';
import { getNotifications, markAsRead, createNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', protect, getNotifications);

// Mark a notification as read
router.put('/:id/read', protect, markAsRead);

// Create a notification
router.post('/', protect, createNotification);

export default router; 