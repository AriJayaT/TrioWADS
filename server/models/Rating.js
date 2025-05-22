import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
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
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Create a copy of _id as id
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      // Then remove _id and __v
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  // Disable automatic 'id' virtual
  id: false
});

// Add a unique compound index to prevent multiple ratings for the same ticket
ratingSchema.index({ ticket: 1, user: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating; 