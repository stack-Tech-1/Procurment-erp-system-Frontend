// frontend/src/app/vendor-dashboard/components/VendorDashboardContent.client.js
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, FileText, Loader2, CheckCircle2, X, ChevronRight, 
  AlertTriangle, Clock, DollarSign, Users, BarChart3, TrendingUp,
  Calendar, Shield, Download, Eye, Send, FileCheck, RefreshCw, Database, WifiOff
} from 'lucide-react';

const VendorDashboardContent = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('unknown');

  // Enhanced mock data matching specification documents
  const generateFallbackData = () => ({
    vendorInfo: {
      companyName: 'Global Supply Co.',
      status: 'UNDER_REVIEW',
      qualificationScore: 78,
      vendorClass: 'B',
      profileCompletion: 85,
      lastUpdated: '2024-01-15'
    },
    proposals: [
      { 
        id: 'P001', 
        rfqRef: 'RFQ-2024-05-012', 
        title: 'Supply of Cement & Aggregates', 
        date: '2024-09-01', 
        status: 'Pending Review', 
        stage: 'Technical Evaluation',
        value: 2450000,
        deadline: '2024-09-15'
      },
      { 
        id: 'P002', 
        rfqRef: 'RFQ-2024-04-045', 
        title: 'HVAC System Installation Bid', 
        date: '2024-08-15', 
        status: 'Approved', 
        stage: 'Contract Negotiation',
        value: 1870000,
        deadline: '2024-08-30'
      },
      { 
        id: 'P003', 
        rfqRef: 'RFQ-2024-05-022', 
        title: 'Office Furniture Procurement', 
        date: '2024-09-20', 
        status: 'Rejected', 
        stage: 'Final Decision',
        value: 890000,
        deadline: '2024-10-05'
      },
      { 
        id: 'P004', 
        rfqRef: 'RFQ-2024-06-003', 
        title: 'Electrical Cabling Supply', 
        date: '2024-10-01', 
        status: 'Draft', 
        stage: 'Draft',
        value: 1560000,
        deadline: '2024-10-20'
      }
    ],
    performance: {
      totalProposals: 24,
      winRate: 35,
      averageResponseTime: '2.3 days',
      satisfactionScore: 4.2,
      activeContracts: 3,
      totalRevenue: 8450000
    },
    documents: {
      valid: 8,
      expiring: 2,
      expired: 1,
      missing: 1
    },
    alerts: [
      { type: 'warning', message: 'Commercial Registration expires in 45 days', action: 'Renew' },
      { type: 'info', message: 'New RFQ available in your category', action: 'View' },
      { type: 'success', message: 'Your profile is 85% complete', action: 'Complete' }
    ]
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Fetching vendor dashboard data from API...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/vendor`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Successfully loaded real vendor data from API');
        setDashboardData(result.data);
        setDataSource('api');
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.log('⚠️ API unavailable, using fallback data:', error.message);
      setError('Database temporarily unavailable. Showing sample data.');
      setDashboardData(generateFallbackData());
      setDataSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRetry = () => {
    fetchDashboardData();
  };

  // Your existing component functions remain exactly the same
  const MetricCard = ({ icon, title, value, subtitle, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-gray-600">{subtitle}</p>
        {trend && <span className="text-xs font-medium text-green-600">{trend}</span>}
      </div>
    </div>
  );

  const ActionButton = ({ icon, label, description, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group text-center"
    >
      <div className="text-gray-600 group-hover:text-blue-600 mb-2">
        {icon}
      </div>
      <span className="font-medium text-gray-700 group-hover:text-blue-700 mb-1">
        {label}
      </span>
      <span className="text-xs text-gray-500 group-hover:text-gray-600">
        {description}
      </span>
    </button>
  );

  const DataSourceIndicator = () => {
    if (dataSource === 'api') {
      return (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
          <Database size={16} />
          Live Data
        </div>
      );
    } else if (dataSource === 'fallback') {
      return (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
          <WifiOff size={16} />
          Sample Data (DB Offline)
        </div>
      );
    }
    return null;
  };

  const getProposalStatusColor = (status) => {
    switch (status) {
      case 'Pending Review':
      case 'Technical Evaluation':
        return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'Approved':
      case 'Contract Negotiation':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'Rejected':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'Draft':
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getVendorStatusBadge = (status) => {
    const config = {
      'UNDER_REVIEW': { color: 'bg-amber-100 text-amber-800', label: 'Under Review' },
      'APPROVED': { color: 'bg-green-100 text-green-800', label: 'Approved' },
      'REJECTED': { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      'NEEDS_RENEWAL': { color: 'bg-orange-100 text-orange-800', label: 'Needs Renewal' },
      'DEFAULT': { color: 'bg-gray-100 text-gray-800', label: 'Status Unknown' }
    };
    
    const { color, label } = config[status] || config.DEFAULT;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <WifiOff className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Issue</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const data = dashboardData;

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header Section with Data Source Indicator */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {data.vendorInfo.companyName}</h1>
          <p className="text-gray-600 mt-2">Vendor Portal - Track your proposals, performance, and compliance</p>
          <DataSourceIndicator />
        </div>
        <div className="flex items-center gap-4">
          {getVendorStatusBadge(data.vendorInfo.status)}
          <button
            onClick={fetchDashboardData}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={20} />
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium">{new Date(data.vendorInfo.lastUpdated).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Data Status Alert */}
      {dataSource === 'fallback' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600" size={20} />
            <div>
              <p className="text-amber-800 font-medium">Database Connection Issue</p>
              <p className="text-amber-700 text-sm">
                Showing sample data. Real-time data will resume when database connection is restored.
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="ml-auto px-3 py-1 bg-amber-100 text-amber-800 rounded text-sm hover:bg-amber-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Status Alert */}
      <div className={`p-6 rounded-xl shadow-lg border-l-4 ${
        data.vendorInfo.status === 'UNDER_REVIEW' ? 'bg-amber-50 border-amber-400' :
        data.vendorInfo.status === 'APPROVED' ? 'bg-green-50 border-green-400' :
        'bg-blue-50 border-blue-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Briefcase size={30} className={
              data.vendorInfo.status === 'UNDER_REVIEW' ? 'text-amber-600' :
              data.vendorInfo.status === 'APPROVED' ? 'text-green-600' : 'text-blue-600'
            } />
            <div>
              <p className="text-sm font-medium text-gray-500">Your Current Status</p>
              <p className={`text-xl font-semibold ${
                data.vendorInfo.status === 'UNDER_REVIEW' ? 'text-amber-800' :
                data.vendorInfo.status === 'APPROVED' ? 'text-green-800' : 'text-blue-800'
              }`}>
                {data.vendorInfo.status === 'UNDER_REVIEW' ? 'Profile Under Qualification Review' :
                 data.vendorInfo.status === 'APPROVED' ? 'Profile Approved - Active' : 'Profile Needs Attention'}
              </p>
              {data.vendorInfo.status === 'UNDER_REVIEW' && (
                <p className="text-sm text-amber-700 mt-1">
                  Our procurement team is reviewing your submission. Expected completion: 3-5 business days.
                </p>
              )}
            </div>
          </div>
          <button className='px-4 py-2 bg-white text-teal-600 font-semibold rounded-lg shadow hover:shadow-md transition-all border border-teal-200 hover:border-teal-300'>
            Review Profile
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<FileText className="text-blue-500" size={24} />}
          title="Active Proposals"
          value={data.proposals.filter(p => p.status === 'Pending Review').length}
          subtitle="Under evaluation"
          trend="+2 this month"
        />
        <MetricCard
          icon={<CheckCircle2 className="text-green-500" size={24} />}
          title="Win Rate"
          value={`${data.performance.winRate}%`}
          subtitle="Successful bids"
          trend="+5% improvement"
        />
        <MetricCard
          icon={<DollarSign className="text-purple-500" size={24} />}
          title="Total Revenue"
          value={`SAR ${(data.performance.totalRevenue / 1000000).toFixed(1)}M`}
          subtitle="YTD contract value"
          trend="+12% growth"
        />
        <MetricCard
          icon={<Shield className="text-orange-500" size={24} />}
          title="Profile Score"
          value={`${data.vendorInfo.qualificationScore}/100`}
          subtitle="Qualification rating"
          trend="Class B Vendor"
        />
      </div>

      {/* Alerts & Notifications */}
      {data.alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} />
            Important Alerts & Notifications
          </h3>
          <div className="space-y-3">
            {data.alerts.map((alert, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${
                alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-3">
                  {alert.type === 'warning' && <Clock className="text-amber-500" size={18} />}
                  {alert.type === 'info' && <Eye className="text-blue-500" size={18} />}
                  {alert.type === 'success' && <CheckCircle2 className="text-green-500" size={18} />}
                  <span className={`font-medium ${
                    alert.type === 'warning' ? 'text-amber-800' :
                    alert.type === 'info' ? 'text-blue-800' : 'text-green-800'
                  }`}>
                    {alert.message}
                  </span>
                </div>
                <button className={`px-3 py-1 rounded text-sm font-medium ${
                  alert.type === 'warning' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                  alert.type === 'info' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                  'bg-green-100 text-green-700 hover:bg-green-200'
                }`}>
                  {alert.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Proposals Tracking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Your Proposal Pipeline</h3>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              <Eye size={16} />
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {data.proposals.map((proposal) => (
              <div key={proposal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{proposal.title}</h4>
                    <p className="text-sm text-gray-600">RFQ: {proposal.rfqRef}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProposalStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Value</p>
                    <p className="font-semibold">SAR {(proposal.value / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Deadline</p>
                    <p className="font-semibold">{new Date(proposal.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{proposal.stage}</span>
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-blue-600" aria-label={`View ${proposal.title}`}>
                      <Eye size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-green-600" aria-label={`Download ${proposal.title}`}>
                      <Download size={16} />
                    </button>
                    {proposal.status === 'Draft' && (
                      <button className="p-1 text-gray-400 hover:text-purple-600" aria-label={`Submit ${proposal.title}`}>
                        <Send size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance & Documents */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Proposals Submitted</span>
                <span className="font-semibold">{data.performance.totalProposals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Contracts</span>
                <span className="font-semibold">{data.performance.activeContracts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Response Time</span>
                <span className="font-semibold text-green-600">{data.performance.averageResponseTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Client Satisfaction</span>
                <span className="font-semibold flex items-center gap-1">
                  {data.performance.satisfactionScore}/5
                  <TrendingUp className="text-green-500" size={16} />
                </span>
              </div>
            </div>
          </div>

          {/* Document Compliance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileCheck className="text-blue-500" size={20} />
              Document Compliance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">Valid Documents</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-bold">
                  {data.documents.valid}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <span className="text-amber-700 font-medium">Expiring Soon</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-bold">
                  {data.documents.expiring}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-red-700 font-medium">Expired Documents</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
                  {data.documents.expired}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Missing Documents</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-bold">
                  {data.documents.missing}
                </span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Manage Documents
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton 
            icon={<FileText size={20} />}
            label="Submit New Proposal"
            description="Respond to RFQs"
            onClick={() => console.log('Submit Proposal')}
          />
          <ActionButton 
            icon={<BarChart3 size={20} />}
            label="View Performance"
            description="Analytics & Reports"
            onClick={() => console.log('View Performance')}
          />
          <ActionButton 
            icon={<Users size={20} />}
            label="Update Profile" // Fixed syntax: was missing a closing quote and had an extra brace
            description="Company information"
            onClick={() => console.log('Update Profile')}
          />
          <ActionButton 
            icon={<Download size={20} />}
            label="Download Reports"
            description="Export data"
            onClick={() => console.log('Download Reports')}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardContent;