import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaTicketAlt, FaPlus, FaBell, FaSignOutAlt, FaUser } from 'react-icons/fa';
import logo from '/src/assets/logo.jpg';

const AgentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [profileMenu, setProfileMenu] = useState(false);

  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name.split(' ').map(name => name[0]).join('').toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex h-14 items-center px-4 justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-xl overflow-hidden">
              <img src={logo} alt="YipHelp" className="object-cover w-full h-full" />
            </div>
            <span className="ml-3 text-base font-bold">YipHelp</span>

            <nav className="hidden md:flex ml-8">
              <Link to="/agent" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaTachometerAlt className="mr-2" /> Dashboard
              </Link>
              <Link to="/agent/tickets" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaTicketAlt className="mr-2" /> Tickets
              </Link>
              <Link to="/agent/articles" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
                <FaPlus className="mr-2" /> Manage Articles
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <FaBell className="text-gray-500" />
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
                  <p className="text-xs text-gray-500">{user?.agentType || 'Agent'}</p>
                </div>
              </div>

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

      {/* Page Content */}
      <main className="p-4 md:p-6 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default AgentLayout;
