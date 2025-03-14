/**
 * Service to search for related articles based on keywords
 */

// Mock article database - in a real application, this would come from an API or database
const ARTICLES_DATABASE = [
  {
    id: 1,
    title: "How to Clean Your Jellycat Plush",
    category: "Care & Maintenance",
    excerpt: "Learn the best practices for cleaning and maintaining your Jellycat plush toys to keep them looking their best.",
    content: "Jellycat plush toys should be spot cleaned with mild soap and water. Avoid machine washing as it can damage the soft fabric...",
    keywords: ["cleaning", "wash", "care", "maintenance", "plush", "stain", "dirty", "spot clean"],
    url: "/help-center/article/1"
  },
  {
    id: 2,
    title: "Jellycat Return Policy Overview",
    category: "Returns & Exchanges",
    excerpt: "Everything you need to know about returning or exchanging your Jellycat products within our 30-day return window.",
    content: "We offer a 30-day return policy for all Jellycat products. Items must be in original condition with tags attached...",
    keywords: ["return", "exchange", "refund", "policy", "damaged", "wrong item", "money back"],
    url: "/help-center/article/2"
  },
  {
    id: 3,
    title: "Tracking Your Jellycat Order",
    category: "Shipping & Delivery",
    excerpt: "Learn how to track your Jellycat orders and understand our shipping timeframes.",
    content: "Once your order ships, you'll receive a confirmation email with tracking information. Most orders are delivered within 3-5 business days...",
    keywords: ["shipping", "delivery", "track", "order", "package", "tracking number", "lost", "delayed"],
    url: "/help-center/article/3"
  },
  {
    id: 4,
    title: "Common Jellycat Washing Instructions",
    category: "Care & Maintenance",
    excerpt: "Detailed washing instructions for different types of Jellycat plush toys to ensure they stay soft and cuddly.",
    content: "Most Jellycat toys should be surface cleaned only. For more washable styles, use cold water and gentle soap...",
    keywords: ["washing", "wash", "clean", "instructions", "surface clean", "machine wash", "hand wash"],
    url: "/help-center/article/4"
  },
  {
    id: 5,
    title: "Finding Limited Edition Jellycat Plush",
    category: "Products",
    excerpt: "Tips for finding and collecting limited edition and retired Jellycat plush toys.",
    content: "Limited edition Jellycats are released throughout the year and are available while supplies last...",
    keywords: ["limited edition", "rare", "discontinued", "collector", "special", "retired", "find", "exclusive"],
    url: "/help-center/article/5"
  },
  {
    id: 6,
    title: "Jellycat Size Guide",
    category: "Products",
    excerpt: "A comprehensive size chart for all Jellycat plush toys from Tiny and Small to Really Big and Huge.",
    content: "Jellycat plush toys come in various sizes. Tiny (under 18cm), Small (18-24cm), Medium (25-35cm), Large (36-49cm), and Huge (50cm+)...",
    keywords: ["size", "dimensions", "tiny", "small", "medium", "large", "huge", "really big", "measurements"],
    url: "/help-center/article/6"
  },
  {
    id: 7,
    title: "International Shipping for Jellycat Products",
    category: "Shipping & Delivery",
    excerpt: "Information about international shipping options, duties, and timeframes for Jellycat orders.",
    content: "We ship Jellycat products worldwide. International shipping typically takes 7-14 business days...",
    keywords: ["international", "shipping", "overseas", "global", "customs", "duties", "import", "foreign", "abroad"],
    url: "/help-center/article/7"
  },
  {
    id: 8,
    title: "Jellycat Gift Wrapping Services",
    category: "Orders",
    excerpt: "Details about our gift wrapping options for Jellycat plush toys and how to add gift messages.",
    content: "Make your Jellycat gift extra special with our premium gift wrapping service. Simply select the gift wrap option at checkout...",
    keywords: ["gift", "wrapping", "present", "message", "card", "occasion", "birthday", "special", "package"],
    url: "/help-center/article/8"
  },
  {
    id: 9,
    title: "Replacing Missing or Damaged Jellycat Parts",
    category: "Customer Support",
    excerpt: "What to do if your Jellycat arrives damaged or is missing parts like tags or accessories.",
    content: "If your Jellycat plush arrives damaged or is missing any parts, please contact our customer service team within 7 days of receipt...",
    keywords: ["damaged", "missing", "broken", "parts", "tag", "accessory", "incomplete", "replacement", "repair"],
    url: "/help-center/article/9"
  },
  {
    id: 10,
    title: "Jellycat Authenticity Guide",
    category: "Products",
    excerpt: "How to identify authentic Jellycat products and avoid counterfeits in the market.",
    content: "Authentic Jellycat products feature high-quality materials, distinctive tags, and our signature branding...",
    keywords: ["authentic", "real", "counterfeit", "fake", "genuine", "original", "knockoff", "verification", "legitimate"],
    url: "/help-center/article/10"
  }
];

/**
 * Find related articles based on a subject string
 * @param {string} subject - The subject to search for related articles
 * @param {number} limit - Maximum number of articles to return
 * @returns {Array} Array of related articles
 */
export const findRelatedArticles = (subject, limit = 3) => {
  if (!subject || subject.trim() === '') {
    return [];
  }

  // Extract meaningful keywords from the subject
  const subjectWords = subject.toLowerCase().split(/\s+/);
  const keywords = subjectWords.filter(word => 
    word.length > 3 && 
    !['the', 'and', 'for', 'with', 'from', 'your', 'about'].includes(word)
  );

  // Calculate relevance score for each article
  const scoredArticles = ARTICLES_DATABASE.map(article => {
    let score = 0;
    
    // Check title match (higher weight)
    const titleLower = article.title.toLowerCase();
    keywords.forEach(keyword => {
      if (titleLower.includes(keyword)) {
        score += 3;
      }
    });
    
    // Check keyword match
    keywords.forEach(keyword => {
      if (article.keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
        score += 2;
      }
    });
    
    // Check category match
    const categoryLower = article.category.toLowerCase();
    keywords.forEach(keyword => {
      if (categoryLower.includes(keyword)) {
        score += 1;
      }
    });
    
    return { ...article, score };
  });

  // Filter articles with a score > 0 and sort by score (descending)
  return scoredArticles
    .filter(article => article.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/**
 * Extracts the main topic from a subject
 * This is a simplified version - in a real app, you might use NLP
 * @param {string} subject - The subject to analyze
 * @returns {string} The main topic
 */
export const extractMainTopic = (subject) => {
  if (!subject) return '';
  
  // Remove common prefixes/words
  const cleanSubject = subject
    .replace(/^re:/i, '')
    .replace(/^fwd:/i, '')
    .replace(/^regarding/i, '')
    .replace(/^about/i, '')
    .trim();
    
  // Get the first few words (likely the main topic)
  const words = cleanSubject.split(/\s+/);
  return words.slice(0, Math.min(3, words.length)).join(' ');
};