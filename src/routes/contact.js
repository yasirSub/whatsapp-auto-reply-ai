const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const ChatHistory = require('../models/chatHistory');

/**
 * @route GET /api/contacts
 * @desc Get all contacts
 */
router.get('/', async (req, res) => {
  try {
    const { search, enabled } = req.query;
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { number: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (enabled) {
      query.isEnabled = enabled === 'true';
    }
    
    const contacts = await Contact.find(query).sort({ name: 1 });
    
    res.status(200).json({
      status: 'success',
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting contacts'
    });
  }
});

/**
 * @route GET /api/contacts/:id
 * @desc Get a contact by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findOne({ whatsappId: id });
    
    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting contact'
    });
  }
});

/**
 * @route PUT /api/contacts/:id
 * @desc Update a contact
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isEnabled, messageMode, notes } = req.body;
    
    const contact = await Contact.findOneAndUpdate(
      { whatsappId: id },
      {
        name: name,
        isEnabled: isEnabled !== undefined ? isEnabled : false,
        messageMode: messageMode || 'casual',
        notes: notes
      },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating contact'
    });
  }
});

/**
 * @route POST /api/contacts/:id/toggle
 * @desc Toggle a contact's enabled status
 */
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findOne({ whatsappId: id });
    
    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }
    
    // Toggle enabled status
    contact.isEnabled = !contact.isEnabled;
    await contact.save();
    
    res.status(200).json({
      status: 'success',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error toggling contact status'
    });
  }
});

/**
 * @route GET /api/contacts/:id/chat-history
 * @desc Get chat history for a contact
 */
router.get('/:id/chat-history', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Verify contact exists
    const contact = await Contact.findOne({ whatsappId: id });
    
    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }
    
    // Get chat history
    const chatHistory = await ChatHistory.find({ whatsappId: id })
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    // Get total count
    const total = await ChatHistory.countDocuments({ whatsappId: id });
    
    res.status(200).json({
      status: 'success',
      data: {
        contact,
        messages: chatHistory,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting chat history'
    });
  }
});

/**
 * @route GET /api/contacts/:id/stats
 * @desc Get chat statistics for a contact
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify contact exists
    const contact = await Contact.findOne({ whatsappId: id });
    
    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }
    
    // Get total messages
    const totalMessages = await ChatHistory.countDocuments({ whatsappId: id });
    
    // Get incoming messages
    const incomingMessages = await ChatHistory.countDocuments({ 
      whatsappId: id,
      direction: 'incoming'
    });
    
    // Get outgoing messages
    const outgoingMessages = await ChatHistory.countDocuments({ 
      whatsappId: id,
      direction: 'outgoing'
    });
    
    // Get AI-generated messages
    const aiGeneratedMessages = await ChatHistory.countDocuments({ 
      whatsappId: id,
      direction: 'outgoing',
      isAiGenerated: true
    });
    
    // Get last message date
    const lastMessage = await ChatHistory.findOne({ whatsappId: id })
      .sort({ timestamp: -1 })
      .limit(1);
    
    res.status(200).json({
      status: 'success',
      data: {
        totalMessages,
        incomingMessages,
        outgoingMessages,
        aiGeneratedMessages,
        responseRate: incomingMessages > 0 ? outgoingMessages / incomingMessages : 0,
        lastMessageAt: lastMessage ? lastMessage.timestamp : null
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting contact stats'
    });
  }
});

/**
 * @route GET /api/contacts/mode/:mode
 * @desc Get contacts by message mode
 */
router.get('/mode/:mode', async (req, res) => {
  try {
    const { mode } = req.params;
    
    const contacts = await Contact.find({ messageMode: mode }).sort({ name: 1 });
    
    res.status(200).json({
      status: 'success',
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting contacts by mode'
    });
  }
});

/**
 * @route GET /api/contacts/enabled
 * @desc Get all enabled contacts
 */
router.get('/status/enabled', async (req, res) => {
  try {
    const contacts = await Contact.find({ isEnabled: true }).sort({ name: 1 });
    
    res.status(200).json({
      status: 'success',
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting enabled contacts'
    });
  }
});

module.exports = router;