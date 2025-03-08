import React from 'react';
import Navbar from '../common/Navbar';

const DashboardLayout = ({ children, title = "Dashboard" }) => {
  return (
    <div className="flex flex-col h-screen bg-pink-50">
      <Navbar activeItem={title} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;