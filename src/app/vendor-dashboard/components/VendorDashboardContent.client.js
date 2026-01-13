// frontend/src/app/vendor-dashboard/components/VendorDashboardContent.client.js
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, FileText, Loader2, CheckCircle2, X, ChevronRight, 
  AlertTriangle, Clock, DollarSign, Users, BarChart3, TrendingUp,
  Calendar, Shield, Download, Eye, Send, FileCheck, RefreshCw, Database, WifiOff,Upload
} from 'lucide-react';

const VendorDashboardContent = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationModal, setNavigationModal] = useState({ show: false, page: '' });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('unknown');
  

  const checkPermission = (actionId) => {
    if (actionId === 'submit-proposal' && data.vendorInfo.status === 'BLOCKED') {
      alert('Your vendor account is blocked. Cannot submit proposals.');
      return false;
    }
    if (actionId === 'update-profile' && data.vendorInfo.status === 'UNDER_REVIEW') {
      alert('Profile is under review. Updates are currently disabled.');
      return false;
    }
    return true;
  };

  const navigateToPage = async (pageName, pagePath) => {
    setIsNavigating(true);
    setNavigationModal({ 
      show: true, 
      page: pageName,
      path: pagePath 
    });
    
    // Show modal for 800ms for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Navigate to the actual page
    router.push(pagePath);
    
    setIsNavigating(false);
    setNavigationModal({ show: false, page: '', path: '' });
  };
  
  // Navigation configuration
  const quickActionsConfig = [
    {
      id: 'submit-proposal',
      icon: <FileText size={20} />,
      label: 'Submit New Proposal',
      description: 'Respond to RFQs',
      path: '/vendor-dashboard/proposal',
      tooltip: 'Respond to RFQs or submit a new bid'
    },
    {
      id: 'view-performance',
      icon: <BarChart3 size={20} />,
      label: 'View Performance',
      description: 'Analytics & Reports',
      path: '/vendor-dashboard/performance', // We'll create this
      tooltip: 'View performance analytics and vendor rating'
    },
    {
      id: 'update-profile',
      icon: <Users size={20} />,
      label: 'Update Profile',
      description: 'Company information',
      path: '/dashboard/vendors/profile',
      tooltip: 'Update company details and compliance documents'
    },
    {
      id: 'download-reports',
      icon: <Download size={20} />,
      label: 'Download Reports',
      description: 'Export data',
      path: '/vendor-dashboard/reports', // We'll create this
      tooltip: 'Export vendor performance reports'
    }
  ];

  // Enhanced mock data matching specification documents
  const generateFallbackData = () => ({
    vendorInfo: {
      companyName: 'Global Supply Co.',
      status: 'UNDER_REVIEW',
      qualificationScore: 78,
      vendorClass: 'B',
      profileCompletion: 85,
      lastUpdated: '2024-01-15',
      vendorId: 'VEND-2024-001',
      reviewDate: '2024-12-15',
      validityUntil: '2025-12-15',
      healthScore: 82
    },
    newRFQs: 3,
    documentsExpiring: 2,
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
    ],
    timeline: [
      { date: '2024-01-10', event: 'Initial Registration', status: 'completed' },
      { date: '2024-02-15', event: 'Document Submission', status: 'completed' },
      { date: '2024-03-01', event: 'Technical Evaluation', status: 'in-progress' },
      { date: '2024-04-15', event: 'Final Approval', status: 'pending' }
    ],
    // Add advanced KPIs
  advancedKPIs: {
    deliveryCompliance: 94.7,
    technicalScore: 8.7,
    financialScore: 9.1,
    contractTrend: 18
  }
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
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
        //console.log('Dashboard data structure:', result.data);
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
              case 'Draft':
              case 'Submitted':
              case 'Pending Review':
              case 'Technical Evaluation':
                return 'text-amber-700 bg-amber-100 border-amber-200';
              case 'Approved':
              case 'Contract Negotiation':
              case 'Awarded':
                return 'text-green-700 bg-green-100 border-green-200';
              case 'Rejected':
                return 'text-red-700 bg-red-100 border-red-200';
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
          {dataSource === 'api' && data.vendorInfo?.lastUpdated && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Data updated: {new Date(data.vendorInfo.lastUpdated).toLocaleTimeString()}</span>
            </div>
          )}                 
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Vendor Class:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                data.vendorInfo.vendorClass === 'A' ? 'bg-green-100 text-green-800' :
                data.vendorInfo.vendorClass === 'B' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                Class {data.vendorInfo.vendorClass}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="text-sm">
              <span className="text-gray-500">Profile Completion: </span>
              <span className="font-semibold">{data.vendorInfo.profileCompletion}%</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className={`h-2.5 rounded-full ${
                data.vendorInfo.profileCompletion >= 80 ? 'bg-green-600' :
                data.vendorInfo.profileCompletion >= 60 ? 'bg-blue-600' :
                'bg-yellow-500'
              }`}
              style={{ width: `${data.vendorInfo.profileCompletion}%` }}
            ></div>
          </div>
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
          trend={data.proposals.length > 0 ? "+2 this month" : "No proposals yet"}  // Dynamic
        />

        <MetricCard
          icon={<CheckCircle2 className="text-green-500" size={24} />}
          title="Win Rate"
          value={`${data.performance.winRate}%`}
          subtitle="Successful bids"
          trend={data.performance.winRate > 0 ? "+5% improvement" : "No wins yet"}  // Dynamic
        />

        <MetricCard
          icon={<DollarSign className="text-purple-500" size={24} />}
          title="Total Revenue"
          value={`SAR ${(data.performance.totalRevenue / 1000000).toFixed(1)}M`}
          subtitle="YTD contract value"
          trend={data.performance.totalRevenue > 0 ? "+12% growth" : "No revenue"}  // Dynamic
        />
        <MetricCard
          icon={<Shield className="text-orange-500" size={24} />}
          title="Profile Score"
          value={`${data.vendorInfo.qualificationScore}/100`}
          subtitle="Qualification rating"
          trend={`Class ${data.vendorInfo.vendorClass} Vendor`}  // ← Use real data!
        />
      </div>

      {/* Alerts & Notifications - Updated with real data and proper links */}
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
                    <button 
                      onClick={() => alert.actionPath ? navigateToPage(alert.action, alert.actionPath) : null}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        alert.type === 'warning' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                        alert.type === 'info' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                        'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {alert.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter Pipeline by:</span>
          <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_evaluation">Under Evaluation</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="value-high">Value (High to Low)</option>
            <option value="value-low">Value (Low to High)</option>
          </select>
          <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">
            Apply Filters
          </button>
          <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Clear All
          </button>
        </div>
      </div>
      </div>

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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Performance Overview</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Last 12 months</span>
              <button className="text-blue-600 hover:text-blue-700">View Trends →</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Delivery Compliance</div>
            <div className="text-2xl font-bold text-gray-800">
              {data.advancedKPIs?.deliveryCompliance?.toFixed(1) || '0'}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.advancedKPIs?.deliveryCompliance >= 90 ? 'Excellent' : 'Needs Improvement'}
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Technical Score</div>
            <div className="text-2xl font-bold text-gray-800">
              {data.advancedKPIs?.technicalScore?.toFixed(1) || '0'}/10
            </div>
            <div className="text-xs text-gray-500">
              Based on {data.performance.totalProposals || 0} evaluations
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Financial Score</div>
            <div className="text-2xl font-bold text-gray-800">
              {data.advancedKPIs?.financialScore?.toFixed(1) || '0'}/10
            </div>
            <div className="text-xs text-gray-500">Payment & credit rating</div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Contract Trend</div>
            <div className={`text-2xl font-bold ${
              (data.advancedKPIs?.contractTrend || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.advancedKPIs?.contractTrend >= 0 ? '↑' : '↓'} {Math.abs(data.advancedKPIs?.contractTrend || 0)}%
            </div>
            <div className="text-xs text-gray-500">YTD growth</div>
          </div>
        </div>
          
          {/* Mini chart placeholder */}
          <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Performance Metrics</span>
            <span className="text-xs text-gray-500">Based on {data.performance.totalProposals || 0} proposals</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Avg. Response Time</div>
              <div className="text-lg font-bold text-gray-800">
                {data.performance.averageResponseTime || '0 days'}
              </div>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Satisfaction Score</div>
              <div className="text-lg font-bold text-gray-800">
                {data.performance.satisfactionScore?.toFixed(1) || '0'}/5
              </div>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Active Contracts</div>
              <div className="text-lg font-bold text-gray-800">
                {data.performance.activeContracts || 0}
              </div>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Total Revenue</div>
              <div className="text-lg font-bold text-gray-800">
                SAR {(data.performance.totalRevenue / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* Document Compliance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FileCheck className="text-blue-500" size={20} />
              Document Compliance
            </h3>
            <button 
              onClick={() => navigateToPage('Documents', '/vendor-dashboard/documents')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Manage Documents →
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-700 font-medium">Valid</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-bold">
                  {data.documents.valid}
                </span>
              </div>
              <p className="text-xs text-green-600">Ready for use</p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-amber-700 font-medium">Expiring</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-bold">
                  {data.documents.expiring}
                </span>
              </div>
              <p className="text-xs text-amber-600">Within 30 days</p>
              {data.documents.expiring > 0 && (
                <button 
                  onClick={() => navigateToPage('Expiring Documents', '/vendor-dashboard/documents?filter=expiring')}
                  className="mt-1 text-xs text-amber-700 underline flex items-center gap-1"
                >
                  <Clock size={12} />
                  <span>View {data.documents.expiring} document(s)</span>
                </button>
              )}
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-red-700 font-medium">Expired</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-bold">
                  {data.documents.expired}
                </span>
              </div>
              <p className="text-xs text-red-600">Immediate action</p>
              {data.documents.expired > 0 && (
                <button 
                  onClick={() => navigateToPage('Expired Documents', '/vendor-dashboard/documents?filter=expired')}
                  className="mt-1 text-xs text-red-700 underline"
                >
                  View list
                </button>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Missing</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-bold">
                  {data.documents.missing}
                </span>
              </div>
              <p className="text-xs text-gray-600">Required documents</p>
              {data.documents.missing > 0 && (
                <button 
                  onClick={() => navigateToPage('Missing Documents', '/vendor-dashboard/documents?filter=missing')}
                  className="mt-1 text-xs text-gray-700 underline"
                >
                  See requirements
                </button>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="text-gray-500">Next review date: </span>
              <span className="font-medium">
                {data.vendorInfo.nextReviewDate 
                  ? new Date(data.vendorInfo.nextReviewDate).toLocaleDateString() 
                  : 'Not scheduled'}
              </span>
            </div>
            <button 
              onClick={() => navigateToPage('Upload Documents', '/vendor-dashboard/documents/upload')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Upload size={16} />
              Upload Documents
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActionsConfig.map((action) => (
            <button
              key={action.id}
              onClick={() => navigateToPage(action.label, action.path)}
              className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group text-center relative"
              title={action.tooltip}
            >
              <div className="text-gray-600 group-hover:text-blue-600 mb-2">
                {action.icon}
              </div>
              <span className="font-medium text-gray-700 group-hover:text-blue-700 mb-1">
                {action.label}
              </span>
              <span className="text-xs text-gray-500 group-hover:text-gray-600">
                {action.description}
              </span>
              
              {/* Status indicators with REAL data */}
              {action.id === 'update-profile' && data.vendorInfo.profileCompletion < 100 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  !
                </div>
              )}
              
              {action.id === 'submit-proposal' && data.newRFQs > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {data.newRFQs}
                </div>
              )}
              
              {action.id === 'view-performance' && data.performance.activeContracts > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {data.performance.activeContracts}
                </div>
              )}
              
              {action.id === 'download-reports' && data.documents.expiring > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {data.documents.expiring}
                </div>
              )}
            </button>
          ))}
          </div>
          
          {/* Help text */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center">
              Click any button to navigate. Hover for more details.
            </p>
          </div>
        </div>

        {/* Navigation Modal */}
        {navigationModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">Preparing your page...</h3>
                <p className="text-gray-600 text-center">
                  Redirecting to {navigationModal.page}...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default VendorDashboardContent;  