import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TicketVolumeTrend = ({ data = {}, timeRange = 'this-week' }) => {
    // Transform backend data to chart format
    const chartData = React.useMemo(() => {
        if (!data || typeof data !== 'object') {
            return [];
        }
        
        // For now, create a simple representation based on available data
        // This could be enhanced to show actual time-series data
        const statusKeys = Object.keys(data);
        if (statusKeys.length === 0) {
            return [];
        }
        
        // Create mock time series based on status data
        // In a real implementation, you'd want actual time-series data from the backend
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const totalTickets = Object.values(data).reduce((sum, count) => sum + count, 0);
        
        return days.map((day, index) => {
            // Distribute tickets across days with some variation
            const factor = 0.8 + (Math.sin(index) * 0.4);
            const newTickets = Math.round((data.open || 0) * factor / 7);
            const resolvedTickets = Math.round((data.resolved || 0) * factor / 7);
            
            return {
                name: day,
                New: newTickets,
                Resolved: resolvedTickets
            };
        });
    }, [data]);

    return (
        <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">Ticket Volume Trend</h2>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="New" fill="#f4a3c3" name="New Tickets" />
                        <Bar dataKey="Resolved" fill="#61c49b" name="Resolved" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No ticket volume data available for {timeRange}
                </div>
            )}
        </div>
    );
};

export default TicketVolumeTrend; 