"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Plus, FileText, CheckCircle, Clock, XCircle,
  AlertTriangle, Edit, Trash2, Eye, Download, Send, DollarSign,
  Package, User, Calendar, ArrowUp, ArrowDown, RefreshCw
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

const mockAPI = {
  getPurchaseOrders: async () => {
    return [
      {
        id: 1,
        poNumber: "PO-2024-00123",
        supplierName: "Al Redwan Trading",
        projectName: "Tower B Construction",
        totalValue: 56000,
        currency: "SAR",
        poDate: "2024-01-20",
        status: "ISSUED",
        pendingWithDepartment: "Procurement",
        pendingWithPerson: "Sarah Mohamed",
        deliveryDate: "2024-02-01"
      },
      {
        id: 2,
        poNumber: "PO-2024-00124",
        supplierName: "Gulf Engineering",
        projectName: "Obhur Beach Resort",
        totalValue: 125000,
        currency: "SAR",
        poDate: "2024-01-18",
        status: "APPROVED",
        pendingWithDepartment: "Finance",
        pendingWithPerson: "Fatima Ali",
        deliveryDate: "2024-02-10"
      },
      {
        id: 3,
        poNumber: "PO-2024-00125",
        supplierName: "SteelTech Industries",
        projectName: "Core DQ Tower",
        totalValue: 89000,
        currency: "SAR",
        poDate: "2024-01-15",
        status: "DELIVERED",
        pendingWithDepartment: "Site",
        pendingWithPerson: "Mohammed Khalid",
        deliveryDate: "2024-01-30"
      },
      {
        id: 4,
        poNumber: "PO-2024-00126",
        supplierName: "Elite Industrial",
        projectName: "11 West Residential",
        totalValue: 45000,
        currency: "SAR",
        poDate: "2024-01-12",
        status: "DRAFT",
        pendingWithDepartment: "Procurement",
        pendingWithPerson: "Ahmed Zaid",
        deliveryDate: "2024-02-15"
      }
    ];
  }
};

const STATUS_OPTIONS = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  ISSUED: { label: 'Issued', color: 'bg-blue-100 text-blue-800', icon: Send },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  DELIVERED: { label: 'Delivered', color: 'bg-purple-100 text-purple-800', icon: Package },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const PurchaseOrdersPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    search: '', 
    status: '',
    sortField: 'poDate',
    sortOrder: 'desc'
  });

  const fetchPurchaseOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mockAPI.getPurchaseOrders();
      setPurchaseOrders(data);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = !filters.search || 
      po.poNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      po.projectName?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || po.status === filters.status;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (filters.sortField === 'poDate') {
      return filters.sortOrder === 'asc' 
        ? new Date(a.poDate) - new Date(b.poDate)
        : new Date(b.poDate) - new Date(a.poDate);
    }
    if (filters.sortField === 'totalValue') {
      return filters.sortOrder === 'asc' 
        ? a.totalValue - b.totalValue
        : b.totalValue - a.totalValue;
    }
    return 0;
  });

  const StatusBadge = ({ status }) => {
    const statusConfig = STATUS_OPTIONS[status] || STATUS_OPTIONS.DRAFT;
    const IconComponent = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const stats = {
    total: purchaseOrders.length,
    draft: purchaseOrders.filter(po => po.status === 'DRAFT').length,
    issued: purchaseOrders.filter(po => po.status === 'ISSUED').length,
    approved: purchaseOrders.filter(po => po.status === 'APPROVED').length,
    delivered: purchaseOrders.filter(po => po.status === 'DELIVERED').length,
    totalValue: purchaseOrders.reduce((sum, po) => sum + po.totalValue, 0)
  };

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 lg:w-7 lg:h-7 mr-2 lg:mr-3 text-green-600" />
              Purchase Orders
            </h1>
            <p className="text-gray-600 mt-2">Manage and track all purchase orders</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchPurchaseOrders}
              disabled={loading}
              className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link 
              href="/dashboard/procurement/purchase-orders/create"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New PO
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total POs</p>
                <p className="text-lg lg:text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-lg lg:text-2xl font-bold text-green-600">
                  {stats.totalValue.toLocaleString()} SAR
                </p>
              </div>
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Draft</p>
                <p className="text-lg lg:text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Issued</p>
                <p className="text-lg lg:text-2xl font-bold text-blue-600">{stats.issued}</p>
              </div>
              <Send className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-lg lg:text-2xl font-bold text-purple-600">{stats.delivered}</p>
              </div>
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4 p-4 bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by PO Number, Supplier, or Project..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>

          <div className="w-full lg:w-48">
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_OPTIONS).map(status => (
                <option key={status} value={status}>
                  {STATUS_OPTIONS[status].label}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="text-gray-500 hover:text-gray-700 p-2"
            onClick={() => setFilters({ search: '', status: '', sortField: 'poDate', sortOrder: 'desc' })}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Purchase Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading purchase orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['PO Number', 'Supplier', 'Project', 'Total Value', 'PO Date', 'Delivery Date', 'Status', 'Pending With', 'Actions'].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>No purchase orders found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{po.poNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{po.supplierName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{po.projectName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                            <span className="font-bold">{po.totalValue.toLocaleString()} {po.currency}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                            {new Date(po.poDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-blue-400 mr-1" />
                            {new Date(po.deliveryDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={po.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{po.pendingWithPerson}</p>
                            <p className="text-gray-500">{po.pendingWithDepartment}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Link
                              href={`/dashboard/procurement/purchase-orders/${po.id}`}
                              className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              className="p-1 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-50"
                              title="Edit PO"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                              title="Delete PO"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default PurchaseOrdersPage;