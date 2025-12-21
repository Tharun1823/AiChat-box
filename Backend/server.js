import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';
import chatRoutes from './routes/chat.js';
import fileUploadRoutes from './routes/fileUpload.js';
import { initializePinecone } from './utils/pinecone.js';
const app=express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
const allowedOrigins = [
  'http://localhost:5173',
  'https://sigma-gpt-43mi.vercel.app',
  'https://sigma-gpt-mig8.vercel.app',
  'https://sigmagpt-langchain-backend.onrender.com'
];

// CORS configuration with dynamic origin checking
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any Vercel deployment (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Allow any localhost for development
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Reject other origins
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  credentials: true
};

app.use(cors(corsOptions));

app.use('/api', chatRoutes);
app.use('/api', fileUploadRoutes);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`); 
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  await connectDB();
  
  // Initialize FREE FAISS Vector Store (no API keys needed!)
  try {
    await initializePinecone(); // Now initializes FAISS vector store
    console.log('✅ Vector store initialized successfully');
  } catch (error) {
    console.log('⚠️ Failed to initialize vector store, continuing without it:', error.message);
  }
});

const connectDB = async () => {
  try {
    // Use MONGODB_URI for production (standard env var) or fall back to MONGODB_URL for local dev
    const mongoUrl = process.env.MONGODB_URI || process.env.MONGODB_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB connected successfully');
    console.log(`🔗 Connected to: ${mongoUrl.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in logs
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('Make sure MongoDB is running and the connection string is correct');
    // Don't exit process, just continue without database for development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
// app.post('/test',async (req, res) => {
//     const options={
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
//         },
//         body: JSON.stringify({
//             model: 'gpt-4o-mini',
//             messages: [
//                 {
//                     role: 'user',
//                     content: req.body.message 
//                 }
//             ]
//         })
//     };
//     try {
//         const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        
//         const data = await response.json();
//         console.log(data);
//         res.send(data.choices[0].message.content);
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });  

    

















// import OpenAI from 'openai';
// import dotenv from 'dotenv/config';

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
// });

// const response = await client.responses.create({
//   model: 'gpt-4o-mini',
//   input: 'Are semicolons optional in JavaScript?',
// });

// console.log(response.output_text);
