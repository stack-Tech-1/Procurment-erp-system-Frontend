// frontend/src/components/reports/AdvancedChart.jsx
"use client";
import React, { useState, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter, ComposedChart
} from 'recharts';
import { 
  ZoomIn, ZoomOut, Filter, Download, RefreshCw, 
  BarChart3, TrendingUp, PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

const AdvancedChart = ({ 
  data = [], 
  chartType = 'bar',
  title = 'Chart Title',
  height = 400,
  onDataPointClick,
  config = {},
  isLoading = false
}) => {
  const [zoom, setZoom] = useState(1);
  const [filters, setFilters] = useState({});
  const [hoveredData, setHoveredData] = useState(null);

  // Color palettes
  const colorPalettes = {
    primary: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    pastel: ['#93C5FD', '#86EFAC', '#FDE68A', '#FCA5A5', '#C4B5FD'],
    vibrant: ['#1D4ED8', '#047857', '#B45309', '#B91C1C', '#7E22CE']
  };

  const colors = colorPalettes[config.palette] || colorPalettes.primary;

  // Enhanced tooltip formatter
  const formatTooltip = (value, name, props) => {
    if (config.currency) {
      return [`SAR ${value?.toLocaleString()}`, name];
    }
    if (config.percentage) {
      return [`${value}%`, name];
    }
    return [value, name];
  };

  // Handle data point click for drill-down
  const handleClick = useCallback((data, index) => {
    if (onDataPointClick && data) {
      onDataPointClick({
        dataPoint: data,
        index,
        chartType,
        filters
      });
    }
  }, [onDataPointClick, chartType, filters]);

  // Render different chart types
  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={config.xAxisKey || 'name'} 
              angle={config.xAxisAngle || 0}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={config.currency ? value => `SAR ${value}` : value => value}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={formatTooltip}
              contentStyle={{ 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {config.bars?.map((bar, index) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                onClick={handleClick}
                onMouseEnter={(data, index) => setHoveredData({ data, index })}
                onMouseLeave={() => setHoveredData(null)}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis tickFormatter={config.currency ? value => `SAR ${value}` : value => value} />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            {config.lines?.map((line, index) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                onClick={handleClick}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis tickFormatter={config.currency ? value => `SAR ${value}` : value => value} />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            {config.areas?.map((area, index) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
                onClick={handleClick}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120 * zoom}
              fill="#8884d8"
              dataKey={config.dataKey || 'value'}
              onClick={handleClick}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltip} />
            <Legend />
          </PieChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={config.xAxisKey || 'name'} />
            <YAxis yAxisId="left" tickFormatter={config.currency ? value => `SAR ${value}` : value => value} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            {config.bars?.map((bar, index) => (
              <Bar
                key={bar.dataKey}
                yAxisId="left"
                dataKey={bar.dataKey}
                name={bar.name}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
            {config.lines?.map((line, index) => (
              <Line
                key={line.dataKey}
                yAxisId="right"
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={colors[(index + (config.bars?.length || 0)) % colors.length]}
                strokeWidth={2}
              />
            ))}
          </ComposedChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Unsupported chart type: {chartType}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
          <p className="text-gray-500">There is no data to display for this chart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {hoveredData && (
            <p className="text-sm text-gray-600 mt-1">
              Hovering: {hoveredData.data.name} - {hoveredData.data.value}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Chart Controls */}
          <button
            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Reset Zoom"
          >
            <RefreshCw size={16} />
          </button>
          <button
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Download Chart"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div style={{ height: `${height}px`, transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {data.length} data points • {chartType} chart
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            Interactive
          </span>
          {onDataPointClick && (
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              Click to drill down
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedChart;