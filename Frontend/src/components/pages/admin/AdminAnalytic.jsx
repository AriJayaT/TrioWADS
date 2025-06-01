import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layout/DashboardLayout';
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
import { useSocket } from '../../../context/SocketContext';
import apiClient from '../../../services/api/apiClient';

const COMPONENT_NAME = 'AdminAnalytic';

const AdminAnalytic = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('this-week');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState({
        overview: {
            totalTickets: 0,
            avgResolutionTime: 0,
            avgResponseTime: 0,
            customerSatisfaction: 0,
            resolutionRate: 0,
            trends: {
                tickets: 0,
                resolutionTime: 0,
                responseTime: 0,
                satisfaction: 0,
                resolutionRate: 0
            }
        },
        ticketsByPriority: { high: 0, medium: 0, low: 0 },
        ticketsByCategory: [],
        ticketsByStatus: {},
        agentPerformance: [],
        satisfaction: {
            avgRating: 0,
            totalRatings: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        },
        recentActivity: []
    });

    const { socket, isConnected, subscribeToEvent, unsubscribeAllFromComponent } = useSocket();

    // Fetch analytics data
    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await apiClient.get('/tickets/stats', {
                params: { timeRange }
            });
            
            if (response.data.success) {
                setAnalyticsData(response.data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    useEffect(() => {
        // Subscribe to real-time updates
        const handleStatsUpdate = () => {
            fetchAnalyticsData();
        };

        subscribeToEvent('stats_updated', handleStatsUpdate, COMPONENT_NAME);
        subscribeToEvent('ticket_updated', handleStatsUpdate, COMPONENT_NAME);
        subscribeToEvent('new_ticket', handleStatsUpdate, COMPONENT_NAME);
        subscribeToEvent('ticket_resolved', handleStatsUpdate, COMPONENT_NAME);

        return () => {
            unsubscribeAllFromComponent(COMPONENT_NAME);
        };
    }, [subscribeToEvent, unsubscribeAllFromComponent, timeRange]);

    const formatMetric = (value, type = 'number') => {
        if (value === null || value === undefined || value === 0) return '0';
        
        switch (type) {
            case 'time':
                return `${value}m`;
            case 'percentage':
                return `${value}%`;
            case 'rating':
                return value.toFixed(1);
            case 'currency':
                return `$${value.toLocaleString()}`;
            default:
                return value.toLocaleString();
        }
    };

    const formatTrend = (value, type = 'percentage') => {
        if (value === null || value === undefined) return '0%';
        const sign = value >= 0 ? '+' : '';
        const suffix = type === 'percentage' ? '%' : '';
        return `${sign}${value.toFixed(1)}${suffix}`;
    };

    const getTrendColor = (value, isGoodWhenPositive = true) => {
        if (value === 0) return 'text-gray-500';
        const isPositive = value > 0;
        const isGood = isGoodWhenPositive ? isPositive : !isPositive;
        return isGood ? 'text-green-500' : 'text-red-500';
    };

    if (loading && !analyticsData.overview.totalTickets) {
        return (
            <DashboardLayout title="Analytics">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Analytics">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchAnalyticsData}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                        Retry
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Analytics">
            <AnalyticsOverview 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
            />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <MetricCard 
                                metricType="resolution" 
                                value={formatMetric(analyticsData.overview.avgResolutionTime, 'time')}
                                label="Avg Resolution Time" 
                                trend={formatTrend(analyticsData.overview.trends.resolutionTime)}
                                trendIsGood={analyticsData.overview.trends.resolutionTime <= 0} 
                            />
                            <MetricCard 
                                metricType="response" 
                                value={formatMetric(analyticsData.overview.avgResponseTime, 'time')}
                                label="First Response Time" 
                                trend={formatTrend(analyticsData.overview.trends.responseTime)}
                                trendIsGood={analyticsData.overview.trends.responseTime <= 0} 
                            />
                            <MetricCard 
                                metricType="satisfaction" 
                                value={formatMetric(analyticsData.overview.customerSatisfaction, 'rating')}
                                label="Customer Satisfaction" 
                                trend={formatTrend(analyticsData.overview.trends.satisfaction, 'number')}
                                trendIsGood={analyticsData.overview.trends.satisfaction >= 0}
                            />
                            <MetricCard 
                                metricType="tickets" 
                                value={formatMetric(analyticsData.overview.totalTickets)}
                                label="Total Tickets" 
                                trend={formatTrend(analyticsData.overview.trends.tickets)}
                                trendIsGood={analyticsData.overview.trends.tickets >= 0}
                            />
                        </div>
                        
                        {/* Charts */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/2">
                                <TicketVolumeTrend 
                                    timeRange={timeRange} 
                                    data={analyticsData.ticketsByStatus}
                                />
                            </div>
                            <div className="w-full md:w-1/2">
                                <TopAgents 
                                    data={analyticsData.agentPerformance.slice(0, 5)}
                                />
                            </div>
                        </div>
                    </>
                )}

                {/* Resolution Times Tab */}
                {activeTab === 'resolution' && (
                    <>
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <MetricCard 
                                metricType="resolution" 
                                value={formatMetric(analyticsData.overview.avgResolutionTime, 'time')}
                                label="Avg Resolution Time" 
                                trend={formatTrend(analyticsData.overview.trends.resolutionTime)}
                                trendIsGood={analyticsData.overview.trends.resolutionTime <= 0} 
                            />
                            <MetricCard 
                                metricType="response" 
                                value={formatMetric(analyticsData.overview.avgResponseTime, 'time')}
                                label="First Response Time" 
                                trend={formatTrend(analyticsData.overview.trends.responseTime)}
                                trendIsGood={analyticsData.overview.trends.responseTime <= 0} 
                            />
                            <MetricCard 
                                metricType="sla" 
                                value={formatMetric(analyticsData.overview.resolutionRate, 'percentage')}
                                label="Resolution Rate" 
                                trend={formatTrend(analyticsData.overview.trends.resolutionRate)}
                                trendIsGood={analyticsData.overview.trends.resolutionRate >= 0}
                            />
                            <MetricCard 
                                metricType="ticketCount" 
                                value={formatMetric(analyticsData.ticketsByStatus.open || 0)}
                                label="Open Tickets" 
                                trend={formatTrend(analyticsData.overview.trends.tickets)}
                                trendIsGood={analyticsData.overview.trends.tickets <= 0} 
                            />
                        </div>
                        
                        {/* Charts */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/2">
                                <ResolutionByPriority />
                            </div>
                            <div className="w-full md:w-1/2">
                                <ResolutionTimeTrendChart />
                            </div>
                        </div>
                    </>
                )}

                {/* Agent Performance Tab */}
                {activeTab === 'performance' && (
                    <>
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <MetricCard 
                                metricType="satisfaction" 
                                value={formatMetric(analyticsData.satisfaction.avgRating, 'rating')}
                                label="Team Satisfaction" 
                                trend={formatTrend(analyticsData.overview.trends.satisfaction, 'number')}
                                trendIsGood={analyticsData.overview.trends.satisfaction >= 0}
                            />
                            <MetricCard 
                                metricType="response" 
                                value={formatMetric(analyticsData.overview.avgResponseTime, 'time')}
                                label="Avg Response Time" 
                                trend={formatTrend(analyticsData.overview.trends.responseTime)}
                                trendIsGood={analyticsData.overview.trends.responseTime <= 0} 
                            />
                            <MetricCard 
                                metricType="resolution" 
                                value={formatMetric(analyticsData.overview.avgResolutionTime, 'time')}
                                label="Avg Resolution Time" 
                                trend={formatTrend(analyticsData.overview.trends.resolutionTime)}
                                trendIsGood={analyticsData.overview.trends.resolutionTime <= 0} 
                            />
                            <MetricCard 
                                metricType="tickets" 
                                value={formatMetric(analyticsData.overview.totalTickets)}
                                label="Total Tickets" 
                                trend={formatTrend(analyticsData.overview.trends.tickets)}
                                trendIsGood={analyticsData.overview.trends.tickets >= 0}
                            />
                        </div>
                        
                        {/* Agent Rankings */}
                        <div className="flex flex-col gap-6">
                            <AgentRanking 
                                data={analyticsData.agentPerformance}
                                timeRange={timeRange}
                            />
                            <div className="flex flex-col md:flex-row gap-6">   
                                <div className="w-full md:w-1/2">
                                    <FirstContactResolution 
                                        data={analyticsData.agentPerformance}
                                        timeRange={timeRange}
                                    />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <TicketReopenRate 
                                        timeRange={timeRange}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Satisfaction Tab */}
                {activeTab === 'satisfaction' && (
                    <>
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <MetricCard 
                                metricType="satisfaction" 
                                value={formatMetric(analyticsData.satisfaction.avgRating, 'rating')}
                                label="Satisfaction Score" 
                                trend={formatTrend(analyticsData.overview.trends.satisfaction, 'number')}
                                trendIsGood={analyticsData.overview.trends.satisfaction >= 0}
                            />
                            <MetricCard 
                                metricType="tickets" 
                                value={formatMetric(analyticsData.satisfaction.totalRatings)}
                                label="Total Responses" 
                                trend={formatTrend(12)} // Placeholder
                                trendIsGood={true}
                            />
                            <MetricCard 
                                metricType="response" 
                                value={formatMetric(analyticsData.satisfaction.totalRatings > 0 ? 90 : 0, 'percentage')}
                                label="Response Rate" 
                                trend={formatTrend(3)}
                                trendIsGood={true}
                            />
                        </div>
                        
                        {/* Feedback Charts */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/2">
                                <SatisfactionDistribution 
                                    data={analyticsData.satisfaction}
                                    timeRange={timeRange}
                                />
                            </div>
                            <div className="w-full md:w-1/2">
                                <RecentFeedback 
                                    data={analyticsData.recentActivity}
                                    timeRange={timeRange}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};
        
export default AdminAnalytic; 