// frontend/src/app/dashboard/admin/reports/page.js - MOBILE OPTIMIZED
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, FileText, BarChart3, 
  Eye, Edit, Trash2, Star, StarOff,
  ArrowLeft, Download, Play, Settings,
  Table, PieChart, TrendingUp, Menu, X, RefreshCw
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import ReportBuilder from '@/components/reports/ReportBuilder';
import ReportViewer from '@/components/reports/ReportViewer';
import ReportList from '@/components/reports/ReportList';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'builder', 'viewer'
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({ 
    search: '', 
    category: '', 
    favorite: false 
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch reports
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.favorite) params.append('favorite', 'true');

      const response = await fetch(`${API_BASE_URL}/reports?${params}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.data || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters.category, filters.favorite]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Close mobile filters after selection
    if (showMobileFilters) {
      setShowMobileFilters(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setCurrentView('viewer');
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setCurrentView('builder');
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setCurrentView('builder');
  };

  const handleSaveReport = async (reportData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (selectedReport) {
        // Update existing report
        await fetch(`${API_BASE_URL}/reports/${selectedReport.id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportData)
        });
      } else {
        // Create new report
        await fetch(`${API_BASE_URL}/reports`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportData)
        });
      }
      
      setCurrentView('list');
      setSelectedReport(null);
      fetchReports(); // Refresh the list
      
    } catch (error) {
      console.error('Failed to save report:', error);
      alert('Failed to save report. Please try again.');
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedReport(null);
    fetchReports(); // Refresh the list
  };

  const toggleFavorite = async (reportId, isCurrentlyFavorite) => {
    try {
      console.log('Toggling favorite for report ID:', reportId, 'Type:', typeof reportId);

      const token = localStorage.getItem('authToken');
      
      // Convert reportId to number if it's a string
      const numericReportId = parseInt(reportId, 10);
      console.log('Converted ID:', numericReportId, 'Type:', typeof numericReportId);
      
      await fetch(`${API_BASE_URL}/reports/${numericReportId}/favorite`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      fetchReports(); // Refresh to show updated favorite status
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Mobile Filter Panel Component
  const MobileFilterPanel = () => {
    if (!showMobileFilters) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button 
              onClick={() => setShowMobileFilters(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reports
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search reports..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="financial">Financial</option>
                <option value="vendor">Vendor Performance</option>
                <option value="procurement">Procurement</option>
                <option value="compliance">Compliance</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>

            {/* Favorite Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mobile-favorite"
                checked={filters.favorite}
                onChange={(e) => handleFilterChange('favorite', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="mobile-favorite" className="ml-2 text-sm text-gray-700">
                Show Favorites Only
              </label>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Report List with Mobile Support
  const EnhancedReportList = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Create, manage, and view procurement reports
          </p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden p-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Create Report Button */}
          <button
            onClick={handleCreateReport}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Create Report</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-48">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="financial">Financial</option>
            <option value="vendor">Vendor Performance</option>
            <option value="procurement">Procurement</option>
            <option value="compliance">Compliance</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>

        {/* Favorite Filter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="favorite"
            checked={filters.favorite}
            onChange={(e) => handleFilterChange('favorite', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="favorite" className="ml-2 text-sm text-gray-700">
            Favorites Only
          </label>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Quick Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Total Reports</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Favorites</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.isFavorite).length}
              </p>
            </div>
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">This Month</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {reports.filter(r => {
                  const reportDate = new Date(r.createdAt);
                  const now = new Date();
                  return reportDate.getMonth() === now.getMonth() && 
                         reportDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Categories</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">
                {new Set(reports.map(r => r.category)).size}
              </p>
            </div>
            <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Report List Component */}
      <ReportList
        reports={reports}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onEditReport={handleEditReport}
        onViewReport={handleViewReport}
        onCreateReport={handleCreateReport}
        onToggleFavorite={toggleFavorite}
      />

      {/* Mobile Filter Panel */}
      <MobileFilterPanel />
    </div>
  );

  // Navigation Header for Builder/Viewer
  const NavigationHeader = ({ title, subtitle }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleBackToList}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors p-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Back to Reports</span>
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>
        </div>
      </div>
      
      {currentView === 'viewer' && selectedReport && (
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => handleEditReport(selectedReport)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Edit className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'builder':
        return (
          <div className="space-y-6">
            <NavigationHeader 
              title={selectedReport ? "Edit Report" : "Create New Report"} 
              subtitle={selectedReport ? "Modify your report configuration" : "Build a custom procurement report"}
            />
            <ReportBuilder
              report={selectedReport}
              onSave={handleSaveReport}
              onCancel={handleBackToList}
            />
          </div>
        );
      
      case 'viewer':
        return (
          <div className="space-y-6">
            <NavigationHeader 
              title={selectedReport?.name || "Report Viewer"} 
              subtitle="View and analyze report data"
            />
            <ReportViewer
              report={selectedReport}
              onBack={handleBackToList}
            />
          </div>
        );
      
      default:
        return <EnhancedReportList />;
    }
  };

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full">
        {renderContent()}
      </div>
    </ResponsiveLayout>
  );
};

export default ReportsPage;