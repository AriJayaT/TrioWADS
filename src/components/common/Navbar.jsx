import React, { useState } from 'react';
import { FaBell, FaTachometerAlt, FaUsers, FaChartBar, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import logo from '/src/assets/logo.jpg';

const Navbar = ({ 
  activeItem = 'Dashboard', 
  title = "Jellycat Support Admin",
  notifications = 2,
  adminName = "System Admin",
  adminRole = "Administrator"
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '#' },
    { name: 'Agents', icon: <FaUsers />, path: '#' },
    { name: 'Analytics', icon: <FaChartBar />, path: '#' },
    { name: 'Settings', icon: <FaCog />, path: '#' }
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
            <a 
              key={item.name}
              href={item.path}
              className={`flex items-center px-4 h-full text-sm ${
                activeItem === item.name 
                  ? 'text-pink-500 border-b-2 border-pink-500' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </a>
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
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center text-sm font-medium">
              {adminName.split(' ').map(name => name[0]).join('')}
            </div>
            <div className="ml-2 hidden sm:block">
              <p className="text-sm font-medium">{adminName}</p>
              <p className="text-xs text-gray-500">{adminRole}</p>
            </div>
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
            <a 
              key={item.name}
              href={item.path}
              className={`flex items-center px-6 py-3 ${
                activeItem === item.name 
                  ? 'text-pink-500 bg-pink-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navbar;