// frontend/src/components/Topbar.js - UPGRADED WITH NOTIFICATIONS
"use client";
import { useState, useEffect } from 'react';
import { 
  Bell, 
  UserCircle2,
  BadgeAlert
} from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';

export default function Topbar({ user, dashboardType }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationStats, setNotificationStats] = useState({ unread: 0, highPriority: 0 });

  const getDashboardTitle = () => {
    switch (dashboardType) {
      case 1: // EXECUTIVE
        return "Executive Dashboard";
      case 2: // PROCUREMENT_MANAGER
        return "Procurement Manager Dashboard";
      case 3: // PROCUREMENT_OFFICER
        return "Procurement Officer Dashboard";
      case 4: // VENDOR
        return "Vendor Portal";
      default:
        return "Dashboard";
    }
  };

  const getRoleBadge = () => {
    const roles = {
      1: { label: "Executive", color: "bg-purple-100 text-purple-800" },
      2: { label: "Manager", color: "bg-blue-100 text-blue-800" },
      3: { label: "Officer", color: "bg-green-100 text-green-800" },
      4: { label: "Vendor", color: "bg-orange-100 text-orange-800" }
    };
    
    const role = roles[dashboardType];
    if (!role) return null;
    
    return (
      <span className={`ml-3 text-xs px-2 py-1 rounded-full ${role.color}`}>
        {role.label}
      </span>
    );
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

  useEffect(() => {
    fetchNotificationStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchNotificationStats, 30000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <>
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-slate-700">
            {getDashboardTitle()}
          </h1>
          {getRoleBadge()}
        </div>
        <div className="flex items-center gap-6">
          <button 
            className="relative text-gray-600 hover:text-indigo-500 transition-colors"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={22} />
            {getNotificationBadge()}
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserCircle2 size={26} className="text-indigo-600" />
            <div>
              <p className="font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <NotificationsPanel 
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}