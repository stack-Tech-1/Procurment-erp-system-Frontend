// frontend/src/components/Topbar.js - ENHANCED DYNAMIC VERSION
"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell,
  UserCircle2,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Lock,
  Palette,
  Menu
} from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import LanguageSwitcher from './LanguageSwitcher';

const PAGE_TITLES = {
  '/dashboard/executive': 'Executive Dashboard',
  '/dashboard/manager': 'Manager Dashboard',
  '/dashboard/officer': 'Officer Dashboard',
  '/vendor-dashboard': 'Vendor Portal',
  '/dashboard/procurement/vendors': 'Vendors',
  '/dashboard/procurement/rfq': 'RFQs',
  '/dashboard/procurement/rfos': 'RFOs',
  '/dashboard/procurement/purchase-orders': 'Purchase Orders',
  '/dashboard/procurement/purchase-requests': 'Purchase Requests',
  '/dashboard/procurement/contracts': 'Contracts',
  '/dashboard/procurement/invoices': 'Invoices',
  '/dashboard/procurement/ipcs': 'IPCs',
  '/dashboard/procurement/cost-control': 'Cost Control',
  '/dashboard/procurement/information-requests': 'Information Requests',
  '/dashboard/admin/users': 'User Management',
  '/dashboard/admin/reports': 'Reports',
  '/dashboard/admin/approvals': 'Account Approvals',
  '/dashboard/admin/branding': 'Branding Settings',
  '/dashboard/admin/settings': 'System Settings',
  '/dashboard/admin/audit-log': 'Audit Log',
  '/dashboard/admin/permissions': 'Permissions',
  '/dashboard/approvals/workflows': 'Workflow Builder',
  '/dashboard/approvals': 'Approvals',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/profile': 'My Profile',
  '/dashboard/tasks': 'Tasks',
  '/dashboard/manager/team': 'Team Overview',
  '/dashboard/manager/approvals': 'Approval Queue',
  '/dashboard/manager/material-submittals': 'Material Submittals',
  '/dashboard/manager/shop-drawings': 'Shop Drawings',
  '/dashboard/manager/deliveries': 'Deliveries',
  '/dashboard/manager/budget-control': 'Budget Control',
  '/dashboard/manager/supplier-performance': 'Supplier Performance',
  '/dashboard/officer/tasks': 'My Tasks',
  '/vendor-dashboard/proposal': 'Submit Proposal',
  '/vendor-dashboard/tracker': 'Track Submissions',
  '/vendor-dashboard/requests': 'Information Requests',
  '/dashboard/vendors/profile': 'My Profile',
};

const ROLE_BADGES = {
  1: { label: "Executive", color: "bg-purple-100 text-purple-800 border-purple-200" },
  2: { label: "Manager", color: "bg-blue-100 text-blue-800 border-blue-200" },
  3: { label: "Officer", color: "bg-green-100 text-green-800 border-green-200" },
  4: { label: "Vendor", color: "bg-orange-100 text-orange-800 border-orange-200" }
};

export default function Topbar() {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notificationStats, setNotificationStats] = useState({ unread: 0, highPriority: 0 });

  useEffect(() => {
    fetchUserData();
    fetchNotificationStats();
    const interval = setInterval(fetchNotificationStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUserData(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotificationStats(data.data || { unread: 0, highPriority: 0 });
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  };

  const getPageTitle = () => {
    if (!pathname) return 'Dashboard';
    // Find the longest matching prefix
    const match = Object.entries(PAGE_TITLES)
      .filter(([path]) => pathname === path || pathname.startsWith(path + '/'))
      .sort((a, b) => b[0].length - a[0].length)[0];
    return match ? match[1] : 'Dashboard';
  };

  const getRoleBadge = () => {
    if (!userData) return null;
    const role = ROLE_BADGES[userData.roleId];
    if (!role) return null;
    return (
      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${role.color}`}>
        {role.label}
      </span>
    );
  };

  const getNotificationBadge = () => {
    if (notificationStats.highPriority > 0) {
      return (
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full relative flex items-center justify-center">
              <span className="text-white text-xs font-bold">{notificationStats.highPriority}</span>
            </div>
          </div>
        </div>
      );
    } else if (notificationStats.unread > 0) {
      return (
        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1" style={{ backgroundColor: '#B8960A' }}>
          <span className="text-white text-xs font-bold leading-none">
            {notificationStats.unread > 99 ? '99+' : notificationStats.unread}
          </span>
        </div>
      );
    }
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleMobileMenuToggle = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 md:px-6 h-16 bg-white shadow-sm border-b border-gray-100">
        {/* Left: Hamburger + Page Title */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors md:hidden"
            onClick={handleMobileMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div>
              <h1 className="text-base font-semibold text-gray-800 leading-tight">
                {getPageTitle()}
              </h1>
            </div>
            {getRoleBadge()}
          </div>
        </div>

        {/* Right: Language, Notifications, User */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <button
            className="relative p-2 text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={20} />
            {getNotificationBadge()}
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <UserCircle2 size={30} className="text-indigo-600" />
              <div className="text-left hidden sm:block">
                <p className="font-medium text-gray-800 text-sm leading-tight">
                  {userData?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {userData?.department || "Procurement"}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-800 text-sm">{userData?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{userData?.email}</p>
                  {userData?.jobTitle && (
                    <p className="text-xs text-gray-400 mt-0.5">{userData.jobTitle}</p>
                  )}
                </div>

                <a href="/dashboard/profile" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User size={15} className="text-gray-400" />
                  My Profile
                </a>
                <a href="/dashboard/profile?tab=security" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Lock size={15} className="text-gray-400" />
                  Security Settings
                </a>
                <a href="/dashboard/profile?tab=appearance" className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Palette size={15} className="text-gray-400" />
                  Preferences
                </a>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationsPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  );
}
