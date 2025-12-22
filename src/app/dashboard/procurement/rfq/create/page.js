// frontend/src/app/dashboard/procurement/rfos/create/page.js - MOBILE OPTIMIZED
"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  Save, Send, Clock, ArrowLeft, FileText, 
  Settings, Package, Calendar, DollarSign
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/rfqs`;

const CreateRFOPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
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

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <div className="lg:hidden mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Create RFO</h3>
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'basic', label: 'Basic', icon: FileText },
            { id: 'technical', label: 'Technical', icon: Settings },
            { id: 'timeline', label: 'Timeline', icon: Calendar }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <section.icon className="w-4 h-4 mr-1" />
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Quick Actions for Mobile
  const MobileQuickActions = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
          disabled={loading}
        >
          Cancel
        </button>
        
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'DRAFT')}
          disabled={loading}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Draft'}
        </button>
        
        <button
          type="button"
          onClick={(e) => handleSubmit(e, 'PUBLISHED')}
          disabled={loading}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          <Send className="w-4 h-4 mr-2" />
          {loading ? '...' : 'Publish'}
        </button>
      </div>
    </div>
  );

  return (
    <ResponsiveLayout>
      <div className="max-w-4xl mx-auto w-full pb-20 lg:pb-6"> {/* Extra padding for mobile actions */}
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to RFOs</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Create New RFO</h1>
              <p className="text-gray-600 text-sm sm:text-base">Fill in the details below to create a new Request for Offer</p>
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                disabled={loading}
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'DRAFT')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Publishing...' : 'Publish RFO'}
              </button>
            </div>
          </div>
        </div>

        <MobileNavigation />

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Basic Information - Always visible on desktop, conditionally on mobile */}
          <div className={`${activeSection === 'basic' ? 'block' : 'hidden lg:block'} bg-white rounded-lg border border-gray-200 p-4 sm:p-6`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFO Number *
                </label>
                <input
                  type="text"
                  name="rfqNumber"
                  value={formData.rfqNumber}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the scope and requirements..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Scope
              </label>
              <textarea
                name="packageScope"
                value={formData.packageScope}
                onChange={handleChange}
                rows="2"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed scope of work..."
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className={`${activeSection === 'technical' ? 'block' : 'hidden lg:block'} bg-white rounded-lg border border-gray-200 p-4 sm:p-6`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-green-600" />
              Technical Details
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSI Code
                </label>
                <input
                  type="text"
                  name="csiCode"
                  value={formData.csiCode}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Budget
                </label>
                <input
                  type="number"
                  name="estimatedUnitPrice"
                  value={formData.estimatedUnitPrice}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="SAR">SAR</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={`${activeSection === 'timeline' ? 'block' : 'hidden lg:block'} bg-white rounded-lg border border-gray-200 p-4 sm:p-6`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Timeline
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Date
                </label>
                <input
                  type="date"
                  name="requiredDate"
                  value={formData.requiredDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Submission Date
                </label>
                <input
                  type="date"
                  name="targetSubmissionDate"
                  value={formData.targetSubmissionDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'PUBLISHED')}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Publishing...' : 'Publish RFO'}
            </button>
          </div>
        </form>

        <MobileQuickActions />
      </div>
    </ResponsiveLayout>
  );
};

export default CreateRFOPage;