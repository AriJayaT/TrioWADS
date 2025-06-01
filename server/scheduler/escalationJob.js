import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { emitToUser } from '../index.js';

const REMINDER_INTERVALS = [
  // Agent reminders
  { time: 24 * 60 * 60 * 1000, label: '1 day', notifyRoles: ['agent'] },     // 1 day - agent only
  { time: 12 * 60 * 60 * 1000, label: '12 hours', notifyRoles: ['agent'] },  // 12 hours - agent only
  { time: 6 * 60 * 60 * 1000, label: '6 hours', notifyRoles: ['agent'] },    // 6 hours - agent only
  { time: 3 * 60 * 60 * 1000, label: '3 hours', notifyRoles: ['agent'] },    // 3 hours - agent only
  // Admin reminders
  { time: 60 * 60 * 1000, label: '1 hour', notifyRoles: ['admin'] },         // 1 hour - admin only
  { time: 30 * 60 * 1000, label: '30 minutes', notifyRoles: ['admin'] }      // 30 minutes - admin only
];

// Function to find a random senior agent
async function findRandomSeniorAgent() {
  const seniorAgents = await User.find({
    role: 'agent',
    agentType: 'Senior'
  });
  
  if (seniorAgents.length === 0) return null;
  
  // Get a random senior agent
  const randomIndex = Math.floor(Math.random() * seniorAgents.length);
  return seniorAgents[randomIndex]._id;
}

// Function to send notification
async function sendNotification(userId, message, type = 'ticket_reminder', userRole = 'customer', ticketId = null) {
  const notification = await Notification.create({
    recipient: userId,
    message,
    type,
    role: userRole,
    ticketId
  });
  
  // Emit real-time notification
  emitToUser(userId, 'new_notification', notification);
  
  return notification;
}

// Function to notify all admins
async function notifyAdmins(message, type = 'ticket_reminder', ticketId = null) {
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await sendNotification(admin._id, message, type, 'admin', ticketId);
  }
}

// Check tickets every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const tickets = await Ticket.find({
      status: { $nin: ['resolved', 'closed'] },
      deadline: { $exists: true }
    }).populate('assignedTo', 'name email');

    for (const ticket of tickets) {
      const timeLeft = ticket.deadline - now;

      // Send reminders
      for (const interval of REMINDER_INTERVALS) {
        const reminderKey = `reminder_${interval.time}`;
        if (timeLeft <= interval.time && timeLeft > 0 && !ticket.reminderSent.get(reminderKey)) {
          // Handle notifications based on roles
          if (interval.notifyRoles.includes('agent') && ticket.assignedTo) {
            await sendNotification(
              ticket.assignedTo._id,
              `Ticket #${ticket.ticketNumber} deadline is approaching in ${interval.label}. Please take action.`,
              'ticket_reminder',
              'agent',
              ticket._id
            );
          }

          if (interval.notifyRoles.includes('admin')) {
            await notifyAdmins(
              `Ticket #${ticket.ticketNumber} deadline is approaching in ${interval.label}. Current agent: ${ticket.assignedTo?.name || 'Unassigned'}`,
              'ticket_reminder',
              ticket._id
            );
          }

          // Mark reminder as sent
          ticket.reminderSent.set(reminderKey, true);
          await ticket.save();
        }
      }

      // Handle escalation if deadline passed
      if (timeLeft <= 0 && ticket.escalationLevel === 'junior') {
        const seniorAgentId = await findRandomSeniorAgent();
        if (seniorAgentId) {
          // Update ticket immediately
          const seniorAgent = await User.findById(seniorAgentId);
          ticket.assignedTo = seniorAgentId;
          ticket.escalationLevel = 'senior';
          ticket.escalationHistory.push({
            escalatedAt: now,
            from: 'junior',
            to: 'senior',
            reason: 'Deadline reached without resolution'
          });

          // Notify customer about reassignment
          await sendNotification(
            ticket.user,
            `Your ticket #${ticket.ticketNumber} has been reassigned to a senior agent for better assistance.`,
            'ticket_escalated',
            'customer',
            ticket._id
          );

          // Notify the new assigned senior agent
          await sendNotification(
            seniorAgentId,
            `You have been assigned ticket #${ticket.ticketNumber} due to escalation.`,
            'ticket_assigned',
            'agent',
            ticket._id
          );

          // Notify admins about the escalation
          await notifyAdmins(
            `Ticket #${ticket.ticketNumber} has been escalated to senior agent ${seniorAgent.name} due to deadline being reached.`,
            'ticket_escalated',
            ticket._id
          );

          // Emit real-time events for ticket assignment
          emitToUser(seniorAgentId, 'ticket_assigned', ticket);
          emitToUser(ticket.user, 'ticket_updated', ticket);

          // Save ticket immediately
          await ticket.save();
        }
      }
    }
  } catch (error) {
    console.error('Error in escalation job:', error);
  }
});
