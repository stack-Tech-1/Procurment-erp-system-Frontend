// frontend/src/app/dashboard/procurement/information-requests/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { 
  Filter, 
  Search, 
  Plus, 
  Download, 
  BarChart3, 
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  TrendingUp,
  ChevronRight,
  Eye,
  MoreVertical,
  Mail,
  Bell,
  CheckSquare,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import RequestCard from '@/components/requests/RequestCard';
import EmptyState from '@/components/requests/EmptyState';
import RequestFilters from '@/components/requests/RequestFilters';
import CreateRequestModal from '@/components/requests/CreateRequestModal';
import mockRequestService from '@/services/mockRequestService';
import { REQUEST_TYPES, REQUEST_STATUS, PRIORITY_LEVELS } from '@/utils/mockRequests';
import { formatDate } from '@/utils/dateUtils';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function ExecutiveInformationRequestsPage() {
  const { t } = useTranslation(); // ADD THIS HOOK
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    status: '',
    type: '',
    priority: '',
    vendorId: '',
    search: '',
    dateRange: null
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, activeFilters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mockRequestService.getAllExecutiveRequests();
      
      if (response.success) {
        setRequests(response.data);
        setStats(response.stats);
      } else {
        throw new Error(t('failedToFetchRequests'));
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await mockRequestService.getRequestStats();
      if (response.success) {
        setStats(prev => ({ ...prev, ...response.data }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

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

    // Apply vendor filter
    if (activeFilters.vendorId) {
      filtered = filtered.filter(req => req.vendorId === activeFilters.vendorId);
    }

    // Apply search filter
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      filtered = filtered.filter(req => 
        req.title.toLowerCase().includes(searchTerm) ||
        req.vendorName.toLowerCase().includes(searchTerm) ||
        req.description.toLowerCase().includes(searchTerm) ||
        req.createdByName.toLowerCase().includes(searchTerm)
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
      vendorId: '',
      search: '',
      dateRange: null
    });
  };

  const handleSearch = (searchTerm) => {
    setActiveFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleVendorFilter = (vendorId) => {
    setActiveFilters(prev => ({ ...prev, vendorId }));
  };

  const handleRequestCreated = (newRequest) => {
    // Refresh the list
    fetchRequests();
    fetchStats();
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedRequests.length === 0) {
      alert(t('pleaseSelectRequestsFirst'));
      return;
    }

    switch (action) {
      case 'send_reminder':
        if (confirm(t('sendReminderToNVendors', { count: selectedRequests.length }))) {
          try {
            for (const requestId of selectedRequests) {
              await mockRequestService.sendReminder(requestId);
            }
            alert(t('remindersSentToNVendors', { count: selectedRequests.length }));
            fetchRequests();
          } catch (err) {
            alert(`${t('error')}: ${err.message}`);
          }
        }
        break;
        
      case 'export_selected':
        exportSelectedToCSV();
        break;
        
      default:
        console.log('Bulk action:', action);
    }
    
    setBulkAction('');
    setSelectedRequests([]);
  };

  const exportSelectedToCSV = () => {
    const selectedData = filteredRequests.filter(req => 
      selectedRequests.includes(req.id)
    );
    
    if (selectedData.length === 0) return;
    
    const headers = [t('title'), t('vendor'), t('type'), t('status'), t('priority'), t('created'), t('dueDate'), t('createdBy'), t('response')];
    const csvData = selectedData.map(req => [
      req.title,
      req.vendorName,
      REQUEST_TYPES[req.requestType]?.label || req.requestType,
      REQUEST_STATUS[req.status]?.label || req.status,
      PRIORITY_LEVELS[req.priority]?.label || req.priority,
      formatDate(req.createdAt, 'short'),
      formatDate(req.dueDate, 'short'),
      req.createdByName,
      req.responseDate ? t('yes') : t('no')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t('selectedRequests')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAllToCSV = () => {
    const headers = [t('title'), t('vendor'), t('type'), t('status'), t('priority'), t('created'), t('dueDate'), t('createdBy'), t('response')];
    const csvData = filteredRequests.map(req => [
      req.title,
      req.vendorName,
      REQUEST_TYPES[req.requestType]?.label || req.requestType,
      REQUEST_STATUS[req.status]?.label || req.status,
      PRIORITY_LEVELS[req.priority]?.label || req.priority,
      formatDate(req.createdAt, 'short'),
      formatDate(req.dueDate, 'short'),
      req.createdByName,
      req.responseDate ? t('yes') : t('no')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t('allRequests')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getVendorStats = () => {
    const vendorMap = {};
    requests.forEach(req => {
      if (!vendorMap[req.vendorId]) {
        vendorMap[req.vendorId] = {
          name: req.vendorName,
          total: 0,
          pending: 0,
          overdue: 0,
          completed: 0
        };
      }
      vendorMap[req.vendorId].total++;
      if (req.status === 'PENDING' || req.status === 'OVERDUE') {
        vendorMap[req.vendorId].pending++;
      }
      if (req.status === 'OVERDUE') {
        vendorMap[req.vendorId].overdue++;
      }
      if (req.status === 'APPROVED' || req.status === 'REJECTED') {
        vendorMap[req.vendorId].completed++;
      }
    });
    
    return Object.values(vendorMap).sort((a, b) => b.overdue - a.overdue);
  };

  if (loading) {
    return (
      <div className="p-8">
        <EmptyState type="loading" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-red-800 mb-2">{t('errorLoadingRequests')}</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  const vendorStats = getVendorStats();
  const topVendors = vendorStats.slice(0, 5);

  return (
    <ResponsiveLayout>
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {t('informationRequestsManagement')}
            </h1>
            <p className="text-gray-600">
              {t('informationRequestsDescription')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportAllToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              {t('exportAll')}
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              {t('createRequest')}
            </button>
          </div>
        </div>

        {/* Executive Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">{t('totalRequests')}</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total || requests.length}</p>
                </div>
                <FileText className="text-blue-500" size={20} />
              </div>
              <div className="mt-2 text-xs text-blue-600">
                {t('acrossNVendors', { count: vendorStats.length })}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">{t('pending')}</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {stats.byStatus?.pending || 0}
                  </p>
                </div>
                <Clock className="text-yellow-500" size={20} />
              </div>
              <div className="mt-2 text-xs text-yellow-600">
                {t('nOverdue', { count: stats.overdueCount || 0 })}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">{t('completed')}</p>
                  <p className="text-2xl font-bold text-green-800">
                    {(stats.byStatus?.approved || 0) + (stats.byStatus?.rejected || 0)}
                  </p>
                </div>
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <div className="mt-2 text-xs text-green-600">
                {t('complianceRatePercentage', { rate: stats.complianceRate || 0 })}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">{t('avgResponseTime')}</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {stats.avgResponseTime || 0}d
                  </p>
                </div>
                <TrendingUp className="text-purple-500" size={20} />
              </div>
              <div className="mt-2 text-xs text-purple-600">
                {t('daysToRespond')}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">{t('overdue')}</p>
                  <p className="text-2xl font-bold text-red-800">
                    {stats.byStatus?.overdue || 0}
                  </p>
                </div>
                <AlertCircle className="text-red-500" size={20} />
              </div>
              <div className="mt-2 text-xs text-red-600">
                {t('requireEscalation')}
              </div>
            </div>
          </div>
        )}

        {/* Top Vendors Section */}
        {topVendors.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">{t('topVendorsByActivity')}</h3>
              <Link
                href="/dashboard/procurement/vendors"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {t('viewAllVendors')}
                <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {topVendors.map((vendor, index) => (
                <button
                  key={index}
                  onClick={() => handleVendorFilter(vendor.name === vendorStats[0]?.name ? vendorStats[0].name : '')}
                  className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 text-sm truncate">
                      {vendor.name}
                    </span>
                    {vendor.overdue > 0 && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        {vendor.overdue}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">{t('total')}</div>
                      <div className="font-medium text-gray-700">{vendor.total}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">{t('pending')}</div>
                      <div className="font-medium text-yellow-600">{vendor.pending}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedRequests.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="text-blue-600" size={20} />
              <div>
                <p className="font-medium text-blue-800">
                  {t('nRequestsSelected', { count: selectedRequests.length })}
                </p>
                <p className="text-sm text-blue-600">
                  {t('selectActionForSelectedRequests')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction('send_reminder')}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <Mail size={16} />
                {t('sendReminder')}
              </button>
              
              <button
                onClick={() => handleBulkAction('export_selected')}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Download size={16} />
                {t('exportSelected')}
              </button>
              
              <button
                onClick={() => setSelectedRequests([])}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                <XCircle size={16} />
                {t('clearSelection')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-8">
        <RequestFilters
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onSearch={handleSearch}
          isVendorView={false}
        />
      </div>

      {/* Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {t('selectAllN', { count: filteredRequests.length })}
                </span>
              </div>
              
              <p className="text-sm text-gray-600">
                {t('showingNOfMRequests', { shown: filteredRequests.length, total: requests.length })}
                {activeFilters.status && ` • ${t('filteredBy')}: ${REQUEST_STATUS[activeFilters.status]?.label}`}
                {activeFilters.type && ` • ${REQUEST_TYPES[activeFilters.type]?.label}`}
                {activeFilters.vendorId && ` • ${t('vendor')}: ${activeFilters.vendorId}`}
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              {t('sortedBy')}: <span className="font-medium">{t('dueDate')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map(request => (
              <div key={request.id} className="relative group">
                <input
                  type="checkbox"
                  checked={selectedRequests.includes(request.id)}
                  onChange={() => handleSelectRequest(request.id)}
                  className="absolute top-4 left-4 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <RequestCard 
                  request={request}
                  isVendorView={false}
                  onClick={() => router.push(`/dashboard/procurement/vendors/${request.vendorId}/requests/${request.id}`)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          type={requests.length === 0 ? "no-requests" : "no-results"}
          description={
            requests.length === 0 
              ? t('noRequestsCreatedDescription')
              : t('noRequestsMatchFiltersDescription')
          }
          actionButton={
            requests.length === 0 ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('createFirstRequest')}
              </button>
            ) : activeFilters.status || activeFilters.type || activeFilters.search ? (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('clearFilters')}
              </button>
            ) : null
          }
        />
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          onClose={() => setShowCreateModal(false)}
          onRequestCreated={handleRequestCreated}
        />
      )}
    </div>
    </ResponsiveLayout>
  );
} 