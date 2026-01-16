// src/components/VendorChart.jsx - UPDATED WITH i18n
"use client";
import React from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CustomTooltip = ({ active, payload }) => {
    const { t } = useTranslation(); // ADD THIS HOOK
    
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white border border-gray-300 rounded shadow-md text-sm">
                <p className="font-bold text-gray-700">{payload[0].name}</p>
                <p className="text-gray-600">{t('vendors')}: {payload[0].value}</p>
                <p className="text-gray-600">{t('share')}: {payload[0].payload.percent}</p>
            </div>
        );
    }
    return null;
};

const VendorChart = ({ data }) => {
    const { t } = useTranslation(); // ADD THIS HOOK

    const formatChartData = (apiData) => {
        if (!apiData) return [];

        const typeTranslations = {
            'GeneralContractor': t('generalContractor'),
            'SubContractor': t('subContractor'),
            'Supplier': t('supplier')
        };

        return Object.entries(apiData).map(([type, count]) => ({ 
            name: typeTranslations[type] || type.replace(/([A-Z])/g, ' $1').trim(),
            value: count
        })).filter(item => item.value > 0);
    };

    const chartData = formatChartData(data);

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const chartDataWithPercent = chartData.map(item => ({
        ...item,
        percent: total > 0 ? `${(item.value / total * 100).toFixed(1)}%` : '0%',
    }));

    return (        
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">{t('vendorTypeBreakdown')}</h3>
            
            {chartDataWithPercent.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">{t('noVendorTypeData')}</p>
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