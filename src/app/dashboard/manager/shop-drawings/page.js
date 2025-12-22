"use client";
import { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown, 
  RefreshCw, Database, WifiOff, Eye, BarChart, PieChart as PieChartIcon,
  Users, Calendar, Filter, Download, ChevronRight, Search,
  Building, Truck, Package, Shield, Layers, Grid
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const ShopDrawingsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('fallback');
  const [timeRange, setTimeRange] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for Shop Drawings
  const generateFallbackData = () => ({
    summary: {
      totalDrawings: 89,
      approved: 56,
      resubmitRequired: 18,
      overdue: 12,
      averageReviewTime: 5.4
    },
    charts: {
      byDiscipline: [
        { discipline: 'Architectural', count: 32, color: '#3b82f6' },
        { discipline: 'Structural', count: 28, color: '#ef4444' },
        { discipline: 'MEP', count: 45, color: '#10b981' },
        { discipline: 'Civil', count: 18, color: '#f59e0b' },
        { discipline: 'Landscape', count: 8, color: '#8b5cf6' }
      ],
      statusDistribution: [
        { name: 'Approved', value: 56, color: '#10b981' },
        { name: 'Under Review', value: 34, color: '#f59e0b' },
        { name: 'Resubmit Required', value: 18, color: '#8b5cf6' },
        { name: 'Rejected', value: 12, color: '#ef4444' }
      ],
      submissionsByMonth: [
        { month: 'Jan', count: 15 },
        { month: 'Feb', count: 22 },
        { month: 'Mar', count: 18 },
        { month: 'Apr', count: 25 },
        { month: 'May', count: 21 },
        { month: 'Jun', count: 28 }
      ]
    },
    drawings: [
      {
        id: 1,
        sdNo: 'SD-2024-0234',
        project: 'Tower B Construction',
        contractor: 'TechBuild Co.',
        discipline: 'Structural',
        status: 'Approved',
        pendingWith: 'Structural Engineer',
        requiredDate: '2024-01-20',
        delayDays: 0
      },
      {
        id: 2,
        sdNo: 'SD-2024-0235',
        project: 'Commercial Complex',
        contractor: 'Gulf Materials',
        discipline: 'MEP',
        status: 'Under Review',
        pendingWith: 'MEP Coordinator',
        requiredDate: '2024-01-25',
        delayDays: 0
      },
      {
        id: 3,
        sdNo: 'SD-2024-0236',
        project: 'Obhur Beach',
        contractor: 'Concrete Masters',
        discipline: 'Civil',
        status: 'Resubmit Required',
        pendingWith: 'Civil Engineer',
        requiredDate: '2024-01-18',
        delayDays: 5
      },
      {
        id: 4,
        sdNo: 'SD-2024-0237',
        project: 'Core DQ',
        contractor: 'SteelTech',
        discipline: 'Architectural',
        status: 'Overdue',
        pendingWith: 'Architect',
        requiredDate: '2024-01-15',
        delayDays: 3
      },
      {
        id: 5,
        sdNo: 'SD-2024-0238',
        project: 'HQ Office',
        contractor: 'TechBuild Co.',
        discipline: 'MEP',
        status: 'Rejected',
        pendingWith: 'Electrical Engineer',
        requiredDate: '2024-01-22',
        delayDays: 0
      },
      {
        id: 6,
        sdNo: 'SD-2024-0239',
        project: 'Tower B Construction',
        contractor: 'Gulf Materials',
        discipline: 'Structural',
        status: 'Approved',
        pendingWith: 'Structural Engineer',
        requiredDate: '2024-01-19',
        delayDays: 0
      },
      {
        id: 7,
        sdNo: 'SD-2024-0240',
        project: 'Commercial Complex',
        contractor: 'Concrete Masters',
        discipline: 'Architectural',
        status: 'Under Review',
        pendingWith: 'Architect',
        requiredDate: '2024-01-28',
        delayDays: 0
      }
    ]
  });

  useEffect(() => {
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
      success: 'bg-green-100 text-green-800 border-green-200',
      info: 'bg-purple-100 text-purple-800 border-purple-200'
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
      'Resubmit Required': { color: 'bg-purple-100 text-purple-800' },
      'Overdue': { color: 'bg-red-100 text-red-800' },
      'Rejected': { color: 'bg-red-600 text-white' }
    };
    
    const { color } = config[status] || config['Under Review'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
        {status}
      </span>
    );
  };

  const DisciplineBadge = ({ discipline }) => {
    const config = {
      'Architectural': { color: 'bg-blue-100 text-blue-800' },
      'Structural': { color: 'bg-red-100 text-red-800' },
      'MEP': { color: 'bg-green-100 text-green-800' },
      'Civil': { color: 'bg-amber-100 text-amber-800' },
      'Landscape': { color: 'bg-purple-100 text-purple-800' }
    };
    
    const { color } = config[discipline] || config['Architectural'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
        {discipline}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading Shop Drawings Dashboard...</h2>
        </div>
      </div>
    );
  }

  const { summary, charts, drawings } = dashboardData;

  return (
    <ResponsiveLayout>
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Shop Drawings Dashboard</h1>
          <p className="text-gray-600 mt-1">Track fabrication and construction drawings</p>
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
          icon={<Grid className="text-blue-500" size={24} />}
          title="Total Drawings"
          value={summary.totalDrawings}
          subtitle="All shop drawings"
          color="primary"
          trend="+8"
          trendPositive={true}
        />
        
        <KPICard
          icon={<CheckCircle className="text-green-500" size={24} />}
          title="Approved"
          value={summary.approved}
          subtitle="Ready for fabrication"
          color="success"
          trend="+5"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Layers className="text-purple-500" size={24} />}
          title="Resubmit Required"
          value={summary.resubmitRequired}
          subtitle="Need revisions"
          color="info"
          trend="+3"
          trendPositive={false}
        />
        
        <KPICard
          icon={<AlertTriangle className="text-red-500" size={24} />}
          title="Overdue"
          value={summary.overdue}
          subtitle="Past review deadline"
          color="error"
          trend="-1"
          trendPositive={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drawings by Discipline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Drawings by Discipline</h3>
          <div className="h-64">
            <div className="flex items-end h-48 gap-2 mt-4">
              {charts.byDiscipline.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-3/4 rounded-t"
                    style={{ 
                      height: `${(item.count / 50) * 100}%`,
                      backgroundColor: item.color
                    }}
                    title={`${item.discipline}: ${item.count}`}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{item.discipline.substring(0, 3)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {charts.byDiscipline.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.discipline}: {item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submissions by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Submissions per Month</h3>
          <div className="h-64">
            <div className="flex items-end h-48 gap-2 mt-4">
              {charts.submissionsByMonth.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-3/4 bg-green-500 rounded-t"
                    style={{ height: `${(item.count / 30) * 100}%` }}
                    title={`${item.month}: ${item.count} drawings`}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Average monthly submissions: <span className="font-semibold">21.5 drawings</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drawings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Shop Drawings</h3>
            <p className="text-gray-600 text-sm">All drawing submissions and their status</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search drawings..."
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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[120px]">SD No</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[150px]">Project</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[140px]">Contractor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Discipline</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[140px]">Pending With</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Required Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[100px]">Delay Days</th>
              </tr>
            </thead>
            <tbody>
              {drawings.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-600">{item.sdNo}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.project}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.contractor}</span>
                  </td>
                  <td className="py-3 px-4">
                    <DisciplineBadge discipline={item.discipline} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.pendingWith}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{new Date(item.requiredDate).toLocaleDateString()}</span>
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

export default ShopDrawingsDashboard;