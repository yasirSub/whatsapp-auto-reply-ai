const schedule = require('node-schedule');
const ScheduledMessage = require('../../models/scheduledMessage');
const Contact = require('../../models/contact');
const { generateResponse } = require('../whatsapp/messageHandler');

// Store active jobs
const activeJobs = new Map();

/**
 * Initializes the message scheduler
 * @param {Client} whatsappClient - The WhatsApp client instance
 */
const initScheduler = async (whatsappClient) => {
  try {
    console.log('Initializing message scheduler...');
    
    // Clear any existing scheduled jobs
    clearAllJobs();
    
    // Load all scheduled messages from the database
    const scheduledMessages = await ScheduledMessage.find({ isActive: true });
    
    // Schedule each message
    for (const message of scheduledMessages) {
      scheduleMessage(message, whatsappClient);
    }
    
    console.log(`Scheduled ${scheduledMessages.length} messages`);
    
    // Set up automatic re-scheduling every day at midnight
    // This ensures any new scheduled messages are loaded
    schedule.scheduleJob('0 0 * * *', async () => {
      console.log('Daily scheduler refresh...');
      await refreshScheduler(whatsappClient);
    });
    
  } catch (error) {
    console.error('Error initializing scheduler:', error);
  }
};

/**
 * Refreshes the scheduler by reloading all scheduled messages
 * @param {Client} whatsappClient - The WhatsApp client instance
 */
const refreshScheduler = async (whatsappClient) => {
  try {
    // Clear existing jobs
    clearAllJobs();
    
    // Load and schedule messages
    const scheduledMessages = await ScheduledMessage.find({ isActive: true });
    for (const message of scheduledMessages) {
      scheduleMessage(message, whatsappClient);
    }
    
    console.log(`Refreshed scheduler with ${scheduledMessages.length} messages`);
  } catch (error) {
    console.error('Error refreshing scheduler:', error);
  }
};

/**
 * Schedules a message based on its configuration
 * @param {Object} message - The scheduled message object
 * @param {Client} whatsappClient - The WhatsApp client instance
 */
const scheduleMessage = (message, whatsappClient) => {
  try {
    let rule;
    
    // Configure schedule based on message type
    switch (message.scheduleType) {
      case 'once':
        // Schedule a one-time message
        rule = new Date(message.scheduleDatetime);
        break;
        
      case 'daily':
        // Schedule a daily message
        rule = new schedule.RecurrenceRule();
        const [hours, minutes] = message.scheduleTime.split(':');
        rule.hour = parseInt(hours);
        rule.minute = parseInt(minutes);
        break;
        
      case 'weekly':
        // Schedule a weekly message
        rule = new schedule.RecurrenceRule();
        const [weeklyHours, weeklyMinutes] = message.scheduleTime.split(':');
        rule.hour = parseInt(weeklyHours);
        rule.minute = parseInt(weeklyMinutes);
        rule.dayOfWeek = message.scheduleDays;
        break;
        
      case 'random':
        // Schedule random messages during certain hours
        scheduleRandomMessage(message, whatsappClient);
        return;
        
      default:
        console.log(`Unknown schedule type: ${message.scheduleType}`);
        return;
    }
    
    // Create the job
    const job = schedule.scheduleJob(message._id.toString(), rule, async () => {
      await sendScheduledMessage(message, whatsappClient);
    });
    
    // Store the job reference
    activeJobs.set(message._id.toString(), job);
    
    console.log(`Scheduled message: ${message.messageType} (${message.scheduleType}) to ${message.contactIds.length} contacts`);
  } catch (error) {
    console.error(`Error scheduling message ${message._id}:`, error);
  }
};

/**
 * Schedules a random message within a time range
 * @param {Object} message - The scheduled message object
 * @param {Client} whatsappClient - The WhatsApp client instance
 */
const scheduleRandomMessage = (message, whatsappClient) => {
  try {
    // Parse start and end hours
    const [startHour, startMinute] = message.startTime.split(':').map(Number);
    const [endHour, endMinute] = message.endTime.split(':').map(Number);
    
    // Calculate today's time window
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(startHour, startMinute, 0);
    
    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0);
    
    // If end time is before start time, it's for the next day
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }
    
    // If current time is past the end time, schedule for tomorrow
    if (now > endTime) {
      startTime.setDate(startTime.getDate() + 1);
      endTime.setDate(endTime.getDate() + 1);
    }
    
    // If current time is before start time, schedule for later today
    let scheduledTime;
    if (now < startTime) {
      // Calculate a random time between start time and end time
      const randomMinutes = Math.floor(
        Math.random() * (endTime - startTime) / (1000 * 60)
      );
      scheduledTime = new Date(startTime.getTime() + randomMinutes * 60000);
    } else if (now >= startTime && now <= endTime) {
      // Calculate a random time between now and end time
      const randomMinutes = Math.floor(
        Math.random() * (endTime - now) / (1000 * 60)
      );
      scheduledTime = new Date(now.getTime() + randomMinutes * 60000);
    }
    
    // Schedule the immediate job
    const immediateJob = schedule.scheduleJob(
      `${message._id.toString()}_immediate`,
      scheduledTime,
      async () => {
        await sendScheduledMessage(message, whatsappClient);
        
        // Schedule next random message
        scheduleNextRandomMessage(message, whatsappClient);
      }
    );
    
    // Store the job reference
    activeJobs.set(`${message._id.toString()}_immediate`, immediateJob);
    
    console.log(`Scheduled random message: ${message.messageType} at ${scheduledTime.toLocaleTimeString()}`);
  } catch (error) {
    console.error(`Error scheduling random message ${message._id}:`, error);
  }
};

/**
 * Schedules the next random message after one was sent
 * @param {Object} message - The scheduled message object
 * @param {Client} whatsappClient - The WhatsApp client instance
 */
const scheduleNextRandomMessage = (message, whatsappClient) => {
  try {
    // Calculate next time based on frequency range
    const minFrequency = message.minFrequency || 2; // Default minimum hours
    const maxFrequency = message.maxFrequency || 8; // Default maximum hours
    
    // Calculate random hours within the frequency range
    const randomHours = minFrequency + Math.random() * (maxFrequency - minFrequency);
    const randomMilliseconds = randomHours * 60 * 60 * 1000;
    
    // Next scheduled time
    const nextTime = new Date(Date.now() + randomMilliseconds);
    
    // Schedule the next job
    const nextJob = schedule.scheduleJob(
      `${message._id.toString()}_next`,
      nextTime,
      async () => {
        await sendScheduledMessage(message, whatsappClient);
        
        // Schedule the next random message again
        scheduleNextRandomMessage(message, whatsappClient);
      }
    );
    
    // Update the job reference
    if (activeJobs.has(`${message._id.toString()}_next`)) {
      activeJobs.delete(`${message._id.toString()}_next`);
    }
    activeJobs.set(`${message._id.toString()}_next`, nextJob);
    
    console.log(`Scheduled next random message: ${message.messageType} at ${nextTime.toLocaleTimeString()}`);
  } catch (error) {
    console.error(`Error scheduling next random message ${message._id}:`, error);
  }
};

/**
 * Sends a scheduled message
 * @param {Object} message - The scheduled message object
 * @param {Client} whatsappClient - The WhatsApp client instance
 */
const sendScheduledMessage = async (message, whatsappClient) => {
  try {
    console.log(`Sending scheduled message: ${message.messageType}`);
    
    // Get contacts
    let contactIds = message.contactIds;
    
    // If set to all enabled contacts, retrieve them
    if (message.sendToAllEnabled) {
      const enabledContacts = await Contact.find({ isEnabled: true });
      contactIds = enabledContacts.map(contact => contact.whatsappId);
    }
    
    // Nothing to do if no contacts
    if (!contactIds || contactIds.length === 0) {
      console.log('No contacts to send message to');
      return;
    }
    
    // For each contact, generate and send message
    for (const contactId of contactIds) {
      let messageContent;
      
      // Determine message content based on type
      switch (message.messageType) {
        case 'template':
          // Use predefined template
          messageContent = message.content;
          break;
          
        case 'ai-generated':
          // Generate content with AI
          const contact = await Contact.findOne({ whatsappId: contactId });
          if (!contact) continue;
          
          const mode = message.messageMode || contact.messageMode || 'casual';
          const prompt = message.aiPrompt || "Send a thoughtful message";
          
          // Generate AI response
          messageContent = await generateResponse(
            contactId,
            prompt,
            mode
          );
          break;
          
        default:
          messageContent = "Hello! This is a scheduled message.";
      }
      
      // Send message
      if (messageContent) {
        await whatsappClient.sendMessage(`${contactId}@c.us`, messageContent);
        console.log(`Sent scheduled ${message.messageType} message to ${contactId}`);
      }
    }
  } catch (error) {
    console.error(`Error sending scheduled message ${message._id}:`, error);
  }
};

/**
 * Clears all scheduled jobs
 */
const clearAllJobs = () => {
  activeJobs.forEach((job, jobId) => {
    job.cancel();
    console.log(`Canceled job: ${jobId}`);
  });
  activeJobs.clear();
};

/**
 * Adds a new scheduled message
 * @param {Object} messageData - The new message data
 * @param {Client} whatsappClient - The WhatsApp client instance
 * @returns {Promise<Object>} The created message
 */
const addScheduledMessage = async (messageData, whatsappClient) => {
  try {
    // Create new scheduled message in database
    const newMessage = await ScheduledMessage.create(messageData);
    
    // Schedule the message
    if (newMessage.isActive) {
      scheduleMessage(newMessage, whatsappClient);
    }
    
    return newMessage;
  } catch (error) {
    console.error('Error adding scheduled message:', error);
    throw error;
  }
};

/**
 * Updates an existing scheduled message
 * @param {string} messageId - The message ID
 * @param {Object} messageData - The updated message data
 * @param {Client} whatsappClient - The WhatsApp client instance
 * @returns {Promise<Object>} The updated message
 */
const updateScheduledMessage = async (messageId, messageData, whatsappClient) => {
  try {
    // Update message in database
    const updatedMessage = await ScheduledMessage.findByIdAndUpdate(
      messageId,
      messageData,
      { new: true }
    );
    
    if (!updatedMessage) {
      throw new Error(`Message not found: ${messageId}`);
    }
    
    // Cancel existing job
    const jobId = messageId.toString();
    if (activeJobs.has(jobId)) {
      activeJobs.get(jobId).cancel();
      activeJobs.delete(jobId);
    }
    
    // Also check for random message jobs
    if (activeJobs.has(`${jobId}_immediate`)) {
      activeJobs.get(`${jobId}_immediate`).cancel();
      activeJobs.delete(`${jobId}_immediate`);
    }
    
    if (activeJobs.has(`${jobId}_next`)) {
      activeJobs.get(`${jobId}_next`).cancel();
      activeJobs.delete(`${jobId}_next`);
    }
    
    // Reschedule if active
    if (updatedMessage.isActive) {
      scheduleMessage(updatedMessage, whatsappClient);
    }
    
    return updatedMessage;
  } catch (error) {
    console.error(`Error updating scheduled message ${messageId}:`, error);
    throw error;
  }
};

/**
 * Deletes a scheduled message
 * @param {string} messageId - The message ID
 * @returns {Promise<void>}
 */
const deleteScheduledMessage = async (messageId) => {
  try {
    // Delete from database
    await ScheduledMessage.findByIdAndDelete(messageId);
    
    // Cancel job
    const jobId = messageId.toString();
    if (activeJobs.has(jobId)) {
      activeJobs.get(jobId).cancel();
      activeJobs.delete(jobId);
    }
    
    // Also check for random message jobs
    if (activeJobs.has(`${jobId}_immediate`)) {
      activeJobs.get(`${jobId}_immediate`).cancel();
      activeJobs.delete(`${jobId}_immediate`);
    }
    
    if (activeJobs.has(`${jobId}_next`)) {
      activeJobs.get(`${jobId}_next`).cancel();
      activeJobs.delete(`${jobId}_next`);
    }
    
  } catch (error) {
    console.error(`Error deleting scheduled message ${messageId}:`, error);
    throw error;
  }
};

module.exports = {
  initScheduler,
  refreshScheduler,
  addScheduledMessage,
  updateScheduledMessage,
  deleteScheduledMessage
};