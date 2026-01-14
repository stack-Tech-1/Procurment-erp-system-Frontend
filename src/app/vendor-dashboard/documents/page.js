// frontend/src/app/vendor-dashboard/documents/page.js
"use client";
import React, { useState, useEffect } from 'react';
//import VendorLayout from '../layout';
import { 
  FileText, Calendar, CheckCircle, AlertTriangle, XCircle, 
  Download, Eye, Upload, Filter, Search, RefreshCw, Clock,
  ChevronDown, ChevronUp, ExternalLink, Info, Plus,
  FileCheck, Shield, FileWarning, FileX, FileUp
} from 'lucide-react';

const VendorDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, valid, expiring, expired, missing
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [uploadModal, setUploadModal] = useState({ show: false, docType: null });
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    expiring: 0,
    expired: 0,
    missing: 0
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');
      
      // Fetch from vendor qualification endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/qualification/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`Failed to fetch documents: ${response.status}`);
      
      const result = await response.json();
      
      // Transform API data to document format
      const apiDocuments = result.documents || [];
      const allDocumentTypes = getAllDocumentTypes();
      
      // Create document objects for all types
      const formattedDocs = allDocumentTypes.map(docType => {
        const existingDoc = apiDocuments.find(d => d.docType === docType.dbKey);
        
        let status = 'missing';
        let expiryDate = null;
        let daysUntilExpiry = null;
        
        if (existingDoc) {
          expiryDate = existingDoc.expiryDate ? new Date(existingDoc.expiryDate) : null;
          
          if (existingDoc.isValid && (!expiryDate || expiryDate > new Date())) {
            if (expiryDate) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
              
              if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                status = 'expiring';
              } else if (daysUntilExpiry <= 0) {
                status = 'expired';
              } else {
                status = 'valid';
              }
            } else {
              status = 'valid';
            }
          } else {
            status = 'expired';
          }
        }
        
        return {
          id: docType.dbKey,
          name: docType.label,
          description: docType.description || '',
          type: docType.dbKey,
          status,
          expiryDate,
          daysUntilExpiry,
          isMandatory: docType.isMandatory,
          uploadedAt: existingDoc?.uploadedAt ? new Date(existingDoc.uploadedAt) : null,
          fileUrl: existingDoc?.url,
          fileName: existingDoc?.fileName,
          documentNumber: existingDoc?.documentNumber,
          isoType: existingDoc?.isoType,
          isValid: existingDoc?.isValid,
          condition: docType.condition,
          category: docType.category || 'general'
        };
      });
      
      setDocuments(formattedDocs);
      calculateStats(formattedDocs);
      
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err.message);
      // Fallback to sample data for demo
      setDocuments(getSampleDocuments());
      calculateStats(getSampleDocuments());
    } finally {
      setLoading(false);
    }
  };

  const getAllDocumentTypes = () => [
    { dbKey: 'COMMERCIAL_REGISTRATION', label: 'Commercial Registration (CR)', description: 'Official commercial registration document', isMandatory: true, hasExpiry: true, hasNumber: true },
    { dbKey: 'ZAKAT_CERTIFICATE', label: 'Zakat Certificate', description: 'Zakat compliance certificate', isMandatory: true, hasExpiry: true },
    { dbKey: 'VAT_CERTIFICATE', label: 'VAT Certificate', description: 'Value Added Tax registration', isMandatory: true, hasNumber: true },
    { dbKey: 'GOSI_CERTIFICATE', label: 'GOSI Certificate', description: 'General Organization for Social Insurance', isMandatory: true, hasExpiry: true, hasNumber: true },
    { dbKey: 'ISO_CERTIFICATE', label: 'ISO Certificate', description: 'ISO quality management certification', isMandatory: true, hasExpiry: true, hasIsoType: true },
    { dbKey: 'SASO_SABER_CERTIFICATE', label: 'SASO/SABER Certificate', description: 'Saudi Standards certificate', isMandatory: false, condition: 'For Suppliers', hasExpiry: true, hasNumber: true },
    { dbKey: 'INSURANCE_CERTIFICATE', label: 'Insurance Certificates', description: 'Insurance coverage certificates', isMandatory: true, hasExpiry: true },
    { dbKey: 'BANK_LETTER', label: 'Bank Letter/IBAN', description: 'Bank account verification letter', isMandatory: true },
    { dbKey: 'COMPANY_PROFILE', label: 'Company Profile (PDF)', description: 'Company overview and capabilities', isMandatory: true },
    { dbKey: 'ORGANIZATION_CHART', label: 'Organization Chart', description: 'Company organizational structure', isMandatory: true },
    { dbKey: 'TECHNICAL_FILE', label: 'Technical File', description: 'Technical specifications and capabilities', isMandatory: true },
    { dbKey: 'FINANCIAL_FILE', label: 'Financial File', description: 'Audited financial statements', isMandatory: true },
    { dbKey: 'WARRANTY_CERTIFICATE', label: 'Warranty Certificate', description: 'Product/service warranty documentation', isMandatory: true },
    { dbKey: 'QUALITY_PLAN', label: 'Quality Plan', description: 'Quality management plan', isMandatory: true },
    { dbKey: 'HSE_PLAN', label: 'HSE Plan', description: 'Health, Safety and Environment plan', isMandatory: false, condition: 'For Contractors' },
    { dbKey: 'INDUSTRY_LICENSE', label: 'Industry Licenses/Permits', description: 'Industry-specific licenses', isMandatory: false },
    { dbKey: 'VENDOR_CODE_OF_CONDUCT', label: 'Vendor Code of Conduct', description: 'Company code of conduct', isMandatory: true }
  ];

  const getSampleDocuments = () => [
    { id: 'CR', name: 'Commercial Registration', status: 'valid', expiryDate: new Date('2028-06-15'), daysUntilExpiry: 883, isMandatory: true, fileName: 'cr_2028.pdf' },
    { id: 'VAT', name: 'VAT Certificate', status: 'valid', expiryDate: null, isMandatory: true, fileName: 'vat_cert.pdf' },
    { id: 'GOSI', name: 'GOSI Certificate', status: 'expired', expiryDate: new Date('2025-10-30'), daysUntilExpiry: -76, isMandatory: true, fileName: 'gosi_2025.pdf' },
    { id: 'ISO', name: 'ISO Certificate', status: 'valid', expiryDate: new Date('2027-11-20'), daysUntilExpiry: 675, isMandatory: true, fileName: 'iso_9001.pdf' },
    { id: 'BANK', name: 'Bank Letter', status: 'valid', expiryDate: null, isMandatory: true, fileName: 'bank_letter.pdf' },
    { id: 'INSURANCE', name: 'Insurance Certificate', status: 'expiring', expiryDate: new Date('2026-02-15'), daysUntilExpiry: 32, isMandatory: true, fileName: 'insurance_2026.pdf' },
    { id: 'PROFILE', name: 'Company Profile', status: 'valid', expiryDate: null, isMandatory: true, fileName: 'company_profile.pdf' },
    { id: 'ZAKAT', name: 'Zakat Certificate', status: 'valid', expiryDate: new Date('2026-03-01'), daysUntilExpiry: 46, isMandatory: true, fileName: 'zakat_2026.pdf' },
  ];

  const calculateStats = (docs) => {
    const stats = {
      total: docs.length,
      valid: docs.filter(d => d.status === 'valid').length,
      expiring: docs.filter(d => d.status === 'expiring').length,
      expired: docs.filter(d => d.status === 'expired').length,
      missing: docs.filter(d => d.status === 'missing').length
    };
    setStats(stats);
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter !== 'all' && doc.status !== filter) return false;
    if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getStatusConfig = (status) => {
    const configs = {
      valid: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Valid' },
      expiring: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'Expiring Soon' },
      expired: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Expired' },
      missing: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: FileX, label: 'Not Uploaded' }
    };
    return configs[status] || configs.missing;
  };

  const handleUpload = async (docType, file) => {
    // Implement file upload logic here
    console.log('Uploading:', docType, file);
    // You would typically call your backend API here
    setUploadModal({ show: false, docType: null });
    // Refresh documents after upload
    setTimeout(() => fetchDocuments(), 1000);
  };

  const handleDownload = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
  };

  const handleView = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
  };

  const renderDocumentCard = (doc) => {
    const statusConfig = getStatusConfig(doc.status);
    const StatusIcon = statusConfig.icon;
    const isExpanded = expandedDoc === doc.id;
    
    return (
      <div key={doc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-blue-600" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-800">{doc.name}</h3>
                  {doc.description && (
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                  <StatusIcon size={12} />
                  {statusConfig.label}
                </span>
                
                {doc.isMandatory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <Shield size={12} />
                    Required
                  </span>
                )}
                
                {doc.condition && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {doc.condition}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>
          
          {/* Document Details */}
          <div className={`mt-4 pt-4 border-t border-gray-100 ${isExpanded ? 'block' : 'hidden'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column - Status & Dates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`font-medium ${doc.status === 'valid' ? 'text-green-600' : doc.status === 'expiring' ? 'text-orange-600' : 'text-red-600'}`}>
                    {statusConfig.label}
                  </span>
                </div>
                
                {doc.expiryDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Expiry Date</span>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="font-medium">{doc.expiryDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
                {doc.daysUntilExpiry !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Days Until Expiry</span>
                    <span className={`font-medium ${doc.daysUntilExpiry > 30 ? 'text-green-600' : doc.daysUntilExpiry > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {doc.daysUntilExpiry} days
                    </span>
                  </div>
                )}
                
                {doc.uploadedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Uploaded</span>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="font-medium">{doc.uploadedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column - File Info & Actions */}
              <div className="space-y-3">
                {doc.fileName ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">File</span>
                      <span className="font-medium text-gray-800 truncate max-w-[200px]">{doc.fileName}</span>
                    </div>
                    
                    {doc.documentNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Document Number</span>
                        <span className="font-medium">{doc.documentNumber}</span>
                      </div>
                    )}
                    
                    {doc.isoType && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">ISO Type</span>
                        <span className="font-medium">{doc.isoType}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      <button
                        onClick={() => setUploadModal({ show: true, docType: doc })}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Upload size={16} />
                        Replace
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <FileWarning className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No document uploaded</p>
                    <button
                      onClick={() => setUploadModal({ show: true, docType: doc })}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload size={16} />
                      Upload Document
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStatsCard = (title, count, color, icon) => {
    const colorClasses = {
      green: 'bg-green-50 border-green-200 text-green-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      red: 'bg-red-50 border-red-200 text-red-700',
      gray: 'bg-gray-50 border-gray-200 text-gray-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700'
    };
    
    return (
      <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <icon size={20} />
        </div>
        <div className="text-2xl font-bold">{count}</div>
      </div>
    );
  };

  const UploadModal = () => {
    if (!uploadModal.show) return null;
    
    const [file, setFile] = useState(null);
    const [expiryDate, setExpiryDate] = useState('');
    const [docNumber, setDocNumber] = useState('');
    const [isoType, setIsoType] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const doc = uploadModal.docType;
    const hasExpiry = ['COMMERCIAL_REGISTRATION', 'ZAKAT_CERTIFICATE', 'GOSI_CERTIFICATE', 'ISO_CERTIFICATE', 'INSURANCE_CERTIFICATE'].includes(doc.type);
    const hasNumber = ['COMMERCIAL_REGISTRATION', 'VAT_CERTIFICATE', 'GOSI_CERTIFICATE'].includes(doc.type);
    const hasIsoType = doc.type === 'ISO_CERTIFICATE';
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!file) return;
      
      setUploading(true);
      try {
        // Simulate upload
        await new Promise(resolve => setTimeout(resolve, 1500));
        handleUpload(doc.type, file);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Upload {doc.name}</h3>
              <p className="text-sm text-gray-600 mt-1">Upload a new document to replace existing one</p>
            </div>
            <button
              onClick={() => setUploadModal({ show: false, docType: null })}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload-input"
                  required
                />
                <label htmlFor="file-upload-input" className="cursor-pointer block">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Click to select file'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOC, JPG, PNG (Max 10MB)
                  </p>
                </label>
              </div>
            </div>
            
            {/* Expiry Date */}
            {hasExpiry && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required={hasExpiry}
                />
              </div>
            )}
            
            {/* Document Number */}
            {hasNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Number
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter document number"
                />
              </div>
            )}
            
            {/* ISO Type */}
            {hasIsoType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISO Type
                </label>
                <input
                  type="text"
                  value={isoType}
                  onChange={(e) => setIsoType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., 9001, 14001"
                />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setUploadModal({ show: false, docType: null })}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || uploading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FileCheck className="text-blue-600" size={28} />
              Document Management
            </h1>
            <p className="text-gray-600 mt-2">Manage and track all your compliance documents</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDocuments}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={() => {/* Implement bulk upload */}}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {renderStatsCard('Total Documents', stats.total, 'blue', FileText)}
          {renderStatsCard('Valid', stats.valid, 'green', CheckCircle)}
          {renderStatsCard('Expiring Soon', stats.expiring, 'orange', AlertTriangle)}
          {renderStatsCard('Expired', stats.expired, 'red', XCircle)}
          {renderStatsCard('Missing', stats.missing, 'gray', FileX)}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-500" />
                <span className="text-sm text-gray-600">Filter:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Documents', color: 'bg-gray-100 text-gray-800' },
                  { id: 'valid', label: 'Valid', color: 'bg-green-100 text-green-800' },
                  { id: 'expiring', label: 'Expiring Soon', color: 'bg-orange-100 text-orange-800' },
                  { id: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
                  { id: 'missing', label: 'Missing', color: 'bg-gray-100 text-gray-800' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.id}
                    onClick={() => setFilter(filterOption.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === filterOption.id 
                        ? `${filterOption.color} border border-gray-300` 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-2">
                <Search size={18} className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="space-y-4">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map(renderDocumentCard)
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FileWarning className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-6">Try changing your filters or search term</p>
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Summary Bar */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-medium text-gray-800">Document Compliance Summary</h4>
              <p className="text-sm text-gray-600 mt-1">
                {stats.valid} of {stats.total} documents are valid • 
                {stats.expiring > 0 && ` ${stats.expiring} expiring soon •`}
                {stats.expired > 0 && ` ${stats.expired} expired •`}
                {stats.missing > 0 && ` ${stats.missing} missing`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Compliance Score:</span>
                <span className="font-bold text-green-600 ml-2">
                  {stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0}%
                </span>
              </div>
              <button
                onClick={() => window.open('/vendor-dashboard/documents/export', '_blank')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        <UploadModal />
      </div>
    
  );
};

export default VendorDocumentsPage;