// frontend/src/app/dashboard/admin/approvals/page.js - MOBILE OPTIMIZED
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Filter,
  Search,
  UserCheck,
  Mail,
  Shield
} from "lucide-react";
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

export default function AdminApprovalsPage() {
  const [user, setUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "pending"
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;   
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    fetchPendingUsers();

    // ✅ Auto-refresh every 30 seconds
    const interval = setInterval(fetchPendingUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/auth/pending`);
      setPendingUsers(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching pending users:", err);
      setError("Failed to fetch pending users");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id) => {
    try {
      setApproving(id);
      await axios.put(`${API_BASE_URL}/api/auth/approve/${id}`);
      setPendingUsers((prev) => prev.filter((user) => user.id !== id));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Approval failed. Please try again.");
    } finally {
      setApproving(null);
    }
  };

  const rejectUser = async (id) => {
    if (!window.confirm("Are you sure you want to reject this user? This action cannot be undone.")) {
      return;
    }

    try {
      setApproving(id);
      await axios.put(`${API_BASE_URL}/api/auth/reject/${id}`);
      setPendingUsers((prev) => prev.filter((user) => user.id !== id));
      setError("");
    } catch (err) {
      console.error(err);
      setError("Rejection failed. Please try again.");
    } finally {
      setApproving(null);
    }
  };

  const filteredUsers = pendingUsers.filter(user => {
    const matchesSearch = !filters.search || 
      user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesRole = !filters.role || user.role?.name === filters.role;
    
    return matchesSearch && matchesRole;
  });

  // Enhanced User Card for Mobile
  const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{user.name}</h3>
            <p className="text-gray-500 text-xs sm:text-sm flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {user.email}
            </p>
          </div>
        </div>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          {user.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-500 text-xs">Requested Role</p>
          <p className="font-medium text-gray-900 text-sm flex items-center">
            <Shield className="w-3 h-3 mr-1 text-blue-500" />
            {user.role?.name || "Staff"}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Submitted</p>
          <p className="font-medium text-gray-900 text-sm">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => approveUser(user.id)}
          disabled={approving === user.id}
          className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-white text-sm font-medium ${
            approving === user.id
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {approving === user.id ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-1" />
          )}
          <span className="ml-1">Approve</span>
        </button>
        
        <button
          onClick={() => rejectUser(user.id)}
          disabled={approving === user.id}
          className={`flex items-center justify-center px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium ${
            approving === user.id ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <AlertCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Enhanced Table for Desktop
  const DesktopTable = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Requested Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Shield className="w-3 h-3 mr-1" />
                  {user.role?.name || "Staff"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Clock className="w-3 h-3 mr-1" />
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => approveUser(user.id)}
                    disabled={approving === user.id}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white ${
                      approving === user.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {approving === user.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => rejectUser(user.id)}
                    disabled={approving === user.id}
                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 ${
                      approving === user.id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
              Staff Registration Approvals
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Review and approve new staff registration requests
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchPendingUsers}
              disabled={loading}
              className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Pending Approvals</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingUsers.length}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">This Week</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {pendingUsers.filter(user => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(user.createdAt) >= weekAgo;
                  }).length}
                </p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Managers</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {pendingUsers.filter(user => user.role?.name === 'Manager').length}
                </p>
              </div>
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Officers</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {pendingUsers.filter(user => user.role?.name === 'Officer').length}
                </p>
              </div>
              <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="w-full lg:w-48">
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="Manager">Managers</option>
                <option value="Officer">Officers</option>
                <option value="Admin">Admins</option>
              </select>
            </div>

            {/* Filter Label */}
            <div className="flex items-center text-sm text-gray-500">
              <Filter className="w-4 h-4 mr-2" />
              Showing {filteredUsers.length} of {pendingUsers.length} requests
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && pendingUsers.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading pending approvals...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {pendingUsers.length === 0 
                ? "All staff registration requests have been processed. New requests will appear here automatically."
                : "No users match your current filters."
              }
            </p>
          </div>
        )}

        {/* Content - Mobile Cards / Desktop Table */}
        {!loading && filteredUsers.length > 0 && (
          <>
            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block">
              <DesktopTable />
            </div>
          </>
        )}
      </div>
    </ResponsiveLayout>
  );
}