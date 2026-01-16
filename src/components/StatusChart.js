// src/components/StatusChart.jsx - UPDATED WITH i18n
"use client";
import React from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Data mapping for colors and names
const statusColors = {
    'APPROVED': '#10b981', // Green
    'NEW': '#f59e0b',      // Amber/Yellow
    'UNDER_REVIEW': '#3b82f6', // Blue
    'REJECTED': '#ef4444',  // Red
    'NEEDS_RENEWAL': '#eab308' // Dark Yellow
};

const StatusChart = ({ data }) => {
    const { t } = useTranslation(); // ADD THIS HOOK

    const formatStatusData = (apiData) => {
        if (!apiData) return [];
        
        const statusTranslations = {
            'APPROVED': t('approved'),
            'NEW': t('new'),
            'UNDER_REVIEW': t('underReview'),
            'REJECTED': t('rejected'),
            'NEEDS_RENEWAL': t('needsRenewal')
        };

        const keys = Object.keys(apiData).sort((a, b) => {
            if (a === 'APPROVED') return -1;
            if (b === 'APPROVED') return 1;
            return a.localeCompare(b);
        });

        return keys.map(status => ({
            name: statusTranslations[status] || status.replace(/_/g, ' '),
            Count: apiData[status],
            fill: statusColors[status] || '#9ca3af'
        })).filter(item => item.Count > 0);
    };

    const chartData = formatStatusData(data);

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50 rounded-lg p-8">
                {t('noVendorStatusData')}
            </div>
        );
    }

    const chartHeight = Math.max(250, chartData.length * 50);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">{t('vendorStatusSummary')}</h3>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                        type="number" 
                        tickFormatter={(value) => t('vendorsCount', { count: value })}
                    />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip 
                        formatter={(value) => [t('vendorsCount', { count: value }), '']}
                        labelFormatter={(label) => label}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                    <Bar dataKey="Count" radius={[4, 4, 0, 0]}>
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