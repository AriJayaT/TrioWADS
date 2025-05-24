import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ChatWidget from '../../common/ChatWidget';
import { fetchArticles } from '../../../services/articleService';

const HelpCenter = ({ layout = "default" }) => {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

    useEffect(() => {
      if (location.hash === '#faq') {
        setActiveTab('faq');
      } else if (location.hash === '#knowledge') {
        setActiveTab('knowledge');
      }
    }, [location.hash]);
  
    useEffect(() => {
      const loadArticles = async () => {
        try {
          const data = await fetchArticles();
          setArticles(data);
        } catch (err) {
          console.error('Failed to fetch articles:', err);
        } finally {
          setLoading(false);
        }
      };
      loadArticles();
    }, []);
  
    const toggleFAQ = (index) => {
      setOpenFaqIndex(index === openFaqIndex ? null : index);
    };
  
    const handleSupportClick = (e) => {
      if (!isAuthenticated) {
        e.preventDefault();
        navigate('/select-version');
      }
    };
  
    // This is the Category definitions for filtering
    const categories = [
      { name: 'All Articles', count: articles.length },
      { name: 'Care Guide', count: articles.filter(a => a.category === 'Care Guide').length },
      { name: 'Policies', count: articles.filter(a => a.category === 'Policies').length },
      { name: 'Orders', count: articles.filter(a => a.category === 'Orders').length },
    ];
  
    // All of the Static FAQ entries
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
  
  
    // This is the Filter which Filter articles based on search and category
    const filteredArticles = articles.filter(article => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All Articles' || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  
  
    const filteredFaqs = faqData.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  
    // This handle Handle search input changes
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };
  
  
    const handleCategorySelect = (categoryName) => {
      setSelectedCategory(categoryName);
    };
  
  
    const handleViewArticle = (articleId) => {
      const article = articles.find(a => a._id === articleId || a.id === articleId);
      setSelectedArticle(article);
    };
  
  
    const handleBackToList = () => {
      setSelectedArticle(null);
    };
  
  
    // UI Rendering
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
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'knowledge'
              ? 'text-pink-500 border-b-2 border-pink-500'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'faq'
              ? 'text-pink-500 border-b-2 border-pink-500'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Frequently Asked Questions
          </button>
        </div>
  
        {/* Search Box */}
        {!selectedArticle && (
          <div className="relative mb-8">
            <div className="bg-pink-50 p-2 rounded-xl shadow-sm border border-pink-100">
              <div className="flex items-center bg-white rounded-lg overflow-hidden border border-pink-200 focus-within:ring-2 focus-within:ring-pink-300">
                <span className="pl-4 text-pink-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
  
        {/* Article Content */}
        {activeTab === 'knowledge' && (
          <>
            {selectedArticle ? (
              <div className="bg-white p-6 rounded-xl shadow">
                <button
                  onClick={handleBackToList}
                  className="flex items-center text-pink-500 mb-4 hover:underline"
                >
                  ← Back to articles
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
                {/* Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Categories</h3>
                  <ul className="space-y-2">
                    {categories.map((category, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleCategorySelect(category.name)}
                          className={`flex justify-between items-center py-2 px-3 rounded w-full text-left ${selectedCategory === category.name ? 'bg-pink-100 text-pink-700' : 'text-gray-700 hover:bg-pink-50'}`}
                        >
                          <span>{category.name}</span>
                          <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">
                            {category.count}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
  
                {/* Article Cards */}
                <div className="flex-1">
                  {loading ? (
                    <p className="text-gray-500">Loading articles...</p>
                  ) : filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredArticles.map(article => (
                        <div key={article._id || article.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <span className="text-xs font-medium text-pink-500 bg-pink-50 px-2 py-1 rounded">{article.category}</span>
                          <h4 className="font-medium text-gray-800 mt-2 mb-1">{article.title}</h4>
                          <p className="text-gray-500 text-sm mb-3">{article.description}</p>
                          <button
                            onClick={() => handleViewArticle(article._id || article.id)}
                            className="text-pink-500 text-sm font-medium hover:underline"
                          >
                            Read More →
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No articles match your search.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
  
        {/* FAQ Section */}
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto">
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
  
            <div className="mt-10 bg-pink-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Need more help?</h3>
              <p className="text-gray-600 mb-4">Can't find what you're looking for? Our support team is here to help.</p>
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
  
        <ChatWidget />
      </div>
    );
  };
  
  export default HelpCenter;