import cron from 'node-cron';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const REMINDER_INTERVALS = [
  { time: 24 * 60 * 60 * 1000, label: '1 day' },    // 1 day
  { time: 12 * 60 * 60 * 1000, label: '12 hours' }, // 12 hours
  { time: 6 * 60 * 60 * 1000, label: '6 hours' },   // 6 hours
  { time: 3 * 60 * 60 * 1000, label: '3 hours' },   // 3 hours
  { time: 60 * 60 * 1000, label: '1 hour' },        // 1 hour
  { time: 30 * 60 * 1000, label: '30 minutes' }     // 30 minutes
];

// Function to find an available senior agent
async function findSeniorAgent() {
  const seniorAgent = await User.findOne({
    role: 'agent',
    agentType: 'Senior'
  });
  return seniorAgent?._id;
}

// Function to send notification
async function sendNotification(userId, message, type = 'ticket_reminder') {
  await Notification.create({
    user: userId,
    message,
    type
  });
}

// Check tickets every 5 minutes
cron.schedule('*/5 * * * *', async () => {
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
          // Notify assigned agent
          if (ticket.assignedTo) {
            await sendNotification(
              ticket.assignedTo._id,
              `Ticket #${ticket.ticketNumber} deadline is approaching in ${interval.label}. Please take action.`,
              'ticket_reminder'
            );
          }

          // Notify customer
          await sendNotification(
            ticket.user,
            `Your ticket #${ticket.ticketNumber} is due in ${interval.label}.`,
            'ticket_reminder'
          );

          // Mark reminder as sent
          ticket.reminderSent.set(reminderKey, true);
        }
      }

      // Handle escalation if deadline passed
      if (timeLeft <= 0 && ticket.escalationLevel === 'junior') {
        const seniorAgentId = await findSeniorAgent();
        if (seniorAgentId) {
          // Update ticket
          ticket.assignedTo = seniorAgentId;
          ticket.escalationLevel = 'senior';
          ticket.escalationHistory.push({
            escalatedAt: now,
            from: 'junior',
            to: 'senior',
            reason: 'Deadline reached without resolution'
          });

          // Notify senior agent
          await sendNotification(
            seniorAgentId,
            `Ticket #${ticket.ticketNumber} has been escalated to you due to deadline being reached.`,
            'ticket_escalated'
          );

          // Notify customer
          await sendNotification(
            ticket.user,
            `Your ticket #${ticket.ticketNumber} has been escalated to a senior agent for better assistance.`,
            'ticket_escalated'
          );

          await ticket.save();
        }
      } else {
        await ticket.save();
      }
    }
  } catch (error) {
    console.error('Error in escalation job:', error);
  }
});
