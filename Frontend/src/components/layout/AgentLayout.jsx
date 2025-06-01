import React from 'react';
import AgentNavbar from '../common/AgentNavbar';

const AgentLayout = ({ children, activeItem = 'Dashboard', title = 'YipHelp Agent' }) => (
  <div className="min-h-screen bg-pink-50">
    <AgentNavbar activeItem={activeItem} title={title} />
    <div className="h-16" /> {/* Spacer for fixed navbar */}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </main>
  </div>
);

export default AgentLayout; 