// frontend/src/components/dashboards/ManagerDashboard.js
"use client";
import { useState, useEffect } from 'react';
import { 
  FileText, Users, AlertTriangle, Clock, CheckCircle, 
  TrendingUp, TrendingDown, RefreshCw, Calendar, Shield,
  Eye, Database, WifiOff, BarChart, PieChart as PieChartIcon,
  Target, Activity, Zap, Bell, Filter, Download, Settings,
  ChevronRight, MoreVertical, ExternalLink, Search, DollarSign, Truck
} from 'lucide-react';
import Link from 'next/link';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('unknown');
  const [timeRange, setTimeRange] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  const getItemRoute = (item) => {
    const typeMap = {
      'Vendor': 'vendors',
      'RFQ': 'rfq', 
      'Contract': 'contracts',
      'PO': 'purchase-orders',
      'Purchase Requests': 'purchase-requests',
      'Invoice': 'invoices'
    };
    
    const route = typeMap[item.type];
    return `/dashboard/procurement/${route}/${item.id}`;
  };

  // Enhanced mock data matching specification documents
  const generateFallbackData = () => ({
    summary: {
      openPRs: 24,
      pendingApprovals: 8,
      overdueTasks: 3,
      vendorReviews: 15,
      teamMembers: 12,
      activeProjects: 6,
      budgetUtilization: 78
    },
    teamPerformance: {
      teamStats: [
        { id: 1, name: 'Ahmed Zaid', completed: 23, overdue: 1, successRate: 95, avatarColor: 'bg-blue-500' },
        { id: 2, name: 'Sarah Mohammed', completed: 18, overdue: 0, successRate: 100, avatarColor: 'bg-green-500' },
        { id: 3, name: 'Khalid Al-Rashid', completed: 21, overdue: 2, successRate: 88, avatarColor: 'bg-purple-500' },
        { id: 4, name: 'Fatima Al-Mansoor', completed: 16, overdue: 1, successRate: 92, avatarColor: 'bg-pink-500' },
        { id: 5, name: 'Omar Hassan', completed: 19, overdue: 0, successRate: 96, avatarColor: 'bg-orange-500' }
      ],
      averageCompletionRate: 94,
      totalOverdueTasks: 4,
      teamSize: 12,
      monthlyTrend: 12.5
    },
    approvalQueue: [
      { 
        id: 1, 
        type: 'Vendor', 
        details: 'Tech Solutions Ltd', 
        project: '—', 
        requested: '15/01/24', 
        priority: 'HIGH', 
        status: 'Awaiting Approval' 
      },
      { 
        id: 1, 
        type: 'RFQ', 
        details: 'Project Alpha - HVAC Systems', 
        project: 'Tower B', 
        requested: '14/01/24', 
        priority: 'MEDIUM', 
        status: 'Awaiting Approval' 
      },
      { 
        id: 1, 
        type: 'Purchase Requests', 
        details: 'HVAC System for Tower B', 
        project: 'Tower B Construction', 
        requested: '2/15/2024', 
        priority: 'HIGH', 
        status: 'Awaiting Approval' 
      },
      { 
        id: 1, 
        type: 'PO', 
        details: 'Office Furniture Procurement', 
        project: 'HQ Office', 
        requested: '12/01/24', 
        priority: 'LOW', 
        status: 'Awaiting Approval' 
      }
    ],
    
    supplierMetrics: {
      totalSuppliers: 142,
      qualifiedSuppliers: 98,
      underEvaluation: 15,
      rejectedBlacklisted: 29
    },
    chartData: [
      { month: 'Jan', tasks: 45, completed: 38 },
      { month: 'Feb', tasks: 52, completed: 45 },
      { month: 'Mar', tasks: 48, completed: 42 },
      { month: 'Apr', tasks: 60, completed: 52 },
      { month: 'May', tasks: 55, completed: 48 },
      { month: 'Jun', tasks: 58, completed: 51 }
    ],
    priorityData: [
      { name: 'High', value: 35, color: '#ef4444' },
      { name: 'Medium', value: 45, color: '#f59e0b' },
      { name: 'Low', value: 20, color: '#10b981' }
    ],
    
    budgetSpend: [
      {
        id: 1,
        name: 'Core DQ',
        budget: 100000000,
        poAmount: 80000000,
        totalPaid: 65000000,
        budgetUsage: 80
      },
      {
        id: 2,
        name: 'Obhur Beach',
        budget: 50000000,
        poAmount: 40000000,
        totalPaid: 30000000,
        budgetUsage: 80
      },
      {
        id: 3,
        name: 'Tower B Construction',
        budget: 75000000,
        poAmount: 60000000,
        totalPaid: 45000000,
        budgetUsage: 80
      },
      {
        id: 4,
        name: 'Commercial Complex',
        budget: 120000000,
        poAmount: 90000000,
        totalPaid: 70000000,
        budgetUsage: 75
      },
      {
        id: 5,
        name: 'HQ Office Renovation',
        budget: 30000000,
        poAmount: 25000000,
        totalPaid: 20000000,
        budgetUsage: 83.3
      }
    ],
    
    budgetSummary: {
      totalBudget: 375000000,
      totalPOAmount: 295000000,
      totalPaid: 230000000,
      averageUsage: 79.5
    },

    deadlineTracking: [
      { 
        id: 1, 
        task: 'Vendor Qualification – SteelTech Industries', 
        module: 'Vendor', 
        project: 'Tower B Construction', 
        assignedTo: 'Ahmed Zaid', 
        dueIn: -2, 
        priority: 'HIGH', 
        status: 'IN PROGRESS' 
      },
      { 
        id: 1, 
        task: 'RFQ Evaluation – Project Alpha HVAC', 
        module: 'RFQ', 
        project: 'Commercial Complex', 
        assignedTo: 'Sarah Mohammed', 
        dueIn: 5, 
        priority: 'MEDIUM', 
        status: 'NOT STARTED' 
      },
      { 
        id: 1, 
        task: 'Contract Renewal – Gulf Materials', 
        module: 'Contract', 
        project: 'All Buildings', 
        assignedTo: 'Khalid Al-Rashid', 
        dueIn: -1, 
        priority: 'URGENT', 
        status: 'IN PROGRESS' 
      },
      { 
        id: 1, 
        task: 'Budget Review Q1 2024', 
        module: 'Finance', 
        project: 'All Projects', 
        assignedTo: 'Fatima Al-Mansoor', 
        dueIn: 7, 
        priority: 'HIGH', 
        status: 'NOT STARTED' 
      },
      { 
        id: 1, 
        task: 'Material Submittal Approval - Steel Beams', 
        module: 'Material', 
        project: 'Tower B Construction', 
        assignedTo: 'Omar Hassan', 
        dueIn: -3, 
        priority: 'HIGH', 
        status: 'PENDING REVIEW' 
      },
      { 
        id: 1, 
        task: 'Shop Drawing Review - HVAC Ductwork', 
        module: 'Shop', 
        project: 'Commercial Complex', 
        assignedTo: 'Sarah Mohammed', 
        dueIn: 2, 
        priority: 'MEDIUM', 
        status: 'IN PROGRESS' 
      },
      { 
        id: 1, 
        task: 'Site Delivery - Concrete Materials', 
        module: 'Delivery', 
        project: 'Obhur Beach', 
        assignedTo: 'Khalid Al-Rashid', 
        dueIn: -5, 
        priority: 'URGENT', 
        status: 'DELAYED' 
      },
      { 
        id: 1, 
        task: 'Contractor Invoice Approval - TechBuild', 
        module: 'Invoice', 
        project: 'Core DQ', 
        assignedTo: 'Fatima Al-Mansoor', 
        dueIn: 0, 
        priority: 'HIGH', 
        status: 'AWAITING APPROVAL' 
      }
    ],
    
    // Add new KPI data for Phase 2
    extendedKPIs: {
      qualifiedSuppliersPercentage: 69,
      projectsOver90PercentBudget: 2,
      totalSubmittals: 156,
      delayedSubmittals: 24,
      totalShopDrawings: 89,
      delayedShopDrawings: 12
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

      console.log('🔄 Fetching manager dashboard data from API...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/manager?range=${timeRange}`, {
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
        console.log('✅ Successfully loaded real manager data from API');
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
  }, [timeRange]);

  const handleRetry = () => {
    fetchDashboardData();
  };

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

  // KPI Card Component (matching Executive Dashboard style)
  const KPICard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary', 
    trend, 
    trendPositive,
    onClick 
  }) => {
    const colorClasses = {
      primary: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-amber-100 text-amber-800 border-amber-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      info: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    };

    return (
      <div 
        className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${
          onClick ? 'cursor-pointer hover:border-blue-300' : ''
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              {icon}
            </div>
            <h3 className="text-lg font-semibold ml-3 text-gray-800">{title}</h3>
          </div>
          {trend && (
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              trendPositive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {trend}
            </span>
          )}
        </div>
        
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
      </div>
    );
  };

  // Metric Row Component (matching Executive Dashboard)
  const MetricRow = ({ label, value, subtext, progress, trend, alert }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-sm text-gray-500">{subtext}</p>
        {progress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${
                progress > 80 ? 'bg-red-500' : 
                progress > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      <div className="text-right">
        <p className={`text-lg font-semibold ${
          alert ? 'text-red-600' : 'text-gray-900'
        }`}>
          {value}
          {trend === 'up' && <TrendingUp className="inline ml-1 text-green-500" size={16} />}
          {trend === 'down' && <TrendingDown className="inline ml-1 text-red-500" size={16} />}
        </p>
      </div>
    </div>
  );

  // Priority Badge Component
  const PriorityBadge = ({ priority }) => {
    const config = {
      HIGH: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle size={12} className="flex-shrink-0" /> },
      MEDIUM: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={12} className="flex-shrink-0" /> },
      LOW: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={12} className="flex-shrink-0" /> },
      URGENT: { color: 'bg-red-600 text-white', icon: <AlertTriangle size={12} className="flex-shrink-0" /> }
    };
    
    const { color, icon } = config[priority] || config.MEDIUM;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
        {icon}
        <span className="whitespace-nowrap">{priority}</span>
      </span>
    );
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const config = {
      'IN PROGRESS': { color: 'bg-blue-100 text-blue-800' },
      'NOT STARTED': { color: 'bg-gray-100 text-gray-800' },
      'AWAITING APPROVAL': { color: 'bg-amber-100 text-amber-800' },
      'COMPLETED': { color: 'bg-green-100 text-green-800' },
      'PENDING REVIEW': { color: 'bg-purple-100 text-purple-800' },
      'DELAYED': { color: 'bg-red-100 text-red-800' }
    };
    
    const { color } = config[status] || config['NOT STARTED'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading Manager Dashboard...</h2>
          <p className="text-gray-600 mt-2">Connecting to procurement database</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">Please check your backend connection</p>
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

  const { 
    summary, 
    teamPerformance, 
    approvalQueue, 
    deadlineTracking, 
    supplierMetrics,
    chartData,
    priorityData 
  } = dashboardData;

    // Helper function to format currency
    const formatCurrency = (amount) => {
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K`;
      }
      return amount.toLocaleString();
    };

      // Helper functions for deadline tracking
  const getDocumentType = (module) => {
    const types = {
      'Vendor': 'Vendor Qualification',
      'RFQ': 'Request for Quotation',
      'PO': 'Purchase Order',
      'Contract': 'Contract Agreement',
      'Finance': 'Budget Review',
      'Material': 'Material Submittal',
      'Shop': 'Shop Drawing',
      'Delivery': 'Site Delivery',
      'Invoice': 'Contractor Invoice'
    };
    return types[module] || module;
  };

  const getDocumentId = (item) => {
    const prefixes = {
      'Vendor': 'V',
      'RFQ': 'RFQ',
      'PO': 'PO',
      'Contract': 'CT',
      'Material': 'MS',
      'Shop': 'SD',
      'Delivery': 'DL',
      'Invoice': 'INV'
    };
    const prefix = prefixes[item.module] || 'DOC';
    return `${prefix}-2024-${item.id.toString().padStart(4, '0')}`;
  };

  const getModuleColor = (module) => {
    const colors = {
      'Vendor': 'bg-blue-100 text-blue-800',
      'RFQ': 'bg-purple-100 text-purple-800',
      'PO': 'bg-green-100 text-green-800',
      'Contract': 'bg-teal-100 text-teal-800',
      'Material': 'bg-amber-100 text-amber-800',
      'Shop': 'bg-orange-100 text-orange-800',
      'Delivery': 'bg-red-100 text-red-800',
      'Invoice': 'bg-indigo-100 text-indigo-800',
      'Finance': 'bg-gray-100 text-gray-800'
    };
    return colors[module] || 'bg-gray-100 text-gray-800';
  };

  const getModuleIcon = (module) => {
    const icons = {
      'Vendor': <Users size={12} />,
      'RFQ': <FileText size={12} />,
      'PO': <DollarSign size={12} />,
      'Contract': <FileText size={12} />,
      'Material': <FileText size={12} />,
      'Shop': <BarChart size={12} />,
      'Delivery': <Truck size={12} />,
      'Invoice': <DollarSign size={12} />,
      'Finance': <DollarSign size={12} />,
      'Purchase Requests': <FileText size={12} />
    };
    return icons[module] || <FileText size={12} />;
  };


  // Helper function to get the correct action button for each item
const getActionButton = (item) => {
  // Function to get the correct route for each module
  const getItemRoute = () => {
    const basePath = '/dashboard/procurement';
    
    const routeMap = {
      'Vendor': `${basePath}/vendors/${item.id}`,
      'RFQ': `${basePath}/rfq/${item.id}`,
      'PO': `${basePath}/purchase-orders/${item.id}`,
      'Contract': `${basePath}/contracts/${item.id}`,
      'Material': `${basePath}/material-submittals/${item.id}`,
      'Shop': `${basePath}/shop-drawings/${item.id}`,
      'Delivery': `${basePath}/deliveries/${item.id}`,
      'Invoice': `${basePath}/invoices/${item.id}`,
      'Finance': `${basePath}/budget/${item.id}`,
      'Purchase Requests': `${basePath}/purchase-requests/${item.id}`
    };
    
    // Try to match by module or task type
    if (routeMap[item.module]) {
      return routeMap[item.module];
    }
    
    // Fallback: check if task contains certain keywords
    const task = item.task.toLowerCase();
    if (task.includes('vendor') || task.includes('qualification')) {
      return `${basePath}/vendors/${item.id}`;
    } else if (task.includes('rfq')) {
      return `${basePath}/rfq/${item.id}`;
    } else if (task.includes('purchase order') || task.includes('po')) {
      return `${basePath}/purchase-orders/${item.id}`;
    } else if (task.includes('contract')) {
      return `${basePath}/contracts/${item.id}`;
    } else if (task.includes('invoice')) {
      return `${basePath}/invoices/${item.id}`;
    } else if (task.includes('material')) {
      return `${basePath}/material-submittals/${item.id}`;
    } else if (task.includes('shop')) {
      return `${basePath}/shop-drawings/${item.id}`;
    } else if (task.includes('delivery')) {
      return `${basePath}/deliveries/${item.id}`;
    } else if (task.includes('purchase request') || task.includes('pr')) {
      return `${basePath}/purchase-requests/${item.id}`;
    }
    
    // Default fallback
    return `${basePath}/rfq/${item.id}`;
  };

  const route = getItemRoute();
  
  return (
    <Link 
      href={route}
      className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
    >
      Review
    </Link>
  );
};
  

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header with Data Source Indicator */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
          <p className="text-gray-600 mt-1">Procurement team oversight and task management</p>
          <div className="flex items-center gap-2 mt-2">
            <DataSourceIndicator />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={handleRetry}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Refresh all data"
          >
            <RefreshCw size={20} />
          </button>
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

      {/* Top KPI Cards (Row 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<FileText className="text-blue-500" size={24} />}
          title="Open PRs"
          value={summary.openPRs}
          subtitle="Open purchase requests"
          color="primary"
          trend="+8.3%"
          trendPositive={true}
        />
        
        <KPICard
          icon={<AlertTriangle className="text-amber-500" size={24} />}
          title="Pending Approvals"
          value={summary.pendingApprovals}
          subtitle="Require your immediate review"
          color="warning"
          trend="+5.2%"
          trendPositive={false}
        />
        
        <KPICard
          icon={<Clock className="text-red-500" size={24} />}
          title="Overdue Tasks"
          value={summary.overdueTasks}
          subtitle="Team overdue items"
          color="error"
          trend="-12.7%"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Users className="text-cyan-500" size={24} />}
          title="Vendor Reviews"
          value={summary.vendorReviews}
          subtitle="Awaiting qualification"
          color="info"
          trend="+15.8%"
          trendPositive={true}
        />
      </div>

      {/* Phase 2: Additional KPIs (Row 2) */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <KPICard
    icon={<Users className="text-green-500" size={24} />}
    title="Qualified Suppliers"
    value={`${dashboardData.extendedKPIs?.qualifiedSuppliersPercentage || 0}%`}
    subtitle={`${supplierMetrics.qualifiedSuppliers} of ${supplierMetrics.totalSuppliers} total`}
    color="success"
    trend="+3.2%"
    trendPositive={true}
  />
  
  <KPICard
    icon={<AlertTriangle className="text-red-500" size={24} />}
    title="Projects >90% Budget"
    value={dashboardData.extendedKPIs?.projectsOver90PercentBudget || 0}
    subtitle="Approaching budget limits"
    color="error"
    trend="+1"
    trendPositive={false}
  />
  
  <KPICard
    icon={<FileText className="text-purple-500" size={24} />}
    title="Total Submittals"
    value={dashboardData.extendedKPIs?.totalSubmittals || 0}
    subtitle={`${dashboardData.extendedKPIs?.delayedSubmittals || 0} delayed`}
    color="primary"
    trend="+12"
    trendPositive={true}
  />
  
  <KPICard
    icon={<BarChart className="text-orange-500" size={24} />}
    title="Shop Drawings"
    value={dashboardData.extendedKPIs?.totalShopDrawings || 0}
    subtitle={`${dashboardData.extendedKPIs?.delayedShopDrawings || 0} delayed`}
    color="warning"
    trend="+8"
    trendPositive={true}
  />
</div>

      {/* Charts Section (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <TrendingUp className="text-green-500 mr-3" size={24} />
              Team Performance Trends
            </h3>
            <Eye className="text-gray-400 cursor-pointer" size={20} />
          </div>
          <div className="h-64">
            {/* Simple bar chart visualization */}
            <div className="flex items-end h-48 gap-2 mt-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex items-end w-full justify-center gap-1">
                    <div 
                      className="w-3/4 bg-blue-200 rounded-t"
                      style={{ height: `${(item.tasks / 60) * 100}%` }}
                      title={`Total Tasks: ${item.tasks}`}
                    ></div>
                    <div 
                      className="w-3/4 bg-green-400 rounded-t"
                      style={{ height: `${(item.completed / 60) * 100}%` }}
                      title={`Completed: ${item.completed}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span className="text-sm text-gray-600">Total Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <PieChartIcon className="text-purple-500 mr-3" size={24} />
              Task Priority Distribution
            </h3>
            <Eye className="text-gray-400 cursor-pointer" size={20} />
          </div>
          <div className="h-64 flex items-center justify-center">
            {/* Simple pie chart visualization */}
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 rounded-full border-8 border-red-100"></div>
              <div className="absolute inset-0 rounded-full border-8 border-yellow-100" style={{
                clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 35%)'
              }}></div>
              <div className="absolute inset-0 rounded-full border-8 border-green-100" style={{
                clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 35%)'
              }}></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">100%</div>
                  <div className="text-sm text-gray-500">Total Tasks</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {priorityData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Team Performance</h3>
            <p className="text-gray-600 text-sm">Individual performance metrics and completion rates</p>
          </div>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Team Member</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Completed (30d)</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Overdue</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.teamStats.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${member.avatarColor}`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{member.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <CheckCircle size={12} />
                      {member.completed}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {member.overdue > 0 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        <AlertTriangle size={12} />
                        {member.overdue}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            member.successRate >= 90 ? 'bg-green-500' : 
                            member.successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${member.successRate}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold ${
                        member.successRate >= 90 ? 'text-green-600' : 
                        member.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {member.successRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

            
        {/* Approval Queue - TABLE FORMAT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Approval Queue</h3>
                  <p className="text-gray-600 text-sm">Pending items requiring your approval</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  {approvalQueue.length} items
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Details (Name)</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Project</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Requested</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalQueue.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'Vendor' ? 'bg-blue-100 text-blue-800' :
                            item.type === 'RFQ' ? 'bg-purple-100 text-purple-800' :
                            item.type === 'Contract' ? 'bg-green-100 text-green-800' :
                            item.type === 'PO' ? 'bg-teal-100 text-teal-800' :
                            item.type === 'Purchase Requests' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.type === 'Vendor' && <Users size={12} />}
                            {item.type === 'RFQ' && <FileText size={12} />}
                            {item.type === 'Contract' && <FileText size={12} />}
                            {item.type === 'PO' && <DollarSign size={12} />}
                            {item.type === 'Purchase Requests' && <FileText size={12} />}
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-800">{item.details}</p>
                            <p className="text-xs text-gray-500">ID: {item.type}-{item.id.toString().padStart(4, '0')}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">{item.project}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">{item.requested}</span>
                        </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={item.priority} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3 px-4">
                        <Link 
                          href={getItemRoute(item)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors inline-block"
                        >
                          Review
                        </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

        {/* Critical Deadlines */}
        {/* Critical Deadlines & Priority Items - TABLE FORMAT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Critical Deadlines & Priority Items</h3>
                  <p className="text-gray-600 text-sm">All delays across modules requiring attention</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search items..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Filter className="text-gray-400 cursor-pointer" size={20} />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[200px]">Task / Deliverable</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[100px]">Module</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[150px]">Project</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[120px]">Assigned To</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[120px]">Due In</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[100px]">Priority</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[120px]">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[80px]">Action</th>
                      </tr>
                    </thead>
                  <tbody>
                    {deadlineTracking.map((item) => (
                      <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-50 ${
                        item.priority === 'URGENT' ? 'bg-red-50' : ''
                      }`}>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-800">{item.task}</p>
                            <p className="text-xs text-gray-500">
                              {getDocumentType(item.module)} • ID: {getDocumentId(item)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            getModuleColor(item.module)
                          }`}>
                            {getModuleIcon(item.module)}
                            {item.module}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">{item.project}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 text-xs">
                              {item.assignedTo.charAt(0)}
                            </div>
                            <span className="text-gray-700">{item.assignedTo}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                        <div className="whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.dueIn <= 1 
                              ? 'bg-red-100 text-red-800'
                              : item.dueIn <= 3
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.dueIn <= 0 ? (
                              <>
                                <AlertTriangle size={12} className="flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  {Math.abs(item.dueIn)} day{Math.abs(item.dueIn) !== 1 ? 's' : ''} overdue
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock size={12} className="flex-shrink-0" />
                                <span className="whitespace-nowrap">
                                  {item.dueIn} day{item.dueIn !== 1 ? 's' : ''}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                        <td className="py-3 px-4">
                          <PriorityBadge priority={item.priority} />
                        </td>
                        <td className="py-3 px-4">
                        <div className="whitespace-nowrap">
                          <StatusBadge status={item.status} />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                          {getActionButton(item)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          

      {/* Vendor Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Vendor Metrics</h3>
            <p className="text-gray-600 text-sm">Supplier qualification and performance KPIs</p>
          </div>
          <Users className="text-gray-400" size={24} />
        </div>             
        
        {/* Supplier KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Total Suppliers</p>
            <p className="text-2xl font-bold text-gray-900">{supplierMetrics.totalSuppliers}</p>
          </div>
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">Qualified Suppliers</p>
            <p className="text-2xl font-bold text-green-800">{supplierMetrics.qualifiedSuppliers}</p>
          </div>
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">Under Evaluation</p>
            <p className="text-2xl font-bold text-yellow-800">{supplierMetrics.underEvaluation}</p>
          </div>
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">Rejected/Blacklisted</p>
            <p className="text-2xl font-bold text-red-800">{supplierMetrics.rejectedBlacklisted}</p>
          </div>
        </div>

        {/* Qualification Status */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Suppliers by Qualification Status</h4>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-48 h-48">
              {/* Pie chart visualization */}
              <div className="absolute inset-0">
                {[
                    { value: supplierMetrics.qualifiedSuppliers, color: '#22c55e', label: 'Qualified' },
                    { value: supplierMetrics.underEvaluation, color: '#facc15', label: 'Under Evaluation' },
                    { value: 18, color: '#ef4444', label: 'Rejected' },
                    { value: 11, color: '#9ca3af', label: 'Blacklisted' }
                  ]
                  .map((slice, index, arr) => {
                  const total = arr.reduce((sum, s) => sum + s.value, 0);
                  const percentage = (slice.value / total) * 100;
                  const rotation = arr.slice(0, index).reduce((sum, s) => sum + (s.value / total) * 360, 0);
                  
                  return (
                    <div
                      key={index}
                      className="absolute inset-0 rounded-full border-8 border-transparent"
                      style={{
                        borderTopColor: index === 0 ? slice.color : 'transparent',
                        borderRightColor: index === 1 ? slice.color : 'transparent',
                        borderBottomColor: index === 2 ? slice.color : 'transparent',
                        borderLeftColor: index === 3 ? slice.color : 'transparent',
                        transform: `rotate(${rotation}deg)`
                      }}
                    ></div>                  
                  );
                })}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{supplierMetrics.totalSuppliers}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Qualified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Under Evaluation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Rejected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Blacklisted</span>
            </div>
          </div>
        </div>
      </div>
      {/* Spend vs Budget Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Spend vs Budget</h3>
            <p className="text-gray-600 text-sm">Project-level budget utilization (Phase 1)</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Table
            </button>
            <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-lg">
              Chart
            </button>
            <Download className="text-gray-400 cursor-pointer" size={20} />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Project</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Project Budget</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total PO Amount</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total Paid</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Budget Usage %</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: 1,
                  name: 'Core DQ',
                  budget: 100000000,
                  poAmount: 80000000,
                  totalPaid: 65000000,
                  budgetUsage: 80
                },
                {
                  id: 2,
                  name: 'Obhur Beach',
                  budget: 50000000,
                  poAmount: 40000000,
                  totalPaid: 30000000,
                  budgetUsage: 80
                },
                {
                  id: 3,
                  name: 'Tower B Construction',
                  budget: 75000000,
                  poAmount: 60000000,
                  totalPaid: 45000000,
                  budgetUsage: 80
                },
                {
                  id: 4,
                  name: 'Commercial Complex',
                  budget: 120000000,
                  poAmount: 90000000,
                  totalPaid: 70000000,
                  budgetUsage: 75
                },
                {
                  id: 5,
                  name: 'HQ Office Renovation',
                  budget: 30000000,
                  poAmount: 25000000,
                  totalPaid: 20000000,
                  budgetUsage: 83.3
                }
              ].map((project) => (
                <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-800">{project.name}</p>
                      <p className="text-xs text-gray-500">Project ID: PRJ-{project.id.toString().padStart(4, '0')}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-medium text-gray-800">
                      SAR {formatCurrency(project.budget)}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-medium text-gray-800">
                      SAR {formatCurrency(project.poAmount)}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-medium text-gray-800">
                      SAR {formatCurrency(project.totalPaid)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {((project.totalPaid / project.poAmount) * 100).toFixed(1)}% of PO
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            project.budgetUsage >= 90 ? 'bg-red-500' : 
                            project.budgetUsage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(project.budgetUsage, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold min-w-[50px] text-right ${
                        project.budgetUsage >= 90 ? 'text-red-600' : 
                        project.budgetUsage >= 75 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {project.budgetUsage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-xl font-bold text-gray-900">SAR 375M</p>
          </div>
          <div className="text-center p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">Total PO Amount</p>
            <p className="text-xl font-bold text-blue-800">SAR 295M</p>
          </div>
          <div className="text-center p-4 border border-green-200 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">Avg. Budget Usage</p>
            <p className="text-xl font-bold text-green-800">79.5%</p>
          </div>
        </div>

        {/* Bar Chart Visualization (Alternative View) */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-700">Budget Utilization by Project</p>
            <span className="text-xs text-gray-500">Visual comparison</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Core DQ', used: 80, total: 100 },
              { name: 'Obhur Beach', used: 80, total: 50 },
              { name: 'Tower B', used: 80, total: 75 },
              { name: 'Commercial', used: 75, total: 120 },
              { name: 'HQ Office', used: 83.3, total: 30 }
            ].map((project, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{project.name}</span>
                  <span className="text-gray-600">{project.used}% of SAR {project.total}M</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      project.used >= 90 ? 'bg-red-500' : 
                      project.used >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${project.used}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;