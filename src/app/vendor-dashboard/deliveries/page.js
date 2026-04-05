"use client";
import { useState, useEffect, useCallback } from 'react';
import { Truck, Package, RefreshCw, Search, X, ChevronRight } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const STATUS_CONFIG = {
  PENDING:              { label: 'Pending',              cls: 'bg-gray-100 text-gray-600' },
  IN_TRANSIT:           { label: 'In Transit',           cls: 'bg-blue-100 text-blue-700' },
  DELIVERED:            { label: 'Delivered',            cls: 'bg-green-100 text-green-700' },
  PARTIALLY_DELIVERED:  { label: 'Partial',              cls: 'bg-orange-100 text-orange-700' },
  QC_IN_PROGRESS:       { label: 'QC In Progress',       cls: 'bg-yellow-100 text-yellow-700' },
  QC_ACCEPTED:          { label: 'QC Accepted',          cls: 'bg-green-100 text-green-700' },
  QC_REJECTED:          { label: 'QC Rejected',          cls: 'bg-red-100 text-red-700' },
  COMPLETED:            { label: 'Completed',            cls: 'bg-emerald-100 text-emerald-700' },
  CANCELLED:            { label: 'Cancelled',            cls: 'bg-gray-100 text-gray-400' },
};

const QC_CONFIG = {
  PENDING_INSPECTION: { label: 'Pending Inspection', cls: 'bg-gray-100 text-gray-500' },
  IN_PROGRESS:        { label: 'In Progress',         cls: 'bg-yellow-100 text-yellow-700' },
  ACCEPTED:           { label: 'Accepted',            cls: 'bg-green-100 text-green-700' },
  REJECTED:           { label: 'Rejected',            cls: 'bg-red-100 text-red-700' },
};

function Badge({ value, config }) {
  const cfg = config[value] || { label: value, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cfg.cls}`}>{cfg.label}</span>;
}

export default function VendorDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchDeliveries = useCallback(async (s = search, st = statusFilter, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
      if (s) params.set('projectName', s);
      if (st) params.set('status', st);
      const r = await fetch(`${API}/api/deliveries?${params}`, { headers });
      if (r.ok) {
        const data = await r.json();
        const list = data.deliveries || data || [];
        setDeliveries(p === 1 ? list : prev => [...prev, ...list]);
        setTotal(data.total || 0);
      }
    } catch (_) {}
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => { fetchDeliveries(search, statusFilter, 1); }, []);

  const applyFilters = () => {
    setPage(1);
    fetchDeliveries(search, statusFilter, 1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPage(1);
    fetchDeliveries('', '', 1);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchDeliveries(search, statusFilter, next);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">My Deliveries</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track delivery status and QC inspection results for your orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search project..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button onClick={applyFilters} className="px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm hover:bg-[#0A1628]/90">
            Apply
          </button>
          {(search || statusFilter) && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Delivery #</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">PO Number</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Project</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Required Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Delivery Date</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">QC Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Delay</th>
              </tr>
            </thead>
            <tbody>
              {loading && deliveries.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center"><RefreshCw size={18} className="animate-spin text-gray-400 mx-auto" /></td></tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    No deliveries found
                  </td>
                </tr>
              ) : (
                deliveries.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-[#C6A35D] font-semibold text-xs">{d.deliveryNumber}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{d.purchaseOrder?.poNumber || '—'}</td>
                    <td className="py-3 px-4 text-gray-700 max-w-[160px] truncate">{d.projectName}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                      {d.requiredDate ? new Date(d.requiredDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                      {d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4"><Badge value={d.status} config={STATUS_CONFIG} /></td>
                    <td className="py-3 px-4"><Badge value={d.qcStatus} config={QC_CONFIG} /></td>
                    <td className="py-3 px-4 text-xs">
                      {d.delayDays > 0 ? (
                        <span className="text-red-600 font-medium">{d.delayDays}d late</span>
                      ) : d.delayDays === 0 ? (
                        <span className="text-green-600">On time</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading && deliveries.length === 0 ? (
            <div className="py-10 text-center"><RefreshCw size={16} className="animate-spin text-gray-400 mx-auto" /></div>
          ) : deliveries.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No deliveries found</div>
          ) : (
            deliveries.map(d => (
              <div key={d.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[#C6A35D] font-semibold text-sm">{d.deliveryNumber}</p>
                    <p className="text-gray-700 font-medium text-sm mt-0.5 truncate">{d.projectName}</p>
                    <p className="text-gray-500 text-xs">{d.purchaseOrder?.poNumber || '—'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge value={d.status} config={STATUS_CONFIG} />
                    <Badge value={d.qcStatus} config={QC_CONFIG} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
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
              disabled={loading}
              className="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Loading...' : `Load more (${total - deliveries.length} remaining)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
