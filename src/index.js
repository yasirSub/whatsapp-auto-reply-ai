const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Import routes
const apiRoutes = require('./routes');

// Import services
const { setupWhatsAppClient } = require('./services/whatsapp/client');
const { initScheduler } = require('./services/scheduler/scheduler');
const { loadAIModels } = require('./services/ai/aiService');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client directory (when we build the frontend)
app.use(express.static(path.join(__dirname, '../client/build')));

// API routes
app.use('/api', apiRoutes);

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Initialize WhatsApp client
let whatsappClient;
async function initializeServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Initialize WhatsApp client
    whatsappClient = await setupWhatsAppClient();
    
    // Initialize AI models
    await loadAIModels();
    
    // Initialize message scheduler
    await initScheduler(whatsappClient);
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initializeServices();
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (whatsappClient) {
    await whatsappClient.destroy();
    console.log('WhatsApp client disconnected');
  }
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = app;