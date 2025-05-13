// src/components/pages/login&signup/RoleSelectionPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/logo.jpg";

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // Store the selected role in localStorage to use during signup
    localStorage.setItem('selectedRole', role);
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-r from-white to-pink-200 overflow-hidden flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full text-center relative z-10 hover:shadow-pink-300 transition-shadow duration-300">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full p-0.5 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 shadow-md">
          <div className="w-full h-full rounded-full overflow-hidden bg-white">
            <img src={logo} alt="JellyCat Logo" className="object-cover w-full h-full rounded-full" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to YipHelp</h2>
        <p className="text-gray-600 mb-8">Please select how you'd like to sign in 🌸</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Customer Option */}
          <div 
            onClick={() => handleRoleSelect('client')}
            className="bg-white p-6 rounded-xl border-2 border-pink-200 shadow-md hover:shadow-lg hover:border-pink-400 transition-all cursor-pointer flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">Customer</h3>
            <p className="text-gray-600 text-sm">Sign in for accessing tickets and customer support</p>
          </div>
          
          {/* Admin Option */}
          <div 
            onClick={() => handleRoleSelect('admin')}
            className="bg-white p-6 rounded-xl border-2 border-pink-200 shadow-md hover:shadow-lg hover:border-pink-400 transition-all cursor-pointer flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-black">Agent/Admin</h3>
            <p className="text-gray-600 text-sm">Access administrative tools and customer support</p>
          </div>
        </div>
        
        <p className="mt-10 text-xs text-gray-500">© 2025 JellyCat. All rights reserved.</p>
      </div>
    </div>
  );
};

export default RoleSelectionPage;