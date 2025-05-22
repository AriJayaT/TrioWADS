import express from 'express';
import { getAgents, updateUser, getUserTicketsCount, getAgentAssignedCount } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Routes that need authentication
router.use(protect);

// Get all agents (admin only)
router.get('/agents', authorize('admin'), getAgents);

// Update user details (admin or self)
router.put('/:id', updateUser);

// Get ticket count for a user (admin or self)
router.get('/:id/ticket-count', getUserTicketsCount);

// Get assigned tickets count for an agent (admin or self)
router.get('/:id/assigned-count', getAgentAssignedCount);

export default router; 