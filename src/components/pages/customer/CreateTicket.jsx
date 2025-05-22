import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFileUpload, FaSpinner } from 'react-icons/fa';
import ticketService from '../../../services/api/ticketService';
import { useAuth } from '../../../context/AuthContext';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/customer')}
        className="flex items-center text-pink-500 hover:text-pink-600 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </button>
      
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
  );
};

export default CreateTicket; 