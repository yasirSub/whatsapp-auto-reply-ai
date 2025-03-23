const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { handleIncomingMessage } = require('./messageHandler');
const Contact = require('../../models/contact');

let client = null;

/**
 * Creates and initializes the WhatsApp Web.js client
 * @returns {Promise<Client>} The WhatsApp client instance
 */
const setupWhatsAppClient = async () => {
  try {
    // Create a new client instance
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: "whatsapp-auto-reply-ai"
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      }
    });

    // Set up event handlers
    client.on('qr', (qr) => {
      // Generate and display QR code in the terminal
      console.log('Scan the QR code below to log in to WhatsApp:');
      qrcode.generate(qr, { small: true });
      
      // Here you could also emit the QR code to a frontend client
      // via WebSockets if implementing a web interface
    });

    client.on('ready', async () => {
      console.log('WhatsApp client is ready');
      
      // Sync contacts to database when client is ready
      await syncContacts();
    });

    client.on('authenticated', () => {
      console.log('WhatsApp client authenticated');
    });

    client.on('auth_failure', (msg) => {
      console.error('WhatsApp authentication failed:', msg);
    });

    client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      // Attempt to reconnect
      client.initialize();
    });

    // Handle incoming messages
    client.on('message', async (message) => {
      await handleIncomingMessage(client, message);
    });

    // Initialize the client
    await client.initialize();
    
    return client;
  } catch (error) {
    console.error('Error setting up WhatsApp client:', error);
    throw error;
  }
};

/**
 * Synchronizes WhatsApp contacts with the database
 */
const syncContacts = async () => {
  try {
    console.log('Syncing contacts...');
    const contacts = await client.getContacts();
    
    // Filter out non-user contacts (e.g., groups)
    const userContacts = contacts.filter(contact => !contact.isGroup && contact.name);
    
    for (const contact of userContacts) {
      // Check if contact exists in database
      const existingContact = await Contact.findOne({ whatsappId: contact.id._serialized });
      
      if (!existingContact) {
        // Create new contact
        await Contact.create({
          whatsappId: contact.id._serialized,
          name: contact.name || contact.pushname || 'Unknown',
          number: contact.number,
          isEnabled: false, // Default to disabled for auto-reply
          messageMode: 'casual', // Default message mode
        });
      }
    }
    
    console.log(`Synced ${userContacts.length} contacts`);
  } catch (error) {
    console.error('Error syncing contacts:', error);
  }
};

/**
 * Gets the WhatsApp client instance
 * @returns {Client} The WhatsApp client instance
 */
const getClient = () => {
  if (!client) {
    throw new Error('WhatsApp client is not initialized');
  }
  return client;
};

module.exports = {
  setupWhatsAppClient,
  getClient,
  syncContacts
};