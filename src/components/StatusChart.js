// src/components/StatusChart.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Data mapping for colors and names
const statusColors = {
    'APPROVED': '#10b981', // Green
    'NEW': '#f59e0b',      // Amber/Yellow
    'UNDER_REVIEW': '#3b82f6', // Blue
    'REJECTED': '#ef4444',  // Red
    'NEEDS_RENEWAL': '#eab308' // Dark Yellow
};

const formatStatusData = (apiData) => {
    if (!apiData) return [];
    
    // Sorts the data so 'APPROVED' is often on the left, but otherwise alphabetical
    const keys = Object.keys(apiData).sort((a, b) => {
        if (a === 'APPROVED') return -1;
        if (b === 'APPROVED') return 1;
        return a.localeCompare(b);
    });

    // Create the structured data array for Recharts
    return keys.map(status => ({
        name: status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' '),
        Count: apiData[status],
        fill: statusColors[status] || '#9ca3af' // Default to gray if status is missing
    })).filter(item => item.Count > 0); // Only show statuses with vendors
};


const StatusChart = ({ data }) => {
    const chartData = formatStatusData(data);

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50 rounded-lg p-8">
                No vendor status data available for the chart.
            </div>
        );
    }

    // Set a dynamic height based on the number of bars
    const chartHeight = Math.max(250, chartData.length * 50);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Vendor Status Summary</h3>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" tickFormatter={(value) => `${value} Vendors`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip 
                        formatter={(value, name, props) => [`${value} Vendors`, props.payload.name]}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <Bar dataKey="Count" fill="#8884d8" radius={[4, 4, 0, 0]} label={{ position: 'right', fill: '#6b7280' }}>
                         {
                            chartData.map((entry, index) => (
                                <Bar key={`bar-${index}`} fill={entry.fill} />
                            ))
                        }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StatusChart;