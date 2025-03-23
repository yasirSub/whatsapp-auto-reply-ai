const express = require('express');
const router = express.Router();
const ScheduledMessage = require('../models/scheduledMessage');
const { getClient } = require('../services/whatsapp/client');
const { 
  addScheduledMessage, 
  updateScheduledMessage, 
  deleteScheduledMessage 
} = require('../services/scheduler/scheduler');

/**
 * @route GET /api/scheduled-messages
 * @desc Get all scheduled messages
 */
router.get('/', async (req, res) => {
  try {
    const scheduledMessages = await ScheduledMessage.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: scheduledMessages
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting scheduled messages'
    });
  }
});

/**
 * @route GET /api/scheduled-messages/:id
 * @desc Get a scheduled message by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scheduledMessage = await ScheduledMessage.findById(id);
    
    if (!scheduledMessage) {
      return res.status(404).json({
        status: 'error',
        message: 'Scheduled message not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: scheduledMessage
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting scheduled message'
    });
  }
});

/**
 * @route POST /api/scheduled-messages
 * @desc Create a new scheduled message
 */
router.post('/', async (req, res) => {
  try {
    const client = getClient();
    const messageData = req.body;
    
    // Validate required fields based on type
    if (!messageData.name || !messageData.messageType || !messageData.scheduleType) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, message type, and schedule type are required'
      });
    }
    
    // If template type, require content
    if (messageData.messageType === 'template' && !messageData.content) {
      return res.status(400).json({
        status: 'error',
        message: 'Content is required for template messages'
      });
    }
    
    // If AI-generated, require prompt
    if (messageData.messageType === 'ai-generated' && !messageData.aiPrompt) {
      return res.status(400).json({
        status: 'error',
        message: 'AI prompt is required for AI-generated messages'
      });
    }
    
    // Validate schedule-specific fields
    if (messageData.scheduleType === 'once' && !messageData.scheduleDatetime) {
      return res.status(400).json({
        status: 'error',
        message: 'Schedule datetime is required for one-time messages'
      });
    }
    
    if ((messageData.scheduleType === 'daily' || messageData.scheduleType === 'weekly') && 
        !messageData.scheduleTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Schedule time is required for daily/weekly messages'
      });
    }
    
    if (messageData.scheduleType === 'weekly' && 
        (!messageData.scheduleDays || messageData.scheduleDays.length === 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'Schedule days are required for weekly messages'
      });
    }
    
    if (messageData.scheduleType === 'random' && 
        (!messageData.startTime || !messageData.endTime)) {
      return res.status(400).json({
        status: 'error',
        message: 'Start time and end time are required for random messages'
      });
    }
    
    // Check if there are contacts to send to
    if (!messageData.sendToAllEnabled && 
        (!messageData.contactIds || messageData.contactIds.length === 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one contact is required or enable send to all'
      });
    }
    
    // Create and schedule the message
    const newMessage = await addScheduledMessage(messageData, client);
    
    res.status(201).json({
      status: 'success',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error creating scheduled message'
    });
  }
});

/**
 * @route PUT /api/scheduled-messages/:id
 * @desc Update a scheduled message
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = getClient();
    const messageData = req.body;
    
    // Update and reschedule the message
    const updatedMessage = await updateScheduledMessage(id, messageData, client);
    
    res.status(200).json({
      status: 'success',
      data: updatedMessage
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating scheduled message'
    });
  }
});

/**
 * @route DELETE /api/scheduled-messages/:id
 * @desc Delete a scheduled message
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete and cancel the scheduled message
    await deleteScheduledMessage(id);
    
    res.status(200).json({
      status: 'success',
      message: 'Scheduled message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error deleting scheduled message'
    });
  }
});

/**
 * @route POST /api/scheduled-messages/:id/toggle
 * @desc Toggle a scheduled message active/inactive
 */
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const client = getClient();
    
    // Get current message
    const message = await ScheduledMessage.findById(id);
    
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Scheduled message not found'
      });
    }
    
    // Toggle active state
    message.isActive = !message.isActive;
    
    // Update and reschedule
    const updatedMessage = await updateScheduledMessage(id, message, client);
    
    res.status(200).json({
      status: 'success',
      data: updatedMessage
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error toggling scheduled message'
    });
  }
});

module.exports = router;