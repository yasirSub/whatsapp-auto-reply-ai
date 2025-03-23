const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  aiModel: {
    type: String,
    enum: ['openai', 'anthropic', 'google', 'local'],
    default: 'openai'
  },
  aiModelId: {
    type: String,
    default: 'gpt-3.5-turbo'
  },
  localAIEnabled: {
    type: Boolean,
    default: false
  },
  localAIModelPath: {
    type: String
  },
  defaultMessageMode: {
    type: String,
    enum: ['casual', 'professional', 'flirty', 'romantic', 'funny', 'supportive'],
    default: 'casual'
  },
  autoEnableNewContacts: {
    type: Boolean,
    default: false
  },
  enableDebugMode: {
    type: Boolean,
    default: false
  },
  maxHistoryMessages: {
    type: Number,
    default: 10
  },
  defaultResponseDelay: {
    type: Number,
    default: 1500
  },
  responseDelayVariation: {
    type: Number,
    default: 2000
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

module.exports = mongoose.model('Settings', settingsSchema);