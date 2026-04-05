// frontend/src/app/dashboard/procurement/rfos/create/page.js - MOBILE OPTIMIZED
"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Save, Send, Clock, ArrowLeft, FileText,
  Settings, Package, Calendar, DollarSign,
  Sparkles, RefreshCw, CheckCircle, AlertTriangle,
  Database, Search, X
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

  const [vendorSuggestions, setVendorSuggestions] = useState(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Materials DB search
  const [showMatModal, setShowMatModal] = useState(false);
  const [matSearch, setMatSearch] = useState('');
  const [matResults, setMatResults] = useState([]);
  const [matSearching, setMatSearching] = useState(false);
  const matSearchTimer = React.useRef(null);

  const searchMaterials = (q) => {
    if (!q || q.length < 2) { setMatResults([]); return; }
    setMatSearching(true);
    const token = localStorage.getItem('authToken');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/materials?search=${encodeURIComponent(q)}&limit=15`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : null)
      .then(d => setMatResults(d?.data || []))
      .catch(() => {})
      .finally(() => setMatSearching(false));
  };

  const onMatSearchChange = (v) => {
    setMatSearch(v);
    clearTimeout(matSearchTimer.current);
    matSearchTimer.current = setTimeout(() => searchMaterials(v), 350);
  };

  const applyMaterial = (m) => {
    setFormData(prev => ({
      ...prev,
      itemDesc: m.materialName || m.name || prev.itemDesc,
      csiCode: m.csiCode || prev.csiCode,
      estimatedUnitPrice: m.standardPrice ? String(m.standardPrice) : prev.estimatedUnitPrice,
      packageScope: prev.packageScope || (m.materialName || m.name),
    }));
    setShowMatModal(false);
    setMatSearch('');
    setMatResults([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetSuggestions = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    setSuggestionsLoading(true);
    setVendorSuggestions(null);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/match-vendors-preview`,
        {
          scope: formData.packageScope || formData.description,
          categories: formData.csiCode ? [formData.csiCode] : [],
          projectName: formData.projectName,
          estimatedValue: formData.estimatedUnitPrice ? parseFloat(formData.estimatedUnitPrice) : 0,
          requiredDate: formData.requiredDate || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVendorSuggestions(res.data);
    } catch {
      setVendorSuggestions({ error: 'Failed to get suggestions. Please try again.' });
    } finally {
      setSuggestionsLoading(false);
    }
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    CSI Code
                  </label>
                  <button type="button" onClick={() => setShowMatModal(true)}
                    className="flex items-center gap-1 text-xs font-medium hover:underline"
                    style={{ color: '#B8960A' }}>
                    <Database size={11} /> Search Materials DB
                  </button>
                </div>
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

          {/* AI Vendor Suggestions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: '#B8960A' }} />
                AI Vendor Suggestions
              </h2>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Powered by AI
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Fill in the Package Scope and CSI Code above, then click below to get AI-ranked vendor recommendations.
            </p>

            <button
              type="button"
              onClick={handleGetSuggestions}
              disabled={suggestionsLoading || (!formData.packageScope && !formData.description)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition"
              style={{ backgroundColor: '#B8960A' }}
            >
              {suggestionsLoading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Getting suggestions...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Get AI Suggestions</>
              )}
            </button>

            {vendorSuggestions?.error && (
              <p className="mt-4 text-sm text-red-600">{vendorSuggestions.error}</p>
            )}

            {vendorSuggestions?.recommendations?.length > 0 && (
              <div className="mt-4 space-y-3">
                {vendorSuggestions.recommendations.slice(0, 5).map((v, idx) => {
                  const riskColor = v.risk === 'LOW' ? 'text-green-700 bg-green-50' : v.risk === 'HIGH' ? 'text-red-700 bg-red-50' : 'text-orange-700 bg-orange-50';
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#0A1628' }}>{idx + 1}</span>
                        <span className="font-semibold text-sm text-gray-800">{v.vendorName}</span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${riskColor}`}>{v.risk} RISK</span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                          <span>Match Score</span>
                          <span className="font-bold">{v.matchScore}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${v.matchScore}%`, backgroundColor: '#B8960A' }} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {v.reasons?.map((r, ri) => (
                          <span key={ri} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {vendorSuggestions.summary && (
                  <p className="text-xs italic text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    {vendorSuggestions.summary}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleGetSuggestions}
                  disabled={suggestionsLoading}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh Suggestions
                </button>
              </div>
            )}
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

      {/* Materials DB Search Modal */}
      {showMatModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Database size={16} style={{ color: '#B8960A' }} />
                <h3 className="font-bold text-gray-800 text-sm">Search Materials Database</h3>
              </div>
              <button onClick={() => { setShowMatModal(false); setMatSearch(''); setMatResults([]); }}
                className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={matSearch}
                  onChange={e => onMatSearchChange(e.target.value)}
                  placeholder="Search by name, code, or CSI..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                />
                {matSearching && <RefreshCw size={12} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
              </div>

              {matResults.length > 0 ? (
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto rounded-xl border border-gray-200">
                  {matResults.map(m => (
                    <button key={m.id} onClick={() => applyMaterial(m)}
                      className="w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{m.materialName || m.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {m.materialCode && <span className="font-mono mr-2">{m.materialCode}</span>}
                            {m.unit && <span>Unit: {m.unit}</span>}
                            {m.csiCode && <span className="ml-2">CSI: {m.csiCode}</span>}
                          </p>
                        </div>
                        {m.standardPrice != null && (
                          <span className="text-xs font-medium ml-2 flex-shrink-0" style={{ color: '#B8960A' }}>
                            {new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(m.standardPrice)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : matSearch.length >= 2 && !matSearching ? (
                <p className="text-sm text-gray-400 text-center py-6">No materials found for &quot;{matSearch}&quot;</p>
              ) : matSearch.length < 2 ? (
                <p className="text-xs text-gray-400 text-center py-4">Type at least 2 characters to search</p>
              ) : null}

              <p className="text-xs text-gray-400 mt-3">
                Selecting a material will auto-fill the CSI Code, item description, and estimated price.
              </p>
            </div>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
};

export default CreateRFOPage;