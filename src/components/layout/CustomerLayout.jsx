import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaBell, FaHome, FaTicketAlt, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { IoMdArrowDropdown, IoMdHelpCircle } from 'react-icons/io';
import logo from '/src/assets/logo.jpg';
import { useAuth } from '../../context/AuthContext';

const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [profileMenu, setProfileMenu] = useState(false);
  const { user, logout } = useAuth();

  // Function to determine if a navigation item should be highlighted as active
  const isActive = (route) => {
    if (route === '/customer' || route === '/customer/dashboard') {
      return path === '/customer' || path === '/customer/dashboard';
    }
    return path.startsWith(route);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user's initials for avatar display
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name.split(' ').map(name => name[0]).join('').toUpperCase();
  };

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
              <Link 
                to="/customer" 
                className={`flex items-center px-4 h-full ${isActive('/customer') ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <FaHome className="mr-2" /> Home
              </Link>
              <Link 
                to="/customer/tickets" 
                className={`flex items-center px-4 h-full ${isActive('/customer/tickets') ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <FaTicketAlt className="mr-2" /> My Tickets
              </Link>
              <Link 
                to="/customer/help-center" 
                className={`flex items-center px-4 h-full ${isActive('/customer/help-center') ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <IoMdHelpCircle className="mr-2" /> Help Center
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
                <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
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
                    <span className="text-pink-500 text-sm font-medium">
                      {getUserInitials()}
                    </span>
                  )}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="text-sm font-medium">{user?.name || 'Customer'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Customer'}</p>
                </div>
              </div>
              
              {/* Profile Dropdown */}
              {profileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/customer/profile" className="flex items-center px-4 py-2 text-sm text-pink-500 hover:bg-gray-100">
                    <FaUserCircle className="mr-2 text-pink-500" /> Your Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="mr-2" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout; 