# 🤖 SigmaGPT - Intelligent AI Assistant

> A sophisticated AI-powered chatbot with advanced tool integration, built using modern web technologies and LangChain framework.

## 🌐 Live Demo

### � **https://ai-chat-box-amber.vercel.app/**

Experience the full power of SigmaGPT with:
- 🧮 **Mathematical calculations** via integrated calculator
- � **Real-time web search** using SerpAPI
- 💾 **Persistent chat history** with MongoDB
- 🤖 **Advanced AI conversations** powered by OpenAI GPT-4

---

## ✨ Key Features

### 🧠 **AI Capabilities**
- **OpenAI GPT-4** integration for intelligent conversations
- **LangChain** framework for advanced AI agent functionality
- **Tool calling** - Calculator, Web Search, and more
- **Context-aware** responses with conversation memory

### 🛠️ **Integrated Tools**
- 🧮 **Calculator Tool** - Mathematical computations using MathJS
- 🔍 **Search Tool** - Real-time web search via SerpAPI
- 📝 **Final Answer Tool** - Structured response formatting
- 🗄️ **Vector Memory** - Pinecone integration for RAG (Retrieval-Augmented Generation)

### 💻 **User Experience**
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔄 **Real-time Streaming** - Live response streaming
- 📂 **Thread Management** - Organize conversations
- 🏷️ **Conversation Tags** - Categorize and search chats
- ⚙️ **Settings Panel** - Customize your experience

### 🌐 **Full-Stack Architecture**
- **Frontend**: React 19, Vite, Context API, CSS3
- **Backend**: Node.js, Express.js, LangChain
- **Database**: MongoDB Atlas with thread-based storage
- **AI**: OpenAI GPT-4, Together AI, SerpAPI
- **Vector DB**: Pinecone (optional)
- **Deployment**: Vercel (frontend) + Render (backend)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Backend │    │   MongoDB Atlas │
│                 │◄──►│                 │◄──►│                 │
│ • Chat Interface│    │ • LangChain     │    │ • Chat Threads  │
│ • Thread Mgmt   │    │ • AI Agents     │    │ • User Data     │
│ • Settings      │    │ • Tool Calling  │    │ • Conversations │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   External APIs │              │
         └──────────────┤                 ├──────────────┘
                        │ • OpenAI GPT-4  │
                        │ • SerpAPI       │
                        │ • Pinecone      │
                        │ • Together AI   │
                        └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- OpenAI API key
- SerpAPI key (optional)

### 1. Clone Repository
```bash
git clone https://github.com/krishnareddy756/SigmaGPT.git
cd SigmaGPT
```

### 2. Backend Setup
```bash
cd Backend
npm install --legacy-peer-deps

# Create .env file
cp .env.example .env
# Add your API keys (see Environment Variables section)

# Start backend server
npm start
```

### 3. Frontend Setup
```bash
cd Frontend
npm install --legacy-peer-deps

# Start frontend dev server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Required
OPENAI_API_KEY=your_openai_api_key
MONGODB_URL=your_mongodb_connection_string

# Optional (for enhanced features)
SERPAPI_API_KEY=your_serpapi_key
TOGETHER_API_KEY=your_together_ai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_pinecone_index

# Model Configuration
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_EMBED_MODEL=text-embedding-3-small
```

### Frontend (.env.local)
```env
# Development
VITE_API_URL=http://localhost:8080/api

# Production (automatically configured)
VITE_API_URL=https://sigmagpt-langchain-backend.onrender.com/api
```

---

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 19.1.0 |
| **Vite** | Build Tool | 6.0.5 |
| **React Context** | State Management | - |
| **React Markdown** | Markdown Rendering | 10.1.0 |
| **React Spinners** | Loading Indicators | 0.17.0 |
| **Rehype Highlight** | Code Syntax Highlighting | 7.0.1 |

### Backend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | 18+ |
| **Express.js** | Web Framework | 5.1.0 |
| **LangChain** | AI Framework | 0.3.34 |
| **OpenAI** | AI API Client | 5.10.1 |
| **MongoDB** | Database | 8.16.4 |
| **Mongoose** | ODM | 8.16.4 |
| **SerpAPI** | Web Search | 2.2.1 |
| **MathJS** | Math Calculations | 14.8.0 |

---

## 🎯 API Endpoints

### Chat Endpoints
```
POST /api/chat              # Send message and get AI response
GET  /api/threads           # Get all chat threads
GET  /api/thread/:id        # Get specific thread
DELETE /api/thread/:id      # Delete thread
POST /api/thread/:id/tag    # Add tag to thread
```

### Health Check
```
GET /api/health             # API health status
```

---

## 🧪 Testing

### Run Frontend Tests
```bash
cd Frontend
npm run test
```

### Manual Testing
1. **Chat Functionality**: Send messages and verify AI responses
2. **Calculator Tool**: Try math expressions like "Calculate 15 * 7 + 23"
3. **Search Tool**: Ask current information questions
4. **Thread Management**: Create, switch, and delete conversations
5. **Settings**: Test theme and configuration changes

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
cd Frontend
vercel --prod

# Or use Vercel Dashboard:
# 1. Import GitHub repository
# 2. Set root directory to "Frontend"
# 3. Add VITE_API_URL environment variable
```

### Backend (Render)
```bash
# Deploy via Render Dashboard:
# 1. Connect GitHub repository
# 2. Set root directory to "Backend"  
# 3. Add environment variables
# 4. Use build command: npm install --legacy-peer-deps
```

---

## 🔧 Configuration

### Supported AI Models
- **OpenAI**: gpt-4o-mini, gpt-4o, gpt-3.5-turbo
- **Together AI**: Various open-source models
- **Custom**: Easy to extend with other providers

### Tool Configuration
Tools can be enabled/disabled in `Backend/agents/sigmaAgent.js`:
```javascript
const tools = [
    calculatorTool,    // Math calculations
    serpAPITool,       // Web search
    finalAnswerTool    // Response formatting
];
```

---

## 📊 Performance & Scaling

### Current Limits
- **Concurrent Users**: ~100 (Render free tier)
- **Database**: 512MB (MongoDB Atlas free)
- **API Calls**: Based on OpenAI tier

### Optimization Features
- **Streaming Responses**: Real-time message delivery
- **Connection Pooling**: Efficient database connections
- **Error Handling**: Graceful failure recovery
- **CORS Configuration**: Secure cross-origin requests

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Test across browsers

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **LangChain** for AI framework
- **MongoDB** for database hosting
- **Vercel** & **Render** for deployment platforms
- **SerpAPI** for web search capabilities

---

## 📞 Contact & Support

- **Developer**: [Krishna Reddy](https://github.com/krishnareddy756)
- **Live Demo**: [https://sigma-gpt-mig8.vercel.app/](https://sigma-gpt-mig8.vercel.app/)
- **Issues**: [GitHub Issues](https://github.com/krishnareddy756/SigmaGPT/issues)

---

<div align="center">

### 🌟 **[Try SigmaGPT Now](https://sigma-gpt-mig8.vercel.app/)** 🌟

*Built with ❤️ using React, Node.js, and OpenAI*

</div>
