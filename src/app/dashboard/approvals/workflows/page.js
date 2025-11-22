// frontend/src/app/dashboard/approvals/workflows/page.js - MOBILE OPTIMIZED
"use client";
import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Workflow, 
  Settings, 
  RefreshCw,
  Info
} from 'lucide-react';
import WorkflowBuilder from '@/components/approvals/WorkflowBuilder';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function WorkflowsPage() {
  const [loading, setLoading] = useState(true);
  const [workflowStats, setWorkflowStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    pendingApprovals: 0,
    completionRate: 0
  });

  useEffect(() => {
    // Simulate loading and data fetching
    const timer = setTimeout(() => {
      setLoading(false);
      // Mock workflow statistics
      setWorkflowStats({
        totalWorkflows: 12,
        activeWorkflows: 8,
        pendingApprovals: 15,
        completionRate: 78
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Navigation Header Component
  const NavigationHeader = () => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors p-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Back to Approvals</span>
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Workflow className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Workflow Builder
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Design and configure multi-step approval workflows
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          <Settings className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </div>
  );

  // Workflow Statistics Cards
  const WorkflowStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Total Workflows</p>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{workflowStats.totalWorkflows}</p>
          </div>
          <Workflow className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Active</p>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{workflowStats.activeWorkflows}</p>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Workflow className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Pending</p>
            <p className="text-lg sm:text-2xl font-bold text-orange-600">{workflowStats.pendingApprovals}</p>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Completion Rate</p>
            <p className="text-lg sm:text-2xl font-bold text-purple-600">{workflowStats.completionRate}%</p>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Info className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  // Quick Tips Panel for Mobile
  const QuickTipsPanel = () => (
    <div className="lg:hidden bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
        <Info className="w-4 h-4 mr-2" />
        Quick Tips
      </h3>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Drag and drop to reorder approval steps</li>
        <li>• Set SLA deadlines for each step</li>
        <li>• Configure conditional routing rules</li>
        <li>• Test workflows before activating</li>
      </ul>
    </div>
  );

  // Loading State Component
  const LoadingState = () => (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-lg text-gray-600">Loading workflow builder...</div>
        <p className="text-sm text-gray-500 mt-2">Preparing your workflow configuration environment</p>
      </div>
    </div>
  );

  // Main Content Component
  const MainContent = () => (
    <div className="space-y-6">
      <NavigationHeader />
      <WorkflowStats />
      <QuickTipsPanel />
      
      {/* Workflow Builder Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Create New Workflow
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Configure multi-step approval processes with conditional routing
          </p>
        </div>
        
        <div className="p-4 sm:p-6">
          <WorkflowBuilder />
        </div>
      </div>

      {/* Mobile Help Section */}
      <div className="lg:hidden bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Workflow builder is optimized for desktop use. For complex workflows, we recommend using a larger screen.
        </p>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View Documentation →
        </button>
      </div>
    </div>
  );

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full">
        {loading ? <LoadingState /> : <MainContent />}
      </div>
    </ResponsiveLayout>
  );
}