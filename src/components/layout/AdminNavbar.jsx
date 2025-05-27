import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaTachometerAlt, FaUsers, FaChartBar, FaCog, FaBars, FaTimes, FaUserCircle, FaCogs, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import logo from '/src/assets/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationAsRead } from '../../services/api/notificationService';

const AdminNavbar = ({ 
  activeItem = 'Dashboard', 
  title = "Jellycat Support Admin",
  adminName = "System Admin",
  adminRole = "Administrator"
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const { logout, user } = useAuth();

  // Fetch notifications on mount
  useEffect(() => {
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
    if (user && user.id) fetchNotifs();
  }, [user]);

  // Handle clicking outside the profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleNotifDropdown = async () => {
    if (!notifOpen) {
      // Mark all unread notifications as read
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => markNotificationAsRead(n._id)));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
    setNotifOpen(!notifOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/admin' },
    { name: 'Agents', icon: <FaUsers />, path: '/admin/agents' },
    { name: 'Analytics', icon: <FaChartBar />, path: '/admin/analytics' },
    { name: 'Settings', icon: <FaCog />, path: '#' }
  ];

  return (
    <div className="relative">
      {/* Main Navbar */}
      <div className="flex h-14 w-full bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 z-40">
        {/* Logo Section */}
        <div className="flex items-center px-4">
          <div className="w-8 h-8 bg-gray-300 rounded-xl overflow-hidden">
            <img src={logo} alt="Avatar" className="object-cover w-full h-full" />
          </div>
          <span className="ml-3 text-base font-bold hidden lg:block">{title}</span>
          <span className="ml-3 text-base font-bold hidden md:block lg:hidden">Support Admin</span>
          <span className="ml-3 text-base font-bold md:hidden">Admin</span>
        </div>
        {/* Desktop Menu Items */}
        <div className="hidden md:flex items-center ml-8">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 h-full text-sm ${
                activeItem === item.name 
                  ? 'text-pink-500 border-b-2 border-pink-500' 
                  : 'text-gray-600 hover:text-gray-900'
             }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
        {/* Notification and User Profile */}
        <div className="flex items-center ml-auto mr-6 gap-4">
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleNotifDropdown}
              className="relative focus:outline-none cursor-pointer"
              data-testid="admin-bell-btn"
            >
              <FaBell className="text-xl text-gray-500" />
              {notifications.filter(notif => !notif.read).length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-xs">
                  {notifications.filter(notif => !notif.read).length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifs ? (
                    <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">No notifications</div>
                  ) : notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`block px-4 py-3 text-sm border-b last:border-b-0 hover:bg-pink-50 transition ${notif.read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}
                      onClick={() => setNotifOpen(false)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-pink-100 text-pink-600 rounded px-2 py-0.5 mr-2">{notif.type}</span>
                        <span className="text-xs text-gray-400">{new Date(notif.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="mt-1">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Profile with dropdown */}
          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center cursor-pointer"
              onClick={toggleProfileDropdown}
            >
              <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm font-medium">
                {adminName.split(' ').map(name => name[0]).join('')}
              </div>
              <div className="ml-2 hidden sm:block">
                <div className="flex items-center">
                  <p className="text-sm font-medium">{adminName}</p>
                  <FaChevronDown className="ml-1 text-xs text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">{adminRole}</p>
              </div>
            </div>
            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link to="/admin/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50">
                  <FaUserCircle className="mr-3 text-pink-400" />
                  Profile
                </Link>
                <Link to="/admin/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50">
                  <FaCogs className="mr-3 text-pink-400" />
                  Settings
                </Link>
                <hr className="my-1 border-gray-200" />
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-pink-50"
                >
                  <FaSignOutAlt className="mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-gray-500 focus:outline-none cursor-pointer" 
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 w-full bg-white shadow-lg z-50 border-b border-gray-200">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-6 py-3 ${
                activeItem === item.name 
                  ? 'text-pink-500 bg-pink-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
          <hr className="border-gray-200" />
          <button
            className="flex items-center w-full px-6 py-3 text-red-500 hover:bg-gray-50"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="mr-3 text-lg" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar; 