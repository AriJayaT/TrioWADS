import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an article title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Care Guide', 'Policies', 'Orders', 'FAQs', 'General'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide article content']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  unhelpfulCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for search functionality
articleSchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text'
});

// Update the updatedAt field when the article is modified
articleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * SwaggerUI annotations
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - content
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the article
 *         title:
 *           type: string
 *           description: Article title
 *         category:
 *           type: string
 *           enum: [Care Guide, Policies, Orders, FAQs, General]
 *           description: Article category
 *         description:
 *           type: string
 *           description: Brief description of the article
 *         content:
 *           type: string
 *           description: HTML content of the article
 *         author:
 *           type: string
 *           description: ID of the user who created the article
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Keywords related to the article
 *         isPublished:
 *           type: boolean
 *           description: Whether the article is publicly visible
 *         viewCount:
 *           type: number
 *           description: Number of times the article has been viewed
 *         helpfulCount:
 *           type: number
 *           description: Number of users who found the article helpful
 *         unhelpfulCount:
 *           type: number
 *           description: Number of users who found the article unhelpful
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date article was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: Date article was last updated
 */

const Article = mongoose.model('Article', articleSchema);
export default Article; 