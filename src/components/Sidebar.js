"use client";
import { useEffect, useState } from "react";
import {
  Home,
  Users,
  FileText,
  ClipboardList,
  FileSignature,
  BarChart3,
  CheckSquare,
  LogOut,
  RefreshCw,
  Briefcase,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { getNavigationItems } from '@/utils/navigation';
import { ROLES, ROLE_NAMES } from '@/constants/roles';

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  
  // 🧠 Fetch pending user count (Admin only)
  const fetchPendingUsers = async (showToast = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPendingCount(data.length);
          if (showToast) toast.success("Pending list updated!");
        }
      }
    } catch (err) {
      console.error("Error fetching pending users:", err);
      if (showToast) toast.error("Failed to refresh pending users.");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Load user and initial pending count
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      
      // Fetch pending users if executive
      if (parsed.roleId === ROLES.EXECUTIVE) {
        fetchPendingUsers();
      }
    }
  }, []);



  // 🕒 Auto-refresh every 30 seconds
  useEffect(() => {
    if (user?.roleId === 1) {
      const interval = setInterval(() => fetchPendingUsers(), 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // 📋 Base Navigation Items - Common for all users
  const baseNavItems = [
    { 
      name: "Dashboard", 
      icon: <Home size={18} />, 
      href: "/dashboard/procurement" 
    },
    { 
      name: "Vendors", 
      icon: <Users size={18} />, 
      href: "/dashboard/procurement/vendors" 
    },
    { 
      name: "RFOs", 
      icon: <ClipboardList size={18} />, 
      href: "/dashboard/procurement/rfos" 
    },
    { 
      name: "Contracts", 
      icon: <Briefcase size={18} />, 
      href: "/dashboard/procurement/contracts" 
    },
    { 
      name: "IPCs", 
      icon: <Receipt size={18} />, 
      href: "/dashboard/procurement/ipcs" 
    },
    { 
      name: "Cost Control", 
      icon: <BarChart3 size={18} />, 
      href: "/dashboard/procurement/cost-control" 
    },
    {
      name: "Reports",
      icon: <FileText size={18} />,
      href: "/dashboard/admin/reports",
    }
  ];
  
  // 📋 Admin Only Navigation Items
  const adminNavItems = [
    {
      name: "Approvals",
      icon: <CheckSquare size={18} />,
      href: "/dashboard/admin/approvals",
    },
    {
      name: "User Management",
      icon: <Users size={18} />,
      href: "/dashboard/admin/users",
    }
  ];

  // Combine navigation items based on user role
  //const navItems = [...baseNavItems];
  //if (user?.roleId === 1) {
    //navItems.push(...adminNavItems);
  //}

  // Get navigation items based on user role
  const navItems = user ? getNavigationItems(user.roleId) : [];

  return (
    <aside className="bg-slate-900 text-gray-100 w-64 min-h-screen flex flex-col justify-between">
      {/* Brand Header */}
      <div>
        <div className="p-6 text-2xl font-semibold border-b border-slate-700">
          <span className="text-indigo-400">Procure</span>Track
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <div key={item.name} className="relative">
              <Link
                href={item.href}
                className="flex items-center justify-between px-6 py-3 text-sm hover:bg-slate-800 hover:text-indigo-400 transition"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>

                {/* Pending approvals badge for executives */}
                {item.name === "User Management" && user?.roleId === ROLES.EXECUTIVE && pendingCount > 0 && (
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <RefreshCw size={14} className="animate-spin text-gray-400" />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          fetchPendingUsers(true);
                        }}
                        title="Refresh"
                        className="text-gray-400 hover:text-indigo-400 transition"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-700">
        {user && (
          <div className="mb-3 px-2 py-1 text-xs text-gray-400">
            <div className="font-medium truncate">{user.name || user.email}</div>
            <div className="capitalize">{ROLE_NAMES[user.roleId]?.toLowerCase() || 'user'}</div>
            {user.department && <div className="text-gray-500">{user.department}</div>}
          </div>
        )}
        
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 text-sm text-gray-400 hover:text-red-400 transition w-full px-2 py-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}