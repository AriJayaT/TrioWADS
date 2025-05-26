import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import TicketReply from '../models/TicketReply.js'; // Required for FCR calculation

/**
 * Get all agents
 * @route GET /api/users/agents
 * @access Private (Admin only)
 */
export const getAgents = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access agent data' });
    }

    const agents = await User.find({ role: 'agent' }).select('-password');

    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const assignedTickets = await Ticket.find({ assignedTo: agent._id });

        const closedTickets = assignedTickets.filter(
          ticket => ticket.status === 'closed'
        );

        // This is the FCR calculation (Idk if it works yet)
        let firstContactResolved = 0;

        for (const ticket of closedTickets) {
          const replies = await TicketReply.find({ ticket: ticket._id }).sort({ createdAt: 1 });
          const agentReplies = replies.filter(reply => reply.sender === 'agent');

          if (agentReplies.length === 1) {
            firstContactResolved++;
          }
        }

        const fcrPercent = closedTickets.length > 0
          ? Math.round((firstContactResolved / closedTickets.length) * 100)
          : 0;

        // This is the Reopen Rate calculation (Idk if it works yet)
        let reopenedCount = 0;

        for (const ticket of closedTickets) {
          if (ticket.reopenCount > 0 || ticket.wasReopened) {
            reopenedCount++;
          }
        }

        const reopenRate = closedTickets.length > 0
          ? ((reopenedCount / closedTickets.length) * 100).toFixed(1)
          : '0.0';

        const stats = {
          resolution: assignedTickets.length > 0
            ? `${Math.round((closedTickets.length / assignedTickets.length) * 100)}%`
            : '0%',
          avgResponse: 'N/A',
          csat: 'N/A',
          firstContactResolution: `${fcrPercent}%`,
          reopenRate: `${reopenRate}%`
        };

        return {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          profileImage: agent.profileImage,
          agentType: agent.agentType || 'Junior',
          assignedTickets: assignedTickets,
          status: 'online',
          stats
        };
      })
    );

    res.status(200).json({
      success: true,
      agents: agentsWithStats
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update user details
 * @route PUT /api/users/:id
 * @access Private (Admin or self)
 */
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email, phone, agentType } = req.body;

    if (agentType && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update agent type' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (agentType && user.role === 'agent') user.agentType = agentType;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        agentType: user.agentType,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get user tickets count
 * @route GET /api/users/:id/ticket-count
 * @access Private (Admin or self)
 */
export const getUserTicketsCount = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this data' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ticketsCount = await Ticket.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      ticketsCount
    });
  } catch (error) {
    console.error('Get user tickets count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get agent assigned tickets count
 * @route GET /api/users/:id/assigned-count
 * @access Private (Admin or self)
 */
export const getAgentAssignedCount = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this data' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'agent') {
      return res.status(400).json({ error: 'User is not an agent' });
    }

    const assignedCount = await Ticket.countDocuments({
      assignedTo: userId,
      isRemoved: { $ne: true }
    });

    res.status(200).json({
      success: true,
      assignedCount
    });
  } catch (error) {
    console.error('Get agent assigned count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
