import dotenv from 'dotenv';
dotenv.config();

// Test environment variables
console.log('Testing environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Not Set',
  EMAIL_PASSWORD_LENGTH: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0
});

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import http from 'http';

// Local imports
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import './scheduler/escalationJob.js'; // Import the escalation job
import User from './models/User.js';
import chatRoutes from './chatRoutes.js';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDatabase();

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Use helmet middleware with content security policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "http:"],
        imgSrc: ["'self'", "data:", "http:"],
        connectSrc: ["'self'", "http:", "ws:"],
      },
    },
    crossOriginOpenerPolicy: false,
  })
);
app.use(limiter); // Apply rate limiting

// Swagger documentation configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jellycat Support API',
      version: '1.0.0',
      description: 'API documentation for Jellycat Customer Support application',
      contact: {
        name: 'API Support',
        email: 'support@jellycatsupport.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'development'
          ? `http://localhost:${process.env.PORT || 5000}`
          : 'http://api.jellycatsupport.com',
        description: process.env.NODE_ENV === 'development'
          ? 'Development server' 
          : 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './models/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Use route files
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  allowUpgrades: true,
  perMessageDeflate: false
});

// Store connected users with their roles and socket IDs
const connectedUsers = new Map();

// Store chat history
const chatHistory = new Map();

// Attach io to app for access in controllers
app.set('io', io);

// Helper functions for emitting events
export const emitToUser = (userId, event, data) => {
  const userInfo = connectedUsers.get(userId);
  if (userInfo) {
    io.to(userInfo.socketId).emit(event, data);
  }
};

export const emitToRole = (role, event, data) => {
  io.to(`role_${role}`).emit(event, data);
};

export const emitToAgentType = (agentType, event, data) => {
  io.to(`agent_type_${agentType}`).emit(event, data);
};

export const broadcastToAll = (event, data) => {
  io.emit(event, data);
};

io.on('connection', (socket) => {
  console.log('[Socket] New connection:', socket.id);
  
  // Handle user authentication
  socket.on('authenticate', async (userId) => {
    try {
      console.log('[Socket] Authenticating user:', userId);
      
      // Store the user ID in the socket
      socket.userId = userId;
      
      // Get user details including role
      const user = await User.findById(userId);
      if (!user) {
        console.error('[Socket] User not found:', userId);
        socket.emit('unauthorized', { message: 'User not found' });
        socket.disconnect();
        return;
      }
      
      // Store user info in socket for later use
      socket.userInfo = {
        role: user.role,
        agentType: user.agentType
      };
      
      // Store user info in connectedUsers map
      connectedUsers.set(userId, {
        socketId: socket.id,
        role: user.role,
        agentType: user.agentType,
        lastSeen: Date.now()
      });
      
      // Join user-specific room for real-time notifications
      socket.join(`user_${userId}`);
      
      // Join role-specific room
      socket.join(`role_${user.role}`);
      
      // If user is an agent, join agent type specific room
      if (user.role === 'agent') {
        socket.join(`agent_type_${user.agentType}`);
      }
      
      console.log(`[Socket] User ${userId} (${user.role}) authenticated with socket ${socket.id}`);
      socket.emit('authenticated', { role: user.role });
    } catch (error) {
      console.error('[Socket] Authentication error:', error);
      socket.emit('unauthorized', { message: error.message });
      socket.disconnect();
    }
  });

  // Handle chat initialization (customer or agent joins a chat)
  socket.on('join_room', (roomId) => {
    try {
      console.log(`[Socket] User ${socket.userId} joining room:`, roomId);
      socket.join(roomId);
      // If joining a chat room, send chat history
      if (roomId.startsWith('chat_')) {
        const chatId = roomId; // Use roomId directly
        if (chatHistory.has(chatId)) {
          const messages = chatHistory.get(chatId);
          console.log(`[Socket] Sending chat history for room ${roomId}:`, messages.length, 'messages');
          socket.emit('chat_history', messages);
        } else {
          console.log(`[Socket] No chat history found for room ${roomId}`);
        }
      }
    } catch (error) {
      console.error('[Socket] Error joining room:', error);
      socket.emit('error', {
        message: 'Error joining chat room. Please try again.',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle chat messages
  socket.on('send_message', async (message) => {
    try {
      console.log('[Socket] Received message:', message);
      // Get the sender's user info
      const senderInfo = connectedUsers.get(socket.userId);
      if (!senderInfo) {
        throw new Error('Sender not authenticated');
      }
      // Add message ID and timestamp if not present
      const messageWithMetadata = {
        ...message,
        id: message.id || Date.now().toString(),
        timestamp: message.timestamp || new Date().toISOString(),
        sender: senderInfo.role === 'customer' ? 'customer' : 'agent',
        senderName: senderInfo.role === 'customer' ? 'You' : 'Support Agent'
      };
      // Store message in chat history
      if (!chatHistory.has(message.chatId)) {
        chatHistory.set(message.chatId, []);
      }
      const chatMessages = chatHistory.get(message.chatId);
      chatMessages.push(messageWithMetadata);
      chatHistory.set(message.chatId, chatMessages);
      // Ensure sender is in the chat room
      socket.join(message.chatId);
      // Broadcast the message to all users in the chat room
      console.log('[Socket] Emitting new_message to', message.chatId);
      io.to(message.chatId).emit('new_message', messageWithMetadata);
      // Also emit to the sender to ensure message delivery
      socket.emit('new_message', messageWithMetadata);
      // Real-time notification to recipient (like ticket pattern)
      if (message.recipientId) {
        emitToUser(message.recipientId, 'new_message_notification', messageWithMetadata);
      }
    } catch (error) {
      console.error('[Socket] Error handling chat message:', error);
      socket.emit('error', {
        message: 'Error sending message. Please try again.',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle typing status
  socket.on('typing_status', (status) => {
    try {
      const senderInfo = connectedUsers.get(socket.userId);
      if (!senderInfo) {
        throw new Error('Sender not authenticated');
      }

      // Add chatId to the status
      const statusWithChat = {
        ...status,
        userId: socket.userId
      };

      // Broadcast typing status to appropriate users
      if (senderInfo.role === 'customer') {
        // Broadcast to all available agents
        io.to('role_agent').emit('typing_status', statusWithChat);
      } else if (senderInfo.role === 'agent') {
        // Send to specific customer if recipientId is provided
        if (status.recipientId) {
          io.to(`user_${status.recipientId}`).emit('typing_status', statusWithChat);
        }
      }
    } catch (error) {
      console.error('[Socket] Error handling typing status:', error);
    }
  });

  // Handle room leaving
  socket.on('leave_room', (roomId) => {
    try {
      console.log(`[Socket] User ${socket.userId} leaving room:`, roomId);
      socket.leave(roomId);
    } catch (error) {
      console.error('[Socket] Error leaving room:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`[Socket] User ${socket.userId} disconnected`);
    }
    console.log('[Socket] Disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is running on ws://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 