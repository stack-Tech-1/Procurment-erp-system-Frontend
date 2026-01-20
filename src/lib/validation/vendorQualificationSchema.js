import { z } from 'zod';

// Utility to check if a date is in the future
export const futureDate = z.string().refine((val) => {
  if (!val) return true; // Allow null/empty for optional fields

  // Parse the input date as a plain date (ignoring timezones)
  const inputDate = new Date(val);
  if (isNaN(inputDate.getTime())) {
    return false; // Invalid date format
  }

  // Get today's date as a plain date (ignoring timezones)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set today's time to midnight for comparison

  return inputDate.getTime() > today.getTime(); // Compare timestamps
}, { message: "Expiry date must be in the future." });

// --- NEW: Utility to check if a date is expired ---
export const notExpiredDate = z.string().refine((val) => {
  if (!val) return true; // Allow null/empty for optional fields

  // Parse the input date as a plain date
  const inputDate = new Date(val);
  if (isNaN(inputDate.getTime())) {
    return false; // Invalid date format
  }

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate.getTime() >= today.getTime(); // Date must be today or future
}, { message: "Document has expired. Please upload a valid document." });

// --- NEW: Utility to validate email domain matches company ---
export const companyEmailDomain = (companyName) => {
  return z.string().email("Invalid email address.").refine((email) => {
    if (!companyName) return true; // Skip if company name not provided
    
    const emailDomain = email.split('@')[1]?.toLowerCase() || '';
    const companyNameLower = companyName.toLowerCase();
    
    // Extract company name without special characters
    const cleanCompanyName = companyNameLower
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .split(' ')
      .filter(word => word.length > 3) // Keep only meaningful words
      .join('|'); // Create regex pattern
    
    // Check if domain contains company name parts
    if (cleanCompanyName) {
      const regex = new RegExp(cleanCompanyName, 'i');
      return regex.test(emailDomain);
    }
    
    // Alternative: Check if company name appears in domain
    const companyWords = companyNameLower.split(' ').filter(word => word.length > 3);
    return companyWords.some(word => emailDomain.includes(word));
  }, { 
    message: "Email domain should match your company name. Please use a company email address." 
  });
};

// --- NEW: Utility to validate Saudi phone number with strict format ---
export const saudiPhoneNumber = z.string()
  .trim()
  .refine((val) => {
    // Remove all non-digit characters
    const cleanNumber = val.replace(/\D/g, '');
    
    // Check if it's a valid Saudi mobile number
    // Saudi mobile numbers: 05xxxxxxxx or +9665xxxxxxxx or 009665xxxxxxxx
    if (cleanNumber.startsWith('9665') && cleanNumber.length === 12) {
      return true; // +966 format
    } else if (cleanNumber.startsWith('05') && cleanNumber.length === 10) {
      return true; // 05 format
    } else if (cleanNumber.startsWith('5') && cleanNumber.length === 9) {
      return true; // 5 format (without leading 0)
    }
    
    return false;
  }, { message: "Invalid Saudi mobile number format. Must be: 05xxxxxxxx, +9665xxxxxxxx, or 5xxxxxxxx" })
  .transform((val) => {
    // Normalize to international format
    const cleanNumber = val.replace(/\D/g, '');
    
    if (cleanNumber.startsWith('9665') && cleanNumber.length === 12) {
      return `+${cleanNumber}`;
    } else if (cleanNumber.startsWith('05') && cleanNumber.length === 10) {
      return `+966${cleanNumber.substring(1)}`;
    } else if (cleanNumber.startsWith('5') && cleanNumber.length === 9) {
      return `+966${cleanNumber}`;
    }
    
    return val; // Return original if pattern didn't match
  });

// --- 1. Project Experience Schema ---
export const ProjectExperienceSchema = z.object({
  projectName: z.string().min(3, "Project Name is required."),
  clientName: z.string().min(3, "Client Name is required."),
  contractValue: z.union([z.number(), z.string()])
    .refine((val) => {
      const num = parseFloat(String(val));
      return !isNaN(num) && num >= 0;
    }, "Value must be a positive number.")
    .transform((val) => parseFloat(String(val))),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  scopeDescription: z.string().optional(),
  referenceContact: z.string().optional(),
  completionFile: z.any() 
});

// --- 2. Document Entry Schema (UPDATED with expiry validation) ---
export const DocumentEntrySchema = z.object({
  file: z.any().refine((file) => file !== undefined, "File upload is mandatory."),
  number: z.string().optional(),
  expiry: z.string().optional()
    .refine((val) => {
      if (!val) return true; // Allow empty for non-expiring documents
      
      const expiryDate = new Date(val);
      if (isNaN(expiryDate.getTime())) return false;
      
      // Check if expiry date is valid
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Document can expire today or in the future (not past)
      return expiryDate.getTime() >= today.getTime();
    }, { message: "Document has expired. Please upload a valid document with future expiry date." }),
  
  // Document fields for VendorDocument model
  isoType: z.string().optional(),
});

// --- 3. Main Qualification Form Schema (UPDATED with enhanced validation) ---
export const VendorQualificationSchema = z.object({
  // ----------------------------------------------------
  // Section A: Company Information (UPDATED)
  // ----------------------------------------------------
  vendorId: z.string().optional(),
  companyLegalName: z.string()
    .min(5, "Company legal name is mandatory and must be descriptive.")
    .max(200, "Company name is too long."),
  
  licenseNumber: z.string()
    .min(5, "License number is mandatory.")
    .max(50, "License number is too long.")
    .regex(/^[A-Z0-9\-/]+$/i, "License number can only contain letters, numbers, hyphens, and slashes."),
  
  vendorType: z.string().min(1, "Vendor Type is mandatory."),
  businessType: z.string().min(1, "Business Type is mandatory."),
  
  yearsInBusiness: z.string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, 
      "Years in business is mandatory and must be a positive number.")
    .refine((val) => parseInt(val) <= 100, 
      "Years in business cannot exceed 100."),
  
  gosiEmployeeCount: z.string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, 
      "GOSI Employee count is mandatory and must be a number (0 or higher).")
    .refine((val) => parseInt(val) <= 10000, 
      "Employee count cannot exceed 10,000."),

  chamberClass: z.string().optional(),
  chamberRegion: z.string().optional(),
  
  mainCategory: z
    .union([
      z.string().min(1, "Main Categories are required."), 
      z.array(z.string().min(1, "Category name cannot be empty.")).min(1, "Main Categories are required.") 
    ])
    .optional()
    .transform((val) => {
      return typeof val === "string" ? val.split(",").map((s) => s.trim()).filter(s => s.length > 0) : val;
    }),

  subCategory: z.string().optional(),
  csiSpecialization: z.string().optional(),

  productsAndServices: z
    .union([
      z.string().min(1, "Products and Services are mandatory."),
      z.array(z.string().min(1, "Service name cannot be empty.")).min(1, "Products and Services are mandatory.")
    ])
    .transform((val) => {
      return typeof val === "string" ? val.split(",").map((s) => s.trim()).filter(s => s.length > 0) : val;
    }),
  
  // ----------------------------------------------------
  // Section B: Contact Information (UPDATED with enhanced validation)
  // ----------------------------------------------------
  primaryContactName: z.string()
    .min(3, "Primary contact name is mandatory.")
    .max(100, "Name is too long."),
  
  primaryContactTitle: z.string()
    .min(3, "Primary contact title is mandatory.")
    .max(100, "Title is too long."),
  
  contactPerson: z.string()
    .min(3, "Contact person is mandatory.")
    .max(100, "Name is too long."),
  
  // Updated phone validation with Saudi format
  contactPhone: saudiPhoneNumber,
  
  // Updated email validation with domain matching
  contactEmail: z.string()
    .email("Invalid email address.")
    .min(5, "Email is mandatory.")
    .max(100, "Email is too long."),
  
  website: z.string()
    .url("Please enter a valid URL starting with http:// or https://")
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true; // Empty is allowed
      return val.startsWith('http://') || val.startsWith('https://');
    }, { message: "Website URL must start with http:// or https://" }),

  // Technical Contact fields
  technicalContactName: z.string()
    .max(100, "Name is too long.")
    .optional(), 
  
  technicalContactEmail: z.string()
    .email("Invalid email address.")
    .max(100, "Email is too long.")
    .optional()
    .or(z.literal('')), 

  // Financial Contact fields
  financialContactName: z.string()
    .max(100, "Name is too long.")
    .optional(), 
  
  financialContactEmail: z.string()
    .email("Invalid email address.")
    .max(100, "Email is too long.")
    .optional()
    .or(z.literal('')), 

  addressStreet: z.string()
    .min(5, "Street address is mandatory.")
    .max(200, "Address is too long."),
  
  addressCity: z.string()
    .min(2, "City is mandatory.")
    .max(100, "City name is too long."),
  
  addressRegion: z.string()
    .min(2, "Region/State is mandatory.")
    .max(100, "Region name is too long."),
  
  addressCountry: z.string()
    .min(2, "Country is mandatory.")
    .max(100, "Country name is too long."),

  // --- Dynamic Data Schemas ---
  projectExperience: z.array(ProjectExperienceSchema).optional(),
  
  // Document data validation
  documentData: z.record(z.string(), DocumentEntrySchema)
    .optional()
    .refine((data) => {
      if (!data) return true;
      
      // Check for expired documents
      const expiredDocs = Object.entries(data).filter(([key, entry]) => {
        if (!entry.expiry) return false;
        
        const expiryDate = new Date(entry.expiry);
        if (isNaN(expiryDate.getTime())) return false;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return expiryDate.getTime() < today.getTime();
      });
      
      return expiredDocs.length === 0;
    }, { message: "One or more documents have expired. Please update them before submission." }),

  // --- NEW: Logo validation ---
  logoUrl: z.string().optional().default(''),
  
  // --- NEW: Additional fields for dynamic sections ---
  majorBrands: z.string().optional(),
  authorizationLevel: z.string().optional(),
  authLettersAvailable: z.string().optional(),
  primaryProductCategories: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  localManufacturing: z.string().optional(),
  leadConsultantCV: z.any().optional(),
  keyTeamMembers: z.string().optional(),
  companyResume: z.any().optional(),
  similarProjectsCount: z.string().optional(),
  assignmentDetails: z.string().optional(),
  clientReferences: z.string().optional(),
}).refine((data) => {
  // --- NEW: Cross-field validation for email domain matching ---
  if (data.contactEmail && data.companyLegalName) {
    const emailDomain = data.contactEmail.split('@')[1]?.toLowerCase() || '';
    const companyNameLower = data.companyLegalName.toLowerCase();
    
    // Extract company name without special characters
    const cleanCompanyName = companyNameLower
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .join('|');
    
    if (cleanCompanyName) {
      const regex = new RegExp(cleanCompanyName, 'i');
      return regex.test(emailDomain);
    }
    
    // Alternative check
    const companyWords = companyNameLower.split(' ').filter(word => word.length > 3);
    return companyWords.some(word => emailDomain.includes(word));
  }
  return true;
}, {
  message: "Email domain should match your company name. Please use a company email address.",
  path: ["contactEmail"]
});

// Mandatory Documents to check existence for
export const MANDATORY_DOCS = [
  "COMMERCIAL_REGISTRATION",
  "ZAKAT_CERTIFICATE", 
  "ISO_CERTIFICATE",
  "VAT_CERTIFICATE",
  "GOSI_CERTIFICATE",
  "BANK_LETTER",
  "COMPANY_PROFILE"
];

// --- NEW: Vendor Type Specific Mandatory Documents ---
export const VENDOR_TYPE_MANDATORY_DOCS = {
  'Contractor': ['INSURANCE_CERTIFICATE', 'HSE_PLAN', 'ORGANIZATION_CHART'],
  'Subcontractor': ['INSURANCE_CERTIFICATE', 'HSE_PLAN', 'ORGANIZATION_CHART'],
  'Supplier': ['SASO_SABER_CERTIFICATE'],
  'Manufacturer': ['SASO_SABER_CERTIFICATE'],
  'Distributor': ['SASO_SABER_CERTIFICATE'],
  'ServiceProvider': [],
  'Consultant': [],
  'default': []
};

// --- NEW: Helper function to get all mandatory docs for a vendor type ---
export const getMandatoryDocsForVendorType = (vendorType) => {
  const typeKey = vendorType?.replace(/\s+/g, '');
  const vendorSpecific = VENDOR_TYPE_MANDATORY_DOCS[typeKey] || VENDOR_TYPE_MANDATORY_DOCS['default'];
  return [...new Set([...MANDATORY_DOCS, ...vendorSpecific])];
};

// --- NEW: Document Checklist for reference ---
export const DOCUMENT_CHECKLIST_REFERENCE = {
  "COMMERCIAL_REGISTRATION": { label: "Commercial Registration (CR)", hasExpiry: true, hasNumber: true },
  "ZAKAT_CERTIFICATE": { label: "Zakat Certificate", hasExpiry: true, hasNumber: false },
  "VAT_CERTIFICATE": { label: "VAT Certificate", hasExpiry: false, hasNumber: true },
  "GOSI_CERTIFICATE": { label: "GOSI Certificate", hasExpiry: true, hasNumber: true },
  "ISO_CERTIFICATE": { label: "ISO Certificate", hasExpiry: true, hasNumber: false },
  "SASO_SABER_CERTIFICATE": { label: "SASO/SABER Certificate", hasExpiry: true, hasNumber: true },
  "HSE_PLAN": { label: "HSE Plan", hasExpiry: false, hasNumber: false },
  "INSURANCE_CERTIFICATE": { label: "Insurance Certificates", hasExpiry: true, hasNumber: false },
  "ORGANIZATION_CHART": { label: "Organization Chart", hasExpiry: false, hasNumber: false },
  "BANK_LETTER": { label: "Bank Letter/IBAN", hasExpiry: false, hasNumber: false },
  "COMPANY_PROFILE": { label: "Company Profile (PDF)", hasExpiry: false, hasNumber: false }
};