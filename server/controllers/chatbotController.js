import OpenAI from 'openai';
import dotenv from 'dotenv';

// Configure dotenv for ES modules
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Verify API key is present
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

console.log('OpenAI client initialized successfully with Assistants API');

// Store for conversation threads (in production, use a database)
const conversationThreads = new Map();

// Assistant ID - Replace with your actual assistant ID from OpenAI
const ASSISTANT_ID = "asst_R5Esxiqw9kjIwsVD3uAtQciv";

/**
 * Create or get conversation thread for a user session
 */
const getOrCreateThread = async (sessionId) => {
  try {
    if (conversationThreads.has(sessionId)) {
      return conversationThreads.get(sessionId);
    }

    // Create new thread
    const thread = await openai.beta.threads.create();
    conversationThreads.set(sessionId, thread.id);
    
    console.log(`Created new thread ${thread.id} for session ${sessionId}`);
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

/**
 * Generate AI response using OpenAI Assistants API
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, sessionId = `session_${Date.now()}` } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    // Get or create thread for this conversation
    const threadId = await getOrCreateThread(sessionId);

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    
    const maxAttempts = 30; // 30 seconds max wait
    let attempts = 0;
    
    while ((runStatus.status === 'in_progress' || runStatus.status === 'queued') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      attempts++;
    }

    if (runStatus.status === 'completed') {
      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
      
      if (assistantMessage) {
        const responseText = assistantMessage.content[0].text.value;

        return res.json({
          response: responseText,
          threadId: threadId,
          sessionId: sessionId
        });
      }
    } else if (runStatus.status === 'failed') {
      console.error('Assistant run failed:', runStatus.last_error);
      throw new Error('Assistant run failed: ' + runStatus.last_error?.message);
    } else if (runStatus.status === 'expired') {
      throw new Error('Assistant run expired - please try again');
    }

    throw new Error('Assistant run timed out - please try again');

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.status(503).json({
        error: 'AI service temporarily unavailable. Please try again later.'
      });
    }
    
    if (error.code === 'invalid_api_key') {
      console.error('Invalid OpenAI API key');
      return res.status(500).json({
        error: 'AI service configuration error.'
      });
    }

    res.status(500).json({
      error: error.message || 'An error occurred while processing your request. Please try again.'
    });
  }
};

/**
 * Create YipHelp Assistant (helper endpoint)
 */
export const createAssistant = async (req, res) => {
  try {
    const assistant = await openai.beta.assistants.create({
      name: "YipHelp Support Assistant",
      instructions: "You will configure the instructions directly in the OpenAI website.",
      tools: [{ type: "file_search" }],
      model: "gpt-4o-mini",
      temperature: 0.7
    });

    res.json({
      assistant_id: assistant.id,
      message: "Assistant created successfully! Copy this ID and replace ASSISTANT_ID in your code.",
      note: "Configure the assistant instructions and upload knowledge base files directly in the OpenAI website."
    });
  } catch (error) {
    console.error('Error creating assistant:', error);
    res.status(500).json({
      error: 'Failed to create assistant: ' + error.message
    });
  }
};

/**
 * Get suggested questions for the chatbot
 */
export const getSuggestedQuestions = async (req, res) => {
  try {
    const suggestedQuestions = [
      "How do I care for my Jellycat plush toy?",
      "What is your return policy?",
      "How can I track my order?",
      "Are Jellycat toys safe for babies?",
      "How do I clean my plush toy?",
      "What sizes are available?",
      "Do you offer international shipping?",
      "How can I contact customer support?"
    ];

    res.json({
      questions: suggestedQuestions
    });
  } catch (error) {
    console.error('Error getting suggested questions:', error);
    res.status(500).json({
      error: 'Error loading suggested questions'
    });
  }
};