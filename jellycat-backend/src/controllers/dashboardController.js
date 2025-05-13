// src/controllers/dashboardController.js
const Agent = require('../models/Agent');
const Ticket = require('../models/Ticket');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
  try {
    // Get all agents
    const agents = await Agent.find();
    
    // Get ticket statistics
    const totalTickets = await Ticket.countDocuments();
    
    // Get ticket distribution
    const ticketDistribution = await Ticket.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format ticket distribution
    const formattedTicketDistribution = ticketDistribution.map(item => {
      // Calculate change (mock data for now)
      const changeValue = Math.floor(Math.random() * 10) - 3;
      const change = `${changeValue > 0 ? '+' : ''}${changeValue}%`;
      const changeType = changeValue >= 0 ? 'positive' : 'negative';
      
      return {
        name: item._id,
        count: item.count,
        change,
        changeType
      };
    });
    
    // Format metrics
    const activeAgents = `${agents.filter(agent => agent.status !== 'Offline').length}/${agents.length}`;
    
    // Send response
    res.json({
      agents: agents.map(agent => ({
        id: agent._id,
        initials: agent.initials,
        name: agent.name,
        responseTime: agent.responseTime,
        tickets: agent.tickets,
        resolution: agent.resolution,
        status: agent.status
      })),
      metrics: {
        activeAgents,
        ticketVolume: totalTickets,
        systemResponse: '99.9%', // Mock data
        overallCSAT: 4.8 // Mock data
      },
      ticketDistribution: formattedTicketDistribution.length > 0 
        ? formattedTicketDistribution 
        : [
            {
              name: 'Product Issues',
              count: 245,
              change: '+5%',
              changeType: 'positive'
            },
            {
              name: 'Billing Support',
              count: 187,
              change: '-2%',
              changeType: 'negative'
            },
            {
              name: 'Technical Help',
              count: 156,
              change: '+8%',
              changeType: 'positive'
            },
            {
              name: 'General Inquiry',
              count: 259,
              change: '+3%',
              changeType: 'positive'
            }
          ]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};