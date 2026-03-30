"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, ChevronRight, ChevronLeft, Save, Send, Eye,
  Plus, Trash2, Upload, AlertTriangle, Building2, Users,
  FileText, Briefcase, Tag, ClipboardList, X, Loader2
} from 'lucide-react';
import FilePreviewModal from '@/components/documents/FilePreviewModal';
import DocumentCard from '@/components/documents/DocumentCard';
import CSIClassification from '@/components/CSIClassification';

const API = process.env.NEXT_PUBLIC_API_URL + '/api';

const VENDOR_TYPES = [
  'Contractor', 'Supplier', 'Manufacturer', 'Distributor',
  'Service Provider', 'Consultant', 'Subcontractor', 'Testing & Commissioning',
];

const CHAMBER_CLASSES = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Unclassified'];
const OWNERSHIP_TYPES = ['Local', 'Foreign', 'JV'];
const DEPARTMENTS = ['Engineering', 'Finance', 'Operations', 'HR', 'IT', 'Procurement', 'Legal', 'Other'];

const STEP_LABELS = ['Company Info', 'Contacts', 'Documents', 'Experience', 'Categories', 'Review & Submit'];

// ─── Document type requirements ──────────────────────────────────────────────
const ALL_DOC_TYPES = [
  { key: 'COMMERCIAL_REGISTRATION', label: 'Commercial Registration (CR)', requiredFor: 'ALL' },
  { key: 'ZAKAT_CERTIFICATE', label: 'Zakat Certificate', requiredFor: 'ALL' },
  { key: 'VAT_CERTIFICATE', label: 'VAT Certificate', requiredFor: 'ALL' },
  { key: 'GOSI_CERTIFICATE', label: 'GOSI Certificate', requiredFor: 'ALL' },
  { key: 'ISO_CERTIFICATE', label: 'ISO Certificate', requiredFor: 'ALL' },
  { key: 'BANK_LETTER', label: 'Bank Letter / IBAN', requiredFor: 'ALL' },
  { key: 'COMPANY_PROFILE', label: 'Company Profile', requiredFor: 'ALL' },
  { key: 'FINANCIAL_FILE', label: 'Financial File', requiredFor: 'ALL' },
  { key: 'VENDOR_CODE_OF_CONDUCT', label: 'Vendor Code of Conduct', requiredFor: 'ALL' },
  { key: 'HSE_PLAN', label: 'HSE Plan', requiredFor: 'CONTRACTOR' },
  { key: 'INSURANCE_CERTIFICATE', label: 'Insurance Certificate', requiredFor: 'CONTRACTOR' },
  { key: 'ORGANIZATION_CHART', label: 'Organization Chart', requiredFor: 'CONTRACTOR' },
  { key: 'QUALITY_PLAN', label: 'Quality Plan', requiredFor: 'CONTRACTOR' },
  { key: 'SASO_SABER_CERTIFICATE', label: 'SASO / SABER Certificate', requiredFor: 'SUPPLIER' },
  { key: 'TECHNICAL_FILE', label: 'Technical File', requiredFor: 'SUPPLIER' },
  { key: 'WARRANTY_CERTIFICATE', label: 'Warranty Certificate', requiredFor: 'ALL' },
  { key: 'INDUSTRY_LICENSE', label: 'Industry License', requiredFor: 'ALL' },
];

function getRequiredDocs(vendorType) {
  const isContractor = ['Contractor', 'Subcontractor'].includes(vendorType);
  const isSupplier = ['Supplier', 'Manufacturer', 'Distributor'].includes(vendorType);
  return ALL_DOC_TYPES.filter(d => {
    if (d.requiredFor === 'ALL') return true;
    if (d.requiredFor === 'CONTRACTOR' && isContractor) return true;
    if (d.requiredFor === 'SUPPLIER' && isSupplier) return true;
    return false;
  });
}

function getDocStatus(doc) {
  if (!doc) return 'MISSING';
  if (doc.status) return doc.status;
  if (!doc.expiryDate) return 'VALID';
  const expiry = new Date(doc.expiryDate);
  const now = new Date();
  if (expiry < now) return 'EXPIRED';
  if (expiry < new Date(now.getTime() + 30 * 86400000)) return 'EXPIRING_SOON';
  return 'VALID';
}

const emptyContact = () => ({ contactType: '', name: '', jobTitle: '', email: '', phone: '' });
const emptyTeamMember = () => ({ fullName: '', jobTitle: '', department: '', phone: '', email: '', employeeId: '' });
const emptyProject = () => ({ projectName: '', clientName: '', contractValue: '', startDate: '', endDate: '', scopeDescription: '', vendorRole: '', completionPct: '', projectLocation: '' });
const emptyBrand = () => ({ brandName: '', manufacturer: '', countryOfOrigin: '' });
const emptyAssignment = () => ({ project: '', client: '', duration: '', description: '' });

// ─── Step Progress Bar ────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-start justify-between mb-8 px-2 overflow-x-auto">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                style={{
                  backgroundColor: done ? '#B8960A' : active ? '#0A1628' : 'white',
                  borderColor: done ? '#B8960A' : active ? '#0A1628' : '#d1d5db',
                  color: done || active ? 'white' : '#6b7280',
                }}
              >
                {done ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              <span className="text-xs mt-1 text-center w-16 leading-tight" style={{ color: active ? '#0A1628' : '#6b7280', fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-0.5 mt-4 mx-1" style={{ backgroundColor: done ? '#B8960A' : '#e5e7eb' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QualificationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorId, setVendorId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [draftDate, setDraftDate] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', fileName: '' });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const logoInputRef = useRef(null);
  const profilePdfInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // Step 1
    companyLegalName: '', companyNameArabic: '', brandName: '', companySummary: '',
    vendorType: '', crNumber: '', vatNumber: '', zakatNumber: '',
    yearsInBusiness: '', gosiEmployeeCount: '',
    chamberClass: '', chamberExpiryDate: '', ownershipType: '',
    addressStreet: '', addressCity: '', addressRegion: '', addressPostalCode: '', addressCountry: 'Saudi Arabia',
    website: '', headOfficeLocation: '',
    companyProfileUrl: '',
    // Step 2
    contacts: [
      { contactType: 'PRIMARY', name: '', jobTitle: '', email: '', phone: '' },
      { contactType: 'TECHNICAL', name: '', jobTitle: '', email: '', phone: '' },
      { contactType: 'FINANCIAL', name: '', jobTitle: '', email: '', phone: '' },
    ],
    teamMembers: [],
    // Step 4
    projects: [],
    brands: [],
    productRange: '', localStock: false, avgDeliveryTime: '', warrantyService: '',
    staffCvUrls: [], pastAssignments: [],
    // Step 5
    categories: [],
    tags: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getToken = () => localStorage.getItem('authToken');
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  // ── Load draft on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const { data } = await axios.get(`${API}/vendor/qualification/draft`, { headers: authHeader() });
        if (data.vendor) {
          const v = data.vendor;
          setVendorId(v.id);
          setDocuments(v.documents || []);
          setFormData(prev => ({
            ...prev,
            companyLegalName: v.companyLegalName || '',
            companyNameArabic: v.companyNameArabic || '',
            brandName: v.brandName || '',
            companySummary: v.companySummary || '',
            vendorType: v.vendorType || '',
            crNumber: v.crNumber || '',
            vatNumber: v.vatNumber || '',
            zakatNumber: v.zakatNumber || '',
            yearsInBusiness: v.yearsInBusiness || '',
            gosiEmployeeCount: v.gosiEmployeeCount || '',
            chamberClass: v.chamberClass || '',
            chamberExpiryDate: v.chamberExpiryDate ? v.chamberExpiryDate.slice(0, 10) : '',
            ownershipType: v.ownershipType || '',
            addressStreet: v.addressStreet || '',
            addressCity: v.addressCity || '',
            addressRegion: v.addressRegion || '',
            addressCountry: v.addressCountry || 'Saudi Arabia',
            website: v.website || '',
            headOfficeLocation: v.headOfficeLocation || '',
            companyProfileUrl: v.companyProfileUrl || '',
            contacts: v.contacts?.length > 0 ? v.contacts : prev.contacts,
            teamMembers: v.teamMembers || [],
            categories: v.categories || [],
            projects: v.projectExperience?.map(p => ({
              projectName: p.projectName || '', clientName: p.clientName || '',
              contractValue: p.contractValue || '', startDate: p.startDate?.slice(0, 10) || '',
              endDate: p.endDate?.slice(0, 10) || '', scopeDescription: p.scopeDescription || '',
              vendorRole: p.vendorRole || '', completionPct: p.completionPct || '',
              projectLocation: p.projectLocation || '',
            })) || [],
          }));
          if (v.logo) setLogoPreview(v.logo);
          if (data.qualification?.step) setCurrentStep(data.qualification.step);
          setDraftDate(data.qualification?.updatedAt || data.vendor?.updatedAt);
        }
      } catch (err) {
        // No draft — start fresh
      }
    };
    loadDraft();
  }, []);

  // ── Auto-save every 2 min ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isDirty) return;
    const timer = setInterval(() => { saveDraft(true); }, 120000);
    return () => clearInterval(timer);
  }, [isDirty, formData]);

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.companyLegalName.trim()) errs.companyLegalName = 'Company name is required';
      if (!formData.vendorType) errs.vendorType = 'Vendor type is required';
      if (!formData.crNumber.trim()) errs.crNumber = 'CR number is required';
    }
    if (step === 2) {
      const primary = formData.contacts.find(c => c.contactType === 'PRIMARY');
      if (!primary?.name.trim()) errs.primaryName = 'Primary contact name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(s => Math.min(6, s + 1));
    window.scrollTo(0, 0);
  };
  const handleBack = () => { setCurrentStep(s => Math.max(1, s - 1)); window.scrollTo(0, 0); };

  // ── CR number duplicate check ───────────────────────────────────────────────
  const checkCr = async (crNumber) => {
    if (!crNumber.trim()) return;
    try {
      const { data } = await axios.get(`${API}/vendors/check-cr?crNumber=${encodeURIComponent(crNumber)}`, { headers: authHeader() });
      if (data.exists) setErrors(prev => ({ ...prev, crNumber: 'This CR number is already registered' }));
    } catch { /* ignore */ }
  };

  // ── Save draft ──────────────────────────────────────────────────────────────
  const saveDraft = useCallback(async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      await axios.post(`${API}/vendor/qualification/save-draft`, {
        ...formData,
        step: currentStep,
        contacts: formData.contacts,
        teamMembers: formData.teamMembers,
      }, { headers: authHeader() });
      setDraftDate(new Date().toISOString());
      setIsDirty(false);
      if (!silent) showToast('Draft saved successfully');
    } catch {
      if (!silent) showToast('Failed to save draft', 'error');
    } finally {
      if (!silent) setSaving(false);
    }
  }, [formData, currentStep]);

  // ── Document upload ─────────────────────────────────────────────────────────
  const handleDocUpload = async (docType, file) => {
    if (!vendorId) return showToast('Save draft first to enable document uploads', 'error');
    setUploadingDoc(docType);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await axios.put(`${API}/vendors/${vendorId}/documents/${docType}`, fd, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      // Refresh documents
      const { data } = await axios.get(`${API}/vendor/qualification/draft`, { headers: authHeader() });
      setDocuments(data.vendor?.documents || []);
      showToast('Document uploaded');
    } catch { showToast('Upload failed', 'error'); }
    finally { setUploadingDoc(null); }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API}/vendor/qualification/submit`, {}, { headers: authHeader() });
      router.push('/vendor-dashboard?submitted=true');
    } catch (err) {
      const missing = err.response?.data?.missing;
      if (missing?.length) {
        showToast(`Missing documents: ${missing.join(', ')}`, 'error');
      } else {
        showToast(err.response?.data?.error || 'Submission failed', 'error');
      }
    } finally { setSubmitting(false); }
  };

  // ── Missing docs check (for step 6) ────────────────────────────────────────
  const missingRequiredDocs = () => {
    const required = getRequiredDocs(formData.vendorType);
    const now = new Date();
    const uploaded = documents.filter(d => !d.expiryDate || new Date(d.expiryDate) >= now).map(d => d.docType);
    return required.filter(d => !uploaded.includes(d.key));
  };

  // ── Logo upload ─────────────────────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      return showToast('Logo must be an image file (JPG, PNG, SVG)', 'error');
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  // ── Input helpers ───────────────────────────────────────────────────────────
  const Field = ({ label, error, required, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );

  const Input = ({ field, ...props }) => (
    <input
      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? 'border-red-400' : 'border-gray-300'}`}
      value={formData[field] ?? ''}
      onChange={e => update(field, e.target.value)}
      {...props}
    />
  );

  const Select = ({ field, options, placeholder, ...props }) => (
    <select
      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field] ? 'border-red-400' : 'border-gray-300'}`}
      value={formData[field] ?? ''}
      onChange={e => update(field, e.target.value)}
      {...props}
    >
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  // ── Doc summary bar ─────────────────────────────────────────────────────────
  const DocSummaryBar = () => {
    const validCount = documents.filter(d => getDocStatus(d) === 'VALID').length;
    const expiringCount = documents.filter(d => getDocStatus(d) === 'EXPIRING_SOON').length;
    const missing = missingRequiredDocs();
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">{validCount} Valid</span>
        {expiringCount > 0 && <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">{expiringCount} Expiring Soon</span>}
        {missing.length > 0 && <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">{missing.length} Missing Required</span>}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP RENDERS
  // ═══════════════════════════════════════════════════════════════════════════

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Company Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Company Legal Name (English)" error={errors.companyLegalName} required>
          <Input field="companyLegalName" placeholder="As per commercial registration" />
        </Field>
        <Field label="Company Name (Arabic)" error={errors.companyNameArabic}>
          <input dir="rtl" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.companyNameArabic} onChange={e => update('companyNameArabic', e.target.value)} placeholder="الاسم بالعربي" />
        </Field>
        <Field label="Brand / Trading Name">
          <Input field="brandName" placeholder="If different from legal name" />
        </Field>
        <Field label="Vendor Type" error={errors.vendorType} required>
          <Select field="vendorType" options={VENDOR_TYPES} placeholder="Select vendor type" />
        </Field>
        <Field label="CR / Business Registration Number" error={errors.crNumber} required>
          <Input field="crNumber" placeholder="e.g. 1234567890"
            onBlur={e => checkCr(e.target.value)} />
        </Field>
        <Field label="VAT Number">
          <Input field="vatNumber" placeholder="VAT registration number" />
        </Field>
        <Field label="Zakat Number">
          <Input field="zakatNumber" placeholder="Zakat certificate number" />
        </Field>
        <Field label="Years in Business">
          <Input field="yearsInBusiness" type="number" min="0" />
        </Field>
        <Field label="GOSI Employee Count">
          <Input field="gosiEmployeeCount" type="number" min="0" />
        </Field>
        <Field label="Chamber of Commerce Class">
          <Select field="chamberClass" options={CHAMBER_CLASSES} />
        </Field>
        <Field label="Chamber Expiry Date">
          <Input field="chamberExpiryDate" type="date" />
        </Field>
        <Field label="Ownership Type">
          <Select field="ownershipType" options={OWNERSHIP_TYPES} />
        </Field>
      </div>

      <Field label="Company Summary">
        <div className="relative">
          <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3} maxLength={300} value={formData.companySummary}
            onChange={e => update('companySummary', e.target.value)}
            placeholder="Brief description of your company..." />
          <span className="absolute bottom-2 right-2 text-xs text-gray-400">{formData.companySummary.length}/300</span>
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Head Office Location">
          <Input field="headOfficeLocation" placeholder="City, Region" />
        </Field>
        <Field label="Website">
          <Input field="website" type="url" placeholder="https://www.example.com" />
        </Field>
      </div>

      <h3 className="font-semibold text-gray-700 mt-4">Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Street"><Input field="addressStreet" /></Field>
        <Field label="City"><Input field="addressCity" /></Field>
        <Field label="Region"><Input field="addressRegion" /></Field>
        <Field label="Country"><Input field="addressCountry" /></Field>
      </div>

      <h3 className="font-semibold text-gray-700 mt-4">Branding</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
          <div className="flex items-center gap-4">
            <div onClick={() => logoInputRef.current?.click()}
              className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-400 transition-colors"
              style={logoPreview ? {} : {}}>
              {logoPreview
                ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                : <Upload className="w-6 h-6 text-gray-400" />}
            </div>
            <button type="button" onClick={() => logoInputRef.current?.click()}
              className="text-sm text-blue-600 hover:underline">
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </button>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>
        </div>

        {/* Company profile PDF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Profile (PDF)</label>
          <div className="flex items-center gap-2">
            {formData.companyProfileUrl ? (
              <>
                <span className="text-sm text-gray-600 truncate max-w-xs">{formData.companyProfileUrl.split('/').pop()}</span>
                <button type="button" onClick={() => setPreviewModal({ isOpen: true, fileUrl: formData.companyProfileUrl, fileName: 'Company Profile.pdf' })}
                  className="text-xs px-2 py-1 rounded border hover:opacity-80"
                  style={{ borderColor: '#B8960A', color: '#B8960A' }}>
                  <Eye className="w-3.5 h-3.5 inline mr-1" />Preview
                </button>
              </>
            ) : (
              <button type="button" onClick={() => profilePdfInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
                <Upload className="w-4 h-4" /> Upload PDF
              </button>
            )}
            <input ref={profilePdfInputRef} type="file" accept=".pdf" className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !vendorId) { showToast('Save draft first before uploading PDF', 'error'); return; }
                await handleDocUpload('COMPANY_PROFILE', file);
                const doc = documents.find(d => d.docType === 'COMPANY_PROFILE');
                if (doc) update('companyProfileUrl', doc.url);
              }} />
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Step 2: Contacts ───────────────────────────────────────────────────────
  const renderStep2 = () => {
    const contactTypes = ['PRIMARY', 'TECHNICAL', 'FINANCIAL'];
    const contactLabels = { PRIMARY: 'Primary Contact', TECHNICAL: 'Technical Contact', FINANCIAL: 'Financial Contact' };

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Contacts</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactTypes.map((type) => {
            const idx = formData.contacts.findIndex(c => c.contactType === type);
            const contact = formData.contacts[idx] || { contactType: type, name: '', jobTitle: '', email: '', phone: '' };
            const upd = (field, value) => {
              const newContacts = [...formData.contacts];
              if (idx === -1) newContacts.push({ ...contact, [field]: value });
              else newContacts[idx] = { ...contact, [field]: value };
              update('contacts', newContacts);
            };
            return (
              <div key={type} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-gray-700">
                  {contactLabels[type]}
                  {type === 'PRIMARY' && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {['name', 'jobTitle', 'email', 'phone'].map(f => (
                  <div key={f}>
                    <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{f === 'jobTitle' ? 'Job Title' : f.charAt(0).toUpperCase() + f.slice(1)}</label>
                    <input className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type={f === 'email' ? 'email' : 'text'}
                      value={contact[f] || ''}
                      onChange={e => upd(f, e.target.value)} />
                  </div>
                ))}
                {type === 'PRIMARY' && errors.primaryName && <p className="text-xs text-red-600">{errors.primaryName}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Authorized Team Members</h3>
            <button type="button"
              onClick={() => update('teamMembers', [...formData.teamMembers, emptyTeamMember()])}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              style={{ borderColor: '#0A1628', color: '#0A1628' }}>
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>
          {formData.teamMembers.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No team members added yet.</p>
          ) : (
            <div className="space-y-3">
              {formData.teamMembers.map((member, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-3 relative">
                  <button type="button" onClick={() => update('teamMembers', formData.teamMembers.filter((_, j) => j !== i))}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {['fullName', 'jobTitle', 'phone', 'email', 'employeeId'].map(f => (
                    <div key={f}>
                      <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{f === 'fullName' ? 'Full Name' : f === 'jobTitle' ? 'Job Title' : f === 'employeeId' ? 'Employee ID' : f.charAt(0).toUpperCase() + f.slice(1)}</label>
                      <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={member[f] || ''}
                        onChange={e => { const tm = [...formData.teamMembers]; tm[i] = { ...tm[i], [f]: e.target.value }; update('teamMembers', tm); }} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                    <select className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                      value={member.department || ''}
                      onChange={e => { const tm = [...formData.teamMembers]; tm[i] = { ...tm[i], department: e.target.value }; update('teamMembers', tm); }}>
                      <option value="">Select</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Step 3: Documents ──────────────────────────────────────────────────────
  const renderStep3 = () => {
    const requiredDocs = getRequiredDocs(formData.vendorType);
    const missing = missingRequiredDocs();
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Documents</h2>
        <DocSummaryBar />
        {missing.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Required before submission:</strong>{' '}
              {missing.map(d => d.label).join(', ')}
            </div>
          </div>
        )}
        {!vendorId && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Save a draft first to enable document uploads.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {requiredDocs.map(({ key, label, requiredFor }) => {
            const doc = documents.find(d => d.docType === key) || null;
            return (
              <DocumentCard
                key={key}
                docType={key}
                label={label}
                document={doc}
                requiredFor={requiredFor === 'ALL' ? 'BOTH' : requiredFor === 'CONTRACTOR' ? 'CONTRACTOR' : 'SUPPLIER'}
                isUploading={uploadingDoc === key}
                canVerify={false}
                onUpload={file => handleDocUpload(key, file)}
                onPreview={({ fileUrl, fileName }) => setPreviewModal({ isOpen: true, fileUrl, fileName })}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Step 4: Experience ─────────────────────────────────────────────────────
  const renderStep4 = () => {
    const vt = formData.vendorType;
    const isContractor = ['Contractor', 'Subcontractor'].includes(vt);
    const isSupplier = ['Supplier', 'Manufacturer', 'Distributor'].includes(vt);
    const isService = ['Service Provider', 'Consultant', 'Testing & Commissioning'].includes(vt);

    if (isContractor) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Project Experience</h2>
          <button type="button" onClick={() => update('projects', [...formData.projects, emptyProject()])}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border"
            style={{ borderColor: '#0A1628', color: '#0A1628' }}>
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
        {formData.projects.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Add at least one project for contractors.</p>
        ) : formData.projects.map((proj, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 relative">
            <button type="button" onClick={() => update('projects', formData.projects.filter((_, j) => j !== i))}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[['projectName', 'Project Name'], ['clientName', 'Client Name'], ['contractValue', 'Contract Value (SAR)'], ['startDate', 'Start Date', 'date'], ['endDate', 'End Date', 'date'], ['vendorRole', 'Vendor Role on Project'], ['completionPct', '% Completion', 'number'], ['projectLocation', 'Project Location']].map(([f, label, type]) => (
                <div key={f}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={type || 'text'} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                    value={proj[f] || ''}
                    onChange={e => { const ps = [...formData.projects]; ps[i] = { ...ps[i], [f]: e.target.value }; update('projects', ps); }} />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Scope Description</label>
                <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none resize-none"
                  value={proj.scopeDescription || ''}
                  onChange={e => { const ps = [...formData.projects]; ps[i] = { ...ps[i], scopeDescription: e.target.value }; update('projects', ps); }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    if (isSupplier) return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Products & Brands</h2>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">Brands Represented</h3>
          <button type="button" onClick={() => update('brands', [...formData.brands, emptyBrand()])}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border"
            style={{ borderColor: '#0A1628', color: '#0A1628' }}>
            <Plus className="w-4 h-4" /> Add Brand
          </button>
        </div>
        {formData.brands.map((b, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 border border-gray-200 rounded-lg p-3 relative">
            <button type="button" onClick={() => update('brands', formData.brands.filter((_, j) => j !== i))}
              className="absolute top-2 right-2 text-red-400"><Trash2 className="w-4 h-4" /></button>
            {[['brandName', 'Brand Name'], ['manufacturer', 'Manufacturer'], ['countryOfOrigin', 'Country of Origin']].map(([f, label]) => (
              <div key={f}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                  value={b[f] || ''}
                  onChange={e => { const bs = [...formData.brands]; bs[i] = { ...bs[i], [f]: e.target.value }; update('brands', bs); }} />
              </div>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field label="Product Range">
            <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
              value={formData.productRange} onChange={e => update('productRange', e.target.value)} />
          </Field>
          <div className="space-y-3">
            <Field label="Average Delivery Time">
              <Input field="avgDeliveryTime" placeholder="e.g. 2-4 weeks" />
            </Field>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Local Stock Available</label>
              <button type="button" onClick={() => update('localStock', !formData.localStock)}
                className={`w-10 h-5 rounded-full transition-colors ${formData.localStock ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${formData.localStock ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <Field label="Warranty / After-Sales">
              <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                value={formData.warrantyService} onChange={e => update('warrantyService', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Past Assignments</h2>
        <div className="flex justify-end">
          <button type="button" onClick={() => update('pastAssignments', [...formData.pastAssignments, emptyAssignment()])}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border"
            style={{ borderColor: '#0A1628', color: '#0A1628' }}>
            <Plus className="w-4 h-4" /> Add Assignment
          </button>
        </div>
        {formData.pastAssignments.map((a, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 relative grid grid-cols-2 gap-3">
            <button type="button" onClick={() => update('pastAssignments', formData.pastAssignments.filter((_, j) => j !== i))}
              className="absolute top-2 right-2 text-red-400"><Trash2 className="w-4 h-4" /></button>
            {[['project', 'Project'], ['client', 'Client'], ['duration', 'Duration']].map(([f, label]) => (
              <div key={f}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                  value={a[f] || ''}
                  onChange={e => { const pa = [...formData.pastAssignments]; pa[i] = { ...pa[i], [f]: e.target.value }; update('pastAssignments', pa); }} />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none resize-none"
                value={a.description || ''}
                onChange={e => { const pa = [...formData.pastAssignments]; pa[i] = { ...pa[i], description: e.target.value }; update('pastAssignments', pa); }} />
            </div>
          </div>
        ))}
        {formData.pastAssignments.length === 0 && <p className="text-sm text-gray-400 italic">No assignments added yet.</p>}
      </div>
    );
  };

  // ─── Step 5: Categories ─────────────────────────────────────────────────────
  const renderStep5 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Categories & Specializations</h2>
      <CSIClassification
        selectedCategories={formData.categories}
        onCategoriesChange={cats => update('categories', cats)}
        vendorType={formData.vendorType}
        vendorId={vendorId}
        onSave={async () => {}}
      />
      <Field label="Tags / Keywords (for search optimization)">
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          placeholder="e.g. HVAC, MEP, Fire Systems" value={formData.tags}
          onChange={e => update('tags', e.target.value)} />
      </Field>
    </div>
  );

  // ─── Step 6: Review & Submit ─────────────────────────────────────────────────
  const renderStep6 = () => {
    const missing = missingRequiredDocs();
    const canSubmit = missing.length === 0;

    const Section = ({ title, step, children }) => {
      const [open, setOpen] = useState(true);
      return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
            <h3 className="font-semibold text-gray-700">{title}</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); setCurrentStep(step); }}
                className="text-xs text-blue-600 hover:underline">Edit</button>
              {open ? <ChevronLeft className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
            </div>
          </div>
          {open && <div className="p-4 text-sm text-gray-600">{children}</div>}
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Review & Submit</h2>
        <DocSummaryBar />

        {missing.length > 0 && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div><strong>Cannot submit — missing required documents:</strong> {missing.map(d => d.label).join(', ')}</div>
          </div>
        )}

        <Section title="Company Information" step={1}>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-400">Legal Name:</span> {formData.companyLegalName || '—'}</div>
            <div><span className="text-gray-400">Type:</span> {formData.vendorType || '—'}</div>
            <div><span className="text-gray-400">CR Number:</span> {formData.crNumber || '—'}</div>
            <div><span className="text-gray-400">VAT:</span> {formData.vatNumber || '—'}</div>
            <div><span className="text-gray-400">City:</span> {formData.addressCity || '—'}</div>
            <div><span className="text-gray-400">Ownership:</span> {formData.ownershipType || '—'}</div>
          </div>
        </Section>

        <Section title="Contacts" step={2}>
          {formData.contacts.filter(c => c.name).map(c => (
            <div key={c.contactType} className="mb-2">
              <strong>{c.contactType}:</strong> {c.name} — {c.email || 'no email'} | {c.phone || 'no phone'}
            </div>
          ))}
          {formData.teamMembers.length > 0 && <p>{formData.teamMembers.length} team member(s) added</p>}
        </Section>

        <Section title="Documents" step={3}>
          <div className="grid grid-cols-2 gap-1">
            {getRequiredDocs(formData.vendorType).map(d => {
              const doc = documents.find(dd => dd.docType === d.key);
              const status = getDocStatus(doc);
              return (
                <div key={d.key} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${status === 'VALID' ? 'bg-green-500' : status === 'EXPIRING_SOON' ? 'bg-orange-400' : 'bg-red-400'}`} />
                  <span className="text-xs">{d.label}</span>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Experience / Products" step={4}>
          {formData.projects.length > 0 && <p>{formData.projects.length} project(s) listed</p>}
          {formData.brands.length > 0 && <p>{formData.brands.length} brand(s) listed</p>}
          {formData.pastAssignments.length > 0 && <p>{formData.pastAssignments.length} assignment(s) listed</p>}
          {!formData.projects.length && !formData.brands.length && !formData.pastAssignments.length && <p className="text-gray-400 italic">None added</p>}
        </Section>

        <Section title="Categories" step={5}>
          {formData.categories.length > 0
            ? <p>{formData.categories.length} categor{formData.categories.length === 1 ? 'y' : 'ies'} selected</p>
            : <p className="text-gray-400 italic">No categories selected</p>}
          {formData.tags && <p>Tags: {formData.tags}</p>}
        </Section>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => saveDraft()} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            style={{ borderColor: '#0A1628', color: '#0A1628' }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save as Draft
          </button>
          <button type="button" onClick={handleSubmit} disabled={!canSubmit || submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: canSubmit ? '#0A1628' : '#9ca3af' }}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit for Review
          </button>
        </div>
      </div>
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#0A1628' }}>Vendor Qualification</h1>
          <p className="text-sm text-gray-500 mt-1">Complete all steps to submit your qualification for review.</p>
        </div>

        {/* Draft restored banner */}
        {draftDate && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Draft restored from {new Date(draftDate).toLocaleDateString()}. Continue where you left off.
          </div>
        )}

        <StepBar current={currentStep} />

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          {stepRenderers[currentStep - 1]?.()}
        </div>

        {/* Navigation */}
        {currentStep < 6 && (
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <button type="button" onClick={handleBack}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button type="button" onClick={() => saveDraft()} disabled={saving}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
                style={{ borderColor: '#0A1628', color: '#0A1628' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
            </div>
            <button type="button" onClick={handleNext}
              className="flex items-center gap-1 px-5 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#0A1628' }}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === 6 && (
          <button type="button" onClick={handleBack}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white text-sm z-50 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.msg}
        </div>
      )}

      <FilePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
        fileUrl={previewModal.fileUrl}
        fileName={previewModal.fileName}
      />
    </div>
  );
}
