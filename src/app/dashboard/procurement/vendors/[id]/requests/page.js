// frontend/src/app/dashboard/procurement/vendors/[id]/requests/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  Download,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Eye,
  MessageSquare,
  Bell,
  Flag,
  ChevronRight,
  Star,
  Award,
  Shield,
  Briefcase
} from 'lucide-react';
import RequestCard from '@/components/requests/RequestCard';
import EmptyState from '@/components/requests/EmptyState';
import RequestFilters from '@/components/requests/RequestFilters';
import CreateRequestModal from '@/components/requests/CreateRequestModal';
import mockRequestService from '@/services/mockRequestService';
import { getVendorById, mockDocuments, mockVendors } from '@/utils/mockRequests';
import { formatDate, getRelativeTime } from '@/utils/dateUtils';

export default function VendorRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id;

  const [vendor, setVendor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [vendorStats, setVendorStats] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: '',
    dateRange: null
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [vendorDocuments, setVendorDocuments] = useState([]);
  const [expiringDocs, setExpiringDocs] = useState([]);

  useEffect(() => {
    if (vendorId) {
      fetchVendorData();
      fetchVendorRequests();
      fetchVendorStats();
      fetchVendorDocuments();
    }
  }, [vendorId]);

  useEffect(() => {
    applyFilters();
  }, [requests, activeFilters]);

  const fetchVendorData = async () => {
    try {
      const vendorData = getVendorById(vendorId);
      if (vendorData) {
        setVendor(vendorData);
      } else {
        throw new Error('Vendor not found');
      }
    } catch (err) {
      console.error('Error fetching vendor data:', err);
      setError(err.message);
    }
  };

  const fetchVendorRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mockRequestService.getAllExecutiveRequests({ vendorId });
      
      if (response.success) {
        setRequests(response.data);
      } else {
        throw new Error('Failed to fetch vendor requests');
      }
    } catch (err) {
      console.error('Error fetching vendor requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorStats = async () => {
    try {
      const response = await mockRequestService.getRequestStats(vendorId);
      if (response.success) {
        setVendorStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching vendor stats:', err);
    }
  };

  const fetchVendorDocuments = () => {
    // Filter documents for this vendor
    const docs = mockDocuments.filter(doc => doc.vendorId === vendorId);
    setVendorDocuments(docs);
    
    // Find expiring documents (within 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const expiring = docs.filter(doc => {
      if (!doc.expiryDate) return false;
      const expiryDate = new Date(doc.expiryDate);
      return expiryDate > today && expiryDate <= thirtyDaysFromNow;
    });
    
    setExpiringDocs(expiring);
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

    // Apply search filter
    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      filtered = filtered.filter(req => 
        req.title.toLowerCase().includes(searchTerm) ||
        req.description.toLowerCase().includes(searchTerm)
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

  const handleRequestCreated = (newRequest) => {
    // Refresh the data
    fetchVendorRequests();
    fetchVendorStats();
  };

  const handleSendReminder = async (requestId) => {
    if (!confirm('Send reminder to vendor about this request?')) return;
    
    try {
      const response = await mockRequestService.sendReminder(requestId);
      if (response.success) {
        alert('Reminder sent successfully!');
        fetchVendorRequests();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEscalateRequest = async (requestId) => {
    if (!confirm('Escalate this request to procurement manager?')) return;
    
    try {
      const response = await mockRequestService.escalateRequest(requestId);
      if (response.success) {
        alert('Request escalated successfully!');
        fetchVendorRequests();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const exportVendorRequests = () => {
    const headers = ['Title', 'Type', 'Status', 'Priority', 'Created', 'Due Date', 'Response Date', 'Approval Status'];
    const csvData = filteredRequests.map(req => [
      req.title,
      req.requestType,
      req.status,
      req.priority,
      formatDate(req.createdAt, 'short'),
      formatDate(req.dueDate, 'short'),
      req.responseDate ? formatDate(req.responseDate, 'short') : 'No response',
      req.approvedDate ? 'Approved' : req.rejectionReason ? 'Rejected' : 'Pending'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vendor?.name}-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getVendorScore = () => {
    if (!vendorStats) return 0;
    
    const totalRequests = vendorStats.totalRequests || 0;
    const completedRequests = vendorStats.byStatus?.approved + vendorStats.byStatus?.rejected || 0;
    const complianceRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 100;
    
    // Calculate score based on multiple factors
    let score = complianceRate;
    
    // Penalize for overdue requests
    const overduePenalty = (vendorStats.overdueCount || 0) * 5;
    score = Math.max(0, score - overduePenalty);
    
    // Bonus for fast responses
    if (vendorStats.avgResponseTime && vendorStats.avgResponseTime < 3) {
      score += 10;
    }
    
    return Math.min(100, Math.round(score));
  };

  if (loading) {
    return (
      <div className="p-8">
        <EmptyState type="loading" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {error || 'Vendor not found'}
          </h2>
          <p className="text-red-600 mb-4">
            Unable to load vendor information and requests.
          </p>
          <Link
            href="/dashboard/procurement/vendors"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Vendors
          </Link>
        </div>
      </div>
    );
  }

  const vendorScore = getVendorScore();
  const scoreColor = vendorScore >= 80 ? 'green' : vendorScore >= 60 ? 'yellow' : 'red';

  return (
    <div className="p-4 md:p-6">
      {/* Header with Back Navigation */}
      <div className="mb-6">
        <Link
          href="/dashboard/procurement/vendors"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Vendors
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Vendor Info */}
          <div>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="text-white" size={28} />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {vendor.name}
                  </h1>
                  
                  <div className="flex items-center gap-2">
                    <div className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${scoreColor === 'green' ? 'bg-green-100 text-green-800 border-green-200' :
                        scoreColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-red-100 text-red-800 border-red-200'}
                    `}>
                      <div className="flex items-center gap-1">
                        <Award size={14} />
                        Score: {vendorScore}/100
                      </div>
                    </div>
                    
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                      <div className="flex items-center gap-1">
                        <Briefcase size={14} />
                        Vendor ID: {vendor.id}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Mail size={14} />
                    {vendor.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={14} />
                    {vendor.website || 'No website'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportVendorRequests}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Export
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              New Request
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vendor Details & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Vendor Stats Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <BarChart3 className="text-blue-600" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Vendor Performance</h2>
            </div>
            
            {vendorStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{vendorStats.totalRequests || 0}</div>
                    <div className="text-xs text-blue-700">Total Requests</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">
                      {vendorStats.complianceRate ? `${vendorStats.complianceRate}%` : '100%'}
                    </div>
                    <div className="text-xs text-green-700">Compliance Rate</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Avg. Response Time</span>
                      <span className="font-medium text-gray-800">
                        {vendorStats.avgResponseTime || 0} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (vendorStats.avgResponseTime || 0) < 3 ? 'bg-green-500' :
                          (vendorStats.avgResponseTime || 0) < 7 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, (vendorStats.avgResponseTime || 0) * 10)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Current Status</span>
                      <span className="font-medium text-gray-800">
                        {vendorStats.overdueCount > 0 ? 'Needs Attention' : 'Good Standing'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          vendorStats.overdueCount > 0 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${100 - (vendorStats.overdueCount || 0) * 20}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Request Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-medium text-yellow-600">
                        {vendorStats.byStatus?.pending || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Submitted</span>
                      <span className="font-medium text-blue-600">
                        {vendorStats.byStatus?.submitted || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Approved</span>
                      <span className="font-medium text-green-600">
                        {vendorStats.byStatus?.approved || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overdue</span>
                      <span className="font-medium text-red-600">
                        {vendorStats.byStatus?.overdue || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Clock className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-gray-500">No performance data available</p>
              </div>
            )}
          </div>

          {/* Vendor Documents Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100">
                  <FileText className="text-purple-600" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
              </div>
              <span className="text-sm text-gray-500">
                {vendorDocuments.length} total
              </span>
            </div>
            
            {vendorDocuments.length > 0 ? (
              <div className="space-y-3">
                {vendorDocuments.slice(0, 3).map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="text-gray-400" size={16} />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.docType}</p>
                      </div>
                    </div>
                    {doc.expiryDate && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        new Date(doc.expiryDate) < new Date() 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {new Date(doc.expiryDate) < new Date() ? 'Expired' : doc.expiryDate}
                      </span>
                    )}
                  </div>
                ))}
                
                {vendorDocuments.length > 3 && (
                  <Link
                    href={`/dashboard/procurement/vendors/${vendorId}/documents`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 py-2 border-t border-gray-200"
                  >
                    View all {vendorDocuments.length} documents
                    <ChevronRight className="inline ml-1" size={14} />
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <FileText className="mx-auto text-gray-400 mb-2" size={24} />
                <p className="text-gray-500">No documents uploaded</p>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <Plus size={18} />
                <div>
                  <p className="font-medium">Create New Request</p>
                  <p className="text-xs">Request information or documents</p>
                </div>
              </button>
              
              <button
                onClick={() => router.push(`mailto:${vendor.email}`)}
                className="w-full flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <Mail size={18} />
                <div>
                  <p className="font-medium">Contact Vendor</p>
                  <p className="text-xs">Send email to {vendor.name}</p>
                </div>
              </button>
              
              <button
                onClick={exportVendorRequests}
                className="w-full flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <Download size={18} />
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-xs">Download request history</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Requests List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Information Requests</h3>
                <p className="text-gray-600">
                  All requests sent to {vendor.name}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {expiringDocs.length > 0 && (
                  <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium border border-orange-200">
                    <div className="flex items-center gap-1">
                      <AlertCircle size={14} />
                      {expiringDocs.length} doc{expiringDocs.length !== 1 ? 's' : ''} expiring soon
                    </div>
                  </div>
                )}
              </div>
            </div>
            
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
                <p className="text-sm text-gray-600">
                  Showing {filteredRequests.length} of {requests.length} requests
                  {activeFilters.status && ` • Filtered by: ${activeFilters.status}`}
                  {activeFilters.type && ` • Type: ${activeFilters.type}`}
                </p>
                
                <div className="text-sm text-gray-500">
                  Sorted by: <span className="font-medium">Due Date</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredRequests.map(request => (
                  <div key={request.id} className="relative group">
                    <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {request.status === 'PENDING' && (
                        <button
                          onClick={() => handleSendReminder(request.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Send Reminder"
                        >
                          <Bell size={16} />
                        </button>
                      )}
                      
                      {request.status === 'OVERDUE' && (
                        <button
                          onClick={() => handleEscalateRequest(request.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Escalate Request"
                        >
                          <Flag size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => router.push(`/dashboard/procurement/vendors/${vendorId}/requests/${request.id}`)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                    
                    <RequestCard 
                      request={request}
                      isVendorView={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              type={requests.length === 0 ? "no-requests" : "no-results"}
              title={
                requests.length === 0 
                  ? "No Requests Yet" 
                  : "No Matching Requests"
              }
              description={
                requests.length === 0 
                  ? `No information requests have been sent to ${vendor.name} yet. Create the first request to start the conversation.`
                  : "No requests match your current filters. Try adjusting your search criteria."
              }
              actionButton={
                requests.length === 0 ? (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Request
                  </button>
                ) : activeFilters.status || activeFilters.type || activeFilters.search ? (
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
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          onClose={() => setShowCreateModal(false)}
          onRequestCreated={handleRequestCreated}
          selectedVendor={vendor}
        />
      )}
    </div>
  );
}