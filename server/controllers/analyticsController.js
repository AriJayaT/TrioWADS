import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import TicketReply from '../models/TicketReply.js';
import Rating from '../models/Rating.js';

export const getResolutionByPriority = async (req, res) => {
  try {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const result = [];

    for (const priority of priorities) {
      const tickets = await Ticket.find({ status: 'closed', priority });
      const count = tickets.length;
      const totalResolutionTime = tickets.reduce((sum, ticket) => {
        const diff = new Date(ticket.updatedAt || ticket.closedAt) - new Date(ticket.createdAt);
        return sum + Math.max(diff, 0);
      }, 0);
      const avgMs = count ? totalResolutionTime / count : 0;
      const avgMinutes = Math.floor(avgMs / 60000);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;

      result.push({
        priority,
        count,
        current: `${hours}h ${minutes}m`,
        avgMinutes,
        percentage: Math.min((avgMinutes / 60) * 10, 100)
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Resolution by priority error:", err);
    res.status(500).json({ error: "Failed to fetch resolution times" });
  }
};

export const getResolutionTimeTrend = async (req, res) => {
  try {
    const closedTickets = await Ticket.find({ status: 'closed' });
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({ hour: i, totalMinutes: 0, count: 0 }));

    closedTickets.forEach(ticket => {
      const createdAt = new Date(ticket.createdAt);
      const resolvedAt = new Date(ticket.updatedAt || ticket.closedAt);
      const diff = (resolvedAt - createdAt) / 60000;
      const hour = createdAt.getHours();
      if (hourlyData[hour]) {
        hourlyData[hour].totalMinutes += diff;
        hourlyData[hour].count += 1;
      }
    });

    const result = hourlyData.map(({ hour, totalMinutes, count }) => ({
      time: `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`,
      avgTime: count ? Math.round(totalMinutes / count) : 0
    })).filter(d => d.avgTime > 0);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Trend fetch error:", err);
    res.status(500).json({ error: "Failed to load trend data" });
  }
};

export const getTicketVolumeTrend = async (req, res) => {
  try {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateKey: date.toISOString().split('T')[0],
        created: 0,
        resolved: 0
      };
    });

    const tickets = await Ticket.find({
      createdAt: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) }
    });

    tickets.forEach(ticket => {
      const created = new Date(ticket.createdAt).toISOString().split('T')[0];
      const resolved = ticket.status === 'closed' ? new Date(ticket.updatedAt).toISOString().split('T')[0] : null;
      const createdDay = days.find(d => d.dateKey === created);
      if (createdDay) createdDay.created++;
      if (resolved) {
        const resolvedDay = days.find(d => d.dateKey === resolved);
        if (resolvedDay) resolvedDay.resolved++;
      }
    });

    const response = days.map(day => ({ name: day.label, New: day.created, Resolved: day.resolved }));
    res.status(200).json({ success: true, data: response });
  } catch (err) {
    console.error("Ticket volume trend error:", err);
    res.status(500).json({ error: "Failed to load ticket volume data" });
  }
};

export const getSystemOverview = async (req, res) => {
  try {
    const [agents, tickets, replies, ratings] = await Promise.all([
      User.find({ role: 'agent' }),
      Ticket.find(),
      TicketReply.find().sort({ createdAt: 1 }),
      Rating.find()
    ]);

    const activeAgents = agents.filter(agent => agent.status !== 'offline').length;
    const agentTotal = agents.length;
    const closedTickets = tickets.filter(t => t.status === 'closed');
    const resolvedTickets = tickets.filter(t => t.status === 'resolved');
    const completedTickets = [...closedTickets, ...resolvedTickets];
    const openTickets = tickets.filter(t => !['closed', 'resolved'].includes(t.status));

    const avgResolutionTime = (() => {
      const total = completedTickets.reduce((sum, t) => {
        const diff = new Date(t.updatedAt || t.closedAt) - new Date(t.createdAt);
        return sum + Math.max(diff, 0);
      }, 0);
      const avg = completedTickets.length ? total / completedTickets.length : 0;
      const mins = Math.floor(avg / 60000);
      return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    })();

    const avgFirstResponseTime = (() => {
      const ticketFirstResponses = tickets.map(ticket => {
        const firstAgentReply = replies
          .filter(r => {
            const isAgentReply = agents.some(a => a._id.toString() === r.user.toString());
            return r.ticket.toString() === ticket._id.toString() && isAgentReply;
          })
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

        if (!firstAgentReply) return null;

        const responseTime = new Date(firstAgentReply.createdAt) - new Date(ticket.createdAt);
        return responseTime > 0 ? responseTime : null;
      }).filter(Boolean);

      const avg = ticketFirstResponses.length 
        ? ticketFirstResponses.reduce((a, b) => a + b, 0) / ticketFirstResponses.length 
        : 0;
      const mins = Math.floor(avg / 60000);
      return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    })();

    const slaWithin24h = (() => {
      const count = completedTickets.filter(t => {
        const resolutionTime = new Date(t.updatedAt || t.closedAt) - new Date(t.createdAt);
        return resolutionTime > 0 && resolutionTime <= 86400000;
      }).length;
      return ((count / (completedTickets.length || 1)) * 100).toFixed(1);
    })();

    const overdueTickets = openTickets.filter(t => {
      const ticketAge = new Date() - new Date(t.createdAt);
      return ticketAge > 86400000;
    }).length;

    const avgCSAT = ratings.length 
      ? (ratings.reduce((sum, r) => sum + Math.min(Math.max(r.rating, 1), 5), 0) / ratings.length).toFixed(1) 
      : '0.0';

    const responseRate = (() => {
      const ticketsWithAgentReplies = tickets.filter(ticket => 
        replies.some(reply => 
          reply.ticket.toString() === ticket._id.toString() &&
          agents.some(agent => agent._id.toString() === reply.user.toString())
        )
      ).length;
      
      return tickets.length > 0 
        ? Math.min((ticketsWithAgentReplies / tickets.length * 100), 100).toFixed(1)
        : '0.0';
    })();

    const prevPeriodResolutionTime = avgResolutionTime;
    const resolutionTrend = "-12%";
    const responseTrend = "-18%";
    const satisfactionTrend = "+0.3";
    const ticketsTrend = "+5%";

    const metrics = {
      activeAgents: `${activeAgents}/${agentTotal}`,
      ticketVolume: tickets.length,
      systemResponse: avgResolutionTime,
      overallCSAT: avgCSAT
    };

    res.json({
      success: true,
      metrics,
      overview: {
        avgResolutionTime,
        firstResponseTime: avgFirstResponseTime,
        totalTickets: tickets.length,
        customerSatisfaction: avgCSAT,
        resolutionTrend,
        resolutionTrendIsGood: false,
        responseTrend,
        responseTrendIsGood: false,
        satisfactionTrend,
        ticketsTrend
      },
      resolution: {
        avgResolutionTime,
        firstResponseTime: avgFirstResponseTime,
        withinSLA: `${slaWithin24h}%`,
        overdueTickets,
        resolutionTrend,
        resolutionTrendIsGood: false,
        responseTrend,
        responseTrendIsGood: false,
        slaTrend: "+2.4%",
        overdueTrend: "+5",
        overdueTrendIsGood: false
      },
      performance: {
        teamSatisfaction: avgCSAT,
        avgResponseTime: avgFirstResponseTime,
        avgResolutionTime,
        totalTickets: tickets.length,
        satisfactionTrend: "+0.2",
        responseTrend: "-0.5m",
        responseTrendIsGood: false,
        resolutionTrend: "-15m",
        resolutionTrendIsGood: false,
        ticketsTrend: "+82"
      },
      satisfaction: {
        score: avgCSAT,
        scoreTrend: "+0.2",
        totalResponses: ratings.length,
        responsesTrend: "+12%",
        responseRate: `${responseRate}%`,
        rateTrend: "+3%"
      }
    });
  } catch (err) {
    console.error("Overview fetch error:", err);
    res.status(500).json({ error: "Failed to load system overview" });
  }
};
