// frontend/src/components/reports/ChartDashboard.jsx
"use client";
import React, { useState } from 'react';
import AdvancedChart from './AdvancedChart';
import DrillDownChart from './DrillDownChart';
import RealTimeChart from './RealTimeChart';
import { Grid, List, Settings, Download, Share2 } from 'lucide-react';

const ChartDashboard = ({ charts = [], title = "Analytics Dashboard" }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCharts, setSelectedCharts] = useState([]);

  // Sample chart configurations
  const defaultCharts = [
    {
      id: 1,
      title: "Spend by Category",
      type: "bar",
      data: [
        { name: "Construction", value: 4500000 },
        { name: "Materials", value: 3200000 },
        { name: "Services", value: 1800000 },
        { name: "Equipment", value: 1200000 }
      ],
      config: {
        currency: true,
        bars: [{ dataKey: "value", name: "Spend" }]
      }
    },
    {
      id: 2,
      title: "Monthly Spend Trend",
      type: "line",
      data: [
        { name: "Jan", spend: 1200000, budget: 1500000 },
        { name: "Feb", spend: 1800000, budget: 1500000 },
        { name: "Mar", spend: 2200000, budget: 1500000 },
        { name: "Apr", spend: 1900000, budget: 1500000 }
      ],
      config: {
        currency: true,
        lines: [
          { dataKey: "spend", name: "Actual Spend" },
          { dataKey: "budget", name: "Budget" }
        ]
      }
    },
    {
      id: 3,
      title: "Vendor Distribution",
      type: "pie",
      data: [
        { name: "Class A", value: 35 },
        { name: "Class B", value: 45 },
        { name: "Class C", value: 15 },
        { name: "Class D", value: 5 }
      ],
      config: {
        percentage: true,
        dataKey: "value"
      }
    }
  ];

  const displayCharts = charts.length > 0 ? charts : defaultCharts;

  const toggleChartSelection = (chartId) => {
    setSelectedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    );
  };

  const exportSelectedCharts = () => {
    if (selectedCharts.length === 0) return;
    
    const chartsToExport = displayCharts.filter(chart => 
      selectedCharts.includes(chart.id)
    );
    
    // In a real implementation, this would generate a PDF or export data
    console.log('Exporting charts:', chartsToExport);
    alert(`Exporting ${chartsToExport.length} charts...`);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-1">
            Interactive analytics and visualization dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List size={18} />
            </button>
          </div>

          {/* Actions */}
          {selectedCharts.length > 0 && (
            <button
              onClick={exportSelectedCharts}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Export ({selectedCharts.length})
            </button>
          )}
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>

      {/* Charts Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          : "space-y-6"
      }>
        {displayCharts.map((chart) => (
          <div 
            key={chart.id}
            className={
              viewMode === 'grid' 
                ? "h-full"
                : "max-w-4xl"
            }
          >
            <div className={`relative ${
              selectedCharts.includes(chart.id) 
                ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' 
                : ''
            }`}>
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedCharts.includes(chart.id)}
                  onChange={() => toggleChartSelection(chart.id)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
              </div>

              {/* Chart Component */}
              {chart.realTime ? (
                <RealTimeChart
                  dataUrl={chart.dataUrl}
                  title={chart.title}
                  config={chart.config}
                  refreshInterval={chart.refreshInterval}
                />
              ) : chart.drillDown ? (
                <DrillDownChart
                  data={chart.data}
                  title={chart.title}
                  initialConfig={chart.config}
                />
              ) : (
                <AdvancedChart
                  data={chart.data}
                  title={chart.title}
                  chartType={chart.type}
                  config={chart.config}
                  height={viewMode === 'grid' ? 300 : 400}
                  onDataPointClick={chart.onDataPointClick}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayCharts.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Settings className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Charts Configured</h3>
          <p className="text-gray-500 mb-6">
            Add charts to your dashboard to start visualizing data.
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add First Chart
          </button>
        </div>
      )}
    </div>
  );
};

export default ChartDashboard;