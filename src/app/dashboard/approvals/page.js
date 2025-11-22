// frontend/src/app/dashboard/approvals/page.js - MOBILE OPTIMIZED
"use client";
import { useEffect, useState } from 'react';
import ApprovalDashboard from '@/components/ApprovalDashboard';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function ApprovalsPage() {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advanced-approvals/my-pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pending approvals: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setPendingApprovals(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch approvals');
      }
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPendingApprovals();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-64 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading pending approvals...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-64 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-600 text-lg mb-2">Error loading approvals</div>
            <div className="text-gray-600 mb-4 text-sm">{error}</div>
            <button
              onClick={fetchPendingApprovals}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <ApprovalDashboard 
        pendingApprovals={pendingApprovals}
        onRefresh={handleRefresh}
        loading={loading}
      />
    );
  };

  return (
    <ResponsiveLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Approval Dashboard</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Review and manage multi-step approval workflows
            </p>
          </div>
          
          {/* Refresh Button - Mobile Optimized */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <svg 
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
        
        {/* Quick Stats - Mobile Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{pendingApprovals.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Pending Approvals</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {pendingApprovals.filter(a => new Date(a.slaDeadline) > new Date()).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Within SLA</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {pendingApprovals.filter(a => new Date(a.slaDeadline) < new Date()).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Overdue</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {new Set(pendingApprovals.map(a => a.approval?.entityType)).size}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Entity Types</div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      {renderContent()}
    </ResponsiveLayout>
  );
}