import Notification from '../models/Notification.js';

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
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 