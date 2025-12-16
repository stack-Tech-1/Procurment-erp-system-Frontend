// frontend/src/utils/draftUtils.js

/**
 * Save form data as draft
 * @param {string} formId - Unique identifier for the form
 * @param {object} formData - Form data to save
 * @param {object} documentData - Document data
 * @param {array} projectExperience - Project experience data
 * @param {object} additionalData - Any additional data (logo, etc.)
 * @returns {boolean} Success status
 */
export const saveDraft = (formId, formData, documentData, projectExperience, additionalData = {}) => {
    try {
      const draftData = {
        formData,
        documentData,
        projectExperience,
        additionalData,
        savedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      // Save to localStorage
      localStorage.setItem(`draft_${formId}`, JSON.stringify(draftData));
      
      // Also save to a central drafts list
      const draftsList = JSON.parse(localStorage.getItem('vendor_drafts') || '[]');
      const existingIndex = draftsList.findIndex(draft => draft.id === formId);
      
      const draftMetadata = {
        id: formId,
        title: formData.companyLegalName || 'Unnamed Vendor',
        vendorType: formData.vendorType || 'Not specified',
        savedAt: new Date().toISOString(),
        progress: calculateFormProgress(formData, documentData, projectExperience),
        lastUpdated: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        draftsList[existingIndex] = draftMetadata;
      } else {
        draftsList.push(draftMetadata);
      }
      
      localStorage.setItem('vendor_drafts', JSON.stringify(draftsList));
      
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  };
  
  /**
   * Load draft data
   * @param {string} formId - Draft identifier
   * @returns {object|null} Draft data or null if not found
   */
  export const loadDraft = (formId) => {
    try {
      const draftData = localStorage.getItem(`draft_${formId}`);
      if (!draftData) return null;
      
      return JSON.parse(draftData);
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  };
  
  /**
   * Get all saved drafts
   * @returns {array} List of drafts
   */
  export const getAllDrafts = () => {
    try {
      const draftsList = JSON.parse(localStorage.getItem('vendor_drafts') || '[]');
      return draftsList.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    } catch (error) {
      console.error('Error loading drafts list:', error);
      return [];
    }
  };
  
  /**
   * Delete a draft
   * @param {string} formId - Draft identifier
   * @returns {boolean} Success status
   */
  export const deleteDraft = (formId) => {
    try {
      // Remove draft data
      localStorage.removeItem(`draft_${formId}`);
      
      // Remove from drafts list
      const draftsList = JSON.parse(localStorage.getItem('vendor_drafts') || '[]');
      const updatedList = draftsList.filter(draft => draft.id !== formId);
      localStorage.setItem('vendor_drafts', JSON.stringify(updatedList));
      
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  };
  
  /**
   * Calculate form completion progress
   * @param {object} formData - Form data
   * @param {object} documentData - Document data
   * @param {array} projectExperience - Project experience data
   * @returns {number} Progress percentage (0-100)
   */
  export const calculateFormProgress = (formData, documentData, projectExperience) => {
    let completedFields = 0;
    let totalFields = 0;
    
    // Basic form fields
    const requiredFields = [
      'companyLegalName', 'licenseNumber', 'vendorType', 'businessType',
      'yearsInBusiness', 'contactPerson', 'contactPhone', 'contactEmail',
      'addressStreet', 'addressCity', 'addressCountry'
    ];
    
    totalFields += requiredFields.length;
    requiredFields.forEach(field => {
      if (formData[field] && formData[field].toString().trim() !== '') {
        completedFields++;
      }
    });
    
    // Company logo
    totalFields += 1;
    if (formData.companyLogo || formData.logoPreview) {
      completedFields++;
    }
    
    // Documents (mandatory ones)
    const mandatoryDocs = ['COMMERCIAL_REGISTRATION', 'ZAKAT_CERTIFICATE', 'VAT_CERTIFICATE', 
                          'GOSI_CERTIFICATE', 'ISO_CERTIFICATE', 'WARRANTY_CERTIFICATE'];
    
    totalFields += mandatoryDocs.length;
    mandatoryDocs.forEach(docKey => {
      if (documentData[docKey] && documentData[docKey].file) {
        completedFields++;
      }
    });
    
    // Project experience (if required)
    const vendorConfig = getVendorTypeConfig(formData.vendorType);
    if (vendorConfig.showProjectExperience) {
      totalFields += 1;
      if (projectExperience.length > 0) {
        completedFields++;
      }
    }
    
    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  };
  
  /**
   * Get vendor type configuration (helper function)
   */
  const getVendorTypeConfig = (vendorType) => {
    const VENDOR_TYPE_CONFIG = {
      'Contractor': { showProjectExperience: true },
      'Subcontractor': { showProjectExperience: true },
      'Supplier': { showProjectExperience: false },
      'Manufacturer': { showProjectExperience: false },
      'Distributor': { showProjectExperience: false },
      'ServiceProvider': { showProjectExperience: true },
      'Consultant': { showProjectExperience: true },
      'default': { showProjectExperience: true }
    };
    
    const normalizedKey = vendorType?.replace(/\s+/g, '');
    return VENDOR_TYPE_CONFIG[normalizedKey] || VENDOR_TYPE_CONFIG['default'];
  };
  
  /**
   * Auto-save draft with debouncing
   * @param {function} saveFunction - Function to call for saving
   * @param {number} delay - Delay in milliseconds
   * @returns {function} Debounced function
   */
  export const createAutoSave = (saveFunction, delay = 3000) => {
    let timeoutId;
    
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        saveFunction(...args);
      }, delay);
    };
  };
  
  /**
   * Check if draft exists
   * @param {string} formId - Draft identifier
   * @returns {boolean} True if draft exists
   */
  export const hasDraft = (formId) => {
    return localStorage.getItem(`draft_${formId}`) !== null;
  };
  
  export default {
    saveDraft,
    loadDraft,
    getAllDrafts,
    deleteDraft,
    calculateFormProgress,
    createAutoSave,
    hasDraft
  };