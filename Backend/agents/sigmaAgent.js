// agents/sigmaAgent.js
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { calculatorTool } from '../tools/calculator.js';
import { serpAPITool } from '../tools/serpapi.js';
import { finalAnswerTool } from '../tools/finalAnswer.js';
import { searchSimilarDocuments } from '../utils/pinecone.js';

// Clean and validate API key
const cleanApiKey = (apiKey) => {
  if (!apiKey) return null;
  // Remove any whitespace, newlines, or other invalid characters
  const cleaned = apiKey.trim().replace(/[\r\n\t]/g, '');
  return cleaned.length > 0 ? cleaned : null;
};

const apiKey = cleanApiKey(process.env.OPENAI_API_KEY);

if (!apiKey || apiKey.length < 20) {
  console.error('❌ OpenAI API key is missing or invalid');
  console.error('API key length:', apiKey ? apiKey.length : 0);
  console.error('Make sure OPENAI_API_KEY is set in your .env file');
  throw new Error('OpenAI API key is required');
}

console.log('✅ OpenAI API key validated, length:', apiKey.length);

// Initialize the LLM
let llm = null;
let agentExecutor = null;

const initializeAgent = async () => {
  if (agentExecutor) return agentExecutor;

  try {
    llm = new ChatOpenAI({
      apiKey: apiKey,
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
      temperature: 0.0,
      streaming: true,
    });

    // Define available tools
    const tools = [calculatorTool, serpAPITool, finalAnswerTool];

    // Create the agent prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are SigmaGPT, an intelligent assistant that helps users with various tasks.

You have access to the following tools:
- calculator: For mathematical calculations
- search: For searching the web for current information  
- final_answer: To provide the final answer to the user

IMPORTANT RULES:
1. For mathematical problems, ALWAYS use the calculator tool first
2. For questions about current events, recent information, or facts you're unsure about, use the search tool
3. After using tools to gather information, provide a comprehensive final answer
4. If you can answer directly from your knowledge, you may do so without tools
5. Be helpful, accurate, and concise

Context from previous conversations:
{context}

Current conversation:
{chat_history}`],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ]);

    // Create the agent
    const agent = await createToolCallingAgent({
      llm,
      tools,
      prompt,
    });

    // Create the agent executor
    agentExecutor = new AgentExecutor({
      agent,
      tools,
      maxIterations: 5,
      verbose: false,
    });

    console.log('✅ Agent initialized successfully');
    return agentExecutor;
  } catch (error) {
    console.error('❌ Failed to initialize agent:', error);
    throw error;
  }
};

export const processWithAgent = async (input, chatHistory = [], streamCallback = null, fileContext = '') => {
  try {
    // Initialize agent if not already done
    const executor = await initializeAgent();

    // Get relevant context from vector store
    const relevantDocs = await searchSimilarDocuments(input, 2);
    const vectorContext = relevantDocs.map(doc => doc.pageContent).join('\n\n');

    // Combine vector context with file context
    const context = fileContext ? `${vectorContext}\n${fileContext}` : vectorContext;

    // Format chat history
    const formattedHistory = chatHistory.map(msg => {
      // Ensure content is always a string
      const content = typeof msg.content === 'object' ? JSON.stringify(msg.content) : String(msg.content || '');
      return `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${content}`;
    }).join('\n');

    // Prepare the input
    const agentInput = {
      input: String(input || ''),
      context: String(context || ''),
      chat_history: formattedHistory,
    };

    console.log('Agent input prepared:', {
      inputType: typeof agentInput.input,
      contextType: typeof agentInput.context,
      historyType: typeof agentInput.chat_history,
      hasFileContext: fileContext.length > 0
    });

    let finalAnswer = '';
    let toolCalls = [];

    if (streamCallback) {
      // Streaming execution
      const stream = await executor.streamEvents(agentInput, {
        version: "v1",
      });

      for await (const event of stream) {
        if (event.event === "on_tool_start") {
          const toolName = event.name;
          const toolInput = event.data?.input;
          toolCalls.push({ name: toolName, input: toolInput });
          
          streamCallback({
            type: 'tool_start',
            tool: toolName,
            input: toolInput
          });
        }
        
        if (event.event === "on_tool_end") {
          const toolOutput = event.data?.output;
          streamCallback({
            type: 'tool_end',
            output: toolOutput
          });
        }

        if (event.event === "on_chat_model_stream") {
          const chunk = event.data?.chunk?.content;
          if (chunk) {
            streamCallback({
              type: 'token',
              content: chunk
            });
          }
        }
      }

      // Get the final result
      const result = await executor.invoke(agentInput);
      finalAnswer = result.output || 'No answer generated';
    } else {
      // Non-streaming execution
      const result = await executor.invoke(agentInput);
      finalAnswer = result.output || 'No answer generated';
      
      // Extract tool calls from intermediate steps if available
      if (result.intermediateSteps) {
        toolCalls = result.intermediateSteps.map(step => ({
          name: step.action?.tool || 'unknown',
          input: step.action?.toolInput || {}
        }));
      }
    }

    return {
      answer: finalAnswer,
      toolCalls,
      context: relevantDocs.length > 0 ? 'Retrieved relevant context' : 'No relevant context found'
    };

  } catch (error) {
    console.error('Agent execution error:', error);
    return {
      answer: 'I apologize, but I encountered an error while processing your request. Please try again.',
      toolCalls: [],
      context: 'Error occurred'
    };
  }
};

export { initializeAgent };
export const getAgentExecutor = () => agentExecutor;