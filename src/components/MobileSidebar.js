// frontend/src/components/MobileSidebar.js
"use client";
import { useState, useEffect } from "react";
import {
  Home,
  Menu,
  X,
  LogOut,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { getNavigationItems } from '@/utils/navigation';
import { ROLES, ROLE_NAMES } from '@/constants/roles';

export default function MobileSidebar() {
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const navItems = user ? getNavigationItems(user.roleId) : [];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-80 bg-slate-900 text-gray-100 transform transition-transform duration-300 z-50
        lg:relative lg:translate-x-0 lg:w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="text-2xl font-semibold">
            <span className="text-indigo-400">Procure</span>Track
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info - Mobile Only */}
        <div className="lg:hidden p-4 border-b border-slate-700">
          {user && (
            <div className="text-sm">
              <div className="font-medium truncate">{user.name || user.email}</div>
              <div className="capitalize text-gray-400">{ROLE_NAMES[user.roleId]?.toLowerCase() || 'user'}</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.name} className="relative">
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-6 py-4 text-base hover:bg-slate-800 hover:text-indigo-400 transition"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>

                {/* Pending badge */}
                {item.name === "User Management" && user?.roleId === ROLES.EXECUTIVE && pendingCount > 0 && (
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </div>
          ))}
        </nav>

        {/* Logout - Mobile Only */}
        <div className="lg:hidden p-4 border-t border-slate-700">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 text-sm text-gray-400 hover:text-red-400 transition w-full px-2 py-3"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}