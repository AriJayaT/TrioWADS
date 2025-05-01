import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaSignInAlt, FaUserPlus, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { IoMdHelpCircle } from 'react-icons/io';
import logo from '/src/assets/logo.jpg';
import { useAuth } from '../../context/AuthContext';

const CustomerHeader = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileMenu(false);
  };
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="flex h-14 items-center px-4 justify-between">
        {/* Logo & Title */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-xl overflow-hidden">
            <img src={logo} alt="Jellycat Support" className="object-cover w-full h-full" />
          </div>
          <span className="ml-3 text-base font-bold">Jellycat Support</span>
          
          {/* Navigation */}
          <nav className="hidden md:flex ml-8">
            <Link to="/" className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900">
              <FaHome className="mr-2" /> Home
            </Link>
            <Link 
              to={isAuthenticated ? "/customer/help-center" : "/help-center"} 
              className="flex items-center px-4 h-full text-gray-600 hover:text-gray-900"
            >
              <IoMdHelpCircle className="mr-2" /> Help Center
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => setProfileMenu(!profileMenu)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
                  <FaUser className="text-pink-500" />
                </div>
                <span className="ml-2 text-sm font-medium">My Account</span>
              </div>
              
              {profileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/customer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Dashboard
                  </Link>
                  <Link to="/customer/tickets" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Tickets
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/select-version" className="flex items-center text-pink-500 hover:text-pink-600">
                <FaSignInAlt className="mr-1" /> Sign In
              </Link>
              <Link to="/signup" className="bg-pink-400 hover:bg-pink-500 text-white rounded-lg px-4 py-1 flex items-center">
                <FaUserPlus className="mr-1" /> Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader; 