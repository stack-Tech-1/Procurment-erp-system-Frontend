"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, Loader2, CheckCircle, XCircle, User, Mail, ToggleRight,
    Building, Briefcase, IdCard, Clock, Eye, Edit, Shield, Key,
    Save, X, Settings, Check, Square, Activity, FileText, Search,
    Filter, Calendar, Download, RefreshCw, Bell, ListTodo, Workflow,
    CheckSquare, AlertCircle, ArrowRight, Plus, MoreVertical, Inbox
} from 'lucide-react';
import { toast } from 'react-hot-toast'; 

// Components for Layout
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const API_BASE_URL =  `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

// --- Notification Center Component ---
const NotificationCenter = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }) => {
    if (!isOpen) return null;
  
    const getNotificationIcon = (type) => {
      const icons = {
        TASK_ASSIGNED: <ListTodo className="w-5 h-5 text-blue-500" />,
        APPROVAL_REQUIRED: <CheckSquare className="w-5 h-5 text-orange-500" />,
        APPROVAL_APPROVED: <CheckCircle className="w-5 h-5 text-green-500" />,
        APPROVAL_REJECTED: <XCircle className="w-5 h-5 text-red-500" />,
        ESCALATION: <AlertCircle className="w-5 h-5 text-red-500" />,
        SYSTEM: <Bell className="w-5 h-5 text-purple-500" />
      };
      return icons[type] || <Bell className="w-5 h-5 text-gray-500" />;
    };
  
    const getNotificationColor = (type) => {
      const colors = {
        TASK_ASSIGNED: 'bg-blue-50 border-blue-200',
        APPROVAL_REQUIRED: 'bg-orange-50 border-orange-200',
        APPROVAL_APPROVED: 'bg-green-50 border-green-200',
        APPROVAL_REJECTED: 'bg-red-50 border-red-200',
        ESCALATION: 'bg-red-50 border-red-200',
        SYSTEM: 'bg-purple-50 border-purple-200'
      };
      return colors[type] || 'bg-gray-50 border-gray-200';
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Inbox className="w-6 h-6 mr-2 text-blue-600" />
              Notifications ({notifications.filter(n => !n.read).length} unread)
            </h3>
            <div className="flex items-center space-x-2">
              {notifications.some(n => !n.read) && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
  
          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No notifications</p>
                <p className="text-gray-400 text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    getNotificationColor(notification.type)
                  } ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => onMarkAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // --- Approval Workflow Component ---
  const ApprovalWorkflow = ({ workflow, onApprove, onReject, onClose }) => {
    const [comment, setComment] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
  
    const handleAction = async (action) => {
      setActionLoading(action);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (action === 'approve') {
          onApprove(workflow.id, comment);
        } else {
          onReject(workflow.id, comment);
        }
        
        setComment('');
        toast.success(`Workflow ${action}d successfully!`);
      } catch (error) {
        toast.error(`Failed to ${action} workflow`);
      } finally {
        setActionLoading(null);
      }
    };
  
    if (!workflow) return null;
  
    const getStatusColor = (status) => {
      const colors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        IN_PROGRESS: 'bg-blue-100 text-blue-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };
  
    const getStepStatus = (step, currentStep) => {
      if (step.stepNumber < currentStep) return 'completed';
      if (step.stepNumber === currentStep) return 'current';
      return 'pending';
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Workflow className="w-6 h-6 mr-2 text-blue-600" />
                Approval Workflow - {workflow.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Review and take action on this workflow item
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <div className="p-6 space-y-6">
            {/* Workflow Header */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                  {workflow.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  workflow.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                  workflow.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {workflow.priority}
                </span>
              </div>
            </div>
  
            {/* Workflow Steps */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Approval Steps</h4>
              <div className="space-y-3">
                {workflow.steps?.map((step) => {
                  const stepStatus = getStepStatus(step, workflow.currentStep);
                  return (
                    <div key={step.stepNumber} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        stepStatus === 'completed' ? 'bg-green-100 text-green-600' :
                        stepStatus === 'current' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {stepStatus === 'completed' ? <Check className="w-4 h-4" /> : step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{step.role}</p>
                        <p className="text-sm text-gray-500">
                          {stepStatus === 'completed' ? `Approved by ${step.approver}` :
                           stepStatus === 'current' ? 'Waiting for approval' :
                           'Pending'}
                        </p>
                        {step.comment && (
                          <p className="text-sm text-gray-600 mt-1">Comment: {step.comment}</p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {step.completedAt ? new Date(step.completedAt).toLocaleDateString() : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
  
            {/* Approval Actions */}
            {workflow.status === 'PENDING' && workflow.currentStep && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-800 mb-4">Take Action</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="Add comments for your decision..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50"
                    >
                      {actionLoading === 'reject' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                    >
                      {actionLoading === 'approve' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };



// --- Task Assignment Modal ---
const TaskAssignmentModal = ({ user, isOpen, onClose, onTaskAssigned }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        type: 'REVIEW',
        requiresApproval: true,
        approvalWorkflow: 'SINGLE_APPROVAL'
      });
    
      const [assigning, setAssigning] = useState(false);
    
      const taskTypes = [
        { value: 'REVIEW', label: 'Review Task', icon: Eye },
        { value: 'APPROVAL', label: 'Approval Task', icon: CheckSquare },
        { value: 'UPDATE', label: 'Update Task', icon: Edit },
        { value: 'VERIFICATION', label: 'Verification Task', icon: Shield }
      ];
    
      const workflowTypes = [
        { value: 'SINGLE_APPROVAL', label: 'Single Approval (Manager)' },
        { value: 'DOUBLE_APPROVAL', label: 'Double Approval (Manager → Head)' },
        { value: 'TRIPLE_APPROVAL', label: 'Triple Approval (Officer → Manager → Head)' }
      ];
    
      const handleAssignTask = async () => {
        if (!formData.title || !formData.dueDate) {
          toast.error('Title and due date are required');
          return;
        }
    
        setAssigning(true);
        try {
          // Simulate API call with workflow
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create notification for assigned task
          const newNotification = {
            id: Date.now(),
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: `You have been assigned: "${formData.title}"`,
            read: false,
            createdAt: new Date().toISOString()
          };
          
          // In a real app, this would be sent to the backend
          console.log('Task assigned with workflow:', formData);
          
          toast.success(`Task assigned to ${user.name} with approval workflow!`);
          onTaskAssigned();
          onClose();
        } catch (error) {
          toast.error('Failed to assign task');
        } finally {
          setAssigning(false);
        }
      };
    
      if (!isOpen || !user) return null;
    
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ListTodo className="w-6 h-6 mr-2 text-blue-600" />
                Assign Task with Workflow
              </h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
    
            <div className="p-6 space-y-4">
              {/* Assigned To */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Assigning to:</p>
                <p className="font-semibold text-blue-800">{user.name} ({user.role?.name})</p>
              </div>
    
              {/* Task Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter task title"
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {taskTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
    
              {/* Workflow Settings */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Approval Workflow</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresApproval}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        requiresApproval: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Requires approval workflow
                    </label>
                  </div>
    
                  {formData.requiresApproval && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Workflow Type
                      </label>
                      <select
                        value={formData.approvalWorkflow}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          approvalWorkflow: e.target.value 
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        {workflowTypes.map(workflow => (
                          <option key={workflow.value} value={workflow.value}>
                            {workflow.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.approvalWorkflow === 'SINGLE_APPROVAL' && 'Requires manager approval'}
                        {formData.approvalWorkflow === 'DOUBLE_APPROVAL' && 'Requires manager and head approval'}
                        {formData.approvalWorkflow === 'TRIPLE_APPROVAL' && 'Requires officer, manager, and head approval'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
    
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter task description..."
                />
              </div>
            </div>
    
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTask}
                disabled={assigning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                {assigning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckSquare className="w-4 h-4 mr-2" />
                )}
                Assign Task
              </button>
            </div>
          </div>
        </div>
      );
    };
  
  // --- User Tasks Panel ---
  const UserTasksPanel = ({ userId, userName, isOpen, onClose }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
  
    // Mock tasks data
    const mockTasks = [
      {
        id: 1,
        title: 'Review Vendor Application',
        type: 'REVIEW',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        assignedBy: 'Admin User',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Approve RFQ Submission',
        type: 'APPROVAL',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignedBy: 'Procurement Manager',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setTasks(mockTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks(mockTasks); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };
  
    const getPriorityColor = (priority) => {
      const colors = {
        LOW: 'bg-gray-100 text-gray-800',
        MEDIUM: 'bg-blue-100 text-blue-800',
        HIGH: 'bg-orange-100 text-orange-800',
        URGENT: 'bg-red-100 text-red-800'
      };
      return colors[priority] || 'bg-gray-100 text-gray-800';
    };
  
    const getStatusColor = (status) => {
      const colors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        IN_PROGRESS: 'bg-blue-100 text-blue-800',
        COMPLETED: 'bg-green-100 text-green-800',
        OVERDUE: 'bg-red-100 text-red-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };
  
    useEffect(() => {
      if (isOpen && userId) {
        fetchTasks();
      }
    }, [isOpen, userId]);
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <ListTodo className="w-6 h-6 mr-2 text-blue-600" />
                User Tasks - {userName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Assigned tasks and workflow items
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
  
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading tasks...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{task.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span> {task.type.replace('_', ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Assigned by:</span> {task.assignedBy}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:text-blue-800 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:text-green-800 transition">
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-12">
                    <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tasks assigned</p>
                    <p className="text-gray-400 text-sm">This user has no pending tasks</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  




// --- User Activity Log Component ---
const UserActivityLog = ({ userId, userName, isOpen, onClose }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '',
    actionType: '',
    entity: ''
  });

  const fetchAuditLogs = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/${userId}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setAuditLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // For now, we'll use mock data since you may not have the backend yet
      setAuditLogs(getMockAuditLogs());
      toast.error('Failed to load audit logs - showing sample data');
    } finally {
      setLoading(false);
    }
  };

  const getMockAuditLogs = () => [
    {
      id: 1,
      action: 'LOGIN',
      entity: 'User',
      entityId: userId,
      description: 'User logged into the system',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      action: 'VIEW_VENDOR',
      entity: 'Vendor',
      entityId: 123,
      description: 'Viewed vendor profile: ABC Construction',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      action: 'UPDATE_PROFILE',
      entity: 'User',
      entityId: userId,
      description: 'Updated user profile information',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const exportLogs = () => {
    // Simple CSV export functionality
    const csvContent = auditLogs.map(log => 
      `${log.createdAt},${log.action},${log.entity},${log.description},${log.ipAddress}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-${userName}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Activity log exported successfully');
  };

  const getActionColor = (action) => {
    const actionColors = {
      LOGIN: 'bg-blue-100 text-blue-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      VIEW: 'bg-purple-100 text-purple-800',
      APPROVE: 'bg-indigo-100 text-indigo-800',
      REJECT: 'bg-pink-100 text-pink-800'
    };
    return actionColors[action] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchAuditLogs();
    }
  }, [isOpen, userId, filters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              User Activity Log - {userName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Tracking user actions and system interactions
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select 
                value={filters.actionType}
                onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
              </select>
            </div>
            
            <button
              onClick={fetchAuditLogs}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={exportLogs}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Activity Log Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading activity logs...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">{log.entity}</span>
                        {log.entityId && (
                          <span className="text-sm text-gray-400">ID: {log.entityId}</span>
                        )}
                      </div>
                      <p className="text-gray-800 font-medium">{log.description}</p>
                      {log.ipAddress && (
                        <p className="text-sm text-gray-500 mt-1">
                          IP: {log.ipAddress} • {log.userAgent}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center space-x-1 justify-end">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {auditLogs.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No activity records found</p>
                  <p className="text-gray-400 text-sm">User activity will appear here as they use the system</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Permission Matrix Component ---
const PermissionMatrix = ({ roles, permissions, onPermissionChange, onClose }) => {
  // Sample permission structure - you can customize based on your modules
  const modules = [
    { id: 'vendors', name: 'Vendors', actions: ['view', 'create', 'edit', 'approve'] },
    { id: 'rfqs', name: 'RFQs', actions: ['view', 'create', 'edit', 'approve'] },
    { id: 'contracts', name: 'Contracts', actions: ['view', 'create', 'edit', 'approve'] },
    { id: 'purchase_orders', name: 'Purchase Orders', actions: ['view', 'create', 'edit', 'approve'] },
    { id: 'reports', name: 'Reports', actions: ['view', 'export'] },
    { id: 'user_management', name: 'User Management', actions: ['view', 'edit', 'delete'] },
  ];

  const togglePermission = (roleId, moduleId, action) => {
    const updatedPermissions = {
      ...permissions,
      [roleId]: {
        ...permissions[roleId],
        [moduleId]: {
          ...permissions[roleId]?.[moduleId],
          [action]: !permissions[roleId]?.[moduleId]?.[action]
        }
      }
    };
    onPermissionChange(updatedPermissions);
  };

  const savePermissions = () => {
    onPermissionChange(permissions);
    toast.success('Permissions updated successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            Role Permission Matrix
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border">
                    Module / Action
                  </th>
                  {roles.map(role => (
                    <th key={role.id} className="px-4 py-3 text-center text-sm font-medium text-gray-700 border">
                      <div className="flex flex-col items-center">
                        <span>{role.name}</span>
                        <span className="text-xs text-gray-500">({role.usersCount} users)</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map(module => (
                  <React.Fragment key={module.id}>
                    <tr className="bg-gray-25">
                      <td className="px-4 py-3 font-semibold text-gray-800 border bg-blue-50">
                        {module.name}
                      </td>
                      {roles.map(role => (
                        <td key={role.id} className="px-4 py-3 border bg-blue-50"></td>
                      ))}
                    </tr>
                    {module.actions.map(action => (
                      <tr key={`${module.id}-${action}`} className="hover:bg-gray-50">
                        <td className="px-4 py-2 pl-8 text-sm text-gray-600 border">
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </td>
                        {roles.map(role => (
                          <td key={role.id} className="px-4 py-2 text-center border">
                            <button
                              onClick={() => togglePermission(role.id, module.id, action)}
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                permissions[role.id]?.[module.id]?.[action]
                                  ? 'bg-green-500 border-green-600 text-white'
                                  : 'bg-white border-gray-300 hover:border-green-400'
                              }`}
                            >
                              {permissions[role.id]?.[module.id]?.[action] && <Check className="w-4 h-4" />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={savePermissions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Enhanced User Profile Panel with Activity ---
const UserProfilePanel = ({ user, isOpen, onClose, onUpdate, onAssignTask }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [showActivityLog, setShowActivityLog] = useState(false);
    const [showTasks, setShowTasks] = useState(false);;
  
    useEffect(() => {
      if (user) {
        setFormData({
          employeeId: user.employeeId || '',
          jobTitle: user.jobTitle || '',
          department: user.department || '',
        });
      }
    }, [user]);
  
    const handleSave = async () => {
      try {
        const token = localStorage.getItem('authToken');
        await axios.patch(`${API_BASE_URL}/${user.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('User profile updated successfully!');
        setEditMode(false);
        onUpdate();
      } catch (error) {
        toast.error('Failed to update user profile');
      }
    };
  
    if (!isOpen || !user) return null;

    // Add Tasks section to the profile panel
  const TasksSection = () => (
    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <ListTodo className="w-4 h-4 mr-2 text-green-600" />
          Task Overview
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowTasks(true)}
            className="text-green-600 hover:text-green-800 text-sm flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View All
          </button>
          <button
            onClick={() => onAssignTask(user)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Assign Task
          </button>
        </div>
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Pending Tasks:</span>
          <p className="font-medium text-orange-600">2</p>
        </div>
        <div>
          <span className="text-gray-600">Overdue:</span>
          <p className="font-medium text-red-600">0</p>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Last task assigned: Today
      </div>
    </div>
  );
  
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                User Profile - {user.name}
              </h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter employee ID"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.employeeId || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter job title"
                  />
                ) : (
                  <p className="text-gray-900">{user.jobTitle || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                {editMode ? (
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Department</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Contracts">Contracts</option>
                    <option value="Finance">Finance</option>
                    <option value="Technical">Technical</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{user.department || 'Not set'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Activity</label>
                <p className="text-gray-900 text-sm">
                  {user.lastLoginDate 
                    ? new Date(user.lastLoginDate).toLocaleString() 
                    : 'No activity recorded'
                  }
                </p>
              </div>
            </div>

            {/* Add Tasks Section */}
         <TasksSection />
            
            {/* Activity Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-600" />
                Activity Overview
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Last Login:</span>
                  <p className="font-medium">
                    {user.lastLoginDate 
                      ? new Date(user.lastLoginDate).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Account Created:</span>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowActivityLog(true)}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <FileText className="w-4 h-4 mr-1" />
                View Detailed Activity Log
              </button>
            </div>
            
            {/* Role Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Role Information</h4>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  user.roleId === 1 ? 'bg-indigo-100 text-indigo-800' :
                  user.roleId === 2 ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.role?.name || 'Unknown Role'}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  <Settings className="w-4 h-4 mr-1" />
                  Change Role
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              {editMode ? (
                <>
                  <button 
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

         
  
        {/* Activity Log Modal */}
      {showActivityLog && (
        <UserActivityLog
          userId={user.id}
          userName={user.name}
          isOpen={showActivityLog}
          onClose={() => setShowActivityLog(false)}
        />
      )}

      {/* Tasks Modal */}
      {showTasks && (
        <UserTasksPanel
          userId={user.id}
          userName={user.name}
          isOpen={showTasks}
          onClose={() => setShowTasks(false)}
        />
      )}
    </>
  );
};




  // --- Enhanced Summary Cards Component ---
const EnhancedSummaryCards = ({ activityStats }) => (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{activityStats.totalUsers || 0}</p>
          </div>
          <Users className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Active Today</p>
            <p className="text-2xl font-bold text-green-600">{activityStats.activeToday || 0}</p>
          </div>
          <Activity className="w-8 h-8 text-green-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Active This Week</p>
            <p className="text-2xl font-bold text-orange-600">{activityStats.activeThisWeek || 0}</p>
          </div>
          <Calendar className="w-8 h-8 text-orange-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Never Logged In</p>
            <p className="text-2xl font-bold text-red-600">{activityStats.neverLoggedIn || 0}</p>
          </div>
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Most Active Dept</p>
            <p className="text-lg font-bold text-purple-600 truncate">{activityStats.mostActiveDepartment || 'N/A'}</p>
          </div>
          <Building className="w-8 h-8 text-purple-500" />
        </div>
      </div>
    </div>
  );


// --- Enhanced User Management Content ---
const UserManagementContent = ({ users, loading, error, fetchUsers, handleToggleStatus }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showPermissions, setShowPermissions] = useState(false);
    const [showTaskAssignment, setShowTaskAssignment] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showApprovalWorkflow, setShowApprovalWorkflow] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [activityStats, setActivityStats] = useState({});
    const [workflowStats, setWorkflowStats] = useState({});
    const [notifications, setNotifications] = useState([]);

    // Mock workflow data
    const mockWorkflows = [
        {
            id: 1,
            title: 'Vendor Qualification Review - ABC Construction',
            type: 'VENDOR_APPROVAL',
            status: 'PENDING',
            priority: 'HIGH',
            currentStep: 2,
            steps: [
                { stepNumber: 1, role: 'Procurement Officer', approver: 'John Doe', completedAt: new Date().toISOString(), comment: 'Initial review completed' },
                { stepNumber: 2, role: 'Procurement Manager', approver: null, completedAt: null, comment: null },
                { stepNumber: 3, role: 'Head of Procurement', approver: null, completedAt: null, comment: null }
            ],
            assignedTo: 'Sarah Wilson',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
        }
    ];

    // Mock notifications
    const mockNotifications = [
        {
            id: 1,
            type: 'APPROVAL_REQUIRED',
            title: 'Approval Required',
            message: 'Vendor qualification for ABC Construction requires your approval',
            read: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            type: 'TASK_ASSIGNED',
            title: 'New Task Assigned',
            message: 'You have been assigned: "Review Vendor Application"',
            read: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            type: 'APPROVAL_APPROVED',
            title: 'Approval Completed',
            message: 'Your RFQ submission has been approved by Procurement Manager',
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Initialize notifications
    useEffect(() => {
        setNotifications(mockNotifications);
    }, []);

    // Calculate workflow statistics
    useEffect(() => {
        if (users.length > 0) {
            const stats = {
                totalUsers: users.length,
                usersWithTasks: 8, // Mock data
                pendingApprovals: mockWorkflows.filter(w => w.status === 'PENDING').length,
                overdueTasks: 3, // Mock data
                avgTaskCompletion: '78%' // Mock data
            };
            setWorkflowStats(stats);
        }
    }, [users]);

    // Calculate activity statistics
    useEffect(() => {
        if (users.length > 0) {
            const stats = {
                totalUsers: users.length,
                activeToday: users.filter(u => {
                    if (!u.lastLoginDate) return false;
                    return new Date(u.lastLoginDate).toDateString() === new Date().toDateString();
                }).length,
                activeThisWeek: users.filter(u => {
                    if (!u.lastLoginDate) return false;
                    const daysAgo = Math.floor((new Date() - new Date(u.lastLoginDate)) / (1000 * 60 * 60 * 24));
                    return daysAgo <= 7;
                }).length,
                neverLoggedIn: users.filter(u => !u.lastLoginDate).length,
                mostActiveDepartment: getMostActiveDepartment(users)
            };
            setActivityStats(stats);
        }
    }, [users]);

    // Fetch roles and permissions
    const fetchRolesAndPermissions = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_BASE_URL}/permissions/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && Object.keys(response.data).length > 0) {
                setPermissions(response.data);
            } else {
                setPermissions(getDefaultPermissions());
                console.warn('No permissions data returned from API, using defaults');
            }
            
            const roleData = [
                { id: 1, name: 'Admin', usersCount: users.filter(u => u.roleId === 1).length },
                { id: 2, name: 'Procurement Manager', usersCount: users.filter(u => u.roleId === 2).length },
                { id: 3, name: 'Procurement Officer', usersCount: users.filter(u => u.roleId === 3).length },
                { id: 4, name: 'Vendor', usersCount: users.filter(u => u.roleId === 4).length },
            ];
            setRoles(roleData);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            setPermissions(getDefaultPermissions());
            toast.error('Failed to load role permissions, using defaults');
        }
    };

    useEffect(() => {
        if (users.length > 0) {
            fetchRolesAndPermissions();
        }
    }, [users]);

    // Helper Functions
    const getMostActiveDepartment = (users) => {
        const deptActivity = {};
        users.forEach(user => {
            if (user.department && user.lastLoginDate) {
                const daysAgo = Math.floor((new Date() - new Date(user.lastLoginDate)) / (1000 * 60 * 60 * 24));
                if (daysAgo <= 30) {
                    deptActivity[user.department] = (deptActivity[user.department] || 0) + 1;
                }
            }
        });
        
        return Object.keys(deptActivity).length > 0 
            ? Object.keys(deptActivity).reduce((a, b) => deptActivity[a] > deptActivity[b] ? a : b)
            : 'No data';
    };

    const getDefaultPermissions = () => ({
        1: { // Admin
            vendors: { view: true, create: true, edit: true, approve: true },
            rfqs: { view: true, create: true, edit: true, approve: true },
            contracts: { view: true, create: true, edit: true, approve: true },
            purchase_orders: { view: true, create: true, edit: true, approve: true },
            reports: { view: true, export: true },
            user_management: { view: true, edit: true, delete: true }
        },
        2: { // Procurement Manager
            vendors: { view: true, create: true, edit: true, approve: true },
            rfqs: { view: true, create: true, edit: true, approve: true },
            contracts: { view: true, create: false, edit: false, approve: true },
            purchase_orders: { view: true, create: false, edit: false, approve: true },
            reports: { view: true, export: true },
            user_management: { view: false, edit: false, delete: false }
        },
        3: { // Procurement Officer
            vendors: { view: true, create: true, edit: true, approve: false },
            rfqs: { view: true, create: true, edit: true, approve: false },
            contracts: { view: true, create: false, edit: false, approve: false },
            purchase_orders: { view: true, create: true, edit: true, approve: false },
            reports: { view: true, export: false },
            user_management: { view: false, edit: false, delete: false }
        },
        4: { // Vendor
            vendors: { view: false, create: false, edit: false, approve: false },
            rfqs: { view: true, create: false, edit: false, approve: false },
            contracts: { view: true, create: false, edit: false, approve: false },
            purchase_orders: { view: false, create: false, edit: false, approve: false },
            reports: { view: false, export: false },
            user_management: { view: false, edit: false, delete: false }
        }
    });

    const getActivityStatus = (lastActivity) => {
        if (!lastActivity) return { color: 'text-gray-500', text: 'Never', bg: 'bg-gray-100' };
        
        const daysAgo = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
        
        if (daysAgo <= 7) return { color: 'text-green-600', text: 'Active', bg: 'bg-green-100' };
        if (daysAgo <= 30) return { color: 'text-yellow-600', text: 'Recent', bg: 'bg-yellow-100' };
        return { color: 'text-red-600', text: 'Inactive', bg: 'bg-red-100' };
    };

    // Notification handlers
    const handleMarkAsRead = (notificationId) => {
        setNotifications(prev => prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
        ));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Workflow handlers
    const handleApproveWorkflow = (workflowId, comment) => {
        console.log('Approving workflow:', workflowId, 'with comment:', comment);
        setShowApprovalWorkflow(false);
        setSelectedWorkflow(null);
        
        const newNotification = {
            id: Date.now(),
            type: 'APPROVAL_APPROVED',
            title: 'Workflow Approved',
            message: `You approved: "${selectedWorkflow?.title}"`,
            read: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const handleRejectWorkflow = (workflowId, comment) => {
        console.log('Rejecting workflow:', workflowId, 'with comment:', comment);
        setShowApprovalWorkflow(false);
        setSelectedWorkflow(null);
        
        const newNotification = {
            id: Date.now(),
            type: 'APPROVAL_REJECTED',
            title: 'Workflow Rejected',
            message: `You rejected: "${selectedWorkflow?.title}"`,
            read: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const handlePermissionChange = async (updatedPermissions) => {
        try {
            const token = localStorage.getItem('authToken');
            
            for (const [roleId, rolePermissions] of Object.entries(updatedPermissions)) {
                await axios.put(`${API_BASE_URL}/permissions/roles`, 
                    { roleId: parseInt(roleId), permissions: rolePermissions },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            
            setPermissions(updatedPermissions);
            toast.success('Permissions updated successfully!');
            setShowPermissions(false);
        } catch (error) {
            console.error('Error updating permissions:', error);
            toast.error('Failed to update permissions');
        }
    };

    // Sub-Components
    const NotificationBell = () => {
        const unreadCount = notifications.filter(n => !n.read).length;
        
        return (
            <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-600 hover:text-gray-800 transition"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
        );
    };

    const EnhancedActions = ({ user }) => (
        <div className="flex justify-center space-x-1">
            <button
                onClick={() => {
                    setSelectedUser(user);
                    setShowProfile(true);
                }}
                className="p-2 text-blue-600 hover:text-blue-800 transition"
                title="View Profile"
            >
                <Eye className="w-4 h-4" />
            </button>
            <button
                onClick={() => {
                    setSelectedUser(user);
                    setShowTaskAssignment(true);
                }}
                className="p-2 text-purple-600 hover:text-purple-800 transition"
                title="Assign Task with Workflow"
            >
                <ListTodo className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleToggleStatus(user.id, user.isActive)}
                disabled={user.isUpdating || user.roleId === 1}
                className={`p-2 rounded transition ${
                    user.isUpdating 
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : user.roleId === 1 
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : user.isActive 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                title={user.isActive ? 'Deactivate' : 'Activate'}
            >
                {user.isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <ToggleRight className="w-4 h-4" />
                )}
            </button>
        </div>
    );

    const WorkflowSummaryCards = () => {
        const unreadNotifications = notifications.filter(n => !n.read).length;
        const pendingApprovals = mockWorkflows.filter(w => w.status === 'PENDING').length;

        return (
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div 
                    className="bg-white p-4 rounded-lg shadow border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => setShowNotifications(true)}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Unread Notifications</p>
                            <p className="text-2xl font-bold text-blue-600">{unreadNotifications}</p>
                        </div>
                        <div className="relative">
                            <Bell className="w-8 h-8 text-blue-500" />
                            {unreadNotifications > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadNotifications}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div 
                    className="bg-white p-4 rounded-lg shadow border border-orange-200 cursor-pointer hover:bg-orange-50 transition-colors"
                    onClick={() => {
                        setSelectedWorkflow(mockWorkflows[0]);
                        setShowApprovalWorkflow(true);
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Approvals</p>
                            <p className="text-2xl font-bold text-orange-600">{pendingApprovals}</p>
                        </div>
                        <CheckSquare className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Overdue Tasks</p>
                            <p className="text-2xl font-bold text-red-600">{workflowStats.overdueTasks || 0}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Avg Completion</p>
                            <p className="text-2xl font-bold text-green-600">{workflowStats.avgTaskCompletion || '0%'}</p>
                        </div>
                        <Workflow className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>
        );
    };

    const EnhancedSummaryCards = ({ activityStats }) => (
        <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{activityStats.totalUsers || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Active Today</p>
                        <p className="text-2xl font-bold text-green-600">{activityStats.activeToday || 0}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500" />
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Active This Week</p>
                        <p className="text-2xl font-bold text-orange-600">{activityStats.activeThisWeek || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-orange-500" />
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Never Logged In</p>
                        <p className="text-2xl font-bold text-red-600">{activityStats.neverLoggedIn || 0}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Most Active Dept</p>
                        <p className="text-lg font-bold text-purple-600 truncate">{activityStats.mostActiveDepartment || 'N/A'}</p>
                    </div>
                    <Building className="w-8 h-8 text-purple-500" />
                </div>
            </div>
        </div>
    );

    const EmptyTableState = () => (
        <tr>
            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-lg">
                No users found in the system.
            </td>
        </tr>
    );

    // Main Return
    return (
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
            {/* Loading State */}
            {loading && users.length === 0 && (
                <div className="flex justify-center items-center h-full min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="ml-3 text-lg text-gray-600">Loading user list...</p>
                </div>
            )}
            
            {/* Error State */}
            {error && !users.length && (
                <div className="p-8 text-center h-full min-h-[50vh]">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                    <button onClick={fetchUsers} className="mt-4 text-blue-600 hover:underline">Try Again</button>
                </div>
            )}
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Users className="w-7 h-7 mr-3 text-blue-600" />
                        System User Management ({users.length})
                    </h1>
                    <div className="flex items-center space-x-3">
                        <NotificationBell />
                        <button 
                            onClick={() => setShowPermissions(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Manage Permissions
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Add User
                        </button>
                        <button 
                            onClick={fetchUsers} 
                            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                            disabled={loading}
                        >
                            <Loader2 className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Workflow Summary Cards */}
                <WorkflowSummaryCards />

                {/* Activity Summary Cards */}
                <EnhancedSummaryCards activityStats={activityStats} />

                {/* Enhanced User Table */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {users.map((user) => {
                                const activity = getActivityStatus(user.lastLoginDate);
                                
                                return (
                                <tr key={user.id} className="hover:bg-blue-50/50 transition duration-150">
                                    {/* Enhanced User Details */}
                                    <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                                        <div className="text-sm text-gray-500 flex items-center">
                                            <Mail className="w-3 h-3 mr-1" />
                                            {user.email}
                                        </div>
                                        {user.employeeId && (
                                            <div className="text-xs text-gray-400 flex items-center mt-1">
                                            <IdCard className="w-3 h-3 mr-1" />
                                            ID: {user.employeeId}
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                    </td>
                                    
                                    {/* Role & Department */}
                                    <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.roleId === 1 ? 'bg-indigo-100 text-indigo-800' :
                                        user.roleId === 2 ? 'bg-green-100 text-green-800' :
                                        user.roleId === 3 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role?.name || 'Unknown'}
                                        </span>
                                        {user.department && (
                                        <div className="flex items-center text-xs text-gray-600">
                                            <Building className="w-3 h-3 mr-1" />
                                            {user.department}
                                        </div>
                                        )}
                                        {user.jobTitle && (
                                        <div className="flex items-center text-xs text-gray-600">
                                            <Briefcase className="w-3 h-3 mr-1" />
                                            {user.jobTitle}
                                        </div>
                                        )}
                                    </div>
                                    </td>
                                    
                                    {/* Status */}
                                    <td className="px-6 py-4">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        <div className="flex items-center gap-1">
                                        {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {user.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </span>
                                    </td>
                                    
                                    {/* Activity */}
                                    <td className="px-6 py-4">
                                    <div className={`px-2 py-1 text-xs font-medium rounded-full ${activity.bg} ${activity.color}`}>
                                        {activity.text}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {user.lastLoginDate 
                                        ? new Date(user.lastLoginDate).toLocaleDateString()
                                        : 'Never logged in'
                                        }
                                    </div>
                                    </td>

                                    {/* Enhanced Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <EnhancedActions user={user} />
                                    </td>
                                </tr>
                                );
                            })}
                            
                            {!users.length && !loading && !error && <EmptyTableState />}
                            </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <UserProfilePanel 
                user={selectedUser}
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                onUpdate={fetchUsers}
                onAssignTask={(user) => {
                    setSelectedUser(user);
                    setShowTaskAssignment(true);
                }}
            />

            {showPermissions && (
                <PermissionMatrix 
                    roles={roles}
                    permissions={permissions}
                    onPermissionChange={handlePermissionChange}
                    onClose={() => setShowPermissions(false)}
                />
            )}

            <TaskAssignmentModal
                user={selectedUser}
                isOpen={showTaskAssignment}
                onClose={() => setShowTaskAssignment(false)}
                onTaskAssigned={fetchUsers}
            />

            <NotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
            />

            {showApprovalWorkflow && (
                <ApprovalWorkflow
                    workflow={selectedWorkflow}
                    onApprove={handleApproveWorkflow}
                    onReject={handleRejectWorkflow}
                    onClose={() => {
                        setShowApprovalWorkflow(false);
                        setSelectedWorkflow(null);
                    }}
                />
            )}
        </main>
    );
};



// --- Main Page Component ---
const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error("Authentication token missing.");

            const response = await axios.get(API_BASE_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUsers(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError(err.response?.data?.error || err.message || 'Could not load user data.');
            toast.error(err.response?.data?.error || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'Activate' : 'Deactivate';
        
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], isUpdating: true };
        setUsers(updatedUsers);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error("Authentication token missing.");

            await axios.patch(`${API_BASE_URL}/${userId}/status`, 
                { isActive: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(`User successfully ${newStatus ? 'activated' : 'deactivated'}.`);
            await fetchUsers();

        } catch (err) {
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], isUpdating: false };
            setUsers(updatedUsers);
            
            console.error("Failed to toggle status:", err);
            toast.error(err.response?.data?.error || `Failed to ${action} user.`);
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100"> 
            <Sidebar /> 
            <div className="flex flex-col flex-1 overflow-hidden"> 
                <Topbar /> 
                <UserManagementContent 
                    users={users} 
                    loading={loading} 
                    error={error} 
                    fetchUsers={fetchUsers} 
                    handleToggleStatus={handleToggleStatus} 
                />
            </div>
        </div>
    );
};

export default UserManagementPage;