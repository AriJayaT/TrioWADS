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
        // Include lastUpdated and createdAt fields when fetching tickets
        const assignedTickets = await Ticket.find({ assignedTo: agent._id })
          .select('status lastUpdated createdAt');

        const closedTickets = assignedTickets.filter(
          ticket => ticket.status === 'closed'
        );

        // Calculate average resolution time
        const totalResolutionTime = closedTickets.reduce((sum, ticket) => {
          const resolutionTime = new Date(ticket.lastUpdated) - new Date(ticket.createdAt);
          return sum + (resolutionTime > 0 ? resolutionTime : 0);
        }, 0);

        const avgResolutionMinutes = closedTickets.length > 0
          ? Math.round(totalResolutionTime / (closedTickets.length * 60000))
          : 0;

        // Calculate First Contact Resolution (FCR)
        let fcrCount = 0;
        for (const ticket of closedTickets) {
          try {
            // Get all replies for this ticket
            const ticketReplies = await TicketReply.find({ ticket: ticket._id })
              .sort({ createdAt: 1 });
            
            // Separate agent replies
            const agentReplies = ticketReplies.filter(reply => 
              agents.some(a => a._id.toString() === reply.user.toString())
            );
            
            // Simple FCR criteria:
            // 1. Ticket is closed/resolved
            // 2. Agent only needed to reply once
            // 3. Wasn't reopened
            if (agentReplies.length === 1 && 
                ['closed', 'resolved'].includes(ticket.status) && 
                (!ticket.reopenCount || ticket.reopenCount === 0)) {
              fcrCount++;
            }
          } catch (err) {
            console.error(`Error calculating FCR for ticket ${ticket._id}:`, err);
            continue;
          }
        }

        const fcrPercent = closedTickets.length > 0
          ? Math.round((fcrCount / closedTickets.length) * 100)
          : 0;

        // Calculate Reopen Rate
        let reopenedCount = 0;
        
        // Get all tickets that were ever closed (including currently open ones that were previously closed)
        const everClosedTickets = assignedTickets.filter(ticket => 
          ticket.status === 'closed' || 
          ticket.status === 'resolved' ||
          ticket.wasReopened === true ||
          (ticket.reopenCount && ticket.reopenCount > 0)
        );
        
        for (const ticket of everClosedTickets) {
          // Count as reopened if either:
          // 1. The ticket has a reopenCount > 0
          // 2. The ticket was marked as reopened
          // 3. The ticket was previously closed but is now open again
          if (ticket.reopenCount > 0 || 
              ticket.wasReopened === true ||
              (ticket.previousStatus === 'closed' && ticket.status === 'open')) {
            reopenedCount++;
          }
        }

        // Calculate reopen rate based on tickets that were ever closed
        const reopenRate = everClosedTickets.length > 0
          ? ((reopenedCount / everClosedTickets.length) * 100).toFixed(1)
          : '0.0';

        console.log(`Agent ${agent.name} reopen stats:`, {
          totalAssigned: assignedTickets.length,
          everClosed: everClosedTickets.length,
          reopened: reopenedCount,
          rate: reopenRate
        });

        const stats = {
          resolution: assignedTickets.length > 0
            ? `${Math.round((closedTickets.length / assignedTickets.length) * 100)}%`
            : '0%',
          avgResolutionTime: `${Math.floor(avgResolutionMinutes / 60)}h ${avgResolutionMinutes % 60}m`,
          avgResponse: 'N/A',
          csat: 'N/A',
          firstContactResolution: `${fcrPercent}%`,
          reopenRate: `${reopenRate}%`,
          totalTickets: assignedTickets.length,
          closedTickets: everClosedTickets.length,
          reopenedTickets: reopenedCount
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
