// frontend/src/components/MobileLayout.js
"use client";
import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home,
  Users,
  FileText,
  ClipboardList,
  Briefcase,
  Receipt,
  BarChart3,
  CheckSquare,
  UserPlus,
  Settings,
  CheckCircle,
  Building,
  Shield,
  Send,
  ListOrdered,
  LogOut,
  Bell,
  UserCircle2,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { getNavigationItems } from '@/utils/navigation';
import { ROLES, ROLE_NAMES } from '@/constants/roles';

export default function MobileLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [navItems, setNavItems] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      setNavItems(getNavigationItems(user.roleId));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile & Desktop */}
      <aside className={`
        fixed top-0 left-0 h-full w-80 bg-slate-900 text-gray-100 transform transition-transform duration-300 z-50 flex flex-col
        lg:relative lg:translate-x-0 lg:w-64 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="text-2xl font-semibold">
            <span className="text-indigo-400">Procure</span>Track
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-6 py-4 text-base hover:bg-slate-800 hover:text-indigo-400 transition-colors"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout - Mobile Only */}
        <div className="lg:hidden p-4 border-t border-slate-700">
          {userData && (
            <div className="mb-3 px-2 py-1 text-sm">
              <div className="font-medium truncate">{userData.name || userData.email}</div>
              <div className="text-gray-400 capitalize">
                {ROLE_NAMES[userData.roleId]?.toLowerCase() || 'user'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm text-gray-400 hover:text-red-400 transition w-full px-2 py-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex justify-between items-center px-4 py-3 bg-white shadow-sm border-b border-gray-100 lg:px-8 lg:py-4">
          {/* Left: Menu Button and Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <Building className="text-purple-500" size={20} />
              <div>
                <h1 className="text-lg font-semibold text-gray-800 lg:text-xl">
                  Executive Dashboard
                </h1>
                <p className="text-xs text-gray-500 mt-1 lg:text-sm">
                  Strategic Overview & Performance
                </p>
              </div>
            </div>
          </div>
          
          {/* Right: Notifications and User */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all">
              <Bell size={20} />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <UserCircle2 size={32} className="text-indigo-600" />
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {userData && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-800 text-sm">{userData.name}</p>
                      <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                    </div>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for user dropdown */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
}