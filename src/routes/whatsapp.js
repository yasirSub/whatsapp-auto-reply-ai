const express = require('express');
const router = express.Router();
const { getClient } = require('../services/whatsapp/client');
const Contact = require('../models/contact');
const ChatHistory = require('../models/chatHistory');

/**
 * @route GET /api/whatsapp/status
 * @desc Get WhatsApp connection status
 */
router.get('/status', async (req, res) => {
  try {
    const client = getClient();
    const state = client.getState() || 'DISCONNECTED';
    
    res.status(200).json({
      status: 'success',
      data: {
        state,
        isConnected: state === 'CONNECTED'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting WhatsApp status'
    });
  }
});

/**
 * @route GET /api/whatsapp/contacts
 * @desc Get all contacts from WhatsApp
 */
router.get('/contacts', async (req, res) => {
  try {
    // Get contacts from database
    const contacts = await Contact.find().sort({ name: 1 });
    
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
 * @route PUT /api/whatsapp/contacts/:id
 * @desc Update contact settings
 */
router.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isEnabled, messageMode, notes } = req.body;
    
    const contact = await Contact.findOneAndUpdate(
      { whatsappId: id },
      { isEnabled, messageMode, notes },
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
 * @route GET /api/whatsapp/sync-contacts
 * @desc Sync contacts from WhatsApp
 */
router.get('/sync-contacts', async (req, res) => {
  try {
    const client = getClient();
    const contacts = await client.getContacts();
    
    // Filter out non-user contacts (e.g., groups)
    const userContacts = contacts.filter(contact => !contact.isGroup && contact.name);
    
    // Update database with contacts
    for (const contact of userContacts) {
      await Contact.findOneAndUpdate(
        { whatsappId: contact.id._serialized },
        {
          whatsappId: contact.id._serialized,
          name: contact.name || contact.pushname || 'Unknown',
          number: contact.number
        },
        { upsert: true, new: true }
      );
    }
    
    res.status(200).json({
      status: 'success',
      message: `Synced ${userContacts.length} contacts`,
      data: userContacts.map(c => ({ id: c.id._serialized, name: c.name || c.pushname, number: c.number }))
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error syncing contacts'
    });
  }
});

/**
 * @route GET /api/whatsapp/chat-history/:id
 * @desc Get chat history for a contact
 */
router.get('/chat-history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Get chat history from database
    const chatHistory = await ChatHistory.find({ whatsappId: id })
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    // Get total count
    const total = await ChatHistory.countDocuments({ whatsappId: id });
    
    res.status(200).json({
      status: 'success',
      data: {
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
 * @route POST /api/whatsapp/send-message
 * @desc Send a message to a contact
 */
router.post('/send-message', async (req, res) => {
  try {
    const { contactId, message } = req.body;
    
    if (!contactId || !message) {
      return res.status(400).json({
        status: 'error',
        message: 'Contact ID and message are required'
      });
    }
    
    const client = getClient();
    await client.sendMessage(`${contactId}@c.us`, message);
    
    // Save to chat history
    await ChatHistory.create({
      whatsappId: contactId,
      direction: 'outgoing',
      content: message,
      timestamp: new Date()
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Message sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error sending message'
    });
  }
});

/**
 * @route POST /api/whatsapp/logout
 * @desc Log out of WhatsApp
 */
router.post('/logout', async (req, res) => {
  try {
    const client = getClient();
    await client.logout();
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error logging out'
    });
  }
});

module.exports = router;