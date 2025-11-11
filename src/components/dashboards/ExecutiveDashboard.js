// frontend/src/components/dashboards/ExecutiveDashboard.js
"use client";
import { useEffect, useState } from 'react';
import { 
  BarChart3, Users, FileText, DollarSign, CheckCircle, Briefcase, 
  Clock, TrendingUp, AlertTriangle 
} from 'lucide-react';

const ExecutiveDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!dashboardData) return <div>No data available</div>;

  const { summary, financialMetrics, vendorPerformance, taskOverview } = dashboardData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Executive Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          icon={<Users className="text-blue-500" size={24} />}
          title="Total Vendors"
          value={summary.totalVendors}
          subtitle={`${summary.approvedVendors} Approved`}
          trend="+12%"
        />
        
        <SummaryCard
          icon={<DollarSign className="text-green-500" size={24} />}
          title="Total Spend"
          value={`SAR ${(summary.totalSpend || 0).toLocaleString()}`}
          subtitle={`${summary.totalContracts} Contracts`}
          trend="+8%"
        />
        
        <SummaryCard
          icon={<CheckCircle className="text-orange-500" size={24} />}
          title="Pending Approvals"
          value={summary.pendingApprovals}
          subtitle={`${summary.activeProjects} Active Projects`}
          trend={summary.pendingApprovals > 5 ? "Attention" : "Normal"}
        />
        
        <SummaryCard
          icon={<Briefcase className="text-purple-500" size={24} />}
          title="Team Members"
          value={summary.teamMembers}
          subtitle={`${summary.overdueTasks} Overdue Tasks`}
          trend="Stable"
        />
      </div>

      {/* Second Row - Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-green-500 mr-3" size={20} />
            <h3 className="text-lg font-semibold">Financial Health</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Spend</span>
              <span className="font-semibold">SAR 2.4M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Budget Utilization</span>
              <span className="font-semibold text-green-600">78%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost Savings</span>
              <span className="font-semibold text-blue-600">SAR 450K</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <BarChart3 className="text-blue-500 mr-3" size={20} />
            <h3 className="text-lg font-semibold">Vendor Performance</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Score</span>
              <span className="font-semibold">84/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Top Performers</span>
              <span className="font-semibold">12 Vendors</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Needs Review</span>
              <span className="font-semibold text-orange-600">8 Vendors</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Clock className="text-red-500 mr-3" size={20} />
            <h3 className="text-lg font-semibold">Task Overview</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{taskOverview?.completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold text-blue-600">{taskOverview?.inProgress || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overdue</span>
              <span className="font-semibold text-red-600">{taskOverview?.overdue || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {summary.overdueTasks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3" size={20} />
            <div>
              <h4 className="font-semibold text-red-800">Attention Required</h4>
              <p className="text-red-600 text-sm">
                There {summary.overdueTasks === 1 ? 'is' : 'are'} {summary.overdueTasks} overdue task{summary.overdueTasks !== 1 ? 's' : ''} that require immediate attention.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ icon, title, value, subtitle, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        {icon}
        <h3 className="text-lg font-semibold ml-3">{title}</h3>
      </div>
      <span className={`text-sm font-medium ${
        trend.includes('+') ? 'text-green-600' : 
        trend === 'Attention' ? 'text-red-600' : 'text-gray-600'
      }`}>
        {trend}
      </span>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
  </div>
);

export default ExecutiveDashboard;