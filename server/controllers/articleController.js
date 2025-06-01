import Article from '../models/Article.js';
import ArticleRating from '../models/ArticleRating.js';
import User from '../models/User.js';

/**
 * Get all articles (with filtering)
 * @route GET /api/articles
 * @access Public
 */
export const getArticles = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10, published = true } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (published === 'true') filter.isPublished = true;
    
    // Add search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Get articles with pagination
    const articles = await Article.find(filter)
      .populate('author', 'name')
      .sort({ viewCount: -1 }) // Sort by popularity
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Article.countDocuments(filter);

    // Get category counts for sidebar
    const categoryCounts = await Article.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      categoryCounts,
      articles
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get article by ID
 * @route GET /api/articles/:id
 * @access Public
 */
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name')
      .populate('relatedArticles', 'title description');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // If article is not published, only admins and agents can see it
    if (!article.isPublished && (!req.user || !['admin', 'agent'].includes(req.user.role))) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment view count
    article.viewCount += 1;
    await article.save();

    // Get related articles based on tags if none are explicitly set
    let relatedArticles = article.relatedArticles;
    if (!relatedArticles || relatedArticles.length === 0) {
      relatedArticles = await Article.find({
        _id: { $ne: article._id },
        isPublished: true,
        $or: [
          { category: article.category },
          { tags: { $in: article.tags } }
        ]
      })
      .select('title description category')
      .limit(3);
    }

    res.status(200).json({
      success: true,
      article,
      relatedArticles
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Create new article
 * @route POST /api/articles
 * @access Private (Admin/Agent)
 */
export const createArticle = async (req, res) => {
  try {
    // Only admins and agents can create articles
    if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to create articles' });
    }

    const { title, category, description, content, tags, isPublished } = req.body;

    const article = await Article.create({
      title,
      category,
      description,
      content,
      author: req.user.id,
      tags: tags || [],
      isPublished: isPublished !== undefined ? isPublished : true
    });

    res.status(201).json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Update article
 * @route PUT /api/articles/:id
 * @access Private (Admin/Agent)
 */
export const updateArticle = async (req, res) => {
  try {
    // Only admins and agents can update articles
    if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to update articles' });
    }

    const { title, category, description, content, tags, isPublished, relatedArticles } = req.body;
    
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Update fields
    if (title) article.title = title;
    if (category) article.category = category;
    if (description) article.description = description;
    if (content) article.content = content;
    if (tags) article.tags = tags;
    if (isPublished !== undefined) article.isPublished = isPublished;
    if (relatedArticles) article.relatedArticles = relatedArticles;

    article.updatedAt = Date.now();
    
    await article.save();

    res.status(200).json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete article
 * @route DELETE /api/articles/:id
 * @access Private (Admin/Agent)
 */
export const deleteArticle = async (req, res) => {
  try {
    // Only admins and agents can delete articles
    if (!req.user || !['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to delete articles' });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Rate article (helpful/unhelpful)
 * @route POST /api/articles/:id/rate
 * @access Public
 */
export const rateArticle = async (req, res) => {
  try {
    const { isHelpful } = req.body;
    const articleId = req.params.id;
    
    if (isHelpful === undefined) {
      return res.status(400).json({ error: 'Rating value is required' });
    }

    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Check if user is authenticated
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    let existingRating = null;

    if (userId) {
      // For authenticated users, check by user ID
      existingRating = await ArticleRating.findOne({ 
        article: articleId, 
        user: userId 
      });
    } else {
      // For non-authenticated users, check by IP and user agent
      existingRating = await ArticleRating.findOne({ 
        article: articleId, 
        ipAddress, 
        userAgent 
      });
    }

    let wasUpdated = false;
    let newRating = null;

    if (existingRating) {
      // User has already rated - update the existing rating
      const oldRating = existingRating.isHelpful;
      const newRatingValue = Boolean(isHelpful);
      
      // Only update if the rating actually changed
      if (oldRating !== newRatingValue) {
        // Update the rating record
        existingRating.isHelpful = newRatingValue;
        existingRating.createdAt = new Date(); // Update timestamp to show when it was changed
        await existingRating.save();
        
        // Update article counters
        if (oldRating) {
          // Was helpful, now not helpful
          article.helpfulCount = Math.max(0, article.helpfulCount - 1);
          article.unhelpfulCount += 1;
        } else {
          // Was not helpful, now helpful
          article.unhelpfulCount = Math.max(0, article.unhelpfulCount - 1);
          article.helpfulCount += 1;
        }
        
        await article.save();
        wasUpdated = true;
        newRating = existingRating;
      } else {
        // Same rating - no change needed
        newRating = existingRating;
      }
    } else {
      // Create new rating record
      const ratingData = {
        article: articleId,
        isHelpful: Boolean(isHelpful)
      };

      if (userId) {
        ratingData.user = userId;
      } else {
        ratingData.ipAddress = ipAddress;
        ratingData.userAgent = userAgent;
      }

      newRating = await ArticleRating.create(ratingData);

      // Update article counters for new rating
      if (isHelpful) {
        article.helpfulCount += 1;
      } else {
        article.unhelpfulCount += 1;
      }

      await article.save();
    }

    res.status(200).json({
      success: true,
      helpfulCount: article.helpfulCount,
      unhelpfulCount: article.unhelpfulCount,
      userRating: {
        isHelpful: newRating.isHelpful,
        createdAt: newRating.createdAt
      },
      wasUpdated: wasUpdated // Indicate if this was an update vs new rating
    });
  } catch (error) {
    console.error('Rate article error:', error);
    
    // Handle duplicate key error (in case of race conditions)
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Rating conflict occurred. Please try again.',
        conflictError: true
      });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Check if user has already rated an article
 * @route GET /api/articles/:id/rating
 * @access Public
 */
export const getUserArticleRating = async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    let existingRating = null;

    if (userId) {
      // For authenticated users, check by user ID
      existingRating = await ArticleRating.findOne({ 
        article: articleId, 
        user: userId 
      });
    } else {
      // For non-authenticated users, check by IP and user agent
      existingRating = await ArticleRating.findOne({ 
        article: articleId, 
        ipAddress, 
        userAgent 
      });
    }

    if (existingRating) {
      return res.status(200).json({
        success: true,
        hasRated: true,
        rating: {
          isHelpful: existingRating.isHelpful,
          createdAt: existingRating.createdAt
        }
      });
    } else {
      return res.status(200).json({
        success: true,
        hasRated: false,
        rating: null
      });
    }
  } catch (error) {
    console.error('Get user article rating error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get related articles based on ticket subject and category
 * @route GET /api/articles/related
 * @access Public
 */
export const getRelatedArticles = async (req, res) => {
  try {
    const { subject, category, limit = 3 } = req.query;
    
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    // Create search criteria
    const searchCriteria = {
      isPublished: true,
      $or: []
    };

    // Add subject-based search (case-insensitive partial match)
    const subjectWords = subject.toLowerCase().split(' ').filter(word => word.length > 2);
    if (subjectWords.length > 0) {
      searchCriteria.$or.push({
        $or: [
          { title: { $regex: subjectWords.join('|'), $options: 'i' } },
          { description: { $regex: subjectWords.join('|'), $options: 'i' } },
          { content: { $regex: subjectWords.join('|'), $options: 'i' } }
        ]
      });
    }

    // Add category-based search if provided
    if (category) {
      // Map ticket categories to article categories
      const categoryMapping = {
        'Product Issues': ['Care Guide', 'General'],
        'Orders & Shipping': ['Orders', 'Policies'],
        'Billing & Payments': ['Policies', 'Orders'],
        'Account Management': ['General', 'Policies'],
        'General Inquiries': ['General', 'FAQs']
      };

      const relatedCategories = categoryMapping[category] || ['General'];
      searchCriteria.$or.push({
        category: { $in: relatedCategories }
      });
    }

    // Fallback: if no specific matches, get general articles
    if (searchCriteria.$or.length === 0) {
      searchCriteria.$or.push({ category: 'General' });
    }

    console.log('Searching for related articles with criteria:', JSON.stringify(searchCriteria, null, 2));

    const relatedArticles = await Article.find(searchCriteria)
      .select('title description category viewCount')
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(parseInt(limit));

    // If we don't have enough results, get popular articles as fallback
    if (relatedArticles.length < parseInt(limit)) {
      const additionalArticles = await Article.find({
        _id: { $nin: relatedArticles.map(a => a._id) },
        isPublished: true
      })
      .select('title description category viewCount')
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(parseInt(limit) - relatedArticles.length);

      relatedArticles.push(...additionalArticles);
    }

    res.status(200).json({
      success: true,
      articles: relatedArticles,
      searchCriteria: {
        subject,
        category,
        searchTerms: subjectWords
      }
    });
  } catch (error) {
    console.error('Get related articles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 