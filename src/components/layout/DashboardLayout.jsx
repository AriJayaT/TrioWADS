import React from 'react';
import Navbar from '../common/Navbar';

const DashboardLayout = ({ children, title = "Dashboard" }) => {
  // Add a handler to prevent default actions that might cause page refreshes
  const handleClick = (e) => {
    // Only prevent default for non-button elements to avoid blocking intentional navigation
    if (e.target.tagName !== 'BUTTON' && 
        e.target.tagName !== 'A' && 
        !e.target.closest('button') && 
        !e.target.closest('a')) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-pink-50" onClick={handleClick}>
      <Navbar activeItem={title} />
      
      <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;