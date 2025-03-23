const mongoose = require('mongoose');

const scheduledMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['template', 'ai-generated'],
    required: true
  },
  content: {
    type: String
  },
  aiPrompt: {
    type: String
  },
  scheduleType: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'random'],
    required: true
  },
  scheduleDatetime: {
    type: Date
  },
  scheduleTime: {
    type: String
  },
  scheduleDays: {
    type: [Number]
  },
  startTime: {
    type: String
  },
  endTime: {
    type: String
  },
  minFrequency: {
    type: Number,
    default: 2
  },
  maxFrequency: {
    type: Number,
    default: 8
  },
  messageMode: {
    type: String,
    enum: ['casual', 'professional', 'flirty', 'romantic', 'funny', 'supportive'],
    default: 'casual'
  },
  contactIds: {
    type: [String]
  },
  sendToAllEnabled: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledMessage', scheduledMessageSchema);