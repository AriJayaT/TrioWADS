import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaBell, FaTachometerAlt, FaUsers, FaChartBar, FaSignOutAlt, FaUser, FaClock, FaBook } from 'react-icons/fa';
import { FaCheckCircle, FaRegClock, FaStar, FaTicketAlt, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.jpg';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import ticketService from '../../../services/api/ticketService';
import { getNotifications, markNotificationAsRead } from '../../../services/api/notificationService';
import NotificationBell from '../../common/NotificationBell';

const COMPONENT_NAME = 'AgentDashboard';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  // State for adding a new task
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'Normal', dueDate: '' });
  const [profileMenu, setProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    responseTime: { value: '0m', change: '0m', direction: 'neutral' },
    resolutionRate: { value: '0%', change: '0%', direction: 'neutral' },
    csatScore: { value: '0', change: '0', direction: 'neutral' },
    ticketsResolved: { value: '0', change: '0', direction: 'neutral' }
  });
  const [activeTickets, setActiveTickets] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  // Notifications state (to be filled by API)
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Add debouncing for fetchDashboardData to prevent race conditions
  const debounceTimeoutRef = useRef(null);

  // Define fetchDashboardData before any useEffect hooks
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AgentDashboard] Starting fetchDashboardData, current user:', {
        userId: user?._id,
        userRole: user?.role,
        userType: user?.agentType
      });
      
      let currentMetrics = {
        responseTime: { value: '0m', change: '0m', direction: 'neutral' },
        resolutionRate: { value: '0%', change: '0%', direction: 'neutral' },
        csatScore: { value: '0.0', change: '0', direction: 'neutral' },
        ticketsResolved: { value: '0', change: '0', direction: 'neutral' }
      };
      
      try {
        const statsResponse = await ticketService.getAgentStats();
        console.log('[AgentDashboard] Stats response:', statsResponse);
        
        if (statsResponse && statsResponse.success && statsResponse.stats) {
          const stats = statsResponse.stats;
          
          currentMetrics = {
            responseTime: {
              value: stats.avgResponseTime !== undefined ? `${stats.avgResponseTime}m` : '0m',
              change: stats.responseTimeChange > 0 ? `+${stats.responseTimeChange}m` : `${stats.responseTimeChange}m`,
              direction: stats.responseTimeChange > 0 ? 'up' : stats.responseTimeChange < 0 ? 'down' : 'neutral'
            },
            resolutionRate: {
              value: stats.resolutionRate !== undefined ? `${stats.resolutionRate}%` : '0%',
              change: stats.resolutionRateChange > 0 ? `+${stats.resolutionRateChange}%` : `${stats.resolutionRateChange}%`,
              direction: stats.resolutionRateChange > 0 ? 'up' : stats.resolutionRateChange < 0 ? 'down' : 'neutral'
            },
            csatScore: {
              value: stats.csatScore !== undefined ? stats.csatScore?.toFixed(1) : '0.0',
              change: stats.csatScoreChange > 0 ? `+${stats.csatScoreChange}` : `${stats.csatScoreChange}`,
              direction: stats.csatScoreChange > 0 ? 'up' : stats.csatScoreChange < 0 ? 'down' : 'neutral'
            },
            ticketsResolved: {
              value: stats.ticketsResolved !== undefined ? `${stats.ticketsResolved}` : '0',
              change: stats.ticketsResolvedChange > 0 ? `+${stats.ticketsResolvedChange}` : `${stats.ticketsResolvedChange}`,
              direction: stats.ticketsResolvedChange > 0 ? 'up' : stats.ticketsResolvedChange < 0 ? 'down' : 'neutral'
            }
          };

          if (stats.recentActivity && Array.isArray(stats.recentActivity)) {
            setRecentActivities(stats.recentActivity);
          }
        }
      } catch (statsError) {
        console.error('[AgentDashboard] Error fetching agent stats:', statsError);
      }
      
      setMetrics(currentMetrics);
      
      try {
        // Log the request parameters
        const requestParams = {
          assignedTo: user?._id,
          status: ['open', 'in-progress', 'waiting-for-customer', 'waiting-for-agent'].join(','),
          sort: '-createdAt'
        };
        
        console.log('[AgentDashboard] Fetching active tickets with params:', requestParams);
        
        const activeTicketsResponse = await ticketService.getTickets(requestParams);
        
        console.log('[AgentDashboard] Raw active tickets response:', activeTicketsResponse);
        
        if (activeTicketsResponse && activeTicketsResponse.tickets) {
          // Log the raw tickets before filtering
          console.log('[AgentDashboard] Tickets before filtering:', 
            activeTicketsResponse.tickets.map(t => ({
              id: t._id,
              assignedTo: t.assignedTo,
              status: t.status,
              subject: t.subject
            }))
          );
          
          const formattedActiveTickets = activeTicketsResponse.tickets
            .filter(ticket => {
              const isAssigned = ticket.assignedTo && 
                (ticket.assignedTo._id === user?._id || ticket.assignedTo === user?._id);
              
              // Log each ticket's assignment check
              console.log('[AgentDashboard] Ticket assignment check:', {
                ticketId: ticket._id,
                ticketAssignedTo: ticket.assignedTo,
                userId: user?._id,
                isAssigned
              });
              
              return isAssigned;
            })
            .map(ticket => {
              const formatted = {
                id: ticket._id,
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                customer: ticket.user?.name || 'Customer',
                status: ticket.status === 'open' ? 'Awaiting your response' : 
                       ticket.status === 'in-progress' ? 'In progress' : 
                       ticket.status === 'waiting-for-customer' ? 'Waiting for customer' :
                       ticket.status === 'waiting-for-agent' ? 'Pending' : ticket.status,
                priority: ticket.priority,
                createdAt: ticket.createdAt,
                assignedTo: ticket.assignedTo
              };
              
              // Log each formatted ticket
              console.log('[AgentDashboard] Formatted ticket:', formatted);
              
              return formatted;
            });
          
          console.log('[AgentDashboard] Final formatted tickets:', formattedActiveTickets);
          
          // Sort tickets by priority and status
          const sortedTickets = formattedActiveTickets.sort((a, b) => {
            // First sort by priority
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then by status
            const statusPriority = {
              'Awaiting your response': 0,
              'In progress': 1,
              'Waiting for customer': 2,
              'Pending': 3
            };
            return statusPriority[a.status] - statusPriority[b.status];
          });
          
          console.log('[AgentDashboard] Final sorted tickets:', sortedTickets);
          
          setActiveTickets(sortedTickets);
        } else {
          console.warn('[AgentDashboard] No tickets found in response:', activeTicketsResponse);
        }
      } catch (ticketsError) {
        console.error('[AgentDashboard] Error fetching active tickets:', ticketsError);
        setActiveTickets([]);
      }
      
      try {
        const unassignedResponse = await ticketService.getTickets({ 
          unassigned: true 
        });
        console.log('[AgentDashboard] Unassigned tickets response:', unassignedResponse);
        setUnassignedCount(unassignedResponse.tickets?.length || 0);
      } catch (unassignedError) {
        console.error('[AgentDashboard] Error fetching unassigned tickets:', unassignedError);
        setUnassignedCount(0);
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log out and log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You may not have permission to view this data.');
      } else {
        setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Now all the useEffect hooks can use fetchDashboardData
  // Combined socket event setup
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log(`[${COMPONENT_NAME}] Socket not connected, skipping event handlers`);
      return;
    }

    console.log(`[${COMPONENT_NAME}] Setting up socket event handlers`);

    // Handler for new notifications
    const handleNewNotification = (notification) => {
      console.log(`[${COMPONENT_NAME}] New notification received:`, notification);
      setNotifications(prev => [notification, ...prev]);
    };

    // Handler for ticket assignment
    const handleTicketAssigned = async (data) => {
      console.log(`[${COMPONENT_NAME}] Handling ticket assigned event:`, {
        ticketData: data,
        currentUserId: user?._id,
        assignedToId: data?.assignedTo?._id || data?.assignedTo,
        ticketStatus: data?.status,
        ticketId: data?._id
      });
      
      const currentUserId = user?._id;
      const assignedToId = data?.assignedTo?._id || data?.assignedTo;
      const isAssignedToMe = assignedToId && currentUserId && 
        (assignedToId === currentUserId || assignedToId.toString() === currentUserId.toString());
      
      if (isAssignedToMe) {
        console.log(`[${COMPONENT_NAME}] Ticket assigned to current agent, updating active tickets`);
        
        try {
          // Fetch the complete ticket details
          const ticketResponse = await ticketService.getTicket(data._id);
          console.log(`[${COMPONENT_NAME}] Fetched ticket details:`, ticketResponse);
          
          if (ticketResponse && ticketResponse.ticket) {
            const ticket = ticketResponse.ticket;
            
            // Format the ticket for display
            const formattedTicket = {
              id: ticket._id,
              ticketNumber: ticket.ticketNumber,
              subject: ticket.subject,
              customer: ticket.user?.name || 'Customer',
              status: ticket.status === 'open' ? 'Awaiting your response' : 
                     ticket.status === 'in-progress' ? 'In progress' : 
                     ticket.status === 'waiting-for-customer' ? 'Waiting for customer' :
                     ticket.status === 'waiting-for-agent' ? 'Pending' : ticket.status,
              priority: ticket.priority,
              createdAt: ticket.createdAt,
              assignedTo: ticket.assignedTo
            };
            
            // Update active tickets state
            setActiveTickets(prev => {
              // Check if ticket already exists
              const exists = prev.some(t => t.id === ticket._id);
              console.log(`[${COMPONENT_NAME}] Updating active tickets:`, {
                existingCount: prev.length,
                ticketExists: exists,
                newTicket: formattedTicket
              });
              
              if (!exists) {
                // Add new ticket and sort by priority and status
                const newTickets = [...prev, formattedTicket].sort((a, b) => {
                  // First sort by priority
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                  if (priorityDiff !== 0) return priorityDiff;
                  
                  // Then by status
                  const statusPriority = {
                    'Awaiting your response': 0,
                    'In progress': 1,
                    'Waiting for customer': 2,
                    'Pending': 3
                  };
                  return statusPriority[a.status] - statusPriority[b.status];
                });
                return newTickets;
              }
              return prev;
            });
            
            // Refresh dashboard data to update metrics
            fetchDashboardData();
          }
        } catch (error) {
          console.error(`[${COMPONENT_NAME}] Error fetching assigned ticket details:`, error);
        }
      } else {
        console.log(`[${COMPONENT_NAME}] Ticket not assigned to current agent, skipping update`);
      }
    };

    // Handler for ticket updates
    const handleTicketUpdate = async (data) => {
      console.log(`[${COMPONENT_NAME}] Handling ticket update event:`, data);
      
      setActiveTickets(prev => {
        const updatedTickets = prev.map(ticket => {
          if (ticket.id === data._id) {
            return {
              ...ticket,
              status: data.status === 'open' ? 'Awaiting your response' : 
                     data.status === 'in-progress' ? 'In progress' : 
                     data.status === 'waiting-for-customer' ? 'Waiting for customer' :
                     data.status === 'waiting-for-agent' ? 'Pending' : data.status,
              priority: data.priority
            };
          }
          return ticket;
        });
        
        // Sort by status priority
        return updatedTickets.sort((a, b) => {
          const statusPriority = {
            'Awaiting your response': 0,
            'In progress': 1,
            'Waiting for customer': 2,
            'Pending': 3
          };
          return statusPriority[a.status] - statusPriority[b.status];
        });
      });
    };

    // Handler for stats updates
    const handleStatsUpdate = (stats) => {
      console.log(`[${COMPONENT_NAME}] Handling stats update:`, stats);
      fetchDashboardData();
    };

    // Add event listeners
    socket.on('new_notification', handleNewNotification);
    socket.on('ticket_assigned', handleTicketAssigned);
    socket.on('ticket_updated', handleTicketUpdate);
    socket.on('stats_updated', handleStatsUpdate);

    console.log(`[${COMPONENT_NAME}] ✅ Socket event handlers registered`);

    // Cleanup function
    return () => {
      console.log(`[${COMPONENT_NAME}] Cleaning up socket event handlers`);
      if (socket) {
        socket.off('new_notification', handleNewNotification);
        socket.off('ticket_assigned', handleTicketAssigned);
        socket.off('ticket_updated', handleTicketUpdate);
        socket.off('stats_updated', handleStatsUpdate);
      }
    };
  }, [socket, isConnected, user?._id, fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    console.log(`[${COMPONENT_NAME}] Initial data fetch`);
    fetchDashboardData();
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log(`[${COMPONENT_NAME}] Periodic refresh`);
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  // Separate useEffect for initial data loading
  useEffect(() => {
    fetchNotifs();
  }, []); // Only run once on mount
  
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };
  
  const parseTimeAgo = (timeAgoString) => {
    if (!timeAgoString || timeAgoString === 'N/A') return 0;
    
    const value = parseInt(timeAgoString);
    if (isNaN(value)) return 0;
    
    if (timeAgoString.includes('m ago')) {
      return value * 60 * 1000; // minutes to ms
    } else if (timeAgoString.includes('h ago')) {
      return value * 60 * 60 * 1000; // hours to ms
    } else if (timeAgoString.includes('d ago')) {
      return value * 24 * 60 * 60 * 1000; // days to ms
    }
    
    return 0;
  };

  // Function to handle adding a new task
  const handleAddTask = (e) => {
    e.preventDefault();
    // In a real app, this would connect to your backend
    console.log('Adding new task:', newTask);
    // Add task to the list (just for demo)
    setUpcomingTasks(prevTasks => [
      {
        id: Date.now(),
        priority: newTask.priority,
        title: newTask.title,
        dueIn: newTask.dueDate || 'Today'
      },
      ...prevTasks
    ]);
    // Reset and close modal
    setNewTask({ title: '', priority: 'Normal', dueDate: '' });
    setShowTaskModal(false);
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate('/');
    }, 50);
  };

  // Get user's initials for avatar display
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  // Helper function to format or hide metric values
  const formatMetric = (value) => {
    if (value === undefined || value === null || value === 'undefined' || value.includes('undefined')) {
      return '-';
    }
    return value;
  };

  // Add this function near the other utility functions if it doesn't exist yet
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
      case 'High':
        return 'bg-pink-100 text-pink-700';
      case 'medium':
      case 'Medium':
      case 'Normal':
        return 'bg-yellow-100 text-yellow-700'; 
      case 'low':
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Fetch notifications on mount
  const fetchNotifs = async () => {
    try {
      setLoadingNotifs(true);
      const notifs = await getNotifications();
      setNotifications(notifs);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // Mark all as read when dropdown is opened
  const handleNotifDropdown = async () => {
    if (!notifOpen) {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => markNotificationAsRead(n._id)));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
    setNotifOpen(!notifOpen);
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

  // Add this useEffect for debugging
  useEffect(() => {
    console.log(`[${COMPONENT_NAME}] Socket status:`, {
      hasSocket: !!socket,
      isConnected,
      userId: user?._id,
      userRole: user?.role
    });
  }, [socket, isConnected, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 p-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => fetchDashboardData()}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

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
              <Link to="/agent" className="flex items-center px-4 h-full border-b-2 border-pink-500 text-pink-500">
                <FaTachometerAlt className="mr-2" /> Dashboard
              </Link>
              <Link to="/agent/tickets" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaTicketAlt className="mr-2" /> Tickets
              </Link>
              <Link to="/agent/articles" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaBook className="mr-2" /> Articles
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
        {/* Add padding top to prevent content being hidden behind fixed navbar */}
        <div style={{ height: '56px' }} />
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link to="/agent/tickets">
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm">
                View All Tickets
              </button>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Response Time */}
          <div className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-yellow-400">
                <FaRegClock size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatMetric(metrics.responseTime.value)}</div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
          </div>

          {/* Resolution Rate */}
          <div className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-500">
                <FaCheckCircle size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatMetric(metrics.resolutionRate.value)}</div>
            <div className="text-sm text-gray-500">Resolution Rate</div>
          </div>

          {/* CSAT Score */}
          <div className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-yellow-400">
                <FaStar size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatMetric(metrics.csatScore.value)}</div>
            <div className="text-sm text-gray-500">CSAT Score</div>
          </div>

          {/* Tickets Resolved */}
          <div className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-pink-400">
                <FaTicketAlt size={20} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatMetric(metrics.ticketsResolved.value)}</div>
            <div className="text-sm text-gray-500">Tickets Resolved</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            {/* Active Tickets */}
            <div className="bg-white rounded-lg p-6 shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Active Tickets</h2>
                <Link to="/agent/tickets" className="text-pink-500 text-sm">View all</Link>
              </div>

              {activeTickets.length === 0 ? (
                <div className="text-center py-8">
                  <FaTicketAlt className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-gray-500">No active tickets</p>
                  <Link 
                    to="/agent/tickets" 
                    className="mt-2 inline-block text-pink-500 hover:text-pink-600"
                  >
                    Assign tickets to yourself
                  </Link>
                </div>
              ) : (
                /* Ticket List */
                <div className="space-y-4">
                  {activeTickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="block p-4 bg-white border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {ticket.ticketNumber} • {ticket.customer}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ticket.status === 'Awaiting your response' 
                            ? 'bg-red-100 text-red-600' 
                            : ticket.status === 'In progress'
                            ? 'bg-yellow-100 text-yellow-600'
                            : ticket.status === 'Waiting for customer'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-pink-100 text-pink-600'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ticket.priority === 'high' ? 'bg-red-50 text-red-600' :
                          ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Created {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <FaUsers className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-gray-500">No recent activity</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start mb-4">
                    <div className={`mt-1 p-1 rounded-full mr-3 ${
                      activity.type === 'resolved' 
                        ? 'bg-green-100 text-green-500' 
                        : activity.type === 'reply'
                        ? 'bg-blue-100 text-blue-500'
                        : 'bg-purple-100 text-purple-500'
                    }`}>
                      {activity.type === 'resolved' ? <FaCheckCircle size={14} /> : 
                       activity.type === 'reply' ? <FaUsers size={14} /> : 
                       <FaTicketAlt size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.content}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg p-6 shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
                <button 
                  onClick={() => setShowTaskModal(true)}
                  className="text-sm bg-pink-100 text-pink-600 px-3 py-1 rounded-full flex items-center"
                >
                  <FaPlus size={12} className="mr-1" /> Add Task
                </button>
              </div>

              {/* Task List */}
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8">
                  <FaClock className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-gray-500">No upcoming tasks</p>
                  <button 
                    onClick={() => setShowTaskModal(true)}
                    className="mt-2 text-pink-500 hover:text-pink-600"
                  >
                    Add your first task
                  </button>
                </div>
              ) : (
                upcomingTasks.map((task, index) => (
                  <div key={task.id} className="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <span className={`priority-tag ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-sm text-gray-500">Due in {task.dueIn}</span>
                    </div>
                    <h3 className="font-medium mt-2">{task.title}</h3>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            
            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option>Normal</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="text"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Today, Tomorrow, or specific time"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;