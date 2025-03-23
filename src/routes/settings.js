const express = require('express');
const router = express.Router();
const Settings = require('../models/settings');

/**
 * @route GET /api/settings
 * @desc Get application settings
 */
router.get('/', async (req, res) => {
  try {
    // Get or create settings
    const settings = await Settings.findOne({}) || await Settings.create({});
    
    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting settings'
    });
  }
});

/**
 * @route PUT /api/settings
 * @desc Update application settings
 */
router.put('/', async (req, res) => {
  try {
    const {
      defaultMessageMode,
      autoEnableNewContacts,
      enableDebugMode,
      maxHistoryMessages,
      defaultResponseDelay,
      responseDelayVariation
    } = req.body;
    
    // Update settings
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        defaultMessageMode: defaultMessageMode || 'casual',
        autoEnableNewContacts: autoEnableNewContacts !== undefined ? autoEnableNewContacts : false,
        enableDebugMode: enableDebugMode !== undefined ? enableDebugMode : false,
        maxHistoryMessages: maxHistoryMessages || 10,
        defaultResponseDelay: defaultResponseDelay || 1500,
        responseDelayVariation: responseDelayVariation || 2000
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating settings'
    });
  }
});

/**
 * @route GET /api/settings/message-modes
 * @desc Get available message modes
 */
router.get('/message-modes', async (req, res) => {
  try {
    // These are the supported message modes
    const messageModes = [
      { 
        id: 'casual', 
        name: 'Casual', 
        description: 'Friendly and conversational responses'
      },
      { 
        id: 'professional', 
        name: 'Professional', 
        description: 'Formal and business-like communication'
      },
      { 
        id: 'flirty', 
        name: 'Flirty', 
        description: 'Playful and slightly romantic responses'
      },
      { 
        id: 'romantic', 
        name: 'Romantic', 
        description: 'Affectionate and loving communication'
      },
      { 
        id: 'funny', 
        name: 'Funny', 
        description: 'Humorous and entertaining messages'
      },
      { 
        id: 'supportive', 
        name: 'Supportive', 
        description: 'Empathetic and encouraging communication'
      }
    ];
    
    res.status(200).json({
      status: 'success',
      data: messageModes
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting message modes'
    });
  }
});

/**
 * @route GET /api/settings/system-status
 * @desc Get system status information
 */
router.get('/system-status', async (req, res) => {
  try {
    // This would gather actual system information in a real implementation
    const systemStatus = {
      serverStatus: 'online',
      whatsappStatus: 'connected', // This would be dynamically determined
      databaseStatus: 'connected',
      aiStatus: 'available',
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
    
    res.status(200).json({
      status: 'success',
      data: systemStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting system status'
    });
  }
});

/**
 * @route POST /api/settings/reset
 * @desc Reset application settings to defaults
 */
router.post('/reset', async (req, res) => {
  try {
    // Create default settings
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        aiModel: 'openai',
        aiModelId: 'gpt-3.5-turbo',
        localAIEnabled: false,
        defaultMessageMode: 'casual',
        autoEnableNewContacts: false,
        enableDebugMode: false,
        maxHistoryMessages: 10,
        defaultResponseDelay: 1500,
        responseDelayVariation: 2000
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Settings reset to defaults',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error resetting settings'
    });
  }
});

module.exports = router;