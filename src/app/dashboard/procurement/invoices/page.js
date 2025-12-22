"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Plus, FileText, CheckCircle, Clock, XCircle,
  AlertTriangle, Edit, Trash2, Eye, Download, Send, DollarSign,
  Building, User, Calendar, ArrowUp, ArrowDown, RefreshCw, TrendingUp
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

const mockAPI = {
  getInvoices: async () => {
    return [
      {
        id: 1,
        invoiceNumber: "INV-2024-00123",
        poNumber: "PO-2024-00123",
        supplierName: "Al Redwan Trading",
        projectName: "Tower B Construction",
        invoiceAmount: 56000,
        currency: "SAR",
        submittedDate: "2024-01-25",
        dueDate: "2024-02-24",
        status: "SUBMITTED",
        pendingWith: "Finance Review",
        delayDays: 0
      },
      {
        id: 2,
        invoiceNumber: "INV-2024-00124",
        poNumber: "PO-2024-00124",
        supplierName: "Gulf Engineering",
        projectName: "Obhur Beach Resort",
        invoiceAmount: 125000,
        currency: "SAR",
        submittedDate: "2024-01-20",
        dueDate: "2024-02-19",
        status: "PROCUREMENT_REVIEW",
        pendingWith: "Procurement",
        delayDays: 2
      },
      {
        id: 3,
        invoiceNumber: "INV-2024-00125",
        poNumber: "PO-2024-00125",
        supplierName: "SteelTech Industries",
        projectName: "Core DQ Tower",
        invoiceAmount: 89000,
        currency: "SAR",
        submittedDate: "2024-01-15",
        dueDate: "2024-02-14",
        status: "TECHNICAL_APPROVED",
        pendingWith: "Technical Office",
        delayDays: 0
      },
      {
        id: 4,
        invoiceNumber: "INV-2024-00126",
        poNumber: "PO-2024-00126",
        supplierName: "Elite Industrial",
        projectName: "11 West Residential",
        invoiceAmount: 45000,
        currency: "SAR",
        submittedDate: "2024-01-10",
        dueDate: "2024-02-09",
        status: "APPROVED",
        pendingWith: "Ready for Payment",
        delayDays: -5
      },
      {
        id: 5,
        invoiceNumber: "INV-2024-00127",
        poNumber: "PO-2024-00127",
        supplierName: "ABC Construction",
        projectName: "Sports Complex",
        invoiceAmount: 235000,
        currency: "SAR",
        submittedDate: "2024-01-05",
        dueDate: "2024-02-04",
        status: "PAID",
        pendingWith: "Completed",
        delayDays: -10
      }
    ];
  }
};

const STATUS_OPTIONS = {
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: Clock },
  PROCUREMENT_REVIEW: { label: 'Procurement Review', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  TECHNICAL_APPROVED: { label: 'Technical Approved', color: 'bg-orange-100 text-orange-800', icon: CheckCircle },
  FINANCE_REVIEW: { label: 'Finance Review', color: 'bg-purple-100 text-purple-800', icon: FileText },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  PAID: { label: 'Paid', color: 'bg-indigo-100 text-indigo-800', icon: TrendingUp },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    search: '', 
    status: '',
    sortField: 'submittedDate',
    sortOrder: 'desc'
  });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mockAPI.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !filters.search || 
      invoice.invoiceNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.poNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.supplierName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      invoice.projectName?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || invoice.status === filters.status;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (filters.sortField === 'submittedDate') {
      return filters.sortOrder === 'asc' 
        ? new Date(a.submittedDate) - new Date(b.submittedDate)
        : new Date(b.submittedDate) - new Date(a.submittedDate);
    }
    if (filters.sortField === 'dueDate') {
      return filters.sortOrder === 'asc' 
        ? new Date(a.dueDate) - new Date(b.dueDate)
        : new Date(b.dueDate) - new Date(a.dueDate);
    }
    if (filters.sortField === 'invoiceAmount') {
      return filters.sortOrder === 'asc' 
        ? a.invoiceAmount - b.invoiceAmount
        : b.invoiceAmount - a.invoiceAmount;
    }
    return 0;
  });

  const StatusBadge = ({ status }) => {
    const statusConfig = STATUS_OPTIONS[status] || STATUS_OPTIONS.SUBMITTED;
    const IconComponent = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const stats = {
    total: invoices.length,
    pending: invoices.filter(inv => ['SUBMITTED', 'PROCUREMENT_REVIEW', 'TECHNICAL_APPROVED', 'FINANCE_REVIEW'].includes(inv.status)).length,
    approved: invoices.filter(inv => inv.status === 'APPROVED').length,
    paid: invoices.filter(inv => inv.status === 'PAID').length,
    overdue: invoices.filter(inv => inv.delayDays > 0).length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.invoiceAmount, 0),
    pendingAmount: invoices
      .filter(inv => ['SUBMITTED', 'PROCUREMENT_REVIEW', 'TECHNICAL_APPROVED', 'FINANCE_REVIEW', 'APPROVED'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.invoiceAmount, 0)
  };

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 lg:w-7 lg:h-7 mr-2 lg:mr-3 text-purple-600" />
              Contractor Invoices (IPC)
            </h1>
            <p className="text-gray-600 mt-2">Manage and process contractor invoices and IPC</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchInvoices}
              disabled={loading}
              className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link 
              href="/dashboard/procurement/invoices/create"
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Invoices</p>
                <p className="text-lg lg:text-2xl font-bold text-purple-600">{stats.total}</p>
              </div>
              <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-lg lg:text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Amount</p>
                <p className="text-lg lg:text-2xl font-bold text-orange-600">
                  {stats.pendingAmount.toLocaleString()} SAR
                </p>
              </div>
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-lg lg:text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
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
                placeholder="Search by Invoice No, PO No, Supplier, or Project..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>

          <div className="w-full lg:w-48">
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
            onClick={() => setFilters({ search: '', status: '', sortField: 'submittedDate', sortOrder: 'desc' })}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading invoices...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Invoice No', 'PO No', 'Supplier', 'Project', 'Amount', 'Submitted', 'Due Date', 'Status', 'Pending With', 'Delay', 'Actions'].map((header) => (
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
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>No invoices found matching your criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => {
                      const delayColor = invoice.delayDays > 0 ? 'text-red-600' : 
                                        invoice.delayDays < 0 ? 'text-green-600' : 'text-gray-600';
                      const delayIcon = invoice.delayDays > 0 ? <AlertTriangle className="w-3 h-3" /> : 
                                       invoice.delayDays < 0 ? <CheckCircle className="w-3 h-3" /> : null;
                      
                      return (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{invoice.poNumber}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{invoice.supplierName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{invoice.projectName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                              <span className="font-bold">{invoice.invoiceAmount.toLocaleString()} {invoice.currency}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                              {new Date(invoice.submittedDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-blue-400 mr-1" />
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={invoice.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">{invoice.pendingWith}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center ${delayColor}`}>
                              {delayIcon}
                              <span className="ml-1">
                                {invoice.delayDays > 0 ? `+${invoice.delayDays} days` : 
                                 invoice.delayDays < 0 ? `${Math.abs(invoice.delayDays)} days early` : 
                                 'On time'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Link
                                href={`/dashboard/procurement/invoices/${invoice.id}`}
                                className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                className="p-1 text-gray-600 hover:text-gray-800 rounded hover:bg-gray-50"
                                title="Edit Invoice"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {invoice.status === 'APPROVED' && (
                                <button
                                  className="p-1 text-green-600 hover:text-green-800 rounded hover:bg-green-50"
                                  title="Process Payment"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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

export default InvoicesPage;