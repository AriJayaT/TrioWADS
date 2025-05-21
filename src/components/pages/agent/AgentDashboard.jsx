import React, { useState } from 'react';
import { FaBell, FaTachometerAlt, FaUsers, FaChartBar, FaCog, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { FaCheckCircle, FaRegClock, FaStar, FaTicketAlt, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/src/assets/logo.jpg';

const AgentDashboard = () => {
  const navigate = useNavigate();
  // State for adding a new task
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'Normal', dueDate: '' });
  const [profileMenu, setProfileMenu] = useState(false);
  
  // Mock data for the dashboard
  const dashboardData = {
    metrics: {
      responseTime: { value: '12m', change: '+1m', direction: 'down' },
      resolutionRate: { value: '94%', change: '+2%', direction: 'up' },
      csatScore: { value: '4.8', change: '+0.2', direction: 'up' },
      ticketsResolved: { value: '28', change: '+5', direction: 'up' }
    },
    activeTickets: [
      { id: 'JC45622', subject: 'Missing Item from Order #JC45622', customer: 'Emily Parker', status: 'Awaiting your response' },
      { id: 'Duplicate', subject: 'Refund Request for Duplicate Order', customer: 'James Wilson', status: 'In progress' },
      { id: 'Dragon', subject: 'Damaged Jellycat Dragon', customer: 'Sarah Brown', status: 'Pending' }
    ],
    upcomingTasks: [
      { id: 1, priority: 'High', title: 'Follow up on Order #JC45622', dueIn: '2h' },
      { id: 2, priority: 'Normal', title: 'Update shipping status for #TK-2024-004', dueIn: '6h' },
      { id: 3, priority: 'Normal', title: 'Customer satisfaction survey review', dueIn: 'Today' }
    ],
    recentActivity: [
      { id: 1, type: 'resolved', content: 'Resolved ticket #TK-2024-005 - Return Label Request', time: '5m ago' },
      { id: 2, type: 'reply', content: 'New reply on #TK-2024-002 from James Wilson', time: '15m ago' },
      { id: 3, type: 'assigned', content: 'New high-priority ticket #TK-2024-006 assigned', time: '30m ago' }
    ]
  };

  // Function to handle adding a new task
  const handleAddTask = (e) => {
    e.preventDefault();
    // In a real app, this would connect to your backend
    console.log('Adding new task:', newTask);
    // Add task to the list (just for demo)
    dashboardData.upcomingTasks.unshift({
      id: Date.now(),
      priority: newTask.priority,
      title: newTask.title,
      dueIn: newTask.dueDate || 'Today'
    });
    // Reset and close modal
    setNewTask({ title: '', priority: 'Normal', dueDate: '' });
    setShowTaskModal(false);
  };

  const handleLogout = () => {
    // In a real app, this would handle logout logic
    console.log('Logging out');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex h-14 items-center px-4 justify-between">
          {/* Logo & Title */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-xl overflow-hidden">
              <img src={logo} alt="Jellycat Support" className="object-cover w-full h-full" />
            </div>
            <span className="ml-3 text-base font-bold">Jellycat Support</span>
            
            {/* Navigation */}
            <nav className="hidden md:flex ml-8">
              <Link to="/agent" className="flex items-center px-4 h-full border-b-2 border-pink-500 text-pink-500">
                <FaTachometerAlt className="mr-2" /> Dashboard
              </Link>
              <Link to="/agent/tickets" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaTicketAlt className="mr-2" /> Tickets
              </Link>
              <Link to="/agent/reports" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaChartBar className="mr-2" /> Reports
              </Link>
            </nav>
          </div>

          {/* Profile & Notifications */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <FaBell className="text-gray-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                2
              </span>
            </div>
            <div className="relative">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setProfileMenu(!profileMenu)}
              >
                <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm font-medium">
                  SA
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="text-sm font-medium">Sarah Anderson</p>
                  <p className="text-xs text-gray-500">Senior Support Agent</p>
                </div>
              </div>
              
              {/* Profile Dropdown */}
              {profileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/agent/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FaUser className="mr-2 text-pink-500" /> Profile
                  </Link>
                  <Link to="/agent/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FaCog className="mr-2 text-pink-500" /> Settings
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
              <div className="text-xs font-medium text-red-500">
                +1m
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">12m</div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
          </div>

          {/* Resolution Rate */}
          <div className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-500">
                <FaCheckCircle size={20} />
              </div>
              <div className="text-xs font-medium text-green-500">
                +2%
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">94%</div>
            <div className="text-sm text-gray-500">Resolution Rate</div>
          </div>

          {/* CSAT Score */}
          <div className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-yellow-400">
                <FaStar size={20} />
              </div>
              <div className="text-xs font-medium text-green-500">
                +0.2
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">4.8</div>
            <div className="text-sm text-gray-500">CSAT Score</div>
          </div>

          {/* Tickets Resolved */}
          <div className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-pink-400">
                <FaTicketAlt size={20} />
              </div>
              <div className="text-xs font-medium text-green-500">
                +5
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">28</div>
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
                <a href="/agent/tickets" className="text-pink-500 text-sm">View all</a>
              </div>

              {/* Ticket List */}
              {dashboardData.activeTickets.map((ticket, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
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
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start mb-4">
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
              ))}
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
              {dashboardData.upcomingTasks.map((task, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-sm text-gray-500">Due in {task.dueIn}</span>
                  </div>
                  <h3 className="font-medium mt-2">{task.title}</h3>
                </div>
              ))}
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