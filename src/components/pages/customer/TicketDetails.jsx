import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TicketRatingForm from '../../customer/TicketRatingForm';

const TicketDetails = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);

  // Mock ticket data
  const mockTickets = {
    'TK-2024-001': {
      id: 'TK-2024-001',
      subject: 'Missing Item from Order #JC45692',
      category: 'Orders & Shipping',
      status: 'Open',
      priority: 'High',
      createdAt: '2024-05-17T10:30:00Z',
      lastUpdate: '2 hours ago',
      description: 'I recently received my order #JC45692 but the Bashful Bunny that I ordered is missing from the package. All other items were included. Could you please help me resolve this issue?',
      assignedAgent: 'Alex Thompson',
      isRated: false,
      messages: [
        {
          id: 1,
          sender: 'customer',
          senderName: 'Sophie Anderson',
          content: 'I recently received my order #JC45692 but the Bashful Bunny that I ordered is missing from the package. All other items were included. Could you please help me resolve this issue?',
          timestamp: '2024-05-17T10:30:00Z',
        },
        {
          id: 2,
          sender: 'agent',
          senderName: 'Alex Thompson',
          content: 'Hi Sophie, I\'m sorry to hear about the missing item. I\'ll check your order details and get back to you shortly.',
          timestamp: '2024-05-17T11:45:00Z',
        }
      ]
    },
    'TK-2024-002': {
      id: 'TK-2024-002',
      subject: 'Washing Instructions for Bashful Dragon',
      category: 'Product Care',
      status: 'Closed',
      priority: 'Normal',
      createdAt: '2024-05-14T14:20:00Z',
      lastUpdate: '3 days ago',
      assignedAgent: 'Emily Clark',
      isRated: true, // Already rated
      rating: 5,
      description: 'Could you please provide me with detailed washing instructions for the Bashful Dragon? I want to make sure I clean it properly without damaging it.',
      messages: [
        {
          id: 1,
          sender: 'customer',
          senderName: 'Sophie Anderson',
          content: 'Could you please provide me with detailed washing instructions for the Bashful Dragon? I want to make sure I clean it properly without damaging it.',
          timestamp: '2024-05-14T14:20:00Z',
        },
        {
          id: 2,
          sender: 'agent',
          senderName: 'Emily Clark',
          content: 'Hello Sophie, Thank you for your inquiry. The Bashful Dragon can be surface washed with a damp cloth and mild soap. For deeper cleaning, we recommend hand washing in cold water with a gentle detergent. Please do not put it in the washing machine or dryer as this can damage the plush material. Let it air dry completely before giving it back to your little one. Hope this helps!',
          timestamp: '2024-05-14T15:05:00Z',
        },
        {
          id: 3,
          sender: 'customer',
          senderName: 'Sophie Anderson',
          content: 'Thank you for the detailed instructions. That\'s very helpful!',
          timestamp: '2024-05-15T09:10:00Z',
        }
      ]
    },
    'TK-2024-003': {
      id: 'TK-2024-003',
      subject: 'Return Request for Damaged Item',
      category: 'Returns',
      status: 'Closed', // Resolved but not yet rated
      priority: 'Normal',
      createdAt: '2024-05-16T16:45:00Z',
      lastUpdate: '1 day ago',
      isRated: false,
      assignedAgent: 'Daniel Walker',
      description: 'I received a damaged Fuddlewuddle Puppy in my recent order. The stitching on one of the ears is coming apart. I would like to return it for a replacement.',
      messages: [
        {
          id: 1,
          sender: 'customer',
          senderName: 'Sophie Anderson',
          content: 'I received a damaged Fuddlewuddle Puppy in my recent order. The stitching on one of the ears is coming apart. I would like to return it for a replacement.',
          timestamp: '2024-05-16T16:45:00Z',
        },
        {
          id: 2,
          sender: 'agent',
          senderName: 'Daniel Walker',
          content: 'Hello Sophie, I\'m sorry to hear about the damaged item. We\'ll be happy to process a replacement for you. Could you please send a photo of the damaged item to help with our quality control?',
          timestamp: '2024-05-16T17:30:00Z',
        },
        {
          id: 3,
          sender: 'customer',
          senderName: 'Sophie Anderson',
          content: 'I\'ve attached a photo of the damaged ear. Let me know if you need any more information.',
          timestamp: '2024-05-16T18:05:00Z',
        },
        {
          id: 4,
          sender: 'agent',
          senderName: 'Daniel Walker',
          content: 'Thank you for the photo. I\'ve processed a replacement order for the Fuddlewuddle Puppy. You should receive the new item within 3-5 business days. No need to return the damaged item. We apologize for the inconvenience.',
          timestamp: '2024-05-16T18:45:00Z',
        },
      ]
    }
  };

  useEffect(() => {
    // Simulate API call to fetch ticket data
    setLoading(true);
    setTimeout(() => {
      const foundTicket = mockTickets[ticketId];
      setTicket(foundTicket || null);
      
      // Show rating form if the ticket is closed/resolved and not yet rated
      if (foundTicket && foundTicket.status === 'Closed' && !foundTicket.isRated) {
        setShowRatingForm(true);
      } else {
        setShowRatingForm(false);
      }
      
      setLoading(false);
    }, 500);
  }, [ticketId]);

  const handleReply = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      // In a real app, this would send the reply to an API
      console.log('Sending reply:', replyText);
      
      // Optimistically update the UI with the new message
      const newMessage = {
        id: ticket.messages.length + 1,
        sender: 'customer',
        senderName: 'Sophie Anderson',
        content: replyText,
        timestamp: new Date().toISOString(),
      };
      
      setTicket({
        ...ticket,
        messages: [...ticket.messages, newMessage],
        lastUpdate: 'Just now'
      });
      
      // Clear the input
      setReplyText('');
    }
  };

  const handleRatingSubmitted = (ratingData) => {
    console.log('Rating submitted:', ratingData);
    
    // Update the ticket with the rating info
    setTicket({
      ...ticket,
      isRated: true,
      rating: ratingData.rating,
      feedback: ratingData.feedback
    });
    
    // Hide the rating form after submission
    setTimeout(() => {
      setShowRatingForm(false);
    }, 3000);
  };

  const formatDate = (dateString) => {
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
      case 'Open':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Normal':
        return 'bg-blue-100 text-blue-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
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
          ← Back to tickets
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
          <div className="flex gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Ticket #{ticket.id} • Created on {formatDate(ticket.createdAt)} • Last updated {ticket.lastUpdate}
        </div>
      </div>

      {/* Rating Form - Show only for resolved/closed tickets that haven't been rated yet */}
      {showRatingForm && (
        <div className="mb-6">
          <TicketRatingForm 
            ticketId={ticket.id} 
            agentName={ticket.assignedAgent}
            onRatingSubmitted={handleRatingSubmitted}
            onCancel={() => setShowRatingForm(false)}
          />
        </div>
      )}
      
      {/* Display rating if the ticket has been rated */}
      {ticket.isRated && ticket.rating && (
        <div className="mb-6 bg-pink-50 p-4 rounded-xl border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Your rating: </span>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={i < ticket.rating ? 'currentColor' : 'none'}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" 
                      strokeWidth={1.5}
                      stroke="currentColor"
                    />
                  </svg>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Submitted feedback for {ticket.assignedAgent}
            </div>
          </div>
          {ticket.feedback && (
            <div className="mt-2 text-sm text-gray-600 border-t border-pink-100 pt-2">
              <span className="font-medium">Your feedback:</span> {ticket.feedback}
            </div>
          )}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {ticket.messages.map((message) => (
          <div 
            key={message.id} 
            className={`p-6 ${message.sender === 'agent' ? 'bg-gray-50' : 'bg-white'} ${message.id !== ticket.messages.length && 'border-b border-gray-200'}`}
          >
            <div className="flex items-start">
              <div className="mr-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {message.senderName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{message.senderName}</span>
                  <span className="text-sm text-gray-500">{formatDate(message.timestamp)}</span>
                </div>
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ))}

        {ticket.status !== 'Closed' && (
          <div className="p-6 border-t border-gray-200">
            <form onSubmit={handleReply}>
              <label htmlFor="reply" className="block text-sm font-medium text-gray-700">
                Reply to this ticket
              </label>
              <div className="mt-1">
                <textarea
                  id="reply"
                  name="reply"
                  rows={4}
                  className="shadow-sm block w-full focus:ring-pink-500 focus:border-pink-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  disabled={!replyText.trim()}
                >
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketDetails; 