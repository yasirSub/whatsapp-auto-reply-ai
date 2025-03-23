const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const AIModel = require('../../models/aiModel');
const Settings = require('../../models/settings');

// Initialize AI clients
let openaiClient;
let localAIModel;

/**
 * Initializes AI models based on settings
 */
const loadAIModels = async () => {
  try {
    // Initialize OpenAI client if API key is available
    if (process.env.OPENAI_API_KEY) {
      openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('OpenAI client initialized');
    }
    
    // Load settings for preferred AI model
    const settings = await Settings.findOne({}) || { aiModel: 'openai', localAIEnabled: false };
    
    // Load local AI model if enabled
    if (settings.localAIEnabled && process.env.LOCAL_AI_MODEL_PATH) {
      // In a real implementation, this would load a local model like LLaMA
      // For now, we'll just log that it would be loaded
      console.log(`Would load local AI model from ${process.env.LOCAL_AI_MODEL_PATH}`);
      
      // This is a placeholder; actual implementation would depend on the specific local AI library
      localAIModel = {
        generate: async (prompt) => {
          return "This is a placeholder response from a local AI model.";
        }
      };
    }
    
    // Make sure all enabled AI models in the DB are available
    await syncAIModels();
    
  } catch (error) {
    console.error('Error loading AI models:', error);
  }
};

/**
 * Synchronizes available AI models with the database
 */
const syncAIModels = async () => {
  try {
    // Define available models
    const models = [
      {
        name: 'OpenAI GPT-4',
        provider: 'openai',
        modelId: 'gpt-4',
        isAvailable: !!process.env.OPENAI_API_KEY,
        description: 'OpenAI\'s most advanced model with strong reasoning capabilities'
      },
      {
        name: 'OpenAI GPT-3.5 Turbo',
        provider: 'openai',
        modelId: 'gpt-3.5-turbo',
        isAvailable: !!process.env.OPENAI_API_KEY,
        description: 'Fast and cost-effective model for most chat tasks'
      },
      {
        name: 'Claude',
        provider: 'anthropic',
        modelId: 'claude-3-opus',
        isAvailable: !!process.env.CLAUDE_API_KEY,
        description: 'Anthropic\'s most capable model for complex tasks'
      },
      {
        name: 'Gemini Pro',
        provider: 'google',
        modelId: 'gemini-pro',
        isAvailable: !!process.env.GEMINI_API_KEY,
        description: 'Google\'s advanced model with strong reasoning capabilities'
      },
      {
        name: 'Local LLaMA',
        provider: 'local',
        modelId: 'llama-2-13b',
        isAvailable: !!process.env.LOCAL_AI_ENABLED && !!process.env.LOCAL_AI_MODEL_PATH,
        description: 'Locally hosted LLaMA model for privacy and offline use'
      },
      {
        name: 'Local Mistral',
        provider: 'local',
        modelId: 'mistral-7b',
        isAvailable: !!process.env.LOCAL_AI_ENABLED && !!process.env.LOCAL_AI_MODEL_PATH,
        description: 'Locally hosted Mistral model for privacy and offline use'
      }
    ];
    
    // Upsert models in the database
    for (const model of models) {
      await AIModel.findOneAndUpdate(
        { provider: model.provider, modelId: model.modelId },
        model,
        { upsert: true, new: true }
      );
    }
    
    console.log('AI models synced successfully');
  } catch (error) {
    console.error('Error syncing AI models:', error);
  }
};

/**
 * Generates an AI response based on the message, chat history, and message mode
 * @param {string} message - The incoming message
 * @param {string} chatHistory - The formatted chat history
 * @param {string} messageMode - The message mode (casual, professional, flirty, etc.)
 * @returns {Promise<string>} The generated response
 */
const generateAIResponse = async (message, chatHistory, messageMode) => {
  try {
    // Get current AI model settings
    const settings = await Settings.findOne({}) || { aiModel: 'openai', aiModelId: 'gpt-3.5-turbo' };
    
    // Generate response based on the selected AI provider
    switch (settings.aiModel) {
      case 'openai':
        return await generateOpenAIResponse(message, chatHistory, messageMode, settings.aiModelId);
      case 'anthropic':
        return await generateClaudeResponse(message, chatHistory, messageMode);
      case 'google':
        return await generateGeminiResponse(message, chatHistory, messageMode);
      case 'local':
        return await generateLocalAIResponse(message, chatHistory, messageMode);
      default:
        return "I'm sorry, I couldn't generate a response at this time.";
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm sorry, I encountered an error while processing your message.";
  }
};

/**
 * Generates a response using OpenAI's API
 */
const generateOpenAIResponse = async (message, chatHistory, messageMode, modelId = 'gpt-3.5-turbo') => {
  if (!openaiClient) {
    return "OpenAI API is not configured.";
  }
  
  // Create a system prompt based on the message mode
  const systemPrompt = getSystemPromptForMode(messageMode);
  
  try {
    const response = await openaiClient.chat.completions.create({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Previous conversation: ${chatHistory}\\n\\nUser's message: ${message}` }
      ],
      max_tokens: 150,
      temperature: getTemperatureForMode(messageMode),
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return "I'm having trouble connecting to my brain right now.";
  }
};

/**
 * Generates a response using Claude's API (placeholder)
 */
const generateClaudeResponse = async (message, chatHistory, messageMode) => {
  // This would be implemented with the actual Claude API
  return "Claude API integration coming soon.";
};

/**
 * Generates a response using Gemini's API (placeholder)
 */
const generateGeminiResponse = async (message, chatHistory, messageMode) => {
  // This would be implemented with the actual Gemini API
  return "Gemini API integration coming soon.";
};

/**
 * Generates a response using a local AI model (placeholder)
 */
const generateLocalAIResponse = async (message, chatHistory, messageMode) => {
  if (!localAIModel) {
    return "Local AI model is not loaded.";
  }
  
  // This would be implemented with the actual local AI model
  return "This is a response from the local AI model.";
};

/**
 * Gets the system prompt for a specific message mode
 * @param {string} mode - The message mode
 * @returns {string} The system prompt
 */
const getSystemPromptForMode = (mode) => {
  const prompts = {
    'casual': 'You are a friendly and casual assistant. Respond conversationally and use simple language. Be warm and personable but not too formal.',
    'professional': 'You are a professional assistant. Respond formally and provide clear, concise information. Use proper grammar and avoid casual language.',
    'flirty': 'You are a flirtatious friend. Be playful, use witty remarks, and occasionally drop subtle compliments. Keep it light and fun without being inappropriate.',
    'romantic': 'You are a romantic partner. Express affection, use endearing terms, and show deep interest in the conversation. Be emotionally warm and caring.',
    'funny': 'You are a comedic assistant. Use humor, puns, and witty responses. Keep the conversation light-hearted and entertaining.',
    'supportive': 'You are a supportive friend. Be empathetic, encouraging, and focus on emotional validation. Offer comfort and positive reinforcement.',
    'default': 'You are a helpful assistant. Respond naturally to the user\'s message based on the conversation history.'
  };
  
  return prompts[mode] || prompts['default'];
};

/**
 * Gets the temperature setting for a specific message mode
 * @param {string} mode - The message mode
 * @returns {number} The temperature value
 */
const getTemperatureForMode = (mode) => {
  const temperatures = {
    'casual': 0.7,
    'professional': 0.4,
    'flirty': 0.8,
    'romantic': 0.8,
    'funny': 0.9,
    'supportive': 0.6,
    'default': 0.7
  };
  
  return temperatures[mode] || temperatures['default'];
};

module.exports = {
  loadAIModels,
  generateAIResponse,
  syncAIModels
};