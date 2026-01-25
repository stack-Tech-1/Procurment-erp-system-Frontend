// C:\Users\SMC\Documents\GitHub\procurement-erp-system\frontend\src\components\AuthLayout.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../lib/i18n";

export default function AuthLayout({
  children,
  background,
  showGlobalHeader = true,
}) {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState('en');
  const { t, i18n } = useTranslation(currentLang);

  useEffect(() => {
    // Initialize language
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    setCurrentLang(savedLang);
    
    // Update HTML direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    }
  }, []);

  const changeLanguage = (lng) => {
    setCurrentLang(lng);
    localStorage.setItem('preferred-language', lng);
    
    // Update HTML direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lng;
    }
    
    // Reload to apply changes
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-inter">
      {/* Global Header */}
      {showGlobalHeader && (
        <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0F1B35]/90 to-[#1A365D]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Logo & Company Name */}
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 cursor-pointer"
                  onClick={() => router.push('/')}
                >
                  <span className="text-white font-bold text-lg">KUN</span>
                </div>
                <div 
                  className="cursor-pointer"
                  onClick={() => router.push('/')}
                >
                  <h1 className="text-lg font-bold text-white">KUN Real Estate</h1>
                  <p className="text-white/70 text-xs">Procurement System</p>
                </div>
              </div>

              {/* Right Side Navigation */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Language Switcher */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="text-sm hidden sm:inline">{t('language')}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full text-left px-4 py-2 text-gray-800 hover:bg-yellow-50 transition-colors ${currentLang === 'en' ? 'bg-yellow-50 text-yellow-600' : ''}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => changeLanguage('ar')}
                        className={`w-full text-left px-4 py-2 text-gray-800 hover:bg-yellow-50 transition-colors ${currentLang === 'ar' ? 'bg-yellow-50 text-yellow-600' : ''}`}
                      >
                        العربية
                      </button>
                    </div>
                  </div>
                </div>

                {/* Help/Support Link */}
                <a
                  href="/support"
                  className="hidden sm:flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{t('help')}</span>
                </a>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Background Layer */}
      {background}

      {/* Content Layer */}
      <div className="flex-1 relative z-10 w-full">
        {children}
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            {/* Copyright */}
            <div className="text-white/60 text-xs md:text-sm text-center md:text-left">
              © 2025 KUN Real Estate – Procurement Division. All rights reserved.
            </div>
            
            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              <a href="/terms" className="text-white/70 hover:text-yellow-300 text-xs md:text-sm transition-colors duration-300">
                {t('terms')}
              </a>
              <a href="/privacy" className="text-white/70 hover:text-yellow-300 text-xs md:text-sm transition-colors duration-300">
                {t('privacy')}
              </a>
              <a href="/support" className="text-white/70 hover:text-yellow-300 text-xs md:text-sm transition-colors duration-300">
                {t('support')}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Decorative Elements Animation */}
      <style jsx global>{`
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
        .animate-float-slow { animation: float-slow 15s infinite ease-in-out; }
        .animate-float-medium { animation: float-medium 12s infinite ease-in-out; }
      `}</style>
    </div>
  );
}