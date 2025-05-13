// src/components/pages/client/ClientDashboard.jsx
import React from 'react';
import DashboardLayout from '/src/components/layout/DashboardLayout';

const ClientDashboard = () => {
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "Client", "role": "client"}');
  
  return (
    <DashboardLayout title="Client Dashboard">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user.name}!</h1>
        <p className="text-gray-600">This is your client dashboard where you can manage your JellyCat items.</p>
        
        <div className="mt-8 p-4 bg-pink-50 rounded-lg border border-pink-200">
          <h2 className="text-lg font-semibold mb-2">Your Recent Tickets</h2>
          <p className="text-gray-600">You don't have any tickets yet. Need help with something?</p>
          <button className="mt-4 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors">
            Create a Ticket
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;