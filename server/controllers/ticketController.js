import Ticket from '../models/Ticket.js';
import TicketReply from '../models/TicketReply.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import Rating from '../models/Rating.js';
import Notification from '../models/Notification.js';
import { emitToUser, emitToRole } from '../index.js';

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

// Add throttling to emitStatsUpdate function (line ~69):
let lastStatsUpdate = 0;
const STATS_UPDATE_THROTTLE = 30000; // 30 seconds

const emitStatsUpdate = async (io) => {
  if (!io) return;

  const now = Date.now();
  if (now - lastStatsUpdate < STATS_UPDATE_THROTTLE) {
    console.log('[Socket] Throttling stats update, too frequent');
    return;
  }
  
  lastStatsUpdate = now;

  try {
    const stats = await getTicketStats();
    emitToRole('admin', 'stats_updated', stats);
    emitToRole('agent', 'stats_updated', stats);
  } catch (error) {
    console.error('Error emitting stats update:', error);
  }
};

/**
 * Create new ticket
 * @route POST /api/tickets
 * @access Private (Customer/Admin/Agent)
 */
export const createTicket = async (req, res) => {
  console.log('[Backend] Entered createTicket controller');
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
      console.log('[Backend] Invalid category:', category);
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (!validSubcategories[category]?.includes(subcategory)) {
      console.log('[Backend] Invalid subcategory:', subcategory, 'for category:', category);
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

    // If an agent creates a ticket, they can immediately assign it
    if (req.user.role !== 'customer' && req.body.assignedTo && !req.body.assignedTo) {
      console.log('[Backend] Invalid assignedTo:', req.body.assignedTo);
      return res.status(400).json({ error: 'Invalid assignedTo' });
    }

    // Determine if this ticket should be assigned automatically
    let assignedTo = null;

    // If an agent creates a ticket, they can immediately assign it
    if (req.user.role !== 'customer' && req.body.assignedTo) {
      assignedTo = req.body.assignedTo;
    }

    // Set deadline to 2 days from now
    const deadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    // Create ticket (unassigned by default)
    const ticket = await Ticket.create({
      subject,
      description,
      category,
      subcategory,
      user: req.user.id,
      attachments: attachments || [],
      priority,
      assignedTo,
      deadline
    });
    console.log('[Backend] Ticket created:', ticket);

    // Populate user info
    await ticket.populate('user', 'name email');

    // Notify all admins of new ticket
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      const notification = await Notification.create({
        recipient: admin._id,
        message: `A new ticket "${ticket.subject}" has been created by ${ticket.user.name}.`,
        type: 'ticket_created',
        role: 'admin',
        ticketId: ticket._id
      });
      emitToUser(admin._id, 'new_notification', notification);
    }

    // If ticket was created with immediate assignment, also send assignment notification
    if (assignedTo) {
      const assignedAgentNotification = await Notification.create({
        recipient: assignedTo,
        message: `You have been assigned to ticket "${ticket.subject}".`,
        type: 'ticket_assigned',
        role: 'agent',
        ticketId: ticket._id
      });
      emitToUser(assignedTo, 'new_notification', assignedAgentNotification);
      emitToUser(assignedTo, 'ticket_assigned', ticket);
      
      // Notify customer about assignment
      const customerNotification = await Notification.create({
        recipient: ticket.user._id,
        message: `Your ticket "${ticket.subject}" has been assigned to a support agent.`,
        type: 'ticket_assigned',
        role: 'customer',
        ticketId: ticket._id
      });
      emitToUser(ticket.user._id, 'new_notification', customerNotification);
      emitToUser(ticket.user._id, 'ticket_assigned', ticket);
    }

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      // Notify the customer
      emitToUser(ticket.user._id, 'new_ticket', ticket);
      // Notify admins
      emitToRole('admin', 'new_ticket', ticket);
      // Emit stats update
      await emitStatsUpdate(io);
    }

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
        ticket.assignedTo._id.toString() !== req.user.id.toString()) {
      console.log('Ticket assignedTo:', ticket.assignedTo?._id?.toString());
      console.log('Current user id:', req.user.id.toString());
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
    const ticketId = req.params.id;

    // Validate ticketId
    if (!ticketId || !mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Build update object
    const updateData = {};
    if (status) {
      updateData.status = status;
      // Set resolvedAt when ticket is resolved or closed
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
      }
    }
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;

    // Update ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $set: updateData },
      { new: true }
    ).populate('user', 'name email')
     .populate('assignedTo', 'name email agentType role');

    // Handle assignment notification and real-time updates
    if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
      console.log(`[TicketController] Ticket ${ticketId} assigned to agent ${assignedTo}`);
      
      const notification = await Notification.create({
        recipient: assignedTo,
        message: `You have been assigned to ticket "${ticket.subject}"`,
        type: 'ticket_assigned',
        role: 'agent',
        ticketId: ticket._id
      });

      // Ensure the updated ticket has properly populated assignedTo
      const fullyPopulatedTicket = await Ticket.findById(ticketId)
        .populate('user', 'name email')
        .populate('assignedTo', 'name email agentType role');

      console.log(`[TicketController] Emitting ticket_assigned to agent ${assignedTo}:`, {
        ticketId: fullyPopulatedTicket._id,
        assignedToId: fullyPopulatedTicket.assignedTo?._id,
        assignedToName: fullyPopulatedTicket.assignedTo?.name,
        socketData: {
          subject: fullyPopulatedTicket.subject,
          priority: fullyPopulatedTicket.priority,
          status: fullyPopulatedTicket.status
        }
      });

      // Notify the assigned agent with the full ticket data - multiple events for reliability
      emitToUser(assignedTo, 'ticket_assigned', fullyPopulatedTicket);
      emitToUser(assignedTo, 'ticket_updated', fullyPopulatedTicket);
      emitToUser(assignedTo, 'new_notification', notification);

      // Also notify the customer about the assignment (only if customer is not the assigned agent)
      if (ticket.user._id.toString() !== assignedTo) {
        const customerNotification = await Notification.create({
          recipient: ticket.user._id,
          message: `Your ticket "${ticket.subject}" has been assigned to a support agent.`,
          type: 'ticket_assigned',
          role: 'customer',
          ticketId: ticket._id
        });
        emitToUser(ticket.user._id, 'new_notification', customerNotification);
        emitToUser(ticket.user._id, 'ticket_assigned', fullyPopulatedTicket);
        emitToUser(ticket.user._id, 'ticket_updated', fullyPopulatedTicket);
      }
      
      // Notify all admins about the assignment
      emitToRole('admin', 'ticket_assigned', fullyPopulatedTicket);
      emitToRole('admin', 'ticket_updated', fullyPopulatedTicket);
      
      // Notify all agents about the assignment for dashboard updates
      // Use multiple events to ensure all components get updated
      emitToRole('agent', 'ticket_assigned', fullyPopulatedTicket);
      emitToRole('agent', 'ticket_updated', fullyPopulatedTicket);
      
      console.log(`[TicketController] All socket events emitted for ticket assignment ${ticketId} -> ${assignedTo}`);
    }

    // Handle ticket closure notification
    if (status === 'closed' && ticket.status !== 'closed') {
      const customerNotification = await Notification.create({
        recipient: ticket.user._id,  // Fix: Use ticket.user._id instead of ticket.user
        message: `Your ticket "${ticket.subject}" has been closed.`,
        type: 'ticket_closed',
        role: 'customer',
        ticketId: ticket._id
      });
      emitToUser(ticket.user._id, 'new_notification', customerNotification);

      // Notify the assigned agent if different from the one who closed it
      if (ticket.assignedTo && ticket.assignedTo.toString() !== req.user.id) {
        const agentNotification = await Notification.create({
          recipient: ticket.assignedTo,
          message: `Ticket "${ticket.subject}" has been closed.`,
          type: 'ticket_closed',
          role: 'agent',
          ticketId: ticket._id
        });
        emitToUser(ticket.assignedTo._id, 'new_notification', agentNotification);
      }
      
      // Emit specific ticket closed event
      emitToUser(ticket.user._id, 'ticket_closed', updatedTicket);
      if (ticket.assignedTo) {
        emitToUser(ticket.assignedTo._id, 'ticket_closed', updatedTicket);
      }
      emitToRole('admin', 'ticket_closed', updatedTicket);
    }

    // Handle status changes (emit specific status change events)
    if (status && status !== ticket.status) {
      console.log(`[TicketController] Status changed from ${ticket.status} to ${status}`);
      
      // Emit status change event to all relevant parties
      emitToUser(ticket.user._id, 'ticket_status_changed', updatedTicket);
      if (ticket.assignedTo) {
        emitToUser(ticket.assignedTo._id, 'ticket_status_changed', updatedTicket);
      }
      emitToRole('admin', 'ticket_status_changed', updatedTicket);
    }

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      const notifiedUsers = new Set(); // Track users already notified to prevent duplicates
      
      // Notify ticket owner
      if (ticket.user._id) {
        emitToUser(ticket.user._id, 'ticket_updated', updatedTicket);
        notifiedUsers.add(ticket.user._id.toString());
      }
      
      // Notify assigned agent if different from ticket owner
      if (ticket.assignedTo && ticket.assignedTo._id && !notifiedUsers.has(ticket.assignedTo._id.toString())) {
        emitToUser(ticket.assignedTo._id, 'ticket_updated', updatedTicket);
        notifiedUsers.add(ticket.assignedTo._id.toString());
      }
      
      // Notify admins (but only those not already notified)
      emitToRole('admin', 'ticket_updated', updatedTicket);
      
      // Emit stats update
      await emitStatsUpdate(io);
    }

    res.status(200).json({
      success: true,
      ticket: updatedTicket
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
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Create a new TicketReply document instead of pushing to virtual field
    const newReply = new TicketReply({
      ticket: ticket._id,
      user: req.user.id,
      message: req.body.message,
      attachments: req.body.attachments || [],
      sender: req.user.role === 'customer' ? 'customer' : 'agent',
      senderName: req.user.name
    });

    // Save the reply
    const savedReply = await newReply.save();

    // Update last activity timestamp on the ticket
    ticket.lastUpdated = new Date();
    await ticket.save();

    // Populate the reply with user information for response
    const populatedReply = await TicketReply.findById(savedReply._id)
      .populate('user', 'name email role');

    // Notify the other party
    if (req.user.role === 'customer') {
      // Notify assigned agent (if any)
      if (ticket.assignedTo) {
        const notification = await Notification.create({
          recipient: ticket.assignedTo._id,
          message: `Customer replied to ticket "${ticket.subject}".`,
          type: 'ticket_reply',
          role: 'agent',
          ticketId: ticket._id
        });
        emitToUser(ticket.assignedTo._id, 'new_notification', notification);
      }
      // Also notify admins about customer reply
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        const adminNotification = await Notification.create({
          recipient: admin._id,
          message: `Customer replied to ticket "${ticket.subject}".`,
          type: 'ticket_reply',
          role: 'admin',
          ticketId: ticket._id
        });
        emitToUser(admin._id, 'new_notification', adminNotification);
      }
    } else if (req.user.role === 'agent' || req.user.role === 'admin') {
      // Notify customer
      const notification = await Notification.create({
        recipient: ticket.user._id,
        message: `You have a new reply from support on ticket "${ticket.subject}".`,
        type: 'ticket_reply',
        role: 'customer',
        ticketId: ticket._id
      });
      emitToUser(ticket.user._id, 'new_notification', notification);

      // If the reply is from an agent, notify other agents who might be interested
      if (req.user.role === 'agent') {
        const otherAgents = await User.find({ 
          role: 'agent',
          _id: { $ne: req.user.id }
        });
        for (const agent of otherAgents) {
          const agentNotification = await Notification.create({
            recipient: agent._id,
            message: `Agent ${req.user.name} replied to ticket "${ticket.subject}".`,
            type: 'ticket_reply',
            role: 'agent',
            ticketId: ticket._id
          });
          emitToUser(agent._id, 'new_notification', agentNotification);
        }
      }
    }

    // Emit socket events with the actual reply data
    const io = req.app.get('io');
    if (io) {
      // Prepare reply data for socket emission
      const replyData = {
        _id: populatedReply._id,
        message: populatedReply.message,
        sender: populatedReply.sender,
        senderName: populatedReply.senderName,
        user: populatedReply.user,
        createdAt: populatedReply.createdAt,
        attachments: populatedReply.attachments
      };

      // Notify ticket owner
      emitToUser(ticket.user._id, 'new_reply', { ticket, reply: replyData });
      // Notify assigned agent if different from reply sender
      if (ticket.assignedTo && ticket.assignedTo._id.toString() !== req.user.id) {
        emitToUser(ticket.assignedTo._id, 'new_reply', { ticket, reply: replyData });
      }
      // Notify admins
      emitToRole('admin', 'new_reply', { ticket, reply: replyData });
      // Notify other agents if the reply is from an agent
      if (req.user.role === 'agent') {
        emitToRole('agent', 'new_reply', { ticket, reply: replyData });
      }
    }

    res.status(201).json({
      success: true,
      reply: populatedReply
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get enhanced ticket statistics (for admin dashboard analytics)
 * @route GET /api/tickets/stats
 * @access Private (Admin/Agent)
 */
export const getTicketStats = async (req, res) => {
  try {
    // Check if this is an API call (has req and res)
    if (req && res) {
      if (req.user.role === 'customer') {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }

    // Fix: Support both API and helper usage
    const timeRange = req && req.query && req.query.timeRange ? req.query.timeRange : 'this-week';
    
    // Calculate date ranges
    const now = new Date();
    let startDate, endDate, previousStartDate, previousEndDate;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
        break;
      case 'yesterday':
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'this-week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = startDate;
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        previousEndDate = startDate;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
    }

    // Overall counts for time period
    const totalTicketsInPeriod = await Ticket.countDocuments({ 
      createdAt: { $gte: startDate, $lt: endDate } 
    });
    const resolvedTicketsInPeriod = await Ticket.countDocuments({ 
      resolvedAt: { $gte: startDate, $lt: endDate },
      status: { $in: ['resolved', 'closed'] }
    });

    // Overall counts (all time)
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

    // Priority counts for time period
    const priorityBreakdown = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Category breakdown for time period
    const categoryBreakdown = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Status breakdown for time period
    const statusBreakdown = await Ticket.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent activity
    const recentTickets = await Ticket.find({ createdAt: { $gte: startDate, $lt: endDate } })
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate agent stats
    const activeAgents = await User.countDocuments({ role: 'agent', status: 'active' });
    const totalAgents = await User.countDocuments({ role: 'agent' });

    // Agent performance for time period
    const agentPerformance = await Ticket.aggregate([
      { 
        $match: { 
          assignedTo: { $ne: null },
          createdAt: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          totalTickets: { $sum: 1 },
          resolvedTickets: {
            $sum: {
              $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0]
            }
          },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $in: ['$status', ['resolved', 'closed']] },
                { $subtract: ['$resolvedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent'
        }
      },
      { $unwind: '$agent' },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'agent',
          as: 'ratings'
        }
      },
      {
        $addFields: {
          resolutionRate: {
            $multiply: [
              { $divide: ['$resolvedTickets', '$totalTickets'] },
              100
            ]
          },
          avgRating: { $avg: '$ratings.rating' }
        }
      },
      {
        $project: {
          name: '$agent.name',
          email: '$agent.email',
          totalTickets: 1,
          resolvedTickets: 1,
          resolutionRate: { $round: ['$resolutionRate', 1] },
          avgResolutionTime: {
            $round: [{ $divide: ['$avgResolutionTime', 60000] }, 0]
          },
          avgRating: { $round: ['$avgRating', 1] }
        }
      },
      { $sort: { resolvedTickets: -1 } },
      { $limit: 10 }
    ]);

    // Calculate response time stats
    const avgResponseTime = await Ticket.aggregate([
      { $match: { 
        createdAt: { $gte: startDate, $lt: endDate },
        status: { $in: ['resolved', 'closed'] } 
      }},
      { $group: { _id: null, avg: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } } }
    ]);

    // Previous period comparison
    const prevTotalTickets = await Ticket.countDocuments({ 
      createdAt: { $gte: previousStartDate, $lt: previousEndDate } 
    });
    const prevResolvedTickets = await Ticket.countDocuments({ 
      resolvedAt: { $gte: previousStartDate, $lt: previousEndDate },
      status: { $in: ['resolved', 'closed'] }
    });
    const prevAvgResponseTime = await Ticket.aggregate([
      { $match: { 
        resolvedAt: { $gte: previousStartDate, $lt: previousEndDate },
        status: { $in: ['resolved', 'closed'] } 
      }},
      { $group: { _id: null, avg: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } } }
    ]);

    // Calculate CSAT stats
    const csatScores = await Rating.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const prevCsatScores = await Rating.aggregate([
      { $match: { createdAt: { $gte: previousStartDate, $lt: previousEndDate } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    // Calculate satisfaction distribution
    const satisfactionDistribution = await Rating.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);

    // Format satisfaction distribution
    let ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    satisfactionDistribution.forEach(item => {
      ratingDist[item._id] = item.count;
    });

    // Calculate resolution time by priority (High, Medium, Low)
    const resolutionTimeByPriority = await Ticket.aggregate([
      { 
        $match: { 
          status: { $in: ['resolved', 'closed'] },
          resolvedAt: { $gte: startDate, $lt: endDate },
          priority: { $in: ['high', 'medium', 'low'] }
        }
      },
      {
        $addFields: {
          resolutionTimeMs: { $subtract: ['$lastUpdated', '$createdAt'] }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          avgResolutionTime: { $avg: '$resolutionTimeMs' },
          minResolutionTime: { $min: '$resolutionTimeMs' },
          maxResolutionTime: { $max: '$resolutionTimeMs' }
        }
      },
      {
        $project: {
          priority: '$_id',
          count: 1,
          avgResolutionTime: { $round: [{ $divide: ['$avgResolutionTime', 60000] }, 0] }, // Convert to minutes
          minResolutionTime: { $round: [{ $divide: ['$minResolutionTime', 60000] }, 0] },
          maxResolutionTime: { $round: [{ $divide: ['$maxResolutionTime', 60000] }, 0] }
        }
      }
    ]);

    // Format resolution time by priority with target performance percentages
    const resolutionByPriority = ['high', 'medium', 'low'].map(priority => {
      const data = resolutionTimeByPriority.find(item => item.priority === priority);
      const count = data?.count || 0;
      const avgTime = data?.avgResolutionTime || 0;
      
      // Calculate target times (in minutes) and performance percentage
      let targetTime;
      switch (priority) {
        case 'high': targetTime = 60; break;    // 1 hour target for high priority
        case 'medium': targetTime = 180; break; // 3 hours target for medium priority  
        case 'low': targetTime = 480; break;    // 8 hours target for low priority
        default: targetTime = 240;
      }
      
      // Calculate performance percentage (how well we're meeting targets)
      const performancePercentage = avgTime > 0 ? Math.min(100, Math.round((targetTime / avgTime) * 100)) : 0;
      
      // Format time display
      const formatTime = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
      };

      return {
        priority: priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low',
        count,
        current: formatTime(avgTime),
        avgTimeMinutes: avgTime,
        targetTimeMinutes: targetTime,
        percentage: performancePercentage
      };
    });

    // Calculate resolution time trend data (hourly breakdown for current day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const resolutionTimeTrend = await Ticket.aggregate([
      {
        $match: {
          status: { $in: ['resolved', 'closed'] },
          resolvedAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $addFields: {
          resolutionTimeMs: { $subtract: ['$lastUpdated', '$createdAt'] },
          hour: { $hour: '$resolvedAt' }
        }
      },
      {
        $group: {
          _id: '$hour',
          avgTime: { $avg: { $divide: ['$resolutionTimeMs', 60000] } }, // Convert to minutes
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          hour: '$_id',
          avgTime: { $round: ['$avgTime', 0] },
          count: 1
        }
      },
      { $sort: { hour: 1 } }
    ]);

    // Format trend data for 9AM to 5PM
    const trendData = [];
    for (let hour = 9; hour <= 17; hour++) {
      const data = resolutionTimeTrend.find(item => item.hour === hour);
      const timeLabel = hour <= 12 ? `${hour}AM` : `${hour - 12}PM`;
      if (hour === 12) {
        trendData.push({
          time: '12PM',
          avgTime: data?.avgTime || 0,
          count: data?.count || 0
        });
      } else {
        trendData.push({
          time: timeLabel,
          avgTime: data?.avgTime || 0,
          count: data?.count || 0
        });
      }
    }

    // Calculate trends
    const ticketTrend = prevTotalTickets ? ((totalTicketsInPeriod - prevTotalTickets) / prevTotalTickets * 100) : 0;
    const resolutionTimeTrendPercent = (prevAvgResponseTime[0]?.avg && avgResponseTime[0]?.avg) 
      ? ((avgResponseTime[0].avg - prevAvgResponseTime[0].avg) / prevAvgResponseTime[0].avg * 100)
      : 0;
    const csatTrend = (prevCsatScores[0]?.avg && csatScores[0]?.avg) 
      ? (csatScores[0].avg - prevCsatScores[0].avg) 
      : 0;

    // Calculate resolution rate
    const resolutionRate = totalTicketsInPeriod ? (resolvedTicketsInPeriod / totalTicketsInPeriod * 100) : 0;
    const prevResolutionRate = prevTotalTickets ? (prevResolvedTickets / prevTotalTickets * 100) : 0;
    const resolutionRateTrend = prevResolutionRate ? (resolutionRate - prevResolutionRate) : 0;

    const stats = {
      // Legacy stats for compatibility
      total,
      statusCounts: { open, inProgress, waitingForCustomer, resolved, closed },
      priorityCounts: { high: highPriority, medium: mediumPriority, low: lowPriority },
      categoryBreakdown,
      recentActivity: recentTickets,
      activeAgents,
      totalAgents,
      agentChange: 0, // Placeholder
      avgResponseTime: avgResponseTime[0]?.avg ? Math.round(avgResponseTime[0].avg / (60 * 1000)) : 0,
      responseTimeChange: Math.round(resolutionTimeTrendPercent),
      csatScore: csatScores[0]?.avg || 0,
      csatChange: Math.round(csatTrend * 10) / 10,
      ticketVolumeChange: Math.round(ticketTrend),

      // Enhanced analytics data
      overview: {
        totalTickets: totalTicketsInPeriod,
        avgResolutionTime: avgResponseTime[0]?.avg ? Math.round(avgResponseTime[0].avg / (60 * 1000)) : 0,
        avgResponseTime: 8, // Placeholder - would need first response tracking
        customerSatisfaction: csatScores[0]?.avg ? Number(csatScores[0].avg.toFixed(1)) : 0,
        resolutionRate: Number(resolutionRate.toFixed(1)),
        trends: {
          tickets: Number(ticketTrend.toFixed(1)),
          resolutionTime: Number(resolutionTimeTrendPercent.toFixed(1)),
          responseTime: -5.2, // Placeholder
          satisfaction: Number(csatTrend.toFixed(1)),
          resolutionRate: Number(resolutionRateTrend.toFixed(1))
        }
      },
      ticketsByPriority: priorityBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, { high: 0, medium: 0, low: 0 }),
      ticketsByCategory: categoryBreakdown,
      ticketsByStatus: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      agentPerformance: agentPerformance,
      satisfaction: {
        avgRating: csatScores[0]?.avg ? Number(csatScores[0].avg.toFixed(1)) : 0,
        totalRatings: csatScores[0]?.count || 0,
        distribution: ratingDist
      },
      resolutionByPriority: resolutionByPriority,
      resolutionTimeTrend: trendData,
      recentActivity: recentTickets.map(ticket => ({
        id: ticket._id,
        subject: ticket.subject,
        customer: ticket.user?.name || 'Unknown',
        agent: ticket.assignedTo?.name || 'Unassigned',
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt
      }))
    };

    // If this is an API call, send the response
    if (req && res) {
      // Emit socket event for stats update
      const io = req.app.get('io');
      if (io) {
        emitToRole('admin', 'stats_updated', stats);
        emitToRole('agent', 'stats_updated', stats);
      }

      return res.status(200).json({
        success: true,
        stats
      });
    }

    // If this is a helper function call, return the stats
    return stats;
  } catch (error) {
    console.error('Get ticket stats error:', error);
    if (req && res) {
      return res.status(500).json({ error: 'Server error' });
    }
    throw error;
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
    
    for (const ticket of tickets) {
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
    
    console.log(`[SubmitRating] User ${req.user.id} attempting to rate ticket ${ticketId} with rating ${rating}`);
    
    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      console.log(`[SubmitRating] Invalid rating value: ${rating}`);
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Find the ticket
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      console.log(`[SubmitRating] Ticket ${ticketId} not found`);
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Ensure the user is the ticket owner
    if (ticket.user.toString() !== req.user.id) {
      console.log(`[SubmitRating] User ${req.user.id} not authorized to rate ticket ${ticketId} (owner: ${ticket.user})`);
      return res.status(403).json({ error: 'You can only rate your own tickets' });
    }
    
    // Check if the ticket is in a status that allows rating (closed or resolved)
    if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
      console.log(`[SubmitRating] Ticket ${ticketId} has invalid status for rating: ${ticket.status}`);
      return res.status(400).json({ error: 'Only closed or resolved tickets can be rated' });
    }
    
    // Check if this ticket has already been rated
    const existingRating = await Rating.findOne({ ticket: ticketId, user: req.user.id });
    
    if (existingRating) {
      console.log(`[SubmitRating] Ticket ${ticketId} already rated by user ${req.user.id}`);
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
    
    console.log(`[SubmitRating] Successfully created rating ${newRating._id} for ticket ${ticketId}`);
    
    // Update the ticket to mark it as rated
    ticket.status = 'closed';  // Ensure ticket is closed after rating
    ticket.hasRating = true;   // Mark that this ticket has been rated
    await ticket.save();
    
    console.log(`[SubmitRating] Updated ticket ${ticketId} status to closed with hasRating=true`);
    
    res.status(201).json({
      success: true,
      rating: newRating
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    
    // Handle specific database errors
    if (error.code === 11000) {
      // Duplicate key error (rating already exists)
      console.log(`[SubmitRating] Duplicate rating attempt for ticket ${req.params.id} by user ${req.user.id}`);
      return res.status(400).json({ error: 'You have already rated this ticket' });
    }
    
    if (error.name === 'ValidationError') {
      console.log(`[SubmitRating] Validation error:`, error.message);
      return res.status(400).json({ error: 'Invalid rating data provided' });
    }
    
    if (error.name === 'CastError') {
      console.log(`[SubmitRating] Invalid ID format:`, error.message);
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }
    
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

// Add new function for manual escalation
export const escalateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check if user has permission to escalate
    if (req.user.role === 'customer' || 
        (req.user.role === 'agent' && req.user.agentType === 'Junior')) {
      
      // Find a senior agent
      const seniorAgent = await User.findOne({
        role: 'agent',
        agentType: 'Senior'
      });

      if (!seniorAgent) {
        return res.status(400).json({ error: 'No senior agent available for escalation' });
      }

      // Update ticket
      ticket.assignedTo = seniorAgent._id;
      ticket.escalationLevel = 'senior';
      ticket.escalationHistory.push({
        escalatedAt: new Date(),
        from: req.user.role === 'customer' ? 'customer' : 'junior',
        to: 'senior',
        reason: req.body.reason || 'Manual escalation requested'
      });

      // Create notifications
      const notifSenior = await Notification.create({
        recipient: seniorAgent._id,
        message: `Ticket #${ticket.ticketNumber} has been escalated to you by ${req.user.role === 'customer' ? 'customer' : 'junior agent'}.`,
        type: 'ticket_escalated',
        role: 'agent',
        ticketId: ticket._id
      });
      emitToUser(seniorAgent._id, 'new_notification', notifSenior);

      const notifCustomer = await Notification.create({
        recipient: ticket.user,
        message: `Your ticket #${ticket.ticketNumber} has been escalated to a senior agent.`,
        type: 'ticket_escalated',
        role: 'customer',
        ticketId: ticket._id
      });
      emitToUser(ticket.user._id, 'new_notification', notifCustomer);

      // Also notify admins about the escalation
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        const adminNotification = await Notification.create({
          recipient: admin._id,
          message: `Ticket #${ticket.ticketNumber} has been escalated to a senior agent.`,
          type: 'ticket_escalated',
          role: 'admin',
          ticketId: ticket._id
        });
        emitToUser(admin._id, 'new_notification', adminNotification);
      }

      await ticket.save();

      // Emit socket events
      const io = req.app.get('io');
      if (io) {
        // Notify all relevant users about the escalation
        emitToUser(ticket.user._id, 'ticket_escalated', ticket);
        if (ticket.assignedTo) {
          emitToUser(ticket.assignedTo._id, 'ticket_escalated', ticket);
        }
        emitToRole('admin', 'ticket_escalated', ticket);
      }

      res.json({
        success: true,
        message: 'Ticket escalated successfully',
        ticket
      });
    } else {
      res.status(403).json({ error: 'You do not have permission to escalate this ticket' });
    }
  } catch (error) {
    console.error('Escalate ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get agent-specific ticket statistics
 * @route GET /api/tickets/agent/stats  
 * @access Private (Agent only)
 */
export const getAgentStats = async (req, res) => {
  try {
    // Only agents can access their own stats
    if (req.user.role !== 'agent') {
      return res.status(403).json({ error: 'Not authorized - agents only' });
    }

    const agentId = req.user.id;
    const { timeRange = 'this-week' } = req.query;
    
    // Calculate date ranges
    const now = new Date();
    let startDate, endDate, previousStartDate, previousEndDate;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
        break;
      case 'this-week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = startDate;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEndDate = startDate;
    }

    // Get agent-specific metrics for current period
    const agentTicketsInPeriod = await Ticket.countDocuments({ 
      assignedTo: agentId,
      createdAt: { $gte: startDate, $lt: endDate } 
    });

    const agentResolvedInPeriod = await Ticket.countDocuments({ 
      assignedTo: agentId,
      resolvedAt: { $gte: startDate, $lt: endDate },
      status: { $in: ['resolved', 'closed'] }
    });

    // Get agent-specific metrics for previous period (for comparison)
    const agentTicketsPrevPeriod = await Ticket.countDocuments({ 
      assignedTo: agentId,
      createdAt: { $gte: previousStartDate, $lt: previousEndDate } 
    });

    const agentResolvedPrevPeriod = await Ticket.countDocuments({ 
      assignedTo: agentId,
      resolvedAt: { $gte: previousStartDate, $lt: previousEndDate },
      status: { $in: ['resolved', 'closed'] }
    });

    // Calculate resolution rate and change
    const resolutionRate = agentTicketsInPeriod > 0 ? (agentResolvedInPeriod / agentTicketsInPeriod) * 100 : 0;
    const prevResolutionRate = agentTicketsPrevPeriod > 0 ? (agentResolvedPrevPeriod / agentTicketsPrevPeriod) * 100 : 0;
    const resolutionRateChange = resolutionRate - prevResolutionRate;

    // Calculate average response time for this agent
    const agentAvgResponseTime = await Ticket.aggregate([
      { 
        $match: { 
          assignedTo: new mongoose.Types.ObjectId(agentId),
          resolvedAt: { $gte: startDate, $lt: endDate },
          status: { $in: ['resolved', 'closed'] } 
        }
      },
      { 
        $group: { 
          _id: null, 
          avg: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } 
        } 
      }
    ]);

    const agentPrevAvgResponseTime = await Ticket.aggregate([
      { 
        $match: { 
          assignedTo: new mongoose.Types.ObjectId(agentId),
          resolvedAt: { $gte: previousStartDate, $lt: previousEndDate },
          status: { $in: ['resolved', 'closed'] } 
        }
      },
      { 
        $group: { 
          _id: null, 
          avg: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } 
        } 
      }
    ]);

    const currentAvgResponseTime = agentAvgResponseTime[0]?.avg ? Math.round(agentAvgResponseTime[0].avg / (60 * 1000)) : 0;
    const prevAvgResponseTime = agentPrevAvgResponseTime[0]?.avg ? Math.round(agentPrevAvgResponseTime[0].avg / (60 * 1000)) : 0;
    const responseTimeChange = currentAvgResponseTime - prevAvgResponseTime;

    // Get agent's CSAT score
    const agentRatings = await Rating.aggregate([
      {
        $match: {
          agent: new mongoose.Types.ObjectId(agentId),
          createdAt: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const agentPrevRatings = await Rating.aggregate([
      {
        $match: {
          agent: new mongoose.Types.ObjectId(agentId),
          createdAt: { $gte: previousStartDate, $lt: previousEndDate }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const currentCsatScore = agentRatings[0]?.avgRating ? Number(agentRatings[0].avgRating.toFixed(1)) : 0;
    const prevCsatScore = agentPrevRatings[0]?.avgRating ? Number(agentPrevRatings[0].avgRating.toFixed(1)) : 0;
    const csatScoreChange = currentCsatScore - prevCsatScore;

    // Get recent activity for this agent ONLY
    const agentRecentTickets = await Ticket.find({ 
      assignedTo: agentId,
      $or: [
        { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        { updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        { resolvedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      ]
    })
    .populate('user', 'name email')
    .sort({ updatedAt: -1 })
    .limit(10);

    // Create recent activity entries based on agent-specific actions
    const recentActivity = [];
    
    agentRecentTickets.forEach(ticket => {
      // Add resolved tickets
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        if (ticket.resolvedAt && ticket.resolvedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          recentActivity.push({
            id: `resolved-${ticket._id}`,
            type: 'resolved',
            content: `Resolved ticket ${ticket.ticketNumber || ticket._id} - ${ticket.subject}`,
            time: ticket.resolvedAt,
            ticketId: ticket._id
          });
        }
      }
      
      // Add recently assigned tickets
      if (ticket.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        recentActivity.push({
          id: `assigned-${ticket._id}`,
          type: 'assigned',
          content: `New ${ticket.priority}-priority ticket assigned from ${ticket.user?.name || 'Customer'}`,
          time: ticket.createdAt,
          ticketId: ticket._id
        });
      }
    });

    // Sort by most recent and take top 5
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    const limitedRecentActivity = recentActivity.slice(0, 5);

    // Helper function to format time ago
    const formatTimeAgo = (date) => {
      const now = new Date();
      const diffMs = now - new Date(date);
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)}h ago`;
      } else {
        return `${Math.floor(diffMins / 1440)}d ago`;
      }
    };

    // Format the response
    const stats = {
      avgResponseTime: currentAvgResponseTime,
      responseTimeChange: responseTimeChange,
      resolutionRate: Number(resolutionRate.toFixed(1)),
      resolutionRateChange: Number(resolutionRateChange.toFixed(1)),
      csatScore: currentCsatScore,
      csatScoreChange: Number(csatScoreChange.toFixed(1)),
      ticketsResolved: agentResolvedInPeriod,
      ticketsResolvedChange: agentResolvedInPeriod - agentResolvedPrevPeriod,
      totalTicketsAssigned: agentTicketsInPeriod,
      recentActivity: limitedRecentActivity.map(activity => ({
        ...activity,
        time: formatTimeAgo(activity.time)
      }))
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get agent stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get recent customer ratings/feedback
 * @route GET /api/tickets/ratings/recent
 * @access Private (Admin/Agent)
 */
export const getRecentRatings = async (req, res) => {
  try {
    // Only admins and agents can access ratings
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { limit = 10 } = req.query;

    // Get recent ratings with user and ticket information
    const recentRatings = await Rating.find({})
      .populate('user', 'name email')
      .populate('ticket', 'subject _id')
      .populate('agent', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Format the ratings for the frontend
    const formattedRatings = recentRatings.map(rating => {
      const timeAgo = (date) => {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) {
          return `${diffMins}m ago`;
        } else if (diffMins < 1440) {
          return `${Math.floor(diffMins / 60)}h ago`;
        } else {
          return `${Math.floor(diffMins / 1440)}d ago`;
        }
      };

      return {
        _id: rating._id,
        name: rating.user?.name || 'Anonymous',
        rating: rating.rating,
        feedback: rating.feedback || null,
        time: timeAgo(rating.createdAt),
        ticketId: rating.ticket?._id,
        ticketSubject: rating.ticket?.subject,
        agent: rating.agent?.name || 'Unassigned'
      };
    });

    res.status(200).json({
      success: true,
      ratings: formattedRatings
    });

  } catch (error) {
    console.error('Get recent ratings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 