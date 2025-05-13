// src/models/Agent.js
const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide agent name']
  },
  initials: {
    type: String,
    required: [true, 'Please provide agent initials']
  },
  responseTime: {
    type: String,
    required: [true, 'Please provide response time']
  },
  tickets: {
    type: Number,
    default: 0
  },
  resolution: {
    type: String,
    default: '0%'
  },
  status: {
    type: String,
    enum: ['Online', 'Offline', 'Away'],
    default: 'Offline'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Agent', AgentSchema);