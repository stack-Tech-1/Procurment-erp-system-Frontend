// frontend/src/components/dashboards/OfficerDashboard.js
"use client";
import { useState, useEffect } from 'react';
import { queryCache, STALE_TIMES } from '@/utils/queryCache';
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
    } else {
      setDashboardData(generateFallbackData());
      setDataSource('api');
    }
    setLoading(false);
  }, [data]);

  const handleRetry = () => {
    fetchDashboardData();
  };

  // ── My Tasks state ──────────────────────────────────────────────────────────
  const [myTasks, setMyTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [expandedTask, setExpandedTask] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', progressPct: 0, remarks: '' });
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState(null);

  const fetchMyTasks = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const params = new URLSearchParams();
      if (taskFilter !== 'ALL') params.set('status', taskFilter);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      const cacheKey = `/api/tasks/my-tasks?${params}`;
      const cached = queryCache.get(cacheKey);
      if (cached && !cached.isStale) { setMyTasks(cached.data?.data || cached.data || []); return; }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${cacheKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setMyTasks(json.data || []);
        queryCache.set(cacheKey, json, STALE_TIMES.SHORT);
      }
    } catch (e) {
      console.error('fetchMyTasks error:', e);
    }
  };

  useEffect(() => { fetchMyTasks(); }, [taskFilter, priorityFilter]);
  // Removed setInterval — queryCache stale-while-revalidate handles background refreshes.

  const handleTaskUpdate = async (taskId) => {
    const token = localStorage.getItem('authToken');
    if (!token || !updateForm.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm),
      });
      if (res.ok) {
        setUpdateMsg('Updated successfully');
        setExpandedTask(null);
        await fetchMyTasks();
        setTimeout(() => setUpdateMsg(null), 2500);
      }
    } catch (e) {
      console.error('Task update error:', e);
    } finally {
      setUpdating(false);
    }
  };

  const openExpand = (task) => {
    setExpandedTask(expandedTask === task.id ? null : task.id);
    setUpdateForm({ status: task.status, progressPct: task.progressPct || 0, remarks: task.remarks || '' });
  };

  // Derived stats for task KPI row
  const now = new Date();
  const tasksDueToday = myTasks.filter(t => t.daysUntilDue === 0 && t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
  const tasksOverdue = myTasks.filter(t => t.status === 'OVERDUE').length;
  const tasksInProgress = myTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const completedThisMonth = myTasks.filter(t => t.status === 'COMPLETED').length;

  const PRIORITY_BORDER = { URGENT: '#dc2626', HIGH: '#f97316', MEDIUM: '#3b82f6', LOW: '#9ca3af' };
  const STATUS_TABS = ['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED'];

  const filteredTasks = myTasks.filter(t => {
    if (taskFilter !== 'ALL' && t.status !== taskFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

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
      {dataSource === 'fallback' && myTasks.length === 0 && (
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

      {/* My Tasks — Live Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-yellow-100"><Clock className="text-yellow-700" size={20} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{tasksDueToday}</p><p className="text-xs text-gray-500">Due Today</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-100"><AlertTriangle className="text-red-600" size={20} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{tasksOverdue}</p><p className="text-xs text-gray-500">Overdue</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100"><TrendingUp className="text-blue-600" size={20} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{tasksInProgress}</p><p className="text-xs text-gray-500">In Progress</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-100"><CheckCircle className="text-green-600" size={20} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{completedThisMonth}</p><p className="text-xs text-gray-500">Completed (Total)</p></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Work - LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">My Tasks</h3>
                  <p className="text-gray-500 text-sm">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status tabs */}
                  <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
                    {STATUS_TABS.map(tab => (
                      <button
                        key={tab}
                        onClick={() => setTaskFilter(tab)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          taskFilter === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab === 'ALL' ? 'All' : tab.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                  {/* Priority filter */}
                  <select
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-700"
                  >
                    <option value="ALL">All Priorities</option>
                    {['URGENT','HIGH','MEDIUM','LOW'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              {updateMsg && (
                <div className="mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{updateMsg}</div>
              )}
            </div>

            {/* Task Cards */}
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No tasks match the selected filters.</div>
              ) : filteredTasks.map(task => {
                const isExpanded = expandedTask === task.id;
                const borderColor = PRIORITY_BORDER[task.priority] || '#9ca3af';
                const daysText = task.daysUntilDue < 0
                  ? `${Math.abs(task.daysUntilDue)} day${Math.abs(task.daysUntilDue) !== 1 ? 's' : ''} overdue`
                  : task.daysUntilDue === 0 ? 'Due today'
                  : `Due in ${task.daysUntilDue} day${task.daysUntilDue !== 1 ? 's' : ''}`;
                const daysColor = task.daysUntilDue < 0 ? 'text-red-600' : task.daysUntilDue <= 2 ? 'text-orange-500' : 'text-green-600';

                return (
                  <div key={task.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex" style={{ borderLeft: `4px solid ${borderColor}` }}>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-800 truncate">{task.title}</p>
                              {task.isEscalated && (
                                <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">ESCALATED</span>
                              )}
                            </div>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {task.taskType?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {task.assignedByName && <span>By: <span className="font-medium text-gray-700">{task.assignedByName}</span></span>}
                          <span className={`font-semibold ${daysColor}`}>{daysText}</span>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${task.progressPct || 0}%`, backgroundColor: '#B8960A' }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{task.progressPct || 0}%</span>
                        </div>
                      </div>

                      <div className="flex items-center px-3">
                        <button
                          onClick={() => openExpand(task)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          {isExpanded ? 'Cancel' : 'Update'}
                        </button>
                      </div>
                    </div>

                    {/* Inline Update Form */}
                    {isExpanded && (
                      <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select
                              value={updateForm.status}
                              onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}
                              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                            >
                              {['NOT_STARTED','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Progress: {updateForm.progressPct}%
                            </label>
                            <input
                              type="range" min={0} max={100} step={5}
                              value={updateForm.progressPct}
                              onChange={e => setUpdateForm(f => ({ ...f, progressPct: parseInt(e.target.value) }))}
                              className="w-full accent-yellow-600"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                          <textarea
                            rows={2}
                            value={updateForm.remarks}
                            onChange={e => setUpdateForm(f => ({ ...f, remarks: e.target.value }))}
                            placeholder="Optional notes..."
                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm resize-none"
                          />
                        </div>
                        <button
                          onClick={() => handleTaskUpdate(task.id)}
                          disabled={updating}
                          className="px-4 py-1.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
                          style={{ backgroundColor: '#B8960A' }}
                        >
                          {updating ? 'Saving...' : 'Save Update'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
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