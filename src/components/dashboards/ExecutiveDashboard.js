// frontend/src/components/dashboards/ExecutiveDashboard.js
"use client";
import { useEffect, useState } from 'react';
import { 
  BarChart3, Users, FileText, DollarSign, CheckCircle, Briefcase, 
  Clock, TrendingUp, AlertTriangle, PieChart, Target, BarChart,
  Calendar, Shield, TrendingDown, Eye, RefreshCw, Database
} from 'lucide-react';

const ExecutiveDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('unknown'); // 'api', 'fallback', 'error'
  const [timeRange, setTimeRange] = useState('month');

  // Enhanced mock data that matches your API structure
  const generateFallbackData = () => ({
    summary: {
      totalVendors: 156,
      approvedVendors: 128,
      totalSpend: 45200000,
      totalContracts: 89,
      pendingApprovals: 12,
      activeProjects: 23,
      teamMembers: 18,
      overdueTasks: 3
    },
    financialMetrics: {
      monthlySpend: 2400000,
      budgetUtilization: 78,
      costSavings: 450000,
      ytdSpend: 28500000,
      budgetRemaining: 16700000,
      spendTrend: 'up'
    },
    vendorPerformance: {
      averageScore: 84,
      topPerformers: 12,
      needsReview: 8,
      complianceRate: 92,
      qualificationRate: 82
    },
    projectAnalytics: {
      onTimeDelivery: 78,
      delayedProjects: 5,
      completedThisMonth: 12,
      totalMilestones: 156,
      completedMilestones: 134
    },
    kpis: {
      procurementEfficiency: 87,
      vendorSatisfaction: 89,
      contractCompliance: 94,
      costSavingsRate: 15.2
    },
    alerts: {
      expiringDocuments: 7,
      highRiskVendors: 3,
      budgetOverruns: 2,
      delayedDeliveries: 4
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

      console.log('🔄 Fetching executive dashboard data from API...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/executive?range=${timeRange}`, {
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
        console.log('✅ Successfully loaded real data from API');
        setDashboardData(result.data);
        setDataSource('api');
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.log('⚠️ API unavailable, using fallback data:', error.message);
      setError(`Database temporarily unavailable. Showing sample data.`);
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
          <AlertTriangle size={16} />
          Sample Data (DB Offline)
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading Executive Dashboard...</h2>
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

  const { summary, financialMetrics, vendorPerformance, projectAnalytics, kpis, alerts } = dashboardData;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header with Data Source Indicator */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Executive Dashboard</h1>
          <p className="text-gray-600 mt-1">Procurement performance and KPIs</p>
          <DataSourceIndicator />
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
            onClick={fetchDashboardData}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Refresh data"
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


      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<TrendingUp className="text-green-500" size={24} />}
          title="Procurement Efficiency"
          value={`${kpis.procurementEfficiency}%`}
          subtitle="Process optimization score"
          trend="+2.3%"
          trendPositive={true}
        />
        
        <KPICard
          icon={<DollarSign className="text-blue-500" size={24} />}
          title="Cost Savings Rate"
          value={`${kpis.costSavingsRate}%`}
          subtitle="Against total spend"
          trend="+1.8%"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Shield className="text-purple-500" size={24} />}
          title="Contract Compliance"
          value={`${kpis.contractCompliance}%`}
          subtitle="Adherence to terms"
          trend="+0.5%"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Users className="text-orange-500" size={24} />}
          title="Vendor Satisfaction"
          value={`${kpis.vendorSatisfaction}%`}
          subtitle="Partner feedback score"
          trend="-1.2%"
          trendPositive={false}
        />
      </div>

      {/* Financial & Vendor Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <BarChart className="text-green-500 mr-3" size={24} />
              Financial Overview
            </h3>
            <Eye className="text-gray-400 cursor-pointer" size={20} />
          </div>
          <div className="space-y-4">
            <MetricRow 
              label="YTD Spend" 
              value={`SAR ${(financialMetrics.ytdSpend / 1000000).toFixed(1)}M`}
              subtext={`${((financialMetrics.ytdSpend / summary.totalSpend) * 100).toFixed(1)}% of annual`}
            />
            <MetricRow 
              label="Budget Utilization" 
              value={`${financialMetrics.budgetUtilization}%`}
              subtext={`SAR ${(financialMetrics.budgetRemaining / 1000000).toFixed(1)}M remaining`}
              progress={financialMetrics.budgetUtilization}
            />
            <MetricRow 
              label="Monthly Spend" 
              value={`SAR ${(financialMetrics.monthlySpend / 1000).toFixed(0)}K`}
              subtext={`${financialMetrics.spendTrend === 'up' ? '↑' : '↓'} from last month`}
              trend={financialMetrics.spendTrend}
            />
            <MetricRow 
              label="Cost Savings" 
              value={`SAR ${(financialMetrics.costSavings / 1000).toFixed(0)}K`}
              subtext="Through negotiation and optimization"
              trend="up"
            />
          </div>
        </div>

        {/* Vendor Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Users className="text-blue-500 mr-3" size={24} />
              Vendor Performance
            </h3>
            <Eye className="text-gray-400 cursor-pointer" size={20} />
          </div>
          <div className="space-y-4">
            <MetricRow 
              label="Total Qualified Vendors" 
              value={summary.approvedVendors}
              subtext={`${vendorPerformance.qualificationRate}% qualification rate`}
            />
            <MetricRow 
              label="Average Performance Score" 
              value={`${vendorPerformance.averageScore}/100`}
              subtext="Based on comprehensive evaluation"
            />
            <MetricRow 
              label="Compliance Rate" 
              value={`${vendorPerformance.complianceRate}%`}
              subtext="Document and regulatory compliance"
            />
            <MetricRow 
              label="Vendors Needing Review" 
              value={vendorPerformance.needsReview}
              subtext="Require immediate attention"
              alert={vendorPerformance.needsReview > 5}
            />
          </div>
        </div>
      </div>

      {/* Project & Alert Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Briefcase className="text-purple-500 mr-3" size={24} />
              Project Performance
            </h3>
            <Calendar className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            <MetricRow 
              label="Active Projects" 
              value={summary.activeProjects}
              subtext="Currently in execution phase"
            />
            <MetricRow 
              label="On-Time Delivery" 
              value={`${projectAnalytics.onTimeDelivery}%`}
              subtext="Projects delivered as scheduled"
              progress={projectAnalytics.onTimeDelivery}
            />
            <MetricRow 
              label="Milestone Completion" 
              value={`${((projectAnalytics.completedMilestones / projectAnalytics.totalMilestones) * 100).toFixed(1)}%`}
              subtext={`${projectAnalytics.completedMilestones} of ${projectAnalytics.totalMilestones} milestones`}
            />
            <MetricRow 
              label="Delayed Projects" 
              value={projectAnalytics.delayedProjects}
              subtext="Requiring management attention"
              alert={projectAnalytics.delayedProjects > 3}
            />
          </div>
        </div>

        {/* Risk & Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              Risk & Compliance Alerts
            </h3>
            <Shield className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            <AlertItem 
              type="warning"
              count={alerts.expiringDocuments}
              label="Documents Expiring Soon"
              description="Vendor certificates and compliance docs"
            />
            <AlertItem 
              type="high"
              count={alerts.highRiskVendors}
              label="High-Risk Vendors"
              description="Require immediate review"
            />
            <AlertItem 
              type="medium"
              count={alerts.budgetOverruns}
              label="Budget Overruns"
              description="Projects exceeding allocated budget"
            />
            <AlertItem 
              type="medium"
              count={alerts.delayedDeliveries}
              label="Delayed Deliveries"
              description="Impact on project timelines"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton 
            icon={<FileText size={20} />}
            label="View Reports"
            onClick={() => console.log('View Reports')}
          />
          <ActionButton 
            icon={<Users size={20} />}
            label="Vendor Analysis"
            onClick={() => console.log('Vendor Analysis')}
          />
          <ActionButton 
            icon={<DollarSign size={20} />}
            label="Financial Summary"
            onClick={() => console.log('Financial Summary')}
          />
          <ActionButton 
            icon={<TrendingUp size={20} />}
            label="Performance Review"
            onClick={() => console.log('Performance Review')}
          />
        </div>
      </div>
    </div>
  );
};

// Enhanced KPI Card Component
const KPICard = ({ icon, title, value, subtitle, trend, trendPositive }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        {icon}
        <h3 className="text-lg font-semibold ml-3 text-gray-800">{title}</h3>
      </div>
      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
        trendPositive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {trend}
      </span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
  </div>
);

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

const AlertItem = ({ type, count, label, description }) => {
  const config = {
    high: { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertTriangle size={16} /> },
    warning: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock size={16} /> },
    medium: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <AlertTriangle size={16} /> }
  };
  
  const { color, icon } = config[type] || config.medium;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${color}`}>
      <div className="flex items-center">
        {icon}
        <div className="ml-3">
          <p className="font-medium">{label}</p>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
  >
    <div className="text-gray-600 group-hover:text-blue-600 mb-2">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
      {label}
    </span>
  </button>
);

export default ExecutiveDashboard;