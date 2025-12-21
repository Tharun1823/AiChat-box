import express from 'express';
import Thread from '../models/Thread.js';
import { processWithAgent } from '../agents/sigmaAgent.js';
import { addDocumentToVector } from '../utils/pinecone.js';
import { fileStore } from './fileUpload.js';

const router = express.Router();

//test route
router.post('/test', async (req, res) => {
    try{
        const thread=new Thread({
            threadId: 'test-thread',
            title: 'Test Thread',
            
        });
        const response=await thread.save();
        res.send(response);
    }
    catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all threads
router.get('/thread', async (req, res) => {
    try {   
        const threads = await Thread.find({}).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/thread/:threadId', async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId: threadId });
        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        res.json(thread.messages);
    } catch (error) {
        console.error('Error fetching thread:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        
    }
});

router.delete('/thread/:threadId', async (req, res) => {
    const { threadId } = req.params;
    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId: threadId });
        if (!deletedThread) {
            return res.status(404).json({ error: 'Thread not found' });
        }
        res.json({ message: 'Thread deleted successfully' });
    } catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// LangChain agent chat endpoint
router.post('/chat', async (req, res) => {
    const { threadId, message } = req.body;
    if (!threadId || !message) {
        return res.status(400).json({ error: 'Thread ID and message are required' });
    }

    try {
        let thread = await Thread.findOne({ threadId: threadId });
        if (!thread) {
            thread = new Thread({
                threadId: threadId,
                title: message.slice(0, 50), // Use first 50 chars as title
                messages: [{ role: 'user', content: message }]
            });
        } else {
            thread.messages.push({ role: 'user', content: message });
        }

        // Get chat history for context
        const chatHistory = thread.messages.slice(-10); // Last 10 messages for context

        // Get uploaded file context if available
        let fileContext = '';
        if (fileStore && fileStore.has(threadId)) {
            const fileData = fileStore.get(threadId);
            fileContext = `\n\n[Uploaded File Context]\nFile: ${fileData.fileName}\nContent:\n${fileData.fullText}`;
        }

        // Process with LangChain agent (file context will be included)
        const agentResponse = await processWithAgent(message, chatHistory, null, fileContext);

        // Add assistant response to thread
        thread.messages.push({ 
            role: 'assistant', 
            content: agentResponse.answer,
            metadata: {
                toolCalls: agentResponse.toolCalls,
                context: agentResponse.context
            }
        });

        // Save to database
        await thread.save();

        // Add to vector store for future retrieval (if not disabled)
        try {
            await addDocumentToVector(
                `User: ${message}\nAssistant: ${agentResponse.answer}`,
                { threadId, timestamp: new Date().toISOString() }
            );
        } catch (vectorError) {
            console.log('Vector store temporarily disabled');
        }

        res.json({
            reply: agentResponse.answer,
            toolCalls: agentResponse.toolCalls,
            context: agentResponse.context
        });

    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Legacy endpoint for backward compatibility
router.post('/chat/legacy', async (req, res) => {
    const { threadId, message } = req.body;
    if (!threadId || !message) {
        return res.status(400).json({ error: 'Thread ID and message are required' });
    }
    try {
        let thread = await Thread.findOne({ threadId: threadId });
        if (!thread) {
            thread = new Thread({
                threadId: threadId,
                title: message,
                messages: [{ role: 'user', content: message }]
            });
        } else {
            thread.messages.push({ role: 'user', content: message });
        }
        // Get chat history for context
        const chatHistory = thread.messages.slice(-10); // Last 10 messages for context

        // Process with LangChain agent
        const result = await processWithAgent(message, chatHistory);
        const assistantResponse = result.answer; // Use 'answer' instead of 'response'

        thread.messages.push({ 
            role: 'assistant', 
            content: assistantResponse,
            metadata: {
                toolCalls: result.toolCalls,
                context: result.context
            }
        });
        await thread.save();
        res.json({ reply: assistantResponse });

    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

export default router;
