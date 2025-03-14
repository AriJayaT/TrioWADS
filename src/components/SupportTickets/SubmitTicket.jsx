import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SubmitTicket.css";
import RelatedArticlesModal from "./RelatedArticlesModal";
import { findRelatedArticles } from "../../services/article-service";
import { Header } from "./Header";

// Category options with subcategories
const CATEGORIES = [
  {
    id: "orders-shipping",
    name: "Orders & Shipping",
    subcategories: [
      { id: "tracking", name: "Order Tracking" },
      { id: "missing-item", name: "Missing Item" },
      { id: "delayed", name: "Delayed Shipment" },
      { id: "international", name: "International Shipping" },
      { id: "address-change", name: "Change Address" }
    ]
  },
  {
    id: "product-care",
    name: "Product Care",
    subcategories: [
      { id: "cleaning", name: "Cleaning Instructions" },
      { id: "storage", name: "Storage Tips" },
      { id: "repair", name: "Repair Help" },
      { id: "age-recommendations", name: "Age Recommendations" }
    ]
  },
  {
    id: "returns",
    name: "Returns",
    subcategories: [
      { id: "process", name: "Return Process" },
      { id: "refund", name: "Refund Status" },
      { id: "exchange", name: "Exchange Request" },
      { id: "policy", name: "Return Policy" }
    ]
  },
  {
    id: "account",
    name: "Account",
    subcategories: [
      { id: "login", name: "Login Issues" },
      { id: "update", name: "Update Information" },
      { id: "privacy", name: "Privacy Concerns" },
      { id: "password", name: "Password Reset" }
    ]
  },
  {
    id: "product-inquiry",
    name: "Product Inquiry",
    subcategories: [
      { id: "availability", name: "Availability" },
      { id: "recommendations", name: "Recommendations" },
      { id: "specifications", name: "Specifications" },
      { id: "limited-editions", name: "Limited Editions" }
    ]
  },
  {
    id: "other",
    name: "Other",
    subcategories: [
      { id: "general", name: "General Inquiry" },
      { id: "feedback", name: "Feedback" },
      { id: "technical", name: "Technical Issues" }
    ]
  }
];

function SubmitTicket() {
  const navigate = useNavigate();
  
  // State for form fields
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Normal");
  
  // State for dropdowns
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  
  // State for modals
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [ticketRef, setTicketRef] = useState("");
  const [relatedArticles, setRelatedArticles] = useState([]);

  // Update available subcategories when category changes
  React.useEffect(() => {
    if (selectedCategoryId) {
      const selectedCategory = CATEGORIES.find(cat => cat.id === selectedCategoryId);
      setAvailableSubcategories(selectedCategory ? selectedCategory.subcategories : []);
      setSelectedSubcategoryId(""); // Reset subcategory when category changes
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategoryId]);

  // Get display names for selected category and subcategory
  const getSelectedCategoryName = () => {
    const category = CATEGORIES.find(cat => cat.id === selectedCategoryId);
    return category ? category.name : "Select Category";
  };

  const getSelectedSubcategoryName = () => {
    const subcategory = availableSubcategories.find(subcat => subcat.id === selectedSubcategoryId);
    return subcategory ? subcategory.name : "Select Subcategory";
  };

  // Functions to handle dropdown toggle
  const toggleCategoryDropdown = () => {
    setIsCategoryOpen(!isCategoryOpen);
    if (!isCategoryOpen) {
      setIsSubcategoryOpen(false);
    }
  };

  const toggleSubcategoryDropdown = () => {
    setIsSubcategoryOpen(!isSubcategoryOpen);
    if (!isSubcategoryOpen) {
      setIsCategoryOpen(false);
    }
  };

  // Functions to handle category and subcategory selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setIsCategoryOpen(false);
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategoryId(subcategoryId);
    setIsSubcategoryOpen(false);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.submit-ticket__dropdown')) {
        setIsCategoryOpen(false);
        setIsSubcategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to handle initial submission attempt
  function handleSubmitAttempt(e) {
    e.preventDefault();
    
    // Form validation
    if (!selectedCategoryId || !selectedSubcategoryId || !subject.trim() || !description.trim()) {
      alert("Please fill out all required fields");
      return;
    }
    
    // Find related articles based on the subject
    const articles = findRelatedArticles(subject, 3);
    setRelatedArticles(articles);
    
    // Show confirmation modal with related articles
    setIsConfirmationModalOpen(true);
  }

  // Function to finalize ticket submission after confirmation
  function submitTicket() {
    // Generate ticket reference
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    setTicketRef(`JC-${timestamp}-${random}`);
    
    // Close confirmation modal and show success modal
    setIsConfirmationModalOpen(false);
    setIsSuccessModalOpen(true);
  }

  // Function to cancel submission and return to form
  function cancelSubmission() {
    setIsConfirmationModalOpen(false);
  }

  // Function to close the success modal and navigate to dashboard
  function closeSuccessModal() {
    setIsSuccessModalOpen(false);
    // Navigate to the dashboard/support tickets page
    navigate('/dashboard');
  }

  // Function to cancel form submission and return to dashboard
  function cancelForm() {
    navigate('/dashboard');
  }

  return (
    <div className="submit-ticket">
      {/* Header at the top of the page */}
      <Header />
      
      <div className="submit-ticket__main">
        <div className="submit-ticket__content">
          <h1 className="submit-ticket__title">Submit a Ticket</h1>
          <p className="submit-ticket__description">
            Please provide detailed information about your issue to help us
            assist you better.
          </p>

          <form className="submit-ticket__form" onSubmit={handleSubmitAttempt}>
            <div className="submit-ticket__form-row">
              <div className="submit-ticket__form-group">
                <label className="submit-ticket__label">Category</label>
                <div className="submit-ticket__dropdown">
                  <div 
                    className="submit-ticket__dropdown-selected"
                    onClick={toggleCategoryDropdown}
                  >
                    <span>{getSelectedCategoryName()}</span>
                    <span className="submit-ticket__dropdown-arrow">▼</span>
                  </div>
                  
                  {isCategoryOpen && (
                    <div className="submit-ticket__dropdown-menu">
                      {CATEGORIES.map(category => (
                        <div 
                          key={category.id}
                          className={`submit-ticket__dropdown-item ${selectedCategoryId === category.id ? 'active' : ''}`}
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          {category.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="submit-ticket__form-group">
                <label className="submit-ticket__label">Sub-Category</label>
                <div className="submit-ticket__dropdown">
                  <div 
                    className={`submit-ticket__dropdown-selected ${!selectedCategoryId ? 'disabled' : ''}`}
                    onClick={selectedCategoryId ? toggleSubcategoryDropdown : null}
                  >
                    <span>{getSelectedSubcategoryName()}</span>
                    <span className="submit-ticket__dropdown-arrow">▼</span>
                  </div>
                  
                  {isSubcategoryOpen && (
                    <div className="submit-ticket__dropdown-menu">
                      {availableSubcategories.map(subcategory => (
                        <div 
                          key={subcategory.id}
                          className={`submit-ticket__dropdown-item ${selectedSubcategoryId === subcategory.id ? 'active' : ''}`}
                          onClick={() => handleSubcategorySelect(subcategory.id)}
                        >
                          {subcategory.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="submit-ticket__form-group">
              <label className="submit-ticket__label">Subject</label>
              <input
                type="text"
                className="submit-ticket__input"
                placeholder="Brief summary of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="submit-ticket__form-group">
              <label className="submit-ticket__label">Description</label>
              <textarea
                className="submit-ticket__textarea"
                placeholder="Please provide details about your issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="submit-ticket__form-footer">
              <div className="submit-ticket__priority">
                <label className="submit-ticket__label">Ticket Priority</label>
                <div className="submit-ticket__priority-select">
                  <label className="submit-ticket__priority-option">
                    <input
                      type="radio"
                      name="priority"
                      value="Low"
                      checked={priority === "Low"}
                      onChange={() => setPriority("Low")}
                    />
                    <div className="submit-ticket__priority-indicator">
                      <div className="submit-ticket__priority-dot submit-ticket__priority-dot--low" />
                      <span>Low</span>
                    </div>
                  </label>
                  
                  <label className="submit-ticket__priority-option">
                    <input
                      type="radio"
                      name="priority"
                      value="Normal"
                      checked={priority === "Normal"}
                      onChange={() => setPriority("Normal")}
                    />
                    <div className="submit-ticket__priority-indicator">
                      <div className="submit-ticket__priority-dot submit-ticket__priority-dot--normal" />
                      <span>Normal</span>
                    </div>
                  </label>
                  
                  <label className="submit-ticket__priority-option">
                    <input
                      type="radio"
                      name="priority"
                      value="High"
                      checked={priority === "High"}
                      onChange={() => setPriority("High")}
                    />
                    <div className="submit-ticket__priority-indicator">
                      <div className="submit-ticket__priority-dot submit-ticket__priority-dot--high" />
                      <span>High</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="submit-ticket__actions">
                <button 
                  type="button"
                  className="submit-ticket__button submit-ticket__button--secondary"
                  onClick={cancelForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-ticket__button submit-ticket__button--primary"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </form>

          <div className="submit-ticket__info-section">
            <div className="submit-ticket__priority-guide">
              <h3 className="submit-ticket__priority-guide-title">
                Priority Guidelines
              </h3>

              <div className="submit-ticket__priority-item">
                <div className="submit-ticket__priority-dot submit-ticket__priority-dot--high" />
                <span>
                  High - Critical issues affecting service or security
                </span>
              </div>

              <div className="submit-ticket__priority-item">
                <div className="submit-ticket__priority-dot submit-ticket__priority-dot--normal" />
                <span>Normal - Standard support requests</span>
              </div>

              <div className="submit-ticket__priority-item">
                <div className="submit-ticket__priority-dot submit-ticket__priority-dot--low" />
                <span>Low - General inquiries and information requests</span>
              </div>
            </div>

            <div className="submit-ticket__chat-widget">
              <div className="submit-ticket__chat-icon">💬</div>
              <div className="submit-ticket__chat-badge">2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles Confirmation Modal */}
      <RelatedArticlesModal
        isOpen={isConfirmationModalOpen}
        ticketSubject={subject}
        relatedArticles={relatedArticles}
        onSubmit={submitTicket}
        onCancel={cancelSubmission}
      />

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="submit-ticket__modal-overlay">
          <div className="submit-ticket__modal">
            <div className="submit-ticket__modal-icon">
              <span>✓</span>
            </div>

            <h3 className="submit-ticket__modal-title">
              Ticket Submitted Successfully!
            </h3>

            <div className="submit-ticket__modal-content">
              <span>Your ticket reference number is:</span>
              <div className="submit-ticket__modal-reference">{ticketRef}</div>
              <span>
                Please save this number for future reference. We'll review your
                ticket and get back to you shortly.
              </span>
            </div>

            <button
              className="submit-ticket__button submit-ticket__button--primary"
              onClick={closeSuccessModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmitTicket;