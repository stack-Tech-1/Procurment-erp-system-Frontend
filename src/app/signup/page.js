// C:\Users\SMC\Documents\GitHub\procurement-erp-system\frontend\src\app\signup\page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayoutV2 from "@/components/layout/AuthLayoutV2";
import { useTranslation } from "@/lib/i18n";
import loadRecaptcha from "@/utils/loadRecaptcha";




// Helper component for animated input fields
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
          required={!error}
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
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Password Strength Indicator Component
function PasswordStrengthIndicator({ password }) {
  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-yellow-400", "bg-green-500"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-white/70">Password Strength:</span>
        <span className={`font-semibold ${strength === 0 ? "text-red-300" : strength === 1 ? "text-orange-300" : strength === 2 ? "text-yellow-300" : strength === 3 ? "text-yellow-200" : "text-green-300"}`}>
          {strengthLabels[strength]}
        </span>
      </div>
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className={`h-1 flex-1 rounded-full transition-all duration-500 ${index <= strength ? strengthColors[strength] : "bg-white/20"}`} />
        ))}
      </div>
      <ul className="text-xs text-white/70 space-y-1 mt-2">
        <li className={`flex items-center gap-2 ${password.length >= 8 ? "text-green-300" : ""}`}>
          <svg className={`w-3 h-3 ${password.length >= 8 ? "text-green-400" : "text-white/30"}`} fill="currentColor" viewBox="0 0 20 20">
            {password.length >= 8 ? <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>}
          </svg>
          At least 8 characters
        </li>
        <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-300" : ""}`}>
          <svg className={`w-3 h-3 ${/[A-Z]/.test(password) ? "text-green-400" : "text-white/30"}`} fill="currentColor" viewBox="0 0 20 20">
            {/[A-Z]/.test(password) ? <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>}
          </svg>
          At least one uppercase letter
        </li>
        <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-300" : ""}`}>
          <svg className={`w-3 h-3 ${/[0-9]/.test(password) ? "text-green-400" : "text-white/30"}`} fill="currentColor" viewBox="0 0 20 20">
            {/[0-9]/.test(password) ? <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>}
          </svg>
          At least one number
        </li>
        <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? "text-green-300" : ""}`}>
          <svg className={`w-3 h-3 ${/[^A-Za-z0-9]/.test(password) ? "text-green-400" : "text-white/30"}`} fill="currentColor" viewBox="0 0 20 20">
            {/[^A-Za-z0-9]/.test(password) ? <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"/>}
          </svg>
          At least one special character
        </li>
      </ul>
    </div>
  );
}


export default function SignupPage() {
  const router = useRouter();
  const [currentLang] = useState("en");
  const { t } = useTranslation(currentLang);

  const [activeTab, setActiveTab] = useState("supplier");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessCode: "",
    intendedRole: "",
    companyName: "",
    phone: "",
    country: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);

  useEffect(() => {
    document.body.style.fontFamily = "Inter, sans-serif";
    setMounted(true);

    // load reCAPTCHA using shared util
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
    loadRecaptcha(siteKey).then((ok) => {
      setCaptchaLoaded(Boolean(ok));
      console.log("signup recaptcha loaded:", ok);
    });
  }, []);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (activeTab === "supplier") {
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    } else {
      if (!formData.accessCode.trim()) newErrors.accessCode = "Access code is required";
      if (!formData.intendedRole) newErrors.intendedRole = "Please select your department";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNextStep = () => {
    const stepErrors = validateStep1();
    if (Object.keys(stepErrors).length === 0) {
      setStep(2);
    } else {
      setErrors(stepErrors);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  // Execute CAPTCHA (Requirement #2)  
  const executeCaptcha = async () => {
    if (!window.grecaptcha || !captchaLoaded) {
      throw new Error("CAPTCHA not loaded. Please refresh the page.");
    }
    
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            { action: 'signup' }
          );
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate step 2
    const step2Errors = validateStep2();
    if (Object.keys(step2Errors).length > 0) {
      setErrors(step2Errors);
      return;
    }

    // Execute CAPTCHA
    setLoading(true);
    try {
      // Get CAPTCHA token
      const token = await executeCaptcha();
      
       // Verify CAPTCHA with backend
       const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-captcha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captchaToken: token }),
      });
      
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error("Security verification failed. Please try again.");
      }

      
      // API call
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userType: activeTab,
          captchaToken: token,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Handle specific backend errors (Requirement #9)
        if (data.error?.includes("email")) {
          throw new Error("This email is already registered. Please use a different email or try logging in.");
        } else if (data.error?.includes("access code")) {
          throw new Error("Invalid access code. Please check with your administrator.");
        } else {
          throw new Error(data.error || "Registration failed. Please try again.");
        }
      }

      alert("Account created successfully! Please check your email for verification.");
      router.push("/login");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Progress Indicator (Requirement #8)
  const progressSteps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: activeTab === "supplier" ? "Company Details" : "Staff Details" },
    { number: 3, title: "Complete" }
  ];

  const backgroundElement = (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B35] via-[#1A365D] to-[#2D3748]">
      <div className="absolute inset-0 opacity-5 bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23ffffff'/%3E%3C/svg%3E")` }} />
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-yellow-500/5 to-yellow-300/10 rounded-full blur-3xl animate-float-medium"></div>
    </div>
  );

  return (
    <AuthLayoutV2 background={backgroundElement} showGlobalHeader={true}>
      {/* Two-Column Layout Container */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Column - Company Branding & Info */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative bg-black/10">
          {/* Company Logo Area */}
          <div
            className={`text-center lg:text-left mb-8 transform transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="inline-flex items-center justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 mr-4">
                <span className="text-white font-bold text-xl">KUN</span>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  KUN Real Estate
                </h1>
                <p className="text-white/70 text-sm lg:text-base">
                  Supplier & Staff Registration
                </p>
              </div>
            </div>

            {/* Tagline */}
            <div className="mb-8">
              <p className="text-xl lg:text-2xl font-light text-white italic text-center lg:text-left leading-relaxed">
                &ldquo;Your gateway to partnering with KUN Real Estate.&rdquo;
              </p>
            </div>

            {/* Learn More Button (Requirement #7) */}
            <div className="mb-8">
            <a
              href="/about"
              className="inline-flex items-center gap-2 text-yellow-300 hover:text-yellow-200 font-semibold transition-all duration-300 group"
            >
              <span>Learn More About Our Company</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
          </div>

          {/* Progress Indicator (Requirement #8) - Only show on step 2 */}
          {step > 1 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {progressSteps.map((stepItem, index) => (
                  <div key={stepItem.number} className="flex flex-col items-center relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      step === stepItem.number 
                        ? 'bg-yellow-500 border-yellow-500 text-white' 
                        : step > stepItem.number
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-white/30 text-white/30'
                    }`}>
                      {step > stepItem.number ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepItem.number
                      )}
                    </div>
                    <span className={`text-xs mt-2 transition-all duration-500 ${
                      step === stepItem.number ? 'text-yellow-300 font-bold' : 'text-white/50'
                    }`}>
                      {stepItem.title}
                    </span>
                    {index < progressSteps.length - 1 && (
                      <div className={`absolute top-5 left-full w-full h-0.5 -ml-1 transition-all duration-500 ${
                        step > stepItem.number ? 'bg-green-500' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-white/70 text-center text-sm">
                Step {step} of {progressSteps.length}: {progressSteps[step - 1]?.title}
              </p>
            </div>
          )}

          {/* About Panel */}
          <div
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 shadow-2xl mb-8 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
              Who Can Register?
            </h3>
            <div className="space-y-3 text-white/80 text-sm lg:text-base leading-relaxed">
              <p>
                **Vendors/Suppliers:** Register your company to participate in our Request for Quotation (RFQ) processes and manage contracts.
              </p>
              <p>
                **Staff:** Use your internal access code to create an account and join the Procurement & Contracts department.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Signup Form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white/5 backdrop-blur-md lg:rounded-l-3xl border-l border-white/10">
          {/* Welcome Message */}
          <div
            className={`text-center mb-8 transform transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
            }`}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Create Your ProcureTrack Account
            </h2>
            <p className="text-white/70 text-sm lg:text-base">
              Step {step}: {step === 1 ? "Enter your basic information" : activeTab === "supplier" ? "Enter company details" : "Enter staff information"}
            </p>
          </div>

          {/* Registration Type Tabs (Requirement #6) */}
          {step === 1 && (
            <div className="mb-8">
              <div className="flex border-b border-white/20">
                <button
                  type="button"
                  onClick={() => setActiveTab("supplier")}
                  className={`flex-1 py-3 text-sm font-semibold transition-all duration-300 ${
                    activeTab === "supplier"
                      ? "text-yellow-300 border-b-2 border-yellow-300"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Supplier Registration
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("staff")}
                  className={`flex-1 py-3 text-sm font-semibold transition-all duration-300 ${
                    activeTab === "staff"
                      ? "text-yellow-300 border-b-2 border-yellow-300"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Staff Registration
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-gradient-to-r from-red-500/40 to-orange-500/40 text-white text-sm p-4 rounded-2xl mb-6 text-center border border-red-300/50 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="font-semibold text-white drop-shadow-sm">
                  {errors.submit}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }}>
            {step === 1 ? (
              <>
                {/* Name */}
                <AnimatedField
                  label={t('Full Name / Company Representative')}
                  name="name"
                  type="text"
                  placeholder="John Smith or Company Name"
                  value={formData.name}
                  onChange={handleChange}
                  mounted={mounted}
                  delay="100"
                  error={errors.name}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                {/* Email */}
                <AnimatedField
                  label={t('Email Address')}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  mounted={mounted}
                  delay="200"
                  error={errors.email}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                {/* Password */}
                <div className={`space-y-2 transform transition-all duration-700 delay-300 ${mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
                  <AnimatedField                    
                    label={t('Password')}
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    mounted={mounted}
                    delay="300"
                    error={errors.password}
                    icon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />
                  <PasswordStrengthIndicator password={formData.password} />
                </div>

                {/* Confirm Password */}
                <AnimatedField                  
                  label={t('Confirm Password')}
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  mounted={mounted}
                  delay="400"
                  error={errors.confirmPassword}
                  icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  }
                />

                {/* Terms & Conditions Checkbox (Requirement #3) */}
                <div className={`mt-6 transform transition-all duration-700 delay-500 ${mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 focus:ring-yellow-500 focus:ring-offset-0 text-yellow-600"
                    />
                    <label htmlFor="agreeToTerms" className="text-sm text-white/90">
                      I agree to the{" "}
                      <a href="/terms" className="text-yellow-300 hover:text-yellow-200 underline">
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-yellow-300 hover:text-yellow-200 underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-red-300 text-xs mt-1 ml-8">{errors.agreeToTerms}</p>
                  )}
                </div>

                {/* Next Step Button */}
                <div className={`mt-8 transform transition-all duration-700 delay-600 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 py-4 rounded-2xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-500 font-bold text-lg shadow-2xl hover:shadow-yellow-500/25 transform hover:-translate-y-1 group relative overflow-hidden border border-yellow-400/30"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                    <span className="relative flex items-center justify-center gap-2 font-bold">
                      Continue to Step 2
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Step 2 Content */}
                {activeTab === "supplier" ? (
                  <>
                    {/* Company Name */}
                    <AnimatedField
                      label={t('Company Name')}
                      name="companyName"
                      type="text"
                      placeholder="Your Company Name"
                      value={formData.companyName}
                      onChange={handleChange}
                      mounted={mounted}
                      delay="100"
                      error={errors.companyName}
                      icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      }
                    />

                    {/* Phone */}
                    <AnimatedField
                      label={t('Phone Number')}
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleChange}
                      mounted={mounted}
                      delay="200"
                      error={errors.phone}
                      icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      }
                    />

                    {/* Country */}
                    <AnimatedField
                      label={t('Country')}
                      name="country"
                      type="text"
                      placeholder="Your Country"
                      value={formData.country}
                      onChange={handleChange}
                      mounted={mounted}
                      delay="300"
                      error={errors.country}
                      icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                  </>
                ) : (
                  <>
                    {/* Access Code */}
                    <AnimatedField                      
                      label={t('Staff Access Code')}
                      name="accessCode"
                      type="text"
                      placeholder="Enter staff access code"
                      value={formData.accessCode}
                      onChange={handleChange}
                      mounted={mounted}
                      delay="100"
                      error={errors.accessCode}
                      icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      }
                    />

                    {/* Department Dropdown */}
                    <div className={`space-y-2 transform transition-all duration-700 delay-200 ${mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
                      <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${errors.intendedRole ? 'bg-red-400' : 'bg-gradient-to-r from-yellow-400 to-orange-400'}`}></div>
                        Select Your Department
                      </label>
                      <div className="relative group">
                        <select
                          name="intendedRole"
                          value={formData.intendedRole}
                          onChange={handleChange}
                          className={`w-full p-4 bg-white/10 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 text-white shadow-lg font-medium appearance-none ${
                            errors.intendedRole 
                              ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/30' 
                              : 'border-white/20 focus:ring-yellow-400/50 focus:border-yellow-400 hover:border-yellow-400/50'
                          }`}
                        >
                          <option value="" className="text-gray-900">Choose your department</option>
                          <option value="Accountant" className="text-gray-900">Accountant</option>
                          <option value="Procurement" className="text-gray-900">Procurement</option>
                          <option value="Secretary" className="text-gray-900">Secretary</option>
                          <option value="Logistics" className="text-gray-900">Logistics</option>
                          <option value="Executive" className="text-gray-900">Executive</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <svg className={`w-6 h-6 transition-all duration-300 drop-shadow-sm ${errors.intendedRole ? 'text-red-300' : 'text-yellow-300 group-focus-within:text-yellow-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors.intendedRole && (
                        <p className="text-red-300 text-xs mt-1">{errors.intendedRole}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl transition-all duration-500 font-bold text-lg border border-white/20 hover:border-white/40"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 py-4 rounded-2xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-500 font-bold text-lg shadow-2xl hover:shadow-yellow-500/25 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-2xl group relative overflow-hidden border border-yellow-400/30"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-gray-900 border-t-transparent rounded-full animate-spin shadow-sm" />
                        <span className="animate-pulse font-semibold">
                          Creating Account...
                        </span>
                      </div>
                    ) : (
                      <span className="relative flex items-center justify-center gap-2 font-bold">
                        Complete Registration
                        <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Enhanced Footer Link */}
          <div className={`text-center mt-8 transform transition-all duration-700 delay-800 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <p className="text-sm text-white/90">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-yellow-300 hover:text-yellow-200 font-semibold underline underline-offset-4 hover:underline-offset-2 transition-all duration-300 inline-flex items-center gap-1 group hover:scale-105"
              >
                Sign in here
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