"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// --- START: Self-Contained AuthLayout Component ---
// This is included here so the SignupPage is runnable without needing Next.js aliases.
function AuthLayout({ children, background }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-inter">
      {/* Background Layer */}
      {background}

      {/* Content Layer (flexible to allow two columns) */}
      <div className="relative z-10 w-full min-h-screen lg:flex lg:justify-center">
        {children}
      </div>
      
      {/* Floating Decorative Elements (Fixed for full screen) */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, 10px) rotate(5deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes float-medium {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-15px, -15px) rotate(-3deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes shimmer {
          0% { transform: skewX(-12deg) translateX(-100%); }
          100% { transform: skewX(-12deg) translateX(200%); }
        }
        .animate-float-slow { animation: float-slow 15s infinite ease-in-out; }
        .animate-float-medium { animation: float-medium 12s infinite ease-in-out; }
        .animate-shimmer { animation: shimmer 5s infinite linear; }
        .border-3 { border-width: 3px; }
        
        .placeholder-white\\/70::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
    </div>
  );
}

// Helper component for animated input fields (Gold Themed)
function AnimatedField({ label, name, type, placeholder, value, onChange, mounted, delay, icon }) {
  return (
    <div
      className={`space-y-2 transform transition-all duration-700 delay-${delay} ${
        mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
        {/* Changed dot color to match gold theme */}
        <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse shadow-sm"></div>
        {label}
      </label>
      <div className="relative group">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all duration-300 text-white placeholder-white/70 shadow-lg hover:shadow-yellow-500/10 group-hover:border-yellow-400/30 font-medium"
          required
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {/* Ensure icon color uses gold/yellow */}
          {icon && (
            <div className="text-yellow-300 group-focus-within:text-yellow-200 group-hover:text-yellow-200 transition-all duration-300 drop-shadow-sm">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// --- END: Self-Contained AuthLayout Component and Helpers ---


export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessCode: "",
    intendedRole: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Basic setup for font and mounted state
    document.body.style.fontFamily = 'Inter, sans-serif';
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Real API call - using the backend endpoint from the old version
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          accessCode: formData.accessCode || "",
          intendedRole: formData.intendedRole || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      alert(data.message || "Account created successfully!");
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isStaffCode = formData.accessCode === "STAFF-ACCESS-2025";

  // Replicating the Navy/Gold theme background
  const backgroundElement = (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B35] via-[#1A365D] to-[#2D3748]">
      {/* Subtle background pattern (Dots) */}
      <div
        className="absolute inset-0 opacity-5 bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23ffffff'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Gold/Yellow accent elements (Subtle Glows) */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-yellow-500/5 to-yellow-300/10 rounded-full blur-3xl animate-float-medium"></div>
    </div>
  );

  return (
    <AuthLayout background={backgroundElement}>
      {/* *** Two-Column Layout Container *** */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* === Left Column - Company Branding & Info === */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative bg-black/10">
          {/* Company Logo Area */}
          <div
            className={`text-center lg:text-left mb-8 transform transition-all duration-1000 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="inline-flex items-center justify-center lg:justify-start mb-6">
              {/* Logo Placeholder - Gold Themed */}
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
          </div>

          {/* About Panel (Reused from Login) */}
          <div
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 shadow-2xl mb-8 transform transition-all duration-1000 delay-200 ${
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

          {/* Trust Indicators (Reused from Login) */}
          <div
            className={`grid grid-cols-3 gap-4 text-center transform transition-all duration-1000 delay-400 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="text-white/70">
              <div className="text-lg lg:text-xl font-bold text-yellow-400">Secure</div>
              <div className="text-xs">Data Integrity</div>
            </div>
            <div className="text-white/70">
              <div className="text-lg lg:text-xl font-bold text-yellow-400">Fast</div>
              <div className="text-xs">Onboarding</div>
            </div>
            <div className="text-white/70">
              <div className="text-lg lg:text-xl font-bold text-yellow-400">Global</div>
              <div className="text-xs">Access</div>
            </div>
          </div>
        </div>

        {/* === Right Column - Signup Form === */}
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
              Start your supplier registration or staff setup process below.
            </p>
          </div>

          {/* Error Message (Themed) */}
          {error && (
            <div
              className={`bg-gradient-to-r from-red-500/40 to-orange-500/40 text-white text-sm p-4 rounded-2xl mb-6 text-center border border-red-300/50 backdrop-blur-sm transform transition-all duration-500 shadow-lg ${
                mounted ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-md">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-white drop-shadow-sm">
                  {error}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <AnimatedField
              label="Full Name / Company Representative"
              name="name"
              type="text"
              placeholder="John Smith or Company Name"
              value={formData.name}
              onChange={handleChange}
              mounted={mounted}
              delay="100"
              icon={
                <svg className="w-6 h-6 text-yellow-300 group-focus-within:text-yellow-200 group-hover:text-yellow-200 transition-all duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            {/* Email */}
            <AnimatedField
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              mounted={mounted}
              delay="200"
              icon={
                <svg className="w-6 h-6 text-yellow-300 group-focus-within:text-yellow-200 group-hover:text-yellow-200 transition-all duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            {/* Password */}
            <AnimatedField
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              mounted={mounted}
              delay="300"
              icon={
                <svg className="w-6 h-6 text-yellow-300 group-focus-within:text-yellow-200 group-hover:text-yellow-200 transition-all duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {/* Confirm Password */}
            <AnimatedField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              mounted={mounted}
              delay="400"
              icon={
                <svg className="w-6 h-6 text-yellow-300 group-focus-within:text-yellow-200 group-hover:text-yellow-200 transition-all duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            {/* Access Code */}
            <div
              className={`space-y-2 transform transition-all duration-700 delay-500 ${
                mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              }`}
            >
              <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse shadow-sm"></div>
                Access Code (Staff Only)
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="accessCode"
                  placeholder="Enter staff code or leave blank for vendor registration"
                  value={formData.accessCode}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all duration-300 text-white placeholder-white/70 shadow-lg hover:shadow-yellow-500/10 group-hover:border-yellow-400/30 font-medium"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-6 h-6 text-yellow-300 group-focus-within:text-yellow-200 group-hover:text-yellow-200 transition-all duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-white/70 italic">
                {isStaffCode
                  ? "Staff code recognized! Please select your department below."
                  : "If you are a vendor, leave this field blank."}
              </p>
            </div>

            {/* Intended Role Dropdown (Only for Staff Code) */}
            {isStaffCode && (
              <div
                className={`space-y-2 transform transition-all duration-700 delay-600 ${
                  mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                }`}
              >
                <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-sm"></div>
                  Select Your Department
                </label>
                <div className="relative group">
                  <select
                    name="intendedRole"
                    value={formData.intendedRole}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300 text-white shadow-lg hover:shadow-yellow-500/20 group-hover:border-yellow-400/50 font-medium appearance-none [&>option]:text-gray-900"
                  >
                    <option value="" className="text-gray-900">Choose your department</option>
                    <option value="Accountant" className="text-gray-900">Accountant</option>
                    <option value="Procurement" className="text-gray-900">Procurement</option>
                    <option value="Secretary" className="text-gray-900">Secretary</option>
                    <option value="Logistics" className="text-gray-900">Logistics</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-6 h-6 text-yellow-300 group-focus-within:text-yellow-200 transition-all duration-300 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Submit Button (Themed Gold) */}
            <div
              className={`transform transition-all duration-700 delay-700 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 py-4 rounded-2xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-500 font-bold text-lg shadow-2xl hover:shadow-yellow-500/25 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-2xl group relative overflow-hidden border border-yellow-400/30"
              >
                {/* Animated background shine */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                {/* Loading State */}
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-3 border-gray-900 border-t-transparent rounded-full animate-spin shadow-sm" />
                    <span className="animate-pulse font-semibold">
                      Creating Account...
                    </span>
                  </div>
                ) : (
                  <span className="relative flex items-center justify-center gap-2 font-bold">
                    Register Account
                    <svg
                      className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 drop-shadow-sm"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Enhanced Footer Link */}
          <div
            className={`text-center mt-8 transform transition-all duration-700 delay-800 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <p className="text-sm text-white/90">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-yellow-300 hover:text-yellow-200 font-semibold underline underline-offset-4 hover:underline-offset-2 transition-all duration-300 inline-flex items-center gap-1 group hover:scale-105"
              >
                Sign in here
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
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/50 text-sm">
          © 2025 KUN Real Estate – Procurement Division
        </p>
      </div>
    </AuthLayout>
  );
}