"use client";
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Eye,
  RefreshCw,
  ChevronRight,
  Building,
  Shield,
  Award,
  FileCheck,
  History,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendorSubmissionTracker() {
  const [submissionData, setSubmissionData] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch submission data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setSubmissionData(result.data);
        
        // Fetch timeline data
        const timelineResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/submissions/timeline`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (timelineResponse.ok) {
          const timelineResult = await timelineResponse.json();
          if (timelineResult.success) {
            setTimelineData(timelineResult.data);
          }
        }
      } else {
        throw new Error(result.error || 'Failed to load submission data');
      }
    } catch (err) {
      console.error('Error fetching submission data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionData();
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      'NEW': { color: 'bg-gray-100 text-gray-800', icon: Clock },
      'UNDER_REVIEW': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'APPROVED': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'REJECTED': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'NEEDS_RENEWAL': { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      'BLACKLISTED': { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const config = statusConfig[status] || statusConfig['NEW'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getDocumentStatusBadge = (document) => {
    if (document.status === 'EXPIRED') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Expired</span>;
    } else if (document.daysUntilExpiry !== null && document.daysUntilExpiry <= 30) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Expiring in {document.daysUntilExpiry} days</span>;
    } else if (document.status === 'VALID') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Valid</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Pending</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateQualification = () => {
    router.push('/vendor/qualification');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your submission status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Submission Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSubmissionData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!submissionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Submission Found</h3>
          <p className="text-gray-600 mb-4">You haven't submitted a vendor qualification yet.</p>
          <button
            onClick={() => router.push('/vendor/qualification')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Qualification Process
          </button>
        </div>
      </div>
    );
  }

  const { vendor, statistics, documents, projects, categories, assignedReviewer, approvalWorkflow, timeline } = submissionData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Vendor Submission Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor your qualification status and submission details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchSubmissionData}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleUpdateQualification}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Update Qualification
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Overall Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              {getStatusBadge(vendor.status)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualification Status</h3>
            <p className="text-gray-600 text-sm">
              {vendor.reviewStatus || 'Awaiting initial review'}
            </p>
            {vendor.lastReviewedAt && (
              <p className="text-xs text-gray-500 mt-2">
                Last reviewed: {formatDate(vendor.lastReviewedAt)}
              </p>
            )}
          </div>

          {/* Document Compliance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {statistics.documentCompliance}%
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Compliance</h3>
            <p className="text-gray-600 text-sm">
              {statistics.validDocuments} of {statistics.totalDocuments} documents valid
            </p>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${statistics.documentCompliance}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Expiry Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <span className={`text-2xl font-bold ${statistics.expiredDocuments > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {statistics.expiredDocuments + statistics.expiringDocuments}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Expiry Alerts</h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-red-600">{statistics.expiredDocuments}</span> expired
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-orange-600">{statistics.expiringDocuments}</span> expiring soon
              </p>
            </div>
          </div>

          {/* Vendor Classification */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {vendor.vendorClass || 'N/A'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendor Class</h3>
            <p className="text-gray-600 text-sm">
              Qualification Score: <span className="font-medium">{vendor.qualificationScore || 0}/100</span>
            </p>
            {vendor.isQualified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-2">
                <CheckCircle className="w-3 h-3" />
                Qualified Vendor
              </span>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'documents', 'projects', 'timeline', 'approvals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vendor Information */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Company Name</p>
                      <p className="font-medium">{vendor.companyLegalName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vendor ID</p>
                      <p className="font-medium">{vendor.vendorId || 'Pending'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vendor Type</p>
                      <p className="font-medium">{vendor.vendorType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Business Type</p>
                      <p className="font-medium">{vendor.businessType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Categories</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {categories.map((cat, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium">{formatDate(vendor.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Reviewer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Team</h3>
                  {assignedReviewer ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Assigned Reviewer</p>
                        <p className="font-medium">{assignedReviewer.name}</p>
                        <p className="text-sm text-gray-600">{assignedReviewer.jobTitle}</p>
                        <p className="text-sm text-blue-600">{assignedReviewer.email}</p>
                      </div>
                      {vendor.lastReviewedBy && (
                        <div>
                          <p className="text-sm text-gray-500">Last Reviewed By</p>
                          <p className="font-medium">{vendor.lastReviewedBy.name}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviewer assigned yet</p>
                  )}
                </div>
              </div>

              {/* Action Required Section */}
              {(statistics.expiredDocuments > 0 || vendor.status === 'NEEDS_RENEWAL') && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Action Required</h4>
                      <ul className="text-sm text-red-700 mt-1 space-y-1">
                        {statistics.expiredDocuments > 0 && (
                          <li>• {statistics.expiredDocuments} document(s) have expired</li>
                        )}
                        {vendor.status === 'NEEDS_RENEWAL' && (
                          <li>• Qualification renewal required</li>
                        )}
                      </ul>
                      <button
                        onClick={handleUpdateQualification}
                        className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Update Documents Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Document Checklist</h3>
                <span className="text-sm text-gray-500">
                  {statistics.validDocuments} of {statistics.totalDocuments} valid
                </span>
              </div>
              
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{doc.docType.replace(/_/g, ' ')}</span>
                          {getDocumentStatusBadge(doc)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {doc.fileName} • Uploaded: {formatDate(doc.uploadedAt)}
                          {doc.expiryDate && ` • Expires: ${formatDate(doc.expiryDate)}`}
                          {doc.daysUntilExpiry !== null && doc.daysUntilExpiry > 0 && (
                            <span className="ml-2">({doc.daysUntilExpiry} days remaining)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Experience</h3>
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{project.projectName}</h4>
                          <p className="text-sm text-gray-600">Client: {project.clientName}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Value: ${project.contractValue?.toLocaleString() || 'N/A'}</span>
                            <span>Period: {formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                          </div>
                        </div>
                        {project.completionFile && (
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200">
                            View Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No project experience recorded</p>
                  <button
                    onClick={handleUpdateQualification}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Project Experience
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Submission Timeline</h3>
              <div className="space-y-6">
                {timelineData.length > 0 ? (
                  <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    {timelineData.map((item, index) => (
                      <div key={item.id || index} className="relative flex items-start mb-6">
                        {/* Dot */}
                        <div className={`absolute left-4 w-3 h-3 rounded-full -translate-x-1/2 ${
                          item.type === 'APPROVAL' 
                            ? item.status === 'APPROVED' ? 'bg-green-500' : 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}></div>
                        
                        {/* Content */}
                        <div className="ml-10 flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{item.event}</h4>
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                {item.user && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    By: {item.user.name} ({item.user.email})
                                  </p>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDateTime(item.date)}
                              </span>
                            </div>
                            {item.details && (
                              <p className="text-sm text-gray-700 mt-2 p-2 bg-white rounded border">
                                {item.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No timeline data available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Approval Workflow</h3>
              {approvalWorkflow ? (
                <div className="space-y-6">
                  {/* Workflow Header */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-blue-900">{approvalWorkflow.name}</h4>
                        <p className="text-sm text-blue-700">
                          Status: <span className="font-medium">{approvalWorkflow.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-700">
                          Step {approvalWorkflow.currentStep} of {approvalWorkflow.steps.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4">
                    {approvalWorkflow.steps.map((step, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${
                        index < approvalWorkflow.currentStep 
                          ? 'border-green-200 bg-green-50'
                          : index === approvalWorkflow.currentStep
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              step.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                              step.status === 'PENDING' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {step.role} Approval
                              </h5>
                              <p className="text-sm text-gray-600">
                                Status: <span className="font-medium">{step.status}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {step.approver ? (
                              <div>
                                <p className="text-sm text-gray-900">{step.approver.name}</p>
                                <p className="text-xs text-gray-500">{step.approver.email}</p>
                                {step.approvedAt && (
                                  <p className="text-xs text-gray-500">
                                    {formatDate(step.approvedAt)}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Awaiting assignment</p>
                            )}
                          </div>
                        </div>
                        {step.comments && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            <p className="text-sm text-gray-700">{step.comments}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No approval workflow initiated yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Next Steps */}
        {vendor.status === 'UNDER_REVIEW' && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Submission Under Review</h3>
                <p className="text-blue-800 mb-3">
                  Your qualification is currently being reviewed by our procurement team. 
                  You will be notified once a decision has been made.
                </p>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Estimated review time: 5-7 business days</p>
                  <p>• You will receive email notifications for any updates</p>
                  <p>• Ensure all contact information is up to date</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleUpdateQualification}
            className="p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <FileText className="w-5 h-5 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Update Qualification</h4>
            <p className="text-sm text-gray-600 mt-1">Edit your company information or documents</p>
          </button>
          
          <button
            onClick={() => window.print()}
            className="p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <Download className="w-5 h-5 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Download Report</h4>
            <p className="text-sm text-gray-600 mt-1">Export your qualification details as PDF</p>
          </button>
          
          <button
            onClick={() => router.push('/vendor/dashboard')}
            className="p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">View Dashboard</h4>
            <p className="text-sm text-gray-600 mt-1">Go back to vendor dashboard</p>
          </button>
        </div>
      </div>
    </div>
  );
}