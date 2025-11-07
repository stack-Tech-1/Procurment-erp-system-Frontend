// src/app/dashboard/procurement/contracts/[id]/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, DollarSign, FileText, CheckCircle, 
  Clock, XCircle, AlertTriangle, Edit, Download, Plus,
  User, Building, BarChart3, Receipt, TrendingUp, MapPin,
  Mail, Phone, Hash, Clock4
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;


const ContractDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const contractId = params.id;

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [ipcForm, setIpcForm] = useState({
    ipcNumber: `IPC-${Date.now()}`,
    periodFrom: '',
    periodTo: '',
    currentValue: '',
    deductions: '',
    description: ''
  });

  // Fetch contract details
  const fetchContractDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContract(response.data);
    } catch (error) {
      console.error('Failed to fetch contract details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      fetchContractDetails();
    }
  }, [contractId]);

  // Status configuration
  const getStatusConfig = (status) => {
    const statusConfigs = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: Clock },
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      EXPIRED: { color: 'bg-red-100 text-red-800', label: 'Expired', icon: XCircle },
      CLOSED: { color: 'bg-purple-100 text-purple-800', label: 'Closed', icon: CheckCircle },
      TERMINATED: { color: 'bg-red-100 text-red-800', label: 'Terminated', icon: XCircle }
    };
    return statusConfigs[status] || statusConfigs.DRAFT;
  };

  // Update contract status
  const updateContractStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${API_BASE_URL}/contracts/${contractId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContractDetails();
      alert(`Contract status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update contract status');
    }
  };

  // Create new IPC
  const createIPC = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));

      const payload = {
        ...ipcForm,
        contractId: parseInt(contractId),
        submittedById: user.id,
        currentValue: parseFloat(ipcForm.currentValue),
        deductions: parseFloat(ipcForm.deductions) || 0,
        cumulativeValue: contract.ipcs.reduce((sum, ipc) => sum + ipc.currentValue, 0) + parseFloat(ipcForm.currentValue)
      };

      await axios.post(`${API_BASE_URL}/ipcs`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('IPC created successfully!');
      setIpcForm({
        ipcNumber: `IPC-${Date.now()}`,
        periodFrom: '',
        periodTo: '',
        currentValue: '',
        deductions: '',
        description: ''
      });
      fetchContractDetails();
    } catch (error) {
      console.error('Failed to create IPC:', error);
      alert('Failed to create IPC');
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

  if (!contract) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Contract Not Found</h2>
              <p className="text-gray-600 mb-4">The requested contract could not be found.</p>
              <Link 
                href="/dashboard/procurement/contracts"
                className="text-blue-600 hover:text-blue-800"
              >
                Back to Contracts
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(contract.status);
  const totalPaid = contract.ipcs?.reduce((sum, ipc) => sum + (ipc.currentValue || 0), 0) || 0;
  const remainingValue = contract.contractValue - totalPaid;
  const completionPercentage = (totalPaid / contract.contractValue) * 100;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/dashboard/procurement/contracts"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contracts
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">{contract.contractNumber}</h1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                    <statusConfig.icon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-gray-600">
                  {contract.rfq?.projectName || 'Standalone Contract'} • 
                  Vendor: {contract.vendor?.companyLegalName}
                </p>
              </div>
              
              <div className="flex space-x-2">
                {contract.status === 'DRAFT' && (
                  <button 
                    onClick={() => updateContractStatus('ACTIVE')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate Contract
                  </button>
                )}
                <Link
                  href={`/dashboard/procurement/contracts/${contractId}/edit`}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
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
                <span className="text-gray-600 text-sm">Contract Value</span>
                <DollarSign className="text-green-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">${contract.contractValue?.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Paid</span>
                <Receipt className="text-blue-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">${totalPaid.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Remaining</span>
                <TrendingUp className="text-orange-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">${remainingValue.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Progress</span>
                <BarChart3 className="text-purple-500 w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{completionPercentage.toFixed(1)}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Payment Progress</span>
              <span>{completionPercentage.toFixed(1)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Paid: ${totalPaid.toLocaleString()}</span>
              <span>Remaining: ${remainingValue.toLocaleString()}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'ipcs', label: `IPCs (${contract.ipcs?.length || 0})`, icon: Receipt },
                  { id: 'variations', label: `Variations (${contract.variationOrders?.length || 0})`, icon: TrendingUp },
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

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && <OverviewTab contract={contract} />}
              {activeTab === 'ipcs' && (
                <IPCSTab 
                  ipcs={contract.ipcs || []} 
                  onNewIPC={createIPC}
                  ipcForm={ipcForm}
                  setIpcForm={setIpcForm}
                />
              )}
              {activeTab === 'variations' && <VariationsTab variations={contract.variationOrders || []} />}
              {activeTab === 'documents' && <DocumentsTab documents={contract.documents || []} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ contract }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Contract Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contract Details</h3>
        <div className="space-y-3">
          <DetailItem label="Contract Number" value={contract.contractNumber} icon={Hash} />
          <DetailItem label="Contract Value" value={`$${contract.contractValue?.toLocaleString()}`} icon={DollarSign} />
          <DetailItem label="Currency" value={contract.currency} />
          <DetailItem label="Contract Type" value={contract.contractType || 'Fixed Price'} />
          <DetailItem label="Payment Terms" value={contract.paymentTerms || '30 days'} />
          <DetailItem label="Warranty Period" value={contract.warrantyPeriod ? `${contract.warrantyPeriod} months` : 'N/A'} />
        </div>
      </div>
      
      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <div className="space-y-3">
          <DetailItem 
            label="Start Date" 
            value={contract.startDate ? new Date(contract.startDate).toLocaleDateString() : 'N/A'} 
            icon={Calendar}
          />
          <DetailItem 
            label="End Date" 
            value={contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A'} 
            icon={Calendar}
          />
          <DetailItem 
            label="Duration" 
            value={contract.startDate && contract.endDate ? 
              `${Math.ceil((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24))} days` : 
              'N/A'
            } 
            icon={Clock4}
          />
          <DetailItem 
            label="Days Remaining" 
            value={contract.endDate && contract.status === 'ACTIVE' ? 
              `${Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days` : 
              'N/A'
            } 
            icon={AlertTriangle}
          />
        </div>
      </div>
    </div>

    {/* Vendor Information */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-800">{contract.vendor?.companyLegalName}</h4>
            <p className="text-sm text-gray-600">Vendor ID: {contract.vendor?.vendorId}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span>{contract.vendor?.contactEmail}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{contract.vendor?.contactPhone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Project Information */}
    {contract.rfq && (
      <div>
        <h3 className="text-lg font-semibold mb-4">Project Information</h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-blue-800">{contract.rfq.projectName}</h4>
              <p className="text-sm text-blue-600">RFQ: {contract.rfq.rfqNumber}</p>
            </div>
            <Building className="w-8 h-8 text-blue-500" />
          </div>
          {contract.rfq.description && (
            <p className="text-sm text-blue-700 mt-2">{contract.rfq.description}</p>
          )}
        </div>
      </div>
    )}

    {/* Contract Description */}
    {contract.description && (
      <div>
        <h3 className="text-lg font-semibold mb-4">Contract Description</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">{contract.description}</p>
        </div>
      </div>
    )}
  </div>
);

// IPCs Tab Component
const IPCSTab = ({ ipcs, onNewIPC, ipcForm, setIpcForm }) => {
  const getIPCStatusConfig = (status) => {
    const statusConfigs = {
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      PROCUREMENT_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review' },
      TECHNICAL_APPROVED: { color: 'bg-green-100 text-green-800', label: 'Technical Approved' },
      FINANCE_REVIEW: { color: 'bg-purple-100 text-purple-800', label: 'Finance Review' },
      APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    return statusConfigs[status] || statusConfigs.SUBMITTED;
  };

  return (
    <div className="space-y-6">
      {/* New IPC Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Create New IPC</h3>
        <form onSubmit={onNewIPC} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IPC Number</label>
            <input
              type="text"
              value={ipcForm.ipcNumber}
              onChange={(e) => setIpcForm(prev => ({ ...prev, ipcNumber: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period From</label>
            <input
              type="date"
              value={ipcForm.periodFrom}
              onChange={(e) => setIpcForm(prev => ({ ...prev, periodFrom: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period To</label>
            <input
              type="date"
              value={ipcForm.periodTo}
              onChange={(e) => setIpcForm(prev => ({ ...prev, periodTo: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
            <input
              type="number"
              value={ipcForm.currentValue}
              onChange={(e) => setIpcForm(prev => ({ ...prev, currentValue: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
            <input
              type="number"
              value={ipcForm.deductions}
              onChange={(e) => setIpcForm(prev => ({ ...prev, deductions: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Create IPC
            </button>
          </div>
        </form>
      </div>

      {/* IPCs List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Interim Payment Certificates</h3>
        {ipcs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No IPCs created yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ipcs.map((ipc) => {
              const statusConfig = getIPCStatusConfig(ipc.status);
              const netPayable = (ipc.currentValue || 0) - (ipc.deductions || 0);
              
              return (
                <div key={ipc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{ipc.ipcNumber}</h4>
                      <p className="text-gray-600 text-sm">
                        Period: {ipc.periodFrom ? new Date(ipc.periodFrom).toLocaleDateString() : 'N/A'} - 
                        {ipc.periodTo ? new Date(ipc.periodTo).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <DetailItem label="Current Value" value={`$${ipc.currentValue?.toLocaleString() || '0'}`} />
                    <DetailItem label="Deductions" value={`$${ipc.deductions?.toLocaleString() || '0'}`} />
                    <DetailItem label="Net Payable" value={`$${netPayable.toLocaleString()}`} />
                    <DetailItem label="Cumulative" value={`$${ipc.cumulativeValue?.toLocaleString() || '0'}`} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Submitted by: {ipc.submittedBy?.name} on {ipc.createdAt ? new Date(ipc.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Review
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Variations Tab Component
const VariationsTab = ({ variations }) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Variation Orders</h3>
      <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        New Variation
      </button>
    </div>

    {variations.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>No variation orders yet.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {variations.map((vo) => (
          <div key={vo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-lg">{vo.voRef}</h4>
                <p className="text-gray-600 text-sm">{vo.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                vo.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                vo.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {vo.status || 'PENDING'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailItem label="Cost Impact" value={`$${vo.costImpact?.toLocaleString() || '0'}`} />
              <DetailItem label="Time Impact" value={vo.timeImpact ? `${vo.timeImpact} days` : 'N/A'} />
              <DetailItem label="Created" value={vo.createdAt ? new Date(vo.createdAt).toLocaleDateString() : 'N/A'} />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Documents Tab Component
const DocumentsTab = ({ documents }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Contract Documents</h3>
    
    {documents.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>No documents uploaded yet.</p>
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

// Reusable Detail Item Component
const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-gray-900 flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {value}
    </span>
  </div>
);

export default ContractDetailPage;