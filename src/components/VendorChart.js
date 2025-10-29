"use client";
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Define colors for your chart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Helper function to format the data for the chart
const formatChartData = (apiData) => {
    if (!apiData) return [];

    // Transform API data (e.g., {GeneralContractor: 2, SubContractor: 3}) 
    // into an array of objects Recharts can use: 
    // [{ name: 'General Contractor', value: 2 }]
    return Object.entries(apiData).map(([type, count]) => ({ 
        name: type.replace(/([A-Z])/g, ' $1').trim(), // Clean up the name for display
        value: count
    })).filter(item => item.value > 0); // Only include types that have vendors
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white border border-gray-300 rounded shadow-md text-sm">
                <p className="font-bold text-gray-700">{payload[0].name}</p>
                <p className="text-gray-600">Vendors: {payload[0].value}</p>
                <p className="text-gray-600">Share: {payload[0].payload.percent}</p>
            </div>
        );
    }
    return null;
};

const VendorChart = ({ data }) => {
    const chartData = formatChartData(data);

    // Calculate percentage for the custom tooltip
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const chartDataWithPercent = chartData.map(item => ({
        ...item,
        percent: total > 0 ? `${(item.value / total * 100).toFixed(1)}%` : '0%',
    }));


    return (        
            <div className="bg-white p-6 rounded-xl shadow-lg h-full">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Vendor Type Breakdown</h3>
            
            {chartDataWithPercent.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No vendor type data available for the chart.</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie
                            data={chartDataWithPercent}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            labelLine={false}
                            // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {chartDataWithPercent.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default VendorChart; 