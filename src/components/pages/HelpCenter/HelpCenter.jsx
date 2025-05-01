import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ChatWidget from '../../common/ChatWidget';

const HelpCenter = () => {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle tab switching based on URL hash
  useEffect(() => {
    if (location.hash === '#faq') {
      setActiveTab('faq');
    } else if (location.hash === '#knowledge') {
      setActiveTab('knowledge');
    }
  }, [location.hash]);

  const toggleFAQ = (index) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const handleSupportClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/select-version');
    }
  };

  // Knowledge Base articles
  const articles = [
    {
      id: 1,
      title: 'How to Clean Your Plush Toys',
      category: 'Care Guide',
      description: 'Learn the proper methods for cleaning and maintaining your plush companions.',
      content: `<h2>Keeping Your Plush Toys Clean</h2>
      <p>Your Jellycat plush companions are designed to be cherished for many years. To ensure they stay in the best possible condition, follow these care instructions:</p>
      <h3>Spot Cleaning (Recommended)</h3>
      <ul>
        <li>Use a clean, damp cloth with mild soap</li>
        <li>Gently dab at the stained area without soaking the plush</li>
        <li>Allow to air dry completely</li>
      </ul>
      <h3>Hand Washing</h3>
      <ul>
        <li>Fill a basin with cool water and gentle detergent</li>
        <li>Gently agitate the plush toy in the water</li>
        <li>Rinse thoroughly with clean, cool water</li>
        <li>Squeeze out excess water (never wring)</li>
        <li>Reshape while damp</li>
        <li>Air dry completely away from direct heat</li>
      </ul>
      <h3>What to Avoid</h3>
      <ul>
        <li>Machine washing (can damage delicate features)</li>
        <li>Tumble drying (can melt plush fibers)</li>
        <li>Bleach or harsh chemicals</li>
        <li>Direct heat like radiators or hair dryers</li>
      </ul>
      <p>For especially beloved or delicate plush toys, consider professional cleaning services that specialize in stuffed animals.</p>`
    },
    {
      id: 2,
      title: 'Return Policy Information',
      category: 'Policies',
      description: 'Detailed information about our return policy and process.',
      content: `<h2>Jellycat Return Policy</h2>
      <p>We want you to be completely satisfied with your purchase. If for any reason you're not happy, we offer a comprehensive return policy to make the process smooth and hassle-free.</p>
      <h3>Return Eligibility</h3>
      <ul>
        <li>Items must be returned within 30 days of receipt</li>
        <li>Products must be in original, unused condition with tags attached</li>
        <li>Original receipt or proof of purchase required</li>
      </ul>
      <h3>Refund Process</h3>
      <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.</p>
      <p>If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.</p>
      <h3>Exceptions</h3>
      <p>Some items are non-returnable for hygiene reasons:</p>
      <ul>
        <li>Items marked as "Final Sale"</li>
        <li>Gift cards</li>
        <li>Personalized or custom items</li>
      </ul>
      <h3>Shipping Costs</h3>
      <p>Original shipping costs are non-refundable. Return shipping costs are the responsibility of the customer unless the return is due to our error.</p>`
    },
    {
      id: 3,
      title: 'Shipping Guidelines & Timeframes',
      category: 'Orders',
      description: 'Everything you need to know about shipping options and delivery times.',
      content: `<h2>Shipping Information</h2>
      <p>We ship worldwide and offer several shipping methods to meet your needs.</p>
      <h3>Domestic Shipping (United States)</h3>
      <ul>
        <li><strong>Standard Shipping:</strong> 3-5 business days ($5.99 or free for orders over $50)</li>
        <li><strong>Express Shipping:</strong> 2 business days ($12.99)</li>
        <li><strong>Next Day Shipping:</strong> Next business day if ordered before 1pm ET ($19.99)</li>
      </ul>
      <h3>International Shipping</h3>
      <ul>
        <li><strong>Standard International:</strong> 7-14 business days ($15.99)</li>
        <li><strong>Express International:</strong> 3-5 business days ($29.99)</li>
      </ul>
      <h3>Order Processing</h3>
      <p>Orders are typically processed within 1-2 business days. During holiday seasons or promotional periods, processing times may be slightly longer.</p>
      <h3>Tracking Information</h3>
      <p>Once your order ships, you'll receive a confirmation email with tracking information. You can track your package's journey in real-time through our website or the carrier's website.</p>
      <h3>Delivery Issues</h3>
      <p>If you experience any issues with your delivery, please contact our customer support team within 7 days of the expected delivery date.</p>`
    },
    {
      id: 4,
      title: 'Product Care Instructions',
      category: 'Care Guide',
      description: 'Tips and tricks to ensure your plush toys last for years to come.',
      content: `<h2>Caring for Your Jellycat Products</h2>
      <p>Your Jellycat plush toys are made with premium materials designed to last. Follow these care guidelines to keep them looking their best.</p>
      <h3>Daily Care</h3>
      <ul>
        <li>Keep away from pets who might chew on them</li>
        <li>Store in a clean, dry place when not in use</li>
        <li>Avoid prolonged exposure to direct sunlight to prevent fading</li>
        <li>Brush fur gently with a soft brush to maintain fluffiness</li>
      </ul>
      <h3>Dealing with Odors</h3>
      <p>If your plush develops an odor but doesn't need washing:</p>
      <ul>
        <li>Place in a plastic bag with 2-3 tablespoons of baking soda</li>
        <li>Seal the bag and gently shake</li>
        <li>Leave overnight, then brush off the baking soda outdoors</li>
      </ul>
      <h3>Long-term Storage</h3>
      <ul>
        <li>Clean thoroughly before storing</li>
        <li>Use acid-free tissue paper for stuffing</li>
        <li>Place in breathable cotton bags, not plastic</li>
        <li>Store in a climate-controlled environment</li>
      </ul>
      <h3>Special Features Care</h3>
      <p>For plush toys with special features like sound boxes, LED lights, or movable parts, refer to the specific care instructions included with your item.</p>`
    },
    {
      id: 5,
      title: 'Gift Options & Custom Orders',
      category: 'Orders',
      description: 'Information about gift wrapping services and custom orders.',
      content: `<h2>Gift Services & Custom Orders</h2>
      <h3>Gift Wrapping</h3>
      <p>Make your gift extra special with our complimentary gift wrapping service:</p>
      <ul>
        <li>Premium pink tissue paper with Jellycat seal</li>
        <li>Satin ribbon in your choice of color (pink, blue, or white)</li>
        <li>Personalized gift message on an elegant card</li>
      </ul>
      <p>To select gift wrapping, simply check the "Gift Wrap" option during checkout and enter your message if desired.</p>
      <h3>Custom Orders</h3>
      <p>We offer several customization options for special occasions:</p>
      <h4>Personalization</h4>
      <ul>
        <li>Name embroidery on select plush toys ($8.99)</li>
        <li>Custom birth announcement tags ($5.99)</li>
        <li>Special occasion tags (birthdays, graduations, etc.) ($4.99)</li>
      </ul>
      <h4>Corporate & Bulk Orders</h4>
      <p>For corporate events, party favors, or bulk purchases, we offer volume discounts and custom branding options. Contact our corporate sales team for quotes on orders of 10+ items.</p>
      <h4>Custom Plush Creation</h4>
      <p>For truly unique needs, we offer custom plush design services with a minimum order of 50 units. Design consultations are available for special projects.</p>
      <p>Please note that custom orders typically require 3-6 weeks production time depending on complexity.</p>`
    },
    {
      id: 6,
      title: 'Warranty Information',
      category: 'Policies',
      description: 'Details about our product warranty coverage and claims process.',
      content: `<h2>Jellycat Product Warranty</h2>
      <p>All Jellycat products come with a 90-day warranty against manufacturing defects. Here's what you need to know about our warranty policy:</p>
      <h3>What's Covered</h3>
      <ul>
        <li>Seam separation</li>
        <li>Stuffing issues</li>
        <li>Defective embroidery</li>
        <li>Faulty sound mechanisms or electronic components</li>
        <li>Incorrect or missing parts</li>
      </ul>
      <h3>What's Not Covered</h3>
      <ul>
        <li>Normal wear and tear</li>
        <li>Damage caused by improper use</li>
        <li>Water damage (unless the product is specifically labeled as washable)</li>
        <li>Damage from pets or excessive rough play</li>
        <li>Products without proof of purchase</li>
      </ul>
      <h3>How to Make a Warranty Claim</h3>
      <ol>
        <li>Contact customer service within 90 days of purchase</li>
        <li>Provide your order number and photos showing the defect</li>
        <li>Our team will review your claim within 2 business days</li>
        <li>If approved, we'll provide a prepaid return label</li>
        <li>Once received, we'll replace or refund the product</li>
      </ol>
      <h3>Extended Protection</h3>
      <p>For beloved companions, we offer an optional Extended Care Plan that covers your plush for a full year against accidents and additional issues. This can be added at checkout for $5.99 per item.</p>`
    },
  ];

  const categories = [
    { name: 'All Articles', count: articles.length },
    { name: 'Care Guide', count: articles.filter(a => a.category === 'Care Guide').length },
    { name: 'Policies', count: articles.filter(a => a.category === 'Policies').length },
    { name: 'Orders', count: articles.filter(a => a.category === 'Orders').length },
  ];

  // FAQ data
  const faqData = [
    {
      question: 'How do I clean my plush toy?',
      answer: 'We recommend spot cleaning with a damp cloth and mild detergent. For more stubborn stains, hand washing in cold water is advised. Do not machine wash or tumble dry as this may damage the plush toy. Always air dry naturally and reshape while damp.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all products in their original condition with tags attached. If you\'re not satisfied with your purchase, you can return it for a full refund or exchange. Shipping costs are non-refundable. Please contact our customer support team to initiate a return.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping typically takes 3-5 business days within the continental US. International shipping can take 7-14 business days depending on the destination. We also offer expedited shipping options at checkout for faster delivery.'
    },
    {
      question: 'Do you offer gift wrapping services?',
      answer: 'Yes! We offer complimentary gift wrapping for all purchases. You can select this option during checkout and add a personal message for the recipient. Our gift wrap features our signature pink tissue paper with a decorative ribbon.'
    },
    {
      question: 'What age are your plush toys suitable for?',
      answer: 'Our standard plush toys are suitable for children ages 12 months and up. However, we recommend checking the specific age guidance on each product page as some specialty plush toys may have different age recommendations based on their features.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order ships, you will receive a confirmation email with tracking information. You can use this tracking number on our website or the carrier\'s website to monitor the progress of your delivery. If you have any questions about your shipment, our customer support team is available to assist you.'
    }
  ];

  // Filter articles based on search query and selected category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Articles' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Filter FAQs based on search query
  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle category selection
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // View article details
  const handleViewArticle = (articleId) => {
    const article = articles.find(a => a.id === articleId);
    setSelectedArticle(article);
  };
  
  // Go back to article list
  const handleBackToList = () => {
    setSelectedArticle(null);
  };
  
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Help Center</h1>
      <p className="text-gray-600 mb-8">
        Find answers to your questions about our products and services
      </p>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button 
          onClick={() => setActiveTab('knowledge')}
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'knowledge' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
          id="knowledge"
        >
          Knowledge Base
        </button>
        <button 
          onClick={() => setActiveTab('faq')}
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'faq' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
          id="faq"
        >
          Frequently Asked Questions
        </button>
      </div>

      {/* Search Box - Only show when not viewing article details */}
      {!selectedArticle && (
        <div className="relative mb-8">
          <div className="bg-pink-50 p-2 rounded-xl shadow-sm border border-pink-100">
            <div className="flex items-center bg-white rounded-lg overflow-hidden border border-pink-200 focus-within:ring-2 focus-within:ring-pink-300">
              <span className="pl-4 text-pink-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={activeTab === 'knowledge' ? "Search articles..." : "Search FAQs..."}
                className="w-full px-3 py-3 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="pr-4 text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-xs text-pink-600 font-medium pl-2">
                {activeTab === 'knowledge' 
                  ? `Found ${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''}`
                  : `Found ${filteredFaqs.length} FAQ${filteredFaqs.length !== 1 ? 's' : ''}`
                }
              </div>
            )}
          </div>
        </div>
      )}

      {/* Knowledge Base Content */}
      {activeTab === 'knowledge' && (
        <>
          {selectedArticle ? (
            <div className="bg-white p-6 rounded-xl shadow">
              <button 
                onClick={handleBackToList}
                className="flex items-center text-pink-500 mb-4 hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to articles
              </button>
              
              <span className="text-sm font-medium text-pink-500 bg-pink-50 px-2 py-1 rounded">
                {selectedArticle.category}
              </span>
              
              <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-4">{selectedArticle.title}</h2>
              
              <div 
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Categories Sidebar */}
              <div className="w-full md:w-64 shrink-0">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <button 
                        onClick={() => handleCategorySelect(category.name)}
                        className={`flex justify-between items-center py-2 px-3 rounded w-full text-left ${
                          selectedCategory === category.name ? 'bg-pink-100 text-pink-700' : 'text-gray-700 hover:bg-pink-50'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">{category.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Articles Grid */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedCategory === 'All Articles' ? 'Popular Articles' : selectedCategory}
                  </h3>
                  {filteredArticles.length > 0 ? (
                    <span className="text-sm text-gray-500">{filteredArticles.length} articles found</span>
                  ) : null}
                </div>
                
                {filteredArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredArticles.map(article => (
                      <div key={article.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-xs font-medium text-pink-500 bg-pink-50 px-2 py-1 rounded">{article.category}</span>
                        <h4 className="font-medium text-gray-800 mt-2 mb-1">{article.title}</h4>
                        <p className="text-gray-500 text-sm mb-3">{article.description}</p>
                        <button 
                          onClick={() => handleViewArticle(article.id)}
                          className="text-pink-500 text-sm font-medium hover:underline"
                        >
                          Read More →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg text-center">
                    <p className="text-gray-500">No articles match your search criteria</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* FAQ Content */}
      {activeTab === 'faq' && (
        <div className="max-w-3xl mx-auto">
          {/* FAQ Accordion */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="font-medium text-gray-800">{faq.question}</span>
                    <svg
                      className={`w-5 h-5 text-pink-500 transform transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg text-center mb-8">
              <p className="text-gray-500">No FAQs match your search criteria</p>
            </div>
          )}

          {/* Need more help section */}
          <div className="mt-10 bg-pink-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Need more help?</h3>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link
              to={isAuthenticated ? "/customer/create-ticket" : "#"}
              onClick={handleSupportClick}
              className="bg-pink-400 text-white px-6 py-2 rounded-lg inline-block hover:bg-pink-500"
            >
              Contact Support
            </Link>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default HelpCenter; 