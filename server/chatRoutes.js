import express from 'express';

const router = express.Router();

// In-memory chat history (replace with DB in production)
const chatHistory = {};
const activeChats = new Map(); // Maps userId to chatId

// Initialize or get existing chat session
router.post('/initialize', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check if user already has an active chat
    let chatId = activeChats.get(userId);
    
    if (!chatId) {
      // Create new chat session
      chatId = `chat_${Date.now()}_${userId}`;
      activeChats.set(userId, chatId);
      chatHistory[chatId] = [];
    }
    
    // Find an available agent
    const io = req.app.get('io');
    const connectedUsers = io.sockets.adapter.rooms;
    const availableAgents = Array.from(connectedUsers.entries())
      .filter(([_, sockets]) => {
        const socket = io.sockets.sockets.get(Array.from(sockets)[0]);
        return socket?.userId && socket.userInfo?.role === 'agent' && socket.userInfo?.agentType === 'support';
      })
      .map(([_, sockets]) => {
        const socket = io.sockets.sockets.get(Array.from(sockets)[0]);
        return socket.userId;
      });

    const recipientId = availableAgents.length > 0 
      ? availableAgents[Math.floor(Math.random() * availableAgents.length)]
      : null;

    res.json({
      chatId,
      recipientId,
      messages: chatHistory[chatId] || []
    });
  } catch (error) {
    console.error('Error initializing chat:', error);
    res.status(500).json({ error: 'Failed to initialize chat' });
  }
});

// Send a chat message
router.post('/messages', async (req, res) => {
  try {
    const { chatId, senderId, recipientId, content } = req.body;
    const message = {
      chatId,
      senderId,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
    };
    // Store message in memory (replace with DB in production)
    if (!chatHistory[chatId]) chatHistory[chatId] = [];
    chatHistory[chatId].push(message);

    // Emit notification to recipient via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('notification', {
        type: 'chat',
        chatId,
        from: senderId,
        content,
        timestamp: message.timestamp,
      });
      io.to(`user_${recipientId}`).emit('new_message', message);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get chat messages
router.get('/messages', (req, res) => {
  const { chatId } = req.query;
  res.json(chatHistory[chatId] || []);
});

export default router; 