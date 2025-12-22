"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, FileText, Building, User, Calendar, DollarSign,
  AlertTriangle, CheckCircle, Clock, Send, Edit, Download, Printer,
  ChevronDown, ChevronUp, BarChart3, MessageSquare, History,
  CheckSquare, XSquare, Package, Users, TrendingUp
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

// Mock API function
const mockAPI = {
  getPurchaseRequest: async (id) => {
    const mockData = {
      1: {
        id: 1,
        prNumber: "PR-2024-00123",
        title: "HVAC System for Tower B",
        projectName: "Tower B Construction",
        requesterName: "Ahmed Zaid",
        department: "Technical Office",
        status: "SUBMITTED",
        priority: "HIGH",
        requiredDate: "2024-02-15",
        estimatedAmount: 1250000,
        createdAt: "2024-01-10",
        justification: "Required for Phase 2 completion. Current system outdated and inefficient.",
        pendingWithDepartment: "Procurement",
        pendingWithPerson: "Mohammed Ali",
        delayDays: 0,
        items: [
          { id: 1, description: "HVAC Unit 10HP", quantity: 2, unit: "PCS", estimatedPrice: 450000, total: 900000 },
          { id: 2, description: "Ductwork Materials", quantity: 500, unit: "M", estimatedPrice: 700, total: 350000 }
        ],
        workflowHistory: [
          { date: "2024-01-10", action: "Created", user: "Ahmed Zaid", status: "DRAFT" },
          { date: "2024-01-11", action: "Submitted", user: "Ahmed Zaid", status: "SUBMITTED" },
          { date: "2024-01-12", action: "Assigned for Review", user: "System", status: "UNDER_PROCUREMENT_REVIEW" }
        ],
        comments: [
          { user: "Mohammed Ali", date: "2024-01-12", text: "Need technical specifications for HVAC unit." },
          { user: "Ahmed Zaid", date: "2024-01-12", text: "Technical specs uploaded in attachments." }
        ]
      }
    };
    return mockData[id] || null;
  }
};

const PurchaseRequestDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const prId = params.id;
  
  const [purchaseRequest, setPurchaseRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (prId) {
      fetchPurchaseRequest();
    }
  }, [prId]);

  const fetchPurchaseRequest = async () => {
    setLoading(true);
    try {
      const response = await mockAPI.getPurchaseRequest(parseInt(prId));
      setPurchaseRequest(response);
    } catch (error) {
      console.error('Failed to fetch purchase request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', label: 'Submitted', icon: Clock },
      UNDER_PROCUREMENT_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'Procurement Review', icon: AlertTriangle },
      UNDER_TECHNICAL_REVIEW: { color: 'bg-orange-100 text-orange-800', label: 'Technical Review', icon: AlertTriangle },
      APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XSquare }
    };
    return configs[status] || configs.DRAFT;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      LOW: { color: 'bg-green-100 text-green-800', label: 'Low' },
      MEDIUM: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      HIGH: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      URGENT: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
    };
    return configs[priority] || configs.MEDIUM;
  };

  const handleStatusChange = async (newStatus) => {
    if (window.confirm(`Change status to ${newStatus}?`)) {
      console.log('Updating status to:', newStatus);
      // In real app, call API here
      fetchPurchaseRequest(); // Refresh data
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        user: "Current User",
        date: new Date().toISOString().split('T')[0],
        text: newComment
      };
      setPurchaseRequest(prev => ({
        ...prev,
        comments: [...(prev.comments || []), comment]
      }));
      setNewComment('');
    }
  };

  const MobileTabNavigation = () => (
    <div className="lg:hidden mb-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex justify-between items-center p-4 text-left"
        >
          <span className="font-semibold text-gray-800">
            {activeTab === 'overview' && 'Overview'}
            {activeTab === 'items' && 'Items'}
            {activeTab === 'workflow' && 'Workflow'}
            {activeTab === 'comments' && 'Comments'}
          </span>
          {mobileMenuOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {mobileMenuOpen && (
          <div className="border-t border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'items', label: 'Items', icon: Package },
              { id: 'workflow', label: 'Workflow', icon: History },
              { id: 'comments', label: 'Comments', icon: MessageSquare }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
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
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!purchaseRequest) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Purchase Request Not Found</h2>
          <Link 
            href="/dashboard/procurement/purchase-requests"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Purchase Requests
          </Link>
        </div>
      </ResponsiveLayout>
    );
  }

  const statusConfig = getStatusConfig(purchaseRequest.status);
  const priorityConfig = getPriorityConfig(purchaseRequest.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard/procurement/purchase-requests"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Purchase Requests
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mb-2">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">{purchaseRequest.title}</h1>
                <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </span>
                </div>
              </div>
              <p className="text-gray-600">
                {purchaseRequest.prNumber} • {purchaseRequest.projectName} • Created {new Date(purchaseRequest.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {purchaseRequest.status === 'DRAFT' && (
                <>
                  <Link
                    href={`/dashboard/procurement/purchase-requests/${prId}/edit`}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleStatusChange('SUBMITTED')}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Submit for Approval
                  </button>
                </>
              )}
              
              {purchaseRequest.status === 'SUBMITTED' && (
                <button
                  onClick={() => handleStatusChange('UNDER_PROCUREMENT_REVIEW')}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Start Review
                </button>
              )}
              
              {purchaseRequest.status.includes('UNDER_') && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange('APPROVED')}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange('REJECTED')}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    <XSquare className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </div>
              )}
              
              {purchaseRequest.status === 'APPROVED' && (
                <Link
                  href={`/dashboard/procurement/rfq/create?prId=${prId}`}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Create RFQ
                </Link>
              )}
              
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Estimated Amount</p>
            <p className="text-xl font-bold text-green-700">
              {purchaseRequest.estimatedAmount?.toLocaleString()} SAR
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Required Date</p>
            <p className="text-lg font-bold text-blue-700">
              {new Date(purchaseRequest.requiredDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Requester</p>
            <p className="text-lg font-bold text-gray-800">{purchaseRequest.requesterName}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Department</p>
            <p className="text-lg font-bold text-gray-800">{purchaseRequest.department}</p>
          </div>
        </div>

        <MobileTabNavigation />

        {/* Desktop Tabs */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'items', label: 'Items', icon: Package },
                { id: 'workflow', label: 'Workflow', icon: History },
                { id: 'comments', label: 'Comments', icon: MessageSquare }
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
            {activeTab === 'overview' && (
              <OverviewTab purchaseRequest={purchaseRequest} />
            )}
            {activeTab === 'items' && (
              <ItemsTab items={purchaseRequest.items} />
            )}
            {activeTab === 'workflow' && (
              <WorkflowTab history={purchaseRequest.workflowHistory} />
            )}
            {activeTab === 'comments' && (
              <CommentsTab 
                comments={purchaseRequest.comments} 
                newComment={newComment}
                onCommentChange={setNewComment}
                onAddComment={handleAddComment}
              />
            )}
          </div>
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab purchaseRequest={purchaseRequest} />
          )}
          {activeTab === 'items' && (
            <ItemsTab items={purchaseRequest.items} />
          )}
          {activeTab === 'workflow' && (
            <WorkflowTab history={purchaseRequest.workflowHistory} />
          )}
          {activeTab === 'comments' && (
            <CommentsTab 
              comments={purchaseRequest.comments} 
              newComment={newComment}
              onCommentChange={setNewComment}
              onAddComment={handleAddComment}
            />
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

const OverviewTab = ({ purchaseRequest }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DetailItem label="PR Number" value={purchaseRequest.prNumber} />
        <DetailItem label="Project" value={purchaseRequest.projectName} icon={Building} />
        <DetailItem label="Requester" value={purchaseRequest.requesterName} icon={User} />
        <DetailItem label="Department" value={purchaseRequest.department} />
        <DetailItem label="Required Date" value={new Date(purchaseRequest.requiredDate).toLocaleDateString()} icon={Calendar} />
        <DetailItem label="Estimated Amount" value={`${purchaseRequest.estimatedAmount?.toLocaleString()} SAR`} icon={DollarSign} />
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Justification</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700">{purchaseRequest.justification}</p>
      </div>
    </div>

    {purchaseRequest.pendingWithPerson && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <p className="font-medium text-yellow-800">Pending Review</p>
            <p className="text-sm text-yellow-700">
              Currently with {purchaseRequest.pendingWithPerson} in {purchaseRequest.pendingWithDepartment}
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);

const ItemsTab = ({ items }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Items ({items.length})</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price (SAR)</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total (SAR)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={item.id || index}>
              <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.estimatedPrice?.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.total?.toLocaleString()}</td>
            </tr>
          ))}
          <tr className="bg-gray-50">
            <td colSpan="4" className="px-4 py-3 text-sm font-bold text-right">Total Amount:</td>
            <td className="px-4 py-3 text-sm font-bold text-green-700">
              {items.reduce((sum, item) => sum + (item.total || 0), 0).toLocaleString()} SAR
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const WorkflowTab = ({ history }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Workflow History</h3>
    <div className="space-y-4">
      {history?.map((step, index) => (
        <div key={index} className="flex items-start">
          <div className="flex flex-col items-center mr-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.action === 'Created' ? 'bg-gray-100' :
              step.action === 'Submitted' ? 'bg-blue-100' :
              step.action.includes('Review') ? 'bg-yellow-100' :
              step.status === 'APPROVED' ? 'bg-green-100' :
              step.status === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {step.action === 'Created' && <FileText className="w-4 h-4 text-gray-600" />}
              {step.action === 'Submitted' && <Send className="w-4 h-4 text-blue-600" />}
              {step.action.includes('Review') && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
              {step.status === 'APPROVED' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {step.status === 'REJECTED' && <XSquare className="w-4 h-4 text-red-600" />}
            </div>
            {index < history.length - 1 && (
              <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <p className="font-medium">{step.action}</p>
              <p className="text-sm text-gray-500">{step.date}</p>
            </div>
            <p className="text-sm text-gray-600">by {step.user}</p>
            {step.status && (
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                step.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                step.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                step.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {step.status.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CommentsTab = ({ comments, newComment, onCommentChange, onAddComment }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Comments ({comments?.length || 0})</h3>
    
    <div className="space-y-4 mb-6">
      {comments?.length > 0 ? (
        comments.map((comment, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium">{comment.user}</p>
              <p className="text-sm text-gray-500">{comment.date}</p>
            </div>
            <p className="text-gray-700">{comment.text}</p>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>No comments yet</p>
        </div>
      )}
    </div>

    <div className="border-t border-gray-200 pt-6">
      <h4 className="font-medium mb-3">Add Comment</h4>
      <textarea
        value={newComment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Type your comment here..."
        rows="3"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-3"
      />
      <button
        onClick={onAddComment}
        disabled={!newComment.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add Comment
      </button>
    </div>
  </div>
);

const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900 flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {value}
      </span>
    </div>
  );
  
  export default PurchaseRequestDetailPage;