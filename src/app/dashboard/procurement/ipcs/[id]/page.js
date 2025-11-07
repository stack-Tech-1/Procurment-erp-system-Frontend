// src/app/dashboard/procurement/ipcs/[id]/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, DollarSign, FileText, CheckCircle, 
  Clock, XCircle, AlertTriangle, Edit, Download, Send,
  User, Building, BarChart3, Receipt, TrendingUp, ThumbsUp,
  ThumbsDown, Mail, Phone, Hash, Clock4, Printer,
  MessageSquare, Shield, Banknote, BadgeCheck
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const IPCDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const ipcId = params.id;

  const [ipc, setIpc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewForm, setReviewForm] = useState({
    reviewNotes: '',
    recommendation: '',
    deductions: 0,
    deductionReason: ''
  });
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch IPC details
  const fetchIPCDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/ipcs/${ipcId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIpc(response.data);
    } catch (error) {
      console.error('Failed to fetch IPC details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ipcId) {
      fetchIPCDetails();
    }
  }, [ipcId]);

  // Status configuration
  const getStatusConfig = (status) => {
    const statusConfigs = {
      SUBMITTED: { 
        color: 'bg-blue-100 text-blue-800', 
        label: 'Submitted', 
        icon: Clock,
        description: 'Waiting for procurement review'
      },
      PROCUREMENT_REVIEW: { 
        color: 'bg-yellow-100 text-yellow-800', 
        label: 'Under Review', 
        icon: AlertTriangle,
        description: 'Being reviewed by procurement team'
      },
      TECHNICAL_APPROVED: { 
        color: 'bg-green-100 text-green-800', 
        label: 'Technical Approved', 
        icon: CheckCircle,
        description: 'Approved by technical team'
      },
      FINANCE_REVIEW: { 
        color: 'bg-purple-100 text-purple-800', 
        label: 'Finance Review', 
        icon: BarChart3,
        description: 'Under finance department review'
      },
      APPROVED: { 
        color: 'bg-green-100 text-green-800', 
        label: 'Approved', 
        icon: ThumbsUp,
        description: 'Fully approved for payment'
      },
      PAID: { 
        color: 'bg-green-100 text-green-800', 
        label: 'Paid', 
        icon: Banknote,
        description: 'Payment processed'
      },
      REJECTED: { 
        color: 'bg-red-100 text-red-800', 
        label: 'Rejected', 
        icon: ThumbsDown,
        description: 'Rejected - requires resubmission'
      }
    };
    return statusConfigs[status] || statusConfigs.SUBMITTED;
  };

  // Update IPC status
  const updateIPCStatus = async (newStatus, notes = '') => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));

      const payload = {
        status: newStatus,
        reviewNotes: notes,
        reviewedById: user.id
      };

      await axios.patch(
        `${API_BASE_URL}/ipcs/${ipcId}/status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchIPCDetails();
      setShowReviewModal(false);
      setReviewForm({ reviewNotes: '', recommendation: '', deductions: 0, deductionReason: '' });
      alert(`IPC status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update IPC status:', error);
      alert('Failed to update IPC status');
    }
  };

  // Get next available actions based on current status
  const getAvailableActions = () => {
    if (!ipc) return [];

    const actions = {
      SUBMITTED: [
        { label: 'Start Review', status: 'PROCUREMENT_REVIEW', color: 'bg-yellow-600', icon: AlertTriangle },
        { label: 'Reject', status: 'REJECTED', color: 'bg-red-600', icon: ThumbsDown }
      ],
      PROCUREMENT_REVIEW: [
        { label: 'Technical Approve', status: 'TECHNICAL_APPROVED', color: 'bg-green-600', icon: CheckCircle },
        { label: 'Request Changes', status: 'REJECTED', color: 'bg-orange-600', icon: Edit }
      ],
      TECHNICAL_APPROVED: [
        { label: 'Send to Finance', status: 'FINANCE_REVIEW', color: 'bg-purple-600', icon: Send },
        { label: 'Return for Review', status: 'PROCUREMENT_REVIEW', color: 'bg-blue-600', icon: ArrowLeft }
      ],
      FINANCE_REVIEW: [
        { label: 'Approve', status: 'APPROVED', color: 'bg-green-600', icon: ThumbsUp },
        { label: 'Request Clarification', status: 'PROCUREMENT_REVIEW', color: 'bg-yellow-600', icon: MessageSquare }
      ],
      APPROVED: [
        { label: 'Mark as Paid', status: 'PAID', color: 'bg-blue-600', icon: Banknote }
      ]
    };

    return actions[ipc.status] || [];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ipc) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">IPC Not Found</h2>
              <p className="text-gray-600 mb-4">The requested IPC could not be found.</p>
              <Link 
                href="/dashboard/procurement/ipcs"
                className="text-blue-600 hover:text-blue-800"
              >
                Back to IPCs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(ipc.status);
  const availableActions = getAvailableActions();
  const netPayable = (ipc.currentValue || 0) - (ipc.deductions || 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/dashboard/procurement/ipcs"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to IPCs
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">{ipc.ipcNumber}</h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                    <statusConfig.icon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-gray-600">
                  {ipc.projectName} • 
                  Contract: {ipc.contract?.contractNumber} •
                  Vendor: {ipc.contract?.vendor?.companyLegalName}
                </p>
                <p className="text-sm text-gray-500 mt-1">{statusConfig.description}</p>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Current Value</span>
                <DollarSign className="text-green-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">${ipc.currentValue?.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Deductions</span>
                <TrendingUp className="text-orange-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">${ipc.deductions?.toLocaleString() || '0'}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Net Payable</span>
                <Receipt className="text-blue-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">${netPayable.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Cumulative</span>
                <BarChart3 className="text-purple-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">${ipc.cumulativeValue?.toLocaleString() || '0'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          {availableActions.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-4">Available Actions</h3>
              <div className="flex space-x-4">
                {availableActions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => {
                      if (action.status === 'REJECTED') {
                        setShowReviewModal(true);
                        setReviewForm(prev => ({ ...prev, recommendation: 'REJECT' }));
                      } else {
                        updateIPCStatus(action.status);
                      }
                    }}
                    className={`flex items-center px-4 py-2 text-white rounded-lg ${action.color} hover:opacity-90 transition`}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'financial', label: 'Financial Details', icon: DollarSign },
                  { id: 'work', label: 'Work Description', icon: BadgeCheck },
                  { id: 'documents', label: 'Documents', icon: Download },
                  { id: 'history', label: 'Approval History', icon: Clock4 }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab ipc={ipc} />}
              {activeTab === 'financial' && <FinancialTab ipc={ipc} />}
              {activeTab === 'work' && <WorkDescriptionTab ipc={ipc} />}
              {activeTab === 'documents' && <DocumentsTab documents={ipc.attachments || []} />}
              {activeTab === 'history' && <ApprovalHistoryTab ipc={ipc} />}
            </div>
          </div>

          {/* Review Modal */}
          {showReviewModal && (
            <ReviewModal
              ipc={ipc}
              reviewForm={reviewForm}
              setReviewForm={setReviewForm}
              onClose={() => setShowReviewModal(false)}
              onSubmit={updateIPCStatus}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ ipc }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* IPC Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">IPC Details</h3>
        <div className="space-y-3">
          <DetailItem label="IPC Number" value={ipc.ipcNumber} icon={Hash} />
          <DetailItem label="Project Name" value={ipc.projectName} icon={Building} />
          <DetailItem label="Period From" value={ipc.periodFrom ? new Date(ipc.periodFrom).toLocaleDateString() : 'N/A'} icon={Calendar} />
          <DetailItem label="Period To" value={ipc.periodTo ? new Date(ipc.periodTo).toLocaleDateString() : 'N/A'} icon={Calendar} />
          <DetailItem label="Submitted By" value={ipc.submittedBy?.name} icon={User} />
          <DetailItem label="Submission Date" value={ipc.createdAt ? new Date(ipc.createdAt).toLocaleDateString() : 'N/A'} icon={Clock4} />
        </div>
      </div>
      
      {/* Contract & Vendor */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contract & Vendor</h3>
        <div className="space-y-3">
          <DetailItem label="Contract Number" value={ipc.contract?.contractNumber} />
          <DetailItem label="Contract Value" value={`$${ipc.contract?.contractValue?.toLocaleString()}`} icon={DollarSign} />
          <DetailItem label="Vendor" value={ipc.contract?.vendor?.companyLegalName} icon={Building} />
          <DetailItem label="Vendor Contact" value={ipc.contract?.vendor?.contactEmail} icon={Mail} />
          <DetailItem label="Vendor Phone" value={ipc.contract?.vendor?.contactPhone} icon={Phone} />
        </div>
      </div>
    </div>

    {/* Description */}
    {ipc.description && (
      <div>
        <h3 className="text-lg font-semibold mb-4">IPC Description</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">{ipc.description}</p>
        </div>
      </div>
    )}
  </div>
);

// Financial Tab Component
const FinancialTab = ({ ipc }) => {
  const netPayable = (ipc.currentValue || 0) - (ipc.deductions || 0);
  const previousCumulative = (ipc.cumulativeValue || 0) - (ipc.currentValue || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current IPC Financials */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Current IPC</h3>
          <div className="space-y-3">
            <DetailItem label="Gross Amount" value={`$${ipc.currentValue?.toLocaleString() || '0'}`} />
            <DetailItem label="Deductions" value={`$${ipc.deductions?.toLocaleString() || '0'}`} />
            <div className="border-t pt-2">
              <DetailItem 
                label="Net Payable" 
                value={`$${netPayable.toLocaleString()}`} 
                className="font-bold text-lg text-green-600"
              />
            </div>
          </div>
        </div>
        
        {/* Cumulative Financials */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Cumulative Summary</h3>
          <div className="space-y-3">
            <DetailItem label="Previous Total" value={`$${previousCumulative.toLocaleString()}`} />
            <DetailItem label="Current IPC" value={`$${ipc.currentValue?.toLocaleString() || '0'}`} />
            <div className="border-t pt-2">
              <DetailItem 
                label="Total to Date" 
                value={`$${ipc.cumulativeValue?.toLocaleString() || '0'}`} 
                className="font-bold text-lg text-blue-600"
              />
            </div>
            <DetailItem 
              label="Remaining Contract Value" 
              value={`$${((ipc.contract?.contractValue || 0) - (ipc.cumulativeValue || 0)).toLocaleString()}`} 
            />
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Contract Progress</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Progress</span>
            <span>{((ipc.cumulativeValue / ipc.contract?.contractValue) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(ipc.cumulativeValue / ipc.contract?.contractValue) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Paid: ${ipc.cumulativeValue?.toLocaleString()}</span>
            <span>Total: ${ipc.contract?.contractValue?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Work Description Tab Component
const WorkDescriptionTab = ({ ipc }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Work Description & Progress</h3>
    
    {ipc.workDescription ? (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700 whitespace-pre-line">{ipc.workDescription}</p>
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <BadgeCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>No work description provided for this IPC.</p>
      </div>
    )}

    {/* You could add more work progress details here */}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Work Completed</h4>
        <p className="text-blue-600">As described in the work description</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">Quality Standards</h4>
        <p className="text-green-600">Meets contract requirements</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-800 mb-2">Progress Photos</h4>
        <p className="text-purple-600">Available upon request</p>
      </div>
    </div>
  </div>
);

// Documents Tab Component
const DocumentsTab = ({ documents }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Supporting Documents</h3>
    
    {documents.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>No documents attached to this IPC.</p>
      </div>
    ) : (
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="font-medium">{doc.fileName}</p>
                <p className="text-sm text-gray-500">
                  Uploaded by {doc.uploadedBy?.name} on {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800">
              <Download className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Approval History Tab Component
const ApprovalHistoryTab = ({ ipc }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Approval History</h3>
    
    <div className="space-y-4">
      {/* Submission */}
      <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex-shrink-0">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-semibold text-blue-800">Submitted</h4>
            <span className="text-sm text-blue-600">
              {ipc.createdAt ? new Date(ipc.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <p className="text-sm text-blue-700">By {ipc.submittedBy?.name}</p>
          {ipc.description && (
            <p className="text-sm text-blue-600 mt-1">{ipc.description}</p>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-shrink-0">
          <Clock className="w-6 h-6 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-semibold text-gray-800">Current Status</h4>
            <span className="text-sm text-gray-600">Now</span>
          </div>
          <p className="text-sm text-gray-700">{getStatusConfig(ipc.status).description}</p>
        </div>
      </div>

      {/* You could add more approval history items here as the IPC progresses */}
    </div>
  </div>
);

// Review Modal Component
const ReviewModal = ({ ipc, reviewForm, setReviewForm, onClose, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('REJECTED', reviewForm.reviewNotes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Review IPC - {ipc.ipcNumber}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes *
            </label>
            <textarea
              value={reviewForm.reviewNotes}
              onChange={(e) => setReviewForm(prev => ({ ...prev, reviewNotes: e.target.value }))}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide detailed reasons for rejection or required changes..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suggested Deductions (Optional)
              </label>
              <input
                type="number"
                value={reviewForm.deductions}
                onChange={(e) => setReviewForm(prev => ({ ...prev, deductions: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deduction Reason
              </label>
              <input
                type="text"
                value={reviewForm.deductionReason}
                onChange={(e) => setReviewForm(prev => ({ ...prev, deductionReason: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Reason for deductions..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject IPC
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Detail Item Component
const DetailItem = ({ label, value, icon: Icon, className = '' }) => (
  <div className={`flex justify-between items-center py-2 ${className}`}>
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {value}
    </span>
  </div>
);

export default IPCDetailPage;