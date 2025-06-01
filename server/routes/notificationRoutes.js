import express from 'express';
import { getNotifications, markNotificationAsRead, createNotification, deleteNotification, markAllAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for the authenticated user
router.get('/', protect, getNotifications);

// Mark a notification as read
router.put('/:notificationId/read', protect, markNotificationAsRead);

// Mark all notifications as read
router.put('/mark-all-read', protect, markAllAsRead);

// Create a new notification
router.post('/', protect, createNotification);

// Delete a notification
router.delete('/:notificationId', protect, deleteNotification);

export default router; 