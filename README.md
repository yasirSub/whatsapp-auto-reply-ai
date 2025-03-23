# WhatsApp Auto-Reply AI

A powerful WhatsApp automation tool that uses AI to manage your conversations with customizable responses, scheduled messaging, and personalized interactions.

## 🛠 Core Features

- **WhatsApp Login via QR Code** – Just scan & start the bot
- **AI Model Selection** – Choose between Local AI (LLaMA, Mistral) or Cloud AI (GPT-4, Gemini, Claude)
- **Contact-Based Customization** – Select specific contacts for auto-replies
- **Message Modes** – Set AI tone (Flirty, Casual, Professional, Romantic, etc.)
- **Time-Based Messaging** – AI sends scheduled personalized messages
- **Message Templates & Memory** – AI learns from stored custom messages to sound more human

## 🧠 AI Training & Memory System

- Message database to store specific responses
- AI reads past chats to understand relationships & tone
- Auto-generated responses based on past interactions
- Keyword-based triggers for customized responses

## 📅 Automated Messaging System

- Scheduled messages (good morning, good night, etc.)
- Memory for dates & events
- Surprise message generation

## 💡 User Control Panel

- Login with WhatsApp QR
- AI Model Selection
- Contact Management
- Reply Mode Configuration
- Message Template Management
- Scheduled Message Setup

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- API keys for cloud AI services (if using)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yasirSub/whatsapp-auto-reply-ai.git
   cd whatsapp-auto-reply-ai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your configuration:
   ```
   MONGODB_URI=your_mongodb_connection_string
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   ```

4. Start the application:
   ```
   npm run dev
   ```

5. Scan the QR code that appears in your terminal to log in to WhatsApp

## 📋 Project Structure

```
whatsapp-auto-reply-ai/
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   │   ├── aiModel.js      # AI model configuration
│   │   ├── chatHistory.js  # Chat history storage
│   │   ├── contact.js      # Contact management
│   │   ├── messageTemplate.js # Response templates
│   │   ├── scheduledMessage.js # Scheduled messages
│   │   └── settings.js     # App settings
│   ├── routes/             # API routes
│   │   ├── aiModel.js      # AI model management
│   │   ├── contact.js      # Contact management
│   │   ├── messageTemplate.js # Template management
│   │   ├── scheduledMessage.js # Schedule management
│   │   ├── settings.js     # Settings management
│   │   └── whatsapp.js     # WhatsApp operations
│   ├── services/           # Business logic
│   │   ├── ai/             # AI model integrations
│   │   │   └── aiService.js # AI service implementation
│   │   ├── scheduler/      # Message scheduling
│   │   │   └── scheduler.js # Scheduler implementation
│   │   └── whatsapp/       # WhatsApp integration
│   │       ├── client.js   # WhatsApp client setup
│   │       └── messageHandler.js # Message processing
│   └── index.js            # Entry point
├── client/                 # Frontend code (React application) - Coming soon
├── .env.example            # Environment variables example
└── package.json            # Dependencies
```

## 🔮 Coming Next

- **Frontend Web Interface**: A React-based UI for easy management
- **Mobile App**: Android/iOS app for on-the-go management
- **Advanced AI Features**: Fine-tuning and personalization
- **Image/Media Responses**: Support for multimedia replies
- **Analytics Dashboard**: Track conversation metrics

## 💻 API Endpoints

### WhatsApp

- `GET /api/whatsapp/status` - Get WhatsApp connection status
- `GET /api/whatsapp/contacts` - Get all contacts
- `PUT /api/whatsapp/contacts/:id` - Update contact settings
- `GET /api/whatsapp/sync-contacts` - Sync WhatsApp contacts
- `GET /api/whatsapp/chat-history/:id` - Get chat history for a contact
- `POST /api/whatsapp/send-message` - Send a message to a contact
- `POST /api/whatsapp/logout` - Log out of WhatsApp

### Contacts

- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/:id` - Get a contact by ID
- `PUT /api/contacts/:id` - Update a contact
- `POST /api/contacts/:id/toggle` - Toggle a contact's enabled status
- `GET /api/contacts/:id/chat-history` - Get chat history for a contact
- `GET /api/contacts/:id/stats` - Get chat statistics for a contact

### AI Models

- `GET /api/ai-models` - Get all available AI models
- `GET /api/ai-models/active` - Get the active AI model
- `PUT /api/ai-models/active` - Set the active AI model
- `GET /api/ai-models/providers` - Get all available AI providers
- `PUT /api/ai-models/local-settings` - Update local AI settings

### Message Templates

- `GET /api/message-templates` - Get all message templates
- `GET /api/message-templates/:id` - Get a message template by ID
- `POST /api/message-templates` - Create a new message template
- `PUT /api/message-templates/:id` - Update a message template
- `DELETE /api/message-templates/:id` - Delete a message template
- `POST /api/message-templates/:id/toggle` - Toggle a template active/inactive

### Scheduled Messages

- `GET /api/scheduled-messages` - Get all scheduled messages
- `GET /api/scheduled-messages/:id` - Get a scheduled message by ID
- `POST /api/scheduled-messages` - Create a new scheduled message
- `PUT /api/scheduled-messages/:id` - Update a scheduled message
- `DELETE /api/scheduled-messages/:id` - Delete a scheduled message
- `POST /api/scheduled-messages/:id/toggle` - Toggle a scheduled message active/inactive

### Settings

- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update application settings
- `GET /api/settings/message-modes` - Get available message modes
- `GET /api/settings/system-status` - Get system status information
- `POST /api/settings/reset` - Reset application settings to defaults

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.