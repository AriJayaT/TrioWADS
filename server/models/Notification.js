import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ticket', 'message', 'system', 'assignment', 'ticket_created', 'ticket_assigned', 'ticket_closed', 'ticket_reply', 'ticket_escalated', 'new_ticket', 'ticket_reminder'],
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'customer'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: false
  }
});

export default mongoose.model('Notification', notificationSchema); 
