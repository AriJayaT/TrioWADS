import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaHome, FaTicketAlt, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { IoMdArrowDropdown, IoMdHelpCircle } from 'react-icons/io';
import logo from '/src/assets/logo.jpg';
import CustomerHeader from '../../common/CustomerHeader';
import CustomerFooter from '../../common/CustomerFooter';
import { useAuth } from '../../../context/AuthContext';
import { ticketService, articleService } from '../../../services/api';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [profileMenu, setProfileMenu] = useState(false);
  
  // Check if user is authenticated, redirect to login if not
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/select-version');
    }
  }, [isAuthenticated, navigate]);
  
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    subcategory: '',
    description: '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showRelatedArticles, setShowRelatedArticles] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [ticketReference, setTicketReference] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null); // For article popup

  // Categories data with subcategories and priorities
  const categories = [
    { 
      value: 'Product Issues', 
      label: 'Product Issues',
      subcategories: [
        { value: 'Damaged Products', label: 'Damaged Products', priority: 'high' },
        { value: 'Quality Concerns', label: 'Quality Concerns', priority: 'medium' },
        { value: 'Product Information', label: 'Product Information', priority: 'low' }
      ]
    },
    { 
      value: 'Orders & Shipping', 
      label: 'Orders & Shipping',
      subcategories: [
        { value: 'Missing Items', label: 'Missing Items', priority: 'high' },
        { value: 'Delivery Issues', label: 'Delivery Issues', priority: 'high' },
        { value: 'Order Status', label: 'Order Status', priority: 'medium' },
        { value: 'International Shipping', label: 'International Shipping', priority: 'medium' }
      ]
    },
    { 
      value: 'Billing & Payments', 
      label: 'Billing & Payments',
      subcategories: [
        { value: 'Payment Processing', label: 'Payment Processing', priority: 'high' },
        { value: 'Refunds & Returns', label: 'Refunds & Returns', priority: 'high' }
      ]
    },
    { 
      value: 'Account Management', 
      label: 'Account Management',
      subcategories: [
        { value: 'Login Issues', label: 'Login Issues', priority: 'medium' },
        { value: 'Profile Updates', label: 'Profile Updates', priority: 'low' }
      ]
    },
    { 
      value: 'General Inquiries', 
      label: 'General Inquiries',
      subcategories: [
        { value: 'Product Availability', label: 'Product Availability', priority: 'medium' },
        { value: 'Store Information', label: 'Store Information', priority: 'low' },
        { value: 'Company Policies', label: 'Company Policies', priority: 'low' },
        { value: 'Feedback & Suggestions', label: 'Feedback & Suggestions', priority: 'low' }
      ]
    }
  ];

  // Knowledge base articles for related content
  const knowledgeBaseArticles = [
    {
      id: 1,
      title: 'How to Clean Your Plush Toys',
      category: 'product',
      subcategory: 'cleaning',
      description: 'Learn the proper methods for cleaning and maintaining your plush companions.',
      content: 'Most Jellycat plush toys can be spot cleaned with a damp cloth and mild detergent. For more stubborn stains, hand washing in cold water is recommended. Never machine wash or tumble dry as this may damage the plush toy.'
    },
    {
      id: 2,
      title: 'Return Policy Information',
      category: 'return',
      subcategory: 'process',
      description: 'Detailed information about our return policy and process.',
      content: 'We offer a 30-day return policy for all products in their original condition with tags attached. To initiate a return, simply log in to your account, find your order, and select "Return Items".'
    },
    {
      id: 3,
      title: 'Shipping Guidelines & Timeframes',
      category: 'shipping',
      subcategory: 'tracking',
      description: 'Everything you need to know about shipping options and delivery times.',
      content: 'Standard shipping typically takes 3-5 business days within the continental US. International shipping can take 7-14 business days depending on the destination. All orders receive tracking information via email once shipped.'
    },
    {
      id: 4,
      title: 'Product Care Instructions',
      category: 'product',
      subcategory: 'usage',
      description: 'Tips and tricks to ensure your plush toys last for years to come.',
      content: 'To extend the life of your plush toy, avoid exposure to direct sunlight for long periods, keep away from heating sources, and gently spot clean as needed.'
    },
    {
      id: 5,
      title: 'Tracking Your Order',
      category: 'shipping',
      subcategory: 'tracking',
      description: 'How to track your package and what to do if there are issues.',
      content: 'You can track your order through your account or using the tracking number in your shipping confirmation email. If your package shows as delivered but you haven\'t received it, please contact support within 48 hours.'
    },
    {
      id: 6,
      title: 'Refund Processing Timeline',
      category: 'return',
      subcategory: 'refund',
      description: 'Information about how long refunds take to process.',
      content: 'Once your return is received and inspected, refunds are typically processed within 3-5 business days. The time it takes for the refund to appear in your account depends on your payment method and financial institution.'
    },
  ];

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const category = categories.find(c => c.value === formData.category);
      if (category && category.subcategories && category.subcategories.length > 0) {
        setFormData(prev => ({
          ...prev,
          subcategory: category.subcategories[0].value
        }));
      } else {
        setFormData(prev => ({ ...prev, subcategory: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category]);

  // Find priority based on category and subcategory
  const getPriority = () => {
    const category = categories.find(c => c.value === formData.category);
    if (category && category.subcategories) {
      const subcategory = category.subcategories.find(sc => sc.value === formData.subcategory);
      if (subcategory) {
        return subcategory.priority;
      }
    }
    return 'medium'; // Default priority
  };

  // Find related articles based on category and subcategory
  const findRelatedArticles = async () => {
    try {
      // Try to find articles from the backend first
      const params = {
        category: formData.category,
        search: formData.subject, // Use the subject as a search term too
        limit: 3
      };
      
      const articleResponse = await articleService.getArticles(params);
      
      if (articleResponse && articleResponse.articles && articleResponse.articles.length > 0) {
        return articleResponse.articles;
      }
      
      // Fallback to the local articles if no results from backend
      const matchingArticles = knowledgeBaseArticles.filter(article => {
        return (
          article.category === formData.category || 
          article.subcategory === formData.subcategory ||
          article.title.toLowerCase().includes(formData.subject.toLowerCase())
        );
      });
      
      // Sort by relevance (exact category & subcategory match first)
      const sortedArticles = matchingArticles.sort((a, b) => {
        const aExactMatch = a.category === formData.category && a.subcategory === formData.subcategory;
        const bExactMatch = b.category === formData.category && b.subcategory === formData.subcategory;
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        return 0;
      });
      
      return sortedArticles.slice(0, 3); // Return top 3 most relevant articles
    } catch (error) {
      console.error('Error fetching related articles:', error);
      // Fallback to local articles on error
      return knowledgeBaseArticles
        .filter(article => article.category === formData.category)
        .slice(0, 3);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      attachments: [...e.target.files]
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.subcategory) {
      newErrors.subcategory = 'Subcategory is required';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        const articles = await findRelatedArticles();
        setRelatedArticles(articles);
        
        if (articles.length > 0) {
          setShowRelatedArticles(true);
        } else {
          proceedWithSubmission();
        }
      } catch (error) {
        proceedWithSubmission();
      }
    } else {
      setErrors(validationErrors);
    }
  };
  
  const proceedWithSubmission = async () => {
    setIsSubmitting(true);
    
    try {
      // Create ticket data object
      const ticketData = {
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        attachments: formData.attachments,
        priority: getPriority()
      };
      
      console.log('Submitting ticket with data:', ticketData);
      
      // Call the API to create the ticket
      const response = await ticketService.createTicket(ticketData);
      console.log('Ticket submission response:', response);
      
      // Set the ticket reference from the response
      setTicketReference(response.ticket.ticketNumber);
      setSubmitSuccess(true);
      setShowRelatedArticles(false);
      
      // Navigate to tickets page after showing success message
      setTimeout(() => {
        navigate('/customer');
      }, 5000); // Increased to 5 seconds to give users more time to see the ticket ID
    } catch (error) {
      console.error('Error creating ticket:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Token expired or invalid
        setErrors({
          ...errors,
          submit: 'Your session has expired. Please log in again.'
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Handle other errors
        setErrors({
          ...errors,
          submit: typeof error === 'string' ? error : 'Failed to submit ticket. Please try again.'
        });
      }
      setIsSubmitting(false);
    }
  };
  
  const cancelSubmission = () => {
    // Instead of just hiding the articles, proceed with ticket submission
    proceedWithSubmission();
  };
  
  // Add a new function to handle when the issue is resolved
  const handleIssueResolved = () => {
    // Redirect directly to the dashboard when issue is resolved
    navigate('/customer');
  };

  // Function to open article popup
  const openArticlePopup = (article) => {
    setSelectedArticle(article);
  };
  
  // Function to close article popup
  const closeArticlePopup = () => {
    setSelectedArticle(null);
  };

  const handleLogout = () => {
    // This function is not used in this component anymore since we're using CustomerHeader
    // which has its own logout functionality
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header/Navbar */}
      <CustomerHeader />

      {/* Article Popup Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedArticle.title}</h3>
                <button onClick={closeArticlePopup} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="prose max-w-none">
                <p>{selectedArticle.content}</p>
              </div>
              <div className="mt-6 text-right">
                <button 
                  onClick={closeArticlePopup} 
                  className="px-4 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto py-8 px-4 flex-grow">
        <div className="max-w-2xl mx-auto">
          <div className="flex mb-6">
            <div className="flex items-baseline">
              <Link 
                to="/customer/tickets"
                className="text-pink-500 hover:text-pink-600 mr-2"
                title="Back to My Tickets"
              >
                <FaArrowLeft />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit a Support Ticket</h1>
                <p className="text-gray-600 mb-6">
                  Fill out the form below to create a new support ticket. Our team will respond to your inquiry as soon as possible.
                </p>
              </div>
            </div>
          </div>

          {submitSuccess ? (
            <div className="bg-green-50 p-6 rounded-xl text-center">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your ticket has been submitted</h2>
              <p className="text-gray-700 text-center mb-4">
                Your ticket ID is: <span className="font-semibold">{ticketReference}</span>
              </p>
              <p className="text-gray-600 mb-4">We'll get back to you shortly.</p>
              <p className="text-sm text-gray-500">Redirecting you to your tickets...</p>
            </div>
          ) : showRelatedArticles ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Articles Related to Your Issue</h2>
              <p className="text-gray-600 mb-6">
                We found some articles that might help you resolve your issue:
              </p>
              
              <div className="space-y-4 mb-6">
                {relatedArticles.map(article => (
                  <div key={article.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800">{article.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 mb-2">
                      {article.description || article.content.substring(0, 100)}...
                    </p>
                    <button 
                      onClick={() => openArticlePopup(article)} 
                      className="text-pink-500 text-sm font-medium hover:text-pink-700"
                    >
                      Read Full Article →
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Did these articles solve your problem?</p>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelSubmission}
                    className="px-4 py-2 text-pink-500 border border-pink-200 rounded-lg hover:bg-pink-50"
                  >
                    No, Submit My Ticket
                  </button>
                  <button
                    onClick={handleIssueResolved}
                    className="px-4 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500"
                  >
                    Yes, Issue Resolved
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="category">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="subcategory">
                    Subcategory
                  </label>
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                    disabled={!formData.category}
                  >
                    <option value="" disabled>{formData.category ? 'Select a subcategory' : 'Select a category first'}</option>
                    {categories.find(c => c.value === formData.category)?.subcategories.map(subcategory => (
                      <option key={subcategory.value} value={subcategory.value}>
                        {subcategory.label}
                      </option>
                    ))}
                  </select>
                  {errors.subcategory && <p className="text-red-500 text-xs mt-1">{errors.subcategory}</p>}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="subject">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                    errors.subject ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <label className="block text-gray-700 text-sm font-medium" htmlFor="priority">
                    Priority:
                  </label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getPriority() === 'high' ? 'bg-pink-100 text-pink-800' :
                    getPriority() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {getPriority() === 'high' ? 'High' : getPriority() === 'medium' ? 'Medium' : 'Low'}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    (Automatically set based on category and subcategory)
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Please describe your issue in detail..."
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="attachments">
                  Attachments (Optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="pt-1 text-sm text-gray-500">
                        {formData.attachments.length > 0 
                          ? `${formData.attachments.length} file(s) selected` 
                          : 'Drag & drop files or click to browse'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      id="attachments"
                      multiple
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link
                  to="/customer"
                  className="px-4 py-2 mr-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-pink-400 text-white rounded-lg hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <CustomerFooter />
    </div>
  );
};

export default CreateTicket; 