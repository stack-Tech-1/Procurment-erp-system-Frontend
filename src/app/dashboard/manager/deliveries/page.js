"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck, CheckCircle, Clock, AlertTriangle, Search, Filter, Plus,
  Download, RefreshCw, ChevronRight, Eye, TrendingUp, TrendingDown,
  Package, X
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const STATUS_CONFIG = {
  PENDING:              { label: 'Pending',              cls: 'bg-gray-100 text-gray-700' },
  IN_TRANSIT:           { label: 'In Transit',           cls: 'bg-blue-100 text-blue-700' },
  DELIVERED:            { label: 'Delivered',            cls: 'bg-green-100 text-green-700' },
  PARTIALLY_DELIVERED:  { label: 'Partial',              cls: 'bg-orange-100 text-orange-700' },
  QC_IN_PROGRESS:       { label: 'QC In Progress',       cls: 'bg-yellow-100 text-yellow-700' },
  QC_ACCEPTED:          { label: 'QC Accepted',          cls: 'bg-green-100 text-green-700' },
  QC_REJECTED:          { label: 'QC Rejected',          cls: 'bg-red-100 text-red-700' },
  COMPLETED:            { label: 'Completed',            cls: 'bg-emerald-100 text-emerald-700' },
  CANCELLED:            { label: 'Cancelled',            cls: 'bg-gray-100 text-gray-500' },
};

const QC_CONFIG = {
  PENDING_INSPECTION: { label: 'Pending Inspection', cls: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS:        { label: 'In Progress',         cls: 'bg-yellow-100 text-yellow-700' },
  ACCEPTED:           { label: 'Accepted',            cls: 'bg-green-100 text-green-700' },
  REJECTED:           { label: 'Rejected',            cls: 'bg-red-100 text-red-700' },
};

const Badge = ({ value, config }) => {
  const cfg = config[value] || { label: value, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

export default function DeliveriesDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', qcStatus: '', overdue: false });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/deliveries/stats`, { headers });
      if (r.ok) setStats(await r.json());
    } catch (_) {}
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/deliveries/dashboard`, { headers });
      if (r.ok) setDashboard(await r.json());
    } catch (_) {}
  }, []);

  const fetchDeliveries = useCallback(async (f = filters, p = page) => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
      if (f.search)    params.set('projectName', f.search);
      if (f.status)    params.set('status', f.status);
      if (f.qcStatus)  params.set('qcStatus', f.qcStatus);
      if (f.overdue)   params.set('overdue', 'true');
      const r = await fetch(`${API}/api/deliveries?${params}`, { headers });
      if (r.ok) {
        const data = await r.json();
        setDeliveries(p === 1 ? (data.deliveries || data) : prev => [...prev, ...(data.deliveries || data)]);
        setTotal(data.total || 0);
      }
    } catch (_) {}
    setTableLoading(false);
  }, [filters, page]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchDashboard(), fetchDeliveries(filters, 1)]);
      setLoading(false);
    })();
  }, []);

  const applyFilters = () => {
    setPage(1);
    fetchDeliveries(filters, 1);
  };

  const clearFilters = () => {
    const f = { search: '', status: '', qcStatus: '', overdue: false };
    setFilters(f);
    setPage(1);
    fetchDeliveries(f, 1);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchDeliveries(filters, next);
  };

  const onTimeRate = stats?.onTimeRate ?? 0;
  const onTimeColor = onTimeRate >= 85 ? 'text-green-600' : onTimeRate >= 70 ? 'text-orange-500' : 'text-red-500';

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="animate-spin h-10 w-10 text-[#C6A35D] mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Loading deliveries...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Site Deliveries (GRN)</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track material deliveries, QC inspections, and vendor performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard/manager/deliveries/create')}
              className="flex items-center gap-2 bg-[#C6A35D] hover:bg-[#b8924a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> New Delivery
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0A1628] text-white p-5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <Truck size={20} className="text-[#C6A35D]" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
            <p className="text-xs text-gray-300 mt-1">All deliveries</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-xs text-gray-400">On-Time Rate</span>
            </div>
            <p className={`text-3xl font-bold ${onTimeColor}`}>{onTimeRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">{stats?.delivered ?? 0} delivered</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Clock size={20} className="text-orange-500" />
              {(stats?.lateDeliveries ?? 0) > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats?.lateDeliveries ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Late deliveries</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle size={20} className="text-red-500" />
              <span className="text-xs text-gray-400">QC</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats?.qcRejections ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">QC rejections</p>
          </div>
        </div>

        {/* Charts */}
        {dashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor On-Time Performance */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-[#0A1628] mb-4">Vendor On-Time Rate</h3>
              {dashboard.vendorOnTime?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dashboard.vendorOnTime} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="vendorName" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={v => `${Number(v).toFixed(1)}%`} />
                    <Bar dataKey="onTimeRate" name="On-Time %" fill="#C6A35D" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No vendor data yet</div>
              )}
            </div>

            {/* Delivery Trend (6 months) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-[#0A1628] mb-4">Delivery Trend (6 Months)</h3>
              {dashboard.deliveryTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dashboard.deliveryTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend iconType="circle" iconSize={10} />
                    <Line type="monotone" dataKey="onTime" name="On-Time" stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="late" name="Late" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No trend data yet</div>
              )}
            </div>
          </div>
        )}

        {/* Status Distribution */}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-[#0A1628] mb-4">Status Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { key: 'pending', label: 'Pending', color: 'bg-gray-400', val: stats.pending },
                { key: 'inTransit', label: 'In Transit', color: 'bg-blue-500', val: stats.inTransit },
                { key: 'delivered', label: 'Delivered', color: 'bg-green-500', val: stats.delivered },
                { key: 'qcInProgress', label: 'QC In Progress', color: 'bg-yellow-400', val: stats.qcInProgress },
                { key: 'rejected', label: 'QC Rejected', color: 'bg-red-500', val: stats.rejected },
              ].map(s => (
                <div key={s.key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.color}`} />
                  <div>
                    <p className="text-lg font-bold text-[#0A1628]">{s.val ?? 0}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PO Delivery Progress */}
        {dashboard?.poDeliveryStatus?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-[#0A1628] mb-4">PO Delivery Progress</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">PO Number</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Vendor</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Project</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Progress</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.poDeliveryStatus.map((po, i) => {
                    const pct = po.deliveryCount > 0 ? Math.min(100, Math.round((po.deliveryCount / (po.totalExpected || po.deliveryCount)) * 100)) : 0;
                    const barColor = pct >= 90 ? 'bg-green-500' : pct >= 60 ? 'bg-orange-400' : 'bg-red-500';
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-3 font-mono text-[#C6A35D] font-medium">{po.poNumber}</td>
                        <td className="py-2 px-3 text-gray-700">{po.vendorName || '—'}</td>
                        <td className="py-2 px-3 text-gray-600">{po.projectName || '—'}</td>
                        <td className="py-2 px-3 w-40">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-gray-700">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Deliveries Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#0A1628]">All Deliveries</h3>
                <p className="text-xs text-gray-500">{total} total records</p>
              </div>
              <button
                onClick={() => router.push('/dashboard/manager/deliveries/create')}
                className="sm:hidden flex items-center gap-2 bg-[#C6A35D] text-white px-3 py-1.5 rounded-lg text-sm"
              >
                <Plus size={14} /> New
              </button>
            </div>

            {/* Filters */}
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search project..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
                />
              </div>
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <select
                value={filters.qcStatus}
                onChange={e => setFilters(f => ({ ...f, qcStatus: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
              >
                <option value="">All QC</option>
                {Object.entries(QC_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={filters.overdue}
                  onChange={e => setFilters(f => ({ ...f, overdue: e.target.checked }))}
                  className="accent-[#C6A35D]"
                />
                Overdue only
              </label>
              <button onClick={applyFilters} className="px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm hover:bg-[#0A1628]/90 transition-colors">
                Apply
              </button>
              {(filters.search || filters.status || filters.qcStatus || filters.overdue) && (
                <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Delivery #</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">PO</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Project</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Vendor</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Required</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Delivered</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">QC</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Delay</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 && !tableLoading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      No deliveries found
                    </td>
                  </tr>
                ) : (
                  deliveries.map(d => (
                    <tr
                      key={d.id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/manager/deliveries/${d.id}`)}
                    >
                      <td className="py-3 px-4 font-mono text-[#C6A35D] font-medium text-xs">{d.deliveryNumber}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{d.purchaseOrder?.poNumber || '—'}</td>
                      <td className="py-3 px-4 text-gray-700 max-w-[140px] truncate">{d.projectName}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-[120px] truncate">{d.vendor?.companyName || d.vendor?.companyLegalName || '—'}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                        {d.requiredDate ? new Date(d.requiredDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                        {d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4"><Badge value={d.status} config={STATUS_CONFIG} /></td>
                      <td className="py-3 px-4"><Badge value={d.qcStatus} config={QC_CONFIG} /></td>
                      <td className="py-3 px-4">
                        {d.delayDays > 0 ? (
                          <span className="text-red-600 font-medium text-xs">{d.delayDays}d late</span>
                        ) : d.delayDays === 0 ? (
                          <span className="text-green-600 text-xs">On time</span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <ChevronRight size={14} className="text-gray-400" />
                      </td>
                    </tr>
                  ))
                )}
                {tableLoading && (
                  <tr>
                    <td colSpan={10} className="py-4 text-center">
                      <RefreshCw size={16} className="animate-spin text-gray-400 mx-auto" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {deliveries.length === 0 && !tableLoading ? (
              <div className="py-10 text-center text-gray-400 text-sm">No deliveries found</div>
            ) : (
              deliveries.map(d => (
                <div
                  key={d.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/manager/deliveries/${d.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[#C6A35D] font-semibold text-sm">{d.deliveryNumber}</p>
                      <p className="text-gray-700 font-medium text-sm mt-0.5 truncate">{d.projectName}</p>
                      <p className="text-gray-500 text-xs">{d.vendor?.companyName || '—'} · {d.purchaseOrder?.poNumber || '—'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge value={d.status} config={STATUS_CONFIG} />
                      <Badge value={d.qcStatus} config={QC_CONFIG} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Required: {d.requiredDate ? new Date(d.requiredDate).toLocaleDateString() : '—'}</span>
                    {d.delayDays > 0 && <span className="text-red-600 font-medium">{d.delayDays}d late</span>}
                    {d.delayDays === 0 && <span className="text-green-600">On time</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More */}
          {deliveries.length < total && (
            <div className="p-4 text-center border-t border-gray-100">
              <button
                onClick={loadMore}
                disabled={tableLoading}
                className="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {tableLoading ? 'Loading...' : `Load more (${total - deliveries.length} remaining)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
