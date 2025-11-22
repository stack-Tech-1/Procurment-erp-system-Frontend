"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      // Save token & user
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      //Redirect based on role Id

      if (data.user.roleId === 1) 
        router.push("/dashboard/executive");
      else if (data.user.roleId === 2)
        router.push("/dashboard/manager");
      else if (data.user.roleId === 3)
        router.push("/dashboard/officer");
      else if (data.user.roleId === 4)
        router.push("/dashboard/vendor-dashboard");
      else 
        router.push("/");


    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your procurement dashboard"
      // Updated background to reflect Navy/Violet/Gold theme
      background={
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
      }
    >
      {/* *** CRITICAL FIX: Ensure the parent container has flex and min-h-screen ***
      This is the key to making the two halves sit side-by-side correctly.
      I've confirmed the min-h-screen is on this parent div.
      */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* === Left Column - Company Branding & Info (Points 1 & 2) === */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative bg-black/10">
          {/* Company Logo Area (Point 1) */}
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
                  Procurement & Contracts Department
                </p>
              </div>
            </div>

            {/* Tagline (Point 1) */}
            <div className="mb-8">
              <p className="text-xl lg:text-2xl font-light text-white italic text-center lg:text-left leading-relaxed">
                &ldquo;Building excellence through trusted partnerships.&rdquo;
              </p>
            </div>
          </div>

          {/* About Panel (Point 2) */}
          <div
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 shadow-2xl mb-8 transform transition-all duration-1000 delay-200 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
              About KUN Real Estate
            </h3>
            <div className="space-y-3 text-white/80 text-sm lg:text-base leading-relaxed">
              <p>
                We are a leading developer and investment group in Saudi Arabia,
                managing large-scale hospitality, residential, and mixed-use projects.
              </p>
              <p>
                Our Procurement & Contracts Department connects with qualified suppliers
                and contractors who share our commitment to quality, safety, and timely delivery.
              </p>
            </div>
            {/* Learn More Button (Point 2) */}
            <a
              href="#" // Placeholder for company profile PDF/website
              className="mt-4 flex items-center text-yellow-300 hover:text-yellow-200 font-medium transition-colors duration-300 group"
            >
              Learn More
              <svg
                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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

          {/* Trust Indicators (Optional Addition) */}
          <div
            className={`grid grid-cols-3 gap-4 text-center transform transition-all duration-1000 delay-400 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="text-white/70">
              <div className="text-lg lg:text-xl font-bold text-yellow-400">50+</div>
              <div className="text-xs">Projects</div>
            </div>
            <div className="text-white/70">
              <div className="text-lg lg:text-xl font-bold text-yellow-400">200+</div>
              <div className="text-xs">Partners</div>
            </div>
            <div className="text-white/70">
              <div className="text-lg lg:text-xl font-bold text-yellow-400">15+</div>
              <div className="text-xs">Years</div>
            </div>
          </div>
        </div>

        {/* === Right Column - Login Form (Centered) === */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white/5 backdrop-blur-md lg:rounded-l-3xl border-l border-white/10">
          {/* Welcome Message (Point 4) */}
          <div
            className={`text-center mb-8 transform transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
            }`}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Welcome to KUN ProcureTrack
            </h2>
            <p className="text-white/70 text-sm lg:text-base">
              Sign in to access supplier registration, RFQs, and contract management
            </p>
          </div>

          {/* Error Message */}
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
            {/* Email Input */}
            <div
              className={`space-y-2 transform transition-all duration-700 delay-100 ${
                mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              }`}
            >
              <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse shadow-sm"></div>
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all duration-300 text-white placeholder-white/70 shadow-lg hover:shadow-yellow-500/10 group-hover:border-yellow-400/30 font-medium"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg
                    className="w-6 h-6 text-yellow-300 group-focus-within:text-yellow-200 group-hover:text-yellow-200 transition-all duration-300 drop-shadow-sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div
              className={`space-y-2 transform transition-all duration-700 delay-200 ${
                mounted ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              }`}
            >
              <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse shadow-sm"></div>
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all duration-300 text-white placeholder-white/70 shadow-lg hover:shadow-yellow-500/10 group-hover:border-yellow-400/30 font-medium"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg
                    className="w-6 h-6 text-yellow-300 group-focus-within:text-yellow-200 group-hover:text-yellow-200 transition-all duration-300 drop-shadow-sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Submit Button */}
            <div
              className={`transform transition-all duration-700 delay-300 ${
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
                      Signing In...
                    </span>
                  </div>
                ) : (
                  <span className="relative flex items-center justify-center gap-2 font-bold">
                    Access Dashboard
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

          {/* Enhanced Footer Links */}
          <div
            className={`flex justify-between text-sm mt-8 transform transition-all duration-700 delay-400 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <a
              href="/forgot-password"
              className="text-white/90 hover:text-yellow-300 font-semibold transition-all duration-300 inline-flex items-center gap-2 group hover:underline underline-offset-4 hover:scale-105"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-yellow-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Forgot Password?
            </a>

            <a
              href="/signup"
              className="text-white/90 hover:text-yellow-300 font-semibold transition-all duration-300 inline-flex items-center gap-2 group hover:underline underline-offset-4 hover:scale-105"
            >
              Create Account
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 text-yellow-300"
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
      </div>

      {/* Copyright Footer (Point 3) */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/50 text-sm">
          © 2025 KUN Real Estate – Procurement Division
        </p>
      </div>
    </AuthLayout>
  );
}