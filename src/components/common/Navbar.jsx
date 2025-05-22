import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaTachometerAlt, FaUsers, FaChartBar, FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import logo from '/src/assets/logo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ 
  activeItem = 'Dashboard', 
  title = "YipHelp Admin",
  notifications = 2
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const { user, logout } = useAuth();

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();
    // Navigate to version select page
    navigate('/select-version');
  };

  // Get the user's initials
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/admin' },
    { name: 'Agents', icon: <FaUsers />, path: '/admin/agents' },
    { name: 'Analytics', icon: <FaChartBar />, path: '/admin/analytics' }
  ];

  return (
    <div className="relative">
      {/* Main Navbar */}
      <div className="flex h-14 w-full bg-white border-b border-gray-200 shadow-sm">
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
          <div className="relative">
            <FaBell className="text-xl text-gray-500" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-xs">
                {notifications}
              </span>
            )}
          </div>
          
          {/* Profile with dropdown */}
          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center cursor-pointer"
              onClick={toggleProfileDropdown}
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
                <div className="flex items-center">
                  <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                  <FaChevronDown className="ml-1 text-xs text-gray-500" />
                </div>
                <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            
            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link to="/admin/profile" className="flex items-center px-4 py-2 text-sm text-pink-500 hover:bg-pink-50">
                  <FaUserCircle className="mr-3 text-pink-400" />
                  Profile
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

export default Navbar;