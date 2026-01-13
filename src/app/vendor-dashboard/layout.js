// frontend/src/app/vendor-dashboard/layout.js
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Home, Send, ListOrdered, Briefcase, LogOut, Menu, X,
  Bell, UserCircle2, ChevronDown, FileText, BarChart3
} from 'lucide-react';

export default function VendorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [vendorData, setVendorData] = useState(null);
  const [quickStats, setQuickStats] = useState(null); // Just for quick stats
  const [loadingStats, setLoadingStats] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        console.log('🔄 Starting to fetch quick stats...');
        const token = localStorage.getItem('authToken');
        console.log('🔐 Token exists:', !!token);
        if (!token) return;
        
        setLoadingStats(true);
        
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`;
        console.log('🌐 Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📊 Full API response:', result);
          console.log('📊 result.success:', result.success);
          console.log('📊 result.data:', result.data);
          
          if (result.success && result.data) {
            const data = result.data;
            console.log('📦 Data structure:', {
              vendorInfo: data.vendorInfo,
              proposals: data.proposals,
              documents: data.documents,
              performance: data.performance
            });
            
            // Extract vendor info
            const vendorInfo = {
              companyName: data.vendorInfo?.companyName || data.vendorInfo?.companyLegalName || 'Vendor',
              email: data.vendorInfo?.email || 'vendor@company.com',
              status: data.vendorInfo?.status || 'NEEDS_RENEWAL',
              qualificationScore: data.vendorInfo?.qualificationScore || 0,
              vendorClass: data.vendorInfo?.vendorClass || 'D'
            };
            console.log('👤 Vendor info extracted:', vendorInfo);
            
            // Calculate active proposals (real logic)
            const activeProposals = Array.isArray(data.proposals) 
              ? data.proposals.filter(p => {
                  console.log('📝 Proposal:', p);
                  const status = p.status?.toLowerCase();
                  const isActive = status === 'pending review' || 
                                 status === 'submitted' ||
                                 status === 'under evaluation' ||
                                 status === 'technical evaluation';
                  console.log(`🔍 Proposal ${p.id} status: ${status}, isActive: ${isActive}`);
                  return isActive;
                }).length
              : 0;
            
            console.log('📋 Active proposals count:', activeProposals);
            
            // Get expiring documents
            const expiringDocs = data.documents?.expiring || 0;
            console.log('📄 Expiring documents:', expiringDocs);
            
            setVendorData(vendorInfo);
            setQuickStats({
              activeProposals,
              expiringDocs: data.documents?.expiring || 0,
              expiredDocs: data.documents?.expired || 0,  
              qualificationScore: data.vendorInfo?.qualificationScore || 0,
              vendorClass: data.vendorInfo?.vendorClass || 'D'
            });
            
            console.log('✅ Quick stats set:', {
              activeProposals,
              expiringDocs,
              qualificationScore: data.vendorInfo?.qualificationScore,
              vendorClass: data.vendorInfo?.vendorClass
            });
          } else {
            console.log('❌ API success is false or data is missing');
          }
        } else {
          console.log('❌ API response not ok');
          const errorText = await response.text();
          console.log('❌ Error response:', errorText);
        }
      } catch (error) {
        console.error('🚨 Error fetching quick stats:', error);
        
        // Set fallback data
        setQuickStats({
          activeProposals: 0,
          expiringDocs: 0,
          qualificationScore: 0,
          vendorClass: 'D'
        });
      } finally {
        setLoadingStats(false);
        console.log('🏁 Loading stats finished');
      }
    };
    
    fetchQuickStats();
  }, []);

  // Rest of your component remains the same...
  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/vendor-dashboard', 
      icon: <Home size={20} />,
      description: 'Overview and analytics'
    },
    { 
      name: 'Submit Proposal', 
      href: '/vendor-dashboard/proposal', 
      icon: <Send size={20} />,
      description: 'Respond to RFQs'
    },
    { 
      name: 'Track Submissions', 
      href: '/vendor-dashboard/tracker', 
      icon: <ListOrdered size={20} />,
      description: 'Monitor your proposals'
    },
    { 
      name: 'Information Requests', 
      href: '/vendor-dashboard/requests', 
      icon: <FileText size={20} />,
      description: 'View and respond to requests'
    },
    { 
      name: 'My Profile', 
      href: '/dashboard/vendors/profile', 
      icon: <Briefcase size={20} />,
      description: 'Company information'
    },
  ];

  const getStatusBadge = (status) => {
    const config = {
      'APPROVED': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Approved' },
      'UNDER_REVIEW': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Under Review' },
      'REJECTED': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Rejected' },
      'NEEDS_RENEWAL': { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Needs Renewal' }
    };
    
    const { color, label } = config[status] || config.APPROVED;
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${color}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar with KUN Branding */}
      <aside className={`
        bg-gradient-to-b from-slate-900 to-slate-800 text-gray-100 flex flex-col shadow-xl
        ${isMobile 
          ? `fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'w-80 min-h-screen'
        }
      `}>
        {/* Sidebar Header with KUN Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* KUN Logo Container */}
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30 mb-2">
              <span className="text-white font-bold text-2xl">KUN</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white leading-tight">
                KUN Real Estate
              </h1>
              <p className="text-sm text-gray-300">Vendor Portal</p>
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
          
          {/* Vendor Quick Info */}
          {vendorData && (
            <div className="mt-6 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-teal-300">Status</span>
                {getStatusBadge(vendorData.status)}
              </div>
              <div className="text-sm text-white font-medium truncate">
                {vendorData.companyName}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-300">Score:</span>
                <span className="text-xs font-medium text-teal-300">
                  {vendorData.qualificationScore || 0}/100
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setSidebarOpen(false)}
              className="flex items-start gap-4 px-6 py-4 hover:bg-slate-700/50 hover:text-teal-300 transition-all duration-200 group border-l-4 border-transparent hover:border-teal-400"
            >
              <div className="text-teal-400 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </div>
              </div>
            </Link>
          ))}
        </nav>

        {/* Enhanced Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 w-full px-3 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isMobile ? 'ml-0' : ''}`}>
        {/* Enhanced Topbar with KUN Branding */}
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className={`flex justify-between items-center ${isMobile ? 'px-4 py-3' : 'px-8 py-4'}`}>
            {/* Left: Menu & Title with KUN Logo */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              {isMobile && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                </button>
              )}
              
              {/* KUN Logo & Page Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 mr-3">
                  <span className="text-white font-bold text-base">KUN</span>
                </div>
                <div>
                  <h1 className={`font-semibold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Vendor Portal
                  </h1>
                  <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    KUN Real Estate - Procurement Department
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Notifications & User Menu */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">3</span>
                </span>
              </button>

              {/* Enhanced User Menu with Vendor Status */}
              <div className="relative">
                <button 
                  className={`flex items-center gap-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    isMobile ? 'p-2' : 'p-3'
                  }`}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-100 p-2 rounded-full">
                      <UserCircle2 className="text-teal-600" size={isMobile ? 20 : 24} />
                    </div>
                    {!isMobile && vendorData && (
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 text-sm">
                            {vendorData.companyName || "Vendor Company"}
                          </p>
                          {getStatusBadge(vendorData.status)}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">
                            {vendorData.email || "vendor@company.com"}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-teal-600 font-medium">
                            Score: {vendorData.qualificationScore || 0}/100
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className={`absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 ${
                    isMobile ? 'w-48' : 'w-64'
                  }`}>
                    {vendorData && (
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-800 text-sm">{vendorData.companyName}</p>
                          {getStatusBadge(vendorData.status)}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{vendorData.email}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-400">Qualification Score:</span>
                          <span className="text-xs font-medium text-teal-600">
                            {vendorData.qualificationScore || 0}/100
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">Vendor Class:</span>
                          <span className="text-xs font-medium text-blue-600">
                            {vendorData.vendorClass || "N/A"}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <UserCircle2 size={16} />
                        My Profile
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <BarChart3 size={16} />
                        Performance Analytics
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <FileText size={16} />
                        Documents & Compliance
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button 
                        onClick={() => {
                          localStorage.clear();
                          window.location.href = "/login";
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
           {/* Quick Stats Bar - Desktop Only */}
           {!isMobile && (
              <div className="px-8 pb-4">
                {loadingStats ? (
                  // Loading skeleton
                  <div className="grid grid-cols-5 gap-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="text-center p-3 bg-gray-100 rounded-lg border border-gray-200 animate-pulse">
                        <div className="h-8 w-12 bg-gray-300 rounded mx-auto mb-2"></div>
                        <div className="h-4 w-16 bg-gray-300 rounded mx-auto"></div>
                      </div>
                    ))}
                  </div>
                ) : vendorData ? (
                  // Real data when loaded
                  <div className="grid grid-cols-5 gap-4">
                    {/* Active Proposals */}
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">
                        {quickStats?.activeProposals || 0}
                      </div>
                      <div className="text-xs text-blue-800">Active Proposals</div>
                    </div>
                    
                    {/* Qualification Score */}
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="text-2xl font-bold text-green-600">
                        {vendorData.qualificationScore || 0}%
                      </div>
                      <div className="text-xs text-green-800">Qualification Score</div>
                    </div>
                    
                    {/* Expiring Docs */}
                    <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="text-2xl font-bold text-amber-600">
                        {quickStats?.expiringDocs || 0}
                      </div>
                      <div className="text-xs text-amber-800">Expiring Soon</div>
                    </div>
                    
                    {/* Expired Docs - NEW */}
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-2xl font-bold text-red-600">
                        {quickStats?.expiredDocs || 0}
                      </div>
                      <div className="text-xs text-red-800">Expired Docs</div>
                    </div>
                    
                    {/* Vendor Class */}
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-2xl font-bold text-purple-600">
                        {vendorData.vendorClass || "D"}
                      </div>
                      <div className="text-xs text-purple-800">Vendor Class</div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-auto ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for dropdowns */}
      {(userMenuOpen || (isMobile && sidebarOpen)) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            if (isMobile) setSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}