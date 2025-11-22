// frontend/src/app/dashboard/tasks/page.js - MOBILE OPTIMIZED
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users,
  TrendingUp,
  Filter,
  Plus,
  RefreshCw
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import TasksPage from '@/components/tasks/TasksPage';

export default function TasksManagementPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0
  });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.replace('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Simulate fetching task statistics
    setTimeout(() => {
      setTaskStats({
        total: 24,
        completed: 18,
        pending: 4,
        overdue: 2,
        completionRate: 75
      });
      setLoading(false);
    }, 500);
  }, [router]);

  // Enhanced Tasks Header Component
  const TasksHeader = () => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
          <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
          Task Management
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Track and manage your assigned tasks and workflows
        </p>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Filter Button */}
        <button
          className="lg:hidden p-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          title="Filters"
        >
          <Filter className="w-4 h-4" />
        </button>

        {/* Refresh Button */}
        <button
          className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* New Task Button */}
        <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          <Plus className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </div>
  );

  // Task Statistics Cards
  const TaskStatistics = () => (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Total Tasks</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{taskStats.total}</p>
          </div>
          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Completed</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{taskStats.completed}</p>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Pending</p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Overdue</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{taskStats.overdue}</p>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Completion Rate</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-600">{taskStats.completionRate}%</p>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  // Quick Actions Panel for Mobile
  const QuickActionsPanel = () => (
    <div className="lg:hidden bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
        <Users className="w-4 h-4 mr-2" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button className="flex items-center justify-center p-2 bg-white border border-blue-200 rounded text-blue-600 text-sm font-medium hover:bg-blue-100">
          <CheckCircle className="w-4 h-4 mr-1" />
          Mark Complete
        </button>
        <button className="flex items-center justify-center p-2 bg-white border border-blue-200 rounded text-blue-600 text-sm font-medium hover:bg-blue-100">
          <Clock className="w-4 h-4 mr-1" />
          Set Reminder
        </button>
      </div>
    </div>
  );

  // Loading State Component
  const LoadingState = () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg text-gray-600">Loading task management...</div>
        <p className="text-sm text-gray-500 mt-2">Preparing your task dashboard</p>
      </div>
    </div>
  );

  // Main Content Component
  const MainContent = () => (
    <div className="space-y-6">
      <TasksHeader />
      <TaskStatistics />
      <QuickActionsPanel />
      
      {/* Tasks Page Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            My Tasks
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Manage your assigned tasks, track progress, and meet deadlines
          </p>
        </div>
        
        <div className="p-4 sm:p-6">
          <TasksPage />
        </div>
      </div>

      {/* Mobile Help Section */}
      <div className="lg:hidden bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Task Management Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Swipe left on tasks for quick actions</li>
          <li>• Tap deadlines to set reminders</li>
          <li>• Use filters to focus on priority tasks</li>
          <li>• Check progress bars for completion status</li>
        </ul>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="max-w-7xl mx-auto w-full">
          <LoadingState />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full">
        <MainContent />
      </div>
    </ResponsiveLayout>
  );
}