// frontend/src/app/login/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import AuthLayoutV2 from "@/components/layout/AuthLayoutV2";
import loadRecaptcha from "@/utils/loadRecaptcha";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation(); // ADD THIS HOOK
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  
  useEffect(() => {
    setMounted(true);
  
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.error("❌ Missing reCAPTCHA site key");
      return;
    }
  
    // Load reCAPTCHA script
    if (!window.__recaptchaScriptLoaded) {
      loadRecaptcha(siteKey).then((loaded) => {
        window.__recaptchaScriptLoaded = true;
  
        if (loaded) {
          // Render the v2 widget
          const widgetId = window.grecaptcha.render("recaptcha-container", {
            sitekey: siteKey,
            theme: "dark",
            callback: (token) => {
              console.log("✅ CAPTCHA verified, token:", token);
              setCaptchaToken(token);
            },
            "expired-callback": () => {
              console.log("⚠️ CAPTCHA expired");
              setCaptchaToken(null);
            },
            "error-callback": () => {
              console.log("❌ CAPTCHA error");
              setCaptchaToken(null);
            },
          });
  
          setCaptchaLoaded(true);
        } else {
          console.error("❌ Failed to load reCAPTCHA");
          setCaptchaLoaded(false);
        }
      });
    } else {
      // Already loaded, render again if needed
      if (window.grecaptcha && !captchaLoaded) {
        window.grecaptcha.render("recaptcha-container", {
          sitekey: siteKey,
          theme: "dark",
          callback: (token) => setCaptchaToken(token),
        });
        setCaptchaLoaded(true);
      }
    }
  
    return () => {
      delete window.onCaptchaSuccess;
      delete window.onCaptchaExpired;
      delete window.onCaptchaError;
    };
  }, []);
  
  

  // In both login and signup pages, update the executeCaptcha function:
const executeCaptcha = async () => {
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    console.log("🛠️ Development mode: using dummy CAPTCHA token");
    return "development-dummy-token-v2";
  }

  if (!window.grecaptcha || !captchaLoaded) {
    console.warn("⚠️ Captcha not loaded — falling back to testing token");
    return "testing-mode-token-v2";
  }
  
  return new Promise((resolve, reject) => {
    try {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            { action: 'login' } // Change to 'login' for login page
          );
          
          if (token) {
            console.log("✅ CAPTCHA token obtained");
            resolve(token);
          } else {
            console.warn("⚠️ Empty CAPTCHA token");
            resolve("empty-token-fallback");
          }
        } catch (err) {
          console.error("❌ grecaptcha.execute error:", err);
          resolve("execute-error-fallback");
        }
      });
    } catch (err) {
      console.error("❌ grecaptcha.ready error:", err);
      resolve("ready-error-fallback");
    }
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  
  // Check CAPTCHA
  if (!captchaToken) {
    setError("Please complete the security verification");
    return;
  }
  
  setLoading(true);
  
  try {
    // Verify CAPTCHA with backend
    const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-captcha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captchaToken }),
    });
    
    const verifyData = await verifyRes.json();
    console.log("CAPTCHA verification response:", verifyData);
    
    if (!verifyRes.ok || !verifyData.success) {
      throw new Error("Security verification failed. Please complete the CAPTCHA.");
    }
      const payload = { ...formData, captchaToken };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.roleId === 1) router.push("/dashboard/executive");
      else if (data.user.roleId === 2) router.push("/dashboard/manager");
      else if (data.user.roleId === 3) router.push("/dashboard/officer");
      else if (data.user.roleId === 4) router.push("/vendor-dashboard");
      else router.push("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const backgroundElement = (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0F1B35] via-[#1A365D] to-[#2D3748]">
      <div className="absolute inset-0 opacity-5 bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='1' fill='%23ffffff'/%3E%3C/svg%3E")` }} />
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-yellow-600/5 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-yellow-500/5 to-yellow-300/10 rounded-full blur-3xl animate-float-medium"></div>
    </div>
  );

  return (
    <AuthLayoutV2 background={backgroundElement} showGlobalHeader={true}>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left column (branding) - same as signup */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative bg-black/10">
          <div className={`text-center lg:text-left mb-8 transform transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <div className="inline-flex items-center justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 mr-4">
                <span className="text-white font-bold text-xl">KUN</span>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('welcome')} KUN Real Estate</h1>
                <p className="text-white/70 text-sm lg:text-base">{t('department')}</p>
              </div>
            </div>

            <div className="mb-8">
            <p className="text-xl lg:text-2xl font-light text-white italic text-center lg:text-left leading-relaxed">
                &ldquo;{t('buildingExcellence')}&rdquo;
              </p>
            </div>

            <div className="mb-8">
              <Link href="/about" className="inline-flex items-center gap-2 text-yellow-300 hover:text-yellow-200 font-semibold transition-all duration-300 group">
                <span>{t('learnMore')}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 shadow-2xl mb-8 transform transition-all duration-1000 delay-200 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
              {t('aboutCompany')}
            </h3>
            <div className="space-y-3 text-white/80 text-sm lg:text-base leading-relaxed">
              <p>{t('aboutDescription1')}</p>
              <p>{t('aboutDescription2')}</p>
            </div>
          </div>
        </div>

        {/* Right column: simple login form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white/5 backdrop-blur-md lg:rounded-l-3xl border-l border-white/10">
          <div className={`text-center mb-8 transform transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"}`}>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">{t('welcomeBack')}</h2>
            <p className="text-white/70 text-sm lg:text-base">{t('loginDescription')}</p>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-500/40 to-orange-500/40 text-white text-sm p-4 rounded-2xl mb-6 text-center border border-red-300/50 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse"></div>
                {t('email')}
              </label>
              <div className="relative group">
                <input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all duration-300 text-white placeholder-white/70 shadow-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse"></div>
                {t('password')}
              </label>
              <div className="relative group">
                <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all duration-300 text-white placeholder-white/70 shadow-lg" />
              </div>
              <div className="text-xs text-white/50 text-right">
                <Link href="/forgot-password" className="hover:text-yellow-300 transition-colors">{t('forgotPassword')}</Link>
              </div>
            </div>

            <div className="flex items-center">
              <input name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2" />
              <label className="ml-2 text-sm text-white">{t('rememberMe')}</label>
            </div>

            
            <div className="flex justify-center">
          <div id="recaptcha-container"></div>  {/* always empty for reCAPTCHA */}
          {!captchaLoaded && <div className="text-center text-white/70 text-sm py-2">{t('loading')}</div>}
        </div>


            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 py-4 rounded-2xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-500 font-bold text-lg shadow-2xl hover:shadow-yellow-500/25 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  <span className="font-semibold">{t('signingIn')}</span>
                </div>
              ) : (
                <span className="relative flex items-center justify-center gap-2 font-bold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {t('secureLogin')}
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-white/70 mb-4">{t('needAccount')}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup?type=supplier" className="flex-1 p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-white rounded-xl hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300 border border-blue-400/20 text-center">
                {t('registerAsSupplier')}
              </Link>
              <Link href="/signup?type=staff" className="flex-1 p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-white rounded-xl hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300 border border-purple-400/20 text-center">
                {t('registerAsStaff')}
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/help" className="text-white/70 hover:text-yellow-300 text-sm transition-colors">{t('needHelp')}</Link>
          </div>
        </div>
      </div>
    </AuthLayoutV2>
  );
}