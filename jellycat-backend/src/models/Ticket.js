// src/models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please provide ticket category'],
    enum: ['Product Issues', 'Billing Support', 'Technical Help', 'General Inquiry']
  },
  subject: {
    type: String,
    required: [true, 'Please provide ticket subject']
  },
  description: {
    type: String,
    required: [true, 'Please provide ticket description']
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ticket', TicketSchema);