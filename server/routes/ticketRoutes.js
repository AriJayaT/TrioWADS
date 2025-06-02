import express from 'express';
import { 
  getTickets,
  createTicket,
  getTicket, 
  updateTicket,
  addReply,
  getTicketStats,
  getAgentStats,
  fixTicketAssignments,
  submitRating,
  getAgentRatings,
  getTicketRating,
  removeTicketFromView,
  escalateTicket,
  getRecentRatings
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Rating from '../models/Rating.js';

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
 *     summary: Get ticket statistics (admin only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket statistics retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/stats', authorize('admin'), getTicketStats);

/**
 * @swagger
 * /api/tickets/distribution:
 *   get:
 *     summary: Get basic ticket distribution (all authenticated users)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket distribution retrieved successfully
 *       401:
 *         description: Not authorized
 */
router.get('/distribution', getTicketStats);

/**
 * @swagger
 * /api/tickets/agent/stats:
 *   get:
 *     summary: Get agent-specific ticket statistics
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent-specific statistics retrieved successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized - agents only
 */
router.get('/agent/stats', protect, authorize('agent'), getAgentStats);

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

/**
 * @swagger
 * /api/tickets/{id}/escalate:
 *   post:
 *     summary: Escalate a ticket
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
 *         description: Ticket escalated successfully
 *       400:
 *         description: Only open tickets can be escalated
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized to escalate this ticket
 *       404:
 *         description: Ticket not found
 */
router.post('/:id/escalate', protect, escalateTicket);

/**
 * Test route for debugging socket events
 */
router.get('/test-socket/:ticketId/:agentId', protect, authorize('admin'), async (req, res) => {
  try {
    const { ticketId, agentId } = req.params;
    
    const ticket = await Ticket.findById(ticketId).populate('user', 'name email').populate('assignedTo', 'name email');
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Test the socket emission
    const { emitToUser, emitToRole } = await import('../index.js');
    
    console.log(`[TEST] Emitting ticket_assigned event for ticket ${ticketId} to agent ${agentId}`);
    emitToUser(agentId, 'ticket_assigned', ticket);
    emitToRole('agent', 'ticket_updated', ticket);
    
    res.json({ 
      success: true, 
      message: 'Test socket events sent',
      ticket: ticket
    });
  } catch (error) {
    console.error('Test socket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Debug route to check socket connections
 */
router.get('/debug/connections', protect, authorize('admin'), async (req, res) => {
  try {
    const { connectedUsers } = await import('../index.js');
    const connections = Array.from(connectedUsers.entries()).map(([userId, info]) => ({
      userId,
      socketId: info.socketId,
      role: info.role,
      agentType: info.agentType,
      lastSeen: new Date(info.lastSeen)
    }));
    
    res.json({ 
      success: true, 
      connectedUsers: connections,
      totalConnections: connections.length
    });
  } catch (error) {
    console.error('Debug connections error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Debug route to test socket events directly
 */
router.post('/debug/test-socket/:ticketId/:agentId', protect, authorize('admin'), async (req, res) => {
  try {
    const { ticketId, agentId } = req.params;
    const { emitToUser, emitToRole } = await import('../index.js');
    
    console.log(`[Debug] Testing socket events for ticket ${ticketId} -> agent ${agentId}`);
    
    // Get the ticket with full population
    const ticket = await Ticket.findById(ticketId)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email agentType role');
      
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Get agent info
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    console.log(`[Debug] Emitting test events:`, {
      ticketId: ticket._id,
      agentId: agent._id,
      agentName: agent.name,
      ticketSubject: ticket.subject
    });
    
    // Emit test events
    emitToUser(agentId, 'ticket_assigned', ticket);
    emitToUser(agentId, 'ticket_updated', ticket);
    emitToRole('agent', 'ticket_assigned', ticket);
    emitToRole('agent', 'ticket_updated', ticket);
    
    res.json({ 
      success: true, 
      message: 'Test socket events emitted',
      ticket: {
        id: ticket._id,
        subject: ticket.subject,
        assignedTo: agent.name
      }
    });
  } catch (error) {
    console.error('Debug test socket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Debug route to force assignment test
 */
router.post('/debug/force-assign/:ticketId/:agentId', protect, authorize('admin'), async (req, res) => {
  try {
    const { ticketId, agentId } = req.params;
    
    console.log(`[Debug] Force assigning ticket ${ticketId} to agent ${agentId}`);
    
    // Update ticket assignment
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { 
        assignedTo: agentId, 
        status: 'in-progress',
        lastActivity: new Date()
      },
      { new: true }
    ).populate('user', 'name email')
     .populate('assignedTo', 'name email agentType role');
    
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const { emitToUser, emitToRole } = await import('../index.js');
    
    // Create notification
    const notification = await Notification.create({
      recipient: agentId,
      message: `[DEBUG] You have been assigned to ticket "${updatedTicket.subject}"`,
      type: 'ticket_assigned',
      role: 'agent',
      ticketId: updatedTicket._id
    });
    
    // Emit all relevant events
    emitToUser(agentId, 'ticket_assigned', updatedTicket);
    emitToUser(agentId, 'ticket_updated', updatedTicket);
    emitToUser(agentId, 'new_notification', notification);
    emitToRole('agent', 'ticket_assigned', updatedTicket);
    emitToRole('agent', 'ticket_updated', updatedTicket);
    emitToRole('admin', 'ticket_assigned', updatedTicket);
    
    console.log(`[Debug] Force assignment completed with events emitted`);
    
    res.json({ 
      success: true, 
      message: 'Force assignment completed',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Debug force assign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Comprehensive debug route to test socket assignment flow
 */
router.post('/debug/test-assignment/:ticketId/:agentId', protect, authorize('admin'), async (req, res) => {
  try {
    const { ticketId, agentId } = req.params;
    const { connectedUsers, emitToUser, emitToRole } = await import('../index.js');
    
    console.log(`\n=== ASSIGNMENT DEBUG TEST ===`);
    console.log(`Ticket ID: ${ticketId}`);
    console.log(`Agent ID: ${agentId}`);
    console.log(`Agent ID type: ${typeof agentId}`);
    
    // Check connected users
    console.log(`\n--- Connected Users ---`);
    const connections = Array.from(connectedUsers.entries());
    console.log(`Total connected: ${connections.length}`);
    connections.forEach(([userId, info]) => {
      console.log(`User ${userId} (${typeof userId}): ${info.role} - Socket ${info.socketId}`);
    });
    
    // Check if target agent is connected
    const agentConnected = connectedUsers.has(agentId);
    const agentConnectedAsString = connectedUsers.has(agentId.toString());
    console.log(`\n--- Agent Connection Status ---`);
    console.log(`Agent ${agentId} connected (direct): ${agentConnected}`);
    console.log(`Agent ${agentId} connected (as string): ${agentConnectedAsString}`);
    
    // Get ticket and agent info
    const ticket = await Ticket.findById(ticketId)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email agentType role');
      
    const agent = await User.findById(agentId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    console.log(`\n--- Ticket & Agent Info ---`);
    console.log(`Ticket: ${ticket.subject}`);
    console.log(`Agent: ${agent.name} (${agent.role})`);
    
    // Test socket emissions with detailed logging
    console.log(`\n--- Testing Socket Emissions ---`);
    
    console.log(`1. Testing emitToUser with original agentId: ${agentId}`);
    emitToUser(agentId, 'test_assignment_1', { 
      message: 'Test 1: Original agentId',
      ticketId,
      agentId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`2. Testing emitToUser with agentId.toString(): ${agentId.toString()}`);
    emitToUser(agentId.toString(), 'test_assignment_2', { 
      message: 'Test 2: agentId.toString()',
      ticketId,
      agentId: agentId.toString(),
      timestamp: new Date().toISOString()
    });
    
    console.log(`3. Testing emitToRole for agents`);
    emitToRole('agent', 'test_assignment_3', { 
      message: 'Test 3: Role-based emission',
      ticketId,
      agentId,
      timestamp: new Date().toISOString()
    });
    
    // Simulate actual assignment events
    console.log(`\n--- Simulating Real Assignment Events ---`);
    
    const testNotification = {
      recipient: agentId,
      message: `[TEST] You have been assigned to ticket "${ticket.subject}"`,
      type: 'ticket_assigned',
      role: 'agent',
      ticketId: ticket._id,
      timestamp: new Date()
    };
    
    emitToUser(agentId, 'ticket_assigned', ticket);
    emitToUser(agentId, 'ticket_updated', ticket);
    emitToUser(agentId, 'new_notification', testNotification);
    emitToRole('agent', 'ticket_assigned', ticket);
    emitToRole('admin', 'ticket_assigned', ticket);
    
    console.log(`=== DEBUG TEST COMPLETE ===\n`);
    
    res.json({ 
      success: true, 
      message: 'Assignment debug test completed - check server logs',
      data: {
        ticketId,
        agentId,
        agentIdType: typeof agentId,
        agentConnected,
        agentConnectedAsString,
        totalConnections: connections.length,
        connectedUsers: connections.map(([userId, info]) => ({
          userId,
          userIdType: typeof userId,
          role: info.role,
          socketId: info.socketId
        }))
      }
    });
  } catch (error) {
    console.error('Debug assignment test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test endpoint to create sample data for metrics testing (remove in production)
router.post('/test/create-sample-data', protect, authorize('admin'), async (req, res) => {
  try {
    const agentId = req.body.agentId || req.user.id;
    
    // Create sample tickets with various statuses
    const sampleTickets = [];
    for (let i = 0; i < 5; i++) {
      const ticket = new Ticket({
        subject: `Sample Ticket ${i + 1}`,
        description: 'This is a sample ticket for testing metrics',
        priority: ['low', 'medium', 'high'][i % 3],
        assignedTo: agentId,
        status: i < 2 ? 'resolved' : 'open',
        resolvedAt: i < 2 ? new Date() : null,
        user: req.user.id // Using current user as customer for simplicity
      });
      
      await ticket.save();
      sampleTickets.push(ticket);
    }
    
    // Create sample ratings
    for (let i = 0; i < 3; i++) {
      const rating = new Rating({
        ticket: sampleTickets[i]._id,
        user: req.user.id,
        agent: agentId,
        rating: 4 + (i % 2), // Ratings of 4 or 5
        feedback: `Great service on ticket ${i + 1}`
      });
      
      await rating.save();
    }
    
    res.json({
      success: true,
      message: 'Sample data created successfully',
      tickets: sampleTickets.length,
      ratings: 3
    });
    
  } catch (error) {
    console.error('Error creating sample data:', error);
    res.status(500).json({ error: 'Failed to create sample data' });
  }
});

export default router; 