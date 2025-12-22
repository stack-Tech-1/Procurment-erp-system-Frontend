"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, FileText, Building, DollarSign, Calendar, 
  CheckCircle, Clock, Truck, User, Package, 
  Edit, Download, Printer, AlertTriangle, XCircle,
  Send, ChevronDown, ChevronUp, MessageSquare,
  History, Search, Filter, Eye, Copy, Mail,
  ThumbsUp, ThumbsDown, BarChart3, TrendingUp,
  CreditCard, Globe, MapPin, Phone, Hash,
  Shield, Award, Plus, Minus, CheckSquare,
  RefreshCw, Database, WifiOff, ExternalLink
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

// Mock API function
const mockAPI = {
  getPurchaseOrder: async (id) => {
    const mockData = {
      1: {
        id: 1,
        poNumber: "PO-2024-00123",
        title: "HVAC System for Tower B",
        projectName: "Tower B Construction",
        supplierName: "Al Redwan Trading",
        supplierContact: "Mohammed Ali",
        supplierEmail: "info@alredwan.com",
        supplierPhone: "+966 11 234 5678",
        status: "ISSUED",
        priority: "HIGH",
        poDate: "2024-01-20",
        deliveryDate: "2024-02-01",
        requiredDate: "2024-02-05",
        currency: "SAR",
        paymentTerms: "30% advance, 70% after delivery",
        incoterms: "CIF Jeddah",
        deliveryAddress: "Tower B Construction Site, Jeddah",
        notes: "Ensure all units are factory tested before shipping",
        totalValue: 1250000,
        subtotal: 1086956.52,
        tax: 163043.48,
        taxRate: 15,
        items: [
          { id: 1, description: "HVAC Unit 10HP", quantity: 2, unit: "PCS", unitPrice: 450000, total: 900000 },
          { id: 2, description: "Ductwork Materials", quantity: 500, unit: "M", unitPrice: 700, total: 350000 }
        ],
        workflowHistory: [
          { date: "2024-01-18", action: "Created from RFQ", user: "Sarah Mohamed", status: "DRAFT" },
          { date: "2024-01-20", action: "Issued to Supplier", user: "Ahmed Zaid", status: "ISSUED" },
          { date: "2024-01-21", action: "Acknowledged by Supplier", user: "Mohammed Ali", status: "ACKNOWLEDGED" }
        ],
        documents: [
          { id: 1, name: "PO_2024_00123.pdf", type: "PDF", size: "2.1 MB", uploaded: "2024-01-20" },
          { id: 2, name: "Technical_Specifications.docx", type: "DOCX", size: "1.5 MB", uploaded: "2024-01-20" }
        ],
        rfqReference: "RFQ-2024-00123",
        prReference: "PR-2024-00123",
        pendingWithDepartment: "Procurement",
        pendingWithPerson: "Sarah Mohamed",
        delayDays: 0,
        comments: [
          { user: "Mohammed Ali", date: "2024-01-21", text: "Acknowledged. Will ship by Jan 30." },
          { user: "Sarah Mohamed", date: "2024-01-22", text: "Please provide shipping tracking number." }
        ]
      },
      2: {
        id: 2,
        poNumber: "PO-2024-00124",
        title: "Steel Beams for Core DQ",
        projectName: "Core DQ Tower",
        supplierName: "SteelTech Industries",
        status: "DELIVERED",
        poDate: "2024-01-15",
        deliveryDate: "2024-01-30",
        totalValue: 890000,
        currency: "SAR"
      }
    };
    return mockData[id] || null;
  }
};

const PurchaseOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const poId = params.id;
  
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [dataSource, setDataSource] = useState('unknown');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (poId) {
      fetchPurchaseOrder();
    }
  }, [poId]);

  const fetchPurchaseOrder = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log('🔄 Fetching PO data from API...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchase-orders/${poId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ Successfully loaded real PO data from API');
            setPurchaseOrder(result.data);
            setDataSource('api');
            return;
          }
        }
      }
      
      // Fallback to mock data
      console.log('⚠️ API unavailable, using mock data');
      const response = await mockAPI.getPurchaseOrder(parseInt(poId));
      setPurchaseOrder(response);
      setDataSource('mock');
      setError('Database temporarily unavailable. Showing sample data.');
      
    } catch (error) {
      console.error('Failed to fetch purchase order:', error);
      setError('Failed to load purchase order data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
      ISSUED: { color: 'bg-blue-100 text-blue-800', label: 'Issued', icon: Send },
      ACKNOWLEDGED: { color: 'bg-yellow-100 text-yellow-800', label: 'Acknowledged', icon: CheckSquare },
      IN_TRANSIT: { color: 'bg-orange-100 text-orange-800', label: 'In Transit', icon: Truck },
      DELIVERED: { color: 'bg-green-100 text-green-800', label: 'Delivered', icon: CheckCircle },
      PARTIALLY_DELIVERED: { color: 'bg-purple-100 text-purple-800', label: 'Partially Delivered', icon: Package },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: XCircle },
      CLOSED: { color: 'bg-indigo-100 text-indigo-800', label: 'Closed', icon: Shield }
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
    if (window.confirm(`Change PO status to ${newStatus}?`)) {
      try {
        const token = localStorage.getItem('authToken');
        if (token && dataSource === 'api') {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchase-orders/${poId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
          });
        }
        
        setPurchaseOrder(prev => ({
          ...prev,
          status: newStatus
        }));
        alert(`PO status updated to ${newStatus}`);
      } catch (error) {
        console.error('Failed to update status:', error);
        alert('Failed to update status');
      }
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        user: "Current User",
        date: new Date().toISOString().split('T')[0],
        text: newComment
      };
      setPurchaseOrder(prev => ({
        ...prev,
        comments: [...(prev.comments || []), comment]
      }));
      setNewComment('');
    }
  };

  const DataSourceIndicator = () => {
    if (dataSource === 'api') {
      return (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
          <Database size={16} />
          Live Data
        </div>
      );
    } else if (dataSource === 'mock') {
      return (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
          <WifiOff size={16} />
          Sample Data (DB Offline)
        </div>
      );
    }
    return null;
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
            {activeTab === 'documents' && 'Documents'}
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
              { id: 'documents', label: 'Documents', icon: FileText },
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

  if (!purchaseOrder) {
    return (
      <ResponsiveLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Purchase Order Not Found</h2>
          <Link 
            href="/dashboard/procurement/purchase-orders"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Purchase Orders
          </Link>
        </div>
      </ResponsiveLayout>
    );
  }

  const statusConfig = getStatusConfig(purchaseOrder.status);
  const priorityConfig = getPriorityConfig(purchaseOrder.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard/procurement/purchase-orders"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Purchase Orders
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 mb-2">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800">{purchaseOrder.title}</h1>
                <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </span>
                  {purchaseOrder.priority && (
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                      {priorityConfig.label}
                    </span>
                  )}
                  <DataSourceIndicator />
                </div>
              </div>
              <p className="text-gray-600">
                {purchaseOrder.poNumber} • {purchaseOrder.projectName} • Created {new Date(purchaseOrder.poDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Status-based actions */}
              {purchaseOrder.status === 'DRAFT' && (
                <>
                  <Link
                    href={`/dashboard/procurement/purchase-orders/${poId}/edit`}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleStatusChange('ISSUED')}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Issue PO
                  </button>
                </>
              )}
              
              {purchaseOrder.status === 'ISSUED' && (
                <button
                  onClick={() => handleStatusChange('ACKNOWLEDGED')}
                  className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <CheckSquare className="w-4 h-4 mr-1" />
                  Mark as Acknowledged
                </button>
              )}
              
              {purchaseOrder.status === 'ACKNOWLEDGED' && (
                <button
                  onClick={() => handleStatusChange('IN_TRANSIT')}
                  className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                >
                  <Truck className="w-4 h-4 mr-1" />
                  Mark as In Transit
                </button>
              )}
              
              {purchaseOrder.status === 'IN_TRANSIT' && (
                <button
                  onClick={() => handleStatusChange('DELIVERED')}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark as Delivered
                </button>
              )}
              
              {/* Create Invoice button - SHOW THIS WHEN STATUS IS DELIVERED */}
              {purchaseOrder.status === 'DELIVERED' && (
                <Link 
                  href={`/dashboard/procurement/invoices/create?poId=${poId}`}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create Invoice
                </Link>
              )}
              
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                <Printer className="w-4 h-4 mr-1" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Data Status Alert */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-600" size={20} />
              <div>
                <p className="text-amber-800 font-medium">{error}</p>
                <p className="text-amber-700 text-sm">
                  {dataSource === 'mock' ? 'Real-time data will resume when database connection is restored.' : ''}
                </p>
              </div>
              <button
                onClick={fetchPurchaseOrder}
                className="ml-auto px-3 py-1 bg-amber-100 text-amber-800 rounded text-sm hover:bg-amber-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-xl font-bold text-green-700">
              {purchaseOrder.totalValue?.toLocaleString()} {purchaseOrder.currency}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">PO Date</p>
            <p className="text-lg font-bold text-blue-700">
              {new Date(purchaseOrder.poDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Delivery Date</p>
            <p className="text-lg font-bold text-orange-700">
              {purchaseOrder.deliveryDate ? new Date(purchaseOrder.deliveryDate).toLocaleDateString() : 'Not set'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Supplier</p>
            <p className="text-lg font-bold text-gray-800 truncate">{purchaseOrder.supplierName}</p>
          </div>
        </div>

        {/* Related References */}
        {(purchaseOrder.rfqReference || purchaseOrder.prReference) && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Related References</h3>
            <div className="flex flex-wrap gap-2">
              {purchaseOrder.rfqReference && (
                <Link 
                  href={`/dashboard/procurement/rfos/${purchaseOrder.rfqReference?.split('-').pop()}`}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  RFQ: {purchaseOrder.rfqReference}
                </Link>
              )}
              {purchaseOrder.prReference && (
                <Link 
                  href={`/dashboard/procurement/purchase-requests/${purchaseOrder.prReference?.split('-').pop()}`}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  PR: {purchaseOrder.prReference}
                </Link>
              )}
            </div>
          </div>
        )}

        <MobileTabNavigation />

        {/* Desktop Tabs */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'items', label: 'Items', icon: Package },
                { id: 'documents', label: 'Documents', icon: FileText },
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
              <OverviewTab purchaseOrder={purchaseOrder} />
            )}
            {activeTab === 'items' && (
              <ItemsTab items={purchaseOrder.items} currency={purchaseOrder.currency} />
            )}
            {activeTab === 'documents' && (
              <DocumentsTab documents={purchaseOrder.documents} />
            )}
            {activeTab === 'workflow' && (
              <WorkflowTab history={purchaseOrder.workflowHistory} />
            )}
            {activeTab === 'comments' && (
              <CommentsTab 
                comments={purchaseOrder.comments} 
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
            <OverviewTab purchaseOrder={purchaseOrder} />
          )}
          {activeTab === 'items' && (
            <ItemsTab items={purchaseOrder.items} currency={purchaseOrder.currency} />
          )}
          {activeTab === 'documents' && (
            <DocumentsTab documents={purchaseOrder.documents} />
          )}
          {activeTab === 'workflow' && (
            <WorkflowTab history={purchaseOrder.workflowHistory} />
          )}
          {activeTab === 'comments' && (
            <CommentsTab 
              comments={purchaseOrder.comments} 
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

// Tab Components
const OverviewTab = ({ purchaseOrder }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Purchase Order Information</h3>
        <div className="space-y-3">
          <DetailItem label="PO Number" value={purchaseOrder.poNumber} icon={Hash} />
          <DetailItem label="Project" value={purchaseOrder.projectName} icon={Building} />
          <DetailItem label="Supplier" value={purchaseOrder.supplierName} icon={User} />
          <DetailItem label="Supplier Contact" value={purchaseOrder.supplierContact} icon={Phone} />
          <DetailItem label="PO Date" value={new Date(purchaseOrder.poDate).toLocaleDateString()} icon={Calendar} />
          <DetailItem label="Delivery Date" value={new Date(purchaseOrder.deliveryDate).toLocaleDateString()} icon={Calendar} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Commercial Details</h3>
        <div className="space-y-3">
          <DetailItem label="Currency" value={purchaseOrder.currency} icon={DollarSign} />
          <DetailItem label="Payment Terms" value={purchaseOrder.paymentTerms} icon={CreditCard} />
          <DetailItem label="Incoterms" value={purchaseOrder.incoterms} icon={Globe} />
          <DetailItem label="Delivery Address" value={purchaseOrder.deliveryAddress} icon={MapPin} />
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Notes & Instructions</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700">{purchaseOrder.notes || 'No notes provided.'}</p>
      </div>
    </div>

    {purchaseOrder.pendingWithPerson && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <p className="font-medium text-yellow-800">Pending Action</p>
            <p className="text-sm text-yellow-700">
              Currently with {purchaseOrder.pendingWithPerson} in {purchaseOrder.pendingWithDepartment}
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);

const ItemsTab = ({ items, currency }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">PO Items ({items?.length || 0})</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price ({currency})</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total ({currency})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items?.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.unitPrice?.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.total?.toLocaleString()}</td>
            </tr>
          ))}
          {items && items.length > 0 && (
            <>
              <tr className="bg-gray-50">
                <td colSpan="4" className="px-4 py-3 text-sm font-bold text-right">Subtotal:</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  {items.reduce((sum, item) => sum + (item.total || 0), 0).toLocaleString()} {currency}
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td colSpan="4" className="px-4 py-3 text-sm font-bold text-right">Tax (15%):</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  {(items.reduce((sum, item) => sum + (item.total || 0), 0) * 0.15).toLocaleString()} {currency}
                </td>
              </tr>
              <tr className="bg-gray-50 border-t border-gray-300">
                <td colSpan="4" className="px-4 py-3 text-lg font-bold text-right">Total:</td>
                <td className="px-4 py-3 text-lg font-bold text-green-700">
                  {(items.reduce((sum, item) => sum + (item.total || 0), 0) * 1.15).toLocaleString()} {currency}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const DocumentsTab = ({ documents }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Documents ({documents?.length || 0})</h3>
    {documents?.length > 0 ? (
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-gray-500">{doc.type} • {doc.size} • Uploaded {doc.uploaded}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>No documents attached to this PO.</p>
      </div>
    )}
  </div>
);

const WorkflowTab = ({ history }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">PO Workflow History</h3>
    <div className="space-y-4">
      {history?.map((step, index) => (
        <div key={index} className="flex items-start">
          <div className="flex flex-col items-center mr-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.action.includes('Created') ? 'bg-gray-100' :
              step.action.includes('Issued') ? 'bg-blue-100' :
              step.action.includes('Acknowledged') ? 'bg-yellow-100' :
              step.status === 'DELIVERED' ? 'bg-green-100' :
              step.status === 'CANCELLED' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {step.action.includes('Created') && <FileText className="w-4 h-4 text-gray-600" />}
              {step.action.includes('Issued') && <Send className="w-4 h-4 text-blue-600" />}
              {step.action.includes('Acknowledged') && <CheckSquare className="w-4 h-4 text-yellow-600" />}
              {step.status === 'DELIVERED' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {step.status === 'CANCELLED' && <XCircle className="w-4 h-4 text-red-600" />}
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
                step.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                step.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
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
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-gray-600 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {label}
    </span>
    <span className="font-medium text-gray-900 text-right">
      {value || 'Not provided'}
    </span>
  </div>
);

export default PurchaseOrderDetailPage;