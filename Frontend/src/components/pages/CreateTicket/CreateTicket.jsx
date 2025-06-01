import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaHome, FaTicketAlt, FaArrowLeft, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { IoMdArrowDropdown, IoMdHelpCircle } from 'react-icons/io';
import logo from '../../../assets/logo.jpg';
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

  // Remove the hardcoded knowledgeBaseArticles array and replace findRelatedArticles function
  const findRelatedArticles = async () => {
    try {
      // Create search parameters based on ticket data
      const searchParams = {
        published: true,
        limit: 5
      };

      // Add search terms from subject and description
      if (formData.subject) {
        searchParams.search = formData.subject;
      }

      // Try to find articles from the backend
      let articleResponse = await articleService.getArticles(searchParams);
      
      if (articleResponse?.success && articleResponse.articles?.length > 0) {
        // Filter and sort articles by relevance
        let relevantArticles = articleResponse.articles.filter(article => {
          // Check if article category matches common keywords
          const subjectLower = formData.subject.toLowerCase();
          const categoryLower = article.category.toLowerCase();
          const titleLower = article.title.toLowerCase();
          const descriptionLower = (article.description || '').toLowerCase();
          
          // Check for keyword matches
          return (
            titleLower.includes(subjectLower) ||
            descriptionLower.includes(subjectLower) ||
            categoryLower.includes('general') ||
            (formData.category.includes('Product') && categoryLower.includes('care')) ||
            (formData.category.includes('Shipping') && categoryLower.includes('order')) ||
            (formData.category.includes('Billing') && categoryLower.includes('policies')) ||
            (formData.category.includes('Account') && categoryLower.includes('general'))
          );
        });

        // If no specific matches, get general articles
        if (relevantArticles.length === 0) {
          relevantArticles = articleResponse.articles.filter(article => 
            article.category === 'General' || article.category === 'FAQs'
          );
        }

        // Sort by view count (popularity) and return top 3
        relevantArticles.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        return relevantArticles.slice(0, 3);
      }

      // If no articles found from backend, try a broader search
      const broadSearchResponse = await articleService.getArticles({
        published: true,
        limit: 10
      });

      if (broadSearchResponse?.success && broadSearchResponse.articles?.length > 0) {
        // Return the most popular articles as fallback
        const popularArticles = broadSearchResponse.articles
          .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
          .slice(0, 3);
        return popularArticles;
      }

      return [];
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return [];
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
    
    // Validate form
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare ticket data
      const ticketData = {
        subject: formData.subject,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        priority: getPriority(),
        attachments: formData.attachments
      };
      
      // Create ticket
      const response = await ticketService.createTicket(ticketData);
      
      if (response && response.ticket) {
        // Set ticket reference for success message
        const ticketNumber = response.ticket.ticketNumber || response.ticket._id;
        setTicketReference(ticketNumber);
        setSubmitSuccess(true);
        
        // Clear form
        setFormData({
          subject: '',
          category: '',
          subcategory: '',
          description: '',
          attachments: []
        });
        
        // Clear errors
        setErrors({});
        
        // Show success message for at least 5 seconds
        setTimeout(() => {
          // Only navigate if the user hasn't clicked any buttons
          if (submitSuccess) {
            navigate('/customer/tickets');
          }
        }, 5000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setErrors({
        submit: error.message || 'Failed to create ticket. Please try again.'
      });
    } finally {
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
                {selectedArticle.content && selectedArticle.content.includes('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{selectedArticle.content}</div>
                )}
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
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Created Successfully!</h2>
                <p className="text-gray-600 mb-4">
                  Your ticket has been created with reference number: <span className="font-semibold">{ticketReference}</span>
                </p>
              </div>
            </div>
          ) : showRelatedArticles ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Articles Related to Your Issue</h2>
              <p className="text-gray-600 mb-6">
                We found some articles that might help you resolve your issue:
              </p>
              
              <div className="space-y-4 mb-6">
                {relatedArticles.map(article => (
                  <div key={article._id || article.id} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800">{article.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 mb-2">
                      {article.description || (article.content && article.content.substring(0, 100) + '...')}
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