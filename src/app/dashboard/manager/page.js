// frontend/src/app/dashboard/manager/page.js - MOBILE OPTIMIZED
"use client";
import { useEffect, useState } from 'react';
import ManagerDashboard from '@/components/dashboards/ManagerDashboard.js';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function ManagerPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }
      
      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-64 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Loading manager dashboard...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-64 py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-600 text-lg mb-2">Error loading dashboard</div>
            <div className="text-gray-600 mb-4 text-sm">{error}</div>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return <ManagerDashboard data={dashboardData} />;
  };

  return (
    <ResponsiveLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Manager Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Team oversight and workflow management
        </p>
      </div>

      {renderContent()}
    </ResponsiveLayout>
  );
}