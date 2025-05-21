import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaBell, FaHome, FaTicketAlt } from 'react-icons/fa';
import { IoMdArrowDropdown, IoMdHelpCircle } from 'react-icons/io';
import logo from '/src/assets/logo.jpg';

const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [profileMenu, setProfileMenu] = useState(false);

  // Function to determine if a navigation item should be highlighted as active
  const isActive = (route) => {
    if (route === '/customer' || route === '/customer/dashboard') {
      return path === '/customer' || path === '/customer/dashboard';
    }
    return path.startsWith(route);
  };

  const handleLogout = () => {
    console.log('Logging out');
    navigate('/login');
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
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className="text-sm font-medium">Sophie Anderson</p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>
              </div>
              
              {/* Profile Dropdown */}
              {profileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link to="/customer/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </Link>
                  <Link to="/customer/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
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