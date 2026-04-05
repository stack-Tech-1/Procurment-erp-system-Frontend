"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, Plus, Upload,
  Download, Search, RefreshCw, X, ChevronRight, ChevronDown, ChevronUp,
  FileSpreadsheet, BarChart2, Eye, Layers
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const TX_CONFIG = {
  PO_COMMITMENT: { label: 'PO Commitment', cls: 'bg-yellow-100 text-yellow-700' },
  INVOICE:       { label: 'Invoice',        cls: 'bg-blue-100 text-blue-700' },
  PAYMENT:       { label: 'Payment',        cls: 'bg-green-100 text-green-700' },
  ADJUSTMENT:    { label: 'Adjustment',     cls: 'bg-orange-100 text-orange-700' },
  DIRECT_COST:   { label: 'Direct Cost',    cls: 'bg-purple-100 text-purple-700' },
};

function TxBadge({ type }) {
  const cfg = TX_CONFIG[type] || { label: type, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
}

function CategoryBadge({ value }) {
  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700'];
  const idx = value ? value.charCodeAt(0) % colors.length : 0;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[idx]}`}>{value || 'General'}</span>;
}

function UtilBar({ pct }) {
  const color = pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-orange-400' : pct >= 70 ? 'bg-yellow-400' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className={`text-xs font-medium w-10 text-right ${pct >= 100 ? 'text-red-600' : pct >= 90 ? 'text-orange-600' : 'text-gray-600'}`}>
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

export default function BudgetControlPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [boqData, setBoqData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [drawerItem, setDrawerItem] = useState(null); // { costCode, projectName }
  const [drawerTxs, setDrawerTxs] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boqLoading, setBoqLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [overBudgetOnly, setOverBudgetOnly] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const [newItem, setNewItem] = useState({ costCode: '', boqDescription: '', budgetAmount: '', unit: '', quantity: '', unitRate: '', category: '' });
  const [newTx, setNewTx] = useState({ costCode: '', transactionType: 'DIRECT_COST', amount: '', description: '', transactionDate: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };
  let userRole = 1;
  try { userRole = JSON.parse(atob(token?.split('.')[1] || 'e30=')).roleId || 1; } catch (_) {}
  const MANAGER_PLUS = [1, 2].includes(userRole);

  const fetchProjects = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/budget/projects`, { headers });
      if (r.ok) setProjects(await r.json());
    } catch (_) {}
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/budget/summary`, { headers });
      if (r.ok) setSummary(await r.json());
    } catch (_) {}
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchProjects(), fetchSummary()]);
      setLoading(false);
    })();
  }, []);

  const fetchBOQ = useCallback(async (projectName) => {
    if (!projectName) return;
    setBoqLoading(true);
    try {
      const r = await fetch(`${API}/api/budget/${encodeURIComponent(projectName)}`, { headers });
      if (r.ok) setBoqData(await r.json());
    } catch (_) {}
    setBoqLoading(false);
  }, []);

  const openProject = (proj) => {
    setSelectedProject(proj.projectName);
    setBoqData(null);
    setPage(1);
    fetchBOQ(proj.projectName);
  };

  const openDrawer = async (item) => {
    setDrawerItem(item);
    setDrawerLoading(true);
    try {
      const r = await fetch(`${API}/api/budget/transactions/${encodeURIComponent(item.projectName)}/${encodeURIComponent(item.costCode)}`, { headers });
      if (r.ok) setDrawerTxs(await r.json());
    } catch (_) {}
    setDrawerLoading(false);
  };

  const saveItem = async () => {
    if (!newItem.costCode || !newItem.boqDescription || !newItem.budgetAmount) return;
    setSaving(true);
    try {
      const r = await fetch(`${API}/api/budget/projects/${encodeURIComponent(selectedProject)}/items`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, budgetAmount: parseFloat(newItem.budgetAmount), quantity: newItem.quantity ? parseFloat(newItem.quantity) : null, unitRate: newItem.unitRate ? parseFloat(newItem.unitRate) : null }),
      });
      if (r.ok) {
        setShowAddItem(false);
        setNewItem({ costCode: '', boqDescription: '', budgetAmount: '', unit: '', quantity: '', unitRate: '', category: '' });
        fetchBOQ(selectedProject);
        fetchProjects();
      } else { const e = await r.json(); alert(e.error || 'Failed'); }
    } catch (_) {}
    setSaving(false);
  };

  const saveTx = async () => {
    if (!newTx.costCode || !newTx.amount || !selectedProject) return;
    setSaving(true);
    try {
      const r = await fetch(`${API}/api/budget/transactions`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTx, projectName: selectedProject, amount: parseFloat(newTx.amount), transactionDate: new Date(newTx.transactionDate) }),
      });
      if (r.ok) {
        setShowAddTx(false);
        setNewTx({ costCode: '', transactionType: 'DIRECT_COST', amount: '', description: '', transactionDate: new Date().toISOString().split('T')[0] });
        fetchBOQ(selectedProject);
        if (drawerItem) openDrawer(drawerItem);
      } else { const e = await r.json(); alert(e.error || 'Failed'); }
    } catch (_) {}
    setSaving(false);
  };

  const handleImport = async () => {
    if (!importFile || !selectedProject) return;
    setImporting(true);
    const fd = new FormData();
    fd.append('file', importFile);
    try {
      const r = await fetch(`${API}/api/budget/projects/${encodeURIComponent(selectedProject)}/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (r.ok) {
        setImportResult(await r.json());
        fetchBOQ(selectedProject);
        fetchProjects();
      }
    } catch (_) {}
    setImporting(false);
  };

  const handleExport = () => {
    if (!selectedProject) return;
    window.open(`${API}/api/budget/projects/${encodeURIComponent(selectedProject)}/export?token=${token}`, '_blank');
  };

  // Filtered BOQ rows
  const boqItems = (boqData?.items || []).filter(item => {
    if (overBudgetOnly && !item.isOverBudget) return false;
    if (search && !item.costCode.toLowerCase().includes(search.toLowerCase()) &&
      !item.boqDescription.toLowerCase().includes(search.toLowerCase()) &&
      !(item.category || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const pagedItems = boqItems.slice(0, page * PAGE_SIZE);
  const hasMore = pagedItems.length < boqItems.length;

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="animate-spin h-10 w-10 text-[#C6A35D] mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Loading budget data...</p>
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
            <h1 className="text-2xl font-bold text-[#0A1628]">Budget vs Actual (BOQ)</h1>
            <p className="text-gray-500 text-sm mt-0.5">Cost control — track committed, invoiced, and paid amounts against budget</p>
          </div>
          <div className="flex items-center gap-2">
            {MANAGER_PLUS && selectedProject && (
              <>
                <button
                  onClick={() => setShowImport(true)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Upload size={14} /> Import Excel
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Download size={14} /> Export
                </button>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-2 bg-[#C6A35D] hover:bg-[#b8924a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={14} /> Add BOQ Item
                </button>
              </>
            )}
          </div>
        </div>

        {/* Summary KPIs */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0A1628] text-white p-5 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Total Budget</p>
              <p className="text-xl font-bold">{formatCurrency(summary.totalBudget || 0)}</p>
              <p className="text-xs text-gray-400 mt-1">{summary.totalProjects || 0} projects</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Committed</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(summary.totalCommitted || 0)}</p>
              <p className="text-xs text-gray-400 mt-1">PO commitments</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">Invoiced</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.totalInvoiced || 0)}</p>
              <p className="text-xs text-gray-400 mt-1">Billed amount</p>
            </div>
            <div className={`p-5 rounded-xl border shadow-sm ${(summary.overBudgetProjects || 0) > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
              <p className="text-xs text-gray-400 mb-1">Over Budget</p>
              <p className={`text-xl font-bold ${(summary.overBudgetProjects || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {summary.overBudgetProjects || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">projects</p>
            </div>
          </div>
        )}

        {/* Charts */}
        {summary?.utilizationByProject?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-[#0A1628] mb-4">Budget Utilization by Project</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary.utilizationByProject.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 110]} />
                  <YAxis type="category" dataKey="projectName" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip formatter={v => `${Number(v).toFixed(1)}%`} />
                  <Bar dataKey="utilizationPercent" name="Utilization %" fill="#C6A35D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {summary?.budgetTrend?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-[#0A1628] mb-4">Cost Flow (6 Months)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={summary.budgetTrend}>
                    <defs>
                      <linearGradient id="gcmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C6A35D" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#C6A35D" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gpaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => formatCurrency(v)} />
                    <Legend iconType="circle" iconSize={10} />
                    <Area type="monotone" dataKey="committed" name="Committed" stroke="#C6A35D" fill="url(#gcmt)" strokeWidth={2} />
                    <Area type="monotone" dataKey="paid" name="Paid" stroke="#22c55e" fill="url(#gpaid)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Project Cards */}
        {!selectedProject && (
          <div>
            <h2 className="font-semibold text-[#0A1628] mb-4">Projects</h2>
            {projects.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
                <Layers size={36} className="mx-auto mb-3 opacity-30" />
                <p>No budget projects yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(proj => {
                  const pct = proj.totalBudget > 0 ? (proj.totalCommitted / proj.totalBudget) * 100 : 0;
                  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-orange-400' : 'bg-green-500';
                  return (
                    <div key={proj.projectName} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-[#0A1628] text-sm leading-snug">{proj.projectName}</h3>
                        {pct >= 100 && <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />}
                      </div>
                      <p className="text-lg font-bold text-[#0A1628] mb-1">{formatCurrency(proj.totalBudget)}</p>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1.5">
                        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-4">
                        <span>Committed: {formatCurrency(proj.totalCommitted || 0)}</span>
                        <span className={pct >= 100 ? 'text-red-600 font-semibold' : ''}>{pct.toFixed(1)}%</span>
                      </div>
                      <button
                        onClick={() => openProject(proj)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#0A1628] text-white rounded-lg text-xs font-medium hover:bg-[#0A1628]/90 transition-colors"
                      >
                        <Eye size={12} /> View BOQ
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BOQ Table */}
        {selectedProject && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => { setSelectedProject(null); setBoqData(null); }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ChevronRight size={14} className="rotate-180" /> All Projects
                </button>
                <span className="text-gray-300">/</span>
                <h2 className="font-semibold text-[#0A1628]">{selectedProject}</h2>
              </div>

              {/* BOQ Summary KPIs */}
              {boqData && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Total Budget', val: boqData.summary?.totalBudget, color: 'text-[#0A1628]' },
                    { label: 'Committed', val: boqData.summary?.totalCommitted, color: 'text-yellow-600' },
                    { label: 'Invoiced', val: boqData.summary?.totalInvoiced, color: 'text-blue-600' },
                    { label: 'Paid', val: boqData.summary?.totalPaid, color: 'text-green-600' },
                  ].map(k => (
                    <div key={k.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400">{k.label}</p>
                      <p className={`text-base font-bold mt-0.5 ${k.color}`}>{formatCurrency(k.val || 0)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[160px]">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cost code or description..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
                  />
                </div>
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={overBudgetOnly} onChange={e => { setOverBudgetOnly(e.target.checked); setPage(1); }} className="accent-red-500" />
                  Over budget only
                </label>
                {MANAGER_PLUS && (
                  <button onClick={() => setShowAddTx(true)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    <Plus size={13} /> Manual Transaction
                  </button>
                )}
              </div>
            </div>

            {boqLoading ? (
              <div className="py-12 text-center"><RefreshCw size={20} className="animate-spin text-gray-400 mx-auto" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium whitespace-nowrap">Cost Code</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Description</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium whitespace-nowrap">Budget (SAR)</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium whitespace-nowrap">Committed</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium whitespace-nowrap">Invoiced</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium whitespace-nowrap">Paid</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium whitespace-nowrap">Variance</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Utilization</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {pagedItems.length === 0 ? (
                      <tr><td colSpan={10} className="py-12 text-center text-gray-400 text-sm">No BOQ items found</td></tr>
                    ) : (
                      <>
                        {pagedItems.map(item => (
                          <tr
                            key={item.costCode}
                            className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                              item.isOverBudget ? 'border-l-4 border-l-red-400' :
                              item.utilizationPercent >= 90 ? 'border-l-4 border-l-orange-300' : ''
                            }`}
                            onClick={() => openDrawer({ ...item, projectName: selectedProject })}
                          >
                            <td className="py-3 px-4 font-mono text-xs text-[#C6A35D] font-semibold whitespace-nowrap">{item.costCode}</td>
                            <td className="py-3 px-4 text-gray-700 max-w-[200px]">
                              <p className="truncate">{item.boqDescription}</p>
                            </td>
                            <td className="py-3 px-4"><CategoryBadge value={item.category} /></td>
                            <td className="py-3 px-4 text-right text-gray-700 font-medium whitespace-nowrap">{formatCurrency(item.budgetAmount)}</td>
                            <td className="py-3 px-4 text-right text-yellow-600 whitespace-nowrap">{formatCurrency(item.committed)}</td>
                            <td className="py-3 px-4 text-right text-blue-600 whitespace-nowrap">{formatCurrency(item.invoiced)}</td>
                            <td className="py-3 px-4 text-right text-green-600 whitespace-nowrap">{formatCurrency(item.paid)}</td>
                            <td className={`py-3 px-4 text-right font-semibold whitespace-nowrap ${item.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(item.variance))}
                            </td>
                            <td className="py-3 px-4 min-w-[120px]">
                              <UtilBar pct={item.utilizationPercent || 0} />
                            </td>
                            <td className="py-3 px-4">
                              <ChevronRight size={14} className="text-gray-400" />
                            </td>
                          </tr>
                        ))}
                        {/* Grand Total */}
                        {boqData?.summary && (
                          <tr className="bg-[#0A1628] text-white font-bold">
                            <td colSpan={3} className="py-3 px-4">TOTAL</td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">{formatCurrency(boqData.summary.totalBudget)}</td>
                            <td className="py-3 px-4 text-right text-yellow-300 whitespace-nowrap">{formatCurrency(boqData.summary.totalCommitted)}</td>
                            <td className="py-3 px-4 text-right text-blue-300 whitespace-nowrap">{formatCurrency(boqData.summary.totalInvoiced)}</td>
                            <td className="py-3 px-4 text-right text-green-300 whitespace-nowrap">{formatCurrency(boqData.summary.totalPaid)}</td>
                            <td className={`py-3 px-4 text-right whitespace-nowrap ${(boqData.summary.totalBudget - boqData.summary.totalCommitted) < 0 ? 'text-red-300' : 'text-green-300'}`}>
                              {(boqData.summary.totalBudget - boqData.summary.totalCommitted) < 0 ? '-' : '+'}
                              {formatCurrency(Math.abs(boqData.summary.totalBudget - boqData.summary.totalCommitted))}
                            </td>
                            <td colSpan={2} className="py-3 px-4" />
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {hasMore && (
              <div className="p-4 text-center border-t border-gray-100">
                <button onClick={() => setPage(p => p + 1)} className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Load more ({boqItems.length - pagedItems.length} remaining)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cost Transactions Drawer */}
        {drawerItem && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setDrawerItem(null)} />
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
              <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <p className="font-mono text-[#C6A35D] text-xs font-semibold">{drawerItem.costCode}</p>
                  <h3 className="font-bold text-[#0A1628] mt-0.5">{drawerItem.boqDescription}</h3>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>Budget: <strong className="text-gray-800">{formatCurrency(drawerItem.budgetAmount)}</strong></span>
                    <span>Committed: <strong className="text-yellow-600">{formatCurrency(drawerItem.committed)}</strong></span>
                  </div>
                </div>
                <button onClick={() => setDrawerItem(null)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Variance mini card */}
              <div className={`mx-5 mt-4 p-3 rounded-xl ${drawerItem.variance < 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <p className="text-xs text-gray-500">Variance</p>
                <p className={`text-lg font-bold ${drawerItem.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {drawerItem.variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(drawerItem.variance))}
                </p>
              </div>

              {MANAGER_PLUS && (
                <div className="px-5 mt-3">
                  <button
                    onClick={() => { setNewTx(t => ({ ...t, costCode: drawerItem.costCode })); setShowAddTx(true); }}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-[#C6A35D] text-[#C6A35D] rounded-lg text-sm hover:bg-[#C6A35D]/5"
                  >
                    <Plus size={13} /> Add Manual Transaction
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-5 space-y-3 mt-2">
                {drawerLoading ? (
                  <div className="text-center py-8"><RefreshCw size={18} className="animate-spin text-gray-400 mx-auto" /></div>
                ) : drawerTxs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No transactions yet</div>
                ) : (
                  drawerTxs.map(tx => (
                    <div key={tx.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <TxBadge type={tx.transactionType} />
                        <span className="font-semibold text-gray-800 text-sm">{formatCurrency(tx.amount)}</span>
                      </div>
                      {tx.referenceNumber && (
                        <p className="text-xs text-[#C6A35D] font-mono mt-1">{tx.referenceNumber}</p>
                      )}
                      {tx.description && <p className="text-xs text-gray-500 mt-0.5">{tx.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(tx.transactionDate).toLocaleDateString()} · {tx.createdBy?.name || 'System'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Add BOQ Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
              <h3 className="font-bold text-[#0A1628]">Add BOQ Item — {selectedProject}</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cost Code *" value={newItem.costCode} onChange={v => setNewItem(n => ({ ...n, costCode: v }))} placeholder="e.g. CIVIL-001" />
                <Field label="Category" value={newItem.category} onChange={v => setNewItem(n => ({ ...n, category: v }))} placeholder="e.g. Civil Works" />
                <div className="col-span-2">
                  <Field label="Description *" value={newItem.boqDescription} onChange={v => setNewItem(n => ({ ...n, boqDescription: v }))} placeholder="Item description" />
                </div>
                <Field label="Budget Amount (SAR) *" value={newItem.budgetAmount} onChange={v => setNewItem(n => ({ ...n, budgetAmount: v }))} type="number" placeholder="0.00" />
                <Field label="Unit" value={newItem.unit} onChange={v => setNewItem(n => ({ ...n, unit: v }))} placeholder="m², ton, pcs..." />
                <Field label="Quantity" value={newItem.quantity} onChange={v => setNewItem(n => ({ ...n, quantity: v }))} type="number" placeholder="0" />
                <Field label="Unit Rate" value={newItem.unitRate} onChange={v => setNewItem(n => ({ ...n, unitRate: v }))} type="number" placeholder="0.00" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowAddItem(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button disabled={saving || !newItem.costCode || !newItem.boqDescription || !newItem.budgetAmount} onClick={saveItem}
                  className="px-5 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Manual Transaction Modal */}
        {showAddTx && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="font-bold text-[#0A1628]">Add Manual Transaction</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cost Code *</label>
                  <select
                    value={newTx.costCode}
                    onChange={e => setNewTx(t => ({ ...t, costCode: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
                  >
                    <option value="">Select cost code...</option>
                    {(boqData?.items || []).map(i => (
                      <option key={i.costCode} value={i.costCode}>{i.costCode} — {i.boqDescription}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select value={newTx.transactionType} onChange={e => setNewTx(t => ({ ...t, transactionType: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30">
                    {Object.entries(TX_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <Field label="Amount (SAR) *" value={newTx.amount} onChange={v => setNewTx(t => ({ ...t, amount: v }))} type="number" placeholder="0.00" />
                <Field label="Date *" value={newTx.transactionDate} onChange={v => setNewTx(t => ({ ...t, transactionDate: v }))} type="date" />
                <Field label="Description" value={newTx.description} onChange={v => setNewTx(t => ({ ...t, description: v }))} placeholder="Transaction notes..." />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowAddTx(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button disabled={saving || !newTx.costCode || !newTx.amount} onClick={saveTx}
                  className="px-5 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Transaction'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImport && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="font-bold text-[#0A1628]">Import BOQ from Excel</h3>
              <p className="text-sm text-gray-500">
                Expected columns: <span className="font-mono text-xs bg-gray-100 px-1 rounded">Cost Code, Description, Budget Amount, Unit, Quantity, Unit Rate, Category</span>
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={e => { setImportFile(e.target.files[0]); setImportResult(null); }}
                className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-[#C6A35D]/10 file:text-[#C6A35D]"
              />
              {importResult && (
                <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                  Imported: {importResult.imported}, Updated: {importResult.updated}
                  {importResult.errors?.length > 0 && <p className="text-red-600 mt-1">Errors: {importResult.errors.length}</p>}
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowImport(false); setImportResult(null); setImportFile(null); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Close</button>
                <button disabled={!importFile || importing} onClick={handleImport}
                  className="flex items-center gap-2 px-5 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  <Upload size={13} /> {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
      />
    </div>
  );
}
