"use client";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const handleChange = (lang) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
      >
        <Globe size={20} />
        <span className="text-sm font-medium">{currentLang === 'ar' ? 'عربي' : 'EN'}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 w-32">
            {[['en', 'English', 'EN'], ['ar', 'العربية', 'ع']].map(([lang, label, flag]) => (
              <button
                key={lang}
                onClick={() => handleChange(lang)}
                className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  currentLang === lang ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-700'
                }`}
              >
                <span className="w-6 h-4 text-xs rounded border flex items-center justify-center bg-gray-100 border-gray-300 font-bold">
                  {flag}
                </span>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
