"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Eye, Edit, RefreshCw, FileText, Clock,
  CheckCircle, XCircle, Truck, Package, ShoppingCart,
  DollarSign, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '@/utils/formatters';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const STATUS_CONFIG = {
  DRAFT:               { label: 'Draft',               color: 'bg-gray-100 text-gray-700',      dot: 'bg-gray-400' },
  PENDING_APPROVAL:    { label: 'Pending Approval',    color: 'bg-yellow-100 text-yellow-800',  dot: 'bg-yellow-500' },
  APPROVED:            { label: 'Approved',            color: 'bg-blue-100 text-blue-800',      dot: 'bg-blue-500' },
  ISSUED:              { label: 'Issued',              color: 'bg-green-100 text-green-700',    dot: 'bg-green-500' },
  PARTIALLY_DELIVERED: { label: 'Partially Delivered', color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  DELIVERED:           { label: 'Delivered',           color: 'bg-teal-100 text-teal-800',     dot: 'bg-teal-500' },
  CLOSED:              { label: 'Closed',              color: 'bg-emerald-900 text-emerald-100', dot: 'bg-emerald-700' },
  CANCELLED:           { label: 'Cancelled',           color: 'bg-red-100 text-red-800',       dot: 'bg-red-500' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value ?? '—'}</p>
    </div>
    <Icon className={`w-8 h-8 opacity-20 ${color}`} />
  </div>
);

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [pos, setPOs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/purchase-orders/stats/summary`, { headers: authHeaders() });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.ok) setStats(await res.json());
    } catch {
      // non-fatal
    }
  }, []);

  const fetchPOs = useCallback(async (pg = 1) => {
    setLoading(true);
    setApiError(false);
    try {
      const params = new URLSearchParams({ page: pg, pageSize: PAGE_SIZE });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (projectFilter) params.set('projectName', projectFilter);

      const res = await fetch(`${API_BASE}/api/purchase-orders?${params}`, { headers: authHeaders() });
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error('API error');
      const json = await res.json();
      setPOs(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, projectFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setPage(1);
    fetchPOs(1);
  }, [search, statusFilter, projectFilter]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchPOs(newPage);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const projects = [...new Set(pos.map(p => p.projectName).filter(Boolean))];

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4">
          <span>Dashboard</span> <span className="mx-1">›</span>
          <span>Procurement</span> <span className="mx-1">›</span>
          <span className="text-gray-800 font-medium">Purchase Orders</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2" style={{ color: '#0A1628' }}>
              <ShoppingCart className="w-7 h-7" style={{ color: '#B8960A' }} />
              {t('purchaseOrders')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">{t('manageAndTrackPOs', 'Manage and track all purchase orders')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchStats(); fetchPOs(page); }}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
            <Link
              href="/dashboard/procurement/purchase-orders/create"
              className="flex items-center px-4 py-2 text-sm text-white rounded-lg font-medium shadow-sm"
              style={{ backgroundColor: '#B8960A' }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t('createPO')}
            </Link>
          </div>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Could not load purchase orders from the server. Please check your connection and try again.
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <StatCard label={t('totalPOs')}          value={stats?.totalPOs}      color="text-blue-600"    icon={FileText} />
          <StatCard label={t('DRAFT')}             value={stats?.draftCount}    color="text-gray-600"    icon={Clock} />
          <StatCard label={t('PENDING_APPROVAL')}  value={stats?.pendingCount}  color="text-yellow-600"  icon={AlertTriangle} />
          <StatCard label={`${t('APPROVED')} / ${t('ISSUED')}`} value={(stats?.approvedCount ?? 0) + (stats?.issuedCount ?? 0)} color="text-green-600" icon={CheckCircle} />
          <StatCard label={t('CLOSED')}            value={stats?.closedCount}   color="text-emerald-700" icon={Package} />
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-3 p-4 bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('search')}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              style={{ '--tw-ring-color': '#B8960A' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="lg:w-52 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('allStatuses')}</option>
            {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            className="lg:w-52 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">{t('allProjects')}</option>
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(search || statusFilter || projectFilter) && (
            <button
              className="text-sm text-gray-500 hover:text-gray-800 px-2"
              onClick={() => { setSearch(''); setStatusFilter(''); setProjectFilter(''); }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-3" style={{ borderColor: '#B8960A' }} />
              <p className="text-gray-400 text-sm">{t('loading')}</p>
            </div>
          ) : pos.length === 0 && !apiError ? (
            <div className="py-16 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t('noPurchaseOrders')}</p>
              <Link
                href="/dashboard/procurement/purchase-orders/create"
                className="mt-3 inline-flex items-center text-sm font-medium"
                style={{ color: '#B8960A' }}
              >
                <Plus className="w-4 h-4 mr-1" /> Create the first PO
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[t('poNumber'), t('projectName'), t('vendor'), t('totalValue'), t('status'), t('deliveryDate'), t('issuedBy', 'Issued By'), t('actions')].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pos.map(po => (
                      <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-sm" style={{ color: '#B8960A' }}>{po.poNumber}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">{po.projectName}</td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-medium text-gray-900">{po.vendor?.companyLegalName || '—'}</div>
                          {po.vendor?.vendorClass && (
                            <span className="text-xs text-gray-500">Class {po.vendor.vendorClass}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                            {po.totalValue?.toLocaleString()} {po.currency}
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={po.status} /></td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {po.requiredDate ? formatDate(po.requiredDate, i18n.language) : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">{po.issuedBy?.name || '—'}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/dashboard/procurement/purchase-orders/${po.id}`}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {po.status === 'DRAFT' && (
                              <Link
                                href={`/dashboard/procurement/purchase-orders/${po.id}?edit=true`}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {pos.map(po => (
                  <div key={po.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm" style={{ color: '#B8960A' }}>{po.poNumber}</span>
                      <StatusBadge status={po.status} />
                    </div>
                    <p className="text-sm font-medium text-gray-800">{po.projectName}</p>
                    <p className="text-xs text-gray-500">{po.vendor?.companyLegalName}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {po.totalValue?.toLocaleString()} {po.currency}
                      </span>
                      <Link
                        href={`/dashboard/procurement/purchase-orders/${po.id}`}
                        className="flex items-center gap-1 text-xs text-blue-600 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> {t('view')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-600 px-2">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
