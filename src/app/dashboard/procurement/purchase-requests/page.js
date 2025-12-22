"use client";
import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Calendar, DollarSign, 
  User, Building, AlertTriangle, CheckCircle, Clock, XCircle,
  RefreshCw, Eye, Edit, ChevronDown, ChevronUp, BarChart3,
  Download, MoreVertical, ArrowUp, ArrowDown
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

// Mock API function
const mockAPI = {
  getPurchaseRequests: async () => {
    return {
      data: [
        {
          id: 1,
          prNumber: "PR-2024-00123",
          title: "HVAC System for Tower B",
          projectName: "Tower B Construction",
          requesterName: "Ahmed Zaid",
          department: "Technical Office",
          status: "DRAFT",
          priority: "HIGH",
          requiredDate: "2024-02-15",
          estimatedAmount: 1250000,
          createdAt: "2024-01-10",
          pendingWithDepartment: null,
          pendingWithPerson: null,
          delayDays: 0,
          items: [
            { description: "HVAC Unit 10HP", quantity: 2, unit: "PCS", estimatedPrice: 450000 },
            { description: "Ductwork Materials", quantity: 500, unit: "M", estimatedPrice: 800000 }
          ]
        },
        {
          id: 2,
          prNumber: "PR-2024-00124",
          title: "Structural Steel Beams",
          projectName: "Core DQ Tower",
          requesterName: "Sarah Mohamed",
          department: "Structural Engineering",
          status: "SUBMITTED",
          priority: "HIGH",
          requiredDate: "2024-02-10",
          estimatedAmount: 850000,
          createdAt: "2024-01-12",
          pendingWithDepartment: "Procurement",
          pendingWithPerson: "Mohammed Ali",
          delayDays: 0,
          items: [
            { description: "H-Beam 400x400", quantity: 50, unit: "M", estimatedPrice: 850000 }
          ]
        },
        {
          id: 3,
          prNumber: "PR-2024-00125",
          title: "Office Furniture",
          projectName: "HQ Office Renovation",
          requesterName: "Fatima Al-Mansoor",
          department: "Administration",
          status: "UNDER_PROCUREMENT_REVIEW",
          priority: "MEDIUM",
          requiredDate: "2024-03-01",
          estimatedAmount: 250000,
          createdAt: "2024-01-15",
          pendingWithDepartment: "Procurement",
          pendingWithPerson: "Khalid Rashid",
          delayDays: 0,
          items: [
            { description: "Executive Desk", quantity: 10, unit: "PCS", estimatedPrice: 120000 },
            { description: "Office Chairs", quantity: 30, unit: "PCS", estimatedPrice: 130000 }
          ]
        },
        {
          id: 4,
          prNumber: "PR-2024-00126",
          title: "Electrical Cables",
          projectName: "Commercial Complex",
          requesterName: "Omar Hassan",
          department: "Electrical Engineering",
          status: "UNDER_TECHNICAL_REVIEW",
          priority: "URGENT",
          requiredDate: "2024-01-30",
          estimatedAmount: 350000,
          createdAt: "2024-01-08",
          pendingWithDepartment: "Technical Office",
          pendingWithPerson: "Ahmed Zaid",
          delayDays: 5,
          items: [
            { description: "4mm2 Electrical Cable", quantity: 5000, unit: "M", estimatedPrice: 350000 }
          ]
        },
        {
          id: 5,
          prNumber: "PR-2024-00127",
          title: "Concrete Materials",
          projectName: "Obhur Beach Resort",
          requesterName: "Khalid Al-Rashid",
          department: "Civil Engineering",
          status: "APPROVED",
          priority: "HIGH",
          requiredDate: "2024-02-28",
          estimatedAmount: 650000,
          createdAt: "2024-01-05",
          pendingWithDepartment: null,
          pendingWithPerson: null,
          delayDays: 0,
          items: [
            { description: "Cement 50kg Bags", quantity: 2000, unit: "BAG", estimatedPrice: 650000 }
          ]
        }
      ]
    };
  }
};

const PurchaseRequestsPage = () => {
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    project: '',
    department: ''
  });
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', order: 'desc' });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  const fetchPurchaseRequests = async () => {
    setLoading(true);
    try {
      const response = await mockAPI.getPurchaseRequests();
      setPurchaseRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch purchase requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredRequests = purchaseRequests.filter(pr => {
    const matchesSearch = !filters.search || 
      pr.prNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      pr.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      pr.projectName.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || pr.status === filters.status;
    const matchesPriority = !filters.priority || pr.priority === filters.priority;
    const matchesProject = !filters.project || pr.projectName === filters.project;
    const matchesDepartment = !filters.department || pr.department === filters.department;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesDepartment;
  }).sort((a, b) => {
    if (sortConfig.field === 'requiredDate') {
      return sortConfig.order === 'asc' 
        ? new Date(a.requiredDate) - new Date(b.requiredDate)
        : new Date(b.requiredDate) - new Date(a.requiredDate);
    }
    if (sortConfig.field === 'estimatedAmount') {
      return sortConfig.order === 'asc' 
        ? a.estimatedAmount - b.estimatedAmount
        : b.estimatedAmount - a.estimatedAmount;
    }
    if (sortConfig.field === 'delayDays') {
      return sortConfig.order === 'asc' 
        ? a.delayDays - b.delayDays
        : b.delayDays - a.delayDays;
    }
    return 0;
  });

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: FileText },
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', label: 'Submitted', icon: Clock },
      UNDER_PROCUREMENT_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'Procurement Review', icon: AlertTriangle },
      UNDER_TECHNICAL_REVIEW: { color: 'bg-orange-100 text-orange-800', label: 'Technical Review', icon: AlertTriangle },
      APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle }
    };
    return configs[status] || configs.DRAFT;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      LOW: { color: 'bg-green-100 text-green-800', label: 'Low' },
      MEDIUM: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      HIGH: { color: 'bg-orange-100 text-orange-800', label: 'High' },
      URGENT: { color: 'bg-red-100 text-red-800', label: 'Urgent' }
    };
    return configs[priority] || configs.MEDIUM;
  };

  const stats = {
    total: purchaseRequests.length,
    draft: purchaseRequests.filter(pr => pr.status === 'DRAFT').length,
    submitted: purchaseRequests.filter(pr => pr.status === 'SUBMITTED').length,
    underReview: purchaseRequests.filter(pr => pr.status.includes('UNDER_')).length,
    approved: purchaseRequests.filter(pr => pr.status === 'APPROVED').length,
    overdue: purchaseRequests.filter(pr => pr.delayDays > 0).length
  };

  const projects = [...new Set(purchaseRequests.map(pr => pr.projectName))];
  const departments = [...new Set(purchaseRequests.map(pr => pr.department))];

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Purchase Requests</h1>
              <p className="text-gray-600">Manage procurement requests and approvals</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchPurchaseRequests}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link
                href="/dashboard/procurement/purchase-requests/create"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden lg:inline">New Purchase Request</span>
                <span className="lg:hidden">New PR</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: 'Total', value: stats.total, color: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Draft', value: stats.draft, color: 'bg-gray-50', text: 'text-gray-700' },
              { label: 'Submitted', value: stats.submitted, color: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Under Review', value: stats.underReview, color: 'bg-yellow-50', text: 'text-yellow-700' },
              { label: 'Approved', value: stats.approved, color: 'bg-green-50', text: 'text-green-700' },
              { label: 'Overdue', value: stats.overdue, color: 'bg-red-50', text: 'text-red-700' }
            ].map((stat, index) => (
              <div key={index} className={`${stat.color} p-4 rounded-lg`}>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.text}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          {/* Desktop Filters */}
          <div className="hidden lg:grid grid-cols-5 gap-3 mb-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by PR number, title, or project..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <select
              className="border border-gray-300 rounded-lg p-2"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_PROCUREMENT_REVIEW">Procurement Review</option>
              <option value="UNDER_TECHNICAL_REVIEW">Technical Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg p-2"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <button
              onClick={() => setFilters({ search: '', status: '', priority: '', project: '', department: '' })}
              className="border border-gray-300 rounded-lg p-2 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg"
            >
              <span>Filters</span>
              {mobileFiltersOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Filters Panel */}
          {mobileFiltersOpen && (
            <div className="lg:hidden grid grid-cols-2 gap-3 mb-4">
              <input
                type="text"
                placeholder="Search..."
                className="col-span-2 p-2 border border-gray-300 rounded-lg"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <select
                className="p-2 border border-gray-300 rounded-lg"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_PROCUREMENT_REVIEW">Procurement Review</option>
                <option value="UNDER_TECHNICAL_REVIEW">Technical Review</option>
              </select>
              <select
                className="p-2 border border-gray-300 rounded-lg"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          )}
        </div>

        {/* Purchase Requests Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading purchase requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No purchase requests found</p>
              <Link
                href="/dashboard/procurement/purchase-requests/create"
                className="text-blue-600 hover:text-blue-800"
              >
                Create your first purchase request
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['PR Number', 'Title', 'Project', 'Requester', 'Status', 'Priority', 'Required Date', 'Amount', 'Delay', 'Actions'].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((pr) => {
                      const statusConfig = getStatusConfig(pr.status);
                      const priorityConfig = getPriorityConfig(pr.priority);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr key={pr.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-blue-600">{pr.prNumber}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{pr.title}</div>
                            <div className="text-sm text-gray-500">{pr.items.length} items</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Building className="w-4 h-4 text-gray-400 mr-2" />
                              {pr.projectName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-gray-400 mr-2" />
                              {pr.requesterName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </span>
                            {pr.pendingWithPerson && (
                              <div className="text-xs text-gray-500 mt-1">
                                Pending: {pr.pendingWithPerson}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                              {priorityConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              {new Date(pr.requiredDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                              {pr.estimatedAmount.toLocaleString()} SAR
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {pr.delayDays > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {pr.delayDays} days
                              </span>
                            ) : (
                              <span className="text-gray-500">On time</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Link
                                href={`/dashboard/procurement/purchase-requests/${pr.id}`}
                                className="text-blue-600 hover:text-blue-800 p-1"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/dashboard/procurement/purchase-requests/${pr.id}/edit`}
                                className="text-gray-600 hover:text-gray-800 p-1"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              {pr.status === 'APPROVED' && (
                                <Link
                                  href={`/dashboard/procurement/rfq/create?prId=${pr.id}`}
                                  className="text-green-600 hover:text-green-800 p-1"
                                  title="Create RFQ from PR"
                                >
                                  <Plus className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                {filteredRequests.map((pr) => {
                  const statusConfig = getStatusConfig(pr.status);
                  const priorityConfig = getPriorityConfig(pr.priority);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div key={pr.id} className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">{pr.prNumber}</h3>
                          <p className="text-gray-600 text-sm">{pr.title}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center text-gray-600">
                          <Building className="w-3 h-3 mr-1" />
                          {pr.projectName}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <User className="w-3 h-3 mr-1" />
                          {pr.requesterName}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(pr.requiredDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {pr.estimatedAmount.toLocaleString()} SAR
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                          {pr.delayDays > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {pr.delayDays} days
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/dashboard/procurement/purchase-requests/${pr.id}`}
                            className="text-blue-600 p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {pr.status === 'APPROVED' && (
                            <Link
                              href={`/dashboard/procurement/rfq/create?prId=${pr.id}`}
                              className="text-green-600 p-1"
                              title="Create RFQ"
                            >
                              <Plus className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default PurchaseRequestsPage;