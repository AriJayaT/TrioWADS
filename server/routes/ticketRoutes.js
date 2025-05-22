import express from 'express';
import { 
  getTickets,
  createTicket,
  getTicket, 
  updateTicket,
  addReply,
  getTicketStats,
  fixTicketAssignments,
  submitRating,
  getAgentRatings,
  getTicketRating,
  removeTicketFromView
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

/**
 * Utility route to fix ticket assignments
 */
router.get('/fix-assignments', authorize('admin'), fixTicketAssignments);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get all tickets (filtered by user role)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by ticket status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority level
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Not authorized
 */
router.get('/', getTickets);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *               - category
 *               - subcategory
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               subcategory:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       401:
 *         description: Not authorized
 */
router.post('/', createTicket);

/**
 * @swagger
 * /api/tickets/stats:
 *   get:
 *     summary: Get ticket statistics for dashboard
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket statistics
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized for customers
 */
router.get('/stats', getTicketStats);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get a specific ticket by ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket details with replies
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Ticket not found
 */
router.get('/:id', getTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to update this ticket
 *       404:
 *         description: Ticket not found
 */
router.put('/:id', updateTicket);

/**
 * @swagger
 * /api/tickets/{id}/replies:
 *   post:
 *     summary: Add a reply to a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
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
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *               isInternal:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Reply added successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to reply to this ticket
 *       404:
 *         description: Ticket not found
 */
router.post('/:id/replies', addReply);

/**
 * @swagger
 * /api/tickets/{id}/rating:
 *   post:
 *     summary: Submit a rating for a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating value (1-5)
 *               feedback:
 *                 type: string
 *                 description: Optional feedback text
 *     responses:
 *       201:
 *         description: Rating submitted successfully
 *       400:
 *         description: Invalid rating value or ticket already rated
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to rate this ticket
 *       404:
 *         description: Ticket not found
 */
router.post('/:id/rating', protect, submitRating);

/**
 * @swagger
 * /api/tickets/agent/{id}/ratings:
 *   get:
 *     summary: Get ratings for an agent
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent ratings retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to view these ratings
 *       404:
 *         description: Agent not found
 */
router.get('/agent/:id/ratings', protect, authorize('admin', 'agent'), getAgentRatings);

/**
 * @swagger
 * /api/tickets/{id}/rating:
 *   get:
 *     summary: Get the rating for a specific ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Rating retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to view this rating
 *       404:
 *         description: Ticket or rating not found
 */
router.get('/:id/rating', protect, getTicketRating);

/**
 * @swagger
 * /api/tickets/{id}/remove:
 *   put:
 *     summary: Remove a closed ticket from agent's view
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket removed successfully
 *       400:
 *         description: Only closed tickets can be removed
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to remove this ticket
 *       404:
 *         description: Ticket not found
 */
router.put('/:id/remove', protect, authorize('admin', 'agent'), removeTicketFromView);

export default router; 