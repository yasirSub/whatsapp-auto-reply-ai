const Contact = require('../../models/contact');
const ChatHistory = require('../../models/chatHistory');
const MessageTemplate = require('../../models/messageTemplate');
const { generateAIResponse } = require('../ai/aiService');

/**
 * Handles incoming WhatsApp messages
 * @param {Client} client - The WhatsApp Web.js client
 * @param {Message} message - The incoming message
 */
const handleIncomingMessage = async (client, message) => {
  try {
    // Skip if message is from the bot itself or from a group
    if (message.fromMe || message.isGroup) {
      return;
    }
    
    // Get the message sender
    const chat = await message.getChat();
    const contact = await message.getContact();
    
    // Save the message to chat history
    await saveMessageToHistory(contact.id._serialized, 'incoming', message.body);
    
    // Check if the contact is enabled for auto-reply
    const contactInfo = await Contact.findOne({ whatsappId: contact.id._serialized });
    
    if (!contactInfo || !contactInfo.isEnabled) {
      console.log(`Auto-reply disabled for ${contact.name || contact.number}`);
      return;
    }
    
    // Generate and send AI response
    const response = await generateResponse(contact.id._serialized, message.body, contactInfo.messageMode);
    
    // Add a small delay to make it seem more natural
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Send the response
    await client.sendMessage(message.from, response);
    
    // Save the bot's response to chat history
    await saveMessageToHistory(contact.id._serialized, 'outgoing', response);
    
    console.log(`Sent auto-reply to ${contact.name || contact.number}`);
  } catch (error) {
    console.error('Error handling incoming message:', error);
  }
};

/**
 * Saves a message to the chat history
 * @param {string} whatsappId - The WhatsApp ID of the contact
 * @param {string} direction - Direction of the message ('incoming' or 'outgoing')
 * @param {string} content - Message content
 */
const saveMessageToHistory = async (whatsappId, direction, content) => {
  try {
    await ChatHistory.create({
      whatsappId,
      direction,
      content,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error saving message to history:', error);
  }
};

/**
 * Generates a response to a message
 * @param {string} whatsappId - The WhatsApp ID of the contact
 * @param {string} message - The incoming message
 * @param {string} messageMode - The message mode (casual, professional, flirty, etc.)
 * @returns {Promise<string>} The generated response
 */
const generateResponse = async (whatsappId, message, messageMode) => {
  try {
    // Check for keyword-based templates first
    const templates = await MessageTemplate.find({ isActive: true });
    
    for (const template of templates) {
      // Check if template has keywords and one of them matches
      if (template.keywords && template.keywords.length > 0) {
        const hasKeyword = template.keywords.some(keyword => 
          message.toLowerCase().includes(keyword.toLowerCase()));
        
        if (hasKeyword) {
          return template.responseText;
        }
      }
    }
    
    // If no template matched, use AI to generate a response
    
    // Get chat history for context
    const chatHistory = await ChatHistory.find({ 
      whatsappId 
    }).sort({ timestamp: -1 }).limit(10);
    
    // Format chat history for the AI
    const formattedHistory = chatHistory
      .map(chat => `${chat.direction === 'incoming' ? 'User' : 'Bot'}: ${chat.content}`)
      .reverse()
      .join('\\n');
    
    // Generate AI response
    return await generateAIResponse(message, formattedHistory, messageMode);
  } catch (error) {
    console.error('Error generating response:', error);
    return "I'm sorry, I couldn't process that message right now.";
  }
};

module.exports = {
  handleIncomingMessage,
  generateResponse
};