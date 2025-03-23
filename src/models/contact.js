const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  whatsappId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  number: {
    type: String
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  messageMode: {
    type: String,
    enum: ['casual', 'professional', 'flirty', 'romantic', 'funny', 'supportive'],
    default: 'casual'
  },
  notes: {
    type: String
  },
  lastMessageAt: {
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

module.exports = mongoose.model('Contact', contactSchema);