import React, { useState } from 'react';
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
    const [activeTab, setActiveTab] = useState('overview')

    return (
        <DashboardLayout title="Analytics">
            <AnalyticsOverview activeTab={activeTab} setActiveTab={setActiveTab}/>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <MetricCard 
                                metricType="resolution" 
                                value="1h 45m" 
                                label="Avg Resolution Time" 
                                trend="-12%" 
                                trendIsGood={false} 
                            />
                            <MetricCard 
                                metricType="response" 
                                value="8m" 
                                label="First Response Time" 
                                trend="-18%" 
                                trendIsGood={false} 
                            />
                            <MetricCard 
                                metricType="satisfaction" 
                                value="4.8" 
                                label="Customer Satisfaction" 
                                trend="+0.3" 
                            />
                            <MetricCard 
                                metricType="tickets" 
                                value="1,247" 
                                label="Total Tickets" 
                                trend="+5%" 
                            />
                        </div>
                        
                        {/* Charts */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/2">
                                <TicketVolumeTrend />
                            </div>
                            <div className="w-full md:w-1/2">
                                <TopAgents />
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
                                value="1h 45m" 
                                label="Avg Resolution Time" 
                                trend="-12%" 
                                trendIsGood={false} 
                            />
                            <MetricCard 
                                metricType="response" 
                                value="8m" 
                                label="First Response Time" 
                                trend="-18%" 
                                trendIsGood={false} 
                            />
                            <MetricCard 
                                metricType="sla" 
                                value="96.8%" 
                                label="Within SLA" 
                                trend="+2.4%" 
                            />
                            <MetricCard 
                                metricType="ticketCount" 
                                value="42" 
                                label="Tickets > 24h" 
                                trend="+5" 
                                trendIsGood={false} 
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
                                value="4.8" 
                                label="Team Satisfaction" 
                                trend="+0.2" 
                            />
                            <MetricCard 
                                metricType="response" 
                                value="7.5m" 
                                label="Avg Response Time" 
                                trend="-0.5m" 
                                trendIsGood={false} 
                            />
                            <MetricCard 
                                metricType="resolution" 
                                value="1h 40m" 
                                label="Avg Resolution Time" 
                                trend="-15m" 
                                trendIsGood={false} 
                            />
                            <MetricCard 
                                metricType="tickets" 
                                value="1225" 
                                label="Total Tickets" 
                                trend="+82" 
                            />
                        </div>
                        
                        {/* Agent Rankings */}
                        <div className="flex flex-col gap-6">
                            <AgentRanking />
                            <div className="flex flex-col md:flex-row gap-6">   
                                <div className="w-full md:w-1/2">
                                    <FirstContactResolution />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <TicketReopenRate />
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
                                value="4.8" 
                                label="Satisfaction Score" 
                                trend="+0.2" 
                            />
                            <MetricCard 
                                metricType="tickets" 
                                value="1247" 
                                label="Total Responses" 
                                trend="+12%" 
                            />
                            <MetricCard 
                                metricType="response" 
                                value="90%" 
                                label="Response Rate" 
                                trend="+3%" 
                            />
                        </div>
                        
                        {/* Feedback Charts */}
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/2">
                                <SatisfactionDistribution />
                            </div>
                            <div className="w-full md:w-1/2">
                                <RecentFeedback />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};
        
export default AdminAnalytic; 