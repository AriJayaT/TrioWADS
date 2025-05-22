import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FaBell, FaTachometerAlt, FaTicketAlt, FaRegClock, FaChartBar, FaSearch, FaFilter, FaEye, FaReply, FaSignOutAlt, FaUser, FaCog, FaEllipsisH, FaSpinner, FaExclamationTriangle, FaSync, FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/src/assets/logo.jpg';
import ticketService from '../../../services/api/ticketService';
import apiClient from '../../../services/api/apiClient';

const TicketList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  // We no longer need isRespondOpen since we've combined the functionality
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [profileMenu, setProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [assigningTicket, setAssigningTicket] = useState(null);
  const [customerTicketCounts, setCustomerTicketCounts] = useState({});
  const [assignedCount, setAssignedCount] = useState(0);
  const [removingTicket, setRemovingTicket] = useState(null);

  const { user, logout } = useAuth();
  
  // Initialize agentType from user object immediately
  const [agentType, setAgentType] = useState(() => {
    return user?.agentType || 'Junior';
  });

  // Function to filter unassigned tickets based on agent type
  const filterUnassignedTickets = (tickets, type) => {
    // First filter out any closed tickets
    const nonClosedTickets = tickets.filter(ticket => ticket.status !== 'closed');
    
    // Then apply agent type filtering
    return nonClosedTickets.filter(ticket => {
      if (type === 'Senior') {
        return ticket.priority === 'high'; // Senior agents only see high priority tickets
      } else {
        return ticket.priority === 'low' || ticket.priority === 'medium'; // Junior agents see low and medium
      }
    });
  };

  useEffect(() => {
    // Skip any API calls if user is not properly loaded with an ID
    if (!user || !user._id) {
      setLoading(false);
      setError('User not properly authenticated. Please log out and log in again.');
      return;
    }

    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Update agent type if it changes
        const newAgentType = user.agentType || 'Junior';
        setAgentType(newAgentType);
        
        // Fetch tickets and filter based on current agent type
        await fetchTickets(newAgentType);
        
        // Get assigned count after tickets
        await fetchAssignedCount();
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user]);

  // Functions to fetch data
  const fetchAssignedCount = async () => {
    if (!user || !user._id) return 0;
    
    try {
      const response = await apiClient.get(`/users/${user._id}/assigned-count`);
      if (response.data) {
        setAssignedCount(response.data.assignedCount || 0);
      }
    } catch (err) {
      // Continue execution even if this fails
    }
  };

  const fetchTickets = async (currentAgentType) => {
    if (!user || !user._id) return;
    
    try {
      console.log('Fetching tickets for agent:', user._id, 'type:', currentAgentType);
      
      // Fetch assigned tickets (tickets with this agent assigned)
      let assignedTickets = [];
      try {
        console.log('Fetching assigned tickets with query:', { assignedTo: user._id });
        const assignedResponse = await ticketService.getTickets({ 
          assignedTo: user._id 
        });
        
        if (assignedResponse?.tickets && Array.isArray(assignedResponse.tickets)) {
          assignedTickets = assignedResponse.tickets;
          console.log('Assigned tickets retrieved successfully:', assignedTickets.length);
        } else {
          console.warn('Unexpected response format for assigned tickets:', assignedResponse);
          assignedTickets = [];
        }
        
      } catch (err) {
        console.error('Error fetching assigned tickets:', err);
        alert('Failed to load your assigned tickets. Please refresh the page.');
      }
      
      // Fetch unassigned tickets (tickets not assigned to any agent)
      let allUnassignedTickets = [];
      try {
        console.log('Fetching unassigned tickets');
        const unassignedResponse = await ticketService.getTickets({ 
          unassigned: true 
        });
        
        if (unassignedResponse?.tickets && Array.isArray(unassignedResponse.tickets)) {
          allUnassignedTickets = unassignedResponse.tickets;
          console.log('Unassigned tickets retrieved successfully:', allUnassignedTickets.length);
        } else {
          console.warn('Unexpected response format for unassigned tickets:', unassignedResponse);
          allUnassignedTickets = [];
        }
        
      } catch (err) {
        console.error('Error fetching unassigned tickets:', err);
        alert('Failed to load unassigned tickets. Please refresh the page.');
      }
      
      // Set all assigned tickets
      setTickets(assignedTickets);
      
      // Filter unassigned tickets based on current agent type
      const filteredUnassigned = filterUnassignedTickets(allUnassignedTickets, currentAgentType);
      console.log('Filtered unassigned tickets for', currentAgentType, 'agent:', filteredUnassigned.length);
      
      setUnassignedTickets(filteredUnassigned);
      
      // Count tickets per customer for limiting assignment
      const counts = {};
      assignedTickets.forEach(ticket => {
        const userId = ticket.user?._id || ticket.user;
        if (userId) {
          counts[userId] = (counts[userId] || 0) + 1;
        }
      });
      setCustomerTicketCounts(counts);
      
    } catch (err) {
      console.error('Error in fetchTickets:', err);
      alert('Error loading tickets. Please refresh the page.');
    } finally {
      // Always ensure loading is set to false
      setLoading(false);
    }
  };

  const canAssignTicket = (ticket) => {
    // Check if this is the 6th ticket for this customer
    const userId = ticket.user?._id || ticket.user;
    const currentCount = customerTicketCounts[userId] || 0;
    
    if (currentCount >= 5) {
      return false; // Already have 5 tickets from this customer
    }
    
    // Check agent role against ticket priority
    if (agentType === 'Junior' && ticket.priority === 'high') {
      return false; // Junior agents can't take high priority tickets
    }
    
    if (agentType === 'Senior' && (ticket.priority === 'low' || ticket.priority === 'medium')) {
      return false; // Senior agents shouldn't take low/medium priority tickets
    }
    
    return true;
  };

  const handleAssignToMe = async (ticketId) => {
    try {
      setAssigningTicket(ticketId);
      
      // Get the ticket to check customer ID and priority
      const ticket = unassignedTickets.find(t => t._id === ticketId);
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      if (!canAssignTicket(ticket)) {
        alert('Cannot assign this ticket. You may have reached the limit of 5 tickets per customer or this ticket priority does not match your agent type.');
        setAssigningTicket(null);
        return;
      }
      
      console.log(`Attempting to assign ticket ${ticketId} to agent ${user._id} (${user.name})`);
      
      // Call API to assign ticket
      const response = await ticketService.updateTicket(ticketId, {
        assignedTo: user._id,
        status: 'in-progress'
      });
      
      console.log('Assignment response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to assign ticket');
      }
      
      // Update the customer ticket count
      const userId = ticket.user?._id || ticket.user;
      setCustomerTicketCounts(prev => ({
        ...prev,
        [userId]: (prev[userId] || 0) + 1
      }));
      
      // Refresh the ticket lists
      await fetchTickets(agentType);
      await fetchAssignedCount();
      
      // Show success message
      alert(`Ticket ${ticketId} has been assigned to you and marked as in-progress.`);
      
    } catch (err) {
      console.error('Error assigning ticket:', err);
      alert(`Failed to assign ticket: ${err.message || 'Please try again'}`);
    } finally {
      setAssigningTicket(null);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm || 
                         (ticket._id && ticket._id.toLowerCase().includes(searchTerm.toLowerCase())) || 
                         (ticket.subject && ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (ticket.user?.name && ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Map display status names to actual status values
    let statusValue = statusFilter;
    if (statusFilter === 'Reply to Customer') {
      statusValue = 'waiting-for-customer';
    } else if (statusFilter === 'Customer Replied') {
      statusValue = 'waiting-for-agent';
    }
    
    const matchesStatus = statusFilter === 'All Status' || ticket.status === statusValue;
    const matchesPriority = priorityFilter === 'All Priority' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All Categories' || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleViewDetails = async (ticket) => {
    try {
      // Verify that we can access this ticket and get its details including messages
      const ticketData = await ticketService.getTicket(ticket._id);
      
      // Set the selected ticket with messages from the response
      setSelectedTicket({
        ...ticket,
        messages: ticketData.replies || []
      });
      
      setIsViewDetailsOpen(true);
    } catch (err) {
      alert('You do not have permission to view this ticket. It might be assigned to another agent.');
    }
  };

  // Function to refresh the selected ticket data independently
  const refreshSelectedTicket = async () => {
    if (!selectedTicket || !selectedTicket._id) return;
    
    try {
      console.log(`Refreshing selected ticket: ${selectedTicket._id}`);
      const ticketData = await ticketService.getTicket(selectedTicket._id);
      
      if (ticketData && ticketData.ticket) {
        console.log('Refreshed ticket data:', ticketData);
        
        // Update the selected ticket with fresh data
        setSelectedTicket({
          ...ticketData.ticket,
          messages: ticketData.replies || []
        });
        
        return true; // Successful refresh
      } else {
        console.error('Failed to refresh ticket: No ticket data returned');
        return false;
      }
    } catch (err) {
      console.error('Error refreshing selected ticket:', err);
      return false;
    }
  };

  // We no longer need handleRespond since we've combined the functionality with handleViewDetails

  const closeModal = () => {
    setIsViewDetailsOpen(false);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !e.target.response.value.trim()) return;
    
    try {
      const newStatus = e.target.status.value;
      const message = e.target.response.value.trim();
      let isStatusChanged = false;
      
      console.log('Preparing to submit response:', {
        ticketId: selectedTicket._id,
        currentStatus: selectedTicket.status,
        newStatus,
        message
      });
      
      // Step 1: Update ticket status first (if changed)
      if (newStatus !== selectedTicket.status) {
        console.log(`Status change detected. Updating from "${selectedTicket.status}" to "${newStatus}"`);
        isStatusChanged = true;
        
        try {
          // Update status first and wait for completion
          const updateResult = await ticketService.updateTicket(selectedTicket._id, {
            status: newStatus
          });
          console.log('Status update successful:', updateResult);
          
          // Small delay to ensure status update is processed first
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (updateError) {
          console.error('Error updating ticket status:', updateError);
          alert(`Failed to update ticket status: ${updateError.message || 'Unknown error'}`);
          return; // Exit early on status update failure
        }
      }
      
      // Step 2: Add the reply (only if there's a message)
      if (message.trim()) {
        const replyData = {
          message,
          isInternal: false,  // This is a customer-visible reply
          senderName: user?.name // Include agent's name for consistent display
        };
        
        console.log('Adding reply:', replyData);
        try {
          const replyResult = await ticketService.addReply(selectedTicket._id, replyData);
          console.log('Reply added successfully:', replyResult);
        } catch (replyError) {
          console.error('Error adding reply:', replyError);
          
          // If status was changed but reply failed, we need to inform the user
          if (isStatusChanged) {
            alert(`Status was updated to "${newStatus}" but failed to add your reply: ${replyError.message || 'Unknown error'}`);
            // Continue with modal closing and refresh since the status was updated
          } else {
            alert(`Failed to add reply: ${replyError.message || 'Unknown error'}`);
            return; // Exit early if nothing was updated
          }
        }
      } else if (!isStatusChanged) {
        // If no message and no status change, alert the user
        alert('Please provide a message or change the status to update the ticket.');
        return;
      }
      
      try {
        // Refresh just the selected ticket first to verify our changes
        const refreshSuccess = await refreshSelectedTicket();
        
        if (refreshSuccess) {
          console.log('Ticket refresh successful, verified changes are applied');
        } else {
          console.warn('Could not verify ticket changes, proceeding with global refresh');
        }
        
        // Also refresh all tickets for the list view
        await fetchTickets(agentType);
      } catch (refreshError) {
        console.error('Error during refresh:', refreshError);
        // Continue with modal closing since the main operations succeeded
      }
      
      // Close the modal
      closeModal();
      
      // Show success alert based on what was updated
      if (isStatusChanged && message.trim()) {
        alert(`Ticket ${selectedTicket._id} was updated successfully with status: ${newStatus} and your reply was added.`);
      } else if (isStatusChanged) {
        alert(`Ticket status was updated to: ${newStatus}`);
      } else {
        alert('Your reply was added successfully.');
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmitResponse:', err);
      alert(`Failed to process your request: ${err.message || 'Unknown error'}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open':
      case 'Open':
        return 'bg-pink-100 text-pink-600';
      case 'in-progress':
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-600';
      case 'waiting-for-customer':
      case 'Waiting for Customer':
      case 'Reply to Customer':
        return 'bg-blue-100 text-blue-600';
      case 'waiting-for-agent':
      case 'Waiting for Agent':
        return 'bg-purple-100 text-purple-600';
      case 'resolved':
        return 'bg-orange-100 text-orange-600';
      case 'closed':
      case 'Closed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
      case 'High':
        return 'bg-pink-100 text-pink-700';
      case 'medium':
      case 'Normal':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Orders & Shipping':
      case 'shipping':
        return 'text-pink-400';
      case 'Billing':
      case 'billing':
        return 'text-purple-400';
      case 'Product Issues':
      case 'product':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatWaitTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
    } else {
      return `${Math.floor(diffMins / 1440)}d`;
    }
  };

  // Function to format or hide undefined values
  const formatMetric = (value, suffix = '') => {
    if (value === undefined || value === null || value === 'undefined' || value === 'undefined%') {
      return '-';
    }
    return `${value}${suffix}`;
  };

  // Function to handle removing a ticket
  const handleRemoveTicket = async (ticketId) => {
    if (!ticketId || !confirm('Are you sure you want to remove this ticket from your view?')) {
      return;
    }
    
    try {
      setRemovingTicket(ticketId);
      
      // Call API to mark ticket as removed
      await ticketService.removeTicketFromView(ticketId);
      
      // Update local state to remove the ticket from view
      setTickets(prevTickets => prevTickets.filter(ticket => ticket._id !== ticketId));
      
      // Immediately decrement the assigned count
      setAssignedCount(prev => Math.max(0, prev - 1));
      
      // Also update assigned count from server to ensure consistency
      await fetchAssignedCount();
      
      // Show success message
      console.log(`Ticket ${ticketId} removed from view. Assigned count decremented.`);
    } catch (err) {
      console.error('Error removing ticket:', err);
      alert(`Failed to remove ticket: ${err.message || 'Unknown error'}`);
    } finally {
      setRemovingTicket(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-600">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-50 p-6 rounded-lg max-w-lg text-center">
          <FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchTickets(agentType);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center mx-auto"
          >
            <FaSync className="mr-2" /> Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex h-14 items-center px-4 justify-between">
          {/* Logo & Title */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-xl overflow-hidden">
              <img src={logo} alt="YipHelp" className="object-cover w-full h-full" />
            </div>
            <span className="ml-3 text-base font-bold">YipHelp</span>
            
            {/* Navigation */}
            <nav className="hidden md:flex ml-8">
              <Link to="/agent" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaTachometerAlt className="mr-2" /> Dashboard
              </Link>
              <Link to="/agent/tickets" className="flex items-center px-4 h-full border-b-2 border-pink-500 text-pink-500">
                <FaTicketAlt className="mr-2" /> Tickets
              </Link>
            </nav>
          </div>

          {/* Profile & Notifications */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <FaBell className="text-gray-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {unassignedTickets.length}
              </span>
            </div>
            <div className="relative">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setProfileMenu(!profileMenu)}
              >
                <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm font-medium">
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
                    <span>{getUserInitials()}</span>
                  )}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="text-sm font-medium">{user?.name || 'Agent'}</p>
                  <p className="text-xs text-gray-500">{user?.agentType || 'Junior'} Agent</p>
                </div>
              </div>
              
              {/* Profile Dropdown */}
              {profileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/agent/profile" className="flex items-center px-4 py-2 text-sm text-pink-500 hover:bg-gray-100">
                    <FaUser className="mr-2 text-pink-500" /> Profile
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <div className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md">
            Assigned: {assignedCount} tickets
          </div>
        </div>

        {/* Ticket Self-Assignment Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Available Tickets for Assignment 
          </h2>
          {unassignedTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waiting Time</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unassignedTickets.map((ticket) => {
                    const canAssign = canAssignTicket(ticket);
                    const userId = ticket.user?._id || ticket.user;
                    const customerCount = customerTicketCounts[userId] || 0;
                    
                    return (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{ticket._id}</td>
                        <td className="px-4 py-3 text-sm">{ticket.subject}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={getCategoryColor(ticket.category)}>
                            {ticket.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority === 'high' ? 'High' :
                             ticket.priority === 'medium' ? 'Medium' :
                             ticket.priority === 'low' ? 'Low' : ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>{ticket.user?.name || 'Unknown'}</div>
                          {customerCount > 0 && (
                            <div className="text-xs text-gray-500">
                              {customerCount} ticket(s) assigned
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{formatWaitTime(ticket.createdAt)}</td>
                        <td className="px-4 py-3 text-sm">
                          <button 
                            className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 text-xs flex items-center justify-center mx-auto disabled:opacity-50"
                            onClick={() => handleAssignToMe(ticket._id)}
                            disabled={assigningTicket === ticket._id || !canAssign}
                            title={!canAssign ? 
                              customerCount >= 5 
                                ? "You've reached the limit of 5 tickets for this customer"
                                : "This priority doesn't match your agent type"
                              : ""}
                          >
                            {assigningTicket === ticket._id ? (
                              <><FaSpinner className="animate-spin mr-1" /> Assigning...</>
                            ) : !canAssign ? (
                              <><FaExclamationTriangle className="mr-1" /> Cannot Assign</>
                            ) : (
                              'Assign to Me'
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaTicketAlt className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No tickets available for assignment</h3>
              <p className="mt-1 text-sm text-gray-500">
                {agentType === 'Senior' 
                  ? "There are currently no High priority tickets available."
                  : "There are currently no Low or Medium priority tickets available."}
              </p>
            </div>
          )}
        </div>

        {/* Ticket Filters & Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className="p-2 border border-gray-300 rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Reply to Customer</option>
              <option>Customer Replied</option>
              <option>Closed</option>
            </select>

            <select
              className="p-2 border border-gray-300 rounded-lg"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option>All Priority</option>
              <option>High</option>
              <option>Normal</option>
              <option>Low</option>
            </select>

            <select
              className="p-2 border border-gray-300 rounded-lg"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All Categories</option>
              <option>Orders & Shipping</option>
              <option>Billing</option>
              <option>Product Issues</option>
              <option>General Inquiry</option>
            </select>
          </div>
        </div>

        {/* Ticket Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <FaTicketAlt className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {tickets.length === 0 
                  ? "You don't have any assigned tickets yet. Try assigning tickets from the list above."
                  : "No tickets match your current filters. Try adjusting your search criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wait Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ticket.user?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{ticket.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block ${getCategoryColor(ticket.category)}`}>
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'waiting-for-agent' ? 'Customer Replied' : 
                         ticket.status === 'waiting-for-customer' ? 'Reply to Customer' : 
                         ticket.status === 'resolved' ? 'Awaiting Customer Response' :
                         ticket.status === 'closed' ? (ticket.hasRating ? 'Closed & Rated' : 'Closed') :
                         ticket.status}
                      </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority === 'high' ? 'High' :
                           ticket.priority === 'medium' ? 'Medium' :
                           ticket.priority === 'low' ? 'Low' : ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatWaitTime(ticket.updatedAt || ticket.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleViewDetails(ticket)}
                            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                          >
                            View Details
                          </button>
                          
                          {ticket.status === 'closed' && (
                            <button
                              onClick={() => handleRemoveTicket(ticket._id)}
                              disabled={removingTicket === ticket._id}
                              className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 focus:outline-none disabled:opacity-50 flex items-center"
                              title="Remove from your view"
                            >
                              {removingTicket === ticket._id ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaTimes />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* View Details Modal */}
      {isViewDetailsOpen && selectedTicket && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                Ticket: {selectedTicket._id}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Customer</h3>
                  <div className="text-gray-600">{selectedTicket.user?.name || 'Unknown Customer'}</div>
                  <div className="text-gray-500 text-sm">{selectedTicket.user?.email || ''}</div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Category</h3>
                  <div className="text-gray-600">{selectedTicket.category}</div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status === 'waiting-for-agent' ? 'Customer Replied' : 
                     selectedTicket.status === 'waiting-for-customer' ? 'Reply to Customer' : 
                     selectedTicket.status === 'resolved' ? 'Awaiting Customer Response' :
                     selectedTicket.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Priority</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority === 'high' ? 'High' :
                     selectedTicket.priority === 'medium' ? 'Medium' :
                     selectedTicket.priority === 'low' ? 'Low' : selectedTicket.priority}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Description</h3>
                <div className="text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedTicket.description}
                </div>
              </div>
              
              {/* Resolution Notice */}
              {selectedTicket.status === 'resolved' && (
                <div className="mb-6 bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <h3 className="font-medium text-orange-800 mb-2">Waiting for Customer Confirmation</h3>
                  <p className="text-orange-700">
                    This ticket has been marked as resolved and is waiting for the customer to confirm 
                    that their issue has been resolved or to continue the conversation.
                  </p>
                </div>
              )}
              
              {/* Closed Ticket Notice */}
              {selectedTicket.status === 'closed' && (
                <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Ticket Closed</h3>
                  <p className="text-gray-700">
                    This ticket has been closed. You can view the conversation history, but no further responses can be added.
                    {selectedTicket.hasRating && 
                      " The customer has provided feedback on this ticket."}
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={async () => {
                        // Store ticket ID before removal
                        const ticketToRemove = selectedTicket._id;
                        
                        // Close modal first for better UX
                        closeModal();
                        
                        // Then remove the ticket
                        await handleRemoveTicket(ticketToRemove);
                      }}
                      disabled={removingTicket === selectedTicket._id}
                      className="inline-flex items-center px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                    >
                      {removingTicket === selectedTicket._id ? (
                        <><FaSpinner className="animate-spin mr-1" /> Removing...</>
                      ) : (
                        <><FaTimes className="mr-1" /> Remove from your view</>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {selectedTicket.agentNotes && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Agent Notes</h3>
                  <div className="text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedTicket.agentNotes}
                  </div>
                </div>
              )}
              
              {/* Conversation History */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Conversation History</h3>
                <div className="bg-gray-50 p-3 rounded space-y-3 max-h-96 overflow-y-auto">
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((message, index) => (
                      <div 
                        key={message._id || index}
                        className={`p-3 rounded-lg ${
                          message.sender === 'customer' 
                            ? 'bg-gray-100 mr-12' 
                            : 'bg-pink-50 ml-12'
                        }`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-900">
                            {message.sender === 'customer' ? selectedTicket.user?.name || 'Customer' : 'Me'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatWaitTime(message.timestamp || message.createdAt)}
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
              
              {/* Response Form - only show for tickets that aren't closed */}
              {selectedTicket.status !== 'closed' && (
                <form onSubmit={handleSubmitResponse}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Status
                    </label>
                    <select 
                      name="status" 
                      defaultValue={selectedTicket.status}
                      className={`block w-full p-2 border rounded-md ${
                        selectedTicket.status === 'resolved' ? 'border-orange-300 bg-orange-50' : 'border-gray-300'
                      }`}
                      onChange={(e) => {
                        // Add visual cue when selecting "resolved" status
                        if (e.target.value === 'resolved') {
                          e.target.classList.add('bg-orange-50', 'border-orange-300');
                        } else {
                          e.target.classList.remove('bg-orange-50', 'border-orange-300');
                        }
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="waiting-for-customer">Reply to Customer</option>
                      <option value="resolved" className="bg-orange-50 text-orange-800">
                        ⭐ Mark as Resolved (Requires Customer Confirmation)
                      </option>
                      <option value="closed">Close Ticket (Final)</option>
                    </select>
                    {selectedTicket.status === 'resolved' ? (
                      <p className="mt-1 text-sm text-orange-600">
                        This ticket is awaiting customer confirmation. The customer must confirm the resolution or continue the conversation.
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">
                        When marking as resolved, the customer will be asked to confirm resolution or continue the chat.
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Response
                    </label>
                    <textarea
                      name="response"
                      rows={6}
                      className="block w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Type your response here..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mr-4 px-4 py-2 text-gray-700 border border-gray-300 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                    >
                      Send Response
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default TicketList;