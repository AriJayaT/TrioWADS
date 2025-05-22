import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import ticketService from '../../../services/api/ticketService';
import { useAuth } from '../../../context/AuthContext';
import TicketRatingForm from '../../customer/TicketRatingForm';
import TicketRatingDisplay from '../../customer/TicketRatingDisplay';

const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ticketRating, setTicketRating] = useState(null);

  // Create a refresh counter to force refetching when needed
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Function to explicitly refresh ticket data
  const refreshTicket = () => {
    console.log('Manually refreshing ticket');
    setRefreshCounter(prev => prev + 1);
  };

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if ticketId is valid
        if (!ticketId || ticketId === 'undefined' || ticketId === 'null') {
          setError('Invalid ticket ID. Please go back to your tickets and try again.');
          setLoading(false);
          return;
        }
        
        // Log the ticket ID we're trying to fetch
        console.log("Fetching ticket with ID:", ticketId, "Refresh count:", refreshCounter);
        
        try {
          const ticketData = await ticketService.getTicket(ticketId);
          console.log("Ticket data:", ticketData); // Added for debugging
          
          if (!ticketData || !ticketData.ticket) {
            setError('Could not retrieve ticket details. Please try again later.');
            setLoading(false);
            return;
          }
          
          // Log the ticket status for debugging
          console.log(`Ticket status: ${ticketData.ticket.status}`);
          
          setTicket({
            ...ticketData.ticket,
            messages: ticketData.replies || []
          });
          
          // If the ticket is closed or marked as having a rating, try to fetch the rating
          if (ticketData.ticket.status === 'closed' || ticketData.ticket.hasRating) {
            try {
              const ratingData = await ticketService.getTicketRating(ticketId);
              if (ratingData && ratingData.success && ratingData.rating) {
                setTicketRating(ratingData.rating);
                setShowRatingForm(false);
              } else {
                // If no rating and ticket is closed, show the rating form
                setShowRatingForm(ticketData.ticket.status === 'closed');
              }
            } catch (ratingError) {
              console.error('Error fetching ticket rating:', ratingError);
              // If failed to fetch rating and ticket is closed, still show the form
              setShowRatingForm(ticketData.ticket.status === 'closed');
            }
          } else {
            // For other statuses
            setShowRatingForm(false);
            setTicketRating(null);
          }
        } catch (apiError) {
          console.error('API error fetching ticket:', apiError);
          
          // Check if this is a specific error about permissions
          if (apiError.response?.status === 403) {
            setError("You don't have permission to view this ticket.");
          } else {
            setError(apiError.message || 'Failed to load ticket details. Please try again later.');
          }
        }
      } catch (err) {
        console.error('Overall error in fetchTicketDetails:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
    
    // Set up an auto-refresh interval for resolved tickets
    let intervalId;
    if (ticket && ticket.status === 'resolved') {
      console.log('Setting up auto-refresh for resolved ticket');
      intervalId = setInterval(() => {
        console.log('Auto-refreshing resolved ticket');
        fetchTicketDetails();
      }, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ticketId, refreshCounter]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    try {
      setSubmitting(true);
      
      const replyData = {
        message: replyText
      };
      
      // If ticket is resolved and customer is continuing the chat, explicitly set status
      if (ticket.status === 'resolved') {
        // First update ticket status to waiting-for-agent
        await ticketService.updateTicket(ticketId, { status: 'waiting-for-agent' });
      }
      
      // Send the reply
      const response = await ticketService.addReply(ticketId, replyData);
      
      // Make sure the reply is properly marked as from the customer
      const customerReply = {
        ...response.reply,
        sender: 'customer',  // Explicitly set sender to 'customer'
        senderName: user?.name // Include sender's name for consistent display
      };
      
      // Update the local ticket state with the new reply and new status
      setTicket(prevTicket => ({
        ...prevTicket,
        status: 'waiting-for-agent',
        messages: [...(prevTicket.messages || []), customerReply],
        updatedAt: new Date().toISOString()
      }));
      
      // Clear the input
      setReplyText('');
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingSubmitted = async (ratingData) => {
    try {
      // Call the API to submit the rating
      const response = await ticketService.submitRating(ticketId, ratingData);
      console.log('Rating submitted successfully:', response);
      
      // Fetch the actual rating from the server to ensure we have complete data
      const ratingResponse = await ticketService.getTicketRating(ticketId);
      
      if (ratingResponse && ratingResponse.success && ratingResponse.rating) {
        setTicketRating(ratingResponse.rating);
      } else {
        // If we can't fetch it, at least use what we submitted
        setTicketRating({
          rating: ratingData.rating,
          feedback: ratingData.feedback
        });
      }
      
      // Update the ticket with the rating info
      setTicket(prevTicket => ({
        ...prevTicket,
        isRated: true,
        hasRating: true,
        status: 'closed'
      }));
      
      // Hide the rating form after submission
      setShowRatingForm(false);
      
      // Refresh ticket data to get latest status
      refreshTicket();
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting-for-customer':
        return 'bg-blue-100 text-blue-800';
      case 'waiting-for-agent':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-pink-100 text-pink-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    return 'bg-pink-100 text-pink-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/customer/tickets')}
          className="mt-2 text-red-600 hover:text-red-700 underline"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Ticket Not Found</h2>
        <p className="mt-2 text-gray-600">The ticket you're looking for doesn't exist or has been removed.</p>
        <Link to="/customer/tickets" className="mt-6 inline-block bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm">
          Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link to="/customer/tickets" className="text-pink-500 hover:text-pink-700 flex items-center gap-1 mb-4">
          <FaArrowLeft /> Back to tickets
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
              {ticket.status === 'waiting-for-customer' ? 'Reply Requested' : 
               ticket.status === 'waiting-for-agent' ? 'Waiting for Agent' :
               ticket.status === 'resolved' ? 'Pending Confirmation' :
               ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace(/-/g, ' ')}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <span>Ticket ID: {ticket._id || ticket.ticketNumber}</span>
          <span className="mx-2">•</span>
          <span>Created: {formatDate(ticket.createdAt)}</span>
          {ticket.assignedTo && (
            <>
              <span className="mx-2">•</span>
              <span>Assigned to: {ticket.assignedTo.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Resolution Confirmation Options */}
      {ticket.status === 'resolved' && !showRatingForm && (
        <div className="mb-6 bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-medium text-green-800 mb-3">
            This ticket has been marked as resolved by the agent
          </h3>
          <p className="text-green-700 mb-4">
            Is your issue completely resolved?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={async () => {
                try {
                  console.log('User confirmed resolution, closing ticket');
                  const result = await ticketService.updateTicket(ticketId, { status: 'closed' });
                  console.log('Ticket close result:', result);
                  
                  // Update local state
                  setTicket(prev => ({...prev, status: 'closed'}));
                  setShowRatingForm(true);
                  
                  // Refresh to ensure we have the latest data
                  refreshTicket();
                } catch (err) {
                  console.error('Error closing ticket:', err);
                  setError('Failed to close ticket. Please try again.');
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none flex-1 flex items-center justify-center gap-2"
            >
              <span>Yes, issue resolved</span>
            </button>
            <button 
              onClick={() => {
                // Show reply form and focus on it
                document.getElementById('customer-reply-textarea')?.focus();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none flex-1 flex items-center justify-center gap-2"
            >
              <span>No, continue chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Rating Display or Form */}
      {ticketRating ? (
        // If we have a rating, show the display component
        <div className="mb-6">
          <TicketRatingDisplay rating={ticketRating} />
        </div>
      ) : (
        // If no rating but showRatingForm is true, show the form
        showRatingForm && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <TicketRatingForm 
              ticketId={ticketId} 
              onSubmit={handleRatingSubmitted} 
            />
          </div>
        )
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="bg-white shadow rounded-lg overflow-hidden h-full">
            <div className="px-4 py-5 bg-gray-50 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Ticket Information
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-medium mb-1 text-gray-700">Category</h4>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(ticket.category)}`}>
                    {ticket.category || "General"}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-1 text-gray-700">Description</h4>
                <div className="text-gray-600 bg-gray-50 p-3 rounded">
                  {ticket.description || "No description provided"}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1 text-gray-700">Created</h4>
                  <div className="text-gray-600">
                    {formatDate(ticket.createdAt)}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-gray-700">Last Updated</h4>
                  <div className="text-gray-600">
                    {formatDate(ticket.updatedAt || ticket.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden h-full">
          <div className="px-4 py-5 bg-gray-50 border-b">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Conversation History
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {ticket.messages && ticket.messages.length > 0 ? (
              ticket.messages.map((message, index) => (
                <div 
                  key={message._id || index}
                  className={`p-4 rounded-lg ${
                    message.sender === 'customer' 
                      ? 'bg-pink-50 ml-8' 
                      : 'bg-gray-50 mr-8'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {message.sender === 'customer' ? 'Me' : message.senderName || 'Agent'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(message.timestamp || message.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{message.content || message.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No messages yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
        <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
          <div className="px-4 py-5 bg-gray-50 border-b">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Reply
            </h3>
          </div>
          <div className="p-4">
            <form onSubmit={handleReply}>
              <textarea
                id="customer-reply-textarea"
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                rows="4"
                placeholder="Type your message here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={submitting}
                required
              ></textarea>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Reply'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Continue Chat Form (for when ticket is resolved but customer wants to continue) */}
      {ticket.status === 'resolved' && (
        <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
          <div className="px-4 py-5 bg-gray-50 border-b">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Continue Conversation
            </h3>
          </div>
          <div className="p-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!replyText.trim()) {
                alert("Please type a message to continue the conversation.");
                return;
              }
              
              handleReply(e);
            }}>
              <textarea
                id="customer-reply-textarea"
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                rows="4"
                placeholder="Explain why the issue isn't resolved..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={submitting}
                required
              ></textarea>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Continue Chat'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TicketDetails; 