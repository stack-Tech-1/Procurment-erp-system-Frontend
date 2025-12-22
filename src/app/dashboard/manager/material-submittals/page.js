"use client";
import { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown, 
  RefreshCw, Database, WifiOff, Eye, BarChart, PieChart as PieChartIcon,
  Users, Calendar, Filter, Download, ChevronRight, Search,
  Building, Truck, Package, Shield
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const MaterialSubmittalsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('fallback');
  const [timeRange, setTimeRange] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for Material Submittals
  const generateFallbackData = () => ({
    summary: {
      totalSubmittals: 156,
      approved: 98,
      underReview: 42,
      overdue: 16,
      averageApprovalTime: 7.2
    },
    charts: {
      statusDistribution: [
        { name: 'Approved', value: 98, color: '#10b981' },
        { name: 'Under Review', value: 42, color: '#f59e0b' },
        { name: 'Rejected', value: 24, color: '#ef4444' },
        { name: 'Resubmit Required', value: 18, color: '#8b5cf6' }
      ],
      byProject: [
        { project: 'Core DQ', count: 45 },
        { project: 'Obhur Beach', count: 32 },
        { project: 'Tower B', count: 38 },
        { project: 'Commercial', count: 28 },
        { project: 'HQ Office', count: 13 }
      ],
      byContractor: [
        { contractor: 'TechBuild Co.', count: 56 },
        { contractor: 'Gulf Materials', count: 42 },
        { contractor: 'SteelTech', count: 28 },
        { contractor: 'Concrete Masters', count: 30 }
      ],
      approvalTimeline: [
        { month: 'Jan', days: 8.5 },
        { month: 'Feb', days: 7.8 },
        { month: 'Mar', days: 6.2 },
        { month: 'Apr', days: 7.5 },
        { month: 'May', days: 6.8 },
        { month: 'Jun', days: 7.2 }
      ]
    },
    submittals: [
      {
        id: 1,
        submittalNo: 'MS-2024-0456',
        material: 'Structural Steel Beams',
        project: 'Tower B Construction',
        contractor: 'TechBuild Co.',
        status: 'Under Review',
        pendingWith: 'Structural Engineer',
        dateSubmitted: '2024-01-15',
        dueDate: '2024-01-22',
        delayDays: 0
      },
      {
        id: 2,
        submittalNo: 'MS-2024-0457',
        material: 'HVAC Ductwork',
        project: 'Commercial Complex',
        contractor: 'Gulf Materials',
        status: 'Approved',
        pendingWith: 'MEP Engineer',
        dateSubmitted: '2024-01-14',
        dueDate: '2024-01-21',
        delayDays: 0
      },
      {
        id: 3,
        submittalNo: 'MS-2024-0458',
        material: 'Concrete Mix Design',
        project: 'Obhur Beach',
        contractor: 'Concrete Masters',
        status: 'Overdue',
        pendingWith: 'Civil Engineer',
        dateSubmitted: '2024-01-10',
        dueDate: '2024-01-17',
        delayDays: 3
      },
      {
        id: 4,
        submittalNo: 'MS-2024-0459',
        material: 'Exterior Paint Samples',
        project: 'Core DQ',
        contractor: 'SteelTech',
        status: 'Rejected',
        pendingWith: 'Architect',
        dateSubmitted: '2024-01-12',
        dueDate: '2024-01-19',
        delayDays: 0
      },
      {
        id: 5,
        submittalNo: 'MS-2024-0460',
        material: 'Electrical Cables',
        project: 'HQ Office',
        contractor: 'TechBuild Co.',
        status: 'Resubmit Required',
        pendingWith: 'Electrical Engineer',
        dateSubmitted: '2024-01-11',
        dueDate: '2024-01-18',
        delayDays: 2
      }
    ]
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData(generateFallbackData());
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const handleRetry = () => {
    setLoading(true);
    setTimeout(() => {
      setDashboardData(generateFallbackData());
      setLoading(false);
    }, 1000);
  };

  const DataSourceIndicator = () => (
    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
      <Database size={16} />
      Mock Data
    </div>
  );

  const KPICard = ({ title, value, subtitle, icon, color = 'primary', trend, trendPositive }) => {
    const colorClasses = {
      primary: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-amber-100 text-amber-800 border-amber-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      success: 'bg-green-100 text-green-800 border-green-200'
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
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

  const StatusBadge = ({ status }) => {
    const config = {
      'Approved': { color: 'bg-green-100 text-green-800' },
      'Under Review': { color: 'bg-blue-100 text-blue-800' },
      'Overdue': { color: 'bg-red-100 text-red-800' },
      'Rejected': { color: 'bg-red-600 text-white' },
      'Resubmit Required': { color: 'bg-purple-100 text-purple-800' }
    };
    
    const { color } = config[status] || config['Under Review'];
    
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
          <h2 className="text-xl font-semibold text-gray-800">Loading Material Submittals Dashboard...</h2>
        </div>
      </div>
    );
  }

  const { summary, charts, submittals } = dashboardData;

  return (
    <ResponsiveLayout>
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Material Submittals Dashboard</h1>
          <p className="text-gray-600 mt-1">Track material approvals and submittals</p>
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<FileText className="text-blue-500" size={24} />}
          title="Total Submittals"
          value={summary.totalSubmittals}
          subtitle="All material submittals"
          color="primary"
          trend="+12"
          trendPositive={true}
        />
        
        <KPICard
          icon={<CheckCircle className="text-green-500" size={24} />}
          title="Approved"
          value={summary.approved}
          subtitle="Successfully approved"
          color="success"
          trend="+8"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Clock className="text-amber-500" size={24} />}
          title="Under Review"
          value={summary.underReview}
          subtitle="Currently being reviewed"
          color="warning"
          trend="+3"
          trendPositive={false}
        />
        
        <KPICard
          icon={<AlertTriangle className="text-red-500" size={24} />}
          title="Overdue"
          value={summary.overdue}
          subtitle="Past due date"
          color="error"
          trend="-2"
          trendPositive={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Submittals by Status</h3>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              {charts.statusDistribution.map((slice, index, arr) => {
                const total = arr.reduce((sum, s) => sum + s.value, 0);
                const percentage = (slice.value / total) * 100;
                
                return (
                  <div key={index} className="absolute inset-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{total}</div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {charts.statusDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Average Approval Time</h3>
          <div className="h-64">
            <div className="flex items-end h-48 gap-2 mt-4">
              {charts.approvalTimeline.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-3/4 bg-blue-500 rounded-t"
                    style={{ height: `${(item.days / 10) * 100}%` }}
                    title={`${item.days} days`}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Current average: <span className="font-semibold">{summary.averageApprovalTime} days</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submittals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Material Submittals</h3>
            <p className="text-gray-600 text-sm">All material submissions and their status</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search submittals..."
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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[140px]">Submittal No</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[180px]">Material</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[150px]">Project</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[140px]">Contractor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[120px]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[140px]">Pending With</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[120px]">Date Submitted</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[100px]">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[100px]">Delay Days</th>
              </tr>
            </thead>
            <tbody>
              {submittals.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-600">{item.submittalNo}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.material}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.project}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.contractor}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.pendingWith}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{new Date(item.dateSubmitted).toLocaleDateString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{new Date(item.dueDate).toLocaleDateString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    {item.delayDays > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle size={12} />
                        {item.delayDays} days
                      </span>
                    ) : (
                      <span className="text-gray-500">On time</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ResponsiveLayout>
  );  
};


export default MaterialSubmittalsDashboard;