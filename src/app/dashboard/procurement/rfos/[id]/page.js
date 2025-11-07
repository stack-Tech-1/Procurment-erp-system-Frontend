// src/app/dashboard/procurement/rfos/[id]/page.jsx (Updated)
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { 
    ArrowLeft, Calendar, DollarSign, Package, User, FileText, 
    CheckCircle, Clock, Send, Users, Download, Edit, Trash2,
    MessageSquare, Award, BarChart3, Mail, Phone, MapPin,
    Plus, AlertTriangle 
  } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';
import VendorEvaluationModal from '@/components/VendorEvaluationModal';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const RFODetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const rfoId = params.id;
  
    const [rfo, setRfo] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [evaluationModal, setEvaluationModal] = useState({
      isOpen: false,
      submission: null
    });

    // Fetch RFO details and submissions
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch RFO details
      const rfoResponse = await axios.get(`${API_BASE_URL}/rfqs/${rfoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRfo(rfoResponse.data);

      // Fetch submissions for this RFO
      const submissionsResponse = await axios.get(
        `${API_BASE_URL}/submissions?rfqId=${rfoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions(submissionsResponse.data);

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rfoId) {
      fetchData();
    }
  }, [rfoId]);
 

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

  

  // Handle vendor evaluation
  const handleVendorEvaluation = async (submissionId, evaluationData) => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));

      const payload = {
        ...evaluationData,
        reviewedById: user.id
      };

      await axios.post(
        `${API_BASE_URL}/submissions/${submissionId}/evaluate`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh data
      fetchData();
      setEvaluationModal({ isOpen: false, submission: null });
      
    } catch (error) {
      console.error('Failed to evaluate submission:', error);
      alert('Failed to submit evaluation');
    }
  };

  // Open evaluation modal
  const openEvaluationModal = (submission) => {
    setEvaluationModal({
      isOpen: true,
      submission
    });
  };

  
const updateRFOStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));
      
      console.log('🔄 Update RFO Status:', {
        rfoId,
        newStatus, 
        tokenExists: !!token,
        user: user?.email
      });
  
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }
  
      // Map your frontend status to backend enum values
      const statusMap = {
        'DRAFT': 'DRAFT',
        'PUBLISHED': 'ISSUED', // Map PUBLISHED to ISSUED
        'UNDER_EVALUATION': 'OPEN', // Map UNDER_EVALUATION to OPEN
        'AWARDED': 'AWARDED',
        'CLOSED': 'CLOSED',
        'CANCELLED': 'CANCELED'
      };
  
      const backendStatus = statusMap[newStatus] || newStatus;
  
      const response = await axios.put(
        `${API_BASE_URL}/rfqs/${rfoId}`,
        { 
          status: backendStatus
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
  
      console.log('✅ Status update successful:', response.data);
      fetchData();
      alert(`RFO status updated to ${newStatus}`);
      
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

  // Award contract to vendor
  const awardContract = async (submissionId) => {
    try {
      const token = localStorage.getItem('authToken');
      // Update submission status to AWARDED
      await axios.put(
        `${API_BASE_URL}/submissions/${submissionId}`,
        { status: 'AWARDED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update RFO status to AWARDED
      await updateRFOStatus('AWARDED');
      
      alert('Contract awarded successfully!');
    } catch (error) {
      console.error('Failed to award contract:', error);
      alert('Failed to award contract');
    }
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

  if (!rfo) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">RFO Not Found</h2>
              <p className="text-gray-600 mb-4">The requested RFO could not be found.</p>
              <Link 
                href="/dashboard/procurement/rfos"
                className="text-blue-600 hover:text-blue-800"
              >
                Back to RFOs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(rfo.status);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/dashboard/procurement/rfos"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to RFOs
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">{rfo.title}</h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                    <statusConfig.icon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-gray-600">RFO Number: {rfo.rfqNumber} • Project: {rfo.projectName}</p>
              </div>
              
              <div className="flex space-x-2">
                    {rfo.status === 'DRAFT' && (
                        <button 
                        onClick={() => updateRFOStatus('PUBLISHED')} // This will map to 'ISSUED'
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                        <Send className="w-4 h-4 mr-2" />
                        Publish RFO
                        </button>
                    )}
                    {rfo.status === 'ISSUED' && (
                        <button 
                        onClick={() => updateRFOStatus('UNDER_EVALUATION')} // This will map to 'OPEN'
                        className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Start Evaluation
                        </button>
                    )}
                 <Link
                    href={`/dashboard/procurement/rfos/${rfoId}/edit`}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                </Link>
                </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Submissions</span>
                <FileText className="text-blue-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{submissions.length}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Budget</span>
                <DollarSign className="text-green-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">
                {rfo.estimatedUnitPrice ? `$${rfo.estimatedUnitPrice.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Due Date</span>
                <Calendar className="text-orange-500 w-5 h-5" />
              </div>
              <p className="text-lg font-bold">
                {rfo.dueDate ? new Date(rfo.dueDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">CSI Code</span>
                <Package className="text-purple-500 w-5 h-5" />
              </div>
              <p className="text-lg font-bold">{rfo.csiCode || 'N/A'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'submissions', label: `Vendor Submissions (${submissions.length})`, icon: Users },
                  { id: 'evaluation', label: 'Evaluation', icon: BarChart3 },
                  { id: 'documents', label: 'Documents', icon: Download }
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
              {activeTab === 'overview' && <OverviewTab rfo={rfo} />}
              {activeTab === 'submissions' && (
                <SubmissionsTab 
                  submissions={submissions}
                  onEvaluate={openEvaluationModal}
                  onAwardContract={awardContract}
                  rfoStatus={rfo.status}
                />
              )}
              {activeTab === 'evaluation' && <EvaluationTab rfo={rfo} submissions={submissions} />}
              {activeTab === 'documents' && <DocumentsTab rfo={rfo} />}
            </div>
          </div>

          {/* Evaluation Modal */}
          <VendorEvaluationModal
            submission={evaluationModal.submission}
            isOpen={evaluationModal.isOpen}
            onClose={() => setEvaluationModal({ isOpen: false, submission: null })}
            onEvaluate={handleVendorEvaluation}
          />
        </main>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ rfo }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-3">
          <DetailItem label="RFO Number" value={rfo.rfqNumber} />
          <DetailItem label="Project" value={rfo.projectName} />
          <DetailItem label="CSI Code" value={rfo.csiCode} />
          <DetailItem label="Currency" value={rfo.currency} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <div className="space-y-3">
          <DetailItem 
            label="Required Date" 
            value={rfo.requiredDate ? new Date(rfo.requiredDate).toLocaleDateString() : 'N/A'} 
            icon={Calendar}
          />
          <DetailItem 
            label="Target Submission" 
            value={rfo.targetSubmissionDate ? new Date(rfo.targetSubmissionDate).toLocaleDateString() : 'N/A'} 
            icon={Calendar}
          />
          <DetailItem 
            label="Due Date" 
            value={rfo.dueDate ? new Date(rfo.dueDate).toLocaleDateString() : 'N/A'} 
            icon={Calendar}
          />
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Description & Scope</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Description</h4>
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
            {rfo.description || 'No description provided.'}
          </p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Package Scope</h4>
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
            {rfo.packageScope || 'No scope details provided.'}
          </p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Item Description</h4>
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
            {rfo.itemDesc || 'No item description provided.'}
          </p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Budget Information</h3>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-800">
            Estimated Budget: {rfo.estimatedUnitPrice ? `$${rfo.estimatedUnitPrice.toLocaleString()}` : 'Not specified'}
          </span>
          <DollarSign className="text-blue-600 w-8 h-8" />
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Submissions Tab with Real Data
const SubmissionsTab = ({ submissions, onEvaluate, onAwardContract, rfoStatus }) => {
    const getStatusColor = (status) => {
      const colors = {
        SUBMITTED: 'bg-blue-100 text-blue-800',
        UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
        RECOMMENDED: 'bg-green-100 text-green-800',
        AWARDED: 'bg-purple-100 text-purple-800',
        REJECTED: 'bg-red-100 text-red-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };
  
    const getLatestEvaluation = (submission) => {
      return submission.evaluations?.[0] || null;
    };
  
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Vendor Submissions ({submissions.length})</h3>
          {rfoStatus === 'AWARDED' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Contract Awarded
            </span>
          )}
        </div>
  
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No vendor submissions yet.</p>
            <p className="text-sm">Vendors can submit proposals once the RFO is published.</p>
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
                        Vendor ID: {submission.vendor?.vendorId} • 
                        Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <DetailItem label="Proposed Amount" value={`$${submission.proposedAmount?.toLocaleString() || 'N/A'}`} />
                    <DetailItem label="Delivery Time" value={submission.deliveryTime ? `${submission.deliveryTime} days` : 'N/A'} />
                    <DetailItem label="Payment Terms" value={submission.paymentTerms || 'N/A'} />
                    <DetailItem 
                      label="Score" 
                      value={evaluation ? `${evaluation.overallScore}/5` : 'Not evaluated'} 
                    />
                  </div>
  
                  {evaluation && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">Latest Evaluation</span>
                        <span className="text-xs text-gray-500">
                          by {evaluation.reviewedBy?.name} on {new Date(evaluation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {evaluation.notes || 'No evaluation notes.'}
                      </p>
                    </div>
                  )}
  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                        <FileText className="w-4 h-4 mr-1" />
                        View Proposal
                      </button>
                      <button className="flex items-center text-gray-600 hover:text-gray-800 text-sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      {submission.status !== 'AWARDED' && (
                        <>
                          <button 
                            onClick={() => onEvaluate(submission)}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Evaluate
                          </button>
                          {evaluation?.recommendation === 'APPROVE' && (
                            <button 
                              onClick={() => onAwardContract(submission.id)}
                              className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              <Award className="w-4 h-4 mr-1" />
                              Award
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
  

// Evaluation Tab Component
const EvaluationTab = ({ rfo }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Evaluation Criteria & Scoring</h3>
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <BarChart3 className="w-5 h-5 text-yellow-600 mr-2" />
        <p className="text-yellow-800">Evaluation in progress. {rfo.submissions?.length || 0} submissions to review.</p>
      </div>
    </div>

    {/* Evaluation criteria would go here */}
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

// Documents Tab Component
const DocumentsTab = ({ rfo }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Related Documents</h3>
    <div className="space-y-3">
      <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-blue-500 mr-3" />
          <div>
            <p className="font-medium">RFO Specification Document</p>
            <p className="text-sm text-gray-500">PDF • 2.3 MB</p>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-800">
          <Download className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-green-500 mr-3" />
          <div>
            <p className="font-medium">Technical Requirements</p>
            <p className="text-sm text-gray-500">DOCX • 1.1 MB</p>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-800">
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

// Reusable Detail Item Component
const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {value}
    </span>
  </div>
);

export default RFODetailPage;