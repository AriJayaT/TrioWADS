import Ticket from '../models/Ticket.js';
import TicketReply from '../models/TicketReply.js';
import User from '../models/User.js';

/**
 * Get all tickets (with filtering options)
 * @route GET /api/tickets
 * @access Private (Admin/Agent)
 */
export const getTickets = async (req, res) => {
  try {
    const { status, priority, category, assignedTo, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;

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

    // Create ticket
    const ticket = await Ticket.create({
      subject,
      description,
      category,
      subcategory,
      user: req.user.id,
      attachments: attachments || [],
      // For tickets created by agents/admins, they can set the priority directly
      priority: req.body.priority || 'medium',
      // If an agent creates a ticket, they can immediately assign it
      assignedTo: req.user.role !== 'customer' && req.body.assignedTo ? req.body.assignedTo : null
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
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email profileImage')
      .populate('assignedTo', 'name email profileImage');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has permission to view ticket
    if (req.user.role === 'customer' && ticket.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this ticket' });
    }

    // Get ticket replies
    const replies = await TicketReply.find({ ticket: req.params.id })
      .populate('user', 'name email profileImage role')
      .sort({ createdAt: 1 });

    // Filter out internal notes for customers
    const filteredReplies = req.user.role === 'customer' 
      ? replies.filter(reply => !reply.isInternal)
      : replies;

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

    // Customers can only close tickets, not update other fields
    if (req.user.role === 'customer') {
      if (req.body.status && req.body.status !== 'closed') {
        return res.status(403).json({ error: 'Customers can only close their tickets' });
      }
      ticket.status = 'closed';
    } else {
      // Agents and admins can update all fields
      if (status) ticket.status = status;
      if (priority) ticket.priority = priority;
      if (assignedTo) ticket.assignedTo = assignedTo;
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

    // Create the reply
    const reply = await TicketReply.create({
      ticket: req.params.id,
      user: req.user.id,
      message,
      attachments: attachments || [],
      isInternal: isInternal && req.user.role !== 'customer' // Only staff can add internal notes
    });

    // Update ticket status based on who replied
    if (req.user.role === 'customer') {
      ticket.status = 'open'; // Customer reply reopens the ticket if it was closed
    } else {
      ticket.status = 'waiting-for-customer'; // Staff reply sets status to waiting for customer
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

    // Overall counts
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: 'open' });
    const inProgress = await Ticket.countDocuments({ status: 'in-progress' });
    const waitingForCustomer = await Ticket.countDocuments({ status: 'waiting-for-customer' });
    const resolved = await Ticket.countDocuments({ status: 'resolved' });
    const closed = await Ticket.countDocuments({ status: 'closed' });

    // Priority counts
    const highPriority = await Ticket.countDocuments({ priority: 'high' });
    const mediumPriority = await Ticket.countDocuments({ priority: 'medium' });
    const lowPriority = await Ticket.countDocuments({ priority: 'low' });

    // Category breakdown
    const categoryBreakdown = await Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent activity
    const recentTickets = await Ticket.find()
      .populate('user', 'name')
      .sort({ lastUpdated: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        total,
        statusCounts: { open, inProgress, waitingForCustomer, resolved, closed },
        priorityCounts: { high: highPriority, medium: mediumPriority, low: lowPriority },
        categoryBreakdown,
        recentActivity: recentTickets
      }
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 