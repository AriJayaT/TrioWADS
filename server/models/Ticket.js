import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['general', 'product', 'shipping', 'return', 'other']
  },
  subcategory: {
    type: String,
    required: [true, 'Please select a subcategory']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'waiting-for-customer', 'resolved', 'closed'],
    default: 'open'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  ticketNumber: {
    type: String,
    unique: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for replies to this ticket
ticketSchema.virtual('replies', {
  ref: 'TicketReply',
  localField: '_id',
  foreignField: 'ticket',
  justOne: false
});

// Generate a unique ticket number before saving
ticketSchema.pre('save', async function(next) {
  // Only generate a ticket number if this is a new document
  if (this.isNew) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `JC-${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Update the lastUpdated timestamp
  this.lastUpdated = Date.now();
  
  next();
});

/**
 * SwaggerUI annotations
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       required:
 *         - subject
 *         - description
 *         - category
 *         - subcategory
 *         - user
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the ticket
 *         subject:
 *           type: string
 *           description: Ticket subject/title
 *         description:
 *           type: string
 *           description: Detailed description of the issue
 *         category:
 *           type: string
 *           enum: [general, product, shipping, return, other]
 *           description: Main category of the ticket
 *         subcategory:
 *           type: string
 *           description: Subcategory of the ticket
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Ticket priority
 *         status:
 *           type: string
 *           enum: [open, in-progress, waiting-for-customer, resolved, closed]
 *           description: Current status of the ticket
 *         user:
 *           type: string
 *           description: ID of the user who created the ticket
 *         assignedTo:
 *           type: string
 *           description: ID of the agent assigned to the ticket
 *         ticketNumber:
 *           type: string
 *           description: Unique ticket reference number
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date ticket was created
 *         lastUpdated:
 *           type: string
 *           format: date
 *           description: Date ticket was last updated
 */

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket; 