"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accessCode: "",
    //intendedRole: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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

      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          accessCode: formData.accessCode || "",
          //intendedRole: formData.intendedRole || "",
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

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join our procurement ERP system"
    >
      {error && (
        <div
          className={`bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-100 text-sm p-4 rounded-2xl mb-6 text-center border border-red-400/30 backdrop-blur-sm transform transition-all duration-500 ${
            mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <AnimatedField
          label="Full Name"
          name="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          mounted={mounted}
          delay="100"
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
        />

        {/* Access Code */}
        <div
          className={`space-y-2 transform transition-all duration-700 delay-500 ${
            mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
          }`}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full animate-pulse"></div>
            Access Code (Optional)
          </label>
          <input
            type="text"
            name="accessCode"
            placeholder="Enter staff or admin access code"
            value={formData.accessCode}
            onChange={handleChange}
            className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
          />
          <p className="text-xs text-gray-500 italic">
            Leave blank if you're a vendor.
          </p>
        </div>

        {/* Intended Role Dropdown (Only for Staff Code) */}
        {isStaffCode && (
          <div
            className={`space-y-2 transform transition-all duration-700 delay-600 ${
              mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-pulse"></div>
              Select Your Department
            </label>
            <select
              name="intendedRole"
              value={formData.intendedRole}
              onChange={handleChange}
              required
              className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <option value="">Choose your department</option>
              <option value="Accountant">Accountant</option>
              <option value="Procurement">Procurement</option>
              <option value="Secretary">Secretary</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>
        )}

        {/* Submit Button */}
        <div
          className={`transform transition-all duration-700 delay-700 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg group relative overflow-hidden"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="animate-pulse">Creating Account...</span>
              </div>
            ) : (
              <span className="relative flex items-center justify-center gap-2">
                Get Started
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Footer Link */}
      <div 
        className={`text-center text-gray-600 mt-8 transform transition-all duration-700 delay-800 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <p className="text-sm">
          Already have an account?{" "}
          <a 
            href="/login" 
            className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-4 hover:underline-offset-2 transition-all duration-300 inline-flex items-center gap-1 group"
          >
            Sign in here
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}

// ✅ Fixed AnimatedField component
function AnimatedField({ label, name, type, placeholder, value, onChange, mounted, delay }) {
  return (
    <div
      className={`space-y-2 transform transition-all duration-700 delay-${delay} ${
        mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
        required
      />
    </div>
  );
}