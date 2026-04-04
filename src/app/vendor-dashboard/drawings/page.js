"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, AlertTriangle, CheckCircle, Clock, RotateCcw, Search, XCircle, Eye, Calendar } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const STATUS_CONFIG = {
  DRAFT:             { label: 'Draft',             cls: 'badge badge-gray' },
  SUBMITTED:         { label: 'Submitted',          cls: 'badge badge-blue' },
  UNDER_REVIEW:      { label: 'Under Review',       cls: 'badge badge-gold' },
  APPROVED:          { label: 'Approved',           cls: 'badge badge-green' },
  REJECTED:          { label: 'Rejected',           cls: 'badge badge-red' },
  RESUBMIT_REQUIRED: { label: 'Resubmit Required',  cls: 'badge badge-orange' },
  CANCELLED:         { label: 'Cancelled',          cls: 'badge badge-gray' },
};

const DISCIPLINE_COLORS = {
  Architectural: '#3B82F6', Structural: '#EF4444', MEP: '#10B981',
  Civil: '#F59E0B', Electrical: '#8B5CF6', Mechanical: '#06B6D4',
  Plumbing: '#F97316', Landscape: '#22C55E',
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge badge-gray' };
  return <span className={cfg.cls}>{cfg.label}</span>;
}

export default function VendorDrawingsPage() {
  const router = useRouter();
  const [list, setList]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', discipline: '', page: 1, pageSize: 20 });

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page, pageSize: filters.pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.discipline && { discipline: filters.discipline }),
      });
      const res = await fetch(`${API_BASE}/api/shop-drawings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setList(data.drawings || []);
      setTotal(data.total || 0);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const counts = list.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <ResponsiveLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Drawings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all your drawing submissions</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Under Review', value: counts.UNDER_REVIEW || 0,      icon: <Clock size={18} />,        color: 'text-amber-500 bg-amber-50' },
            { label: 'Approved',     value: counts.APPROVED || 0,          icon: <CheckCircle size={18} />,  color: 'text-green-600 bg-green-50' },
            { label: 'Resubmit',     value: counts.RESUBMIT_REQUIRED || 0, icon: <RotateCcw size={18} />,    color: 'text-orange-500 bg-orange-50' },
            { label: 'Rejected',     value: counts.REJECTED || 0,          icon: <AlertTriangle size={18} />, color: 'text-red-500 bg-red-50' },
          ].map((s) => (
            <div key={s.label} className="kpi-card">
              <div className={`kpi-card__icon ${s.color} mb-2`}>{s.icon}</div>
              <p className="kpi-card__value">{s.value}</p>
              <p className="kpi-card__label">{s.label}</p>
            </div>
          ))}
        </div>

        {(counts.RESUBMIT_REQUIRED || 0) > 0 && (
          <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <AlertTriangle size={20} className="text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                {counts.RESUBMIT_REQUIRED} drawing{counts.RESUBMIT_REQUIRED > 1 ? 's' : ''} require resubmission
              </p>
              <p className="text-xs text-orange-600">Review the feedback and resubmit your revised drawings.</p>
            </div>
          </div>
        )}

        {/* List */}
        <div className="card">
          <div className="card-header flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-semibold text-gray-800">All Drawings <span className="text-sm text-gray-400 font-normal">({total})</span></h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="form-input pl-8 w-44 text-sm"
                  placeholder="Search…"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
                />
              </div>
              <select
                className="form-input text-sm w-40"
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              {(filters.search || filters.status) && (
                <button className="btn btn-ghost text-sm" onClick={() => setFilters((f) => ({ ...f, search: '', status: '', page: 1 }))}>
                  <XCircle size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Title</th>
                  <th>Discipline</th>
                  <th>Rev.</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Required Date</th>
                  <th>Delay</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400">Loading…</td></tr>
                ) : list.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-gray-400">No drawings found</td></tr>
                ) : list.map((d) => {
                  const discColor = DISCIPLINE_COLORS[d.discipline] || '#9CA3AF';
                  return (
                    <tr key={d.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/manager/shop-drawings/${d.id}`)}>
                      <td className="font-medium text-blue-600">{d.drawingNumber}</td>
                      <td className="max-w-[160px] truncate">{d.title}</td>
                      <td>
                        <span className="badge" style={{ background: discColor + '22', color: discColor, border: `1px solid ${discColor}` }}>
                          {d.discipline}
                        </span>
                      </td>
                      <td className="text-gray-500">{d.revisionLetter || 'A'}{d.revisionNumber || 0}</td>
                      <td>{d.projectName || '—'}</td>
                      <td><StatusBadge status={d.status} /></td>
                      <td>{d.requiredDate ? new Date(d.requiredDate).toLocaleDateString() : '—'}</td>
                      <td>
                        {d.delayDays > 0
                          ? <span className="badge badge-red">{d.delayDays}d late</span>
                          : <span className="text-gray-400 text-xs">On time</span>
                        }
                      </td>
                      <td><Eye size={16} className="text-gray-400" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading…</div>
            ) : list.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No drawings found</div>
            ) : list.map((d) => {
              const discColor = DISCIPLINE_COLORS[d.discipline] || '#9CA3AF';
              return (
                <div
                  key={d.id}
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/dashboard/manager/shop-drawings/${d.id}`)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-blue-600 text-sm">{d.drawingNumber}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-sm text-gray-700">{d.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="badge text-xs" style={{ background: discColor + '22', color: discColor, border: `1px solid ${discColor}` }}>{d.discipline}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={11} />{d.requiredDate ? new Date(d.requiredDate).toLocaleDateString() : '—'}</span>
                    {d.delayDays > 0 && <span className="badge badge-red">{d.delayDays}d late</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {total > filters.pageSize && (
            <div className="card-header flex items-center justify-between border-t border-b-0">
              <span className="text-sm text-gray-500">Page {filters.page} of {Math.ceil(total / filters.pageSize)}</span>
              <div className="flex gap-2">
                <button className="btn btn-secondary text-sm" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Prev</button>
                <button className="btn btn-secondary text-sm" disabled={filters.page >= Math.ceil(total / filters.pageSize)} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
