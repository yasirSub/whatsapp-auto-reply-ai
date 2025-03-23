const express = require('express');
const router = express.Router();

// Import route modules
const whatsappRoutes = require('./whatsapp');
const aiModelRoutes = require('./aiModel');
const contactRoutes = require('./contact');
const messageTemplateRoutes = require('./messageTemplate');
const scheduledMessageRoutes = require('./scheduledMessage');
const settingsRoutes = require('./settings');

// Register routes
router.use('/whatsapp', whatsappRoutes);
router.use('/ai-models', aiModelRoutes);
router.use('/contacts', contactRoutes);
router.use('/message-templates', messageTemplateRoutes);
router.use('/scheduled-messages', scheduledMessageRoutes);
router.use('/settings', settingsRoutes);

// API health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

module.exports = router;