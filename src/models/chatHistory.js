const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  whatsappId: {
    type: String,
    required: true,
    index: true
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isAiGenerated: {
    type: Boolean,
    default: false
  },
  aiModel: {
    type: String
  },
  messageMode: {
    type: String
  }
});

// Create compound index for efficient querying of chat history
chatHistorySchema.index({ whatsappId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);