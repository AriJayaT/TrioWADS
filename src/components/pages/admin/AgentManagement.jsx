// src/pages/admin/AgentManagement.jsx (Galih Added This)
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '/src/components/layout/DashboardLayout'; // Use the shared dashboard layout
import { FaUserTag, FaCheck, FaTimes, FaSpinner, FaPencilAlt, FaAngleDown } from 'react-icons/fa';
import apiClient from '../../../services/api/apiClient';

// Add global click handler component 
const PreventDefaultClick = ({ children }) => {
  const handleClick = (e) => {
    // Check if the event was triggered by a native button with type="button" 
    const target = e.target;
    const isButton = target.tagName === 'BUTTON';
    const isButtonWithType = isButton && target.getAttribute('type') === 'button';
    
    // If it's not a button with type="button", prevent default
    if (!isButtonWithType) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  
  return (
    <div onClick={handleClick} className="w-full h-full">
      {children}
    </div>
  );
};

const AgentManagement = () => {
  const [editingAgent, setEditingAgent] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Junior');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Use useCallback to ensure function stability
  const toggleDropdown = useCallback((event, ticketId) => {
    // Prevent default action to avoid page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (openDropdownId === ticketId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(ticketId);
    }
  }, [openDropdownId]);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await apiClient.get('/users/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      alert('Error fetching agents. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnassignedTickets = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setTicketsLoading(true);
      }
      
      const response = await apiClient.get('/tickets?unassigned=true');
      setUnassignedTickets(response.data.tickets || []);
    } catch (error) {
      alert('Error fetching unassigned tickets. Please try refreshing the page.');
    } finally {
      if (showLoading) {
        setTicketsLoading(false);
      }
    }
  }, []);

  // Update handleAssignTicket with useCallback
  const handleAssignTicket = useCallback(async (event, ticket, agentId) => {
    // Prevent any default actions
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      
      // Extra measure to stop propagation
      if (event.nativeEvent) {
        event.nativeEvent.stopImmediatePropagation();
      }
    }
    
    try {
      const ticketId = ticket._id || ticket.id;
      setAssigning(ticketId);
      
      // Check if this agent already has 5 tickets from this customer
      const agentTickets = await apiClient.get(`/tickets?assignedTo=${agentId}`);
      const ticketsFromCustomer = agentTickets.data.tickets.filter(t => 
        (t.user?._id || t.user) === (ticket.user?._id || ticket.user)
      );
      
      if (ticketsFromCustomer.length >= 5) {
        alert(`This agent already has 5 tickets from the same customer. Please assign to another agent.`);
        setAssigning(null);
        return;
      }
      
      // Check if the ticket priority matches the agent type
      const agent = agents.find(a => a.id === agentId);
      if (agent.agentType === 'Junior' && ticket.priority === 'high') {
        alert('Junior agents cannot be assigned high priority tickets.');
        setAssigning(null);
        return;
      }
      
      if (agent.agentType === 'Senior' && (ticket.priority === 'low' || ticket.priority === 'medium')) {
        alert('Senior agents cannot be assigned low or medium priority tickets.');
        setAssigning(null);
        return;
      }
      
      await apiClient.put(`/tickets/${ticketId}`, {
        assignedTo: agentId,
        status: 'in-progress'
      });
      
      // Remove the assigned ticket from the local state to give immediate feedback
      setUnassignedTickets(prev => prev.filter(t => (t._id || t.id) !== ticketId));
      
      // Then refresh the list silently in the background
      fetchUnassignedTickets(false);
    } catch (error) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to assign ticket');
      }
    } finally {
      setAssigning(null);
    }
  }, [agents, fetchUnassignedTickets]);

  const handleEditCategory = useCallback((agent) => {
    setEditingAgent(agent);
    setSelectedCategory(agent.agentType || 'Junior');
    setShowCategoryModal(true);
  }, []);
  
  const handleSaveCategory = useCallback(async () => {
    if (!editingAgent || !editingAgent.id) return;
    
    try {
      setUpdating(true);
      await apiClient.put(`/users/${editingAgent.id}`, {
        agentType: selectedCategory
      });
      
      // Update the local state
      setAgents(agents.map(agent => 
        agent.id === editingAgent.id 
          ? {...agent, agentType: selectedCategory} 
          : agent
      ));
      
      // Close the modal
      setShowCategoryModal(false);
      setEditingAgent(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update agent category';
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, [editingAgent, selectedCategory, agents]);

  useEffect(() => {
    // Initial data loading
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setTicketsLoading(true);
        
        // Load data in parallel
        await Promise.all([
          fetchAgents(),
          fetchUnassignedTickets(true)
        ]);
      } catch (error) {
        // Error handling is done in the individual fetch functions
      }
    };
    
    loadInitialData();
    
    // Add event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.agent-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchAgents, fetchUnassignedTickets]);

  // Dropdown component
  const renderAgentDropdown = useCallback((ticket) => {
    const ticketId = ticket._id || ticket.id;
    const isOpen = openDropdownId === ticketId;
    const isAssigning = assigning === ticketId;
    
    const handleAssignButtonClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(e, ticketId);
      return false;
    };
    
    const handleAgentSelect = (e, agentId) => {
      e.preventDefault();
      e.stopPropagation();
      handleAssignTicket(e, ticket, agentId);
      setOpenDropdownId(null);
      return false;
    };
    
    return (
      <div className="relative agent-dropdown-container">
        <button 
          className="text-pink-500 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-pink-200 hover:bg-pink-50 flex items-center"
          onClick={handleAssignButtonClick}
          disabled={isAssigning}
          type="button"
        >
          {isAssigning ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> 
              Assigning...
            </>
          ) : (
            <>
              Assign Agent
              <FaAngleDown className={`ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
        
        {isOpen && !isAssigning && (
          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg z-10 p-2 w-64 agent-dropdown-menu">
            <div className="text-xs text-gray-500 mb-2 px-2">Select an agent:</div>
            <div className="max-h-48 overflow-y-auto">
              {agents.length === 0 ? (
                <div className="text-xs text-gray-500 px-2 py-1">
                  No agents available
                </div>
              ) : (
                <>
                  {/* Recommended (matching) agents */}
                  <div className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50">
                    Recommended agents:
                  </div>
                  {(() => {
                    const recommendedAgents = agents.filter(agent => 
                      (ticket.priority === 'high' && agent.agentType === 'Senior') || 
                      ((ticket.priority === 'low' || ticket.priority === 'medium') && agent.agentType === 'Junior')
                    );
                    
                    if (recommendedAgents.length === 0) {
                      return (
                        <div className="text-xs text-gray-500 px-2 py-1">
                          No matching agents found
                        </div>
                      );
                    }
                    
                    return recommendedAgents.map(agent => (
                      <button
                        key={agent.id}
                        className="block w-full text-left px-2 py-1 text-sm hover:bg-pink-50 rounded flex items-center justify-between"
                        onClick={(e) => handleAgentSelect(e, agent.id)}
                        type="button"
                      >
                        <span>{agent.name} ({agent.agentType})</span>
                        <span className="text-xs text-green-600 ml-2">★</span>
                      </button>
                    ));
                  })()}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [toggleDropdown, handleAssignTicket, agents, openDropdownId, assigning]);

  const formatWaitTime = useCallback((dateString) => {
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
  }, []);

  // Update the ticket priority styling
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return 'bg-pink-200 text-pink-700';
      case 'medium':
        return 'bg-yellow-200 text-yellow-700';
      case 'low':
        return 'bg-green-200 text-green-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <PreventDefaultClick>
      <DashboardLayout title="Agents">
        {/* Add an onSubmit handler to prevent form submission */}
        <form onSubmit={(e) => e.preventDefault()} style={{ width: '100%' }}>
          {/* Page Title */}
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Agent Management</h1>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Unassigned Tickets */}
            <div className="col-span-2 bg-white p-6 rounded-2xl shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Unassigned Tickets</h2>
                <span className="text-sm text-pink-500 font-medium">
                  {ticketsLoading ? 'Loading...' : `${unassignedTickets.length} pending assignment`}
                </span>
              </div>

              {ticketsLoading ? (
                <div className="flex justify-center p-8">
                  <FaSpinner className="animate-spin text-pink-500 text-xl" />
                </div>
              ) : unassignedTickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tickets waiting for assignment
                </div>
              ) : (
                <div className="space-y-4" onClick={(e) => e.preventDefault()}>
                  {unassignedTickets.map((ticket) => (
                    <div key={ticket._id || ticket.id} className="flex justify-between items-center bg-pink-50 rounded-xl p-4">
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-semibold text-gray-700">{ticket.ticketNumber || ticket._id || ticket.id}</span>
                          <span className={`ml-3 text-xs rounded-full px-2 py-1 ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <div className="text-gray-800">{ticket.subject}</div>
                        <div className="text-gray-500 text-sm">
                          {ticket.user?.name || 'Unknown Customer'}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-gray-400 text-sm mb-2">
                          Waiting: {formatWaitTime(ticket.createdAt)}
                        </div>
                        {renderAgentDropdown(ticket)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agents List */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Support Agents</h2>
                <span className="text-sm text-pink-500 font-medium">
                  {loading ? 'Loading...' : `${agents.length} agents`}
                </span>
              </div>
              
              {loading ? (
                <div className="flex justify-center p-8">
                  <FaSpinner className="animate-spin text-pink-500 text-xl" />
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No agents found
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div 
                      key={agent.id} 
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-lg font-medium text-pink-500 mr-3">
                          {agent.profileImage ? (
                            <img 
                              src={agent.profileImage} 
                              alt={agent.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            agent.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          agent.agentType === 'Senior' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {agent.agentType || 'Junior'}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleEditCategory(agent);
                          }}
                          className="ml-3 text-gray-400 hover:text-pink-500"
                          type="button"
                        >
                          <FaPencilAlt />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Edit Agent Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => e.preventDefault()}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-medium mb-4">Update Agent Type</h3>
              <p className="text-gray-600 mb-4">
                Select the agent type for <span className="font-medium">{editingAgent?.name}</span>
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="junior" 
                    name="agentType" 
                    value="Junior" 
                    checked={selectedCategory === 'Junior'} 
                    onChange={() => setSelectedCategory('Junior')}
                    className="mr-2"
                  />
                  <label htmlFor="junior" className="flex-1">
                    <span className="font-medium">Junior Agent</span>
                    <span className="text-sm text-gray-500 block">Can handle low and medium priority tickets</span>
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="senior" 
                    name="agentType" 
                    value="Senior" 
                    checked={selectedCategory === 'Senior'} 
                    onChange={() => setSelectedCategory('Senior')}
                    className="mr-2"
                  />
                  <label htmlFor="senior" className="flex-1">
                    <span className="font-medium">Senior Agent</span>
                    <span className="text-sm text-gray-500 block">Can handle high priority tickets only</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowCategoryModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  type="button"
                >
                  Cancel
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleSaveCategory();
                  }}
                  disabled={updating}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 flex items-center"
                  type="button"
                >
                  {updating ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PreventDefaultClick>
  );
};

export default AgentManagement;
