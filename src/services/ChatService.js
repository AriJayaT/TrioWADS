// ChatService.js - Handles chat functionality and agent communication

// Simulated chat agents
const chatAgents = [
  { id: 'agent-1', name: 'Emily', online: true },
  { id: 'agent-2', name: 'Michael', online: true },
  { id: 'agent-3', name: 'Sarah', online: false }
];

// Simulated canned responses based on keywords
const cannedResponses = {
  'shipping': 'Standard shipping takes 3-5 business days within the continental US. International shipping can take 7-14 business days depending on the destination.',
  'return': 'We offer a 30-day return policy for all products in their original condition with tags attached.',
  'clean': 'For most plush toys, we recommend spot cleaning with a damp cloth and mild soap. For deeper cleaning, hand wash in cold water and air dry.',
  'hello': 'Hello there! How can I help you today with your Jellycat plush toys?',
  'hi': 'Hi! How may I assist you with your Jellycat plush toys today?',
  'help': 'I\'d be happy to help! What questions do you have about our products or services?',
  'price': 'Our plush toys range from $15 to $65 depending on size and design. Is there a specific Jellycat plush you\'re interested in?'
};

/**
 * Simulates sending a message to the chat system
 * @param {string} message - The message text
 * @returns {Promise<Object>} - Response with agent info and message
 */
export const sendMessage = async (message) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  // Find an available agent
  const availableAgents = chatAgents.filter(agent => agent.online);
  const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
  
  // Check for keyword matches in message
  const messageLower = message.toLowerCase();
  let responseContent = '';
  
  // Look for keyword matches
  for (const [keyword, response] of Object.entries(cannedResponses)) {
    if (messageLower.includes(keyword)) {
      responseContent = response;
      break;
    }
  }
  
  // If no keyword match, use generic response
  if (!responseContent) {
    const genericResponses = [
      "Thank you for your message. I'll be happy to help with that.",
      "I understand your question. Let me provide some information for you.",
      "Thanks for reaching out! I can certainly assist with that.",
      "I'd be happy to help with your inquiry. Here's what you need to know.",
      "Let me answer that for you."
    ];
    
    responseContent = genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }
  
  return {
    agentId: randomAgent.id,
    agentName: randomAgent.name,
    content: responseContent,
    timestamp: new Date().toISOString()
  };
};

/**
 * Get the chat availability status
 * @returns {Promise<Object>} - Availability status
 */
export const getChatAvailability = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const availableAgents = chatAgents.filter(agent => agent.online);
  
  return {
    available: availableAgents.length > 0,
    agentsAvailable: availableAgents.length,
    estimatedWaitTime: availableAgents.length > 0 ? '~2 minutes' : 'Available from 9am-5pm'
  };
};

export default {
  sendMessage,
  getChatAvailability
}; 