// frontend/src/app/dashboard/procurement/contracts/page.js - MOBILE OPTIMIZED
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Plus, FileText, Clock, CheckCircle, 
  XCircle, AlertTriangle, Edit, Trash2, Eye, DollarSign,
  Calendar, User, Building, ArrowUp, ArrowDown, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ 
    search: '', 
    status: '', 
    sortField: 'createdAt', 
    sortOrder: 'desc' 
  });

  // Fetch contracts
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/contracts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });

      console.log('Contracts data:', response.data);
      setContracts(response.data);
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
      setError('Failed to load contracts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [filters.status]);

  // Status configuration
  const getStatusConfig = (status) => {
    const statusConfigs = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: Clock },
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      EXPIRED: { color: 'bg-red-100 text-red-800', label: 'Expired', icon: XCircle },
      CLOSED: { color: 'bg-purple-100 text-purple-800', label: 'Closed', icon: CheckCircle },
      TERMINATED: { color: 'bg-red-100 text-red-800', label: 'Terminated', icon: XCircle }
    };
    return statusConfigs[status] || statusConfigs.DRAFT;
  };

  // Calculate statistics
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'ACTIVE').length,
    expiring: contracts.filter(c => {
      if (!c.endDate || c.status !== 'ACTIVE') return false;
      const endDate = new Date(c.endDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return endDate <= thirtyDaysFromNow;
    }).length,
    totalValue: contracts.reduce((sum, contract) => sum + (contract.contractValue || 0), 0)
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = getStatusConfig(status);
    const IconComponent = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const ExpiryBadge = ({ endDate, status }) => {
    if (status !== 'ACTIVE' || !endDate) return null;

    const end = new Date(endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) {
      return <span className="text-red-600 text-xs font-medium">EXPIRED</span>;
    } else if (daysUntilExpiry <= 30) {
      return <span className="text-orange-600 text-xs font-medium">Expires in {daysUntilExpiry} days</span>;
    }
    
    return <span className="text-green-600 text-xs">Active</span>;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-64 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading contracts...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-64 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-600 text-lg mb-2">Error loading contracts</div>
            <div className="text-gray-600 mb-4 text-sm">{error}</div>
            <button
              onClick={fetchContracts}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Statistics Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs sm:text-sm">Total Contracts</span>
              <FileText className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs sm:text-sm">Active</span>
              <CheckCircle className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.active}</p>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs sm:text-sm">Expiring Soon</span>
              <AlertTriangle className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">{stats.expiring}</p>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs sm:text-sm">Total Value</span>
              <DollarSign className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-bold mt-1">${(stats.totalValue / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Filter and Search Bar - Responsive Layout */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <select
              className="p-2 border border-gray-300 rounded-lg text-sm sm:text-base flex-grow sm:flex-grow-0"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CLOSED">Closed</option>
              <option value="TERMINATED">Terminated</option>
            </select>

            <div className="flex gap-2">
              <button 
                className="text-gray-500 hover:text-gray-700 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setFilters({ search: '', status: '', sortField: 'createdAt', sortOrder: 'desc' })}
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                className="text-gray-500 hover:text-gray-700 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={fetchContracts}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Contracts Table - Responsive */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {contracts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-lg mb-2">No contracts found</p>
              <Link 
                href="/dashboard/procurement/contracts/create"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Create your first contract
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contract #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{contract.contractNumber}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{contract.vendor?.companyLegalName}</div>
                        <div className="text-gray-500 text-xs">ID: {contract.vendor?.vendorId}</div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.rfq?.projectName || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                          {contract.contractValue ? `$${(contract.contractValue / 1000).toFixed(0)}K` : 'N/A'}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" />
                          {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <ExpiryBadge endDate={contract.endDate} status={contract.status} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={contract.status} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1 sm:space-x-2">
                          <Link
                            href={`/dashboard/procurement/contracts/${contract.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                            title="Edit Contract"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete Contract"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <ResponsiveLayout>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Contracts Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage and track all procurement contracts
            </p>
          </div>
          <Link 
            href="/dashboard/procurement/contracts/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}
    </ResponsiveLayout>
  );
};

export default ContractsPage;