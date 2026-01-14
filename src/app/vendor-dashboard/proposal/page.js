"use client";
import { useState, useEffect, useCallback } from "react"; 
import { z } from 'zod';
import { Building2, FileText, CheckCircle, Send, Plus, Trash2, Calendar, Hash, Upload, Package, UserCheck, AlertCircle, Briefcase, Image, Eye, X,Save, Clock, BookOpen } from "lucide-react";
import ProjectExperienceTable from "../components/ProjectExperienceTable.js";
import { 
  saveDraft, 
  loadDraft, 
  deleteDraft, 
  calculateFormProgress,
  createAutoSave,
  hasDraft 
} from '@/utils/draftUtils';
import { 
  VendorQualificationSchema, 
  DocumentEntrySchema, 
  MANDATORY_DOCS,
  getMandatoryDocsForVendorType, 
  VENDOR_TYPE_MANDATORY_DOCS, 
  DOCUMENT_CHECKLIST_REFERENCE 
} from '@/lib/validation/vendorQualificationSchema.js'; 
import EnhancedQualificationDocumentManager from '@/components/EnhancedQualificationDocumentManager';
import { useRouter } from 'next/navigation';


// Generate unique form ID (can be based on vendor ID or random)
const generateFormId = (initialData) => { // <--- Added initialData argument
  // If vendorId exists, use it, otherwise generate random
  if (initialData?.vendorId) {
    return `vendor_qualification_${initialData.vendorId}`;
  }
  // Generate a new ID for new submissions
  const randomId = Math.random().toString(36).substring(2, 9);
  return `vendor_qualification_new_${randomId}`;
};

const getVendorTypeDisplayName = (vendorTypeValue) => {
  const mapping = {
    'ServiceProvider': 'Service Provider',
    'GeneralContractor': 'General Contractor',
    'TestingCommissioning': 'Testing & Commissioning',
    'EngineeringOffice': 'Engineering Office',
    'FactoryRepresentative': 'Factory Representative',
    'SpecialistContractor': 'Specialist Contractor'
  };
  
  return mapping[vendorTypeValue] || 
         vendorTypeValue?.replace(/([A-Z])/g, ' $1').trim() || 
         vendorTypeValue;
};



// Helper function for relative time display
const getRelativeTime = (date) => {
  if (!date) return 'Never';
  
  const now = new Date();
  const pastDate = new Date(date);
  const diffMs = now - pastDate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  return pastDate.toLocaleDateString();
};


// --- NEW: VENDOR DROPDOWN OPTIONS (Section A) ---

const VENDOR_TYPES = [
  'General Contractor', 'Installer', 'Vendor', 'Designer', 'Distributor', 
  'Wholesaler', 'Testing & Commissioning', 'Engineering Office', 
  'Service Provider', 'Subcontractor', 'Manufacturer', 'Supplier', 
  'Consultant', 'Factory Representative', 'Specialist Contractor'
].map(val => ({ label: val, value: val.replace(/\s+/g, '') }));

const BUSINESS_TYPES = [
  'Supplier', 'Contractor', 'Consultant', 'Manufacturer', 'Service Provider'
].map(val => ({ label: val, value: val.replace(/\s+/g, '') }));

const MAIN_CATEGORIES = [
  'Architectural', 'Structural', 'MEP', 'Electrical', 'Mechanical', 
  'General', 'Interior Design', 'Civil', 'Finishing', 'Infrastructure', 
  'Fire Fighting', 'HVAC', 'Plumbing'
]; // Note: This is an array for Multi-select

const CHAMBER_CERTIFICATES = [
  'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Unclassified'
].map(val => ({ label: `${val} Class`, value: val }));

// --- UPDATED: DOCUMENT CHECKLIST (To match all your requirements) ---
const DOCUMENT_CHECKLIST = [
  { label: "Commercial Registration (CR)", dbKey: "COMMERCIAL_REGISTRATION", hasExpiry: true, hasNumber: true, isMandatory: true, numberLabel: "CR Number" },
  { label: "Zakat Certificate", dbKey: "ZAKAT_CERTIFICATE", hasExpiry: true, hasNumber: false, isMandatory: true },
  { label: "VAT Certificate", dbKey: "VAT_CERTIFICATE", hasExpiry: false, hasNumber: true, isMandatory: true, numberLabel: "VAT Number" },
  { label: "GOSI Certificate", dbKey: "GOSI_CERTIFICATE", hasExpiry: true, hasNumber: true, isMandatory: true, numberLabel: "GOSI Number" },
  { label: "ISO Certificate", dbKey: "ISO_CERTIFICATE", hasExpiry: true, hasNumber: false, isMandatory: true, hasIsoType: true }, // Added hasIsoType
  { label: "SASO/SABER Certificate", dbKey: "SASO_SABER_CERTIFICATE", hasExpiry: true, hasNumber: true, isMandatory: false, condition: "For Suppliers" },
  { label: "HSE Plan", dbKey: "HSE_PLAN", hasExpiry: false, hasNumber: false, isMandatory: false, condition: "For Contractors" },
  { label: "Warranty Certificate", dbKey: "WARRANTY_CERTIFICATE", hasExpiry: false, hasNumber: false, isMandatory: true },
  { label: "Quality Plan", dbKey: "QUALITY_PLAN", hasExpiry: false, hasNumber: false, isMandatory: true },
  { label: "Organization Chart", dbKey: "ORGANIZATION_CHART", hasExpiry: false, hasNumber: false, isMandatory: true },
  { label: "Technical File", dbKey: "TECHNICAL_FILE", hasExpiry: false, hasNumber: false, isMandatory: true },
  { label: "Financial File (Audited + Bank)", dbKey: "FINANCIAL_FILE", hasExpiry: false, hasNumber: false, isMandatory: true },
  { label: "Bank Letter/IBAN", dbKey: "BANK_LETTER", hasExpiry: false, hasNumber: false, isMandatory: true },
  { label: "Insurance Certificates", dbKey: "INSURANCE_CERTIFICATE", hasExpiry: true, hasNumber: false, isMandatory: true },
  { label: "Industry Licenses/Permits", dbKey: "INDUSTRY_LICENSE", hasExpiry: true, hasNumber: false, isMandatory: false },
  { label: "Vendor Code of Conduct", dbKey: "VENDOR_CODE_OF_CONDUCT", hasExpiry: false, hasNumber: false, isMandatory: true },
  { label: "Company Profile (PDF)", dbKey: "COMPANY_PROFILE", hasExpiry: false, hasNumber: false, isMandatory: true },
];


// --- NEW: Vendor Type Configuration ---
const VENDOR_TYPE_CONFIG = {
  'Contractor': {
    showProjectExperience: true,
    isProjectExperienceMandatory: true,
    additionalDocuments: ['INSURANCE_CERTIFICATE', 'HSE_PLAN', 'ORGANIZATION_CHART'],
    hiddenDocuments: ['SASO_SABER_CERTIFICATE'],
    showBrandsSection: false,
    showCVSection: false,
    showSupplierCompliance: false
  },
  'Subcontractor': {
    showProjectExperience: true,
    isProjectExperienceMandatory: true,
    additionalDocuments: ['INSURANCE_CERTIFICATE', 'HSE_PLAN', 'ORGANIZATION_CHART'],
    hiddenDocuments: ['SASO_SABER_CERTIFICATE'],
    showBrandsSection: false,
    showCVSection: false,
    showSupplierCompliance: false
  },
  'Supplier': {
    showProjectExperience: false,
    isProjectExperienceMandatory: false,
    additionalDocuments: ['SASO_SABER_CERTIFICATE'],
    hiddenDocuments: ['HSE_PLAN'],
    showBrandsSection: true,
    showCVSection: false,
    showSupplierCompliance: true
  },
  'Manufacturer': {
    showProjectExperience: false,
    isProjectExperienceMandatory: false,
    additionalDocuments: ['SASO_SABER_CERTIFICATE'],
    hiddenDocuments: ['HSE_PLAN'],
    showBrandsSection: true,
    showCVSection: false,
    showSupplierCompliance: true
  },
  'Distributor': {
    showProjectExperience: false,
    isProjectExperienceMandatory: false,
    additionalDocuments: ['SASO_SABER_CERTIFICATE'],
    hiddenDocuments: ['HSE_PLAN'],
    showBrandsSection: true,
    showCVSection: false,
    showSupplierCompliance: true
  },
  'ServiceProvider': {
    showProjectExperience: true,
    isProjectExperienceMandatory: false,
    additionalDocuments: [],
    hiddenDocuments: ['SASO_SABER_CERTIFICATE', 'HSE_PLAN'],
    showBrandsSection: false,
    showCVSection: true,
    showSupplierCompliance: false
  },
  'Consultant': {
    showProjectExperience: true,
    isProjectExperienceMandatory: false,
    additionalDocuments: [],
    hiddenDocuments: ['SASO_SABER_CERTIFICATE', 'HSE_PLAN'],
    showBrandsSection: false,
    showCVSection: true,
    showSupplierCompliance: false
  },
  'default': {
    showProjectExperience: true,
    isProjectExperienceMandatory: false,
    additionalDocuments: [],
    hiddenDocuments: [],
    showBrandsSection: false,
    showCVSection: false,
    showSupplierCompliance: false
  }
};

const getVendorTypeConfig = (vendorType) => {
  const typeKey = vendorType;    
  if (VENDOR_TYPE_CONFIG[typeKey]) {
    return VENDOR_TYPE_CONFIG[typeKey];
  }  
  const normalizedKey = vendorType?.replace(/\s+/g, '');
  return VENDOR_TYPE_CONFIG[normalizedKey] || VENDOR_TYPE_CONFIG['default'];
};

// --- IMPROVED COMPONENTS ---

const FormInput = ({ label, name, type = "text", placeholder, colSpan = 1, required = false, children, value, onChange, error, disabled }) => (
  <div className={`flex flex-col space-y-1 ${getColSpanClass(colSpan)}`}>
    <label htmlFor={name} className={`text-sm font-medium text-gray-600 ${required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}`}>
      {label}
    </label>
    {type === "select" ? (
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm appearance-none bg-white cursor-pointer"         
      >
        {children}
      </select>
    ) : (
      <input
        id={name}
        type={type}
        name={name}
        value={type !== "file" ? value : undefined}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        disabled={disabled}
      />
    )}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// Helper function for responsive column spans
const getColSpanClass = (colSpan) => {
  const classes = {
    1: "col-span-1",
    2: "col-span-1 md:col-span-2",
    3: "col-span-1 md:col-span-3"
  };
  return classes[colSpan] || "col-span-1";
};

const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-center space-x-3 pb-3 border-b-2 border-blue-100 mb-6">
    {Icon && <Icon className="w-6 h-6 text-blue-600" />}
    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
  </div>
);

// --- IMPROVED DocumentRow Component ---
const DocumentRow = ({ doc, onChange, file, expiryDate, docNumber, isEditable, isoType }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const syntheticEvent = {
        target: {
          name: `${doc.dbKey}_file`,
          type: 'file',
          files: [file]
        }
      };
      onChange(syntheticEvent);
    }
  };

  const handleInputChange = (e) => {
    onChange(e);
  };

  return (
    <div key={doc.dbKey} className={`grid grid-cols-1 lg:grid-cols-12 gap-4 items-end p-4 rounded-lg border transition duration-150 ${
      doc.isMandatory ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
    }`}>
      
      {/* Document Name & Status */}
      <div className="lg:col-span-3 flex flex-col">
        <label className={`text-sm font-semibold text-gray-700 flex items-center gap-1 ${
          doc.isMandatory ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''
        }`}>
          {doc.label}
          {doc.condition && <span className="text-xs text-blue-600 font-normal">({doc.condition})</span>}
        </label>
        <div className="text-xs text-gray-500 mt-1">
          Status: {file?.url ? (
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Existing File
            </a>
          ) : file ? `Uploaded: ${file.name}` : "Not uploaded"}
          {expiryDate && ` • Expires: ${expiryDate}`}
        </div>
      </div>

      {/* File Upload */}
      <div className="lg:col-span-3">
        <label htmlFor={`${doc.dbKey}-file`} className="flex items-center justify-between w-full p-2 border border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Upload className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">
              {file ? file.name : 'Choose PDF file...'}
            </span>
          </div>
        </label>
        <input
          id={`${doc.dbKey}-file`}
          type="file"
          name={`${doc.dbKey}_file`}
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={!isEditable}
        />
      </div>

      {/* Dynamic Fields */}
      <div className="lg:col-span-6 grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Expiry Date */}
        {doc.hasExpiry && (
          <div className="col-span-1 lg:col-span-2">
            <FormInput 
              label="Expiry Date" 
              name={`${doc.dbKey}_expiry`} 
              type="date"
              value={expiryDate || ''}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </div>
        )}

        {/* ISO Type */}
        {doc.hasIsoType && (
          <div className="col-span-1 lg:col-span-2">
            <FormInput 
              label="ISO Type" 
              name={`${doc.dbKey}_isoType`}
              type="text"
              placeholder="e.g., 9001, 14001"
              value={isoType || ''}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </div>
        )}

        {/* Document Number */}
        {doc.hasNumber && (
          <div className="col-span-1 lg:col-span-2">
            <FormInput 
              label={doc.numberLabel || "Doc. Number"} 
              name={`${doc.dbKey}_number`} 
              type="text"
              value={docNumber || ''}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ====================================================================
// --- MAIN COMPONENT: VendorQualificationForm ---
// ====================================================================
  export default function VendorQualificationForm({ initialData, isEditable = true, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [documentData, setDocumentData] = useState({});
    const [errors, setErrors] = useState({});
    const [projectExperience, setProjectExperience] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [companyLogo, setCompanyLogo] = useState(null); 
    const [logoPreview, setLogoPreview] = useState(null); 
    const [formId, setFormId] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [formProgress, setFormProgress] = useState(0);
    const [showDraftMenu, setShowDraftMenu] = useState(false);
    
    const router = useRouter();

  // Get current vendor type configuration
  const vendorConfig = getVendorTypeConfig(formData.vendorType);

        // Initialize form ID
        useEffect(() => {
          const id = generateFormId();
          setFormId(id);
        }, []);

        // Load draft on component mount
        useEffect(() => {
          if (formId) {
            const draft = loadDraft(formId);
            if (draft && !initialData) { // Only load draft if no initialData provided
              loadDraftData(draft);
            }
          }
        }, [formId]);

        // Calculate form progress
        useEffect(() => {
          const progress = calculateFormProgress(formData, documentData, projectExperience);
          setFormProgress(progress);
        }, [formData, documentData, projectExperience]);

        // Create auto-save function
        const autoSaveDraft = useCallback(
          createAutoSave(() => {
            if (formId && hasUnsavedChanges) {
              handleSaveDraft();
            }
          }, 30000), // Auto-save every 30 seconds
          [formId, hasUnsavedChanges, formData, documentData, projectExperience, companyLogo, logoPreview]
        );

        // Trigger auto-save on changes
        useEffect(() => {
          if (hasUnsavedChanges) {
            autoSaveDraft();
          }
        }, [hasUnsavedChanges, autoSaveDraft]);

        // Handle beforeunload to warn about unsaved changes
        useEffect(() => {
          const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
              e.preventDefault();
              e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
              return e.returnValue;
            }
          };

          window.addEventListener('beforeunload', handleBeforeUnload);
          return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }, [hasUnsavedChanges]);

        // Load draft data
        const loadDraftData = (draft) => {
          if (draft.formData) {
            setFormData(draft.formData);
          }
          if (draft.documentData) {
            setDocumentData(draft.documentData);
          }
          if (draft.projectExperience) {
            setProjectExperience(draft.projectExperience);
          }
          if (draft.additionalData?.logoPreview) {
            setLogoPreview(draft.additionalData.logoPreview);
          }
          if (draft.additionalData?.companyLogo) {
            setCompanyLogo(draft.additionalData.companyLogo);
          }
          if (draft.savedAt) {
            setLastSaved(new Date(draft.savedAt));
          }
          
          setHasUnsavedChanges(false);
          
          // Show success message
          setSubmissionSuccess(false);
          setSubmissionError(null);
          setTimeout(() => {
            setSubmissionError({
              type: 'info',
              message: `Loaded draft from ${new Date(draft.savedAt).toLocaleString()}`
            });
            setTimeout(() => setSubmissionError(null), 5000);
          }, 100);
        };

        // Save draft function
        const handleSaveDraft = async (showMessage = false) => {
          if (!formId || isSavingDraft) return;
          
          try {
            setIsSavingDraft(true);
            
            const additionalData = {
              companyLogo,
              logoPreview,
              vendorConfig
            };
            
            const success = saveDraft(
              formId,
              formData,
              documentData,
              projectExperience,
              additionalData
            );
            
            if (success) {
              setLastSaved(new Date());
              setHasUnsavedChanges(false);
              
              if (showMessage) {
                setSubmissionSuccess(true);
                setSubmissionError(null);
                setTimeout(() => setSubmissionSuccess(false), 3000);
              }
            }
          } catch (error) {
            console.error('Error saving draft:', error);
            if (showMessage) {
              setSubmissionError({
                type: 'error',
                message: 'Failed to save draft. Please try again.'
              });
            }
          } finally {
            setIsSavingDraft(false);
          }
        };

        // Clear draft function
        const handleClearDraft = () => {
          if (window.confirm('Are you sure you want to clear this draft? This action cannot be undone.')) {
            if (formId) {
              deleteDraft(formId);
              setFormData({});
              setDocumentData({});
              setProjectExperience([]);
              setCompanyLogo(null);
              setLogoPreview(null);
              setHasUnsavedChanges(false);
              setLastSaved(null);
              setFormProgress(0);
              
              // Show confirmation
              setSubmissionError({
                type: 'info',
                message: 'Draft cleared successfully'
              });
              setTimeout(() => setSubmissionError(null), 3000);
            }
          }
        };

        useEffect(() => {
          if (initialData) {
            // Helper function to safely convert to comma-separated string
            const safeJoin = (value, fallback = '') => {
              if (!value) return fallback;
              if (Array.isArray(value)) return value.join(', ');
              if (typeof value === 'string') return value; // Already a string
              return String(value); // Fallback for other types
            };
        
            // A. Populate formData (Map API object to flat form state)
            setFormData(prev => ({
              ...prev,
              // Section A: Company Information (Updated keys)
              companyLegalName: initialData.companyLegalName || initialData.name || '',
              vendorId: initialData.vendorId || '',
              vendorType: initialData.vendorType || '',
              businessType: initialData.businessType || '',
              licenseNumber: initialData.licenseNumber || '',
              yearsInBusiness: initialData.yearsInBusiness || '',
              gosiEmployeeCount: initialData.gosiEmployeeCount || '',
              chamberClass: initialData.chamberClass || '',
              chamberRegion: initialData.chamberRegion || '',
              mainCategory: safeJoin(initialData.mainCategory), // Fixed: Safe join
              subCategory: initialData.subCategory || '',
              productsAndServices: safeJoin(initialData.productsAndServices), // Also fix this one
              csiSpecialization: initialData.csiSpecializationId || '',
              
              // Section B: Contact Information (Updated keys)
              contactPerson: initialData.contactPerson || '',
              contactPhone: initialData.contactPhone || '',
              contactEmail: initialData.contactEmail || '',
              website: initialData.website || '',
              addressStreet: initialData.addressStreet || '',
              addressCity: initialData.addressCity || '',
              addressRegion: initialData.addressRegion || '',
              addressCountry: initialData.addressCountry || '',
              primaryContactName: initialData.primaryContactName || '',
              primaryContactTitle: initialData.primaryContactTitle || '',
              technicalContactName: initialData.technicalContactName || '',
              technicalContactEmail: initialData.technicalContactEmail || '',
              financialContactName: initialData.financialContactName || '',
              financialContactEmail: initialData.financialContactEmail || '',
            }));
        
            // B. Populate projectExperience
            setProjectExperience(initialData.projectExperience || []);
        
            // C. Populate documentData
            const mappedDocs = (initialData.documents || []).reduce((acc, doc) => {
              acc[doc.docType] = {
                file: doc.url ? { name: doc.url.split('/').pop(), url: doc.url } : null,
                expiry: doc.expiryDate ? doc.expiryDate.split('T')[0] : '',
                number: doc.documentNumber || '',
                isoType: doc.isoType || '',
                existingUrl: doc.url,
              };
              return acc;
            }, {});
            setDocumentData(mappedDocs);
        
            // Handle logo from initial data if exists
            if (initialData.logo) {
              setLogoPreview(initialData.logo);
            }
          }
        }, [initialData]);



  // Update handleChange to include logo handling
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Handle logo upload separately
    if (name === 'companyLogo' && files && files[0]) {
      const logoFile = files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(logoFile.type)) {
        setSubmissionError({
          type: 'error',
          message: 'Please upload a valid image file (JPG, PNG, SVG)'
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (logoFile.size > 5 * 1024 * 1024) {
        setSubmissionError({
          type: 'error',
          message: 'Logo file size must be less than 5MB'
        });
        return;
      }

      setCompanyLogo(logoFile);
      // Create preview URL
      const previewUrl = URL.createObjectURL(logoFile);
      setLogoPreview(previewUrl);
      setHasUnsavedChanges(true);
      return;
    }
  
  // Update form data
  if (!name.includes("_")) {
    // Handle file inputs from new sections
    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // If vendor type changes, reset dependent sections
    if (name === 'vendorType') {
      setFormData(prev => ({
        ...prev,
        majorBrands: '',
        authorizationLevel: '',      
      }));
    }
  } else {
    // Handle document fields (existing logic)
    const docKey = name.replace("_file", "").replace("_expiry", "").replace("_number", "");
    let docField;
    if (name.endsWith("_file")) docField = "file";
    else if (name.endsWith("_expiry")) docField = "expiry";
    else if (name.endsWith("_number")) docField = "number";
    
    setDocumentData(prev => ({
      ...prev,
      [docKey]: {
        ...prev[docKey],
        [docField]: type === "file" ? files[0] : value,
      }
    }));
  }
  
  setHasUnsavedChanges(true);
};


// Create Company Identity Section Component
const CompanyIdentitySection = () => (
  <section className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
    <SectionHeader title="Company Identity" icon={Building2} />
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Logo *
            <span className="text-xs text-gray-500 ml-2">(Required for branding)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer bg-white">
            <input
              type="file"
              name="companyLogo"
              accept=".jpg,.jpeg,.png,.svg"
              onChange={handleChange}
              className="hidden"
              id="logo-upload"
              disabled={!isEditable}
            />
            <label htmlFor="logo-upload" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center py-4">
                <Image className="w-10 h-10 text-blue-500 mb-2" />
                <p className="text-sm text-gray-600">
                  {companyLogo ? companyLogo.name : 'Click to upload company logo'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, SVG (Max 5MB)
                </p>
                <button
                  type="button"
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {companyLogo ? 'Change Logo' : 'Upload Logo'}
                </button>
              </div>
            </label>
          </div>
          
          {/* Logo Requirements */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">Requirements:</p>
            <ul className="text-xs text-blue-600 mt-1 space-y-1">
              <li>• Square format recommended (1:1 aspect ratio)</li>
              <li>• Minimum 300×300 pixels</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Logo will appear in your vendor profile header</li>
            </ul>
          </div>
        </div>
        
        {/* Logo Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo Preview
            <span className="text-xs text-gray-500 ml-2">(How it will appear)</span>
          </label>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-inner">
            <div className="flex flex-col items-center justify-center h-40">
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Company Logo Preview" 
                    className="max-h-32 max-w-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="text-center">
                          <Image class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p class="text-sm text-gray-500">Invalid image file</p>
                        </div>
                      `;
                    }}
                  />
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => {
                        setCompanyLogo(null);
                        setLogoPreview(null);
                        // Revoke object URL to prevent memory leaks
                        if (logoPreview && logoPreview.startsWith('blob:')) {
                          URL.revokeObjectURL(logoPreview);
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      title="Remove logo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No logo uploaded</p>
                  <p className="text-xs text-gray-400 mt-1">Preview will appear here</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Logo Usage Note */}
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">
              <span className="font-medium">Note:</span> Your logo will be displayed in the vendor header and admin review panel for brand recognition.
            </p>
          </div>
        </div>
      </div>
      
      {/* Company Profile Document Note */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <FileText className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Company Profile Document
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Don't forget to upload your Company Profile PDF in Section C (Document Management). 
              This is required for complete qualification.
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              The Company Profile PDF will appear alongside your logo in the admin review panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);


const getVendorTypeDisplayName = (vendorTypeValue) => {
  const mapping = {
    'ServiceProvider': 'Service Provider',
    'GeneralContractor': 'General Contractor',
    'TestingCommissioning': 'Testing & Commissioning',
    'EngineeringOffice': 'Engineering Office',
    'FactoryRepresentative': 'Factory Representative',
    'SpecialistContractor': 'Specialist Contractor'
  };
  
  return mapping[vendorTypeValue] || 
         vendorTypeValue?.replace(/([A-Z])/g, ' $1').trim() || 
         vendorTypeValue;
};

// --- NEW: Additional Section Components ---
  
  // Brands Section for Suppliers/Manufacturers/Distributors
  const BrandsSection = () => (
    <section className="p-6 bg-white rounded-xl border border-gray-200 mt-6">
      <SectionHeader title="Brands Represented" icon={Package} />
      <div className="space-y-4">
        <FormInput 
          label="Major Brands" 
          name="majorBrands" 
          placeholder="e.g., Siemens, Schneider, ABB" 
          value={formData.majorBrands || ''} 
          onChange={handleChange}
          colSpan={2}
        />
        <FormInput 
          label="Authorization Level" 
          name="authorizationLevel" 
          type="select"
          value={formData.authorizationLevel || ''} 
          onChange={handleChange}
        >
          <option value="">-- Select Authorization --</option>
          <option value="Authorized Distributor">Authorized Distributor</option>
          <option value="Authorized Dealer">Authorized Dealer</option>
          <option value="Exclusive Distributor">Exclusive Distributor</option>
          <option value="Value Added Reseller">Value Added Reseller</option>
        </FormInput>
        <FormInput 
          label="Authorization Letters Available" 
          name="authLettersAvailable" 
          type="select"
          value={formData.authLettersAvailable || ''} 
          onChange={handleChange}
        >
          <option value="">-- Select --</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </FormInput>
      </div>
    </section>
  );

  // Product Categories Section
  const ProductCategoriesSection = () => (
    <section className="p-6 bg-white rounded-xl border border-gray-200 mt-6">
      <SectionHeader title="Product Categories" icon={Package} />
      <div className="space-y-4">
        <FormInput 
          label="Primary Product Categories" 
          name="primaryProductCategories" 
          placeholder="e.g., Electrical, HVAC, Plumbing, Fire Safety" 
          value={formData.primaryProductCategories || ''} 
          onChange={handleChange}
          colSpan={2}
        />
        <FormInput 
          label="Country of Origin (Main Products)" 
          name="countryOfOrigin" 
          placeholder="e.g., Germany, USA, China, Saudi Arabia" 
          value={formData.countryOfOrigin || ''} 
          onChange={handleChange}
        />
        <FormInput 
          label="Local Manufacturing Capacity" 
          name="localManufacturing" 
          type="select"
          value={formData.localManufacturing || ''} 
          onChange={handleChange}
        >
          <option value="">-- Select --</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
          <option value="Partial">Partial Assembly</option>
        </FormInput>
      </div>
    </section>
  );

  // CV Upload Section for Service Providers/Consultants
  const CVUploadSection = () => (
    <section className="p-6 bg-white rounded-xl border border-gray-200 mt-6">
      <SectionHeader title="Professional CV & Credentials" icon={UserCheck} />
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput 
            label="Lead Consultant CV" 
            name="leadConsultantCV" 
            type="file"
            onChange={handleChange}
            colSpan={1}
          />
          <div className="flex items-end">
            {formData.leadConsultantCV && (
              <span className="text-sm text-green-600">✓ CV uploaded</span>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Team Members
          </label>
          <textarea 
            name="keyTeamMembers"
            value={formData.keyTeamMembers || ''}
            onChange={handleChange}
            placeholder="List key team members with their qualifications and experience..."
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm h-32"
            rows={4}
          />
        </div>
        
        <FormInput 
          label="Company Résumé (PDF)" 
          name="companyResume" 
          type="file"
          onChange={handleChange}
          colSpan={2}
        />
      </div>
    </section>
  );

  // Past Assignments Section
  const PastAssignmentsSection = () => (
    <section className="p-6 bg-white rounded-xl border border-gray-200 mt-6">
      <SectionHeader title="Past Assignments & References" icon={Briefcase} />
      <div className="space-y-4">
        <FormInput 
          label="Number of Similar Projects Completed" 
          name="similarProjectsCount" 
          type="number"
          placeholder="e.g., 10"
          value={formData.similarProjectsCount || ''} 
          onChange={handleChange}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Details
          </label>
          <textarea 
            name="assignmentDetails"
            value={formData.assignmentDetails || ''}
            onChange={handleChange}
            placeholder="Describe your past relevant assignments, clients, and project outcomes..."
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm h-32"
            rows={4}
          />
        </div>
        
        <FormInput 
          label="Client References Available" 
          name="clientReferences" 
          type="select"
          value={formData.clientReferences || ''} 
          onChange={handleChange}
        >
          <option value="">-- Select --</option>
          <option value="Yes">Yes (Available upon request)</option>
          <option value="No">No</option>
          <option value="Confidential">Confidential</option>
        </FormInput>
      </div>
    </section>
  );

// Update handleSubmit to include logo
const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  setIsSubmitting(true);
  setSubmissionError(null);
  setSubmissionSuccess(false);

  // === VALIDATION 1: Logo validation ===
  if (!companyLogo && !logoPreview) {
    setSubmissionError("Company Logo is required. Please upload your company logo.");
    setIsSubmitting(false);
    return;
  }

  // === VALIDATION 2: Project Experience for mandatory types ===
  if (vendorConfig.isProjectExperienceMandatory && projectExperience.length === 0) {
    setSubmissionError("Project Experience is mandatory for this vendor type. Please add at least one project.");
    setIsSubmitting(false);
    return;
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No token found. Please log in.");
    setSubmissionError("No token found. Please log in.");
    setIsSubmitting(false);
    return;
  }

  // === VALIDATION 3: Zod validation with all form data ===
  const dataToValidate = {
    ...formData,
    documentData: documentData,
    projectExperience: projectExperience,
    logoUrl: !companyLogo && logoPreview ? logoPreview : null,
  };

  try {
    // This will now validate:
    // 1. Phone number format (Saudi format)
    // 2. Email domain matching company name
    // 3. Expired documents
    // 4. Document completeness
    // 5. All field validations from schema
    VendorQualificationSchema.parse(dataToValidate);

  } catch (validationError) {
    console.error("Validation failed:", validationError);
    
    if (validationError instanceof z.ZodError) {
      // Format Zod errors for form fields
      const fieldErrors = validationError.errors.reduce((acc, current) => {
        const fieldName = current.path[0];
        // Map schema field names to form field names if needed
        const formFieldName = fieldName === 'contactEmail' ? 'contactEmail' : fieldName;
        acc[formFieldName] = current.message;
        return acc;
      }, {});
      setErrors(fieldErrors);
      
      // Check for specific error types
      const expiredDocError = validationError.errors.find(err => 
        err.message.includes('expired') || err.message.includes('Expiry')
      );
      const emailDomainError = validationError.errors.find(err => 
        err.message.includes('Email domain should match')
      );
      const phoneError = validationError.errors.find(err => 
        err.message.includes('Saudi mobile number')
      );
      
      if (expiredDocError) {
        setSubmissionError("One or more documents have expired. Please update them before submission.");
      } else if (emailDomainError) {
        setSubmissionError("Please use a company email address that matches your company name.");
      } else if (phoneError) {
        setSubmissionError("Please enter a valid Saudi mobile number (e.g., 05xxxxxxxx, +9665xxxxxxxx).");
      } else {
        setSubmissionError("Please correct the validation errors in the form.");
      }
    } else {
      setSubmissionError(validationError.message);
    }
    
    setIsSubmitting(false);
    return;
  }

  // === VALIDATION 4: Mandatory documents check (vendor-specific) ===
  const mandatoryDocs = getMandatoryDocsForVendorType(formData.vendorType);
  const missingMandatoryDocs = mandatoryDocs.filter(docKey => {
    const docEntry = documentData[docKey];
    return !docEntry || !docEntry.file;
  });

  if (missingMandatoryDocs.length > 0) {
    const missingDocNames = missingMandatoryDocs.map(key => 
      DOCUMENT_CHECKLIST_REFERENCE[key]?.label || key
    );
    setSubmissionError(`Missing mandatory documents: ${missingDocNames.join(', ')}`);
    setIsSubmitting(false);
    return;
  }

  // === VALIDATION 5: Duplicate license check (requires backend API) ===
  // This should be implemented when backend is ready
  /*
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const checkResponse = await fetch(`${apiUrl}/api/vendor/check-license`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        licenseNumber: formData.licenseNumber,
        vendorId: formData.vendorId // For updates, exclude current vendor
      }),
    });
    
    if (!checkResponse.ok) {
      const checkResult = await checkResponse.json();
      if (checkResult.exists) {
        setSubmissionError("This Commercial Registration (CR) number is already registered in our system.");
        setIsSubmitting(false);
        return;
      }
    }
  } catch (err) {
    console.error("License check failed:", err);
    // Continue with submission if check fails (don't block user)
  }
  */

  // === PREPARE FORM DATA FOR SUBMISSION ===
  const finalFormData = new FormData();
  
  // Add logo file if exists
  if (companyLogo) {
    finalFormData.append('companyLogo', companyLogo, companyLogo.name);
  }

  // Prepare vendor data
  finalFormData.append('vendorData', JSON.stringify({
    ...formData,
    yearsInBusiness: parseInt(formData.yearsInBusiness) || 0,
    gosiEmployeeCount: parseInt(formData.gosiEmployeeCount) || 0,
    mainCategory: formData.mainCategory?.split(',').map(s => s.trim()).filter(s => s.length > 0) || [],
    productsAndServices: formData.productsAndServices?.split(',').map(s => s.trim()).filter(s => s.length > 0) || [],
    documentData: Object.keys(documentData).map(key => ({
      docType: key,
      documentNumber: documentData[key].number,
      expiryDate: documentData[key].expiry,
      isoType: documentData[key].isoType,
    })),
    projectExperience: projectExperience.map(p => ({
      ...p,
      contractValue: parseFloat(p.contractValue)
    })),
    logoUrl: !companyLogo && logoPreview ? logoPreview : null,
  }));

  // Add document files
  Object.keys(documentData).forEach(docKey => {
    const file = documentData[docKey].file;
    if (file) {
      finalFormData.append(`file_${docKey}`, file, file.name);
    }
  });

  // Add project files
  projectExperience.forEach((project, index) => {
    if (project.completionFile && project.completionFile[0]) {
      const file = project.completionFile[0];
      finalFormData.append(`project_file_${index}`, file, file.name);
    }
  });

 // === SUBMIT TO API ===
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log("🌍 API URL being used:", apiUrl);
      const response = await fetch(`${apiUrl}/api/vendor/qualification/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: finalFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific backend errors
        if (result.error?.includes('duplicate') || result.error?.includes('already exists')) {
          setSubmissionError({
            type: 'error',
            message: "This license number is already registered. Please use a different license number."
          });
        } else {
          throw new Error(result.error || 'Server processing error occurred.');
        }
      }

      // Success handling
      if (result.success) {
        setSubmissionSuccess(true);
        
        // Clear draft on successful submission
        if (formId) {
          deleteDraft(formId);
        }
      
      // Start approval workflow
      try {
        const workflowResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/approvals/start`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            entityType: 'VENDOR',
            entityId: result.data.id,
            workflowTemplateId: 'vendor-qualification-workflow'
          })
        });

        const workflowResult = await workflowResponse.json();
        if (workflowResult.success) {
          console.log('✅ Approval workflow started successfully');
        }
      } catch (workflowError) {
        console.error('⚠️ Could not start approval workflow:', workflowError);
      }

      // Reset form or redirect
      if (onSuccess) {
        onSuccess(); 
        setFormData({});
        setDocumentData({});
        setProjectExperience([]);
        setHasUnsavedChanges(false);
        setLastSaved(null);
      } else {
        setTimeout(() => {
          router.push('/vendor/submission-tracker');
        }, 3000);
      }
    }

  } catch (error) {
    console.error("API Submission Error:", error);
    setSubmissionError({
      type: 'error',
      message: error.message
    });
    setSubmissionSuccess(false);
  } finally {
    setIsSubmitting(false);
  }
};

return (
  <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200">
      
      {/* UPDATED HEADER WITH LOGO */}
      <header className="mb-8 relative">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          {/* Logo on Left */}
          <div className="flex items-center space-x-4">
            {logoPreview ? (
              <div className="w-16 h-16 rounded-lg border-2 border-blue-200 bg-white p-1 shadow-sm">
                <img 
                  src={logoPreview} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                        <Building2 class="w-8 h-8 text-gray-400" />
                      </div>
                    `;
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                Vendor Qualification Form
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Complete all sections to submit your company for qualification.
                <span className="font-semibold text-blue-600 ml-1">
                  Form adapts based on your vendor type selection.
                </span>
              </p>
            </div>
          </div>
          
          {/* Draft Controls and Status */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Vendor Type Badge */}
            {formData.vendorType && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                <span className="font-medium">Type: </span>
                {getVendorTypeDisplayName(formData.vendorType)}
              </div>
            )}
            
            {/* Draft Status Indicator */}
            <div className="relative">
              <button
                onClick={() => setShowDraftMenu(!showDraftMenu)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Draft {formProgress}%
                  </span>
                  {hasUnsavedChanges && (
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  )}
                </div>
              </button>
              {/* Draft Menu */}
              {showDraftMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Draft Options</span>
                      {lastSaved && (
                        <span className="text-xs text-gray-500">
                          Saved {getRelativeTime(lastSaved)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        handleSaveDraft(true);
                        setShowDraftMenu(false);
                      }}
                      disabled={isSavingDraft || !hasUnsavedChanges}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={14} />
                      {isSavingDraft ? 'Saving...' : 'Save Draft Now'}
                    </button>
                    
                    <button
                      onClick={() => {
                        // Reload draft
                        const draft = loadDraft(formId);
                        if (draft) {
                          loadDraftData(draft);
                        }
                        setShowDraftMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                    >
                      <Clock size={14} />
                      Reload Last Saved
                    </button>
                    
                    <button
                      onClick={() => {
                        handleClearDraft();
                        setShowDraftMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                      Clear Draft
                    </button>
                  </div>
                  
                  <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <div className="text-xs text-gray-600">
                      <div className="flex justify-between mb-1">
                        <span>Auto-save:</span>
                        <span className={hasUnsavedChanges ? 'text-yellow-600' : 'text-green-600'}>
                          {hasUnsavedChanges ? 'Pending' : 'Up to date'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${formProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Draft Status Bar */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">
                  {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
                </span>
              </div>
              
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Clock size={12} />
                  Last saved: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Progress: <span className="font-medium text-gray-800">{formProgress}%</span>
              </div>
              
              <button
                onClick={() => handleSaveDraft(true)}
                disabled={isSavingDraft || !hasUnsavedChanges}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {isSavingDraft ? 'Saving...' : 'Save Now'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Logo Upload Reminder */}
        {!companyLogo && !logoPreview && (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              <span className="font-medium">⚠️ Required:</span> Upload your company logo in the "Company Identity" section below.
            </p>
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Submission Feedback - UPDATED FOR DRAFT MESSAGES */}
        {submissionSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <div>
                <strong className="font-semibold">✅ Success!</strong>
                <span className="ml-2">
                  {submissionSuccess === true 
                    ? 'Your qualification has been submitted and is pending review.'
                    : 'Draft saved successfully!'}
                </span>
              </div>
            </div>
          </div>
        )}

        {submissionError && (
          <div className={`px-4 py-3 rounded-lg mb-6 ${
            submissionError.type === 'error' 
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center gap-2">
              {submissionError.type === 'error' ? (
                <AlertCircle size={18} />
              ) : (
                <Clock size={18} />
              )}
              <div>
                <strong className="font-semibold">
                  {submissionError.type === 'error' ? '❌ Error!' : 'ℹ️ Info'}
                </strong>
                <span className="ml-2">{submissionError.message}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* NEW: Company Identity Section - Added at the top */}
        <CompanyIdentitySection />
        
        {/* A. Company Information - Now comes after Company Identity */}
        <section className="bg-blue-50/30 p-6 rounded-xl border border-blue-200">
          <SectionHeader title="A. Company Information" icon={Building2} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <FormInput 
                label="Vendor ID" 
                name="vendorId" 
                placeholder="Auto-Generated" 
                disabled 
                value={formData.vendorId || 'TBD'} 
              />
              
              <FormInput 
                label="Company Legal Name" 
                name="companyLegalName" 
                placeholder="Enter full legal name" 
                required 
                value={formData.companyLegalName || ''} 
                onChange={handleChange} 
                error={errors.companyLegalName} 
              />
              
              <FormInput 
                label="License Number" 
                name="licenseNumber" 
                placeholder="Business License Number" 
                required 
                value={formData.licenseNumber || ''} 
                onChange={handleChange} 
                error={errors.licenseNumber} 
              />

               {/* VENDOR TYPE SELECTION - CRITICAL FOR DYNAMIC FORM */}
               <FormInput 
                label="Vendor Type *" 
                name="vendorType" 
                type="select" 
                required 
                value={formData.vendorType || ''} 
                onChange={handleChange} 
                error={errors.vendorType}
              >
                <option value="">-- Select Vendor Type --</option>
                {VENDOR_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </FormInput>
              {/* Dynamic note based on vendor type */}
              {formData.vendorType && (
                <div className="md:col-span-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Note: </span>
                    Selecting <strong>{VENDOR_TYPES.find(v => v.value === formData.vendorType)?.label}</strong> will {
                      vendorConfig.showProjectExperience 
                        ? 'require Project Experience details' 
                        : 'show Supplier-specific sections'
                    }.
                  </p>
                </div>
              )}

              <FormInput 
                label="Business Type" 
                name="businessType" 
                type="select" 
                value={formData.businessType || ''} 
                onChange={handleChange} 
                error={errors.businessType}
              >
                <option value="">-- Select Business Type --</option>
                {BUSINESS_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </FormInput>

              <FormInput 
                label="Years in Business" 
                name="yearsInBusiness" 
                type="number" 
                placeholder="Number of years" 
                required 
                value={formData.yearsInBusiness || ''} 
                onChange={handleChange} 
                error={errors.yearsInBusiness} 
              />
              
              <FormInput 
                label="GOSI Employee Count" 
                name="gosiEmployeeCount" 
                type="number" 
                placeholder="Total employees" 
                required 
                value={formData.gosiEmployeeCount || ''} 
                onChange={handleChange} 
                error={errors.gosiEmployeeCount} 
              />
              
              <FormInput 
                label="Chamber of Commerce Cert." 
                name="chamberClass" 
                type="select" 
                value={formData.chamberClass || ''} 
                onChange={handleChange} 
                error={errors.chamberClass}
              >
                <option value="">-- Select Classification --</option>
                {CHAMBER_CERTIFICATES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </FormInput>
              
              <FormInput 
                label="Chamber Region/City" 
                name="chamberRegion" 
                placeholder="Region/City" 
                required={!!formData.chamberClass} 
                value={formData.chamberRegion || ''} 
                onChange={handleChange} 
                error={errors.chamberRegion} 
              />
              
              {/* Full width fields */}
              <div className="md:col-span-2 lg:col-span-3">
                <FormInput 
                  label="Main Categories" 
                  name="mainCategory" 
                  placeholder={`Comma-separated (e.g., ${MAIN_CATEGORIES.slice(0, 3).join(', ')})`}
                  value={formData.mainCategory || ''} 
                  onChange={handleChange}
                  error={errors.mainCategory}
                />
              </div>

              <FormInput 
                label="Sub-Category / Specialization" 
                name="subCategory" 
                placeholder="e.g., High-rise glazing" 
                value={formData.subCategory || ''} 
                onChange={handleChange}
                error={errors.subCategory}
              />
              
              <div className="md:col-span-2">
                <FormInput 
                  label="Products & Services" 
                  name="productsAndServices" 
                  placeholder="Comma-separated list (Mandatory)" 
                  required
                  value={formData.productsAndServices || ''} 
                  onChange={handleChange}
                  error={errors.productsAndServices}
                />
              </div>
              
              <FormInput 
                label="CSI Specialization" 
                name="csiSpecialization" 
                placeholder="e.g., 09 30 00 - Tiling" 
                value={formData.csiSpecialization || ''} 
                onChange={handleChange}
                error={errors.csiSpecialization}
              />
            </div>
          </section>

          {/* B. Contact Information - IMPROVED LAYOUT */}
          <section className="p-6 bg-white rounded-xl border border-gray-200">
            <SectionHeader title="B. Contact Information" icon={FileText} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <FormInput 
                label="Primary Contact Name" 
                name="primaryContactName" 
                placeholder="Full Name" 
                required 
                value={formData.primaryContactName || ''} 
                onChange={handleChange} 
                error={errors.primaryContactName} 
              />
              
              <FormInput 
                label="Primary Contact Title" 
                name="primaryContactTitle" 
                placeholder="Title" 
                required 
                value={formData.primaryContactTitle || ''} 
                onChange={handleChange} 
                error={errors.primaryContactTitle} 
              />
              
              <FormInput 
                label="Contact Person" 
                name="contactPerson" 
                placeholder="Person filling the form" 
                required 
                value={formData.contactPerson || ''} 
                onChange={handleChange} 
                error={errors.contactPerson} 
              />
              
              <FormInput 
                label="Phone Number" 
                name="contactPhone" 
                type="tel" 
                placeholder="+966 5x xxx xxxx" 
                required 
                value={formData.contactPhone || ''} 
                onChange={handleChange} 
                error={errors.contactPhone} 
              />
              
              <FormInput 
                label="Email Address" 
                name="contactEmail" 
                type="email" 
                placeholder="contact@company.com" 
                required 
                value={formData.contactEmail || ''} 
                onChange={handleChange} 
                error={errors.contactEmail} 
              />
              
              <FormInput 
                label="Company Website" 
                name="website" 
                type="url" 
                placeholder="https://www.company.com" 
                value={formData.website || ''} 
                onChange={handleChange} 
                error={errors.website} 
              />
              
              <FormInput 
                label="Technical Contact Name" 
                name="technicalContactName" 
                placeholder="Name" 
                value={formData.technicalContactName || ''} 
                onChange={handleChange} 
                error={errors.technicalContactName} 
              />
              
              <FormInput 
                label="Technical Contact Email" 
                name="technicalContactEmail" 
                type="email" 
                placeholder="Email" 
                value={formData.technicalContactEmail || ''} 
                onChange={handleChange} 
                error={errors.technicalContactEmail} 
              />
              
              <FormInput 
                label="Financial Contact Name" 
                name="financialContactName" 
                placeholder="Name" 
                value={formData.financialContactName || ''} 
                onChange={handleChange} 
                error={errors.financialContactName} 
              />
              
              <FormInput 
                label="Financial Contact Email" 
                name="financialContactEmail" 
                type="email" 
                placeholder="Email" 
                value={formData.financialContactEmail || ''} 
                onChange={handleChange} 
                error={errors.financialContactEmail} 
              />

              {/* Address Fields */}
              <FormInput 
                label="Street Address" 
                name="addressStreet" 
                placeholder="Street / PO Box" 
                required 
                value={formData.addressStreet || ''} 
                onChange={handleChange} 
                error={errors.addressStreet} 
              />
              
              <FormInput 
                label="City" 
                name="addressCity" 
                placeholder="City" 
                required 
                value={formData.addressCity || ''} 
                onChange={handleChange} 
                error={errors.addressCity} 
              />
              
              <FormInput 
                label="Region/State" 
                name="addressRegion" 
                placeholder="Region/State" 
                required 
                value={formData.addressRegion || ''} 
                onChange={handleChange} 
                error={errors.addressRegion} 
              />
              
              <FormInput 
                label="Country" 
                name="addressCountry" 
                placeholder="Country" 
                required 
                value={formData.addressCountry || ''} 
                onChange={handleChange} 
                error={errors.addressCountry} 
              />
            </div>
          </section>

          {/* C. Advanced Document Management */}
          <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <SectionHeader title="C. Advanced Document Management" icon={CheckCircle} />

            {formData.vendorType && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                <span className="font-medium">Selected: </span>
                {getVendorTypeDisplayName(formData.vendorType)}
              </div>
            )}
            
            {/* Vendor type specific note */}
            {formData.vendorType && vendorConfig.hiddenDocuments.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <span className="font-semibold">Document Note: </span>
                  Some documents are hidden because they don't apply to {
                    VENDOR_TYPES.find(v => v.value === formData.vendorType)?.label
                  } vendors.
                </p>
              </div>
            )}
            
            {/* Enhanced Document Manager - Now with vendor type filtering */}
            <EnhancedQualificationDocumentManager 
              documentData={documentData}
              setDocumentData={setDocumentData}
              isEditable={isEditable}
              vendorType={formData.vendorType}
              vendorConfig={vendorConfig}
            />
          </section>

          {/* D. Project Experience - CONDITIONAL RENDERING */}
          {vendorConfig.showProjectExperience && (
            <section className="p-6 bg-white rounded-xl border border-gray-200">
              <SectionHeader title="D. Project Experience" icon={FileText} />
              {vendorConfig.isProjectExperienceMandatory && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ This section is <strong>MANDATORY</strong> for {formData.vendorType} vendors.
                  </p>
                </div>
              )}
              <ProjectExperienceTable 
                projects={projectExperience}   
                setProjects={setProjectExperience} 
              />
            </section>
          )}

          {/* E. Dynamic Sections Based on Vendor Type */}

          {/* Brands Section for Suppliers/Manufacturers/Distributors */}
          {vendorConfig.showBrandsSection && <BrandsSection />}

          {/* Product Categories Section */}
          {vendorConfig.showBrandsSection && <ProductCategoriesSection />}

          {/* CV Upload Section for Service Providers/Consultants */}
          {vendorConfig.showCVSection && <CVUploadSection />}

          {/* Past Assignments Section */}
          {vendorConfig.showCVSection && <PastAssignmentsSection />}

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {isEditable && (
              <>
                <button
                  type="button"
                  onClick={() => handleSaveDraft(true)}
                  disabled={isSavingDraft || !hasUnsavedChanges}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition duration-150 ${
                    isSavingDraft || !hasUnsavedChanges
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <Save size={18} />
                  {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                </button>
                
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-red-600 bg-red-50 hover:bg-red-100 transition duration-150"
                >
                  <Trash2 size={18} />
                  Clear Form
                </button>
              </>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Completion: <span className="font-medium text-gray-800">{formProgress}%</span>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
            </div>
            
            {isEditable && (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 font-semibold text-white transition duration-150 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Qualification
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  </div>
);
}