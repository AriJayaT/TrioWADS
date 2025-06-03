import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Test environment variables
console.log('Testing environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Not Set',
  EMAIL_PASSWORD_LENGTH: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not Set',
  OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
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
import chatbotRoutes from './routes/chatbotRoutes.js';
import './scheduler/escalationJob.js'; // Import the escalation job
import User from './models/User.js';

// Initialize express app
const app = express();

// This is more secure than 'true' which trusts all proxies
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

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
  origin: ['e2425-wads-l4acg3-client.csbihub.id'],
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
        url: "https://e2425-wads-l4acg3-server.csbihub.id",
        description: 'Production server'
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

// Root route - Add this line right after the health check route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Use route files
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);

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

// --- SIMPLIFIED SOCKET.IO SETUP ---
import { Server as SocketIOServer } from 'socket.io';

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Simple connected users map - just store user ID to socket ID mapping
const connectedUsers = new Map();

// Export connectedUsers for debugging purposes
export { connectedUsers };

// Attach io to app for access in controllers
app.set('io', io);

// Simple helper functions for emitting events
export const emitToUser = (userId, event, data) => {
  // Ensure userId is always a string for consistent lookup
  const userIdString = userId.toString();
  console.log(`[Socket] Emitting ${event} to user ${userIdString}`);
  
  const userInfo = connectedUsers.get(userIdString);
  if (userInfo && userInfo.socketId) {
    io.to(userInfo.socketId).emit(event, data);
    console.log(`[Socket] Event ${event} sent to user ${userIdString} via socket ${userInfo.socketId}`);
  } else {
    console.log(`[Socket] User ${userIdString} not connected`);
  }
};

export const emitToRole = (role, event, data) => {
  console.log(`[Socket] Emitting ${event} to role ${role}`);
  io.to(`role_${role}`).emit(event, data);
};

export const emitToAgentType = (agentType, event, data) => {
  console.log(`[Socket] Emitting ${event} to agent type ${agentType}`);
  io.to(`agent_type_${agentType}`).emit(event, data);
};

export const broadcastToAll = (event, data) => {
  console.log(`[Socket] Broadcasting ${event} to all users`);
  io.emit(event, data);
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', async (userId) => {
    try {
      console.log(`[Socket] Authenticating user ${userId} on socket ${socket.id}`);
      
      // Get user from database
      const user = await User.findById(userId);
      if (!user) {
        console.error(`[Socket] User ${userId} not found`);
        socket.emit('unauthorized', { message: 'User not found' });
        return;
      }

      // Store user mapping with complete info - ensure userId is always a string
      const userIdString = userId.toString();
      const userInfo = {
        socketId: socket.id,
        role: user.role,
        agentType: user.agentType,
        lastSeen: Date.now()
      };
      connectedUsers.set(userIdString, userInfo);
      socket.userId = userIdString;
      socket.userRole = user.role;

      // Join user-specific room
      socket.join(`user_${userIdString}`);
      
      // Join role-specific room
      socket.join(`role_${user.role}`);
      
      // If agent, also join agent type room
      if (user.role === 'agent' && user.agentType) {
        socket.join(`agent_type_${user.agentType}`);
      }

      console.log(`[Socket] User ${userIdString} (${user.role}) authenticated and joined rooms`);
      socket.emit('authenticated', { role: user.role });

    } catch (error) {
      console.error(`[Socket] Authentication error for user ${userId}:`, error);
      socket.emit('unauthorized', { message: 'Authentication failed' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`[Socket] User ${socket.userId} disconnected`);
    } else {
      console.log(`[Socket] Socket ${socket.id} disconnected`);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server is running`);
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
