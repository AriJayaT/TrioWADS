import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', New: 156, Resolved: 142 },
    { name: 'Tue', New: 178, Resolved: 165 },
    { name: 'Wed', New: 192, Resolved: 180 },
    { name: 'Thu', New: 145, Resolved: 158 },
    { name: 'Fri', New: 167, Resolved: 159 },
    { name: 'Sat', New: 98, Resolved: 102 },
    { name: 'Sun', New: 87, Resolved: 89 },
];

const TicketVolumeTrend = () => (
    <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Ticket Volume Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="New" fill="#f4a3c3" name="New Tickets" />
                <Bar dataKey="Resolved" fill="#61c49b" name="Resolved" />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default TicketVolumeTrend 