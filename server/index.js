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
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
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
  pingTimeout: 120000,    // 2 minutes (increased from 60 seconds)
  pingInterval: 30000,    // 30 seconds (increased from 25 seconds)
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  connectTimeout: 60000,  // 1 minute (increased from 45 seconds)
  maxHttpBufferSize: 1e8,
  allowUpgrades: true,
  perMessageDeflate: false,
  upgradeTimeout: 30000,  // 30 seconds for transport upgrades
  allowRequest: (req, callback) => {
    // Accept all requests (you can add more validation here if needed)
    callback(null, true);
  }
});

// Store connected users with their roles and socket IDs - enhanced with caching
const connectedUsers = new Map();
const socketUserCache = new Map(); // Cache for socket user data
const SOCKET_CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache for socket users

// Clean expired socket cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of socketUserCache.entries()) {
    if (now > value.expiresAt) {
      socketUserCache.delete(key);
    }
  }
}, 10 * 60 * 1000); // Clean every 10 minutes

// Export for debugging purposes
export { connectedUsers };

// Attach io to app for access in controllers
app.set('io', io);

// Helper functions for emitting events
export const emitToUser = (userId, event, data) => {
  console.log(`[Socket] Emitting ${event} to user ${userId}:`, {
    ticketId: data?._id || 'no-id',
    ticketSubject: data?.subject || 'no-subject',
    assignedTo: data?.assignedTo?._id || data?.assignedTo || 'no-assignment'
  });
  
  const userInfo = connectedUsers.get(userId);
  if (userInfo) {
    console.log(`[Socket] User ${userId} found with socket ${userInfo.socketId}, role: ${userInfo.role}`);
    
    // Emit to specific socket
    const emitResult1 = io.to(userInfo.socketId).emit(event, data);
    
    // Also emit to user room for redundancy
    const emitResult2 = io.to(`user_${userId}`).emit(event, data);
    
    console.log(`[Socket] Event ${event} emitted successfully to user ${userId} via socket and room`);
    
    // Verify the socket is still connected
    const socketInstance = io.sockets.sockets.get(userInfo.socketId);
    if (!socketInstance || !socketInstance.connected) {
      console.warn(`[Socket] Socket ${userInfo.socketId} for user ${userId} is disconnected, removing from connected users`);
      connectedUsers.delete(userId);
    }
  } else {
    console.log(`[Socket] User ${userId} not found in connected users map, trying room emission`);
    
    // Try emitting to user room anyway in case they're connected but not in the map
    io.to(`user_${userId}`).emit(event, data);
    console.log(`[Socket] Event ${event} emitted to user room user_${userId} as fallback`);
    
    // Also try to find the user by searching all connected sockets
    const allSockets = Array.from(io.sockets.sockets.values());
    const userSocket = allSockets.find(socket => socket.userId === userId);
    if (userSocket && userSocket.connected) {
      console.log(`[Socket] Found disconnected user ${userId} on socket ${userSocket.id}, re-adding to map`);
      connectedUsers.set(userId, {
        socketId: userSocket.id,
        role: userSocket.userInfo?.role || 'unknown',
        agentType: userSocket.userInfo?.agentType || 'unknown',
        lastSeen: Date.now()
      });
      userSocket.emit(event, data);
    }
  }
};

export const emitToRole = (role, event, data) => {
  console.log(`[Socket] Emitting ${event} to role ${role}:`, {
    ticketId: data?._id || 'no-id',
    connectedUsersInRole: Array.from(connectedUsers.entries())
      .filter(([userId, userInfo]) => userInfo.role === role).length
  });
  
  // Emit to role room
  io.to(`role_${role}`).emit(event, data);
  
  // Also emit directly to each user of this role for redundancy
  const usersInRole = Array.from(connectedUsers.entries())
    .filter(([userId, userInfo]) => userInfo.role === role);
  
  console.log(`[Socket] Found ${usersInRole.length} users in role ${role}`);
  
  usersInRole.forEach(([userId, userInfo]) => {
    io.to(userInfo.socketId).emit(event, data);
  });
};

export const emitToAgentType = (agentType, event, data) => {
  io.to(`agent_type_${agentType}`).emit(event, data);
};

export const broadcastToAll = (event, data) => {
  io.emit(event, data);
};

io.on('connection', (socket) => {
  console.log('[Socket] New connection:', socket.id, 'from', socket.handshake.address);
  
  // Log connection details
  console.log('[Socket] Connection transport:', socket.conn.transport.name);
  console.log('[Socket] Connection upgraded:', socket.conn.upgraded);
  
  // Handle transport upgrade
  socket.conn.on('upgrade', () => {
    console.log('[Socket] Connection upgraded to:', socket.conn.transport.name);
  });
  
  // Handle ping/pong for debugging
  socket.on('ping', () => {
    console.log('[Socket] Ping from client:', socket.id);
  });
  
  socket.on('pong', () => {
    console.log('[Socket] Pong from client:', socket.id);
  });
  
  // Handle user authentication
  socket.on('authenticate', async (userId) => {
    try {
      console.log('[Socket] Authenticating user:', userId, 'on socket:', socket.id);
      
      // Store the user ID in the socket
      socket.userId = userId;
      
      // Check cache first to reduce database queries
      let user;
      const cached = socketUserCache.get(userId);
      
      if (cached && Date.now() < cached.expiresAt) {
        // Use cached user data
        user = cached.user;
        console.log('[Socket] Using cached user data for socket auth:', userId);
      } else {
        // Get user details including role from database
        user = await User.findById(userId);
      if (!user) {
        console.error('[Socket] User not found:', userId);
        socket.emit('unauthorized', { message: 'User not found' });
        socket.disconnect();
        return;
        }
        
        // Cache the user data for socket operations
        socketUserCache.set(userId, {
          user: user,
          expiresAt: Date.now() + SOCKET_CACHE_TTL
        });
        console.log('[Socket] Cached user data for socket operations:', userId);
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
      if (user.role === 'agent') {
        console.log(`[Socket] Agent ${userId} joined role_agent room`);
      }
      // If user is an agent, join agent type specific room
      if (user.role === 'agent') {
        socket.join(`agent_type_${user.agentType}`);
        console.log(`[Socket] Agent ${userId} joined agent_type_${user.agentType} room`);
      }
      
      console.log(`[Socket] User ${userId} (${user.role}) authenticated successfully with socket ${socket.id}`);
      socket.emit('authenticated', { role: user.role });
    } catch (error) {
      console.error('[Socket] Authentication error:', error);
      socket.emit('unauthorized', { message: error.message });
      socket.disconnect();
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      // Clear socket-specific cache on disconnect to ensure fresh data on reconnect
      socketUserCache.delete(socket.userId);
      console.log(`[Socket] User ${socket.userId} disconnected from socket ${socket.id}, reason: ${reason} - cache cleared`);
    }
    console.log('[Socket] Socket disconnected:', socket.id, 'reason:', reason);
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error('[Socket] Socket error for', socket.id, ':', error);
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