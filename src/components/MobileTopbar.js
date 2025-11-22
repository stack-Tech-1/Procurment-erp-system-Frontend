// frontend/src/components/MobileTopbar.js
"use client";
import { useState, useEffect } from 'react';
import { 
  Bell, 
  UserCircle2,
  ChevronDown,
  Building,
  Shield,
  Briefcase,
  Users,
  Menu
} from 'lucide-react';

export default function MobileTopbar({ onMenuClick }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const getDashboardTitle = () => {
    if (!userData) return "Dashboard";
    
    const roles = {
      1: { 
        title: "Executive", 
        icon: <Building className="text-purple-500" size={20} />
      },
      2: { 
        title: "Manager", 
        icon: <Shield className="text-blue-500" size={20} />
      },
      3: { 
        title: "Officer", 
        icon: <Briefcase className="text-green-500" size={20} />
      },
      4: { 
        title: "Vendor", 
        icon: <Users className="text-orange-500" size={20} />
      }
    };
    
    return roles[userData.roleId] || roles[3];
  };

  const dashboardInfo = getDashboardTitle();

  return (
    <>
      <header className="flex justify-between items-center px-4 py-3 bg-white shadow-sm border-b border-gray-100 lg:px-8 lg:py-4">
        {/* Left: Menu Button and Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            {dashboardInfo.icon}
            <div>
              <h1 className="text-lg font-semibold text-gray-800 lg:text-xl">
                {dashboardInfo.title} Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-1 lg:text-sm">
                {userData?.department || "Procurement"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Right: Notifications and User */}
        <div className="flex items-center gap-3">
          {/* Notifications - Simplified for mobile */}
          <button className="p-2 text-gray-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all">
            <Bell size={20} />
          </button>

          {/* User Menu - Simplified */}
          <button 
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <UserCircle2 size={32} className="text-indigo-600" />
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>
      </header>

      {/* Mobile User Dropdown */}
      {userMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setUserMenuOpen(false)}
          />
          <div className="fixed right-4 top-16 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 lg:hidden">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="font-medium text-gray-800 text-sm">{userData?.name}</p>
              <p className="text-xs text-gray-500 truncate">{userData?.email}</p>
            </div>
            
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );
}
