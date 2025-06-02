import Article from '../models/Article.js';
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
 * @access Private/Admin
 */
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await article.remove();
    res.json({ message: 'Article deleted' });
  } catch (error) {
    console.error('Delete article error:', error);
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

    // Extract meaningful keywords from subject
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'where', 'when', 'why', 'is', 'are', 'was', 'were', 'my', 'i', 'me', 'can', 'cannot', 'not', 'no', 'help', 'please'];
    
    const extractKeywords = (text) => {
      return text
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(word => word.length > 2 && !stopWords.includes(word));
    };

    const subjectKeywords = extractKeywords(subject);
    
    console.log('Searching for related articles with subject:', subject);
    console.log('Extracted keywords:', subjectKeywords);

    // Simplified search criteria - ONLY search in article titles
    const searchCriteria = {
      isPublished: true,
      $or: []
    };

    // If we have keywords, search only in titles
    if (subjectKeywords.length > 0) {
      // Create regex patterns for each keyword (case-insensitive)
      const keywordRegexes = subjectKeywords.map(keyword => new RegExp(keyword, 'i'));
      
      // Search ONLY in title for keyword matches
      searchCriteria.$or.push({
        title: { $in: keywordRegexes }
      });

      // Also try exact phrase match in title
      searchCriteria.$or.push({
        title: { $regex: subject, $options: 'i' }
      });
    }

    // If no keywords found, still search for partial matches in title
    if (searchCriteria.$or.length === 0 && subject.trim().length > 0) {
      searchCriteria.$or.push({
        title: { $regex: subject.trim(), $options: 'i' }
      });
    }

    console.log('Final search criteria (title only):', JSON.stringify(searchCriteria, null, 2));

    // Execute the search - only get articles with title matches
    let relatedArticles = await Article.find(searchCriteria)
      .select('title description category content viewCount createdAt')
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(parseInt(limit) * 2); // Get more results for scoring

    // Score articles based on title relevance only
    if (subjectKeywords.length > 0) {
      relatedArticles = relatedArticles.map(article => {
        let score = 0;
        const titleLower = article.title.toLowerCase();

        // Score based on keyword matches in title only
        subjectKeywords.forEach(keyword => {
          if (titleLower.includes(keyword)) {
            score += 5; // High score for title keyword match
          }
        });

        // Bonus for exact phrase match in title
        if (titleLower.includes(subject.toLowerCase())) {
          score += 10; // Very high score for exact phrase in title
        }

        // Small bonus for popular articles
        score += Math.min((article.viewCount || 0) / 20, 2);

        return {
          ...article.toObject(),
          relevanceScore: score
        };
      });

      // Sort by relevance score (highest first)
      relatedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Only return articles with some relevance score
      relatedArticles = relatedArticles.filter(article => article.relevanceScore > 0);
    }

    // Get the top results
    const finalResults = relatedArticles.slice(0, parseInt(limit));

    console.log(`Found ${finalResults.length} related articles (title matches only)`);

    res.status(200).json({
      success: true,
      articles: finalResults,
      searchCriteria: {
        subject,
        category,
        extractedKeywords: subjectKeywords,
        totalMatches: relatedArticles.length,
        searchMethod: 'title_only'
      }
    });
  } catch (error) {
    console.error('Get related articles error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 