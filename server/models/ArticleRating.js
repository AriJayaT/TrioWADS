import mongoose from 'mongoose';

const articleRatingSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isHelpful: {
    type: Boolean,
    required: true
  },
  ipAddress: {
    type: String,
    // For non-authenticated users, we can track by IP
  },
  userAgent: {
    type: String,
    // Additional fingerprinting for non-authenticated users
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
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  id: false
});

// Create compound unique index to prevent duplicate ratings from same user for same article
articleRatingSchema.index({ article: 1, user: 1 }, { unique: true });

// For non-authenticated users, prevent duplicate ratings from same IP/userAgent combo
articleRatingSchema.index({ article: 1, ipAddress: 1, userAgent: 1 }, { 
  unique: true, 
  sparse: true // Only create index when ipAddress exists
});

const ArticleRating = mongoose.model('ArticleRating', articleRatingSchema);
export default ArticleRating; 