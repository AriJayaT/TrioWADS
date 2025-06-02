import express from 'express';
import { chatWithAI, getSuggestedQuestions, createAssistant } from '../controllers/chatbotController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for chatbot API
const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many chat requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/chatbot/chat:
 *   post:
 *     summary: Send message to AI chatbot
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's message to the chatbot
 *               conversationHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     isBot:
 *                       type: boolean
 *                     timestamp:
 *                       type: string
 *                 description: Recent conversation history for context
 *     responses:
 *       200:
 *         description: AI response with related articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: AI generated response
 *                 relatedArticles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       category:
 *                         type: string
 *       400:
 *         description: Message is required
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.post('/chat', chatbotLimiter, chatWithAI);

/**
 * @swagger
 * /api/chatbot/suggestions:
 *   get:
 *     summary: Get suggested questions for the chatbot
 *     tags: [Chatbot]
 *     responses:
 *       200:
 *         description: List of suggested questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get('/suggestions', getSuggestedQuestions);

/**
 * @swagger
 * /api/chatbot/create-assistant:
 *   post:
 *     summary: Create a new OpenAI Assistant
 *     tags: [Chatbot]
 *     responses:
 *       200:
 *         description: Assistant created successfully
 *       500:
 *         description: Server error
 */
router.post('/create-assistant', createAssistant);

export default router; 