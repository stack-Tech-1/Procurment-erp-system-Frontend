// frontend/src/components/requests/CreateRequestModal.js
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { 
  X, 
  Send, 
  FileText, 
  Calendar, 
  Building,
  AlertCircle,
  CheckCircle,
  Package,
  HelpCircle,
  FolderPlus,
  ChevronDown,
  Upload,
  Users,
  Clock
} from 'lucide-react';
import FileUploader from './FileUploader';
import mockRequestService from '@/services/mockRequestService';
import { mockVendors, mockDocuments } from '@/utils/mockRequests';
import { formatDateForInput, addDays } from '@/utils/dateUtils';

const CreateRequestModal = ({ onClose, onRequestCreated, selectedVendor = null }) => {
  const { t } = useTranslation(); // ADD THIS HOOK
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vendorId: selectedVendor?.id || '',
    requestType: 'CLARIFICATION',
    title: '',
    description: '',
    documentId: '',
    priority: 'NORMAL',
    dueDate: '',
    notes: ''
  });
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState(selectedVendor ? [selectedVendor.id] : []);
  const [bulkMode, setBulkMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  const REQUEST_TYPES = [
    { value: 'NDA', label: t('ndaSubmission'), icon: <FileText size={16} /> },
    { value: 'CERTIFICATE_UPDATE', label: t('updatedCertificate'), icon: <CheckCircle size={16} /> },
    { value: 'BRAND_LIST', label: t('brandList'), icon: <Package size={16} /> },
    { value: 'CLARIFICATION', label: t('clarification'), icon: <HelpCircle size={16} /> },
    { value: 'ADDITIONAL_DOCS', label: t('additionalDocuments'), icon: <FolderPlus size={16} /> },
    { value: 'OTHER', label: t('other'), icon: <FileText size={16} /> }
  ];

  const PRIORITY_LEVELS = [
    { value: 'NORMAL', label: t('normal'), color: 'gray' },
    { value: 'URGENT', label: t('urgent'), color: 'orange' },
    { value: 'CRITICAL', label: t('critical'), color: 'red' }
  ];

  const DEFAULT_DUE_DAYS = {
    NORMAL: 14,
    URGENT: 7,
    CRITICAL: 3
  };

  useEffect(() => {
    // Set default due date based on priority
    const defaultDueDate = addDays(new Date(), DEFAULT_DUE_DAYS[formData.priority]);
    setFormData(prev => ({
      ...prev,
      dueDate: formatDateForInput(defaultDueDate)
    }));
  }, [formData.priority]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVendorSelection = (vendorId) => {
    if (bulkMode) {
      setSelectedVendors(prev => {
        if (prev.includes(vendorId)) {
          return prev.filter(id => id !== vendorId);
        } else {
          return [...prev, vendorId];
        }
      });
    } else {
      setSelectedVendors([vendorId]);
      setFormData(prev => ({ ...prev, vendorId }));
    }
  };

  const handleSelectAllVendors = () => {
    if (selectedVendors.length === mockVendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(mockVendors.map(v => v.id));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (bulkMode) {
      if (selectedVendors.length === 0) {
        newErrors.vendors = t('pleaseSelectAtLeastOneVendor');
      }
    } else {
      if (!formData.vendorId) {
        newErrors.vendorId = t('pleaseSelectVendor');
      }
    }
    
    if (!formData.requestType) {
      newErrors.requestType = t('pleaseSelectRequestType');
    }
    
    if (!formData.title.trim()) {
      newErrors.title = t('titleRequired');
    }
    
    if (!formData.description.trim()) {
      newErrors.description = t('descriptionRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.dueDate) {
      newErrors.dueDate = t('dueDateRequired');
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      if (dueDate < today) {
        newErrors.dueDate = t('dueDateCannotBePast');
      }
    }
    
    if (!formData.priority) {
      newErrors.priority = t('priorityRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setSending(true);
      
      if (bulkMode && selectedVendors.length > 1) {
        // Bulk create for multiple vendors
        const requestsData = selectedVendors.map(vendorId => ({
          vendorId,
          requestType: formData.requestType,
          title: formData.title,
          description: formData.description,
          documentId: formData.documentId || null,
          priority: formData.priority,
          dueDate: formData.dueDate,
          notes: formData.notes
        }));
        
        const response = await mockRequestService.bulkCreateRequests(requestsData);
        
        if (response.success) {
          alert(t('nRequestsCreatedSuccessfully', { count: response.data.length }));
          if (onRequestCreated) {
            onRequestCreated(response.data);
          }
          onClose();
        }
      } else {
        // Single request
        const vendorId = bulkMode ? selectedVendors[0] : formData.vendorId;
        
        const response = await mockRequestService.createRequest({
          vendorId,
          vendorName: mockVendors.find(v => v.id === vendorId)?.name || t('vendor'),
          requestType: formData.requestType,
          title: formData.title,
          description: formData.description,
          documentId: formData.documentId || null,
          priority: formData.priority,
          dueDate: formData.dueDate,
          notes: formData.notes,
          createdBy: 'executive-001',
          createdByName: t('procurementManager')
        });
        
        if (response.success) {
          alert(t('requestCreatedSuccessfully'));
          if (onRequestCreated) {
            onRequestCreated(response.data);
          }
          onClose();
        }
      }
    } catch (err) {
      console.error('Error creating request:', err);
      alert(`${t('error')}: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const getSelectedVendorCount = () => {
    return bulkMode ? selectedVendors.length : (formData.vendorId ? 1 : 0);
  };

  const getRequestTypeIcon = (type) => {
    const config = REQUEST_TYPES.find(t => t.value === type);
    return config?.icon || <FileText size={16} />;
  };

  const getPriorityColor = (priority) => {
    const config = PRIORITY_LEVELS.find(p => p.value === priority);
    return config?.color || 'gray';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('createInformationRequest')}</h2>
            <p className="text-gray-600 mt-1">
              {t('stepXOfY', { current: step, total: 2 })} • {getSelectedVendorCount()} {t('vendor')}{getSelectedVendorCount() !== 1 ? 's' : ''} {t('selected')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Bulk Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">{t('createForMultipleVendors')}</p>
                  <p className="text-sm text-blue-600">
                    {t('bulkModeDescription')}
                  </p>
                </div>
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    bulkMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    bulkMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Vendor Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('selectVendor')}{bulkMode ? 's' : ''} *
                  </label>
                  {bulkMode && (
                    <button
                      type="button"
                      onClick={handleSelectAllVendors}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedVendors.length === mockVendors.length ? t('deselectAll') : t('selectAll')}
                    </button>
                  )}
                </div>
                
                {errors.vendors && (
                  <p className="text-sm text-red-500 mb-2">{errors.vendors}</p>
                )}
                {errors.vendorId && (
                  <p className="text-sm text-red-500 mb-2">{errors.vendorId}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                  {mockVendors.map(vendor => (
                    <button
                      key={vendor.id}
                      type="button"
                      onClick={() => handleVendorSelection(vendor.id)}
                      className={`
                        p-3 text-left rounded-lg border transition-all
                        ${(bulkMode ? selectedVendors.includes(vendor.id) : formData.vendorId === vendor.id)
                          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray'
                          // Continue from CreateRequestModal.js
                        }`}
                        >
                          <div className="flex items-center gap-3">
                            {bulkMode && (
                              <div className={`
                                w-5 h-5 rounded border flex items-center justify-center
                                ${selectedVendors.includes(vendor.id)
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'bg-white border-gray-300'
                                }
                              `}>
                                {selectedVendors.includes(vendor.id) && (
                                  <CheckCircle className="text-white" size={12} />
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{vendor.name}</p>
                              <p className="text-xs text-gray-500 truncate">{vendor.email}</p>
                            </div>
                            {!bulkMode && formData.vendorId === vendor.id && (
                              <CheckCircle className="text-blue-600" size={16} />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
    
                  {/* Request Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('requestType')} *
                    </label>
                    {errors.requestType && (
                      <p className="text-sm text-red-500 mb-2">{errors.requestType}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {REQUEST_TYPES.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange({ target: { name: 'requestType', value: type.value } })}
                          className={`
                            p-3 rounded-lg border transition-all
                            ${formData.requestType === type.value
                              ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded ${
                              formData.requestType === type.value ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              {type.icon}
                            </div>
                            <span className="font-medium text-gray-800">{type.label}</span>
                          </div>
                          <p className="text-xs text-gray-500 text-left">
                            {type.value === 'NDA' && t('ndaDescription')}
                            {type.value === 'CERTIFICATE_UPDATE' && t('certificateUpdateDescription')}
                            {type.value === 'BRAND_LIST' && t('brandListDescription')}
                            {type.value === 'CLARIFICATION' && t('clarificationDescription')}
                            {type.value === 'ADDITIONAL_DOCS' && t('additionalDocsDescription')}
                            {type.value === 'OTHER' && t('otherDescription')}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
    
                  {/* Title & Description */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('requestTitle')} *
                      </label>
                      {errors.title && (
                        <p className="text-sm text-red-500 mb-1">{errors.title}</p>
                      )}
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder={t('titlePlaceholder')}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('description')} *
                      </label>
                      {errors.description && (
                        <p className="text-sm text-red-500 mb-1">{errors.description}</p>
                      )}
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder={t('descriptionPlaceholder')}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
    
                  {/* Document Linking (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('linkToExistingDocumentOptional')}
                    </label>
                    <select
                      name="documentId"
                      value={formData.documentId}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- {t('noDocumentLink')} --</option>
                      {mockDocuments.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({t(doc.docType?.toLowerCase() || 'document')}) - {t('expires')}: {doc.expiryDate}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('documentLinkingDescription')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Priority Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('priorityLevel')} *
                    </label>
                    {errors.priority && (
                      <p className="text-sm text-red-500 mb-2">{errors.priority}</p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-3">
                      {PRIORITY_LEVELS.map(priority => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => handleInputChange({ target: { name: 'priority', value: priority.value } })}
                          className={`
                            p-4 rounded-lg border transition-all
                            ${formData.priority === priority.value
                              ? `bg-${priority.color}-50 border-${priority.color}-300 ring-1 ring-${priority.color}-200`
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded ${
                              formData.priority === priority.value 
                                ? `bg-${priority.color}-100 text-${priority.color}-600`
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {priority.value === 'CRITICAL' ? (
                                <AlertCircle size={16} />
                              ) : priority.value === 'URGENT' ? (
                                <Clock size={16} />
                              ) : (
                                <CheckCircle size={16} />
                              )}
                            </div>
                            <span className={`font-medium ${
                              formData.priority === priority.value 
                                ? `text-${priority.color}-800`
                                : 'text-gray-800'
                            }`}>
                              {priority.label}
                            </span>
                          </div>
                          <p className="text-xs text-left">
                            <span className={`font-medium ${
                              formData.priority === priority.value 
                                ? `text-${priority.color}-700`
                                : 'text-gray-600'
                            }`}>
                              {t('dueInNDays', { days: DEFAULT_DUE_DAYS[priority.value] })}
                            </span>
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
    
                  {/* Due Date */}
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('dueDate')} *
                    </label>
                    {errors.dueDate && (
                      <p className="text-sm text-red-500 mb-1">{errors.dueDate}</p>
                    )}
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        min={formatDateForInput(new Date())}
                        className="w-full pl-10 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('vendorMustRespondByThisDate')}
                    </p>
                  </div>
    
                  {/* Additional Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('additionalNotesOptional')}
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder={t('notesPlaceholder')}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
    
                  {/* Reference Files (Optional) */}
                  <div>
                    <FileUploader
                      files={referenceFiles}
                      onChange={setReferenceFiles}
                      multiple={true}
                      maxFiles={3}
                      maxSizeMB={5}
                      label={t('referenceFilesOptional')}
                      description={t('referenceFilesDescription')}
                    />
                  </div>
    
                  {/* Summary Preview */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-3">{t('requestSummary')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('vendors')}:</span>
                        <span className="font-medium text-gray-800">
                          {bulkMode 
                            ? `${selectedVendors.length} ${t('vendor')}${selectedVendors.length !== 1 ? 's' : ''}`
                            : mockVendors.find(v => v.id === formData.vendorId)?.name || t('notSelected')
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('type')}:</span>
                        <span className="font-medium text-gray-800">
                          {REQUEST_TYPES.find(t => t.value === formData.requestType)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('priority')}:</span>
                        <span className={`font-medium text-${getPriorityColor(formData.priority)}-600`}>
                          {PRIORITY_LEVELS.find(p => p.value === formData.priority)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('dueDate')}:</span>
                        <span className="font-medium text-gray-800">{formData.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
    
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('back')}
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={sending}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {t('creating')}
                    </>
                  ) : step === 1 ? (
                    <>
                      {t('continue')}
                      <ChevronDown size={16} className="rotate-90" />
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      {t('createRequest')}{bulkMode && selectedVendors.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    export default CreateRequestModal;                          