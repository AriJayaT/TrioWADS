import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '/src/components/layout/DashboardLayout';
import TicketVolumeTrend from '../../common/TicketVolumeTrend';
import AnalyticsOverview from '../../dashboard/AnalyticsOverview';
import TopAgents from '../../common/TopAgents';
import ResolutionByPriority from '../../common/ResolutionByPriority';
import ResolutionTimeTrendChart from '../../common/ResolutionTimeTrendChart';
import AgentRanking from '../../common/AgentRanking';
import FirstContactResolution from '../../common/FirstContactResolution';
import TicketReopenRate from '../../common/TicketReopenRate';
import SatisfactionDistribution from '../../common/SatisfactionDistribution';
import RecentFeedback from '../../common/RecentFeedback';
import MetricCard from '../../common/MetricCard';

const AdminAnalytic = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/analytics/system-overview', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMetrics(res.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
  }, [activeTab]);

  return (
    <DashboardLayout title="Analytics">
      <AnalyticsOverview activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard metricType="resolution" value={metrics.overview?.avgResolutionTime || "—"} label="Avg Resolution Time" trend={metrics.overview?.resolutionTrend || "—"} trendIsGood={metrics.overview?.resolutionTrendIsGood} />
              <MetricCard metricType="response" value={metrics.overview?.firstResponseTime || "—"} label="First Response Time" trend={metrics.overview?.responseTrend || "—"} trendIsGood={metrics.overview?.responseTrendIsGood} />
              <MetricCard metricType="satisfaction" value={metrics.overview?.customerSatisfaction || "—"} label="Customer Satisfaction" trend={metrics.overview?.satisfactionTrend || "—"} />
              <MetricCard metricType="tickets" value={metrics.overview?.totalTickets || "—"} label="Total Tickets" trend={metrics.overview?.ticketsTrend || "—"} />
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2"><TicketVolumeTrend /></div>
              <div className="w-full md:w-1/2"><TopAgents /></div>
            </div>
          </>
        )}

        {/* Resolution Times Tab */}
        {activeTab === 'resolution' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard metricType="resolution" value={metrics.resolution?.avgResolutionTime || "—"} label="Avg Resolution Time" trend={metrics.resolution?.resolutionTrend || "—"} trendIsGood={metrics.resolution?.resolutionTrendIsGood} />
              <MetricCard metricType="response" value={metrics.resolution?.firstResponseTime || "—"} label="First Response Time" trend={metrics.resolution?.responseTrend || "—"} trendIsGood={metrics.resolution?.responseTrendIsGood} />
              <MetricCard metricType="sla" value={metrics.resolution?.withinSLA || "—"} label="Within SLA" trend={metrics.resolution?.slaTrend || "—"} />
              <MetricCard metricType="ticketCount" value={metrics.resolution?.overdueTickets || "—"} label="Tickets > 24h" trend={metrics.resolution?.overdueTrend || "—"} trendIsGood={metrics.resolution?.overdueTrendIsGood} />
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2"><ResolutionByPriority /></div>
              <div className="w-full md:w-1/2"><ResolutionTimeTrendChart /></div>
            </div>
          </>
        )}

        {/* Agent Performance Tab */}
        {activeTab === 'performance' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard metricType="satisfaction" value={metrics.performance?.teamSatisfaction || "—"} label="Team Satisfaction" trend={metrics.performance?.satisfactionTrend || "—"} />
              <MetricCard metricType="response" value={metrics.performance?.avgResponseTime || "—"} label="Avg Response Time" trend={metrics.performance?.responseTrend || "—"} trendIsGood={metrics.performance?.responseTrendIsGood} />
              <MetricCard metricType="resolution" value={metrics.performance?.avgResolutionTime || "—"} label="Avg Resolution Time" trend={metrics.performance?.resolutionTrend || "—"} trendIsGood={metrics.performance?.resolutionTrendIsGood} />
              <MetricCard metricType="tickets" value={metrics.performance?.totalTickets || "—"} label="Total Tickets" trend={metrics.performance?.ticketsTrend || "—"} />
            </div>
            <div className="flex flex-col gap-6">
              <AgentRanking />
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2"><FirstContactResolution /></div>
                <div className="w-full md:w-1/2"><TicketReopenRate /></div>
              </div>
            </div>
          </>
        )}

        {/* Satisfaction Tab */}
        {activeTab === 'satisfaction' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard metricType="satisfaction" value={metrics.satisfaction?.score || "—"} label="Satisfaction Score" trend={metrics.satisfaction?.scoreTrend || "—"} />
              <MetricCard metricType="tickets" value={metrics.satisfaction?.totalResponses || "—"} label="Total Responses" trend={metrics.satisfaction?.responsesTrend || "—"} />
              <MetricCard metricType="response" value={metrics.satisfaction?.responseRate || "—"} label="Response Rate" trend={metrics.satisfaction?.rateTrend || "—"} />
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2"><SatisfactionDistribution /></div>
              <div className="w-full md:w-1/2"><RecentFeedback /></div>
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytic;
