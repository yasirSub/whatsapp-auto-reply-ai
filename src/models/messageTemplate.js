const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  responseText: {
    type: String,
    required: true
  },
  keywords: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['greeting', 'farewell', 'question', 'common', 'custom'],
    default: 'custom'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  messageMode: {
    type: String,
    enum: ['casual', 'professional', 'flirty', 'romantic', 'funny', 'supportive', 'any'],
    default: 'any'
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

// Create text index for keywords to enable efficient text search
messageTemplateSchema.index({ keywords: 'text', responseText: 'text' });

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);