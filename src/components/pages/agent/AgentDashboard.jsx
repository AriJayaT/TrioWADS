import React, { useState, useEffect } from 'react';
import { FaBell, FaTachometerAlt, FaUsers, FaChartBar, FaSignOutAlt, FaUser, FaClock } from 'react-icons/fa';
import { FaCheckCircle, FaRegClock, FaStar, FaTicketAlt, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/src/assets/logo.jpg';
import { useAuth } from '../../../context/AuthContext';
import ticketService from '../../../services/api/ticketService';

const AgentDashboard = () => {
  const navigate = useNavigate();
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
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get agent statistics
      const statsResponse = await ticketService.getTicketStats();
      
      if (statsResponse) {
        // Update metrics with real data, handling undefined values
        setMetrics({
          responseTime: {
            value: statsResponse.avgResponseTime ? `${statsResponse.avgResponseTime}m` : null,
            change: statsResponse.responseTimeChange > 0 ? `+${statsResponse.responseTimeChange}m` : `${statsResponse.responseTimeChange}m`,
            direction: statsResponse.responseTimeChange > 0 ? 'up' : 'down'
          },
          resolutionRate: {
            value: statsResponse.resolutionRate !== undefined ? `${statsResponse.resolutionRate}%` : null,
            change: statsResponse.resolutionRateChange > 0 ? `+${statsResponse.resolutionRateChange}%` : `${statsResponse.resolutionRateChange}%`,
            direction: statsResponse.resolutionRateChange > 0 ? 'up' : 'down'
          },
          csatScore: {
            value: statsResponse.csatScore !== undefined ? statsResponse.csatScore?.toFixed(1) : null,
            change: statsResponse.csatScoreChange > 0 ? `+${statsResponse.csatScoreChange}` : `${statsResponse.csatScoreChange}`,
            direction: statsResponse.csatScoreChange > 0 ? 'up' : 'down'
          },
          ticketsResolved: {
            value: statsResponse.ticketsResolved !== undefined ? `${statsResponse.ticketsResolved}` : null,
            change: statsResponse.ticketsResolvedChange > 0 ? `+${statsResponse.ticketsResolvedChange}` : `${statsResponse.ticketsResolvedChange}`,
            direction: statsResponse.ticketsResolvedChange > 0 ? 'up' : 'down'
          }
        });
      }
      
      // Fetch active tickets (assigned to this agent and not closed)
      const activeTicketsResponse = await ticketService.getTickets({
        assignedTo: user?._id,
        status: 'Open,In Progress,Pending'
      });
      
      // Format active tickets
      const formattedActiveTickets = (activeTicketsResponse.tickets || []).map(ticket => ({
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        customer: ticket.user?.name || 'Customer',
        status: ticket.status === 'open' ? 'Awaiting your response' : 
                ticket.status === 'in-progress' ? 'In progress' : 'Pending'
      }));
      
      setActiveTickets(formattedActiveTickets);
      
      // Fetch recent activity data
      const recentTickets = await ticketService.getTickets({
        recent: true,
        limit: 5
      });
      
      // Create recent activity list from ticket data
      const activities = [];
      
      if (recentTickets.tickets) {
        recentTickets.tickets.forEach(ticket => {
          // Add an activity for ticket status changes
          if (ticket.status === 'closed' || ticket.status === 'resolved') {
            activities.push({
              id: `resolved-${ticket._id}`,
              type: 'resolved',
              content: `Resolved ticket ${ticket.ticketNumber} - ${ticket.subject}`,
              time: formatTimeAgo(ticket.updatedAt)
            });
          }
          
          // Add replies as activities
          if (ticket.messages && ticket.messages.length > 0) {
            const latestMessage = ticket.messages[ticket.messages.length - 1];
            if (latestMessage.sender === 'customer') {
              activities.push({
                id: `reply-${latestMessage._id || Math.random()}`,
                type: 'reply',
                content: `New reply on ${ticket.ticketNumber} from ${ticket.user?.name || 'Customer'}`,
                time: formatTimeAgo(latestMessage.createdAt)
              });
            }
          }
          
          // Add newly assigned tickets as activities
          if (ticket.assignedTo?._id === user?._id && 
              new Date(ticket.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            activities.push({
              id: `assigned-${ticket._id}`,
              type: 'assigned',
              content: `New ${ticket.priority}-priority ticket ${ticket.ticketNumber} assigned`,
              time: formatTimeAgo(ticket.updatedAt)
            });
          }
        });
      }
      
      // Sort by most recent and take top 3
      activities.sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      });
      
      setRecentActivities(activities.slice(0, 3));
      
      // Count unassigned tickets for notification badge
      const unassignedResponse = await ticketService.getTickets({ 
        unassigned: true 
      });
      
      setUnassignedCount(unassignedResponse.tickets?.length || 0);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
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
    navigate('/');
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
              <Link to="/agent" className="flex items-center px-4 h-full border-b-2 border-pink-500 text-pink-500">
                <FaTachometerAlt className="mr-2" /> Dashboard
              </Link>
              <Link to="/agent/tickets" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaTicketAlt className="mr-2" /> Tickets
              </Link>
            </nav>
          </div>

          {/* Profile & Notifications */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <FaBell className="text-gray-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {unassignedCount}
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
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Agent Dashboard</h1>
          <div className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm">
            Today
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
              <div className={`text-xs font-medium ${metrics.responseTime.direction === 'down' ? 'text-green-500' : 'text-red-500'}`}>
                {formatMetric(metrics.responseTime.change)}
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
              <div className={`text-xs font-medium ${metrics.resolutionRate.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {formatMetric(metrics.resolutionRate.change)}
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
              <div className={`text-xs font-medium ${metrics.csatScore.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {formatMetric(metrics.csatScore.change)}
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
              <div className={`text-xs font-medium ${metrics.ticketsResolved.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {formatMetric(metrics.ticketsResolved.change)}
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
                activeTickets.map((ticket, index) => (
                  <div key={ticket.id} className="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ticket.status === 'Awaiting your response' 
                          ? 'bg-red-100 text-red-600' 
                          : ticket.status === 'In progress'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{ticket.customer}</p>
                  </div>
                ))
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