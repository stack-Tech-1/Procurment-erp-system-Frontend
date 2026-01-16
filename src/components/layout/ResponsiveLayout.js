// frontend/src/components/layout/ResponsiveLayout.js - CORRECTED
"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  X, 
  LogOut,
  Bell,
  UserCircle2,
  ChevronDown,
  Building,
  RefreshCw,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { getNavigationItems } from '@/utils/navigation';
import { ROLES, ROLE_NAMES } from '@/constants/roles';

export default function ResponsiveLayout({ children }) {
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [navItems, setNavItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load user data and navigation items
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setNavItems(getNavigationItems(user.roleId));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(savedLang);
    i18n.changeLanguage(savedLang);
    
    // Set initial document direction
    if (savedLang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = savedLang;
    }
  }, [i18n]);

  // Detect screen size for mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkScreenSize();
    
    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Language change handler
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    localStorage.setItem('preferred-language', lang);
    setLanguageMenuOpen(false);
    
    // Update document direction for RTL languages
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Get dashboard title with translations
  const getDashboardTitle = () => {
    if (!userData) return { 
      title: t('dashboard'), 
      subtitle: t('loading'),
      icon: (
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 mr-3">
          <span className="text-white font-bold text-base">KUN</span>
        </div>
      ) 
    };
    
    const roles = {
      1: { 
        title: t('executiveDashboard'), 
        subtitle: t('executiveOverview'),
        icon: (
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 mr-3">
            <span className="text-white font-bold text-base">KUN</span>
          </div>
        ) 
      },
      2: { 
        title: t('managerDashboard'), 
        subtitle: t('procurementManagerDashboard'),
        icon: (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/20 mr-3">
            <span className="text-white font-bold text-base">KUN</span>
          </div>
        ) 
      },
      3: { 
        title: t('officerDashboard'), 
        subtitle: t('procurementOfficerDashboard'),
        icon: (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mr-3">
            <span className="text-white font-bold text-base">KUN</span>
          </div>
        ) 
      },
      4: { 
        title: t('vendorPortal'), 
        subtitle: t('vendorDashboard'),
        icon: (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 mr-3">
            <span className="text-white font-bold text-base">KUN</span>
          </div>
        ) 
      }
    };
    
    return roles[userData.roleId] || roles[3];
  };

  // Add language switcher component
  const LanguageSwitcher = () => (
    <div className="relative">
      <button
        className="flex items-center gap-2 p-2 text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
        onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
      >
        <Globe size={20} />
        <span className="text-sm font-medium">
          {currentLanguage === 'en' ? 'EN' : 'عربي'}
        </span>
        <ChevronDown size={16} className={`transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {languageMenuOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 w-32">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
              currentLanguage === 'en' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
            }`}
          >
            <span className={`w-6 h-4 rounded border flex items-center justify-center ${
              currentLanguage === 'en' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 border-gray-300'
            }`}>
              EN
            </span>
            English
          </button>
          <button
            onClick={() => handleLanguageChange('ar')}
            className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
              currentLanguage === 'ar' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
            }`}
          >
            <span className={`w-6 h-4 rounded border flex items-center justify-center ${
              currentLanguage === 'ar' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 border-gray-300'
            }`}>
              ع
            </span>
            العربية
          </button>
        </div>
      )}
    </div>
  );

  const dashboardInfo = getDashboardTitle();

  return (
    <div className="flex min-h-screen bg-gray-50" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        bg-slate-900 text-gray-100 flex flex-col
        ${isMobile 
          ? `fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'w-64 min-h-screen'
        }
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 mb-2">
              <span className="text-white font-bold text-2xl">KUN</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white leading-tight">
                {t('kunRealEstate')}
              </h1>
              <p className="text-sm text-gray-300">{t('procurementSystem')}</p>
            </div>
          </div>
          
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-slate-800 rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && setSidebarOpen(false)}
              className="flex items-center gap-3 px-6 py-4 text-base hover:bg-slate-800 hover:text-indigo-400 transition-colors border-l-4 border-transparent hover:border-indigo-400"
            >
              {item.icon}
              {/* Use translation key if available, fallback to name */}
              <span>{t(item.translationKey || item.name.toLowerCase().replace(/\s+/g, ''))}</span>
            </Link>
          ))}
        </nav>

        {/* Footer with Language Switcher - Desktop */}
        {!isMobile && userData && (
          <div className="p-4 border-t border-slate-700 mt-auto bg-slate-800/30">
            <div className="mb-3 px-2 py-1 text-sm">
              <div className="font-medium text-white truncate">{userData.name || userData.email}</div>
              <div className="text-gray-300 text-xs mt-1">
                {t(ROLE_NAMES[userData.roleId]?.toLowerCase() || 'user')}
              </div>
              {userData.department && (
                <div className="text-gray-400 text-xs mt-1">{userData.department}</div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-sm text-gray-400 hover:text-red-400 transition w-full px-2 py-2 hover:bg-slate-700 rounded-lg"
            >
              <LogOut size={18} /> {t('logout')}
            </button>
          </div>
        )}

        {/* Mobile User Info */}
        {isMobile && userData && (
          <div className="p-4 border-t border-slate-700 bg-slate-800/50 mt-auto">
            <div className="text-center">
              <div className="font-medium text-white truncate">{userData.name || userData.email}</div>
              <div className="text-gray-300 text-sm mt-1">
                {t(ROLE_NAMES[userData.roleId]?.toLowerCase() || 'user')}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isMobile ? 'ml-0' : ''}`}>
        {/* TOPBAR */}
        <header className="flex justify-between items-center bg-white shadow-sm border-b border-gray-100">
          <div className={`flex items-center gap-3 ${isMobile ? 'px-4 py-3' : 'px-8 py-4'}`}>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            
            <div className="flex items-center gap-3">
              {dashboardInfo.icon}
              <div>
                <h1 className={`font-semibold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {dashboardInfo.title}
                </h1>
                <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {dashboardInfo.subtitle}  
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Section */}
          <div className={`flex items-center gap-3 ${isMobile ? 'px-4 py-3' : 'px-8 py-4'}`}>
            {/* Language Switcher - Mobile & Desktop */}
            <LanguageSwitcher />
            
            {/* Refresh Button */}
            <button 
              onClick={() => window.location.reload()}
              className="p-2 text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
              title={t('refreshDashboard')}
            >
              <RefreshCw size={20} />
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all">
              <Bell size={20} />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button 
                className={`flex items-center gap-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  isMobile ? 'p-1' : 'p-2'
                }`}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <UserCircle2 size={isMobile ? 32 : 36} className="text-indigo-600" />
                {!isMobile && userData && (
                  <div className="text-left">
                    <p className="font-medium text-gray-800 text-sm">
                      {userData.name || "User Name"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t(ROLE_NAMES[userData.roleId]?.toLowerCase() || 'procurementManager')}
                    </p>
                  </div>
                )}
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className={`absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 ${
                  isMobile ? 'w-48' : 'w-64'
                }`}>
                  {userData && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-800 text-sm">{userData.name}</p>
                      <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                      {/* Show translated role in dropdown */}
                      <p className="text-xs text-gray-400 mt-1">
                        {t(ROLE_NAMES[userData.roleId]?.toLowerCase() || 'procurementManager')}
                      </p>
                    </div>
                  )}
                  
                  {!isMobile && (
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      {t('accountSettings')}
                    </button>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={`flex-1 overflow-auto ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for dropdowns */}
      {(userMenuOpen || languageMenuOpen || (isMobile && sidebarOpen)) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setLanguageMenuOpen(false);
            if (isMobile) setSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}