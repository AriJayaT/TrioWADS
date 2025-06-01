import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaSpinner, FaHome, FaTicketAlt, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { IoMdHelpCircle } from 'react-icons/io';
import ticketService from '../../../services/api/ticketService';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.jpg';
import NotificationBell from '../../common/NotificationBell';

const CreateTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [profileMenu, setProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: '',
    priority: 'Normal',
    attachments: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketReference, setTicketReference] = useState('');
  
  const categories = [
    'Orders & Shipping',
    'Product Issues',
    'Billing',
    'Returns',
    'General Inquiry'
  ];
  
  const priorities = [
    'High',
    'Normal',
    'Low'
  ];

  // Function to determine if a navigation item should be highlighted as active
  const isActive = (route) => {
    if (route === '/customer' || route === '/customer/dashboard') {
      return location.pathname === '/customer' || location.pathname === '/customer/dashboard';
    }
    return location.pathname.startsWith(route);
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate('/'); // Navigate to landing page
    }, 50);
  };

  // Get user's initials for avatar display
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Please select a priority';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create ticket data object
      const ticketData = {
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        attachments: formData.attachments
      };
      
      // Call the API to create the ticket
      const response = await ticketService.createTicket(ticketData);
      
      // Set the ticket reference from the response
      setTicketReference(response.ticket._id);
      setSubmitSuccess(true);
      
      // Navigate to tickets page after showing success message
      setTimeout(() => {
        navigate('/customer');
      }, 3000);
    } catch (error) {
      console.error('Error creating ticket:', error);
      setErrors({
        ...errors,
        submit: typeof error === 'string' ? error : 'Failed to submit ticket. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 w-full z-30">
        <div className="flex h-14 items-center px-4 justify-between">
          {/* Logo & Title */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-xl overflow-hidden">
              <img src={logo} alt="YipHelp" className="object-cover w-full h-full" />
            </div>
            <span className="ml-3 text-base font-bold">YipHelp</span>
            
            {/* Navigation */}
            <nav className="hidden md:flex ml-8">
              <Link 
                to="/customer" 
                className={`flex items-center px-4 h-full ${isActive('/customer') ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <FaHome className="mr-2" /> Home
              </Link>
              <Link 
                to="/customer/tickets" 
                className={`flex items-center px-4 h-full ${isActive('/customer/tickets') ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <FaTicketAlt className="mr-2" /> My Tickets
              </Link>
              <Link 
                to="/customer/help-center" 
                className={`flex items-center px-4 h-full ${isActive('/customer/help-center') ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <IoMdHelpCircle className="mr-2" /> Help Center
              </Link>
            </nav>
          </div>

          {/* Profile & Notifications */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationBell />
            <div className="relative" ref={profileRef}>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setProfileMenu((open) => !open)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-avatar.jpg';
                      }}
                    />
                  ) : (
                    <span className="text-pink-500 text-sm font-medium">
                      {getUserInitials()}
                    </span>
                  )}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="text-sm font-medium">{user?.name || 'Customer'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Customer'}</p>
                </div>
              </div>
              
              {/* Profile Dropdown */}
              {profileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/customer/profile" className="flex items-center px-4 py-2 text-sm text-pink-500 hover:bg-gray-100">
                    <FaUserCircle className="mr-2 text-pink-500" /> Your Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="mr-2" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Add padding top to prevent content being hidden behind fixed navbar */}
        <div style={{ height: '56px' }} />
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Support Ticket</h1>
            {submitSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h2 className="text-green-700 font-medium text-lg mb-2">Ticket Created Successfully!</h2>
                <p className="text-green-600 mb-4">
                  Your ticket has been submitted with reference number: 
                  <span className="bg-green-100 px-3 py-1 rounded-lg font-bold ml-2">{ticketReference}</span>
                </p>
                <p className="text-green-600 mb-2">Our support team will review your ticket shortly.</p>
                <p className="text-sm text-gray-500">You will be redirected to your dashboard in a few seconds...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
                    {errors.submit}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Brief summary of your issue"
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select a Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg ${errors.priority ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                  {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    className={`w-full p-3 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Please provide detailed information about your issue..."
                  ></textarea>
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/customer')}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 mr-4 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-60"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin inline mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTicket; 