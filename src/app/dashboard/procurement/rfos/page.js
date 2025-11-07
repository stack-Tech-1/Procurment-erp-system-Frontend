// src/app/dashboard/procurement/rfos/page.jsx
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Plus, FileText, Clock, CheckCircle, 
  XCircle, AlertTriangle, Edit, Trash2, Eye, Send,
  Calendar, DollarSign, Package, User, ArrowUp, ArrowDown
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs`;

// RFO Status Options
const STATUS_OPTIONS = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  PUBLISHED: { label: 'Published', color: 'bg-blue-100 text-blue-800', icon: Send },
  UNDER_EVALUATION: { label: 'Under Evaluation', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  AWARDED: { label: 'Awarded', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CLOSED: { label: 'Closed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const RFOPage = () => {
  const [rfos, setRfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ 
    search: '', 
    status: '', 
    sortField: 'createdAt', 
    sortOrder: 'desc' 
  });

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
      setRfos(response.data);
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
  const filteredRFQs = rfos.filter(rfq => {
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
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = STATUS_OPTIONS[status] || STATUS_OPTIONS.DRAFT;
    const IconComponent = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  // Calculate statistics
  const stats = {
    total: rfos.length,
    draft: rfos.filter(r => r.status === 'DRAFT').length,
    published: rfos.filter(r => r.status === 'PUBLISHED').length,
    underEvaluation: rfos.filter(r => r.status === 'UNDER_EVALUATION').length,
    awarded: rfos.filter(r => r.status === 'AWARDED').length,
    closed: rfos.filter(r => r.status === 'CLOSED').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Request for Offers (RFOs)</h1>
              <p className="text-gray-600">Manage and track your procurement requests</p>
            </div>
            <Link 
              href="/dashboard/procurement/rfos/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              New RFO
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total</span>
                <FileText className="text-blue-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Draft</span>
                <Clock className="text-yellow-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.draft}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Published</span>
                <Send className="text-blue-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.published}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Evaluation</span>
                <AlertTriangle className="text-orange-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.underEvaluation}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Awarded</span>
                <CheckCircle className="text-green-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.awarded}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Closed</span>
                <CheckCircle className="text-purple-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.closed}</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by RFO Number, Title, or Project..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="p-2 border border-gray-300 rounded-lg"
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

            <button 
              className="text-gray-500 hover:text-gray-700 p-2"
              onClick={() => setFilters({ search: '', status: '', sortField: 'createdAt', sortOrder: 'desc' })}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* RFO List Table */}
          <div className="bg-white rounded-lg shadow-xl overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading RFOs...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['RFO Number', 'Title', 'Project', 'Status', 'Due Date', 'Budget', 'Submissions', 'Actions'].map((header, index) => {
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
                        <p>No RFOs found matching your criteria.</p>
                        <Link 
                          href="/dashboard/procurement/rfos/create"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create your first RFO
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
                              href={`/dashboard/procurement/rfos/${rfq.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                              title="Edit RFO"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete RFO"
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
            )}
          </div>

          {/* Pagination */}
          {filteredRFQs.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Showing {filteredRFQs.length} of {rfos.length} RFOs
              </p>
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50"
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>
                <button 
                  className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50"
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RFOPage;