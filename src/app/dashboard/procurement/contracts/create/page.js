// src/app/dashboard/procurement/contracts/create/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Save, Send, Clock, ArrowLeft, Plus, X, Search } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

const API_BASE_URL = 'http://localhost:4000/api';

const ContractCreationPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [showVendorSearch, setShowVendorSearch] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [showRfqSearch, setShowRfqSearch] = useState(false);
  const [rfqSearchTerm, setRfqSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    contractNumber: `CONTRACT-${Date.now()}`,
    rfqId: '',
    vendorId: '',
    contractValue: '',
    currency: 'SAR',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    description: '',
    contractType: 'FIXED_PRICE',
    paymentTerms: '30_DAYS',
    warrantyPeriod: '12',
    terminationClause: '',
    specialConditions: ''
  });

  // Fetch vendors and RFQs for dropdowns
  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch vendors
      const vendorsResponse = await axios.get(`${API_BASE_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(vendorsResponse.data);

      // Fetch RFQs
      const rfqsResponse = await axios.get(`${API_BASE_URL}/rfqs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRfqs(rfqsResponse.data);

    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Filter vendors based on search
  const filteredVendors = vendors.filter(vendor =>
    vendor.companyLegalName?.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.vendorId?.toLowerCase().includes(vendorSearchTerm.toLowerCase())
  );

  // Filter RFQs based on search
  const filteredRfqs = rfqs.filter(rfq =>
    rfq.rfqNumber?.toLowerCase().includes(rfqSearchTerm.toLowerCase()) ||
    rfq.projectName?.toLowerCase().includes(rfqSearchTerm.toLowerCase()) ||
    rfq.title?.toLowerCase().includes(rfqSearchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVendorSelect = (vendor) => {
    setFormData(prev => ({
      ...prev,
      vendorId: vendor.id,
      vendorName: vendor.companyLegalName
    }));
    setShowVendorSearch(false);
    setVendorSearchTerm('');
  };

  const handleRfqSelect = (rfq) => {
    setFormData(prev => ({
      ...prev,
      rfqId: rfq.id,
      rfqNumber: rfq.rfqNumber,
      projectName: rfq.projectName
    }));
    setShowRfqSearch(false);
    setRfqSearchTerm('');
  };

  const handleSubmit = async (e, status = 'DRAFT') => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));

      // Validate required fields
      if (!formData.vendorId) {
        alert('Please select a vendor');
        setLoading(false);
        return;
      }

      if (!formData.contractValue) {
        alert('Please enter contract value');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        status,
        contractValue: parseFloat(formData.contractValue),
        warrantyPeriod: parseInt(formData.warrantyPeriod) || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      };

      console.log('Creating contract with payload:', payload);

      const response = await axios.post(`${API_BASE_URL}/contracts`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Contract created:', response.data);
      
      if (status === 'DRAFT') {
        alert('Contract saved as draft successfully!');
      } else {
        alert('Contract created and activated successfully!');
      }
      
      router.push('/dashboard/procurement/contracts');

    } catch (error) {
      console.error('Failed to create contract:', error);
      alert(`Failed to create contract: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedVendor = vendors.find(v => v.id === parseInt(formData.vendorId));
  const selectedRfq = rfqs.find(r => r.id === parseInt(formData.rfqId));

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
              Back to Contracts
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Create New Contract</h1>
            <p className="text-gray-600">Fill in the contract details below</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="max-w-6xl">
            {/* Basic Information Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Number *
                  </label>
                  <input
                    type="text"
                    name="contractNumber"
                    value={formData.contractNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Type *
                  </label>
                  <select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="FIXED_PRICE">Fixed Price</option>
                    <option value="TIME_AND_MATERIALS">Time & Materials</option>
                    <option value="MILESTONE_BASED">Milestone Based</option>
                    <option value="COST_PLUS">Cost Plus</option>
                    <option value="UNIT_PRICE">Unit Price</option>
                  </select>
                </div>
              </div>

              {/* Vendor Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVendorSearch(true)}
                    className="w-full p-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {selectedVendor ? (
                      <div>
                        <span className="font-medium">{selectedVendor.companyLegalName}</span>
                        <span className="text-gray-500 text-sm ml-2">({selectedVendor.vendorId})</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Select a vendor...</span>
                    )}
                  </button>

                  {showVendorSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search vendors..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={vendorSearchTerm}
                            onChange={(e) => setVendorSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredVendors.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">No vendors found</div>
                        ) : (
                          filteredVendors.map((vendor) => (
                            <button
                              key={vendor.id}
                              type="button"
                              onClick={() => handleVendorSelect(vendor)}
                              className="w-full p-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{vendor.companyLegalName}</div>
                              <div className="text-sm text-gray-600">ID: {vendor.vendorId} • Type: {vendor.vendorType}</div>
                              <div className="text-sm text-gray-500">{vendor.contactEmail}</div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t">
                        <button
                          type="button"
                          onClick={() => setShowVendorSearch(false)}
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

              {/* RFQ Selection (Optional) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related RFQ (Optional)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRfqSearch(true)}
                    className="w-full p-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {selectedRfq ? (
                      <div>
                        <span className="font-medium">{selectedRfq.rfqNumber}</span>
                        <span className="text-gray-500 text-sm ml-2">- {selectedRfq.projectName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Select an RFQ (optional)...</span>
                    )}
                  </button>

                  {showRfqSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search RFQs..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={rfqSearchTerm}
                            onChange={(e) => setRfqSearchTerm(e.target.value)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredRfqs.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">No RFQs found</div>
                        ) : (
                          filteredRfqs.map((rfq) => (
                            <button
                              key={rfq.id}
                              type="button"
                              onClick={() => handleRfqSelect(rfq)}
                              className="w-full p-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{rfq.rfqNumber}</div>
                              <div className="text-sm text-gray-600">{rfq.projectName}</div>
                              <div className="text-sm text-gray-500">{rfq.title}</div>
                            </button>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t">
                        <button
                          type="button"
                          onClick={() => setShowRfqSearch(false)}
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the scope of work and contract purpose..."
                />
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Financial Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Value *
                  </label>
                  <input
                    type="number"
                    name="contractValue"
                    value={formData.contractValue}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="SAR">SAR (Saudi Riyal)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms *
                  </label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="15_DAYS">15 Days</option>
                    <option value="30_DAYS">30 Days</option>
                    <option value="45_DAYS">45 Days</option>
                    <option value="60_DAYS">60 Days</option>
                    <option value="ADVANCE_PAYMENT">Advance Payment</option>
                    <option value="MILESTONE_PAYMENT">Milestone Payment</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Timeline</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warranty Period (Months)
                  </label>
                  <input
                    type="number"
                    name="warrantyPeriod"
                    value={formData.warrantyPeriod}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">Terms & Conditions</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Termination Clause
                  </label>
                  <textarea
                    name="terminationClause"
                    value={formData.terminationClause}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Specify conditions for contract termination..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Conditions
                  </label>
                  <textarea
                    name="specialConditions"
                    value={formData.specialConditions}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special conditions or additional terms..."
                  />
                </div>
              </div>
            </div>

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
                type="button"
                onClick={(e) => handleSubmit(e, 'DRAFT')}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'ACTIVE')}
                disabled={loading || !formData.vendorId || !formData.contractValue}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create & Activate Contract'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ContractCreationPage;