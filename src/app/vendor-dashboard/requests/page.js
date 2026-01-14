// frontend/src/app/vendor-dashboard/requests/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  Download, 
  Bell, 
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  RefreshCw
} from 'lucide-react';
import RequestCard from '@/components/requests/RequestCard';
import EmptyState from '@/components/requests/EmptyState';
import RequestFilters from '@/components/requests/RequestFilters';
import informationRequestService from '@/services/informationRequestService';
import { formatDate } from '@/utils/dateUtils';

export default function VendorRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: '',
    dateRange: null
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both requests and stats in parallel
      const [requestsResponse, statsResponse] = await Promise.all([
        informationRequestService.getVendorRequests(activeFilters),
        informationRequestService.getRequestStats()
      ]);
      
      if (requestsResponse.success) {
        setRequests(requestsResponse.data || []);
        setFilteredRequests(requestsResponse.data || []);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, activeFilters]);

  const applyFilters = () => {
    let filtered = [...requests];

    // Apply status filter
    if (activeFilters.status) {
      filtered = filtered.filter(req => req.status === activeFilters.status);
    }

    // Apply type filter
    if (activeFilters.type) {
      filtered = filtered.filter(req => req.requestType === activeFilters.type);
    }

    // Apply priority filter
    if (activeFilters.priority) {
      filtered = filtered.filter(req => req.priority === activeFilters.priority);
    }

    // Apply search filter
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      filtered = filtered.filter(req => 
        req.title?.toLowerCase().includes(searchTerm) ||
        req.description?.toLowerCase().includes(searchTerm) ||
        req.requestType?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply date range filter
    if (activeFilters.dateRange) {
      const { startDate, endDate } = activeFilters.dateRange;
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.createdAt);
        return reqDate >= new Date(startDate) && reqDate <= new Date(endDate);
      });
    }

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setActiveFilters({
      status: '',
      type: '',
      priority: '',
      search: '',
      dateRange: null
    });
  };

  const handleSearch = (searchTerm) => {
    setActiveFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleRefresh = () => {
    fetchRequests();
  };

  const getPendingCount = () => {
    return stats ? (stats.pending || 0) + (stats.overdue || 0) : 0;
  };

  const exportToCSV = () => {
    // Simple CSV export implementation
    const headers = ['Title', 'Type', 'Status', 'Priority', 'Due Date', 'Created Date', 'Response Date'];
    const csvData = filteredRequests.map(req => [
      req.title || 'N/A',
      req.requestType || 'N/A',
      req.status || 'N/A',
      req.priority || 'N/A',
      req.dueDate ? formatDate(req.dueDate, 'short') : 'N/A',
      req.createdAt ? formatDate(req.createdAt, 'short') : 'N/A',
      req.responseDate ? formatDate(req.responseDate, 'short') : 'Not responded'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `information-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Requests</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Information Requests
            </h1>
            <p className="text-gray-600">
              View and respond to requests from procurement for additional information, documents, or clarifications.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
            
            {getPendingCount() > 0 && (
              <div className="relative">
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <Bell size={18} />
                  <span className="font-medium">{getPendingCount()} pending</span>
                </div>
                {stats?.overdue > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.overdue}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
                </div>
                <FileText className="text-blue-500" size={20} />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                </div>
                <Clock className="text-yellow-500" size={20} />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.submitted || 0}</p>
                </div>
                <FileText className="text-blue-500" size={20} />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
                </div>
                <CheckCircle className="text-green-500" size={20} />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue || 0}</p>
                </div>
                <AlertCircle className="text-red-500" size={20} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        <RequestFilters
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onSearch={handleSearch}
          isVendorView={true}
        />
      </div>

      {/* Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredRequests.length} of {requests.length} requests
              {activeFilters.status && ` • Filtered by: ${activeFilters.status}`}
              {activeFilters.type && ` • ${activeFilters.type}`}
            </p>
            
            <div className="text-sm text-gray-500">
              Sorted by: <span className="font-medium">Due Date</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map(request => (
              <RequestCard 
                key={request.id || request.uuid} 
                request={request}
                isVendorView={true}
                onResponseSubmit={() => fetchRequests()} // Refresh after response
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          type={requests.length === 0 ? "no-requests" : "no-results"}
          description={
            requests.length === 0 
              ? "You don't have any information requests yet. Requests will appear here when procurement needs additional information."
              : "No requests match your current filters. Try adjusting your search criteria."
          }
          actionButton={
            activeFilters.status || activeFilters.type || activeFilters.search ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            ) : null
          }
        />
      )}

      {/* Help Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              About Information Requests
            </h3>
            <p className="text-gray-600 mb-3">
              Procurement may request additional information to complete vendor qualification, verify documents, 
              or clarify proposal details. These requests help ensure compliance and improve communication.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Common Request Types:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Updated certificates (ISO, Commercial Registration)</li>
                  <li>• Signed NDA agreements</li>
                  <li>• Brand authorization lists</li>
                  <li>• Project experience clarifications</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Response Tips:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Respond before the due date to avoid overdue status</li>
                  <li>• Upload supporting documents as PDF files</li>
                  <li>• Provide clear explanations in your response</li>
                  <li>• Check request status for approvals/rejections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}