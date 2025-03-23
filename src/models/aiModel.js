const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ['openai', 'anthropic', 'google', 'local'],
    required: true
  },
  modelId: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  apiKeyRequired: {
    type: Boolean,
    default: true
  },
  maxTokens: {
    type: Number,
    default: 4096
  },
  defaultTemperature: {
    type: Number,
    default: 0.7
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

// Create compound unique index for provider and modelId
aiModelSchema.index({ provider: 1, modelId: 1 }, { unique: true });

module.exports = mongoose.model('AIModel', aiModelSchema);