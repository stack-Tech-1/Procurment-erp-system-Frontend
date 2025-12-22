// frontend/src/app/dashboard/procurement/RFQs/page.js - MOBILE OPTIMIZED
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Plus, FileText, Clock, CheckCircle, 
  XCircle, AlertTriangle, Edit, Trash2, Eye, Send,
  Calendar, DollarSign, Package, User, ArrowUp, ArrowDown,
  RefreshCw, MoreVertical, BarChart3
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs`;

// RFQ Status Options
const STATUS_OPTIONS = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  PUBLISHED: { label: 'Published', color: 'bg-blue-100 text-blue-800', icon: Send },
  UNDER_EVALUATION: { label: 'Under Evaluation', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  AWARDED: { label: 'Awarded', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const RFQPage = () => {
  const [RFQs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ 
    search: '', 
    status: '', 
    sortField: 'createdAt', 
    sortOrder: 'desc' 
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch RFQs from backend
  const fetchRFQs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn("Authentication token missing");
        return;
      }

      const response = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('RFQs data:', response.data);
      setRfqs(response.data);
      setPagination(prev => ({ ...prev, total: response.data.length }));

    } catch (error) {
      console.error("Failed to fetch RFQs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRFQs();
  }, [fetchRFQs]);

  // Filter and sort RFQs
  const filteredRFQs = RFQs.filter(rfq => {
    const matchesSearch = !filters.search || 
      rfq.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      rfq.rfqNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      rfq.projectName?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || rfq.status === filters.status;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (filters.sortField === 'dueDate') {
      return filters.sortOrder === 'asc' 
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    }
    if (filters.sortField === 'estimatedUnitPrice') {
      return filters.sortOrder === 'asc' 
        ? (a.estimatedUnitPrice || 0) - (b.estimatedUnitPrice || 0)
        : (b.estimatedUnitPrice || 0) - (a.estimatedUnitPrice || 0);
    }
    return 0;
  });

  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const renderSortArrow = (field) => {
    if (filters.sortField !== field) return null;
    return filters.sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    // Close mobile filters after selection
    if (showMobileFilters) {
      setShowMobileFilters(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = STATUS_OPTIONS[status] || STATUS_OPTIONS.DRAFT;
    const IconComponent = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        <span className="hidden sm:inline">{statusConfig.label}</span>
      </span>
    );
  };

  // Calculate statistics
  const stats = {
    total: RFQs.length,
    draft: RFQs.filter(r => r.status === 'DRAFT').length,
    published: RFQs.filter(r => r.status === 'PUBLISHED').length,
    underEvaluation: RFQs.filter(r => r.status === 'UNDER_EVALUATION').length,
    awarded: RFQs.filter(r => r.status === 'AWARDED').length,
    closed: RFQs.filter(r => r.status === 'CLOSED').length,
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
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search RFQs
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search RFQs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.keys(STATUS_OPTIONS).map(status => (
                  <option key={status} value={status}>
                    {STATUS_OPTIONS[status].label}
                  </option>
                ))}
              </select>
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

  // RFQ Card Component for Mobile
  const RFQCard = ({ rfq }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{rfq.rfqNumber}</h3>
          <p className="text-gray-600 text-xs">{rfq.title}</p>
        </div>
        <StatusBadge status={rfq.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div className="flex items-center text-gray-600">
          <Package className="w-3 h-3 mr-1" />
          <span className="truncate">{rfq.projectName || 'No Project'}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{rfq.dueDate ? new Date(rfq.dueDate).toLocaleDateString() : 'No Due Date'}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <DollarSign className="w-3 h-3 mr-1" />
          <span>{rfq.estimatedUnitPrice ? `$${rfq.estimatedUnitPrice.toLocaleString()}` : 'N/A'}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <FileText className="w-3 h-3 mr-1" />
          <span>{rfq.submissions?.length || 0} submissions</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Created {rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : 'Recently'}
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/procurement/rfq/${rfq.id}`}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Edit RFQ"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-red-600 hover:text-red-800"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
              Request for Quote (RFQs)
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Manage and track your procurement Quotes
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

           

            {/* New RFQ Button */}
            <Link 
              href="/dashboard/procurement/rfq/create"
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">New RFQ</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>

        {/* Statistics Cards - Mobile Optimized */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Draft</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Published</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.published}</p>
              </div>
              <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Evaluation</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{stats.underEvaluation}</p>
              </div>
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Awarded</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.awarded}</p>
              </div>
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Closed</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.closed}</p>
              </div>
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by RFQ Number, Title, or Project..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-48">
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_OPTIONS).map(status => (
                <option key={status} value={status}>
                  {STATUS_OPTIONS[status].label}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="text-gray-500 hover:text-gray-700 p-2"
            onClick={() => setFilters({ search: '', status: '', sortField: 'createdAt', sortOrder: 'desc' })}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* RFQ List - Mobile Cards / Desktop Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading RFQs...</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredRFQs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No RFQs found matching your criteria.</p>
                    <Link 
                      href="/dashboard/procurement/rfq/create"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Create your first RFQ
                    </Link>
                  </div>
                ) : (
                  filteredRFQs.map((rfq) => (
                    <RFQCard key={rfq.id} rfq={rfq} />
                  ))
                )}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['RFQ Number', 'Title', 'Project', 'Status', 'Due Date', 'Budget', 'Submissions', 'Actions'].map((header, index) => {
                        const field = ['rfqNumber', 'title', 'projectName', 'status', 'dueDate', 'estimatedUnitPrice', 'submissions', 'actions'][index];
                        return (
                          <th
                            key={field}
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => field !== 'actions' && field !== 'submissions' && handleSort(field)}
                          >
                            <div className="flex items-center">
                              {header}
                              {field !== 'actions' && field !== 'submissions' && renderSortArrow(field)}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRFQs.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p>No RFQs found matching your criteria.</p>
                          <Link 
                            href="/dashboard/procurement/rfq/create"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Create your first RFQ
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      filteredRFQs.map((rfq) => (
                        <tr key={rfq.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rfq.rfqNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="font-medium">{rfq.title}</div>
                            <div className="text-gray-500 text-xs mt-1 line-clamp-2">
                              {rfq.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {rfq.projectName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={rfq.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                              {rfq.dueDate ? new Date(rfq.dueDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                              {rfq.estimatedUnitPrice ? `$${rfq.estimatedUnitPrice.toLocaleString()}` : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {rfq.submissions?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                href={`/dashboard/procurement/rfq/${rfq.id}`}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                title="Edit RFQ"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete RFQ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredRFQs.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              Showing {filteredRFQs.length} of {RFQs.length} RFQs
            </p>
            <div className="flex space-x-2">
              <button 
                className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-sm"
                disabled={pagination.page <= 1}
              >
                Previous
              </button>
              <button 
                className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-sm"
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Mobile Filter Panel */}
        <MobileFilterPanel />
      </div>
    </ResponsiveLayout>
  );
};

export default RFQPage;