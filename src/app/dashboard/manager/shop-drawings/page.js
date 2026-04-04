"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers, CheckCircle, Clock, AlertTriangle, RefreshCw,
  Search, Plus, Eye, XCircle, RotateCcw, Calendar, Building2, ChevronRight
} from 'lucide-react';
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
  Architectural: '#3B82F6',
  Structural:    '#EF4444',
  MEP:           '#10B981',
  Civil:         '#F59E0B',
  Electrical:    '#8B5CF6',
  Mechanical:    '#06B6D4',
  Plumbing:      '#F97316',
  Landscape:     '#22C55E',
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge badge-gray' };
  return <span className={cfg.cls}>{cfg.label}</span>;
}

function KPICard({ icon, label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="kpi-card">
      <div className={`kpi-card__icon ${colors[color] || colors.blue} mb-3`}>{icon}</div>
      <p className="kpi-card__value">{value ?? '—'}</p>
      <p className="kpi-card__label">{label}</p>
    </div>
  );
}

export default function ShopDrawingsPage() {
  const router = useRouter();
  const [kpis, setKpis]               = useState(null);
  const [byDiscipline, setByDiscipline] = useState([]);
  const [byStatus, setByStatus]        = useState([]);
  const [overdue, setOverdue]          = useState([]);
  const [list, setList]                = useState([]);
  const [total, setTotal]              = useState(0);
  const [loading, setLoading]          = useState(true);
  const [listLoading, setListLoading]  = useState(false);
  const [disciplineFilter, setDisciplineFilter] = useState('');

  const [filters, setFilters] = useState({
    search: '', status: '', discipline: '', page: 1, pageSize: 20,
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/shop-drawings/dashboard`, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setKpis(data.kpis);
      setByDiscipline(data.byDiscipline || []);
      setByStatus(data.byStatus || []);
      setOverdue(data.overdueList || []);
    } catch {
      // leave nulls
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        pageSize: filters.pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.discipline && { discipline: filters.discipline }),
      });
      const res = await fetch(`${API_BASE}/api/shop-drawings?${params}`, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setList(data.drawings || []);
      setTotal(data.total || 0);
    } catch {
      setList([]);
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { fetchList(); }, [fetchList]);

  // Discipline filter chips update main list filter
  const handleDisciplineChip = (disc) => {
    const next = disciplineFilter === disc ? '' : disc;
    setDisciplineFilter(next);
    setFilters((f) => ({ ...f, discipline: next, page: 1 }));
  };

  const maxDisciplineCount = Math.max(...byDiscipline.map((d) => d._count || 0), 1);
  const totalChart = byStatus.reduce((s, i) => s + (i._count || 0), 0) || 1;
  const CHART_COLORS = {
    SUBMITTED: '#3B82F6', UNDER_REVIEW: '#F59E0B', APPROVED: '#10B981',
    REJECTED: '#EF4444', RESUBMIT_REQUIRED: '#F97316', DRAFT: '#9CA3AF', CANCELLED: '#D1D5DB',
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="p-6 space-y-4 animate-pulse">
          <div className="skeleton skeleton-card h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton skeleton-card h-28" />)}
          </div>
          <div className="skeleton skeleton-card h-64" />
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shop Drawings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track fabrication and construction drawings</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/manager/shop-drawings/create')}
            className="btn btn-primary"
          >
            <Plus size={16} /> New Drawing
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <KPICard icon={<Layers size={20} />}        label="Total"          value={kpis?.total}           color="blue" />
          <KPICard icon={<Clock size={20} />}          label="Under Review"   value={kpis?.underReview}     color="amber" />
          <KPICard icon={<CheckCircle size={20} />}    label="Approved"       value={kpis?.approved}        color="green" />
          <KPICard icon={<RotateCcw size={20} />}      label="Resubmit Req."  value={kpis?.resubmitRequired} color="purple" />
          <KPICard icon={<AlertTriangle size={20} />}  label="Overdue"        value={kpis?.overdue}         color="red" />
        </div>

        {/* Discipline filter chips */}
        {byDiscipline.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 font-medium">Discipline:</span>
            <button
              onClick={() => handleDisciplineChip('')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                disciplineFilter === '' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >All</button>
            {byDiscipline.map((d) => (
              <button
                key={d.discipline}
                onClick={() => handleDisciplineChip(d.discipline)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  disciplineFilter === d.discipline
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
                style={disciplineFilter === d.discipline ? { backgroundColor: DISCIPLINE_COLORS[d.discipline] || '#6B7280', borderColor: DISCIPLINE_COLORS[d.discipline] || '#6B7280' } : {}}
              >
                {d.discipline} <span className="opacity-70">({d._count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Discipline bar */}
          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4">Drawings by Discipline</h3>
            <div className="space-y-3">
              {byDiscipline.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
              )}
              {byDiscipline.map((d) => {
                const pct = Math.round(((d._count || 0) / maxDisciplineCount) * 100);
                const color = DISCIPLINE_COLORS[d.discipline] || '#9CA3AF';
                return (
                  <div key={d.discipline}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{d.discipline}</span>
                      <span className="font-medium">{d._count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overdue panel */}
          <div className="card card-body">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" /> Overdue Drawings
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {overdue.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No overdue drawings</p>
              )}
              {overdue.map((d) => (
                <div
                  key={d.id}
                  onClick={() => router.push(`/dashboard/manager/shop-drawings/${d.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{d.drawingNumber}</p>
                    <p className="text-xs text-gray-500 truncate">{d.discipline} · {d.projectName}</p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-xs font-semibold text-red-600">{d.delayDays}d late</p>
                    <ChevronRight size={14} className="text-gray-400 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="card">
          <div className="card-header flex items-center justify-between gap-4 flex-wrap">
            <h3 className="font-semibold text-gray-800">
              All Drawings <span className="text-sm text-gray-400 font-normal ml-1">({total})</span>
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="form-input pl-8 w-48 text-sm"
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
                <button
                  className="btn btn-ghost text-sm"
                  onClick={() => setFilters((f) => ({ ...f, search: '', status: '', page: 1 }))}
                >
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
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Required Date</th>
                  <th>Delay</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  <tr><td colSpan={10} className="text-center py-10 text-gray-400">Loading…</td></tr>
                ) : list.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-10 text-gray-400">No drawings found</td></tr>
                ) : list.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/manager/shop-drawings/${d.id}`)}
                  >
                    <td className="font-medium text-blue-600">{d.drawingNumber}</td>
                    <td className="max-w-[180px] truncate">{d.title}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: (DISCIPLINE_COLORS[d.discipline] || '#9CA3AF') + '22', color: DISCIPLINE_COLORS[d.discipline] || '#6B7280', border: `1px solid ${DISCIPLINE_COLORS[d.discipline] || '#D1D5DB'}` }}
                      >
                        {d.discipline}
                      </span>
                    </td>
                    <td className="text-gray-500">{d.revisionLetter || 'A'} / {d.revisionNumber || 0}</td>
                    <td>{d.projectName || '—'}</td>
                    <td>{d.vendor?.companyName || '—'}</td>
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {listLoading ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading…</div>
            ) : list.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No drawings found</div>
            ) : list.map((d) => (
              <div
                key={d.id}
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/dashboard/manager/shop-drawings/${d.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-blue-600 text-sm">{d.drawingNumber}</span>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-sm text-gray-700">{d.title}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{d.discipline}</span>
                  <span className="flex items-center gap-1"><Building2 size={12} />{d.vendor?.companyName || '—'}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} />{d.requiredDate ? new Date(d.requiredDate).toLocaleDateString() : '—'}</span>
                </div>
                {d.delayDays > 0 && (
                  <span className="badge badge-red mt-2 inline-flex">{d.delayDays}d late</span>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > filters.pageSize && (
            <div className="card-header flex items-center justify-between border-t border-b-0">
              <span className="text-sm text-gray-500">
                Page {filters.page} of {Math.ceil(total / filters.pageSize)}
              </span>
              <div className="flex gap-2">
                <button
                  className="btn btn-secondary text-sm"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                >Prev</button>
                <button
                  className="btn btn-secondary text-sm"
                  disabled={filters.page >= Math.ceil(total / filters.pageSize)}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                >Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
