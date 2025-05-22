import Article from '../models/Article.js';

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
    
    if (isHelpful === undefined) {
      return res.status(400).json({ error: 'Rating value is required' });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment appropriate counter
    if (isHelpful) {
      article.helpfulCount += 1;
    } else {
      article.unhelpfulCount += 1;
    }

    await article.save();

    res.status(200).json({
      success: true,
      helpfulCount: article.helpfulCount,
      unhelpfulCount: article.unhelpfulCount
    });
  } catch (error) {
    console.error('Rate article error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 