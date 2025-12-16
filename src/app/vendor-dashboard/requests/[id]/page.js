// frontend/src/app/vendor-dashboard/requests/[id]/page.js
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
  Upload,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Download,
  Eye,
  ChevronRight,
  Bell,
  Flag
} from 'lucide-react';
import RequestStatusBadge from '@/components/requests/RequestStatusBadge';
import FileUploader from '@/components/requests/FileUploader';
import RequestTimeline from '@/components/requests/RequestTimeline';
import mockRequestService from '@/services/mockRequestService';
import { REQUEST_TYPES, REQUEST_STATUS } from '@/utils/mockRequests';
import { formatDate, getRelativeTime, isOverdue } from '@/utils/dateUtils';

export default function VendorRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseData, setResponseData] = useState({
    responseText: '',
    files: []
  });
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
        // If request is pending/overdue and not already showing response form, show it
        if ((response.data.status === 'PENDING' || response.data.status === 'OVERDUE') && 
            !response.data.responseText) {
          setShowResponseForm(true);
        }
        // Pre-fill response text if already submitted
        if (response.data.responseText) {
          setResponseData(prev => ({
            ...prev,
            responseText: response.data.responseText
          }));
        }
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

  const handleResponseChange = (e) => {
    const { name, value } = e.target;
    setResponseData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFilesChange = (files) => {
    setResponseData(prev => ({
      ...prev,
      files
    }));
    if (formErrors.files) {
      setFormErrors(prev => ({ ...prev, files: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!responseData.responseText.trim()) {
      errors.responseText = 'Response text is required';
    }
    
    if (responseData.files.length === 0) {
      errors.files = 'At least one attachment is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await mockRequestService.submitResponse(requestId, responseData);
      
      if (response.success) {
        // Update local state with new response
        setRequest(prev => ({
          ...prev,
          ...response.data,
          timeline: response.data.timeline || prev.timeline
        }));
        setShowResponseForm(false);
        
        // Show success message
        alert('Response submitted successfully!');
        
        // Refresh the page data
        fetchRequestDetails();
      } else {
        throw new Error('Failed to submit response');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadAttachment = (file) => {
    // In a real app, this would download the file from the server
    console.log('Downloading file:', file.name);
    alert(`Downloading ${file.name}`);
  };

  const handleSendReminder = async () => {
    if (!confirm('Send a reminder about this request?')) return;
    
    try {
      const response = await mockRequestService.sendReminder(requestId);
      if (response.success) {
        alert('Reminder sent successfully!');
        fetchRequestDetails(); // Refresh to update notification count
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
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
            href="/vendor-dashboard/requests"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  const requestTypeConfig = REQUEST_TYPES[request.requestType] || REQUEST_TYPES.OTHER;
  const isPending = request.status === 'PENDING' || request.status === 'OVERDUE';
  const canRespond = isPending && !request.responseText;
  const hasResponse = request.responseText || (request.responseFiles && request.responseFiles.length > 0);
  const isOverdueRequest = isOverdue(request.dueDate);

  return (
    <div className="p-4 md:p-6">
      {/* Header with Back Navigation */}
      <div className="mb-6">
        <Link
          href="/vendor-dashboard/requests"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={18} />
          Back to Information Requests
        </Link>
        
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
                <FileText size={14} />
                {requestTypeConfig.label}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Created: {formatDate(request.createdAt, 'short')}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                Due: {formatDate(request.dueDate, 'short')}
              </span>
              {request.createdByName && (
                <span className="flex items-center gap-1">
                  <User size={14} />
                  By: {request.createdByName}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {canRespond && (
              <button
                onClick={() => setShowResponseForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send size={18} />
                Respond Now
              </button>
            )}
            
            {isPending && !isOverdueRequest && (
              <button
                onClick={handleSendReminder}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Bell size={18} />
                Remind Me
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Request Details & Response */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-2 rounded-lg bg-${requestTypeConfig.color}-100`}>
                <FileText className={`text-${requestTypeConfig.color}-600`} size={20} />
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
                      <p className="text-sm font-medium text-yellow-800 mb-1">Additional Notes</p>
                      <p className="text-sm text-yellow-700">{request.notes}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
                  <div className="flex items-center gap-2">
                    <Flag size={16} className="text-gray-400" />
                    <span className={`font-medium ${
                      request.priority === 'CRITICAL' ? 'text-red-600' :
                      request.priority === 'URGENT' ? 'text-orange-600' : 'text-gray-700'
                    }`}>
                      {request.priority}
                    </span>
                  </div>
                </div>
              </div>
              
              {request.documentId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">Linked Document</p>
                      <p className="text-sm text-blue-700">
                        This request is related to an existing document in your profile.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Response Form or Response Display */}
          {showResponseForm ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-green-100">
                  <Send className="text-green-600" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Submit Response</h2>
              </div>
              
              <form onSubmit={handleSubmitResponse} className="space-y-6">
                <div>
                  <label htmlFor="responseText" className="block text-sm font-medium text-gray-700 mb-2">
                    Response Details *
                  </label>
                  <textarea
                    id="responseText"
                    name="responseText"
                    value={responseData.responseText}
                    onChange={handleResponseChange}
                    rows={6}
                    className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.responseText ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Provide detailed response to the request..."
                  />
                  {formErrors.responseText && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.responseText}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Include all relevant information and clarifications requested.
                  </p>
                </div>
                
                <div>
                  <FileUploader
                    files={responseData.files}
                    onChange={handleFilesChange}
                    multiple={true}
                    maxFiles={5}
                    maxSizeMB={10}
                    label="Attach Supporting Documents *"
                    description="Upload relevant documents (PDF, DOC, XLS, JPG, PNG)"
                  />
                  {formErrors.files && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.files}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Required: At least one supporting document must be attached.
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowResponseForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Response
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : hasResponse ? (
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
                    <Upload className="text-blue-600" size={20} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Your Response</h2>
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
                
                {request.status === 'REJECTED' && request.rejectionReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h4>
                        <p className="text-sm text-red-700">{request.rejectionReason}</p>
                        <p className="text-xs text-red-600 mt-2">
                          Please revise your response based on the feedback above and resubmit.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {request.status === 'APPROVED' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-sm font-medium text-green-800 mb-1">Response Approved</h4>
                        <p className="text-sm text-green-700">
                          Your response has been approved by procurement. No further action is required.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {request.status === 'SUBMITTED' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Clock className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Under Review</h4>
                        <p className="text-sm text-blue-700">
                          Your response has been submitted and is under review by procurement.
                          You will be notified once it has been approved or if revisions are needed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Action Required Alert */}
          {isPending && !showResponseForm && !hasResponse && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    Action Required
                  </h3>
                  <p className="text-orange-700 mb-4">
                    This request requires your response by {formatDate(request.dueDate, 'long')}.
                    {isOverdueRequest && ' It is now overdue.'}
                  </p>
                  <button
                    onClick={() => setShowResponseForm(true)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Submit Response Now
                  </button>
                </div>
              </div>
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

          {/* Quick Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <Building className="text-blue-600" size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Request Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Request ID</h3>
                <p className="font-mono text-gray-700">{request.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created By</h3>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-gray-700">{request.createdByName}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Last Notification</h3>
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-gray-400" />
                  <span className="text-gray-700">
                    {request.lastNotified ? formatDate(request.lastNotified, 'short') : 'Not notified'}
                  </span>
                  {request.notificationCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {request.notificationCount} sent
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status History</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-700">{formatDate(request.createdAt, 'short')}</span>
                  </div>
                  {request.responseDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Responded</span>
                      <span className="text-gray-700">{formatDate(request.responseDate, 'short')}</span>
                    </div>
                  )}
                  {request.approvedDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Approved</span>
                      <span className="text-green-600 font-medium">{formatDate(request.approvedDate, 'short')}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Help Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you have questions about this request, contact procurement:
                </p>
                <div className="space-y-2">
                  <a
                    href={`mailto:${request.createdByName?.toLowerCase().replace(/\s+/g, '.')}@kunrealestate.com`}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <MessageSquare size={14} />
                    Contact {request.createdByName}
                  </a>
                  <Link
                    href="/vendor-dashboard/requests"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <ChevronRight size={14} />
                    View all requests
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