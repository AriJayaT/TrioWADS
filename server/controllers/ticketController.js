import Ticket from '../models/Ticket.js';
import TicketReply from '../models/TicketReply.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import Rating from '../models/Rating.js';

/**
 * Get all tickets (with filtering options)
 * @route GET /api/tickets
 * @access Private (Admin/Agent)
 */
export const getTickets = async (req, res) => {
  try {
    const { status, priority, category, assignedTo, unassigned, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    // Handle unassigned tickets - filter tickets with no assignedTo or null assignedTo
    if (unassigned === 'true') {
      filter.assignedTo = { $eq: null };
      
      // Exclude closed tickets from unassigned list
      if (!filter.status) {
        filter.status = { $ne: 'closed' };
      }
    }

    // Always exclude removed tickets from results for agents
    if (req.user.role === 'agent' || req.user.role === 'admin') {
      filter.isRemoved = { $ne: true };
    }

    // If user is customer, only return their tickets
    if (req.user.role === 'customer') {
      filter.user = req.user.id;
    }

    const tickets = await Ticket.find(filter)
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Ticket.countDocuments(filter);

    

res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      tickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Create new ticket
 * @route POST /api/tickets
 * @access Private (Customer/Admin/Agent)
 */
export const createTicket = async (req, res) => {
  try {
    const { subject, description, category, subcategory, attachments } = req.body;

    // Validate category and subcategory
    const validCategories = ['Product Issues', 'Orders & Shipping', 'Billing & Payments', 'Account Management', 'General Inquiries'];
    const validSubcategories = {
      'Product Issues': ['Damaged Products', 'Quality Concerns', 'Product Information'],
      'Orders & Shipping': ['Missing Items', 'Delivery Issues', 'Order Status', 'International Shipping'],
      'Billing & Payments': ['Payment Processing', 'Refunds & Returns'],
      'Account Management': ['Login Issues', 'Profile Updates'],
      'General Inquiries': ['Product Availability', 'Store Information', 'Company Policies', 'Feedback & Suggestions']
    };

    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (!validSubcategories[category]?.includes(subcategory)) {
      return res.status(400).json({ error: 'Invalid subcategory for the selected category' });
    }

    // Determine priority based on subcategory
    const priorityMap = {
      // Product Issues
      'Damaged Products': 'high',
      'Quality Concerns': 'medium',
      'Product Information': 'low',
      // Orders & Shipping
      'Missing Items': 'high',
      'Delivery Issues': 'high',
      'Order Status': 'medium',
      'International Shipping': 'medium',
      // Billing & Payments
      'Payment Processing': 'high',
      'Refunds & Returns': 'high',
      // Account Management
      'Login Issues': 'medium',
      'Profile Updates': 'low',
      // General Inquiries
      'Product Availability': 'medium',
      'Store Information': 'low',
      'Company Policies': 'low',
      'Feedback & Suggestions': 'low'
    };

    // Determine the ticket priority
    const priority = priorityMap[subcategory] || 'medium';

    // For tickets created by agents/admins, they can set the priority directly
    const ticketPriority = req.user.role !== 'customer' && req.body.priority ? req.body.priority : priority;

    // Determine if this ticket should be assigned automatically
    let assignedTo = null;

    // If an agent creates a ticket, they can immediately assign it
    if (req.user.role !== 'customer' && req.body.assignedTo) {
      assignedTo = req.body.assignedTo;
    }

    // Create ticket (unassigned by default)
    const ticket = await Ticket.create({
      subject,
      description,
      category,
      subcategory,
      user: req.user.id,
      attachments: attachments || [],
      priority: ticketPriority,
      assignedTo
    });

    // Populate user info
    await ticket.populate('user', 'name email');

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get ticket by ID
 * @route GET /api/tickets/:id
 * @access Private
 */
export const getTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Validate ticketId before querying
    if (!ticketId || ticketId === 'undefined' || ticketId === 'null') {
      return res.status(400).json({ error: 'Invalid ticket ID provided' });
    }
    
    // Check if it's a valid MongoDB ObjectId
    if (!ticketId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }
    
    const ticket = await Ticket.findById(ticketId)
      .populate('user', 'name email profileImage')
      .populate('assignedTo', 'name email profileImage');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has permission to view ticket
    if (req.user.role === 'customer' && ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this ticket' });
    }
    
    // If user is an agent, they can only access tickets assigned to them
    if (req.user.role === 'agent' && 
        ticket.assignedTo && 
        ticket.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this ticket - it is assigned to another agent' });
    }

    // Get ticket replies
    const replies = await TicketReply.find({ ticket: ticketId })
      .populate('user', 'name email profileImage role')
      .sort({ createdAt: 1 });
      
    // Process replies to include sender type and name
    const processedReplies = replies.map(reply => {
      const isCustomer = reply.user.role === 'customer';
      const replyData = reply.toObject();
      
      return {
        ...replyData,
        sender: isCustomer ? 'customer' : 'agent',
        senderName: reply.user.name
      };
    });

    // Filter out internal notes for customers
    const filteredReplies = req.user.role === 'customer' 
      ? processedReplies.filter(reply => !reply.isInternal)
      : processedReplies;

    res.status(200).json({
      success: true,
      ticket,
      replies: filteredReplies
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update ticket
 * @route PUT /api/tickets/:id
 * @access Private (Admin/Agent or ticket owner)
 */
export const updateTicket = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;
    
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has permission to update ticket
    if (req.user.role === 'customer' && ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this ticket' });
    }
    
    // If user is an agent, they can only update tickets assigned to them
    if (req.user.role === 'agent' && 
        ticket.assignedTo && 
        ticket.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this ticket - it is assigned to another agent' });
    }

    // Customers can only close tickets or set to waiting-for-agent, not update other fields
    if (req.user.role === 'customer') {
      if (req.body.status && req.body.status !== 'closed' && req.body.status !== 'waiting-for-agent') {
        return res.status(403).json({ error: 'Customers can only close their tickets or set to waiting for agent' });
      }
      
      // If customer is confirming resolution by marking as closed
      if (req.body.status === 'closed') {
        ticket.status = 'closed';
        
        // If this is a resolution confirmation, log it
        if (ticket.status === 'resolved') {
          console.log(`Ticket ${ticket._id} was confirmed as resolved by customer ${req.user.id}`);
        }
      } else if (req.body.status === 'waiting-for-agent') {
        // If customer is continuing conversation after resolution attempt
        if (ticket.status === 'resolved' || ticket.status === 'closed') {
          console.log(`Ticket ${ticket._id} was reopened by customer ${req.user.id}`);
          ticket.wasReopened = true;
          ticket.reopenCount = (ticket.reopenCount || 0) + 1;
          ticket.previousStatus = ticket.status;
        }
        ticket.status = 'waiting-for-agent';
      }
    } else {
      // Agents and admins can update all fields
      if (status) {
        // Log all status changes clearly
        if (status !== ticket.status) {
          console.log(`Ticket status change: ${ticket._id} from "${ticket.status}" to "${status}" by agent ${req.user.id} (${req.user.name || 'Unknown'})`);
          
          // Track reopen when changing from resolved/closed to any active status
          if (['resolved', 'closed'].includes(ticket.status) && 
              ['open', 'in-progress', 'waiting-for-agent', 'waiting-for-customer'].includes(status)) {
            console.log(`Ticket ${ticket._id} was reopened`);
            ticket.wasReopened = true;
            ticket.reopenCount = (ticket.reopenCount || 0) + 1;
            ticket.previousStatus = ticket.status;
          }
          
          // Special log for resolution
          if (status === 'resolved') {
            console.log(`RESOLUTION: Ticket ${ticket._id} was marked as resolved by agent ${req.user.id} (${req.user.name || 'Unknown'})`);
          }
        }
        ticket.status = status;
      }
      if (priority) ticket.priority = priority;
      
      // Handle ticket assignment
      if (assignedTo) {
        // When an agent is assigning to themselves
        if (req.user.role === 'agent' && assignedTo === req.user.id) {
          // Check if this ticket is already assigned
          if (ticket.assignedTo && ticket.assignedTo.toString() !== req.user.id) {
            return res.status(400).json({ error: 'This ticket is already assigned to another agent' });
          }
          
          // Check agent type compatibility with ticket priority
          if (req.user.agentType === 'Junior' && ticket.priority === 'high') {
            return res.status(400).json({ error: 'Junior agents cannot be assigned high priority tickets' });
          }
          
          if (req.user.agentType === 'Senior' && (ticket.priority === 'low' || ticket.priority === 'medium')) {
            return res.status(400).json({ error: 'Senior agents cannot be assigned low or medium priority tickets' });
          }
          
          // Self-assignment is allowed
          ticket.assignedTo = assignedTo;
          console.log(`Ticket ${ticket._id} self-assigned to agent ${req.user.id} (${req.user.name || 'Unknown'})`);
        }
        // Only admins can reassign tickets to other agents
        else if (req.user.role === 'admin') {
          // Check if the agent exists and get their type before assignment
          const agent = await User.findById(assignedTo);
          if (!agent) {
            return res.status(400).json({ error: 'Agent not found' });
          }
          
          // Enforce agent type and ticket priority matching
          if (agent.agentType === 'Junior' && ticket.priority === 'high') {
            return res.status(400).json({ error: 'Junior agents cannot be assigned high priority tickets' });
          }
          
          if (agent.agentType === 'Senior' && (ticket.priority === 'low' || ticket.priority === 'medium')) {
            return res.status(400).json({ error: 'Senior agents cannot be assigned low or medium priority tickets' });
          }
          
          ticket.assignedTo = assignedTo;
          console.log(`Ticket ${ticket._id} assigned to agent ${assignedTo} by admin ${req.user.id}`);
        }
      }
    }

    // Update lastUpdated timestamp
    ticket.lastUpdated = Date.now();
    
    await ticket.save();

    // Re-fetch with populated fields
    ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Add reply to ticket
 * @route POST /api/tickets/:id/replies
 * @access Private
 */
export const addReply = async (req, res) => {
  try {
    const { message, attachments, isInternal = false } = req.body;
    
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has permission to reply to ticket
    if (req.user.role === 'customer' && ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to reply to this ticket' });
    }

    // Customers cannot add internal notes
    if (req.user.role === 'customer' && isInternal) {
      return res.status(403).json({ error: 'Customers cannot add internal notes' });
    }

    // Get the user's full details for the sender name
    const currentUser = await User.findById(req.user.id);
    
    // Create the reply
    const reply = await TicketReply.create({
      ticket: req.params.id,
      user: req.user.id,
      message,
      attachments: attachments || [],
      isInternal: isInternal && req.user.role !== 'customer', // Only staff can add internal notes
      sender: req.user.role === 'customer' ? 'customer' : 'agent',
      senderName: currentUser.name
    });

    // Update ticket status based on who replied - but don't override a recent manual status change
    // Check if the ticket status was recently updated (within the last 60 seconds)
    const lastStatusUpdateTime = new Date(ticket.lastUpdated || ticket.createdAt);
    const currentTime = new Date();
    const statusJustUpdated = (currentTime - lastStatusUpdateTime) < 60000; // 60 seconds
    
    if (statusJustUpdated) {
      console.log(`Ticket ${ticket._id}: Status was recently updated to '${ticket.status}', preserving this status`);
      // Keep the current status if it was just manually changed
    } else if (req.user.role === 'customer') {
      // Only change status if it wasn't manually set
      if (ticket.status !== 'resolved') {
        ticket.status = 'waiting-for-agent'; // Customer reply sets status to waiting for agent
      }
    } else {
      // For agent replies, only update if not manually set to 'resolved'
      if (ticket.status !== 'resolved') {
        ticket.status = 'waiting-for-customer'; // Staff reply sets status to waiting for customer
      }
    }

    // Update the lastUpdated timestamp
    ticket.lastUpdated = Date.now();
    await ticket.save();

    // Populate user info in the reply
    await reply.populate('user', 'name email profileImage role');

    res.status(201).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get ticket statistics (for admin dashboard)
 * @route GET /api/tickets/stats
 * @access Private (Admin/Agent)
 */
export const getTicketStats = async (req, res) => {
  try {
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    console.log('Getting stats for user:', req.user);

    // Build base filter
    const baseFilter = { isRemoved: { $ne: true } };
    
    // If user is an agent, only show their stats
    if (req.user.role === 'agent') {
      baseFilter.assignedTo = new mongoose.Types.ObjectId(req.user._id);
    }

    console.log('Using filter:', baseFilter);

    // Overall counts
    const total = await Ticket.countDocuments(baseFilter);
    const open = await Ticket.countDocuments({ ...baseFilter, status: 'open' });
    const inProgress = await Ticket.countDocuments({ ...baseFilter, status: 'in-progress' });
    const waitingForCustomer = await Ticket.countDocuments({ ...baseFilter, status: 'waiting-for-customer' });
    const resolved = await Ticket.countDocuments({ ...baseFilter, status: 'resolved' });
    const closed = await Ticket.countDocuments({ ...baseFilter, status: 'closed' });

    console.log('Ticket counts:', { total, open, inProgress, waitingForCustomer, resolved, closed });

    // Get all assigned tickets for this agent/admin
    const allAssignedTickets = await Ticket.find(baseFilter);
    console.log('Found assigned tickets:', allAssignedTickets.length);

    // Get all replies for these tickets
    const allReplies = await TicketReply.find({
      ticket: { $in: allAssignedTickets.map(t => t._id) }
    }).sort({ createdAt: 1 });
    console.log('Found replies:', allReplies.length);

    // Calculate avg response time (time to first agent reply)
    let totalResponseTime = 0;
    let countResponded = 0;
    for (const ticket of allAssignedTickets) {
      const firstReply = allReplies.find(r => 
        r.ticket.toString() === ticket._id.toString() && 
        r.user.toString() === req.user._id.toString()
      );
      if (firstReply) {
        const responseTimeMs = new Date(firstReply.createdAt) - new Date(ticket.createdAt);
        if (responseTimeMs > 0) {
          totalResponseTime += responseTimeMs;
          countResponded++;
        }
      }
    }
    const avgResponseTimeMinutes = countResponded > 0
      ? Math.round(totalResponseTime / countResponded / 60000)
      : 0;

    console.log('Response time calculation:', {
      totalResponseTime,
      countResponded,
      avgResponseTimeMinutes
    });

    // Calculate resolution rate
    const resolvedTicketCount = await Ticket.countDocuments({ 
      ...baseFilter,
      status: { $in: ['resolved', 'closed'] }
    });
    const resolutionRate = total > 0
      ? Math.round((resolvedTicketCount / total) * 100)
      : 0;

    console.log('Resolution rate calculation:', {
      resolvedTicketCount,
      total,
      resolutionRate
    });

    // Average CSAT score
    const ratings = await Rating.find({
      ticket: { $in: allAssignedTickets.map(t => t._id) }
    });
    const csatScore = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : '0.0';

    console.log('CSAT calculation:', {
      ratingsCount: ratings.length,
      csatScore
    });

    const response = {
      success: true,
      stats: {
        total,
        statusCounts: { open, inProgress, waitingForCustomer, resolved, closed },
        metrics: {
          avgResponseTime: avgResponseTimeMinutes,
          resolutionRate,
          csatScore,
          ticketsResolved: resolvedTicketCount
        }
      }
    };

    console.log('Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Fix ticket assignments (developer utility)
 * @route GET /api/tickets/fix-assignments
 * @access Private (Admin only)
 */
export const fixTicketAssignments = async (req, res) => {
  try {
    // Only admins can run this
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Get tickets with empty strings or invalid ObjectIds as assignedTo
    const tickets = await Ticket.find({});
    let fixedCount = 0;
    
    for (const ticket of allAssignedTickets) {
      // Check if assignedTo exists but is invalid
      if (ticket.assignedTo !== undefined && 
          ticket.assignedTo !== null && 
          (ticket.assignedTo === '' || 
           !mongoose.Types.ObjectId.isValid(ticket.assignedTo))) {
        
        ticket.assignedTo = null;
        await ticket.save();
        fixedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Fixed ${fixedCount} tickets with invalid assignments`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Submit a rating for a ticket
 * @route POST /api/tickets/:id/rating
 * @access Private (Customer only)
 */
export const submitRating = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const ticketId = req.params.id;
    
    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Find the ticket
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Ensure the user is the ticket owner
    if (ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only rate your own tickets' });
    }
    
    // Check if the ticket is in a status that allows rating (closed or resolved)
    if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
      return res.status(400).json({ error: 'Only closed or resolved tickets can be rated' });
    }
    
    // Check if this ticket has already been rated
    const existingRating = await Rating.findOne({ ticket: ticketId, user: req.user.id });
    
    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this ticket' });
    }
    
    // Create the rating
    const newRating = await Rating.create({
      ticket: ticketId,
      user: req.user.id,
      agent: ticket.assignedTo,
      rating,
      feedback: feedback || ''
    });
    
    // Update the ticket to mark it as rated
    ticket.status = 'closed';  // Ensure ticket is closed after rating
    ticket.hasRating = true;   // Mark that this ticket has been rated
    await ticket.save();
    
    res.status(201).json({
      success: true,
      rating: newRating
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get agent ratings
 * @route GET /api/tickets/agent/:id/ratings
 * @access Private (Admin/Agent)
 */
export const getAgentRatings = async (req, res) => {
  try {
    const agentId = req.params.id;
    
    // Check if the agent exists
    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Check permissions - agents can only see their own ratings, admins can see all
    if (req.user.role === 'agent' && req.user.id !== agentId) {
      return res.status(403).json({ error: 'You can only view your own ratings' });
    }
    
    // Get the ratings
    const ratings = await Rating.find({ agent: agentId })
      .populate('ticket', 'subject ticketNumber status')
      .populate('user', 'name');
    
    // Calculate average rating
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, item) => sum + item.rating, 0) / totalRatings
      : 0;
    
    // Count ratings by score (1-5)
    const ratingCounts = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    ratings.forEach(rating => {
      ratingCounts[rating.rating] = (ratingCounts[rating.rating] || 0) + 1;
    });
    
    res.status(200).json({
      success: true,
      data: {
        ratings,
        totalRatings,
        averageRating,
        ratingCounts
      }
    });
  } catch (error) {
    console.error('Get agent ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get ratings for a specific ticket
 * @route GET /api/tickets/:id/rating
 * @access Private
 */
export const getTicketRating = async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Get the ticket first to check permissions
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check permissions
    if (req.user.role === 'customer' && ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only view ratings for your own tickets' });
    }
    
    if (req.user.role === 'agent' && 
        ticket.assignedTo && 
        ticket.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only view ratings for tickets assigned to you' });
    }
    
    // Get the rating
    const rating = await Rating.findOne({ ticket: ticketId })
      .populate('user', 'name')
      .populate('agent', 'name');
    
    if (!rating) {
      return res.status(404).json({ error: 'No rating found for this ticket' });
    }
    
    res.status(200).json({
      success: true,
      rating
    });
  } catch (error) {
    console.error('Get ticket rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Remove a ticket from agent's view (doesn't unassign it, just hides it)
 * @route PUT /api/tickets/:id/remove
 * @access Private (Agent/Admin)
 */
export const removeTicketFromView = async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Find the ticket
    let ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check if user has permission to remove this ticket
    if (req.user.role === 'agent' && 
        (!ticket.assignedTo || ticket.assignedTo.toString() !== req.user.id)) {
      return res.status(403).json({ error: 'You can only remove tickets assigned to you' });
    }
    
    // Check if ticket is closed - only closed tickets can be removed
    if (ticket.status !== 'closed') {
      return res.status(400).json({ error: 'Only closed tickets can be removed from view' });
    }
    
    // Mark ticket as removed
    ticket.isRemoved = true;
    
    // Update the lastUpdated timestamp
    ticket.lastUpdated = Date.now();
    
    // Save the ticket
    await ticket.save();
    
    res.status(200).json({
      success: true,
      message: 'Ticket has been removed from your view'
    });
  } catch (error) {
    console.error('Remove ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
/**
 * Get ticket count by category
 * @route GET /api/tickets/distribution
 * @access Private (Admin/Agent)
 */
export const getTicketDistribution = async (req, res) => {
  console.log('DEBUG: req.user =', req.user); // ✅ Check user identity in logs

  try {
    if (!req.user || req.user.role === 'customer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const distribution = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1
        }
      }
    ]);

    res.status(200).json(distribution);
  } catch (error) {
    console.error('Ticket distribution error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};