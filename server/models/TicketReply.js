import mongoose from 'mongoose';

const ticketReplySchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Reply message is required'],
    trim: true
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  sender: {
    type: String,
    enum: ['customer', 'agent'],
    required: false
  },
  senderName: {
    type: String,
    required: false
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the parent ticket's lastUpdated field when a reply is added
ticketReplySchema.post('save', async function() {
  await mongoose.model('Ticket').findByIdAndUpdate(this.ticket, {
    lastUpdated: Date.now()
  });
});

/**
 * SwaggerUI annotations
 * @swagger
 * components:
 *   schemas:
 *     TicketReply:
 *       type: object
 *       required:
 *         - ticket
 *         - user
 *         - message
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the reply
 *         ticket:
 *           type: string
 *           description: ID of the ticket this reply belongs to
 *         user:
 *           type: string
 *           description: ID of the user who created the reply
 *         message:
 *           type: string
 *           description: Reply message content
 *         isInternal:
 *           type: boolean
 *           description: Whether this is an internal note only visible to staff
 *         sender:
 *           type: string
 *           description: Type of sender (customer or agent)
 *         senderName:
 *           type: string
 *           description: Name of the sender
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: number
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date reply was created
 */

const TicketReply = mongoose.model('TicketReply', ticketReplySchema);
export default TicketReply; 