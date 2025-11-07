// src/app/dashboard/procurement/ipcs/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Plus, FileText, Clock, CheckCircle, 
  XCircle, AlertTriangle, Edit, Trash2, Eye, DollarSign,
  Calendar, User, Building, ArrowUp, ArrowDown, TrendingUp,
  Download, Send, ThumbsUp, ThumbsDown
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const IPCsPage = () => {
  const [ipcs, setIpc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    search: '', 
    status: '', 
    sortField: 'createdAt', 
    sortOrder: 'desc' 
  });

  // Fetch IPCs
  const fetchIPCs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/ipcs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });

      console.log('IPCs data:', response.data);
      setIpc(response.data);
    } catch (error) {
      console.error("Failed to fetch IPCs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPCs();
  }, [filters.status]);

  // Status configuration
  const getStatusConfig = (status) => {
    const statusConfigs = {
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', label: 'Submitted', icon: Clock },
      PROCUREMENT_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review', icon: AlertTriangle },
      TECHNICAL_APPROVED: { color: 'bg-green-100 text-green-800', label: 'Technical Approved', icon: CheckCircle },
      FINANCE_REVIEW: { color: 'bg-purple-100 text-purple-800', label: 'Finance Review', icon: TrendingUp },
      APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: ThumbsUp },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Paid', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: ThumbsDown }
    };
    return statusConfigs[status] || statusConfigs.SUBMITTED;
  };

  // Calculate statistics
  const stats = {
    total: ipcs.length,
    submitted: ipcs.filter(i => i.status === 'SUBMITTED').length,
    underReview: ipcs.filter(i => i.status === 'PROCUREMENT_REVIEW' || i.status === 'FINANCE_REVIEW').length,
    approved: ipcs.filter(i => i.status === 'APPROVED' || i.status === 'TECHNICAL_APPROVED').length,
    paid: ipcs.filter(i => i.status === 'PAID').length,
    totalValue: ipcs.reduce((sum, ipc) => sum + (ipc.currentValue || 0), 0)
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Update IPC status
  const updateIPCStatus = async (ipcId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));

      await axios.patch(
        `${API_BASE_URL}/ipcs/${ipcId}/status`,
        { 
          status: newStatus,
          reviewedById: user.id 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchIPCs();
      alert(`IPC status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update IPC status:', error);
      alert('Failed to update IPC status');
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = getStatusConfig(status);
    const IconComponent = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getNextStatusAction = (currentStatus) => {
    const workflow = {
      SUBMITTED: { action: 'Start Review', nextStatus: 'PROCUREMENT_REVIEW', color: 'bg-yellow-600 hover:bg-yellow-700' },
      PROCUREMENT_REVIEW: { action: 'Technical Approve', nextStatus: 'TECHNICAL_APPROVED', color: 'bg-green-600 hover:bg-green-700' },
      TECHNICAL_APPROVED: { action: 'Send to Finance', nextStatus: 'FINANCE_REVIEW', color: 'bg-purple-600 hover:bg-purple-700' },
      FINANCE_REVIEW: { action: 'Approve', nextStatus: 'APPROVED', color: 'bg-green-600 hover:bg-green-700' },
      APPROVED: { action: 'Mark as Paid', nextStatus: 'PAID', color: 'bg-blue-600 hover:bg-blue-700' }
    };
    return workflow[currentStatus];
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
              <h1 className="text-2xl font-bold text-gray-800">Interim Payment Certificates</h1>
              <p className="text-gray-600">Manage and track payment certificates</p>
            </div>
            <Link 
              href="/dashboard/procurement/ipcs/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              New IPC
            </Link>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total IPCs</span>
                <FileText className="text-blue-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Submitted</span>
                <Clock className="text-blue-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.submitted}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Under Review</span>
                <AlertTriangle className="text-yellow-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.underReview}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Approved</span>
                <ThumbsUp className="text-green-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Paid</span>
                <CheckCircle className="text-green-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{stats.paid}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Value</span>
                <DollarSign className="text-purple-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">${(stats.totalValue / 1000).toFixed(0)}K</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by IPC Number, Project, or Vendor..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <select
              className="p-2 border border-gray-300 rounded-lg"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="PROCUREMENT_REVIEW">Under Review</option>
              <option value="TECHNICAL_APPROVED">Technical Approved</option>
              <option value="FINANCE_REVIEW">Finance Review</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <button 
              className="text-gray-500 hover:text-gray-700 p-2"
              onClick={() => setFilters({ search: '', status: '', sortField: 'createdAt', sortOrder: 'desc' })}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* IPCs Table */}
          <div className="bg-white rounded-lg shadow-xl overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading IPCs...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPC #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract & Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ipcs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>No IPCs found.</p>
                        <Link 
                          href="/dashboard/procurement/ipcs/create"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create your first IPC
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    ipcs.map((ipc) => {
                      const nextAction = getNextStatusAction(ipc.status);
                      const netPayable = (ipc.currentValue || 0) - (ipc.deductions || 0);
                      
                      return (
                        <tr key={ipc.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ipc.ipcNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">{ipc.contract?.contractNumber}</div>
                            <div className="text-gray-500 text-xs">{ipc.contract?.vendor?.companyLegalName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ipc.projectName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                              {ipc.periodFrom ? new Date(ipc.periodFrom).toLocaleDateString() : 'N/A'} -
                              {ipc.periodTo ? new Date(ipc.periodTo).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                              ${netPayable.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              Gross: ${ipc.currentValue?.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={ipc.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                href={`/dashboard/procurement/ipcs/${ipc.id}`}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              
                              {nextAction && (
                                <button
                                  onClick={() => updateIPCStatus(ipc.id, nextAction.nextStatus)}
                                  className={`text-white p-1 rounded hover:opacity-90 ${nextAction.color}`}
                                  title={nextAction.action}
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              
                              {ipc.status === 'SUBMITTED' && (
                                <button
                                  onClick={() => updateIPCStatus(ipc.id, 'REJECTED')}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Reject IPC"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default IPCsPage;