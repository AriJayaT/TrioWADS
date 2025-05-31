import Notification from '../models/Notification.js';
import { emitToUser } from '../index.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    
    // Emit socket event for notification update
    const io = req.app.get('io');
    if (io) {
      emitToUser(notif.user, 'notification_updated', notif);
    }
    
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a notification
export const createNotification = async (req, res) => {
  try {
    const { user, message, type } = req.body;
    const notif = new Notification({ user, message, type });
    await notif.save();
    
    // Emit socket event for new notification
    const io = req.app.get('io');
    if (io) {
      emitToUser(user, 'new_notification', notif);
    }
    
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark all notifications as read for the logged-in user
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );
    // Optionally, emit a socket event to update notifications in real-time
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 