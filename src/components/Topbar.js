// frontend/src/components/Topbar.js - ENHANCED DYNAMIC VERSION
"use client";
import { useState, useEffect } from 'react';
import { 
  Bell, 
  UserCircle2,
  BadgeAlert,
  Settings,
  LogOut,
  ChevronDown,
  Building,
  Shield,
  Briefcase,
  Users
} from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';

export default function Topbar() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notificationStats, setNotificationStats] = useState({ unread: 0, highPriority: 0 });

  useEffect(() => {
    fetchUserData();
    fetchNotificationStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchNotificationStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
      } else {
        // Fallback to localStorage data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
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

  const getDashboardTitle = () => {
    if (!userData) return "Dashboard";
    
    const roles = {
      1: { 
        title: "Executive Dashboard", 
        subtitle: "Strategic Overview & Performance Metrics",
        icon: <Building className="text-purple-500 mr-2" size={20} />
      },
      2: { 
        title: "Procurement Manager Dashboard", 
        subtitle: "Team Management & Workflow Oversight",
        icon: <Shield className="text-blue-500 mr-2" size={20} />
      },
      3: { 
        title: "Procurement Officer Dashboard", 
        subtitle: "Operational Execution & Task Management", 
        icon: <Briefcase className="text-green-500 mr-2" size={20} />
      },
      4: { 
        title: "Vendor Portal", 
        subtitle: "Supplier Management & Collaboration",
        icon: <Users className="text-orange-500 mr-2" size={20} />
      }
    };
    
    const role = roles[userData.roleId] || roles[3];
    return role;
  };

  const getRoleBadge = () => {
    if (!userData) return null;
    
    const roles = {
      1: { label: "Executive", color: "bg-purple-100 text-purple-800 border-purple-200" },
      2: { label: "Manager", color: "bg-blue-100 text-blue-800 border-blue-200" },
      3: { label: "Officer", color: "bg-green-100 text-green-800 border-green-200" },
      4: { label: "Vendor", color: "bg-orange-100 text-orange-800 border-orange-200" }
    };
    
    const role = roles[userData.roleId] || roles[3];
    
    return (
      <span className={`ml-3 text-xs px-3 py-1 rounded-full border ${role.color}`}>
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
              <span className="text-white text-xs font-bold">
                {notificationStats.highPriority}
              </span>
            </div>
          </div>
        </div>
      );
    } else if (notificationStats.unread > 0) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {notificationStats.unread}
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

  const dashboardInfo = getDashboardTitle();

  return (
    <>
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center">
          <div className="flex items-center">
            {dashboardInfo.icon}
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {dashboardInfo.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {dashboardInfo.subtitle}
              </p>
            </div>
          </div>
          {getRoleBadge()}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button 
            className="relative p-2 text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={20} />
            {getNotificationBadge()}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex items-center gap-2">
                <UserCircle2 size={32} className="text-indigo-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-800 text-sm">
                    {userData?.name || "User Name"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData?.department || "Procurement Department"}
                  </p>
                </div>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-800">{userData?.name}</p>
                  <p className="text-sm text-gray-500">{userData?.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{userData?.jobTitle}</p>
                </div>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings size={16} />
                  Account Settings
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
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

      {/* Overlay for dropdowns */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </>
  );
}