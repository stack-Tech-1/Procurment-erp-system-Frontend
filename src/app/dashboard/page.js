// frontend/src/app/dashboard/page.js - FINAL VERSION
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ExecutiveDashboard from "@/components/dashboards/ExecutiveDashboard";
import ManagerDashboard from "@/components/dashboards/ManagerDashboard";
import OfficerDashboard from "@/components/dashboards/OfficerDashboard";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    // ⛔ Redirect pending staff to waiting page
    if (parsedUser.status === "PENDING") {
      router.replace("/pending");
      return;
    }

    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  const renderRoleBasedDashboard = () => {
    if (!user) return null;

    switch (user.roleId) {
      case 1: // EXECUTIVE
        return <ExecutiveDashboard />;
      case 2: // PROCUREMENT_MANAGER
        return <ManagerDashboard />;
      case 3: // PROCUREMENT_OFFICER
        return <OfficerDashboard />;
      case 4: // VENDOR
        router.push('/vendor-dashboard');
        return null;
      default:
        return (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Checking access...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar user={user} dashboardType={user?.roleId} />
        <div className="flex-1">
          {renderRoleBasedDashboard()}
        </div>
      </main>
    </div>
  );
}