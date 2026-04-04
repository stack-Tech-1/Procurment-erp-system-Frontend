"use client";
import { useEffect, useState } from "react";
import { LogOut, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import { getNavigationItems } from "@/utils/navigation";
import { ROLES, ROLE_NAMES } from "@/constants/roles";

// Group definitions for EXECUTIVE role navigation
const EXECUTIVE_GROUPS = [
  { label: null, keys: ["Dashboard"] },
  { label: "ANALYTICS", keys: ["Financial Analytics", "Vendor Performance", "Project Portfolio", "Compliance Dashboard"] },
  { label: "PROCUREMENT", keys: ["Vendors", "RFQs", "Purchase Orders", "PRs", "Contracts", "Invoice", "IPCs"] },
  { label: "ADMINISTRATION", keys: ["User Management", "Reports", "Account Approvals", "Branding Settings", "System Settings", "Audit Log", "Permissions", "Workflow Builder"] },
  { label: "COMMUNICATION", keys: ["Information Requests", "Approvals", "Notifications"] },
];

function buildGroupedNav(navItems, roleId) {
  if (roleId !== ROLES.EXECUTIVE) {
    // For non-executive roles: Dashboard first, then a divider, then the rest
    const [first, ...rest] = navItems;
    return [
      { label: null, items: first ? [first] : [] },
      { label: null, items: rest, divider: true },
    ];
  }

  // Build a map for quick lookup
  const itemMap = {};
  navItems.forEach((item) => { itemMap[item.name] = item; });

  return EXECUTIVE_GROUPS.map((group) => ({
    label: group.label,
    items: group.keys.map((k) => itemMap[k]).filter(Boolean),
  }));
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const fetchPendingUsers = async (showToast = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/pending`, {
        headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.roleId === ROLES.EXECUTIVE) fetchPendingUsers();
    }
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed !== null) setCollapsed(savedCollapsed === "true");
  }, []);

  useEffect(() => {
    if (user?.roleId === ROLES.EXECUTIVE) {
      const interval = setInterval(() => fetchPendingUsers(), 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  const navItems = user ? getNavigationItems(user.roleId) : [];
  const groups = buildGroupedNav(navItems, user?.roleId);

  const isActive = (href) => {
    if (!href || !pathname) return false;
    if (href === pathname) return true;
    // For non-root paths, check prefix match (but avoid matching /dashboard for /dashboard/admin)
    if (href !== "/dashboard" && pathname.startsWith(href)) return true;
    return false;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const roleColors = {
    [ROLES.EXECUTIVE]: "bg-purple-500",
    [ROLES.PROCUREMENT_MANAGER]: "bg-blue-500",
    [ROLES.PROCUREMENT_OFFICER]: "bg-green-500",
    [ROLES.VENDOR]: "bg-orange-500",
  };

  return (
    <aside
      className={`bg-slate-900 text-gray-100 flex flex-col justify-between min-h-screen transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}
    >
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
        <div
          className={`flex items-center border-b border-slate-700 shrink-0 ${
            collapsed ? "justify-center p-4 h-16" : "p-5 h-16"
          }`}
        >
          {collapsed ? (
            <span className="text-lg font-bold text-indigo-400">K</span>
          ) : (
            <span className="text-xl font-semibold">
              <span className="text-indigo-400">Procure</span>Track
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {groups.map((group, gi) => (
            <div key={gi}>
              {/* Divider for non-executive non-first groups */}
              {group.divider && <div className="my-2 border-t border-slate-700/60" />}

              {/* Group label */}
              {group.label && !collapsed && (
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 mt-3 mb-1">
                  {group.label}
                </p>
              )}
              {group.label && collapsed && (
                <div className="my-1 border-t border-slate-700/40" />
              )}

              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <div key={item.name} className="relative">
                    <Link
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      className={`sidebar-link ${active ? "active" : ""} ${
                        collapsed ? "justify-center px-2" : ""
                      }`}
                    >
                      <span className="sidebar-icon shrink-0">{item.icon}</span>

                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.name}</span>
                          {/* Pending badge for User Management */}
                          {item.name === "User Management" &&
                            user?.roleId === ROLES.EXECUTIVE &&
                            pendingCount > 0 && (
                              <div className="flex items-center gap-1">
                                {loading ? (
                                  <RefreshCw size={12} className="animate-spin text-gray-400" />
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      fetchPendingUsers(true);
                                    }}
                                    title="Refresh"
                                    className="text-gray-400 hover:text-indigo-400 transition"
                                  >
                                    <RefreshCw size={12} />
                                  </button>
                                )}
                                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                                  {pendingCount}
                                </span>
                              </div>
                            )}
                        </>
                      )}

                      {/* Collapsed: pending dot */}
                      {collapsed &&
                        item.name === "User Management" &&
                        user?.roleId === ROLES.EXECUTIVE &&
                        pendingCount > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-2 pb-2 shrink-0">
          <button
            onClick={toggleCollapsed}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-slate-700 shrink-0">
        {user && !collapsed && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                roleColors[user.roleId] || "bg-indigo-500"
              }`}
            >
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-200 truncate">{user.name || user.email}</div>
              <div className="text-xs text-gray-400 capitalize truncate">
                {ROLE_NAMES[user.roleId]?.toLowerCase() || "user"}
                {user.department ? ` · ${user.department}` : ""}
              </div>
            </div>
          </div>
        )}

        {user && collapsed && (
          <div className="flex justify-center mb-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                roleColors[user.roleId] || "bg-indigo-500"
              }`}
              title={user.name || user.email}
            >
              {getInitials(user.name)}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className={`flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition w-full px-2 py-2 rounded-lg hover:bg-slate-800 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
