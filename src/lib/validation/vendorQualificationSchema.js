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

// --- 1. Project Experience Schema (Optional refinement for contractValue) ---
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

// --- 2. Document Entry Schema (for each document) ---
export const DocumentEntrySchema = z.object({
    file: z.any().refine((file) => file !== undefined, "File upload is mandatory."),
    number: z.string().optional(),
    expiry: futureDate.optional(),
    
    // 🔑 NEW: Document fields for VendorDocument model
    isoType: z.string().optional(), // Added for ISO certificate details
    // Note: gosiNumber and vatNumber can be handled within the main schema if they map to specific documents, but for completeness, we keep this dynamic.
  });

// --- 3. Main Qualification Form Schema (UPDATED) ---
export const VendorQualificationSchema = z.object({
    // ----------------------------------------------------
    // Section A: Company Information (UPDATED FIELDS)
    // ----------------------------------------------------
    vendorId: z.string().optional(), // Auto-generated/Read-only
    companyLegalName: z.string().min(5, "Company legal name is mandatory and must be descriptive."), // Renamed from 'name'
    licenseNumber: z.string().min(5, "License number is mandatory."),
    vendorType: z.string().min(1, "Vendor Type is mandatory."),
    businessType: z.string().min(1, "Business Type is mandatory."), // Made mandatory based on typical requirements
    yearsInBusiness: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, "Years in business is mandatory and must be a positive number."),
    gosiEmployeeCount: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, "GOSI Employee count is mandatory and must be a number (0 or higher)."),
  
    chamberClass: z.string().optional(), // New field
    chamberRegion: z.string().optional(), // New field, conditionally required logic moved to the component/API
    
    mainCategory: z
      .union([
        z.string().min(1, "Main Categories are required."), 
        z.array(z.string().min(1, "Category name cannot be empty.")).min(1, "Main Categories are required.") 
      ])
      .optional() // Made optional, but ensure you manage comma-separated text conversion in handleSubmit
      .transform((val) => {
        return typeof val === "string" ? val.split(",").map((s) => s.trim()).filter(s => s.length > 0) : val;
      }),
  
    subCategory: z.string().optional(),
    csiSpecialization: z.string().optional(), // New field
  
    productsAndServices: z // Existing field, ensure transformation handles the comma-separated string
      .union([
        z.string().min(1, "Products and Services are mandatory."),
        z.array(z.string().min(1, "Service name cannot be empty.")).min(1, "Products and Services are mandatory.")
      ])
      .transform((val) => {
        return typeof val === "string" ? val.split(",").map((s) => s.trim()).filter(s => s.length > 0) : val;
      }),
    
    // ----------------------------------------------------
    // Section B: Contact Information (UPDATED FIELDS)
    // ----------------------------------------------------
    primaryContactName: z.string().min(3, "Primary contact name is mandatory."),
    primaryContactTitle: z.string().min(3, "Primary contact title is mandatory."),
    contactPerson: z.string().min(3, "Contact person is mandatory."),
    contactPhone: z.string().regex(/^(\+966|00966)?\s?5\d{8}$/, "Invalid Saudi phone format (+966 5xxxxxxxxx)."),
    contactEmail: z.string().email("Invalid email address.").min(5, "Email is mandatory."),
    website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  
    // 🔑 NEW: Separate Technical Contact fields (Replaced old 'technicalContact')
    technicalContactName: z.string().optional(), 
    technicalContactEmail: z.string().email("Invalid email address.").optional().or(z.literal('')), 
  
    // 🔑 NEW: Separate Financial Contact fields (Replaced old 'financialContact')
    financialContactName: z.string().optional(), 
    financialContactEmail: z.string().email("Invalid email address.").optional().or(z.literal('')), 
  
    addressStreet: z.string().min(5, "Street address is mandatory."),
    addressCity: z.string().min(2, "City is mandatory."),
    addressRegion: z.string().min(2, "Region/State is mandatory."), // New field
    addressCountry: z.string().min(2, "Country is mandatory."),
  
    // --- Dynamic Data Schemas ---
    projectExperience: z.array(ProjectExperienceSchema).optional(),
    documentData: z.record(z.string(), DocumentEntrySchema).optional() // Ensure documentData uses the updated DocumentEntrySchema
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