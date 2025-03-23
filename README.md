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
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   │   ├── ai/             # AI model integrations
│   │   ├── scheduler/      # Message scheduling
│   │   └── whatsapp/       # WhatsApp integration
│   ├── utils/              # Utility functions
│   └── index.js            # Entry point
├── client/                 # Frontend code
├── .env                    # Environment variables
└── package.json            # Dependencies
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.