// src/app/dashboard/procurement/ipcs/create/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Save, Send, Clock, ArrowLeft, Plus, X, Search, Calculator } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const IPCCreationPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [showContractSearch, setShowContractSearch] = useState(false);
  const [contractSearchTerm, setContractSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);
  const [previousIPCs, setPreviousIPCs] = useState([]);

  const [formData, setFormData] = useState({
    ipcNumber: `IPC-${Date.now()}`,
    contractId: '',
    periodFrom: '',
    periodTo: '',
    currentValue: '',
    deductions: '',
    description: '',
    workDescription: '',
    status: 'SUBMITTED'
  });

  // Fetch contracts for dropdown
  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/contracts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(response.data);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    }
  };

  // Fetch previous IPCs for selected contract
  const fetchPreviousIPCs = async (contractId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/ipcs?contractId=${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviousIPCs(response.data);
    } catch (error) {
      console.error('Failed to fetch previous IPCs:', error);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Filter contracts based on search
  const filteredContracts = contracts.filter(contract =>
    contract.contractNumber?.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
    contract.vendor?.companyLegalName?.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
    contract.rfq?.projectName?.toLowerCase().includes(contractSearchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContractSelect = (contract) => {
    setSelectedContract(contract);
    setFormData(prev => ({
      ...prev,
      contractId: contract.id,
      projectName: contract.rfq?.projectName || 'Standalone Contract'
    }));
    setShowContractSearch(false);
    setContractSearchTerm('');
    fetchPreviousIPCs(contract.id);
  };

  // Calculate cumulative value
  const calculateCumulativeValue = () => {
    const previousTotal = previousIPCs.reduce((sum, ipc) => sum + (ipc.currentValue || 0), 0);
    const currentValue = parseFloat(formData.currentValue) || 0;
    return previousTotal + currentValue;
  };

  // Calculate net payable
  const calculateNetPayable = () => {
    const currentValue = parseFloat(formData.currentValue) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    return currentValue - deductions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));

      // Validate required fields
      if (!formData.contractId) {
        alert('Please select a contract');
        setLoading(false);
        return;
      }

      if (!formData.currentValue) {
        alert('Please enter current value');
        setLoading(false);
        return;
      }

      if (!formData.periodFrom || !formData.periodTo) {
        alert('Please enter period dates');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        submittedById: user.id,
        currentValue: parseFloat(formData.currentValue),
        deductions: parseFloat(formData.deductions) || 0,
        cumulativeValue: calculateCumulativeValue(),
        netPayable: calculateNetPayable(),
        projectName: selectedContract?.rfq?.projectName || 'Standalone Contract',
        periodFrom: formData.periodFrom,
        periodTo: formData.periodTo
      };

      console.log('Creating IPC with payload:', payload);

      const response = await axios.post(`${API_BASE_URL}/ipcs`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('IPC created:', response.data);
      alert('IPC created successfully!');
      router.push('/dashboard/procurement/ipcs');

    } catch (error) {
      console.error('Failed to create IPC:', error);
      alert(`Failed to create IPC: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cumulativeValue = calculateCumulativeValue();
  const netPayable = calculateNetPayable();
  const remainingContractValue = selectedContract ? 
    (selectedContract.contractValue - cumulativeValue) : 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to IPCs
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Create New Interim Payment Certificate</h1>
            <p className="text-gray-600">Fill in the IPC details below</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-6xl">
            {/* Contract Selection Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Contract Selection</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Contract *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowContractSearch(true)}
                    className="w-full p-3 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {selectedContract ? (
                      <div>
                        <div className="font-medium">{selectedContract.contractNumber}</div>
                        <div className="text-sm text-gray-600">
                          Vendor: {selectedContract.vendor?.companyLegalName} • 
                          Project: {selectedContract.rfq?.projectName} • 
                          Value: ${selectedContract.contractValue?.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Select a contract...</span>
                    )}
                  </button>

                  {showContractSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search contracts by number, vendor, or project..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={contractSearchTerm}
                            onChange={(e) => setContractSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredContracts.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">No contracts found</div>
                        ) : (
                          filteredContracts.map((contract) => (
                            <button
                              key={contract.id}
                              type="button"
                              onClick={() => handleContractSelect(contract)}
                              className="w-full p-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{contract.contractNumber}</div>
                              <div className="text-sm text-gray-600">
                                {contract.vendor?.companyLegalName} • {contract.rfq?.projectName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Value: ${contract.contractValue?.toLocaleString()} • 
                                Status: <span className={`px-2 py-1 rounded-full text-xs ${
                                  contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                  contract.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {contract.status}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t">
                        <button
                          type="button"
                          onClick={() => setShowContractSearch(false)}
                          className="w-full p-2 text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4 inline mr-1" />
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contract Summary */}
              {selectedContract && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Contract Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Total Value:</span>
                      <div>${selectedContract.contractValue?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Previous IPCs:</span>
                      <div>${(cumulativeValue - (parseFloat(formData.currentValue) || 0)).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">This IPC:</span>
                      <div>${(parseFloat(formData.currentValue) || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Remaining:</span>
                      <div>${remainingContractValue.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* IPC Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">IPC Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IPC Number *
                  </label>
                  <input
                    type="text"
                    name="ipcNumber"
                    value={formData.ipcNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={selectedContract?.rfq?.projectName || 'Standalone Contract'}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period From *
                  </label>
                  <input
                    type="date"
                    name="periodFrom"
                    value={formData.periodFrom}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period To *
                  </label>
                  <input
                    type="date"
                    name="periodTo"
                    value={formData.periodTo}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IPC Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the work covered in this IPC period..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detailed Work Description
                </label>
                <textarea
                  name="workDescription"
                  value={formData.workDescription}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide detailed description of work completed, milestones achieved, and progress made during this period..."
                />
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Financial Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Value *
                  </label>
                  <input
                    type="number"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deductions
                  </label>
                  <input
                    type="number"
                    name="deductions"
                    value={formData.deductions}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Net Payable
                  </label>
                  <input
                    type="text"
                    value={`$${netPayable.toLocaleString()}`}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 font-semibold"
                    readOnly
                  />
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  Financial Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-gray-600">Contract Total</div>
                    <div className="font-semibold text-lg">${selectedContract?.contractValue?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-gray-600">Previous Total</div>
                    <div className="font-semibold text-lg">${(cumulativeValue - (parseFloat(formData.currentValue) || 0)).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-gray-600">This IPC</div>
                    <div className="font-semibold text-lg text-blue-600">${(parseFloat(formData.currentValue) || 0).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-gray-600">Cumulative</div>
                    <div className="font-semibold text-lg text-green-600">${cumulativeValue.toLocaleString()}</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {selectedContract && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Contract Progress</span>
                      <span>{((cumulativeValue / selectedContract.contractValue) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(cumulativeValue / selectedContract.contractValue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Previous IPCs Section */}
            {previousIPCs.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Previous IPCs for This Contract</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IPC #</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previousIPCs.map((ipc) => (
                        <tr key={ipc.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{ipc.ipcNumber}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {ipc.periodFrom ? new Date(ipc.periodFrom).toLocaleDateString() : 'N/A'} - 
                            {ipc.periodTo ? new Date(ipc.periodTo).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">${ipc.currentValue?.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              ipc.status === 'APPROVED' || ipc.status === 'PAID' ? 'bg-green-100 text-green-800' :
                              ipc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {ipc.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {ipc.createdAt ? new Date(ipc.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !formData.contractId || !formData.currentValue || !formData.periodFrom || !formData.periodTo}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Creating IPC...' : 'Create IPC'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default IPCCreationPage;