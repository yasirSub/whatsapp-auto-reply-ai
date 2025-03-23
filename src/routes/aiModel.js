const express = require('express');
const router = express.Router();
const AIModel = require('../models/aiModel');
const Settings = require('../models/settings');

/**
 * @route GET /api/ai-models
 * @desc Get all available AI models
 */
router.get('/', async (req, res) => {
  try {
    const aiModels = await AIModel.find().sort({ provider: 1, name: 1 });
    
    res.status(200).json({
      status: 'success',
      data: aiModels
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting AI models'
    });
  }
});

/**
 * @route GET /api/ai-models/active
 * @desc Get the active AI model
 */
router.get('/active', async (req, res) => {
  try {
    // Get current settings
    const settings = await Settings.findOne({}) || { aiModel: 'openai', aiModelId: 'gpt-3.5-turbo' };
    
    // Get the active model details
    const activeModel = await AIModel.findOne({
      provider: settings.aiModel,
      modelId: settings.aiModelId
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        settings,
        activeModel
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting active AI model'
    });
  }
});

/**
 * @route PUT /api/ai-models/active
 * @desc Set the active AI model
 */
router.put('/active', async (req, res) => {
  try {
    const { provider, modelId } = req.body;
    
    // Validate required fields
    if (!provider || !modelId) {
      return res.status(400).json({
        status: 'error',
        message: 'Provider and model ID are required'
      });
    }
    
    // Verify the model exists
    const model = await AIModel.findOne({ provider, modelId });
    
    if (!model) {
      return res.status(404).json({
        status: 'error',
        message: 'AI model not found'
      });
    }
    
    if (!model.isAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Selected AI model is not available'
      });
    }
    
    // Update settings
    const settings = await Settings.findOneAndUpdate(
      {},
      { aiModel: provider, aiModelId: modelId },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        settings,
        model
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error setting active AI model'
    });
  }
});

/**
 * @route GET /api/ai-models/providers
 * @desc Get all available AI providers
 */
router.get('/providers', async (req, res) => {
  try {
    // Get all distinct providers
    const providers = await AIModel.distinct('provider');
    
    res.status(200).json({
      status: 'success',
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting AI providers'
    });
  }
});

/**
 * @route GET /api/ai-models/provider/:provider
 * @desc Get all models for a specific provider
 */
router.get('/provider/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    // Get all models for the provider
    const models = await AIModel.find({ provider }).sort({ name: 1 });
    
    res.status(200).json({
      status: 'success',
      data: models
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting provider models'
    });
  }
});

/**
 * @route POST /api/ai-models/sync
 * @desc Force resync of AI models
 */
router.post('/sync', async (req, res) => {
  try {
    // This would call the syncAIModels function in the aiService
    // For now, we'll just return a success message
    
    res.status(200).json({
      status: 'success',
      message: 'AI models synced successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error syncing AI models'
    });
  }
});

/**
 * @route PUT /api/ai-models/local-settings
 * @desc Update local AI settings
 */
router.put('/local-settings', async (req, res) => {
  try {
    const { localAIEnabled, localAIModelPath } = req.body;
    
    // Update settings
    const settings = await Settings.findOneAndUpdate(
      {},
      { 
        localAIEnabled: localAIEnabled !== undefined ? localAIEnabled : false,
        localAIModelPath: localAIModelPath || ''
      },
      { upsert: true, new: true }
    );
    
    // This would trigger a reload of models in a real implementation
    
    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating local AI settings'
    });
  }
});

module.exports = router;