import React from 'react';
import Navbar from '../common/Navbar';

const DashboardLayout = ({ children, title = "Dashboard" }) => {
  return (
    <div className="flex flex-col min-h-screen bg-pink-50 text-black">
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