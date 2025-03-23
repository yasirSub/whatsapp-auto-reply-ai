const express = require('express');
const router = express.Router();
const MessageTemplate = require('../models/messageTemplate');

/**
 * @route GET /api/message-templates
 * @desc Get all message templates
 */
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // Build query
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      // Add text search if provided
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { responseText: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }
    
    const templates = await MessageTemplate.find(query).sort({ name: 1 });
    
    res.status(200).json({
      status: 'success',
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting message templates'
    });
  }
});

/**
 * @route GET /api/message-templates/:id
 * @desc Get a message template by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await MessageTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'Message template not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: template
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting message template'
    });
  }
});

/**
 * @route POST /api/message-templates
 * @desc Create a new message template
 */
router.post('/', async (req, res) => {
  try {
    const { name, responseText, keywords, category, messageMode } = req.body;
    
    // Validate required fields
    if (!name || !responseText) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and response text are required'
      });
    }
    
    // Create template
    const template = await MessageTemplate.create({
      name,
      responseText,
      keywords: keywords || [],
      category: category || 'custom',
      messageMode: messageMode || 'any',
      isActive: true
    });
    
    res.status(201).json({
      status: 'success',
      data: template
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error creating message template'
    });
  }
});

/**
 * @route PUT /api/message-templates/:id
 * @desc Update a message template
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, responseText, keywords, category, messageMode, isActive } = req.body;
    
    // Validate required fields
    if (!name || !responseText) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and response text are required'
      });
    }
    
    // Update template
    const template = await MessageTemplate.findByIdAndUpdate(
      id,
      {
        name,
        responseText,
        keywords: keywords || [],
        category: category || 'custom',
        messageMode: messageMode || 'any',
        isActive: isActive !== undefined ? isActive : true
      },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'Message template not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: template
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating message template'
    });
  }
});

/**
 * @route DELETE /api/message-templates/:id
 * @desc Delete a message template
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete template
    const result = await MessageTemplate.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Message template not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Message template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error deleting message template'
    });
  }
});

/**
 * @route GET /api/message-templates/categories
 * @desc Get all template categories
 */
router.get('/categories/list', async (req, res) => {
  try {
    // Get all distinct categories
    const categories = await MessageTemplate.distinct('category');
    
    res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error getting template categories'
    });
  }
});

/**
 * @route POST /api/message-templates/:id/toggle
 * @desc Toggle a template active/inactive
 */
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get current template
    const template = await MessageTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'Message template not found'
      });
    }
    
    // Toggle active state
    template.isActive = !template.isActive;
    await template.save();
    
    res.status(200).json({
      status: 'success',
      data: template
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error toggling template status'
    });
  }
});

module.exports = router;