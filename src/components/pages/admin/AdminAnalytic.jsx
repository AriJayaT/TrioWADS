import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBolt, FaRegClock, FaStar, FaTicketAlt, FaCheckCircle, FaStopwatch, FaChartLine } from 'react-icons/fa';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/analytics/system-overview', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.data.success) {
          setMetrics(res.data);
        } else {
          setError(res.data.error || 'Failed to fetch metrics');
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setError(error.response?.data?.error || 'An error occurred while fetching metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [activeTab]);

  if (loading) {
    return (
      <DashboardLayout title="Analytics">
        <AnalyticsOverview activeTab={activeTab} setActiveTab={setActiveTab} metrics={metrics} />
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading metrics...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Analytics">
        <AnalyticsOverview activeTab={activeTab} setActiveTab={setActiveTab} metrics={metrics} />
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics">
      <AnalyticsOverview activeTab={activeTab} setActiveTab={setActiveTab} metrics={metrics} />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard 
                icon={<FaBolt className="text-2xl text-yellow-500" />}
                metricType="resolution" 
                value={metrics.overview?.avgResolutionTime || "—"} 
                label="Avg Resolution Time" 
                change={metrics.overview?.resolutionTrend || "—"} 
                changeType={metrics.overview?.resolutionTrendIsGood ? 'positive' : 'negative'} 
              />
              <MetricCard 
                icon={<FaRegClock className="text-2xl text-blue-500" />}
                metricType="response" 
                value={metrics.overview?.firstResponseTime || "—"} 
                label="First Response Time" 
                change={metrics.overview?.responseTrend || "—"} 
                changeType={metrics.overview?.responseTrendIsGood ? 'positive' : 'negative'} 
              />
              <MetricCard 
                icon={<FaStar className="text-2xl text-orange-500" />}
                metricType="satisfaction" 
                value={metrics.overview?.customerSatisfaction || "—"} 
                label="Customer Satisfaction" 
                change={metrics.overview?.satisfactionTrend || "—"} 
                changeType="positive"
              />
              <MetricCard 
                icon={<FaTicketAlt className="text-2xl text-purple-500" />}
                metricType="tickets" 
                value={metrics.overview?.totalTickets || "—"} 
                label="Total Tickets" 
                change={metrics.overview?.ticketsTrend || "—"} 
                changeType="positive"
              />
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
              <MetricCard 
                icon={<FaBolt className="text-2xl text-yellow-500" />}
                metricType="resolution" 
                value={metrics.resolution?.avgResolutionTime || "—"} 
                label="Avg Resolution Time" 
                change={metrics.resolution?.resolutionTrend || "—"} 
                changeType={metrics.resolution?.resolutionTrendIsGood ? 'positive' : 'negative'} 
              />
              <MetricCard 
                icon={<FaRegClock className="text-2xl text-blue-500" />}
                metricType="response" 
                value={metrics.resolution?.firstResponseTime || "—"} 
                label="First Response Time" 
                change={metrics.resolution?.responseTrend || "—"} 
                changeType={metrics.resolution?.responseTrendIsGood ? 'positive' : 'negative'} 
              />
              <MetricCard 
                icon={<FaCheckCircle className="text-2xl text-green-500" />}
                metricType="sla" 
                value={metrics.resolution?.withinSLA || "—"} 
                label="Within SLA" 
                change={metrics.resolution?.slaTrend || "—"} 
                changeType="positive"
              />
              <MetricCard 
                icon={<FaStopwatch className="text-2xl text-red-500" />}
                metricType="ticketCount" 
                value={metrics.resolution?.overdueTickets || "—"} 
                label="Tickets > 24h" 
                change={metrics.resolution?.overdueTrend || "—"} 
                changeType={metrics.resolution?.overdueTrendIsGood ? 'positive' : 'negative'} 
              />
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
              <MetricCard 
                icon={<FaStar className="text-2xl text-orange-500" />}
                metricType="satisfaction" 
                value={metrics.performance?.teamSatisfaction || "—"} 
                label="Team Satisfaction" 
                change={metrics.performance?.satisfactionTrend || "—"} 
                changeType="positive"
              />
              <MetricCard 
                icon={<FaRegClock className="text-2xl text-blue-500" />}
                metricType="response" 
                value={metrics.performance?.avgResponseTime || "—"} 
                label="Avg Response Time" 
                change={metrics.performance?.responseTrend || "—"} 
                changeType={metrics.performance?.responseTrendIsGood ? 'positive' : 'negative'} 
              />
              <MetricCard 
                icon={<FaBolt className="text-2xl text-yellow-500" />}
                metricType="resolution" 
                value={metrics.performance?.avgResolutionTime || "—"} 
                label="Avg Resolution Time" 
                change={metrics.performance?.resolutionTrend || "—"} 
                changeType={metrics.performance?.resolutionTrendIsGood ? 'positive' : 'negative'} 
              />
              <MetricCard 
                icon={<FaTicketAlt className="text-2xl text-purple-500" />}
                metricType="tickets" 
                value={metrics.performance?.totalTickets || "—"} 
                label="Total Tickets" 
                change={metrics.performance?.ticketsTrend || "—"} 
                changeType="positive"
              />
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
              <MetricCard 
                icon={<FaStar className="text-2xl text-orange-500" />}
                metricType="satisfaction" 
                value={metrics.satisfaction?.score || "—"} 
                label="Satisfaction Score" 
                change={metrics.satisfaction?.scoreTrend || "—"} 
                changeType="positive"
              />
              <MetricCard 
                icon={<FaChartLine className="text-2xl text-blue-500" />}
                metricType="tickets" 
                value={metrics.satisfaction?.totalResponses || "—"} 
                label="Total Responses" 
                change={metrics.satisfaction?.responsesTrend || "—"} 
                changeType="positive"
              />
              <MetricCard 
                icon={<FaRegClock className="text-2xl text-purple-500" />}
                metricType="response" 
                value={metrics.satisfaction?.responseRate || "—"} 
                label="Response Rate" 
                change={metrics.satisfaction?.rateTrend || "—"} 
                changeType="positive"
              />
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
