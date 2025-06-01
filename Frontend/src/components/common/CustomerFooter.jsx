import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTiktok, FaInstagram } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const CustomerFooter = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleSupportClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/select-version');
    }
  };
  
  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">YipHelp Support</h3>
            <p className="text-gray-600 text-sm">We're here to help you with your cuddly companions.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/help-center" className="text-gray-600 text-sm hover:text-pink-500">Help Center</Link></li>
                <li>
                  <Link 
                    to={isAuthenticated ? "/customer/create-ticket" : "#"}
                    onClick={handleSupportClick}
                    className="text-gray-600 text-sm hover:text-pink-500"
                  >
                    Submit Ticket
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/help-center#knowledge" className="text-gray-600 text-sm hover:text-pink-500">Knowledge Base</Link></li>
                <li><Link to="/help-center#faq" className="text-gray-600 text-sm hover:text-pink-500">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Connect</h4>
              <div className="flex space-x-4 mt-2">
                <a href="https://www.tiktok.com/@yippaws/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-500">
                  <FaTiktok size={24} />
                </a>
                <a href="https://www.instagram.com/yippaws/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-500">
                  <FaInstagram size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs">
          © 2024 YipHelp. All rights reserved
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter; 