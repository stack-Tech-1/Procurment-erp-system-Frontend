// frontend/src/app/dashboard/admin/users/page.js - MOBILE OPTIMIZED
"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import axios from 'axios';
import {
    Users, Loader2, CheckCircle, XCircle, User, Mail, ToggleRight,
    Building, Briefcase, IdCard, Clock, Eye, Edit, Shield, Key,
    Save, X, Settings, Check, Square, Activity, FileText, Search,
    Filter, Calendar, Download, RefreshCw, Bell, ListTodo, Workflow,
    CheckSquare, AlertCircle, ArrowRight, Plus, MoreVertical, Inbox
} from 'lucide-react';
import { toast } from 'react-hot-toast'; 
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

// --- Notification Center Component ---
const NotificationCenter = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const { t } = useTranslation(); // ADD THIS HOOK
  
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
              {t('notifications')} ({notifications.filter(n => !n.read).length} {t('unread')})
            </h3>
            <div className="flex items-center space-x-2">
              {notifications.some(n => !n.read) && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('markAllAsRead')}
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
                <p className="text-gray-500 text-lg">{t('noNotifications')}</p>
                <p className="text-gray-400 text-sm">{t('allCaughtUp')}</p>
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
                        {t(notification.title.toLowerCase().replace(/\s+/g, '_')) || notification.title}
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
                        {t('markRead')}
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
    const { t } = useTranslation(); // ADD THIS HOOK
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
        toast.success(t('workflowActionSuccess', { action }));
      } catch (error) {
        toast.error(t('workflowActionFailed', { action }));
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
                {t('approvalWorkflow')} - {workflow.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t('reviewWorkflowItem')}
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
                <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(workflow.status)}`}>
                  {t(workflow.status.toLowerCase())}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('priority')}</label>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  workflow.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                  workflow.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {t(workflow.priority.toLowerCase())}
                </span>
              </div>
            </div>
  
            {/* Workflow Steps */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">{t('approvalSteps')}</h4>
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
                        <p className="font-medium text-gray-900">{t(step.role.toLowerCase().replace(/\s+/g, '_')) || step.role}</p>
                        <p className="text-sm text-gray-500">
                          {stepStatus === 'completed' ? t('approvedBy', { approver: step.approver }) :
                           stepStatus === 'current' ? t('waitingForApproval') :
                           t('pending')}
                        </p>
                        {step.comment && (
                          <p className="text-sm text-gray-600 mt-1">{t('comment')}: {step.comment}</p>
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
                <h4 className="font-semibold text-gray-800 mb-4">{t('takeAction')}</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('commentsOptional')}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder={t('commentsPlaceholder')}
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
                      {t('reject')}
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
                      {t('approve')}
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
    const { t } = useTranslation(); // ADD THIS HOOK
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
        { value: 'REVIEW', label: t('reviewTask'), icon: Eye },
        { value: 'APPROVAL', label: t('approvalTask'), icon: CheckSquare },
        { value: 'UPDATE', label: t('updateTask'), icon: Edit },
        { value: 'VERIFICATION', label: t('verificationTask'), icon: Shield }
      ];
    
      const workflowTypes = [
        { value: 'SINGLE_APPROVAL', label: t('singleApproval') },
        { value: 'DOUBLE_APPROVAL', label: t('doubleApproval') },
        { value: 'TRIPLE_APPROVAL', label: t('tripleApproval') }
      ];
    
      const handleAssignTask = async () => {
        if (!formData.title || !formData.dueDate) {
          toast.error(t('titleDateRequired'));
          return;
        }
    
        setAssigning(true);
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create notification for assigned task
          const newNotification = {
            id: Date.now(),
            type: 'TASK_ASSIGNED',
            title: t('newTaskAssigned'),
            message: t('taskAssignedMessage', { title: formData.title }),
            read: false,
            createdAt: new Date().toISOString()
          };
          
          // In a real app, this would be sent to the backend
          console.log('Task assigned with workflow:', formData);
          
          toast.success(t('taskAssignedSuccess', { name: user.name }));
          onTaskAssigned();
          onClose();
        } catch (error) {
          toast.error(t('failedToAssignTask'));
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
                {t('assignTaskWorkflow')}
              </h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
    
            <div className="p-6 space-y-4">
              {/* Assigned To */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('assigningTo')}:</p>
                <p className="font-semibold text-blue-800">{user.name} ({user.role?.name})</p>
              </div>
    
              {/* Task Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('taskTitle')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder={t('enterTaskTitle')}
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('taskType')}
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
                  {t('priority')}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="LOW">{t('low')}</option>
                  <option value="MEDIUM">{t('medium')}</option>
                  <option value="HIGH">{t('high')}</option>
                  <option value="URGENT">{t('urgent')}</option>
                </select>
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dueDate')} *
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
                <h4 className="font-semibold text-gray-800 mb-3">{t('approvalWorkflow')}</h4>
                
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
                      {t('requiresApproval')}
                    </label>
                  </div>
    
                  {formData.requiresApproval && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('workflowType')}
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
                        {formData.approvalWorkflow === 'SINGLE_APPROVAL' && t('singleApprovalDescription')}
                        {formData.approvalWorkflow === 'DOUBLE_APPROVAL' && t('doubleApprovalDescription')}
                        {formData.approvalWorkflow === 'TRIPLE_APPROVAL' && t('tripleApprovalDescription')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
    
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder={t('enterTaskDescription')}
                />
              </div>
            </div>
    
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('cancel')}
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
                {t('assignTask')}
              </button>
            </div>
          </div>
        </div>
      );
    };
  
  // --- User Tasks Panel ---
  const UserTasksPanel = ({ userId, userName, isOpen, onClose }) => {
    const { t } = useTranslation(); // ADD THIS HOOK
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
  
    // Mock tasks data
    const mockTasks = [
      {
        id: 1,
        title: t('reviewVendorApplication'),
        type: 'REVIEW',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        assignedBy: t('adminUser'),
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: t('approveRfqSubmission'),
        type: 'APPROVAL',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignedBy: t('procurementManager'),
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
                {t('userTasks')} - {userName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t('assignedTasksWorkflow')}
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
                <span className="ml-3 text-gray-600">{t('loadingTasks')}</span>
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
                            {t(task.priority.toLowerCase())}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {t(task.status.toLowerCase().replace('_', ' '))}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">{t('type')}:</span> {t(task.type.toLowerCase())}
                          </div>
                          <div>
                            <span className="font-medium">{t('due')}:</span> {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">{t('assignedBy')}:</span> {task.assignedBy}
                          </div>
                          <div>
                            <span className="font-medium">{t('created')}:</span> {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:text-blue-800 transition" title={t('view')}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:text-green-800 transition" title={t('approve')}>
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-12">
                    <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">{t('noTasksAssigned')}</p>
                    <p className="text-gray-400 text-sm">{t('noPendingTasks')}</p>
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
  const { t } = useTranslation(); // ADD THIS HOOK
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
      toast.error(t('failedLoadAuditLogs'));
    } finally {
      setLoading(false);
    }
  };

  const getMockAuditLogs = () => [
    {
      id: 1,
      action: 'LOGIN',
      entity: t('user'),
      entityId: userId,
      description: t('userLoggedIn'),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      action: 'VIEW_VENDOR',
      entity: t('vendor'),
      entityId: 123,
      description: t('viewedVendorProfile', { name: 'ABC Construction' }),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      action: 'UPDATE_PROFILE',
      entity: t('user'),
      entityId: userId,
      description: t('updatedProfile'),
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
    
    toast.success(t('activityLogExported'));
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
              {t('userActivityLog')} - {userName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {t('trackingUserActions')}
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
                <option value="">{t('allTime')}</option>
                <option value="today">{t('today')}</option>
                <option value="week">{t('thisWeek')}</option>
                <option value="month">{t('thisMonth')}</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select 
                value={filters.actionType}
                onChange={(e) => setFilters(prev => ({ ...prev, actionType: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">{t('allActions')}</option>
                <option value="LOGIN">{t('login')}</option>
                <option value="LOGOUT">{t('logout')}</option>
                <option value="CREATE">{t('create')}</option>
                <option value="UPDATE">{t('update')}</option>
                <option value="DELETE">{t('delete')}</option>
                <option value="VIEW">{t('view')}</option>
              </select>
            </div>
            
            <button
              onClick={fetchAuditLogs}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('refresh')}</span>
            </button>
            
            <button
              onClick={exportLogs}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>{t('exportCSV')}</span>
            </button>
          </div>
        </div>

        {/* Activity Log Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">{t('loadingActivityLogs')}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {t(log.action.toLowerCase().replace('_', ' '))}
                        </span>
                        <span className="text-sm text-gray-500">{log.entity}</span>
                        {log.entityId && (
                          <span className="text-sm text-gray-400">{t('id')}: {log.entityId}</span>
                        )}
                      </div>
                      <p className="text-gray-800 font-medium">{log.description}</p>
                      {log.ipAddress && (
                        <p className="text-sm text-gray-500 mt-1">
                          {t('ip')}: {log.ipAddress} • {log.userAgent}
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
                  <p className="text-gray-500 text-lg">{t('noActivityRecords')}</p>
                  <p className="text-gray-400 text-sm">{t('activityWillAppear')}</p>
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
  const { t } = useTranslation(); // ADD THIS HOOK
  
  // Sample permission structure - you can customize based on your modules
  const modules = [
    { id: 'vendors', name: t('vendors'), actions: ['view', 'create', 'edit', 'approve'] },
    { id: 'rfqs', name: t('rfqs'), actions: ['view', 'create', 'edit', 'approve'] },
    { id: 'contracts', name: t('contracts'), actions: ['view', 'create', 'edit', 'approve'] },
    { id: 'purchase_orders', name: t('purchaseOrders'), actions: ['view', 'create', 'edit', 'approve'] },
    { id: 'reports', name: t('reports'), actions: ['view', 'export'] },
    { id: 'user_management', name: t('userManagement'), actions: ['view', 'edit', 'delete'] },
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
    toast.success(t('permissionsUpdated'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            {t('rolePermissionMatrix')}
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
                    {t('moduleAction')}
                  </th>
                  {roles.map(role => (
                    <th key={role.id} className="px-4 py-3 text-center text-sm font-medium text-gray-700 border">
                      <div className="flex flex-col items-center">
                        <span>{role.name}</span>
                        <span className="text-xs text-gray-500">({role.usersCount} {t('users')})</span>
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
                          {t(action)}
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
              {t('cancel')}
            </button>
            <button
              onClick={savePermissions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {t('savePermissions')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Enhanced User Profile Panel with Activity ---
const UserProfilePanel = ({ user, isOpen, onClose, onUpdate, onAssignTask }) => {
    const { t } = useTranslation(); // ADD THIS HOOK
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
        
        toast.success(t('profileUpdated'));
        setEditMode(false);
        onUpdate();
      } catch (error) {
        toast.error(t('failedUpdateProfile'));
      }
    };
  
    if (!isOpen || !user) return null;

    // Add Tasks section to the profile panel
  const TasksSection = () => (
    <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <ListTodo className="w-4 h-4 mr-2 text-green-600" />
          {t('taskOverview')}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowTasks(true)}
            className="text-green-600 hover:text-green-800 text-sm flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            {t('viewAll')}
          </button>
          <button
            onClick={() => onAssignTask(user)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            {t('assignTask')}
          </button>
        </div>
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">{t('pendingTasks')}:</span>
          <p className="font-medium text-orange-600">2</p>
        </div>
        <div>
          <span className="text-gray-600">{t('overdue')}:</span>
          <p className="font-medium text-red-600">0</p>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {t('lastTaskAssigned')}: {t('today')}
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
                {t('userProfile')} - {user.name}
              </h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('employeeId')}</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder={t('enterEmployeeId')}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{user.employeeId || t('notSet')}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobTitle')}</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder={t('enterJobTitle')}
                  />
                ) : (
                  <p className="text-gray-900">{user.jobTitle || t('notSet')}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('department')}</label>
                {editMode ? (
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">{t('selectDepartment')}</option>
                    <option value="Procurement">{t('procurement')}</option>
                    <option value="Contracts">{t('contracts')}</option>
                    <option value="Finance">{t('finance')}</option>
                    <option value="Technical">{t('technical')}</option>
                    <option value="Admin">{t('admin')}</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{user.department || t('notSet')}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastActivity')}</label>
                <p className="text-gray-900 text-sm">
                  {user.lastLoginDate 
                    ? new Date(user.lastLoginDate).toLocaleString() 
                    : t('noActivityRecorded')
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
                {t('activityOverview')}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t('lastLogin')}:</span>
                  <p className="font-medium">
                    {user.lastLoginDate 
                      ? new Date(user.lastLoginDate).toLocaleDateString()
                      : t('never')
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">{t('accountCreated')}:</span>
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
                {t('viewDetailedActivityLog')}
              </button>
            </div>
            
            {/* Role Information */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">{t('roleInformation')}</h4>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  user.roleId === 1 ? 'bg-indigo-100 text-indigo-800' :
                  user.roleId === 2 ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.role?.name || t('unknownRole')}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  <Settings className="w-4 h-4 mr-1" />
                  {t('changeRole')}
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
                    {t('cancel')}
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t('saveChanges')}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t('editProfile')}
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {t('close')}
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
const EnhancedSummaryCards = ({ activityStats }) => {
  const { t } = useTranslation(); // ADD THIS HOOK
  
  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{t('totalUsers')}</p>
            <p className="text-2xl font-bold text-gray-900">{activityStats.totalUsers || 0}</p>
          </div>
          <Users className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{t('activeToday')}</p>
            <p className="text-2xl font-bold text-green-600">{activityStats.activeToday || 0}</p>
          </div>
          <Activity className="w-8 h-8 text-green-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{t('activeThisWeek')}</p>
            <p className="text-2xl font-bold text-orange-600">{activityStats.activeThisWeek || 0}</p>
          </div>
          <Calendar className="w-8 h-8 text-orange-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{t('neverLoggedIn')}</p>
            <p className="text-2xl font-bold text-red-600">{activityStats.neverLoggedIn || 0}</p>
          </div>
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{t('mostActiveDept')}</p>
            <p className="text-lg font-bold text-purple-600 truncate">{activityStats.mostActiveDepartment || t('na')}</p>
          </div>
          <Building className="w-8 h-8 text-purple-500" />
        </div>
      </div>
    </div>
  );
};

// --- Enhanced User Management Content (Updated for Mobile) ---
const UserManagementContent = ({ users, loading, error, fetchUsers, handleToggleStatus }) => {
  const { t } = useTranslation(); // ADD THIS HOOK
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
            title: t('vendorQualificationReview'),
            type: 'VENDOR_APPROVAL',
            status: 'PENDING',
            priority: 'HIGH',
            currentStep: 2,
            steps: [
                { stepNumber: 1, role: t('procurementOfficer'), approver: 'John Doe', completedAt: new Date().toISOString(), comment: t('initialReviewCompleted') },
                { stepNumber: 2, role: t('procurementManager'), approver: null, completedAt: null, comment: null },
                { stepNumber: 3, role: t('headOfProcurement'), approver: null, completedAt: null, comment: null }
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
            title: t('approvalRequired'),
            message: t('vendorQualificationApprovalRequired'),
            read: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            type: 'TASK_ASSIGNED',
            title: t('newTaskAssigned'),
            message: t('taskAssignedMessage', { title: t('reviewVendorApplication') }),
            read: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            type: 'APPROVAL_APPROVED',
            title: t('approvalCompleted'),
            message: t('rfqApproved'),
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
                { id: 1, name: t('admin'), usersCount: users.filter(u => u.roleId === 1).length },
                { id: 2, name: t('procurementManager'), usersCount: users.filter(u => u.roleId === 2).length },
                { id: 3, name: t('procurementOfficer'), usersCount: users.filter(u => u.roleId === 3).length },
                { id: 4, name: t('vendor'), usersCount: users.filter(u => u.roleId === 4).length },
            ];
            setRoles(roleData);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            setPermissions(getDefaultPermissions());
            toast.error(t('failedLoadPermissions'));
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
            : t('noData');
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
        if (!lastActivity) return { color: 'text-gray-500', text: t('never'), bg: 'bg-gray-100' };
        
        const daysAgo = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
        
        if (daysAgo <= 7) return { color: 'text-green-600', text: t('active'), bg: 'bg-green-100' };
        if (daysAgo <= 30) return { color: 'text-yellow-600', text: t('recent'), bg: 'bg-yellow-100' };
        return { color: 'text-red-600', text: t('inactive'), bg: 'bg-red-100' };
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
            title: t('workflowApproved'),
            message: t('workflowApprovedMessage', { title: selectedWorkflow?.title }),
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
            title: t('workflowRejected'),
            message: t('workflowRejectedMessage', { title: selectedWorkflow?.title }),
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
            toast.success(t('permissionsUpdated'));
            setShowPermissions(false);
        } catch (error) {
            console.error('Error updating permissions:', error);
            toast.error(t('failedUpdatePermissions'));
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
                title={t('viewProfile')}
            >
                <Eye className="w-4 h-4" />
            </button>
            <button
                onClick={() => {
                    setSelectedUser(user);
                    setShowTaskAssignment(true);
                }}
                className="p-2 text-purple-600 hover:text-purple-800 transition"
                title={t('assignTaskWorkflow')}
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
                title={user.isActive ? t('deactivate') : t('activate')}
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
                            <p className="text-sm text-gray-500">{t('unreadNotifications')}</p>
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
                            <p className="text-sm text-gray-500">{t('pendingApprovals')}</p>
                            <p className="text-2xl font-bold text-orange-600">{pendingApprovals}</p>
                        </div>
                        <CheckSquare className="w-8 h-8 text-orange-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{t('overdueTasks')}</p>
                            <p className="text-2xl font-bold text-red-600">{workflowStats.overdueTasks || 0}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{t('avgCompletion')}</p>
                            <p className="text-2xl font-bold text-green-600">{workflowStats.avgTaskCompletion || '0%'}</p>
                        </div>
                        <Workflow className="w-8 h-8 text-green-500" />
                    </div>
                </div>
            </div>
        );
    };

    const EmptyTableState = () => (
        <tr>
            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-lg">
                {t('noUsersFound')}
            </td>
        </tr>
    );

    // Main Return
    return (
      <div className="space-y-6">
          {/* Loading State */}
          {loading && users.length === 0 && (
              <div className="flex justify-center items-center min-h-[50vh]">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="ml-3 text-lg text-gray-600">{t('loadingUserList')}</p>
              </div>
          )}
          
          {/* Error State */}
          {error && !users.length && (
              <div className="p-4 sm:p-8 text-center min-h-[50vh]">
                  <h1 className="text-xl sm:text-3xl font-bold text-red-600 mb-4">{t('error')}</h1>
                  <p className="text-gray-600 text-sm sm:text-base">{error}</p>
                  <button onClick={fetchUsers} className="mt-4 text-blue-600 hover:underline text-sm sm:text-base">{t('tryAgain')}</button>
              </div>
          )}
            
            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                            <Users className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
                            {t('systemUserManagement')} ({users.length})
                        </h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">
                            {t('manageUserRoles')}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <NotificationBell />
                        <button 
                            onClick={() => setShowPermissions(true)}
                            className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center text-sm"
                        >
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">{t('permissions')}</span>
                        </button>
                        <button className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">{t('addUser')}</span>
                        </button>
                        <button 
                            onClick={fetchUsers} 
                            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition"
                            disabled={loading}
                        >
                            <Loader2 className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">{t('refresh')}</span>
                        </button>
                    </div>
                </div>

                {/* Workflow Summary Cards */}
                <WorkflowSummaryCards />

                {/* Activity Summary Cards */}
                <EnhancedSummaryCards activityStats={activityStats} />

                {/* Enhanced User Table */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('userDetails')}</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('roleDepartment')}</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('activity')}</th>
                                    <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {users.map((user) => {
                                    const activity = getActivityStatus(user.lastLoginDate);
                                    
                                    return (
                                    <tr key={user.id} className="hover:bg-blue-50/50 transition duration-150">
                                        {/* Enhanced User Details */}
                                        <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                            </div>
                                            <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{user.name || t('na')}</div>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <Mail className="w-3 h-3 mr-1" />
                                                {user.email}
                                            </div>
                                            {user.employeeId && (
                                                <div className="text-xs text-gray-400 flex items-center mt-1">
                                                <IdCard className="w-3 h-3 mr-1" />
                                                {t('id')}: {user.employeeId}
                                                </div>
                                            )}
                                            {/* Mobile: Show role and department */}
                                            <div className="sm:hidden mt-1">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.roleId === 1 ? 'bg-indigo-100 text-indigo-800' :
                                                user.roleId === 2 ? 'bg-green-100 text-green-800' :
                                                user.roleId === 3 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role?.name || t('unknown')}
                                                </span>
                                                {user.department && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {user.department}
                                                </div>
                                                )}
                                            </div>
                                            </div>
                                        </div>
                                        </td>
                                    
                                    {/* Role & Department - Desktop */}
                                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                        <div className="space-y-1">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.roleId === 1 ? 'bg-indigo-100 text-indigo-800' :
                                            user.roleId === 2 ? 'bg-green-100 text-green-800' :
                                            user.roleId === 3 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role?.name || t('unknownRole')}
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
                                        <td className="px-4 sm:px-6 py-4">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            <div className="flex items-center gap-1">
                                            {user.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {user.isActive ? t('active') : t('inactive')}
                                            </div>
                                        </span>
                                        </td>
                                        
                                        {/* Activity - Desktop */}
                                        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${activity.bg} ${activity.color}`}>
                                            {activity.text}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {user.lastLoginDate 
                                            ? new Date(user.lastLoginDate).toLocaleDateString()
                                            : t('neverLoggedIn')
                                            }
                                        </div>
                                        </td>

                                    {/* Enhanced Actions */}
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
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
        </div>
    );
};

// --- Main Page Component (Updated with ResponsiveLayout) ---
const UserManagementPage = () => {
  const { t } = useTranslation(); // ADD THIS HOOK
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error(t('authTokenMissing'));

          const response = await axios.get(API_BASE_URL, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          setUsers(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
          console.error("Failed to fetch users:", err);
          setError(err.response?.data?.error || err.message || t('couldNotLoadUserData'));
          toast.error(err.response?.data?.error || t('failedLoadUsers'));
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchUsers();
  }, []);
  
  const handleToggleStatus = async (userId, currentStatus) => {
      const newStatus = !currentStatus;
      const action = newStatus ? t('activate') : t('deactivate');
      
      if (!window.confirm(t('confirmToggleStatus', { action }))) {
          return;
      }

      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) return;

      const updatedUsers = [...users];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], isUpdating: true };
      setUsers(updatedUsers);

      try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error(t('authTokenMissing'));

          await axios.patch(`${API_BASE_URL}/${userId}/status`, 
              { isActive: newStatus },
              { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success(t('userStatusUpdated', { status: newStatus ? t('activated') : t('deactivated') }));
          await fetchUsers();

      } catch (err) {
          updatedUsers[userIndex] = { ...updatedUsers[userIndex], isUpdating: false };
          setUsers(updatedUsers);
          
          console.error("Failed to toggle status:", err);
          toast.error(err.response?.data?.error || t('failedToggleStatus', { action }));
      }
  };
  
  return (
      <ResponsiveLayout>
          <UserManagementContent 
              users={users} 
              loading={loading} 
              error={error} 
              fetchUsers={fetchUsers} 
              handleToggleStatus={handleToggleStatus} 
          />
      </ResponsiveLayout>
  );
};

export default UserManagementPage;