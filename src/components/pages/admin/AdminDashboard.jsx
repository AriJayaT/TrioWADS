import React from 'react';
import DashboardLayout from '/src/components/layout/DashboardLayout';
import SystemOverview from '/src/components/dashboard/SystemOverview';
import AgentPerformance from '/src/components/dashboard/AgentPerformance';
import TicketDistribution from '/src/components/dashboard/TicketDistribution';

const AdminDashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <SystemOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="lg:col-span-2">
          <AgentPerformance />
        </div>
        <div>
          <TicketDistribution />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;