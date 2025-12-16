// frontend/src/components/reports/ReportViewer.js - ENHANCED VERSION
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Download,
  Filter,
  RefreshCw,
  Table,
  BarChart3,
  PieChart,
  TrendingUp,
  ArrowLeft,
  Eye,
  Calendar,
  User,
  Building,
  X,
  Grid,
  List,
  Zap
} from 'lucide-react';

// Import the new visualization components
import AdvancedChart from './AdvancedChart';
import DrillDownChart from './DrillDownChart';
import RealTimeChart from './RealTimeChart';
import ChartDashboard from './ChartDashboard';

const ReportViewer = ({ report, onBack }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [viewMode, setViewMode] = useState('table'); // 'table', 'chart', 'dashboard'
  const [chartType, setChartType] = useState('bar');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState('grid'); // 'grid', 'list'

  // Initialize filters from report definition
  useEffect(() => {
    if (report?.filters) {
      const initialFilters = report.filters.map(filter => ({
        ...filter,
        value: filter.defaultValue || ''
      }));
      setActiveFilters(initialFilters);
    }
  }, [report]);

  // Transform report data for charts
  const chartData = useMemo(() => {
    if (!reportData?.rows) return [];

    return reportData.rows.map(row => {
      const chartRow = { name: row[reportData.columns[0]?.fieldName] || 'Unknown' };
      
      reportData.columns.forEach((column, index) => {
        if (index > 0) { // Skip first column (used as name)
          chartRow[column.columnLabel || column.fieldName] = row[column.fieldName];
        }
      });
      
      return chartRow;
    });
  }, [reportData]);

  // Generate chart configurations based on report data
  const chartConfigs = useMemo(() => {
    if (!reportData?.columns) return [];

    const numericColumns = reportData.columns.filter(col => 
      col.dataType === 'CURRENCY' || col.dataType === 'NUMBER' || col.dataType === 'PERCENTAGE'
    );

    if (numericColumns.length === 0) return [];

    return [
      {
        id: 1,
        title: `${report?.name} - Overview`,
        type: "bar",
        data: chartData,
        config: {
          currency: numericColumns.some(col => col.dataType === 'CURRENCY'),
          percentage: numericColumns.some(col => col.dataType === 'PERCENTAGE'),
          bars: numericColumns.slice(0, 3).map(col => ({
            dataKey: col.columnLabel || col.fieldName,
            name: col.columnLabel
          }))
        }
      },
      {
        id: 2,
        title: `${report?.name} - Trends`,
        type: "line",
        data: chartData.slice(-12), // Last 12 data points for trends
        config: {
          currency: numericColumns.some(col => col.dataType === 'CURRENCY'),
          lines: numericColumns.slice(0, 2).map(col => ({
            dataKey: col.columnLabel || col.fieldName,
            name: col.columnLabel
          }))
        }
      },
      {
        id: 3,
        title: `${report?.name} - Distribution`,
        type: "pie",
        data: chartData.map(item => ({
          name: item.name,
          value: item[numericColumns[0]?.columnLabel] || 0
        })),
        config: {
          dataKey: "value",
          percentage: true
        }
      }
    ];
  }, [reportData, chartData, report]);

  // Enhanced executeReport function
  const executeReport = async () => {
    if (!report) return;
    
    setExecuting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const filters = activeFilters
        .filter(f => f.value && f.value !== '')
        .map(f => ({
          field: f.fieldName,
          value: f.value,
          operator: getDefaultOperator(f.filterType)
        }));

      // Convert report.id to number
      const numericReportId = parseInt(report.id, 10);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${numericReportId}/execute`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) throw new Error('Failed to execute report');
      
      const result = await response.json();
      setReportData(result.data);
      
    } catch (error) {
      console.error('Failed to execute report:', error);
      setError('Failed to execute report. Please try again.');
    } finally {
      setExecuting(false);
    }
  };

  const getDefaultOperator = (filterType) => {
    const operators = {
      text: 'contains',
      date: 'equals',
      select: 'equals',
      number: 'equals'
    };
    return operators[filterType] || 'equals';
  };

  const handleFilterChange = (index, value) => {
    setActiveFilters(prev => 
      prev.map((filter, i) => 
        i === index ? { ...filter, value } : filter
      )
    );
  };

  const handleExport = async (format) => {
    if (!report) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const filters = activeFilters
        .filter(f => f.value && f.value !== '')
        .map(f => ({
          field: f.fieldName,
          value: f.value,
          operator: getDefaultOperator(f.filterType)
        }));

      // Convert report.id to number
      const numericReportId = parseInt(report.id, 10);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${numericReportId}/export`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format, filters })
      });

      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${report.name}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setExportMenuOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export report.');
    }
  };

  const handleRefresh = () => {
    executeReport();
  };

  const handleDataPointClick = (clickData) => {
    console.log('Chart data point clicked:', clickData);
    // You can implement drill-down logic here
    // For example, set a state to show detailed view
  };

  const renderFilterInput = (filter, index) => {
    switch (filter.filterType) {
      case 'date':
        return (
          <input
            type="date"
            value={filter.value}
            onChange={(e) => handleFilterChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        );
      
      case 'select':
        return (
          <select
            value={filter.value}
            onChange={(e) => handleFilterChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={filter.value}
            onChange={(e) => handleFilterChange(index, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        );
      
      default: // text
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => handleFilterChange(index, e.target.value)}
            placeholder={`Filter by ${filter.filterLabel}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        );
    }
  };

  const formatCellValue = (value, column) => {
    if (value == null) return '-';
    
    switch (column.dataType) {
      case 'CURRENCY':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'SAR'
        }).format(value);
      
      case 'DATE':
        return new Date(value).toLocaleDateString();
      
      case 'PERCENTAGE':
        return `${value}%`;
      
      default:
        return value.toString();
    }
  };

  // Summary cards for key metrics
  const renderSummaryCards = () => {
    if (!reportData?.summary) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.entries(reportData.summary).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-600">
                {reportData.columns.find(col => col.fieldName === key)?.columnLabel || key}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Enhanced View Controls with Dashboard option
  const renderViewControls = () => (
    <div className="bg-white rounded-lg shadow mb-4">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setViewMode('table')}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            viewMode === 'table'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Table className="w-4 h-4 inline mr-2" />
          Table View
        </button>
        <button
          onClick={() => setViewMode('chart')}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            viewMode === 'chart'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Single Chart
        </button>
        <button
          onClick={() => setViewMode('dashboard')}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            viewMode === 'dashboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Grid className="w-4 h-4 inline mr-2" />
          Dashboard
        </button>
      </div>
    </div>
  );

  // Render different view modes
  const renderViewMode = () => {
    switch (viewMode) {
      case 'table':
        return renderTableView();
      case 'chart':
        return renderChartView();
      case 'dashboard':
        return renderDashboardView();
      default:
        return renderTableView();
    }
  };

  const renderTableView = () => (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Report Data ({reportData.totalRecords} records)
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {reportData.columns
                .filter(col => col.isVisible)
                .map((column) => (
                  <th
                    key={column.fieldName}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.columnLabel}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {reportData.columns
                    .filter(col => col.isVisible)
                    .map((column) => (
                      <td key={column.fieldName} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCellValue(row[column.fieldName], column)}
                      </td>
                    ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, reportData.rows.length)} of {reportData.rows.length} entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(Math.min(Math.ceil(reportData.rows.length / rowsPerPage) - 1, page + 1))}
            disabled={page >= Math.ceil(reportData.rows.length / rowsPerPage) - 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const renderChartView = () => (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Data Visualization</h3>
        <div className="flex items-center gap-4">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="composed">Composed Chart</option>
          </select>
        </div>
      </div>

      {/* Enhanced Chart */}
      <AdvancedChart
        data={chartData}
        title={`${report.name} - ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} View`}
        chartType={chartType}
        config={chartConfigs[0]?.config || {}}
        height={500}
        onDataPointClick={handleDataPointClick}
      />

      {/* Additional Chart Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700 text-sm">
          <Zap size={16} />
          <span>
            <strong>Interactive Features:</strong> Click on chart elements to explore data, 
            use mouse wheel to zoom, and hover for detailed values.
          </span>
        </div>
      </div>
    </div>
  );

  const renderDashboardView = () => (
    <ChartDashboard
      title={`${report.name} - Analytics Dashboard`}
      charts={chartConfigs}
    />
  );

  if (!report) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No report selected. Please select a report to view.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <button
                  onClick={onBack}
                  className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{report.name}</h1>
              </div>
              <p className="text-gray-600 mb-4">{report.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {report.category.toLowerCase()}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-300">
                  {report.dataSource}
                </span>
                {report.isPublic && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Public
                  </span>
                )}
                {viewMode === 'dashboard' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Dashboard View
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
              <button
                onClick={handleRefresh}
                disabled={executing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                
                {exportMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => handleExport('excel')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 last:rounded-b-lg"
                    >
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={executeReport}
                disabled={executing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters Panel */}
      {activeFilters.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeFilters.map((filter, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {filter.filterLabel}
                  </label>
                  {renderFilterInput(filter, index)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* View Controls */}
          {renderViewControls()}

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              {renderViewMode()}
            </div>
          </div>

          {/* Execution Info */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Generated on {new Date(reportData.generatedAt).toLocaleString()} • 
            Execution time: {reportData.executionTime}ms • 
            {reportData.totalRecords} records
          </div>
        </>
      )}

      {/* No Data State */}
      {!reportData && !loading && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-8 text-center">
            <Table className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data to Display</h3>
            <p className="text-gray-600 mb-4">Run the report to see the data</p>
            <button
              onClick={executeReport}
              disabled={executing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center mx-auto disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Report
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default ReportViewer;