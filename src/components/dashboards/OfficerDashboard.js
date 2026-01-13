// frontend/src/components/dashboards/OfficerDashboard.js
"use client";
import { useState, useEffect } from 'react';
import { 
  FileText, Clock, AlertTriangle, CheckCircle, 
  TrendingUp, TrendingDown, RefreshCw, Database, 
  WifiOff, Users, DollarSign, Play,
  BarChart, PieChart as PieChartIcon, Target,
  Search, Filter, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const OfficerDashboard = ({ data }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('unknown');
  const [timeRange, setTimeRange] = useState('month');

  // Enhanced mock data for officer dashboard matching specifications
  const generateFallbackData = () => ({
    personalMetrics: {
      myTasks: 8,
      upcomingDeadlines: 3,
      pendingSubmissions: 2,
      completedThisWeek: 5,
      overdueTasks: 1
    },
    assignedWork: [
      { 
        id: 1, 
        title: 'Vendor Qualification - SteelTech Industries', 
        taskType: 'VENDOR_REVIEW', 
        dueDate: '2024-01-20', 
        priority: 'HIGH', 
        status: 'IN_PROGRESS',
        project: 'Tower B Construction',
        progress: 65
      },
      { 
        id: 2, 
        title: 'RFQ Evaluation - Electrical Systems', 
        taskType: 'RFQ_EVALUATION', 
        dueDate: '2024-01-25', 
        priority: 'MEDIUM', 
        status: 'NOT_STARTED',
        project: 'Commercial Complex',
        progress: 0
      },
      { 
        id: 3, 
        title: 'Contract Review - HVAC Maintenance', 
        taskType: 'CONTRACT_REVIEW', 
        dueDate: '2024-01-18', 
        priority: 'HIGH', 
        status: 'IN_PROGRESS',
        project: 'All Buildings',
        progress: 40
      },
      { 
        id: 4, 
        title: 'Document Verification - Concrete Supplier', 
        taskType: 'DOCUMENT_VERIFICATION', 
        dueDate: '2024-01-22', 
        priority: 'MEDIUM', 
        status: 'NOT_STARTED',
        project: 'Residential Tower',
        progress: 0
      }
    ],
    performance: {
      tasksCompleted: 18,
      totalTasks: 22,
      overdueTasks: 1,
      onTimeRate: 92,
      efficiencyScore: 88,
      qualityScore: 95
    },
    weeklyActivity: [    
      { day: 'Mon', completed: 3, assigned: 4 },
      { day: 'Tue', completed: 2, assigned: 3 },
      { day: 'Wed', completed: 4, assigned: 5 },
      { day: 'Thu', completed: 3, assigned: 4 },
      { day: 'Fri', completed: 2, assigned: 3 },
      { day: 'Sat', completed: 1, assigned: 2 },
      { day: 'Sun', completed: 0, assigned: 1 }
    ],
    quickStats: {       
      vendorsProcessed: 12,
      rfqsEvaluated: 8,
      contractsReviewed: 6,
      savingsIdentified: 450000
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

      console.log('🔄 Fetching officer dashboard data from API...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/officer`, {
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
        console.log('✅ Successfully loaded real officer data from API');
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
    if (data) {
      setDashboardData(data);
      setDataSource('api');
      setLoading(false);
    } else {
      fetchDashboardData();
    }
  }, [data]);

  const handleRetry = () => {
    fetchDashboardData();
  };

  // Data Source Indicator Component (same as ManagerDashboard)
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

  // KPI Card Component (same as ManagerDashboard)
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

  // Priority Badge Component (same as ManagerDashboard)
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

  // Status Badge Component (adapted from ManagerDashboard)
  const StatusBadge = ({ status }) => {
    const config = {
      'IN_PROGRESS': { color: 'bg-blue-100 text-blue-800' },
      'NOT_STARTED': { color: 'bg-gray-100 text-gray-800' },
      'COMPLETED': { color: 'bg-green-100 text-green-800' },
      'OVERDUE': { color: 'bg-red-100 text-red-800' },
      'PENDING': { color: 'bg-purple-100 text-purple-800' }
    };
    
    const { color } = config[status] || config['NOT_STARTED'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  // Project Badge Component
  const ProjectBadge = ({ project }) => (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
      {project}
    </span>
  );

  // Metric Row Component (same as ManagerDashboard)
  const MetricRow = ({ label, value, subtext, progress, trend, alert }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-sm text-gray-500">{subtext}</p>
        {progress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${
                progress > 80 ? 'bg-green-500' : 
                progress > 60 ? 'bg-yellow-500' : 'bg-blue-500'
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

    
  const dataToUse = dashboardData || generateFallbackData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading Officer Dashboard...</h2>
          <p className="text-gray-600 mt-2">Connecting to procurement database</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
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

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header with Data Source Indicator */}       
            <DataSourceIndicator />       

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

      {/* Personal Metrics KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<FileText className="text-blue-500" size={24} />}
          title="My Tasks"
          value={dataToUse.personalMetrics?.myTasks || 0}
          subtitle="Currently assigned"
          color="primary"
          trend="+12.5%"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Clock className="text-amber-500" size={24} />}
          title="Upcoming Deadlines"
          value={dataToUse.personalMetrics?.upcomingDeadlines || 0}
          subtitle="Next 7 days"
          color="warning"
          trend="-8.3%"
          trendPositive={false}
        />
        
        <KPICard
          icon={<AlertTriangle className="text-red-500" size={24} />}
          title="Pending Review"
          value={dataToUse.personalMetrics?.pendingSubmissions || 0}
          subtitle="Awaiting manager approval"
          color="error"
          trend="+5.7%"
          trendPositive={true}
        />
        
        <KPICard
          icon={<CheckCircle className="text-green-500" size={24} />}
          title="Completed This Week"
          value={dataToUse.personalMetrics?.completedThisWeek || 0}
          subtitle="Your weekly progress"
          color="success"
          trend="+15.2%"
          trendPositive={true}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Work - LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Your Assigned Work</h3>
                  <p className="text-gray-600 text-sm">Active tasks and current assignments</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {dataToUse.assignedWork?.length || 0} tasks
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Task / Deliverable</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Project</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Due Date</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Priority</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Progress</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dataToUse.assignedWork?.map((task) => (
                    <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-800">{task.title}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {task.taskType?.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <ProjectBadge project={task.project} />
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-gray-700">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                          {new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && (
                            <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                task.progress >= 80 ? 'bg-green-500' : 
                                task.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-4 px-6">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                          <Play size={14} />
                          {task.status === 'NOT_STARTED' ? 'Start' : 'Continue'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Performance & Stats - RIGHT COLUMN (1/3 width) */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Performance Overview</h3>
            
            <div className="space-y-6">
              <MetricRow 
                label="On-Time Completion"
                value={`${dataToUse.performance?.onTimeRate || 0}%`}
                subtext="Tasks completed by deadline"
                progress={dataToUse.performance?.onTimeRate || 0}
                trend="up"
              />
              
              <MetricRow 
                label="Efficiency Score"
                value={`${dataToUse.performance?.efficiencyScore || 0}%`}
                subtext="Based on task completion rate"
                progress={dataToUse.performance?.efficiencyScore || 0}
                trend="up"
              />
              
              <MetricRow 
                label="Quality Rating"
                value={`${dataToUse.performance?.qualityScore || 0}%`}
                subtext="Manager feedback score"
                progress={dataToUse.performance?.qualityScore || 0}
                trend="up"
              />
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-800">{dataToUse.performance?.tasksCompleted || 0}</p>
                  <p className="text-sm text-green-700">Completed</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-800">{dataToUse.performance?.overdueTasks || 0}</p>
                  <p className="text-sm text-red-700">Overdue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Weekly Activity</h3>
            
            <div className="space-y-4">
            {(dataToUse.weeklyActivity || []).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 w-12">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center h-6">
                      <div 
                        className="bg-blue-500 h-2 rounded-l"
                        style={{ width: `${Math.min((day.assigned / 5) * 100, 100)}%` }}
                        title={`Assigned: ${day.assigned}`}
                      ></div>
                      <div 
                        className="bg-green-500 h-2 rounded-r"
                        style={{ width: `${Math.min((day.completed / 5) * 100, 100)}%` }}
                        title={`Completed: ${day.completed}`}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right w-20">
                    <span className="text-sm font-medium">{day.completed}/{day.assigned}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Assigned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{dataToUse.quickStats?.vendorsProcessed || 0}</div>
            <p className="text-sm text-gray-600">Vendors Processed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{dataToUse.quickStats?.rfqsEvaluated || 0}</div>
            <p className="text-sm text-gray-600">RFQs Evaluated</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{dataToUse.quickStats?.contractsReviewed || 0}</div>
            <p className="text-sm text-gray-600">Contracts Reviewed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">
              SAR {(dataToUse.quickStats?.savingsIdentified || 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Savings Identified</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;