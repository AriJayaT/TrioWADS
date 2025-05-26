import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import TicketReply from '../models/TicketReply.js';
import Rating from '../models/Rating.js';

export const getResolutionByPriority = async (req, res) => {
  try {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const result = [];

    for (const priority of priorities) {
      const tickets = await Ticket.find({
        status: 'closed',
        priority: priority
      });

      const count = tickets.length;

      const totalResolutionTime = tickets.reduce((sum, ticket) => {
        const created = new Date(ticket.createdAt).getTime();
        const closed = new Date(ticket.updatedAt || ticket.closedAt || ticket.resolvedAt).getTime();
        const duration = closed - created;
        return sum + (duration > 0 ? duration : 0);
      }, 0);

      const avgMs = count > 0 ? totalResolutionTime / count : 0;
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

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      totalMinutes: 0,
      count: 0,
    }));

    closedTickets.forEach(ticket => {
      const createdAt = new Date(ticket.createdAt);
      const resolvedAt = new Date(ticket.updatedAt || ticket.closedAt || ticket.resolvedAt);

      const diff = (resolvedAt - createdAt) / 60000;
      const hour = createdAt.getHours();

      if (hourlyData[hour]) {
        hourlyData[hour].totalMinutes += diff;
        hourlyData[hour].count += 1;
      }
    });

    const result = hourlyData.map(({ hour, totalMinutes, count }) => ({
      time: `${hour % 12 || 12}${hour < 12 ? 'AM' : 'PM'}`,
      avgTime: count > 0 ? Math.round(totalMinutes / count) : 0
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
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
      }
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

    const response = days.map(day => ({
      name: day.label,
      New: day.created,
      Resolved: day.resolved
    }));

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
      TicketReply.find(),
      Rating.find()
    ]);

    const activeAgents = agents.filter(agent => agent.status !== 'offline').length;
    const agentTotal = agents.length;

    const avgResolutionTime = (() => {
      const closed = tickets.filter(t => t.status === 'closed');
      const total = closed.reduce((sum, t) => {
        const diff = new Date(t.updatedAt || t.closedAt) - new Date(t.createdAt);
        return sum + diff;
      }, 0);
      const avg = closed.length ? total / closed.length : 0;
      const mins = Math.floor(avg / 60000);
      return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    })();

    const avgCSAT = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      metrics: {
        activeAgents: `${activeAgents}/${agentTotal}`,
        ticketVolume: tickets.length,
        systemResponse: avgResolutionTime,
        overallCSAT: avgCSAT
      }
    });
  } catch (err) {
    console.error("Overview fetch error:", err);
    res.status(500).json({ error: "Failed to load system overview" });
  }
};

// This is the added Ticket Distribution by Category
export const getTicketDistributionByCategory = async (req, res) => {
  try {
    const categories = [
      'Product Issues',
      'Orders & Shipping',
      'Billing & Payments',
      'Account Management',
      'General Inquiries'
    ];

    const result = await Promise.all(categories.map(async (name) => {
      const tickets = await Ticket.find({ category: name });

      const count = tickets.length;

      // Dummy percentage change for now
      const change = Math.floor(Math.random() * 10 - 5); // -5 to +4
      const changeType = change >= 0 ? 'positive' : 'negative';
      const formattedChange = `${change >= 0 ? '+' : ''}${change}%`;

      return {
        name,
        count,
        change: formattedChange,
        changeType
      };
    }));

    res.status(200).json({ success: true, categories: result });
  } catch (err) {
    console.error("Ticket category distribution error:", err);
    res.status(500).json({ error: "Failed to fetch ticket distribution data" });
  }
};
