import User from '../models/User.js';
import Ticket from '../models/Ticket.js';

/**
 * Get all agents
 * @route GET /api/users/agents
 * @access Private (Admin only)
 */
export const getAgents = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access agent data' });
    }

    // Get all users with 'agent' role
    const agents = await User.find({ role: 'agent' }).select('-password');

    // For each agent, get their assigned tickets count
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const assignedTickets = await Ticket.find({ assignedTo: agent._id });
        
        // Calculate statistics - could be expanded further in the future
        const stats = {
          resolution: '0%',
          avgResponse: 'N/A',
          csat: 'N/A'
        };

        // Sample calculation for resolution rate (closed tickets / total assigned)
        if (assignedTickets.length > 0) {
          const closedTickets = assignedTickets.filter(
            ticket => ticket.status === 'resolved' || ticket.status === 'closed'
          );
          
          const resolutionRate = Math.round((closedTickets.length / assignedTickets.length) * 100);
          stats.resolution = `${resolutionRate}%`;
        }

        return {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          profileImage: agent.profileImage,
          agentType: agent.agentType || 'Junior',
          assignedTickets: assignedTickets,
          status: 'online', // Would be dynamic in a real app
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
    
    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email, phone, agentType } = req.body;

    // Only admins can update agent type
    if (agentType && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update agent type' });
    }

    // Update fields if provided
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
    
    // Check permissions - self or admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this data' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Count tickets for this user
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
    
    // Check permissions - self or admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this data' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is an agent
    if (user.role !== 'agent') {
      return res.status(400).json({ error: 'User is not an agent' });
    }

    // Count tickets assigned to this agent that are not removed
    const assignedCount = await Ticket.countDocuments({ 
      assignedTo: userId,
      isRemoved: { $ne: true } // Exclude tickets marked as removed
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