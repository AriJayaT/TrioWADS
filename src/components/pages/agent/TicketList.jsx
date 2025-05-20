import React, { useState } from 'react';
import { FaBell, FaTachometerAlt, FaTicketAlt, FaRegClock, FaChartBar, FaSearch, FaFilter, FaEye, FaReply, FaSignOutAlt, FaUser, FaCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/src/assets/logo.jpg';

const TicketList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isRespondOpen, setIsRespondOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priority');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [profileMenu, setProfileMenu] = useState(false);

  // Mock data for tickets
  const tickets = [
    {
      id: 'TK-2024-001',
      customer: {
        name: 'Emily Parker',
        email: 'emily.p@email.com'
      },
      subject: 'Missing Item from Order #JC45692',
      category: 'Orders & Shipping',
      status: 'Open',
      priority: 'High',
      waitTime: '30m',
      description: 'Order missing Bashful Bunny Medium, received Small instead.',
      agentNotes: 'Customer is a VIP member, priority handling required',
      conversations: [
        { 
          sender: 'customer', 
          message: 'Hi, I received the wrong size Bashful Bunny in my order.', 
          timestamp: '2024-01-15 10:30 AM' 
        },
        { 
          sender: 'agent', 
          message: "Hello Emily, I apologize for this mix-up. I'll help you get this sorted right away.", 
          timestamp: '2024-01-15 10:45 AM' 
        }
      ]
    },
    {
      id: 'TK-2024-002',
      customer: {
        name: 'James Wilson',
        email: 'james.w@email.com'
      },
      subject: 'Refund Request for Duplicate Order',
      category: 'Billing',
      status: 'In Progress',
      priority: 'Normal',
      waitTime: '45m',
      description: 'Customer accidentally placed the same order twice and is requesting a refund for the duplicate.',
      agentNotes: 'Verified duplicate order in system.',
      conversations: [
        { 
          sender: 'customer', 
          message: 'I accidentally ordered the same Jellycat toys twice. Can I get a refund for one of them?', 
          timestamp: '2024-01-14 3:15 PM' 
        },
        { 
          sender: 'agent', 
          message: "Hi James, I've confirmed the duplicate order. I'll process your refund right away.", 
          timestamp: '2024-01-14 3:30 PM' 
        }
      ]
    },
    {
      id: 'TK-2024-003',
      customer: {
        name: 'Sarah Brown',
        email: 'sarah.b@email.com'
      },
      subject: 'Damaged Jellycat Dragon',
      category: 'Product Issues',
      status: 'Pending',
      priority: 'High',
      waitTime: '15m',
      description: 'Customer received a damaged Jellycat Dragon with a torn wing.',
      agentNotes: 'Photos of damage verified, eligible for replacement.',
      conversations: [
        { 
          sender: 'customer', 
          message: 'The dragon plush I received has a torn wing and some loose stitching.', 
          timestamp: '2024-01-15 9:00 AM' 
        },
        { 
          sender: 'agent', 
          message: "I'm sorry to hear about the damaged item, Sarah. Could you send some photos so we can process a replacement?", 
          timestamp: '2024-01-15 9:10 AM' 
        }
      ]
    }
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Status' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'All Priority' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All Categories' || ticket.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setIsViewDetailsOpen(true);
    setIsRespondOpen(false);
  };

  const handleRespond = (ticket) => {
    setSelectedTicket(ticket);
    setIsRespondOpen(true);
    setIsViewDetailsOpen(false);
  };

  const closeModal = () => {
    setIsViewDetailsOpen(false);
    setIsRespondOpen(false);
  };

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    // In a real app, this would send the response to the backend
    console.log('Response submitted');
    closeModal();
  };

  const handleLogout = () => {
    // In a real app, this would handle logout logic
    console.log('Logging out');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open':
        return 'bg-pink-100 text-pink-600';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-600';
      case 'Pending':
        return 'bg-blue-100 text-blue-600';
      case 'Closed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High':
        return 'text-pink-500';
      case 'Normal':
        return 'text-yellow-500';
      case 'Low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Orders & Shipping':
        return 'text-pink-400';
      case 'Billing':
        return 'text-purple-400';
      case 'Product Issues':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
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
              <Link to="/agent" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaTachometerAlt className="mr-2" /> Dashboard
              </Link>
              <Link to="/agent/tickets" className="flex items-center px-4 h-full border-b-2 border-pink-500 text-pink-500">
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
                  <p className="text-sm font-medium">Support Agent</p>
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
        <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

        {/* Ticket Self-Assignment Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Available Tickets for Assignment</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waiting Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">TK-2024-005</td>
                  <td className="px-4 py-3 text-sm">Shipping Delay Inquiry</td>
                  <td className="px-4 py-3 text-sm text-pink-400">Orders & Shipping</td>
                  <td className="px-4 py-3 text-sm text-yellow-500">Normal</td>
                  <td className="px-4 py-3 text-sm">1h 15m</td>
                  <td className="px-4 py-3 text-sm">
                    <button className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 text-xs">
                      Assign to Me
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">TK-2024-007</td>
                  <td className="px-4 py-3 text-sm">Product Availability Question</td>
                  <td className="px-4 py-3 text-sm text-purple-400">General Inquiry</td>
                  <td className="px-4 py-3 text-sm text-green-500">Low</td>
                  <td className="px-4 py-3 text-sm">45m</td>
                  <td className="px-4 py-3 text-sm">
                    <button className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 text-xs">
                      Assign to Me
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">TK-2024-008</td>
                  <td className="px-4 py-3 text-sm">Damaged Jellycat Corgi Plush</td>
                  <td className="px-4 py-3 text-sm text-blue-400">Product Issues</td>
                  <td className="px-4 py-3 text-sm text-pink-500">High</td>
                  <td className="px-4 py-3 text-sm">2h 30m</td>
                  <td className="px-4 py-3 text-sm">
                    <button className="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 text-xs">
                      Assign to Me
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
              <option>Pending</option>
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
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.customer.name}</div>
                      <div className="text-sm text-gray-500">{ticket.customer.email}</div>
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
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.waitTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(ticket)}
                        className="text-pink-400 hover:text-pink-600 mx-2"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleRespond(ticket)}
                        className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                      >
                        Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* View Details Modal */}
      {isViewDetailsOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                Ticket: {selectedTicket.id}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Customer</h3>
                  <div className="text-gray-600">{selectedTicket.customer.name}</div>
                  <div className="text-gray-500 text-sm">{selectedTicket.customer.email}</div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Category</h3>
                  <div className="text-gray-600">{selectedTicket.category}</div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Priority</h3>
                  <span className={`font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Description</h3>
                <div className="text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedTicket.description}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Agent Notes</h3>
                <div className="text-gray-600 bg-gray-50 p-3 rounded">
                  {selectedTicket.agentNotes}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Conversation History</h3>
                <div className="space-y-3">
                  {selectedTicket.conversations.map((conversation, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg ${
                        conversation.sender === 'customer' 
                          ? 'bg-pink-50' 
                          : 'bg-pink-300 text-white'
                      }`}
                    >
                      <div className="text-sm">{conversation.message}</div>
                      <div className="text-xs mt-1 opacity-70">{conversation.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {isRespondOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Respond to Ticket</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                Ticket: {selectedTicket.id} - {selectedTicket.subject}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-pink-500 text-xs">👤</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{selectedTicket.customer.name}</div>
                    <div className="text-xs text-gray-500">{selectedTicket.customer.email}</div>
                  </div>
                </div>
                
                <div className="bg-pink-50 p-3 rounded-lg text-sm">
                  {selectedTicket.description}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">Ticket Status</h3>
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center ${selectedTicket.status === 'Open' ? 'text-pink-500' : 'text-gray-400'}`}>
                    <input 
                      type="radio" 
                      id="status-open" 
                      name="status" 
                      value="Open" 
                      defaultChecked={selectedTicket.status === 'Open'} 
                      className="mr-1"
                    />
                    <label htmlFor="status-open">Open</label>
                  </div>
                  <div className={`flex items-center ${selectedTicket.status === 'In Progress' ? 'text-pink-500' : 'text-gray-400'}`}>
                    <input 
                      type="radio" 
                      id="status-progress" 
                      name="status" 
                      value="In Progress" 
                      defaultChecked={selectedTicket.status === 'In Progress'} 
                      className="mr-1"
                    />
                    <label htmlFor="status-progress">In Progress</label>
                  </div>
                  <div className={`flex items-center ${selectedTicket.status === 'Pending' ? 'text-pink-500' : 'text-gray-400'}`}>
                    <input 
                      type="radio" 
                      id="status-pending" 
                      name="status" 
                      value="Pending" 
                      defaultChecked={selectedTicket.status === 'Pending'} 
                      className="mr-1"
                    />
                    <label htmlFor="status-pending">Pending</label>
                  </div>
                  <div className={`flex items-center ${selectedTicket.status === 'Closed' ? 'text-pink-500' : 'text-gray-400'}`}>
                    <input 
                      type="radio" 
                      id="status-closed" 
                      name="status" 
                      value="Closed" 
                      defaultChecked={selectedTicket.status === 'Closed'} 
                      className="mr-1"
                    />
                    <label htmlFor="status-closed">Closed</label>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">Quick Templates</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="bg-pink-50 px-3 py-1 rounded-lg text-sm text-pink-500 hover:bg-pink-100">
                    Thank you for reaching out to...
                  </button>
                  <button className="bg-pink-50 px-3 py-1 rounded-lg text-sm text-pink-500 hover:bg-pink-100">
                    I apologize for any inconvenience...
                  </button>
                  <button className="bg-pink-50 px-3 py-1 rounded-lg text-sm text-pink-500 hover:bg-pink-100">
                    I'm looking into this for you...
                  </button>
                  <button className="bg-pink-50 px-3 py-1 rounded-lg text-sm text-pink-500 hover:bg-pink-100">
                    Please let me know if you have...
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Your Response</h3>
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg h-32"
                  placeholder="Type your response here..."
                ></textarea>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Update Status</h3>
                <select className="w-full p-2 border border-gray-300 rounded-lg">
                  <option value="">Select Status...</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitResponse}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;