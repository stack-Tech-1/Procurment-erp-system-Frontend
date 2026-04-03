// C:\Users\SMC\Documents\GitHub\procurement-erp-system\frontend\src\app\signup\page.js
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from "react-google-recaptcha";
import AuthLayoutV2 from "@/components/layout/AuthLayoutV2";
import TermsModal from "@/components/TermsModal";


// ─── Helper: Animated input field ───────────────────────────────────────────
function AnimatedField({ label, name, type, placeholder, value, onChange, mounted, delay, icon, error }) {
  return (
    <div
      className={`space-y-2 transform transition-all duration-700 ${mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${error ? "bg-red-400" : "bg-gradient-to-r from-yellow-400 to-yellow-300"}`}></div>
        {label}
      </label>
      <div className="relative group">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full p-4 bg-white/10 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 text-white placeholder-white/70 shadow-lg font-medium ${
            error
              ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/30 hover:border-red-400/30"
              : "border-white/20 focus:ring-yellow-400/30 focus:border-yellow-400 hover:border-yellow-400/30 hover:shadow-yellow-500/10"
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {icon && (
            <div className={`transition-all duration-300 drop-shadow-sm ${error ? "text-red-300" : "text-yellow-300 group-focus-within:text-yellow-200 group-hover:text-yellow-200"}`}>
              {icon}
            </div>
          )}
        </div>
      </div>
      {error && (
        <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Helper: Styled select field ─────────────────────────────────────────────
function SelectField({ label, name, value, onChange, options, error, mounted, delay }) {
  return (
    <div
      className={`space-y-2 transform transition-all duration-700 ${mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${error ? "bg-red-400" : "bg-gradient-to-r from-yellow-400 to-yellow-300"}`}></div>
        {label}
      </label>
      <div className="relative group">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full p-4 bg-white/10 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 text-white shadow-lg font-medium appearance-none ${
            error
              ? "border-red-400/50 focus:border-red-400 focus:ring-red-400/30"
              : "border-white/20 focus:ring-yellow-400/50 focus:border-yellow-400 hover:border-yellow-400/50"
          }`}
        >
          <option value="" className="text-gray-900">— Select —</option>
          {options.map(opt => (
            <option key={opt} value={opt} className="text-gray-900">{opt}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className={`w-5 h-5 ${error ? "text-red-300" : "text-yellow-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-red-300 text-xs mt-1 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Helper: Password Strength Indicator ─────────────────────────────────────
function PasswordStrengthIndicator({ password }) {
  if (!password) return null;

  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasNumber  = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const mixCount   = [hasUpper, hasLower, hasNumber].filter(Boolean).length;

  const strength =
    password.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial
      ? "strong"
      : password.length >= 8 && mixCount >= 2
      ? "medium"
      : "weak";

  const config = {
    weak:   { filled: 1, barColor: "bg-red-500",    textColor: "text-red-400",    label: "Weak"   },
    medium: { filled: 2, barColor: "bg-orange-500", textColor: "text-orange-400", label: "Medium" },
    strong: { filled: 3, barColor: "bg-green-500",  textColor: "text-green-400",  label: "Strong" },
  };

  const { filled, barColor, textColor, label } = config[strength];

  const checks = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: hasUpper,              text: "At least one uppercase letter" },
    { met: hasNumber,             text: "At least one number" },
    { met: hasSpecial,            text: "At least one special character" },
  ];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-400 ${i < filled ? barColor : "bg-white/20"}`} />
          ))}
        </div>
        <span className={`text-xs font-semibold w-12 ${textColor}`}>{label}</span>
      </div>
      <ul className="text-xs text-white/70 space-y-1">
        {checks.map(({ met, text }) => (
          <li key={text} className={`flex items-center gap-2 ${met ? "text-green-300" : ""}`}>
            <svg className={`w-3 h-3 flex-shrink-0 ${met ? "text-green-400" : "text-white/30"}`} fill="currentColor" viewBox="0 0 20 20">
              {met
                ? <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>
              }
            </svg>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Helper: Review summary row ───────────────────────────────────────────────
function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm py-1">
      <span className="text-white/50 shrink-0 mr-4">{label}</span>
      <span className="text-white font-medium text-right">{value || "—"}</span>
    </div>
  );
}


// ─── Branding defaults ────────────────────────────────────────────────────────
const DEFAULT_BRANDING = {
  companyName: "KUN Real Estate",
  tagline: "Your gateway to partnering with KUN Real Estate.",
  learnMoreUrl: "/about",
  logoUrl: "",
  statProjects: "50+",
  statPartners: "200+",
  statYears: "15+",
  primaryColor: "#0A1628",
  accentColor: "#B8960A",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const SUPPLIER_STEP_LABELS = ["Account Setup", "Company Info", "Contact Person", "Review & Submit"];
const STAFF_STEP_LABELS    = ["Account Setup", "Personal Info", "Review & Submit"];

const BUSINESS_TYPES = [
  "Contractor", "Supplier", "Manufacturer", "Distributor",
  "Service Provider", "Consultant", "Subcontractor",
];

const DEPARTMENTS = ["Procurement", "Contracts", "Finance", "Technical", "Admin"];


// ─── Invitation Banner ────────────────────────────────────────────────────────
function InvitationBanner({ invitationData, invitationError }) {
  if (invitationError) return (
    <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
      {invitationError}
    </div>
  );
  if (!invitationData) return null;
  return (
    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
      You've been invited as <strong style={{ marginLeft: 4 }}>{invitationData.roleName}</strong>. Your email is pre-filled and cannot be changed.
    </div>
  );
}

// ─── Main Component Inner (needs useSearchParams) ─────────────────────────────
function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [activeTab, setActiveTab]       = useState("supplier");
  const [currentStep, setCurrentStep]   = useState(1);
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [branding, setBranding]         = useState(DEFAULT_BRANDING);
  const [invitationToken, setInvitationToken] = useState(null);
  const [invitationData, setInvitationData]   = useState(null);
  const [invitationError, setInvitationError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1 — both tabs
    email: "", password: "", confirmPassword: "",
    // Supplier Step 2 — Company Info
    companyName: "", crNumber: "", vatNumber: "",
    businessType: "", headOfficeLocation: "",
    // Supplier Step 3 — Contact Person
    contactFirstName: "", contactLastName: "",
    contactJobTitle: "", contactPhone: "", whatsapp: "",
    // Staff Step 2 — Personal Info
    fullName: "", employeeNumber: "", jobTitle: "", department: "",
    // Final step
    agreeToTerms: false,
  });

  useEffect(() => { setMounted(true); }, []);

  // Invitation token flow
  useEffect(() => {
    const token = searchParams?.get('invitation');
    if (!token) return;
    setInvitationToken(token);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/invitation/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setInvitationError(data.error);
        } else {
          setInvitationData(data);
          setFormData(prev => ({ ...prev, email: data.email }));
          setActiveTab('staff'); // Invitations are for staff users
        }
      })
      .catch(() => setInvitationError('Failed to validate invitation link.'));
  }, [searchParams]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branding/public`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data) setBranding(prev => ({ ...prev, ...data })); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (branding.primaryColor)
      document.documentElement.style.setProperty('--color-navy', branding.primaryColor);
    if (branding.accentColor)
      document.documentElement.style.setProperty('--color-gold', branding.accentColor);
  }, [branding.primaryColor, branding.accentColor]);

  const stepLabels = activeTab === "supplier" ? SUPPLIER_STEP_LABELS : STAFF_STEP_LABELS;
  const totalSteps = stepLabels.length;

  // ── Tab switch ───────────────────────────────────────────────────────────
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setCurrentStep(1);
    setErrors({});
    setCaptchaToken(null);
  };

  // ── Field change ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // ── Per-step validation ───────────────────────────────────────────────────
  const validateStep = (step) => {
    const e = {};

    if (step === 1) {
      if (!formData.email.trim()) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email address";
      if (!formData.password) e.password = "Password is required";
      else if (formData.password.length < 8) e.password = "Password must be at least 8 characters";
      if (!formData.confirmPassword) e.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
      if (!captchaToken) e.captcha = "Please complete the security verification";
    }

    if (activeTab === "supplier") {
      if (step === 2) {
        if (!formData.companyName.trim())        e.companyName        = t('companyNameRequired');
        if (!formData.crNumber.trim())           e.crNumber           = t('crNumberRequired');
        if (!formData.vatNumber.trim())          e.vatNumber          = t('vatNumberRequired');
        if (!formData.businessType)              e.businessType       = "Please select a business type";
        if (!formData.headOfficeLocation.trim()) e.headOfficeLocation = "Head office location is required";
      }
      if (step === 3) {
        if (!formData.contactFirstName.trim()) e.contactFirstName = "First name is required";
        if (!formData.contactLastName.trim())  e.contactLastName  = "Last name is required";
        if (!formData.contactJobTitle.trim())  e.contactJobTitle  = "Job title is required";
        if (!formData.contactPhone.trim())     e.contactPhone     = "Phone number is required";
      }
      if (step === 4) {
        if (!formData.agreeToTerms) e.agreeToTerms = t('agreeToTermsRequired');
      }
    } else {
      if (step === 2) {
        if (!formData.fullName.trim())       e.fullName       = t('nameRequired');
        if (!formData.employeeNumber.trim()) e.employeeNumber = t('employeeNumberRequired');
        if (!formData.jobTitle.trim())       e.jobTitle       = t('jobTitleRequired');
        if (!formData.department)            e.department     = t('departmentRequired');
      }
      if (step === 3) {
        if (!formData.agreeToTerms) e.agreeToTerms = t('agreeToTermsRequired');
      }
    }

    return e;
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = () => {
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setCurrentStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep(s => s - 1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateStep(totalSteps);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);

    try {
      let finalCaptchaToken = captchaToken;
      if (process.env.NODE_ENV === "development" && !finalCaptchaToken) {
        finalCaptchaToken = "development-dummy-token-v2";
      }

      if (activeTab === "supplier") {
        if (process.env.NODE_ENV !== "development" || !finalCaptchaToken?.includes("development")) {
          const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-captcha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ captchaToken: finalCaptchaToken }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error("Security verification failed. Please go back and complete the CAPTCHA again.");
          }
        }
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userType: activeTab, captchaToken: finalCaptchaToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes("email")) {
          throw new Error("This email is already registered. Please use a different email or try logging in.");
        } else {
          throw new Error(data.error || "Registration failed. Please try again.");
        }
      }

      // Mark invitation as used if applicable
      if (invitationToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/invitation/${invitationToken}/use`, { method: 'PATCH' }).catch(() => {});
      }

      alert("Account created successfully! Please check your email for verification.");
      router.push("/login");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Background ────────────────────────────────────────────────────────────
  const backgroundElement = (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B35] via-[#1A365D] to-[#2D3748]">
      <div className="absolute inset-0 opacity-5 bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23ffffff'/%3E%3C/svg%3E")` }} />
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-yellow-500/5 to-yellow-300/10 rounded-full blur-3xl animate-float-medium"></div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AuthLayoutV2 background={backgroundElement} showGlobalHeader={true}>
      <TermsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />

      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* ── Left Column: Company Branding (unchanged) ── */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative bg-black/10">
          <div className={`text-center lg:text-left mb-8 transform transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <div className="inline-flex items-center justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 mr-4">
                {branding.logoUrl
                  ? <img src={branding.logoUrl} alt={branding.companyName} className="w-10 h-10 object-contain" />
                  : <span className="text-white font-bold text-xl">KUN</span>
                }
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{branding.companyName}</h1>
                <p className="text-white/70 text-sm lg:text-base">{t('supplierStaffRegistration')}</p>
              </div>
            </div>
            <div className="mb-8">
              <p className="text-xl lg:text-2xl font-light text-white italic text-center lg:text-left leading-relaxed">&ldquo;{branding.tagline}&rdquo;</p>
            </div>
            <div className="mb-8">
              <a href={branding.learnMoreUrl} className="inline-flex items-center gap-2 text-yellow-300 hover:text-yellow-200 font-semibold transition-all duration-300 group">
                <span>{t('learnMore')}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 shadow-2xl mb-8 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
              {t('whoCanRegister')}
            </h3>
            <div className="space-y-3 text-white/80 text-sm lg:text-base leading-relaxed">
              <p>{t('vendorDescription')}</p>
              <p>{t('staffDescription')}</p>
            </div>
          </div>
        </div>

        {/* ── Right Column: Wizard Form ── */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white/5 backdrop-blur-md lg:rounded-l-3xl border-l border-white/10">

          {/* Welcome header */}
          <div className={`text-center mb-6 transform transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"}`}>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1">{t('createAccount')}</h2>
            <p className="text-white/70 text-sm">{stepLabels[currentStep - 1]}</p>
          </div>

          {/* Invitation Banner */}
          {(invitationData || invitationError) && (
            <div className="mb-4">
              <InvitationBanner invitationData={invitationData} invitationError={invitationError} />
            </div>
          )}

          {/* Tab switcher */}
          <div className={`mb-6 transform transition-all duration-700 delay-100 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}>
            <div className="flex rounded-xl overflow-hidden border border-white/20">
              <button type="button" onClick={() => !invitationData && handleTabSwitch("supplier")}
                className={`flex-1 py-3 px-4 text-sm font-bold transition-all duration-300 ${activeTab === "supplier" ? "bg-[#B8960A] text-white shadow-inner" : "bg-[#0A1628]/60 text-white/60 hover:text-white hover:bg-[#0A1628]"}`}>
                {t('supplierRegistration')}
              </button>
              <button type="button" onClick={() => handleTabSwitch("staff")}
                className={`flex-1 py-3 px-4 text-sm font-bold transition-all duration-300 ${activeTab === "staff" ? "bg-[#B8960A] text-white shadow-inner" : "bg-[#0A1628]/60 text-white/60 hover:text-white hover:bg-[#0A1628]"}`}>
                {t('staffRegistration')}
              </button>
            </div>
          </div>

          {/* ── Step Progress Indicator ── */}
          <div className="flex items-start mb-8">
            {stepLabels.map((label, i) => {
              const num = i + 1;
              const isCompleted = currentStep > num;
              const isCurrent   = currentStep === num;
              return (
                <React.Fragment key={num}>
                  <div className="flex flex-col items-center min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 flex-shrink-0 ${
                      isCompleted ? "bg-[#B8960A] border-[#B8960A] text-white"
                      : isCurrent  ? "bg-[#0A1628] border-white/60 text-white"
                      :              "bg-white/10 border-white/20 text-white/40"
                    }`}>
                      {isCompleted
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        : num
                      }
                    </div>
                    <span className={`text-xs mt-1 text-center leading-tight max-w-[60px] ${isCurrent ? "text-[#B8960A] font-semibold" : isCompleted ? "text-white/60" : "text-white/30"}`}>
                      {label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-4 mx-1 transition-all duration-500 ${currentStep > num ? "bg-[#B8960A]" : "bg-white/20"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Submit error banner */}
          {errors.submit && (
            <div className="bg-gradient-to-r from-red-500/40 to-orange-500/40 text-white text-sm p-4 rounded-2xl mb-6 border border-red-300/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="font-semibold">{errors.submit}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* ════════════════════════════════
                  STEP 1 — Account Setup (both tabs)
              ════════════════════════════════ */}
              {currentStep === 1 && (
                <>
                  {/* Email */}
                  <AnimatedField label="Email Address" name="email" type="email"
                    placeholder="you@example.com" value={formData.email} onChange={handleChange}
                    mounted={mounted} delay="100" error={errors.email}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                  />

                  {/* Password */}
                  <div>
                    <AnimatedField label={t('password')} name="password" type="password"
                      placeholder="••••••••" value={formData.password} onChange={handleChange}
                      mounted={mounted} delay="200" error={errors.password}
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
                    />
                    <PasswordStrengthIndicator password={formData.password} />
                  </div>

                  {/* Confirm Password */}
                  <AnimatedField label="Confirm Password" name="confirmPassword" type="password"
                    placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange}
                    mounted={mounted} delay="300" error={errors.confirmPassword}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
                  />

                  {/* reCAPTCHA */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <ReCAPTCHA
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                      theme="dark"
                      onChange={(token) => { setCaptchaToken(token); if (errors.captcha) setErrors(p => ({ ...p, captcha: undefined })); }}
                      onExpired={() => setCaptchaToken(null)}
                      onErrored={() => setCaptchaToken(null)}
                    />
                    {errors.captcha && (
                      <p className="text-red-300 text-xs flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                        {errors.captcha}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* ════════════════════════════════
                  SUPPLIER STEP 2 — Company Info
              ════════════════════════════════ */}
              {activeTab === "supplier" && currentStep === 2 && (
                <>
                  <AnimatedField label={t('companyName')} name="companyName" type="text"
                    placeholder="e.g. Al-Rashid Trading Co." value={formData.companyName} onChange={handleChange}
                    mounted={mounted} delay="100" error={errors.companyName}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}
                  />

                  <AnimatedField label={t('crNo')} name="crNumber" type="text"
                    placeholder="e.g. 1234567890" value={formData.crNumber} onChange={handleChange}
                    mounted={mounted} delay="150" error={errors.crNumber}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
                  />

                  <AnimatedField label={t('vatNumber')} name="vatNumber" type="text"
                    placeholder="e.g. 300XXXXXXXXX1003" value={formData.vatNumber} onChange={handleChange}
                    mounted={mounted} delay="200" error={errors.vatNumber}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>}
                  />

                  <SelectField label="Business Type" name="businessType" value={formData.businessType}
                    onChange={handleChange} options={BUSINESS_TYPES} error={errors.businessType}
                    mounted={mounted} delay="250"
                  />

                  <AnimatedField label="Head Office Location" name="headOfficeLocation" type="text"
                    placeholder="e.g. Riyadh, Saudi Arabia" value={formData.headOfficeLocation} onChange={handleChange}
                    mounted={mounted} delay="300" error={errors.headOfficeLocation}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
                  />
                </>
              )}

              {/* ════════════════════════════════
                  SUPPLIER STEP 3 — Contact Person
              ════════════════════════════════ */}
              {activeTab === "supplier" && currentStep === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatedField label="First Name" name="contactFirstName" type="text"
                      placeholder="Ahmed" value={formData.contactFirstName} onChange={handleChange}
                      mounted={mounted} delay="100" error={errors.contactFirstName}
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                    />
                    <AnimatedField label="Last Name" name="contactLastName" type="text"
                      placeholder="Al-Rashid" value={formData.contactLastName} onChange={handleChange}
                      mounted={mounted} delay="150" error={errors.contactLastName}
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                    />
                  </div>

                  <AnimatedField label="Job Title" name="contactJobTitle" type="text"
                    placeholder="e.g. Procurement Manager" value={formData.contactJobTitle} onChange={handleChange}
                    mounted={mounted} delay="200" error={errors.contactJobTitle}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                  />

                  <AnimatedField label="Phone Number" name="contactPhone" type="tel"
                    placeholder="+966 5X XXX XXXX" value={formData.contactPhone} onChange={handleChange}
                    mounted={mounted} delay="250" error={errors.contactPhone}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
                  />

                  <AnimatedField label="WhatsApp (optional)" name="whatsapp" type="tel"
                    placeholder="+966 5X XXX XXXX" value={formData.whatsapp} onChange={handleChange}
                    mounted={mounted} delay="300" error={errors.whatsapp}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>}
                  />
                </>
              )}

              {/* ════════════════════════════════
                  STAFF STEP 2 — Personal Info
              ════════════════════════════════ */}
              {activeTab === "staff" && currentStep === 2 && (
                <>
                  <AnimatedField label={t('fullName')} name="fullName" type="text"
                    placeholder="e.g. Mohammed Al-Ahmad" value={formData.fullName} onChange={handleChange}
                    mounted={mounted} delay="100" error={errors.fullName}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
                  />

                  <AnimatedField label={`${t('employeeNumber')} *`} name="employeeNumber" type="text"
                    placeholder="e.g. EMP-00123" value={formData.employeeNumber} onChange={handleChange}
                    mounted={mounted} delay="150" error={errors.employeeNumber}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>}
                  />

                  <AnimatedField label={t('jobTitle')} name="jobTitle" type="text"
                    placeholder="e.g. Procurement Officer" value={formData.jobTitle} onChange={handleChange}
                    mounted={mounted} delay="200" error={errors.jobTitle}
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                  />

                  <SelectField label="Department" name="department" value={formData.department}
                    onChange={handleChange} options={DEPARTMENTS} error={errors.department}
                    mounted={mounted} delay="250"
                  />
                </>
              )}

              {/* ════════════════════════════════
                  REVIEW & SUBMIT — final step
              ════════════════════════════════ */}
              {((activeTab === "supplier" && currentStep === 4) || (activeTab === "staff" && currentStep === 3)) && (
                <>
                  {/* Summary card */}
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
                    {/* Account section */}
                    <div>
                      <h3 className="text-[#B8960A] font-bold text-xs uppercase tracking-widest mb-3">Account</h3>
                      <div className="space-y-2">
                        <ReviewRow label="Email" value={formData.email} />
                        <ReviewRow label="Password" value="••••••••" />
                      </div>
                    </div>

                    {activeTab === "supplier" && (
                      <>
                        <div className="border-t border-white/10 pt-4">
                          <h3 className="text-[#B8960A] font-bold text-xs uppercase tracking-widest mb-3">Company</h3>
                          <div className="space-y-2">
                            <ReviewRow label="Company Name"  value={formData.companyName} />
                            <ReviewRow label="CR Number"     value={formData.crNumber} />
                            <ReviewRow label="VAT Number"    value={formData.vatNumber} />
                            <ReviewRow label="Business Type" value={formData.businessType} />
                            <ReviewRow label="Head Office"   value={formData.headOfficeLocation} />
                          </div>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                          <h3 className="text-[#B8960A] font-bold text-xs uppercase tracking-widest mb-3">Contact Person</h3>
                          <div className="space-y-2">
                            <ReviewRow label="Name"      value={`${formData.contactFirstName} ${formData.contactLastName}`.trim()} />
                            <ReviewRow label="Job Title" value={formData.contactJobTitle} />
                            <ReviewRow label="Phone"     value={formData.contactPhone} />
                            {formData.whatsapp && <ReviewRow label="WhatsApp" value={formData.whatsapp} />}
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === "staff" && (
                      <div className="border-t border-white/10 pt-4">
                        <h3 className="text-[#B8960A] font-bold text-xs uppercase tracking-widest mb-3">Staff Details</h3>
                        <div className="space-y-2">
                          <ReviewRow label="Full Name"       value={formData.fullName} />
                          <ReviewRow label="Employee No."    value={formData.employeeNumber} />
                          <ReviewRow label="Job Title"       value={formData.jobTitle} />
                          <ReviewRow label="Department"      value={formData.department} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* T&C checkbox */}
                  <div className="mt-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" name="agreeToTerms" id="agreeToTerms"
                        checked={formData.agreeToTerms} onChange={handleChange}
                        className="mt-0.5 w-5 h-5 rounded border-white/30 bg-white/10 focus:ring-yellow-500 focus:ring-offset-0 text-yellow-600 flex-shrink-0"
                      />
                      <label htmlFor="agreeToTerms" className="text-sm text-white/90 leading-relaxed">
                        I agree to the{" "}
                        <button type="button" onClick={() => setShowTermsModal(true)}
                          className="text-yellow-300 hover:text-yellow-200 underline underline-offset-2 font-medium transition-colors">
                          Terms &amp; Conditions and Privacy Policy
                        </button>
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-red-300 text-xs mt-2 ml-8 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>
                </>
              )}

            </div>{/* /space-y-4 */}

            {/* ── Navigation Buttons ── */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <button type="button" onClick={handleBack}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-2xl font-bold border border-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
                  Back
                </button>
              )}

              {currentStep < totalSteps ? (
                <button type="button" onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-[#B8960A] to-yellow-600 text-white py-3.5 rounded-2xl font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center gap-2">
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </button>
              ) : (
                <button type="submit" disabled={loading || !formData.agreeToTerms}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 py-3.5 rounded-2xl font-bold transition-all duration-500 hover:from-yellow-400 hover:to-yellow-500 hover:-translate-y-0.5 shadow-2xl hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden border border-yellow-400/30">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      <span className="animate-pulse font-semibold">{t('creatingAccount')}</span>
                    </div>
                  ) : (
                    <span className="relative flex items-center justify-center gap-2 font-bold">
                      {t('completeRegistration')}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    </span>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className={`text-center mt-8 transform transition-all duration-700 delay-600 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <p className="text-sm text-white/90">
              {t('alreadyHaveAccount')}{" "}
              <a href="/login" className="text-yellow-300 hover:text-yellow-200 font-semibold underline underline-offset-4 hover:underline-offset-2 transition-all duration-300 inline-flex items-center gap-1 group hover:scale-105">
                {t('login')}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </p>
          </div>

        </div>
      </div>
    </AuthLayoutV2>
  );
}

// ─── Main export wrapped in Suspense (required for useSearchParams) ───────────
export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}
