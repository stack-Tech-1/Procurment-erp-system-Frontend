// frontend/src/app/dashboard/procurement/vendors/[id]/requests/[requestId]/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  Paperclip,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Download,
  Eye,
  Send,
  Bell,
  Flag,
  ChevronRight,
  Mail,
  Users,
  Award,
  Shield,
  FileCheck
} from 'lucide-react';
import RequestStatusBadge from '@/components/requests/RequestStatusBadge';
import RequestTimeline from '@/components/requests/RequestTimeline';
import mockRequestService from '@/services/mockRequestService';
import { REQUEST_TYPES, REQUEST_STATUS } from '@/utils/mockRequests';
import { formatDate, getRelativeTime, isOverdue } from '@/utils/dateUtils';

export default function ExecutiveRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id: vendorId, requestId } = params;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalData, setApprovalData] = useState({
    status: 'APPROVED',
    reason: '',
    notes: ''
  });
  const [approving, setApproving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await mockRequestService.getRequestDetails(requestId);
      
      if (response.success) {
        setRequest(response.data);
      } else {
        throw new Error('Failed to fetch request details');
      }
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = (e) => {
    const { name, value } = e.target;
    setApprovalData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateApprovalForm = () => {
    const errors = {};
    
    if (!approvalData.status) {
      errors.status = 'Status is required';
    }
    
    if (approvalData.status === 'REJECTED' && !approvalData.reason.trim()) {
      errors.reason = 'Rejection reason is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitApproval = async (e) => {
    e.preventDefault();
    
    if (!validateApprovalForm()) {
      return;
    }

    try {
      setApproving(true);
      
      const response = await mockRequestService.updateRequestStatus(requestId, approvalData);
      
      if (response.success) {
        // Update local state
        setRequest(prev => ({
          ...prev,
          ...response.data
        }));
        setShowApprovalForm(false);
        
        alert(`Request ${approvalData.status.toLowerCase()} successfully!`);
        fetchRequestDetails(); // Refresh data
      } else {
        throw new Error('Failed to update request status');
      }
    } catch (err) {
      console.error('Error updating request status:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setApproving(false);
    }
  };

  const handleSendReminder = async () => {
    if (!confirm('Send reminder to vendor about this request?')) return;
    
    try {
      const response = await mockRequestService.sendReminder(requestId);
      if (response.success) {
        alert('Reminder sent successfully!');
        fetchRequestDetails();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEscalate = async () => {
    if (!confirm('Escalate this request to procurement manager?')) return;
    
    try {
      const response = await mockRequestService.escalateRequest(requestId);
      if (response.success) {
        alert('Request escalated successfully!');
        fetchRequestDetails();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDownloadAttachment = (file) => {
    console.log('Downloading file:', file.name);
    alert(`Downloading ${file.name}`);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {error || 'Request not found'}
          </h2>
          <p className="text-red-600 mb-4">
            The requested information could not be loaded.
          </p>
          <Link
            href={`/dashboard/procurement/vendors/${vendorId}/requests`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Vendor Requests
          </Link>
        </div>
      </div>
    );
  }

  const requestTypeConfig = REQUEST_TYPES[request.requestType] || REQUEST_TYPES.OTHER;
  const isPending = request.status === 'PENDING' || request.status === 'OVERDUE';
  const isSubmitted = request.status === 'SUBMITTED';
  const canApprove = isSubmitted;
  const isOverdueRequest = isOverdue(request.dueDate);

  return (
    <div className="p-4 md:p-6">
      {/* Header with Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href={`/dashboard/procurement/vendors/${vendorId}/requests`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={18} />
            Back to {request.vendorName} Requests
          </Link>
          
          <Link
            href="/dashboard/procurement/information-requests"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            All Requests
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <RequestStatusBadge status={request.status} size="lg" />
              {isOverdueRequest && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  Overdue
                </span>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {request.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Building size={14} />
                {request.vendorName}
              </span>
              <span className="flex items-center gap-1">
                <FileText size={14} />
                {requestTypeConfig.label}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Due: {formatDate(request.dueDate, 'short')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {canApprove && (
              <button
                onClick={() => setShowApprovalForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCircle size={18} />
                Review Response
              </button>
            )}
            
            {isPending && (
              <button
                onClick={handleSendReminder}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Bell size={18} />
                Send Reminder
              </button>
            )}
            
            {isOverdueRequest && (
              <button
                onClick={handleEscalate}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Flag size={18} />
                Escalate
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Request & Response Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="text-blue-600" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Request Details</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{request.description}</p>
              </div>
              
              {request.notes && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Internal Notes</p>
                      <p className="text-sm text-yellow-700">{request.notes}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created By</h3>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-700">{request.createdByName}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className={`font-medium ${isOverdueRequest ? 'text-red-600' : 'text-gray-700'}`}>
                      {formatDate(request.dueDate, 'long')}
                    </span>
                    <span className={`text-sm ${isOverdueRequest ? 'text-red-500' : 'text-gray-500'}`}>
                      ({getRelativeTime(request.dueDate, true)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Response Display */}
          {request.responseText ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className={`p-2 rounded-lg ${
                  request.status === 'APPROVED' ? 'bg-green-100' :
                  request.status === 'REJECTED' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {request.status === 'APPROVED' ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : request.status === 'REJECTED' ? (
                    <XCircle className="text-red-600" size={20} />
                  ) : (
                    <FileText className="text-blue-600" size={20} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Vendor Response</h2>
                  <p className="text-sm text-gray-500">
                    Submitted on {formatDate(request.responseDate, 'long')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Response Details</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">{request.responseText}</p>
                  </div>
                </div>
                
                {request.responseFiles && request.responseFiles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Attached Files</h3>
                    <div className="space-y-2">
                      {request.responseFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Paperclip className="text-gray-400" size={18} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-700 truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>{file.type?.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadAttachment(file)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                            {file.type === 'pdf' || file.type?.includes('image') ? (
                              <button
                                type="button"
                                onClick={() => window.open(file.url, '_blank')}
                                className="p-1 text-gray-400 hover:text-green-600"
                                title="Preview"
                              >
                                <Eye size={16} />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    Awaiting Response
                  </h3>
                  <p className="text-orange-700 mb-4">
                    {request.vendorName} has not yet responded to this request.
                    {isOverdueRequest && ' The request is now overdue.'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleSendReminder}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Send Reminder
                    </button>
                    <button
                      onClick={() => router.push(`mailto:${request.vendor?.email}`)}
                      className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <Mail className="inline mr-2" size={16} />
                      Email Vendor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Approval Form */}
          {showApprovalForm && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-green-100">
                  <FileCheck className="text-green-600" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Review & Approve Response</h2>
              </div>
              
              <form onSubmit={handleSubmitApproval} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Decision *
                  </label>
                  {formErrors.status && (
                    <p className="text-sm text-red-500 mb-2">{formErrors.status}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleApprovalChange({ target: { name: 'status', value: 'APPROVED' } })}
                      className={`p-4 rounded-lg border transition-all ${
                        approvalData.status === 'APPROVED'
                          ? 'bg-green-50 border-green-300 ring-1 ring-green-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="font-medium text-gray-800">Approve</span>
                      </div>
                      <p className="text-sm text-gray-600 text-left">
                        Accept the vendor's response as complete and satisfactory.
                      </p>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleApprovalChange({ target: { name: 'status', value: 'REJECTED' } })}
                      className={`p-4 rounded-lg border transition-all ${
                        approvalData.status === 'REJECTED'
                          ? 'bg-red-50 border-red-300 ring-1 ring-red-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="text-red-600" size={20} />
                        <span className="font-medium text-gray-800">Reject</span>
                      </div>
                      <p className="text-sm text-gray-600 text-left">
                        Request revisions or additional information from vendor.
                      </p>
                    </button>
                  </div>
                </div>
                
                {approvalData.status === 'REJECTED' && (
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason *
                    </label>
                    {formErrors.reason && (
                      <p className="text-sm text-red-500 mb-1">{formErrors.reason}</p>
                    )}
                    <textarea
                      id="reason"
                      name="reason"
                      value={approvalData.reason}
                      onChange={handleApprovalChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Explain why the response is being rejected and what additional information is needed..."
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={approvalData.notes}
                    onChange={handleApprovalChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any internal notes about this decision..."
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowApprovalForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={approving}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={approving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Submit Decision
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column - Timeline & Info */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-purple-100">
                <MessageSquare className="text-purple-600" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Activity Timeline</h2>
            </div>
            
            <RequestTimeline events={request.timeline || []} />
          </div>

          {/* Request Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <Shield className="text-blue-600" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Request Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Request ID</h3>
                <p className="font-mono text-gray-700">{request.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
                <div className="flex items-center gap-2">
                  <Flag size={14} className="text-gray-400" />
                  <span className={`font-medium ${
                    request.priority === 'CRITICAL' ? 'text-red-600' :
                    request.priority === 'URGENT' ? 'text-orange-600' : 'text-gray-700'
                  }`}>
                    {request.priority}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Notifications Sent</h3>
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-gray-400" />
                  <span className="text-gray-700">{request.notificationCount || 0}</span>
                  {request.lastNotified && (
                    <span className="text-xs text-gray-500">
                      Last: {formatDate(request.lastNotified, 'short')}
                    </span>
                  )}
                </div>
              </div>
              
              {request.escalated && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-red-800">Escalated</p>
                      <p className="text-xs text-red-700">
                        This request has been escalated due to overdue status.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Vendor Contact Info */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Vendor Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building size={14} className="text-gray-400" />
                    <span className="text-gray-700">{request.vendorName}</span>
                  </div>
                  <button
                    onClick={() => router.push(`mailto:${request.vendor?.email}`)}
                    className="w-full flex items-center gap-2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-left"
                  >
                    <Mail size={14} />
                    <span className="text-sm">Send Email</span>
                  </button>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleSendReminder}
                    className="w-full flex items-center gap-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm"
                  >
                    <Bell size={14} />
                    Send Reminder
                  </button>
                  {isOverdueRequest && (
                    <button
                      onClick={handleEscalate}
                      className="w-full flex items-center gap-2 p-2 text-red-700 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors text-left text-sm"
                    >
                      <Flag size={14} />
                      Escalate Request
                    </button>
                  )}
                  <Link
                    href={`/dashboard/procurement/vendors/${vendorId}/requests`}
                    className="flex items-center gap-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                  >
                    <ChevronRight size={14} className="rotate-180" />
                    Back to Vendor Requests
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}