import Notification from '../models/Notification.js';
import { emitToUser } from '../index.js';

// Get notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Get notifications for the user
    const notifications = await Notification.find({
      recipient: userId,
      role: userRole // Add role filter
    })
    .sort({ timestamp: -1 })
    .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
        role: userRole
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Emit socket event to update notifications in real-time
    const io = req.app.get('io');
    if (io) {
      // First emit to user-specific room
      io.to(`user_${userId}`).emit('notification_updated', notification);
      
      // Then emit to role-specific room with a small delay
      setTimeout(() => {
        io.to(`role_${userRole}`).emit('notification_updated', notification);
      }, 100);
    }

    res.json(notification);
  } catch (error) {
    console.error('[Notification] Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { recipientId, message, type, role } = req.body;

    console.log('[Notification] Creating new notification:', {
      recipientId,
      message,
      type,
      role
    });

    const notification = new Notification({
      recipient: recipientId,
      message,
      type,
      role
    });

    await notification.save();
    console.log('[Notification] Notification saved:', notification);

    // Emit the notification to the recipient
    const io = req.app.get('io');
    if (io) {
      // First emit to user-specific room
      console.log('[Notification] Emitting new_notification event to user:', recipientId);
      io.to(`user_${recipientId}`).emit('new_notification', notification);
      
      // Then emit to role-specific room with a small delay to ensure order
      setTimeout(() => {
        console.log('[Notification] Emitting new_notification event to role:', role);
        io.to(`role_${role}`).emit('new_notification', notification);
      }, 100);
    } else {
      console.error('[Notification] Socket.io instance not found');
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error('[Notification] Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
      role: userRole // Add role filter
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// Mark all notifications as read for the logged-in user
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const result = await Notification.updateMany(
      { 
        recipient: userId,
        role: userRole,
        read: false 
      },
      { $set: { read: true } }
    );

    // Emit socket event to update notifications in real-time
    const io = req.app.get('io');
    if (io) {
      // Emit to both user-specific and role-specific rooms
      io.to(`user_${userId}`).emit('notifications_marked_read');
      io.to(`role_${userRole}`).emit('notifications_marked_read');
    }

    res.json({ 
      success: true, 
      modifiedCount: result.modifiedCount,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 