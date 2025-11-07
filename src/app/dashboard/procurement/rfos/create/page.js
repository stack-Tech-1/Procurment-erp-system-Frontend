// src/app/dashboard/procurement/rfos/create/page.jsx
"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Save, Send, Clock, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs`;

const CreateRFOPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rfqNumber: `RFO-${Date.now()}`,
    title: '',
    description: '',
    projectName: '',
    packageScope: '',
    itemDesc: '',
    csiCode: '',
    estimatedUnitPrice: '',
    requiredDate: '',
    targetSubmissionDate: '',
    currency: 'USD',
    dueDate: '',
    status: 'DRAFT'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e, status = 'DRAFT') => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user'));

      const payload = {
        ...formData,
        status,
        createdById: user?.id,
        estimatedUnitPrice: formData.estimatedUnitPrice ? parseFloat(formData.estimatedUnitPrice) : null,
        requiredDate: formData.requiredDate || null,
        targetSubmissionDate: formData.targetSubmissionDate || null,
        dueDate: formData.dueDate || null
      };

      const response = await axios.post(API_BASE_URL, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('RFO created:', response.data);
      
      if (status === 'DRAFT') {
        alert('RFO saved as draft successfully!');
      } else {
        alert('RFO published successfully!');
      }
      
      router.push('/dashboard/procurement/rfos');

    } catch (error) {
      console.error('Failed to create RFO:', error);
      alert('Failed to create RFO. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              Back to RFOs
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Create New Request for Offer</h1>
            <p className="text-gray-600">Fill in the details below to create a new RFO</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="max-w-4xl">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RFO Number *
                  </label>
                  <input
                    type="text"
                    name="rfqNumber"
                    value={formData.rfqNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Describe the scope and requirements..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Scope
                </label>
                <textarea
                  name="packageScope"
                  value={formData.packageScope}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Detailed scope of work..."
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Technical Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CSI Code
                  </label>
                  <input
                    type="text"
                    name="csiCode"
                    value={formData.csiCode}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Budget
                  </label>
                  <input
                    type="number"
                    name="estimatedUnitPrice"
                    value={formData.estimatedUnitPrice}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="USD">USD</option>
                    <option value="SAR">SAR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Timeline</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Date
                  </label>
                  <input
                    type="date"
                    name="requiredDate"
                    value={formData.requiredDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Submission Date
                  </label>
                  <input
                    type="date"
                    name="targetSubmissionDate"
                    value={formData.targetSubmissionDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
                onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Publishing...' : 'Publish RFO'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CreateRFOPage;