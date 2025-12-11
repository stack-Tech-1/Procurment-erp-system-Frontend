"use client";
import { useState, useEffect } from "react"; 
import { z } from 'zod';
import { Building2, FileText, CheckCircle, Send, Plus, Trash2, Calendar, Hash, Upload, Package, UserCheck, Briefcase } from "lucide-react";
import ProjectExperienceTable from "../components/ProjectExperienceTable.js";
import { VendorQualificationSchema, DocumentEntrySchema, MANDATORY_DOCS } from '@/lib/validation/vendorQualificationSchema.js'; 
import EnhancedQualificationDocumentManager from '@/components/EnhancedQualificationDocumentManager';
import { useRouter } from 'next/navigation';


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
  
  const router = useRouter();

  // Get current vendor type configuration
  const vendorConfig = getVendorTypeConfig(formData.vendorType);

   // 2. 🔑 ADD useEffect TO POPULATE STATE FROM initialData
useEffect(() => {
  if (initialData) {
      // A. Populate formData (Map API object to flat form state)
      setFormData(prev => ({
          ...prev,
          // Section A: Company Information (Updated keys)
          companyLegalName: initialData.companyLegalName || initialData.name || '', // Use new key, fallback to old key 'name'
          vendorId: initialData.vendorId || '', // Read-only
          vendorType: initialData.vendorType || '',
          businessType: initialData.businessType || '',
          licenseNumber: initialData.licenseNumber || '',
          yearsInBusiness: initialData.yearsInBusiness || '',
          gosiEmployeeCount: initialData.gosiEmployeeCount || '',
          chamberClass: initialData.chamberClass || '',
          chamberRegion: initialData.chamberRegion || '',
          mainCategory: initialData.mainCategory?.join(', ') || '', // Convert array to comma-separated string for Text Input
          subCategory: initialData.subCategory || '',
          productsAndServices: initialData.productsAndServices?.join(', ') || '',
          csiSpecialization: initialData.csiSpecializationId || '', // Use the ID for lookup
          
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
          technicalContactName: initialData.technicalContactName || '', // NEW FIELD
          technicalContactEmail: initialData.technicalContactEmail || '', // NEW FIELD
          financialContactName: initialData.financialContactName || '', // NEW FIELD
          financialContactEmail: initialData.financialContactEmail || '', // NEW FIELD
          
          // Old generic fields are now deprecated/removed
      }));

      // B. Populate projectExperience
      setProjectExperience(initialData.projectExperience || []);

      // C. Populate documentData
      const mappedDocs = (initialData.documents || []).reduce((acc, doc) => {
          acc[doc.docType] = {
              file: doc.url ? { name: doc.url.split('/').pop(), url: doc.url } : null,
              expiry: doc.expiryDate ? doc.expiryDate.split('T')[0] : '',
              number: doc.documentNumber || '',
              // Capture new fields from Document model
              isoType: doc.isoType || '', 
              existingUrl: doc.url,
          };
          return acc;
      }, {});
      setDocumentData(mappedDocs);
  }
}, [initialData]);




const handleChange = (e) => {
  const { name, value, type, files } = e.target;
  
  // Update form data
  if (!name.includes("_")) {
    // Handle file inputs from new sections
    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0], // Store the file object
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

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  setIsSubmitting(true);
  setSubmissionError(null);
  setSubmissionSuccess(false);

  // --- 🔑 NEW: Project Experience Mandatory Check ---  
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

  console.log("🔑 Token being sent:", token);



  // --- 🔑 START: Zod Validation Step ---
  // 1. Map your state data to match the Zod schema's expected structure
  const dataToValidate = {
      // Main Form Fields from formData (assuming state keys match Zod schema names)
      ...formData,
      
      // Documents: Zod expects the key-value object, NOT the mapped array metadata
      documentData: documentData, 
      
      // Projects: Zod expects the array
      projectExperience: projectExperience,
      
      // You may need to map state keys that don't perfectly match Zod (e.g., if Zod uses 'crNumber' but state uses 'licenseNumber')
      // contactPhone: formData.phoneNumber, // Example mapping
      // contactEmail: formData.emailAddress, // Example mapping
      // ...
  };

  try {
      // 2. Validate the data
      VendorQualificationSchema.parse(dataToValidate);

      // 3. Mandatory Documents Check (Since Zod structure doesn't enforce key presence)
      const missingDocs = MANDATORY_DOCS.filter(docKey => {
          const docEntry = documentData[docKey];
          // Check if the document key is mandatory AND is missing the file object
          return docEntry && (!docEntry.file || docEntry.file.length === 0);
      });

      if (missingDocs.length > 0) {
          // Set an error for the document section and throw to stop submission
          const errorMessage = `Missing mandatory documents: ${missingDocs.join(', ')}.`;
          setSubmissionError(errorMessage);
          throw new Error(errorMessage);
      }

  } catch (validationError) {
      // This block catches Zod errors and custom errors
      console.error("Validation failed:", validationError);
      
      if (validationError instanceof z.ZodError) {
          // Reformat Zod errors to set form-specific error state (setErrors)
          const fieldErrors = validationError.errors.reduce((acc, current) => {
              // Use the first part of the path (the field name)
              const fieldName = current.path[0]; 
              acc[fieldName] = current.message;
              return acc;
          }, {});
          setErrors(fieldErrors);
          setSubmissionError("Please correct the validation errors in the form.");
      } else {
          setSubmissionError(validationError.message);
      }
      
      setIsSubmitting(false);
      return; // STOP SUBMISSION
  }




  // --- INSIDE handleSubmit, replace the existing finalFormData.append('vendorData', ...) block ---
      const finalFormData = new FormData();
      finalFormData.append('vendorData', JSON.stringify({
          ...formData,
          yearsInBusiness: parseInt(formData.yearsInBusiness) || 0,
          gosiEmployeeCount: parseInt(formData.gosiEmployeeCount) || 0,
          
          // --- 🔑 NEW: Map Comma-Separated Strings to Arrays ---
          mainCategory: formData.mainCategory?.split(',').map(s => s.trim()).filter(s => s.length > 0) || [],
          productsAndServices: formData.productsAndServices?.split(',').map(s => s.trim()).filter(s => s.length > 0) || [],
          
          // --- End of new mapping ---
          
          documentData: Object.keys(documentData).map(key => ({
              docType: key,
              documentNumber: documentData[key].number,
              expiryDate: documentData[key].expiry,
              // Include new document fields
              isoType: documentData[key].isoType, // If you used a dedicated key for ISO type
          })),
          
          projectExperience: projectExperience.map(p => ({
              ...p,
              contractValue: parseFloat(p.contractValue)
          })),
      }));

  Object.keys(documentData).forEach(docKey => {
      const file = documentData[docKey].file;
      if (file) {
          finalFormData.append(`file_${docKey}`, file, file.name);
      }
  });

  projectExperience.forEach((project, index) => {
      if (project.completionFile && project.completionFile[0]) {
          const file = project.completionFile[0];
          finalFormData.append(`project_file_${index}`, file, file.name);
      }
  });

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
          throw new Error(result.error || 'Server processing error occurred.');
      }

      // ✅ NEW CODE - Replace with this:
if (result.success) {
  setSubmissionSuccess(true);
  
  // Start approval workflow for the new vendor
  try {
    const token = localStorage.getItem('authToken');
    const workflowResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/approvals/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entityType: 'VENDOR',
        entityId: result.data.id, // This should be the created vendor ID from your API response
        workflowTemplateId: 'vendor-qualification-workflow'
      })
    });

    const workflowResult = await workflowResponse.json();
    if (workflowResult.success) {
      console.log('✅ Approval workflow started successfully');
    } else {
      console.warn('⚠️ Approval workflow response:', workflowResult);
    }
  } catch (workflowError) {
    console.error('⚠️ Could not start approval workflow:', workflowError);
    // Don't fail the main submission if workflow fails
  }

  // Reset form or redirect as needed
  if (onSuccess) {
    onSuccess(); 
    setFormData({});
    setDocumentData({});
    setProjectExperience([]);
  } else {
    setTimeout(() => {
      router.push('/vendor/submission-tracker');
    }, 3000);
  }
}

  } catch (error) {
      console.error("API Submission Error:", error);
      setSubmissionError(error.message);
      setSubmissionSuccess(false);
  } finally {
      setIsSubmitting(false);
  }
};

return (
  <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-200">
      
      <header className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Vendor Qualification Form
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Complete all sections to submit your company for qualification. 
          <span className="font-semibold text-blue-600 ml-1">
            Form adapts based on your vendor type selection.
          </span>
        </p>
        {formData.vendorType && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
            <span className="font-medium">Selected: </span>
            {VENDOR_TYPES.find(v => v.value === formData.vendorType)?.label || formData.vendorType}
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">

          {/* Submission Feedback */}
          {submissionSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <strong className="font-semibold">✅ Success!</strong>
              <span className="ml-2">Your qualification has been submitted and is pending review.</span>
            </div>
          )}

          {submissionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <strong className="font-semibold">❌ Submission Failed!</strong>
              <span className="ml-2">{submissionError}</span>
            </div>
          )}
          
           {/* A. Company Information - IMPROVED LAYOUT */}
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

          {/* Submission Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
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
        </form>
      </div>
    </div>
  );
}