import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layout/DashboardLayout';
import TicketVolumeTrend from '../../common/TicketVolumeTrend';
import AnalyticsOverview from '../../dashboard/AnalyticsOverview';
import TopAgents from '../../common/TopAgents';
import ResolutionByPriority from '../../common/ResolutionByPriority';
import ResolutionTimeTrendChart from '../../common/ResolutionTimeTrendChart';
import AgentRanking from '../../common/AgentRanking';
import FirstContactResolution from '../../common/FirstContactResolution';
import SatisfactionDistribution from '../../common/SatisfactionDistribution';
import RecentFeedback from '../../common/RecentFeedback';
import MetricCard from '../../common/MetricCard';
import apiClient from '../../../services/api/apiClient';

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
        recentActivity: [],
        resolutionByPriority: [],
        resolutionTimeTrend: []
    });

    // Fetch analytics data
    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log(`[AdminAnalytic] Fetching analytics data for timeRange: ${timeRange}`);
            
            const response = await apiClient.get('/tickets/stats', {
                params: { 
                    timeRange,
                    skipSocket: 'true'  // Prevent socket emissions to avoid feedback loop
                }
            });
            
            if (response.data.success) {
                console.log(`[AdminAnalytic] Successfully fetched analytics data`);
                setAnalyticsData(response.data.stats);
            } else {
                console.error(`[AdminAnalytic] API returned success: false`);
                setError('Failed to load analytics data - invalid response');
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            
            // More specific error messages
            if (err.response) {
                const status = err.response.status;
                const message = err.response.data?.message || err.response.data?.error || 'Unknown server error';
                setError(`Server error (${status}): ${message}`);
            } else if (err.request) {
                setError('Network error: Unable to connect to server');
            } else {
                setError(`Request error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Only fetch data when timeRange changes or component mounts
    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    // Fetch data when switching tabs (activeTab changes)
    useEffect(() => {
        // Only fetch if we already have some data loaded (not first mount)
        if (analyticsData.overview.totalTickets > 0 || !loading) {
            console.log(`[AdminAnalytic] Tab switched to: ${activeTab}, fetching fresh data`);
            fetchAnalyticsData();
        }
    }, [activeTab]);

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
                analyticsData={analyticsData}
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
                                label={timeRange === 'today' ? "Today's Avg Resolution Time" : "Avg Resolution Time"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.resolutionTime <= 0} 
                            />
                            <MetricCard 
                                metricType="response" 
                                value={formatMetric(
                                    analyticsData.agentPerformance.length > 0 
                                        ? Math.round(analyticsData.agentPerformance.reduce((sum, agent) => sum + (agent.avgResponseTime || 0), 0) / analyticsData.agentPerformance.length)
                                        : 0, 
                                    'time'
                                )}
                                label={timeRange === 'today' ? "Today's Avg Response Time" : "Avg Response Time"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.responseTime <= 0} 
                            />
                            <MetricCard 
                                metricType="satisfaction" 
                                value={formatMetric(analyticsData.overview.customerSatisfaction, 'rating')}
                                label={timeRange === 'today' ? "Today's Customer Satisfaction" : "Customer Satisfaction"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.satisfaction >= 0}
                            />
                            <MetricCard 
                                metricType="tickets" 
                                value={formatMetric(analyticsData.overview.totalTickets)}
                                label={timeRange === 'today' ? "Today's Total Tickets" : "Total Tickets"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.tickets >= 0}
                            />
                        </div>
                        
                        {/* Charts */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/2">
                                <TicketVolumeTrend 
                                    timeRange={timeRange} 
                                    data={analyticsData.ticketsByStatus}
                                    todayData={analyticsData.todayData}
                                    weekData={analyticsData.weekData}
                                    monthData={analyticsData.monthData}
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
                                label={timeRange === 'today' ? "Today's Avg Resolution Time" : "Avg Resolution Time"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.resolutionTime <= 0} 
                            />
                            <MetricCard 
                                metricType="response" 
                                value={formatMetric(analyticsData.overview.avgResponseTime, 'time')}
                                label={timeRange === 'today' ? "Today's First Response Time" : "First Response Time"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.responseTime <= 0} 
                            />
                            <MetricCard 
                                metricType="sla" 
                                value={formatMetric(analyticsData.overview.resolutionRate, 'percentage')}
                                label={timeRange === 'today' ? "Today's Resolution Rate" : "Resolution Rate"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.resolutionRate >= 0}
                            />
                            <MetricCard 
                                metricType="ticketCount" 
                                value={formatMetric(analyticsData.ticketsByStatus.open || 0)}
                                label={timeRange === 'today' ? "Open Tickets Today" : "Open Tickets"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.tickets <= 0} 
                            />
                        </div>
                        
                        {/* Charts */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/2">
                                <ResolutionByPriority 
                                    data={analyticsData.resolutionByPriority}
                                    timeRange={timeRange}
                                />
                            </div>
                            <div className="w-full md:w-1/2">
                                <ResolutionTimeTrendChart 
                                    data={analyticsData.resolutionTimeTrend}
                                    timeRange={timeRange}
                                />
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
                                label={timeRange === 'today' ? "Today's Team Satisfaction" : "Team Satisfaction"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.satisfaction >= 0}
                            />
                            <MetricCard 
                                metricType="response" 
                                value={formatMetric(
                                    analyticsData.agentPerformance.length > 0 
                                        ? Math.round(analyticsData.agentPerformance.reduce((sum, agent) => sum + (agent.avgResponseTime || 0), 0) / analyticsData.agentPerformance.length)
                                        : 0, 
                                    'time'
                                )}
                                label={timeRange === 'today' ? "Today's Avg Response Time" : "Avg Response Time"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.responseTime <= 0} 
                            />
                            <MetricCard 
                                metricType="resolution" 
                                value={formatMetric(analyticsData.overview.avgResolutionTime, 'time')}
                                label={timeRange === 'today' ? "Today's Avg Resolution Time" : "Avg Resolution Time"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.resolutionTime <= 0} 
                            />
                            <MetricCard 
                                metricType="tickets" 
                                value={formatMetric(analyticsData.overview.totalTickets)}
                                label={timeRange === 'today' ? "Today's Total Tickets" : "Total Tickets"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.tickets >= 0}
                            />
                        </div>
                        
                        {/* Agent Rankings */}
                        <div className="flex flex-col gap-6">
                            <AgentRanking 
                                data={analyticsData.agentPerformance}
                                timeRange={timeRange}
                            />
                            <div className="w-full max-w-2xl mx-auto">   
                                <FirstContactResolution 
                                    data={analyticsData.agentPerformance}
                                    timeRange={timeRange}
                                />
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
                                label={timeRange === 'today' ? "Today's Satisfaction Score" : "Satisfaction Score"}
                                trend={null}
                                trendIsGood={analyticsData.overview.trends.satisfaction >= 0}
                            />
                            <MetricCard 
                                metricType="tickets" 
                                value={formatMetric(analyticsData.satisfaction.totalRatings)}
                                label={timeRange === 'today' ? "Today's Total Responses" : "Total Responses"}
                                trend={null}
                                trendIsGood={true}
                            />
                            <MetricCard 
                                metricType="response" 
                                value={formatMetric(analyticsData.satisfaction.totalRatings > 0 ? Math.round((analyticsData.satisfaction.totalRatings / analyticsData.overview.totalTickets) * 100) : 0, 'percentage')}
                                label={timeRange === 'today' ? "Today's Response Rate" : "Response Rate"}
                                trend={null}
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
                                    recentRatings={analyticsData.recentRatings}
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