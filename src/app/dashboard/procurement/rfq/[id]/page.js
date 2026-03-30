// frontend/src/app/dashboard/procurement/rfq/[id]/page.js - MOBILE OPTIMIZED
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Calendar, DollarSign, Package, User, FileText,
    CheckCircle, Clock, Send, Users, Download, Edit, Trash2,
    MessageSquare, Award, BarChart3, Mail, Phone, MapPin,
    Plus, AlertTriangle, ChevronDown, ChevronUp, Star, X, Eye
  } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';
import VendorEvaluationModal from '@/components/VendorEvaluationModal';
import FilePreviewModal from '@/components/documents/FilePreviewModal';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const RFQDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const rfqId = params.id;

    const [rfq, setRfq] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [evaluationModal, setEvaluationModal] = useState({
      isOpen: false,
      submission: null
    });

    // Comparison tab state
    const [technicalComps, setTechnicalComps] = useState([]);
    const [financialComps, setFinancialComps] = useState([]);
    const [evaluationSummary, setEvaluationSummary] = useState(null);
    const [compLoading, setCompLoading] = useState({ tech: false, fin: false, eval: false });
    const [toastMsg, setToastMsg] = useState(null);
    const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', fileName: '' });

    const showToast = (msg, type = 'success') => {
      setToastMsg({ msg, type });
      setTimeout(() => setToastMsg(null), 3000);
    };

    const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
    const userRoleId = user.roleId;

    // Fetch RFQ details and submissions
    const fetchData = async () => {
      if (!rfqId || rfqId === 'undefined') return;
      try {
        const token = localStorage.getItem('authToken');
        setLoading(true);

        const rfqResponse = await axios.get(`${API_BASE_URL}/rfqs/${rfqId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRfq(rfqResponse.data);

        const submissionsResponse = await axios.get(
          `${API_BASE_URL}/submissions?rfqId=${rfqId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmissions(submissionsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTechnicalComps = async () => {
      if (!rfqId || rfqId === 'undefined') return;
      setCompLoading(prev => ({ ...prev, tech: true }));
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_BASE_URL}/rfqs/${rfqId}/technical-comparison`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTechnicalComps(res.data);
      } catch (e) {
        console.error('Failed to fetch technical comparisons:', e);
      } finally {
        setCompLoading(prev => ({ ...prev, tech: false }));
      }
    };

    const fetchFinancialComps = async () => {
      if (!rfqId || rfqId === 'undefined') return;
      setCompLoading(prev => ({ ...prev, fin: true }));
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_BASE_URL}/rfqs/${rfqId}/financial-comparison`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFinancialComps(res.data);
      } catch (e) {
        console.error('Failed to fetch financial comparisons:', e);
      } finally {
        setCompLoading(prev => ({ ...prev, fin: false }));
      }
    };

    const fetchEvaluationSummary = async () => {
      if (!rfqId || rfqId === 'undefined') return;
      setCompLoading(prev => ({ ...prev, eval: true }));
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_BASE_URL}/rfqs/${rfqId}/evaluation-summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvaluationSummary(res.data);
      } catch (e) {
        console.error('Failed to fetch evaluation summary:', e);
      } finally {
        setCompLoading(prev => ({ ...prev, eval: false }));
      }
    };

    useEffect(() => {
      if (rfqId && rfqId !== 'undefined') {
        fetchData();
      }
    }, [rfqId]);

    useEffect(() => {
      if (!rfqId || rfqId === 'undefined') return;
      if (activeTab === 'technical') fetchTechnicalComps();
      if (activeTab === 'financial') fetchFinancialComps();
      if (activeTab === 'evaluation') {
        fetchTechnicalComps();
        fetchFinancialComps();
        fetchEvaluationSummary();
      }
    }, [activeTab, rfqId]);

    // Invited vendors derived from submissions
    const invitedVendors = submissions.map(s => ({
      id: s.vendorId,
      name: s.vendor?.companyLegalName || s.vendor?.companyName || `Vendor #${s.vendorId}`
    }));

    // Status configuration
    const getStatusConfig = (status) => {
      const statusConfigs = {
        DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: Clock },
        ISSUED: { color: 'bg-blue-100 text-blue-800', label: 'Issued', icon: Send },
        OPEN: { color: 'bg-yellow-100 text-yellow-800', label: 'Open', icon: AlertTriangle },
        CLOSED: { color: 'bg-purple-100 text-purple-800', label: 'Closed', icon: CheckCircle },
        AWARDED: { color: 'bg-green-100 text-green-800', label: 'Awarded', icon: Award },
        CANCELED: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: Clock }
      };
      return statusConfigs[status] || statusConfigs.DRAFT;
    };

    const handleVendorEvaluation = async (submissionId, evaluationData) => {
      try {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user'));
        const payload = { ...evaluationData, reviewedById: user.id };
        await axios.post(
          `${API_BASE_URL}/submissions/${submissionId}/evaluate`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
        setEvaluationModal({ isOpen: false, submission: null });
      } catch (error) {
        console.error('Failed to evaluate submission:', error);
        alert('Failed to submit evaluation');
      }
    };

    const openEvaluationModal = (submission) => {
      setEvaluationModal({ isOpen: true, submission });
    };

    const updateRFQStatus = async (newStatus) => {
      try {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token) { alert('No authentication token found. Please log in again.'); return; }
        const statusMap = {
          'DRAFT': 'DRAFT', 'PUBLISHED': 'ISSUED', 'UNDER_EVALUATION': 'OPEN',
          'AWARDED': 'AWARDED', 'CLOSED': 'CLOSED', 'CANCELLED': 'CANCELED'
        };
        const backendStatus = statusMap[newStatus] || newStatus;
        await axios.put(
          `${API_BASE_URL}/rfqs/${rfqId}`,
          { status: backendStatus },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        fetchData();
        alert(`RFQ status updated to ${newStatus}`);
      } catch (error) {
        console.error('❌ Failed to update status:', error);
        if (error.response?.status === 401) {
          alert('Authentication failed. Please log in again.');
          localStorage.clear();
          router.push('/login');
        } else if (error.response) {
          alert(`Server error: ${error.response.data.error || error.response.statusText}`);
        } else {
          alert('Network error. Please check your connection.');
        }
      }
    };

    const awardContract = async (submissionId) => {
      try {
        const token = localStorage.getItem('authToken');
        await axios.put(
          `${API_BASE_URL}/submissions/${submissionId}`,
          { status: 'AWARDED' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await updateRFQStatus('AWARDED');
        alert('Contract awarded successfully!');
      } catch (error) {
        console.error('Failed to award contract:', error);
        alert('Failed to award contract');
      }
    };

    const allTabs = [
      { id: 'overview', label: 'Overview', icon: FileText },
      { id: 'submissions', label: `Submissions (${submissions.length})`, icon: Users },
      { id: 'evaluation', label: 'Evaluation', icon: BarChart3 },
      { id: 'documents', label: 'Documents', icon: Download },
      { id: 'technical', label: 'Technical Comparison', icon: BarChart3 },
      { id: 'financial', label: 'Financial Comparison', icon: DollarSign },
      { id: 'evalSummary', label: 'Evaluation & Award', icon: Award },
    ];

    // Mobile Tab Navigation
    const MobileTabNavigation = () => (
      <div className="lg:hidden mb-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="font-semibold text-gray-800">
              {allTabs.find(t => t.id === activeTab)?.label || 'Overview'}
            </span>
            {mobileMenuOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {mobileMenuOpen && (
            <div className="border-t border-gray-200">
              {allTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center p-4 text-left border-b border-gray-100 last:border-b-0 ${
                      activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );

    if (loading) {
      return (
        <ResponsiveLayout>
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-center min-h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </ResponsiveLayout>
      );
    }

    if (!rfq) {
      return (
        <ResponsiveLayout>
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">RFQ Not Found</h2>
              <p className="text-gray-600 mb-4">The requested RFQ could not be found.</p>
              <Link href="/dashboard/procurement/rfq" className="text-blue-600 hover:text-blue-800">
                Back to RFQs
              </Link>
            </div>
          </div>
        </ResponsiveLayout>
      );
    }

    const statusConfig = getStatusConfig(rfq.status);

    const renderTabContent = () => (
      <>
        {activeTab === 'overview' && <OverviewTab rfq={rfq} />}
        {activeTab === 'submissions' && (
          <SubmissionsTab
            submissions={submissions}
            onEvaluate={openEvaluationModal}
            onAwardContract={awardContract}
            rfqStatus={rfq.status}
          />
        )}
        {activeTab === 'evaluation' && <EvaluationTab rfq={rfq} submissions={submissions} />}
        {activeTab === 'documents' && (
          <DocumentsTab
            rfq={rfq}
            onPreview={({ fileUrl, fileName }) => setPreviewModal({ isOpen: true, fileUrl, fileName })}
          />
        )}
        {activeTab === 'technical' && (
          <TechnicalComparisonTab
            rfqId={rfqId}
            rows={technicalComps}
            loading={compLoading.tech}
            invitedVendors={invitedVendors}
            userRoleId={userRoleId}
            onSaved={(msg) => { fetchTechnicalComps(); showToast(msg); }}
            showToast={showToast}
            onPreview={({ fileUrl, fileName }) => setPreviewModal({ isOpen: true, fileUrl, fileName })}
          />
        )}
        {activeTab === 'financial' && (
          <FinancialComparisonTab
            rfqId={rfqId}
            rows={financialComps}
            loading={compLoading.fin}
            invitedVendors={invitedVendors}
            userRoleId={userRoleId}
            onSaved={(msg) => { fetchFinancialComps(); showToast(msg); }}
            showToast={showToast}
          />
        )}
        {activeTab === 'evalSummary' && (
          <EvaluationSummaryTab
            rfqId={rfqId}
            evaluation={evaluationSummary}
            loading={compLoading.eval}
            technicalComps={technicalComps}
            financialComps={financialComps}
            rfq={rfq}
            userRoleId={userRoleId}
            onSaved={(msg) => { fetchEvaluationSummary(); showToast(msg); }}
            setEvaluation={setEvaluationSummary}
            showToast={showToast}
          />
        )}
      </>
    );

    return (
      <ResponsiveLayout>
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/dashboard/procurement/rfq"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to RFQs</span>
            </Link>

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{rfq.title}</h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} mt-2 sm:mt-0`}>
                    <statusConfig.icon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  RFQ Number: {rfq.rfqNumber} • Project: {rfq.projectName}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {rfq.status === 'DRAFT' && (
                  <button
                    onClick={() => updateRFQStatus('PUBLISHED')}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Publish RFQ</span>
                    <span className="sm:hidden">Publish</span>
                  </button>
                )}
                {rfq.status === 'ISSUED' && (
                  <button
                    onClick={() => updateRFQStatus('UNDER_EVALUATION')}
                    className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Start Evaluation</span>
                    <span className="sm:hidden">Evaluate</span>
                  </button>
                )}
                <Link
                  href={`/dashboard/procurement/rfq/${rfqId}/edit`}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Submissions</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{submissions.length}</p>
                </div>
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Budget</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {rfq.estimatedUnitPrice ? `$${rfq.estimatedUnitPrice.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Due Date</p>
                  <p className="text-sm sm:text-lg font-bold text-orange-600">
                    {rfq.dueDate ? new Date(rfq.dueDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">CSI Code</p>
                  <p className="text-sm sm:text-lg font-bold text-purple-600">{rfq.csiCode || 'N/A'}</p>
                </div>
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <MobileTabNavigation />

          {/* Desktop Tabs */}
          <div className="hidden lg:block bg-white rounded-lg border border-gray-200 mb-6">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex -mb-px min-w-max">
                {allTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap ${
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
              {renderTabContent()}
            </div>
          </div>

          {/* Mobile Content */}
          <div className="lg:hidden">
            {renderTabContent()}
          </div>

          {/* Evaluation Modal */}
          <VendorEvaluationModal
            submission={evaluationModal.submission}
            isOpen={evaluationModal.isOpen}
            onClose={() => setEvaluationModal({ isOpen: false, submission: null })}
            onEvaluate={handleVendorEvaluation}
          />

          {/* Toast */}
          {toastMsg && (
            <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white z-50 flex items-center gap-2 ${
              toastMsg.type === 'error' ? 'bg-red-600' : 'bg-green-600'
            }`}>
              {toastMsg.msg}
            </div>
          )}

          <FilePreviewModal
            isOpen={previewModal.isOpen}
            onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
            fileUrl={previewModal.fileUrl}
            fileName={previewModal.fileName}
          />
        </div>
      </ResponsiveLayout>
    );
};


// ─── Tab Components ───────────────────────────────────────────────────────────

const OverviewTab = ({ rfq }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-3">
          <DetailItem label="RFQ Number" value={rfq.rfqNumber} />
          <DetailItem label="Project" value={rfq.projectName} />
          <DetailItem label="CSI Code" value={rfq.csiCode} />
          <DetailItem label="Currency" value={rfq.currency} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <div className="space-y-3">
          <DetailItem label="Required Date" value={rfq.requiredDate ? new Date(rfq.requiredDate).toLocaleDateString() : 'N/A'} icon={Calendar} />
          <DetailItem label="Target Submission" value={rfq.targetSubmissionDate ? new Date(rfq.targetSubmissionDate).toLocaleDateString() : 'N/A'} icon={Calendar} />
          <DetailItem label="Due Date" value={rfq.dueDate ? new Date(rfq.dueDate).toLocaleDateString() : 'N/A'} icon={Calendar} />
        </div>
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-4">Description & Scope</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Description</h4>
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{rfq.description || 'No description provided.'}</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Package Scope</h4>
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{rfq.packageScope || 'No scope details provided.'}</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Item Description</h4>
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{rfq.itemDesc || 'No item description provided.'}</p>
        </div>
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-4">Budget Information</h3>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-800">
            Estimated Budget: {rfq.estimatedUnitPrice ? `$${rfq.estimatedUnitPrice.toLocaleString()}` : 'Not specified'}
          </span>
          <DollarSign className="text-blue-600 w-8 h-8" />
        </div>
      </div>
    </div>
  </div>
);

const SubmissionsTab = ({ submissions, onEvaluate, onAwardContract, rfqStatus }) => {
  const getStatusColor = (status) => {
    const colors = {
      SUBMITTED: 'bg-blue-100 text-blue-800', UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      RECOMMENDED: 'bg-green-100 text-green-800', AWARDED: 'bg-purple-100 text-purple-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  const getLatestEvaluation = (submission) => submission.evaluations?.[0] || null;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Vendor Submissions ({submissions.length})</h3>
        {rfqStatus === 'AWARDED' && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Contract Awarded</span>
        )}
      </div>
      {submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>No vendor submissions yet.</p>
          <p className="text-sm">Vendors can submit proposals once the RFQ is published.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const evaluation = getLatestEvaluation(submission);
            return (
              <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{submission.vendor?.companyName}</h4>
                    <p className="text-gray-600 text-sm">
                      Vendor ID: {submission.vendor?.vendorId} • Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <DetailItem label="Proposed Amount" value={`$${submission.proposedAmount?.toLocaleString() || 'N/A'}`} />
                  <DetailItem label="Delivery Time" value={submission.deliveryTime ? `${submission.deliveryTime} days` : 'N/A'} />
                  <DetailItem label="Payment Terms" value={submission.paymentTerms || 'N/A'} />
                  <DetailItem label="Score" value={evaluation ? `${evaluation.overallScore}/5` : 'Not evaluated'} />
                </div>
                {evaluation && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Latest Evaluation</span>
                      <span className="text-xs text-gray-500">by {evaluation.reviewedBy?.name} on {new Date(evaluation.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{evaluation.notes || 'No evaluation notes.'}</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                      <FileText className="w-4 h-4 mr-1" />View Proposal
                    </button>
                    <button className="flex items-center text-gray-600 hover:text-gray-800 text-sm">
                      <Download className="w-4 h-4 mr-1" />Download
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    {submission.status !== 'AWARDED' && (
                      <>
                        <button onClick={() => onEvaluate(submission)} className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          <BarChart3 className="w-4 h-4 mr-1" />Evaluate
                        </button>
                        {evaluation?.recommendation === 'APPROVE' && (
                          <button onClick={() => onAwardContract(submission.id)} className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                            <Award className="w-4 h-4 mr-1" />Award
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EvaluationTab = ({ rfq }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Evaluation Criteria & Scoring</h3>
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <BarChart3 className="w-5 h-5 text-yellow-600 mr-2" />
        <p className="text-yellow-800">Evaluation in progress. {rfq.submissions?.length || 0} submissions to review.</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Technical Evaluation (40%)</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Compliance with specifications</li>
          <li>• Technical capability</li>
          <li>• Project methodology</li>
          <li>• Quality assurance</li>
        </ul>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold mb-3">Commercial Evaluation (60%)</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Price competitiveness</li>
          <li>• Payment terms</li>
          <li>• Delivery timeline</li>
          <li>• Warranty & support</li>
        </ul>
      </div>
    </div>
  </div>
);

const DocumentsTab = ({ rfq, onPreview }) => {
  const attachments = rfq.rfqAttachments || [];
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Related Documents</h3>
      {attachments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>No documents attached to this RFQ.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attachments.map((doc) => {
            const fileUrl = doc.fileUrl || doc.url || doc.filePath;
            const fileName = doc.fileName || doc.name || fileUrl?.split('/').pop() || 'Document';
            return (
              <div key={doc.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium">{fileName}</p>
                    {doc.uploadedAt && (
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onPreview && fileUrl && (
                    <button
                      onClick={() => onPreview({ fileUrl, fileName })}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded border transition-colors hover:opacity-80"
                      style={{ borderColor: '#B8960A', color: '#B8960A' }}
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  )}
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Technical Comparison Tab ─────────────────────────────────────────────────

const TechnicalComparisonTab = ({ rfqId, rows, loading, invitedVendors, userRoleId, onSaved, showToast, onPreview }) => {
  const [modal, setModal] = useState({ open: false, row: null });
  const [form, setForm] = useState({ vendorId: '', technicalCompliance: 'PARTIAL', technicalScore: 70, technicalNotes: '', attachmentPath: '' });
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setForm({ vendorId: '', technicalCompliance: 'PARTIAL', technicalScore: 70, technicalNotes: '', attachmentPath: '' });
    setModal({ open: true, row: null });
  };
  const openEdit = (row) => {
    setForm({
      vendorId: row.vendorId,
      technicalCompliance: row.technicalCompliance,
      technicalScore: row.technicalScore ?? 70,
      technicalNotes: row.technicalNotes ?? '',
      attachmentPath: row.attachmentPath ?? '',
    });
    setModal({ open: true, row });
  };

  const save = async () => {
    if (!form.vendorId) { showToast('Please select a vendor', 'error'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs/${rfqId}/technical-comparison`,
        { ...form, vendorId: parseInt(form.vendorId), technicalScore: parseInt(form.technicalScore) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModal({ open: false, row: null });
      onSaved(modal.row ? 'Technical evaluation updated' : 'Technical evaluation saved');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const compliancePill = (c) => {
    const cfg = { YES: 'bg-green-100 text-green-800', PARTIAL: 'bg-amber-100 text-amber-800', NO: 'bg-red-100 text-red-800' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg[c] || cfg.PARTIAL}`}>{c}</span>;
  };

  const scoreBar = (score) => {
    if (score == null) return <span className="text-gray-400 text-sm">—</span>;
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 bg-gray-200 rounded-full h-2">
          <div className={`${color} h-2 rounded-full`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-sm font-medium">{score}</span>
      </div>
    );
  };

  const highest = rows.reduce((best, r) => (r.technicalScore != null && (best == null || r.technicalScore > best.technicalScore) ? r : best), null);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Technical Evaluation</h3>
        {userRoleId <= 3 && (
          <button onClick={openAdd} className="flex items-center gap-1 px-3 py-2 text-sm text-white rounded-lg" style={{ background: '#B8960A' }}>
            <Plus className="w-4 h-4" /> Add Vendor Evaluation
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No technical evaluations yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Vendor</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Class</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Compliance</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Score</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Notes</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Attachment</th>
                <th className="py-2 px-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium">{row.vendor?.companyLegalName}</td>
                  <td className="py-3 px-3">
                    {row.vendor?.vendorClass && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{row.vendor.vendorClass}</span>}
                  </td>
                  <td className="py-3 px-3">{compliancePill(row.technicalCompliance)}</td>
                  <td className="py-3 px-3">{scoreBar(row.technicalScore)}</td>
                  <td className="py-3 px-3 text-gray-500 max-w-xs truncate">{row.technicalNotes || '—'}</td>
                  <td className="py-3 px-3">
                    {row.attachmentPath ? (
                      <button
                        onClick={() => onPreview?.({ fileUrl: row.attachmentPath, fileName: row.attachmentPath.split('/').pop() || 'Attachment' })}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded border hover:opacity-80"
                        style={{ borderColor: '#B8960A', color: '#B8960A' }}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-3">
                    {userRoleId <= 3 && (
                      <button onClick={() => openEdit(row)} className="text-gray-400 hover:text-gray-700">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {highest && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <span className="font-medium text-green-800">Highest Technical Score: </span>
          <span className="text-green-700">{highest.vendor?.companyLegalName} — {highest.technicalScore}/100</span>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b">
              <h4 className="font-semibold text-lg">{modal.row ? 'Edit' : 'Add'} Vendor Evaluation</h4>
              <button onClick={() => setModal({ open: false, row: null })}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  value={form.vendorId}
                  onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))}
                  disabled={!!modal.row}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select vendor...</option>
                  {invitedVendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compliance</label>
                <div className="flex gap-4">
                  {['YES', 'PARTIAL', 'NO'].map(c => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="compliance" value={c} checked={form.technicalCompliance === c} onChange={() => setForm(f => ({ ...f, technicalCompliance: c }))} />
                      <span className="text-sm">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technical Score: <span className="font-bold text-blue-600">{form.technicalScore}</span>/100</label>
                <input type="range" min="0" max="100" value={form.technicalScore} onChange={e => setForm(f => ({ ...f, technicalScore: e.target.value }))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.technicalNotes} onChange={e => setForm(f => ({ ...f, technicalNotes: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional notes..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment Path / URL</label>
                <input type="text" value={form.attachmentPath} onChange={e => setForm(f => ({ ...f, attachmentPath: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional URL or file path..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button onClick={() => setModal({ open: false, row: null })} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ background: '#B8960A' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Financial Comparison Tab ─────────────────────────────────────────────────

const FinancialComparisonTab = ({ rfqId, rows, loading, invitedVendors, userRoleId, onSaved, showToast }) => {
  const [modal, setModal] = useState({ open: false, row: null });
  const [form, setForm] = useState({ vendorId: '', currency: 'SAR', unitPrice: '', quantity: '', deliveryTimeDays: '', paymentTerms: '', discount: '', warrantyPeriod: '', commercialNotes: '' });
  const [saving, setSaving] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const openAdd = () => {
    setForm({ vendorId: '', currency: 'SAR', unitPrice: '', quantity: '', deliveryTimeDays: '', paymentTerms: '', discount: '', warrantyPeriod: '', commercialNotes: '' });
    setModal({ open: true, row: null });
  };
  const openEdit = (row) => {
    setForm({
      vendorId: row.vendorId,
      currency: row.currency,
      unitPrice: row.unitPrice,
      quantity: row.quantity,
      deliveryTimeDays: row.deliveryTimeDays ?? '',
      paymentTerms: row.paymentTerms ?? '',
      discount: row.discount ?? '',
      warrantyPeriod: row.warrantyPeriod ?? '',
      commercialNotes: row.commercialNotes ?? '',
    });
    setModal({ open: true, row });
  };

  const liveTotal = () => {
    const up = parseFloat(form.unitPrice) || 0;
    const qty = parseFloat(form.quantity) || 0;
    const disc = parseFloat(form.discount) || 0;
    return Math.max(0, up * qty - disc);
  };

  const save = async () => {
    if (!form.vendorId) { showToast('Please select a vendor', 'error'); return; }
    if (!form.unitPrice || !form.quantity) { showToast('Unit price and quantity are required', 'error'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs/${rfqId}/financial-comparison`,
        { ...form, vendorId: parseInt(form.vendorId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModal({ open: false, row: null });
      onSaved(modal.row ? 'Quote updated' : 'Quote saved');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const markLowest = async (vendorId) => {
    setMarkingId(vendorId);
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs/${rfqId}/financial-comparison/mark-lowest`,
        { vendorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSaved('Lowest commercial marked');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to mark', 'error');
    } finally {
      setMarkingId(null);
    }
  };

  const lowest = rows.find(r => r.isLowestCommercial);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Commercial Evaluation</h3>
        <div className="flex gap-2">
          <button onClick={() => showToast('PDF export coming soon')} className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          {userRoleId <= 3 && (
            <button onClick={openAdd} className="flex items-center gap-1 px-3 py-2 text-sm text-white rounded-lg" style={{ background: '#B8960A' }}>
              <Plus className="w-4 h-4" /> Add Vendor Quote
            </button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No financial quotes yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Vendor</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Currency</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Unit Price</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Qty</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Total Price</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Delivery</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Payment</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Discount</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Warranty</th>
                <th className="py-2 px-3 text-gray-500 font-medium text-center">★</th>
                <th className="py-2 px-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className={`border-b border-gray-100 hover:bg-gray-50 ${row.isLowestCommercial ? 'bg-green-50' : ''}`}>
                  <td className="py-3 px-3 font-medium">
                    {row.vendor?.companyLegalName}
                    {row.vendor?.vendorClass && <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">{row.vendor.vendorClass}</span>}
                  </td>
                  <td className="py-3 px-3">{row.currency}</td>
                  <td className="py-3 px-3 text-right">{row.unitPrice?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">{row.quantity}</td>
                  <td className="py-3 px-3 text-right font-semibold">{row.totalPrice?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">{row.deliveryTimeDays ? `${row.deliveryTimeDays}d` : '—'}</td>
                  <td className="py-3 px-3 text-gray-500 truncate max-w-[100px]">{row.paymentTerms || '—'}</td>
                  <td className="py-3 px-3 text-right">{row.discount ? row.discount.toLocaleString() : '—'}</td>
                  <td className="py-3 px-3 text-gray-500 truncate max-w-[100px]">{row.warrantyPeriod || '—'}</td>
                  <td className="py-3 px-3 text-center">
                    {row.isLowestCommercial ? (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-400 mx-auto" />
                    ) : (
                      userRoleId <= 2 && (
                        <button
                          onClick={() => markLowest(row.vendorId)}
                          disabled={markingId === row.vendorId}
                          className="text-xs text-gray-400 hover:text-yellow-600 disabled:opacity-50"
                          title="Mark as lowest"
                        >
                          <Star className="w-4 h-4 mx-auto" />
                        </button>
                      )
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      {userRoleId <= 3 && (
                        <button onClick={() => openEdit(row)} className="text-gray-400 hover:text-gray-700"><Edit className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {lowest && (
        <div className="mt-4 p-3 rounded-lg text-sm font-medium" style={{ background: '#FFF8E1', borderLeft: `4px solid #B8960A`, color: '#7A6200' }}>
          Lowest Price: {lowest.vendor?.companyLegalName} — {lowest.totalPrice?.toLocaleString()} {lowest.currency}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <h4 className="font-semibold text-lg">{modal.row ? 'Edit' : 'Add'} Vendor Quote</h4>
              <button onClick={() => setModal({ open: false, row: null })}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))} disabled={!!modal.row} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  <option value="">Select vendor...</option>
                  {invitedVendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['SAR', 'USD', 'EUR'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                  <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" min="0" step="0.01" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1" />
                </div>
              </div>
              <div className="p-3 rounded-lg text-sm font-medium" style={{ background: '#FFF8E1', color: '#7A6200' }}>
                Total Price (auto): {liveTotal().toLocaleString()} {form.currency}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery (days)</label>
                  <input type="number" min="0" value={form.deliveryTimeDays} onChange={e => setForm(f => ({ ...f, deliveryTimeDays: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <input type="number" min="0" step="0.01" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <input type="text" value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Net 30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Period</label>
                <input type="text" value={form.warrantyPeriod} onChange={e => setForm(f => ({ ...f, warrantyPeriod: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 1 year" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Notes</label>
                <textarea value={form.commercialNotes} onChange={e => setForm(f => ({ ...f, commercialNotes: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setModal({ open: false, row: null })} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ background: '#B8960A' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Evaluation Summary & Award Tab ──────────────────────────────────────────

const EvaluationSummaryTab = ({ rfqId, evaluation, loading, technicalComps, financialComps, rfq, userRoleId, onSaved, setEvaluation, showToast }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ recommendedVendorId: '', technicalScore: '', commercialRank: '1st', awardJustification: '' });
  const [saving, setSaving] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Vendors in both tech AND financial comparisons
  const tcVendorIds = new Set(technicalComps.map(r => r.vendorId));
  const fcVendorIds = new Set(financialComps.map(r => r.vendorId));
  const eligibleVendors = technicalComps.filter(r => fcVendorIds.has(r.vendorId)).map(r => ({
    id: r.vendorId,
    name: r.vendor?.companyLegalName || `Vendor #${r.vendorId}`,
    techScore: r.technicalScore,
  }));

  const handleVendorChange = (vendorId) => {
    const vendor = eligibleVendors.find(v => v.id === parseInt(vendorId));
    setForm(f => ({ ...f, recommendedVendorId: vendorId, technicalScore: vendor?.techScore ?? '' }));
  };

  const submit = async () => {
    if (!form.recommendedVendorId) { showToast('Select a vendor', 'error'); return; }
    if (form.awardJustification.length < 50) { showToast('Justification must be at least 50 characters', 'error'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs/${rfqId}/evaluation-summary`,
        { ...form, recommendedVendorId: parseInt(form.recommendedVendorId), technicalScore: form.technicalScore ? parseInt(form.technicalScore) : undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluation(res.data);
      setShowForm(false);
      onSaved('Evaluation submitted for approval');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to submit', 'error');
    } finally {
      setSaving(false);
    }
  };

  const approve = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs/${rfqId}/evaluation-summary/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluation(res.data.evaluation);
      onSaved(`Evaluation approved — PO #${res.data.poId} created`);
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to approve', 'error');
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    if (!rejectReason.trim()) { showToast('Rejection reason is required', 'error'); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs/${rfqId}/evaluation-summary/reject`,
        { rejectionReason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluation(res.data);
      setShowRejectInput(false);
      setRejectReason('');
      onSaved('Evaluation rejected');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to reject', 'error');
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => {
    const cfg = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg[status] || cfg.PENDING}`}>{status}</span>;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  // State 1: no evaluation yet
  if (!evaluation && !showForm) {
    return (
      <div className="text-center py-12">
        <Award className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 mb-4">No evaluation submitted yet.</p>
        {userRoleId <= 3 && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2 text-white rounded-lg text-sm"
            style={{ background: '#B8960A' }}
          >
            Create Evaluation
          </button>
        )}
      </div>
    );
  }

  // Evaluation creation form
  if (!evaluation && showForm) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <h3 className="text-lg font-semibold">Create Evaluation</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Vendor</label>
          {eligibleVendors.length === 0 ? (
            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">Add both technical and financial evaluations for vendors before creating a summary.</p>
          ) : (
            <select value={form.recommendedVendorId} onChange={e => handleVendorChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select vendor...</option>
              {eligibleVendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Technical Score (auto-filled)</label>
          <input type="number" value={form.technicalScore} readOnly className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commercial Rank</label>
          <select value={form.commercialRank} onChange={e => setForm(f => ({ ...f, commercialRank: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {['1st', '2nd', '3rd'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Award Justification <span className="text-gray-400 text-xs">({form.awardJustification.length}/50 min)</span>
          </label>
          <textarea value={form.awardJustification} onChange={e => setForm(f => ({ ...f, awardJustification: e.target.value }))} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Provide justification for this award recommendation (min. 50 characters)..." />
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={saving || eligibleVendors.length === 0} className="px-5 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ background: '#0A1628' }}>
            {saving ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    );
  }

  // State 2: evaluation exists
  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{evaluation.recommendedVendor?.companyLegalName}</h3>
            {evaluation.recommendedVendor?.vendorClass && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs mt-1 inline-block">{evaluation.recommendedVendor.vendorClass}</span>
            )}
          </div>
          {statusBadge(evaluation.approvalStatus)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Technical Score</p>
            <p className="font-semibold">{evaluation.technicalScore != null ? `${evaluation.technicalScore}/100` : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Commercial Rank</p>
            <p className="font-semibold">{evaluation.commercialRank || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Submitted by</p>
            <p className="font-semibold text-sm">{evaluation.createdBy?.name || '—'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Justification</p>
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{evaluation.awardJustification}</p>
        </div>
      </div>

      {/* PENDING: approve / reject actions for Manager */}
      {evaluation.approvalStatus === 'PENDING' && userRoleId <= 2 && (
        <div className="space-y-3">
          {!showRejectInput ? (
            <div className="flex gap-3">
              <button onClick={approve} disabled={saving} className="px-5 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50">
                {saving ? 'Approving...' : 'Approve'}
              </button>
              <button onClick={() => setShowRejectInput(true)} className="px-5 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg">
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Enter rejection reason..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowRejectInput(false); setRejectReason(''); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={reject} disabled={saving} className="px-5 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
                  {saving ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APPROVED banner */}
      {evaluation.approvalStatus === 'APPROVED' && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Evaluation Approved — Purchase Order has been created automatically.</span>
          </div>
          {evaluation.createdPOId && (
            <Link
              href={`/dashboard/procurement/purchase-orders/${evaluation.createdPOId}`}
              className="px-4 py-2 text-sm text-white bg-green-700 hover:bg-green-800 rounded-lg whitespace-nowrap"
            >
              View PO
            </Link>
          )}
        </div>
      )}

      {/* REJECTED banner */}
      {evaluation.approvalStatus === 'REJECTED' && (
        <div className="space-y-3">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-800 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Evaluation Rejected</span>
            </div>
            <p className="text-sm text-red-700">{evaluation.awardJustification}</p>
          </div>
          {userRoleId <= 3 && (
            <button
              onClick={() => { setEvaluation(null); setShowForm(true); }}
              className="px-5 py-2 text-sm text-white rounded-lg"
              style={{ background: '#B8960A' }}
            >
              Re-submit Evaluation
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Shared Helpers ───────────────────────────────────────────────────────────

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {value}
    </span>
  </div>
);

export default RFQDetailPage;
