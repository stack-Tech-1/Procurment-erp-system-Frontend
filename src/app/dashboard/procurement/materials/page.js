"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, Plus, Upload, Download, X, Star, ChevronDown,
  ChevronUp, RefreshCw, Package, AlertTriangle, Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { formatCurrency, formatDate } from '@/utils/formatters';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const DIVISION_COLORS = {
  '03': 'bg-stone-100 text-stone-700',
  '05': 'bg-gray-200 text-gray-800',
  '09': 'bg-purple-100 text-purple-700',
  '22': 'bg-blue-100 text-blue-700',
  '23': 'bg-teal-100 text-teal-700',
  '26': 'bg-yellow-100 text-yellow-800',
  '28': 'bg-[#0A1628]/10 text-[#0A1628]',
};
function divColor(div) {
  const key = (div || '').replace(/\D/g, '').slice(0, 2);
  return DIVISION_COLORS[key] || 'bg-gray-100 text-gray-600';
}

const CSI_DIVISIONS = [
  '01 General Requirements', '03 Concrete', '04 Masonry', '05 Metals',
  '06 Wood & Plastics', '07 Thermal & Moisture', '08 Openings', '09 Finishes',
  '10 Specialties', '11 Equipment', '21 Fire Suppression', '22 Plumbing',
  '23 HVAC', '25 Integrated Automation', '26 Electrical', '27 Communications',
  '28 Electronic Safety', '31 Earthwork', '32 Exterior Improvements', '33 Utilities',
];

const MATERIAL_TYPES = ['Concrete', 'Steel', 'Finishes', 'MEP', 'Furniture', 'General Supplies', 'Chemicals', 'Glass', 'Wood', 'Other'];

function isExpiring(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d > now && (d - now) < 30 * 86400 * 1000;
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) <= new Date();
}

export default function MaterialsPage() {
  const router = useRouter();
  const [stats, setStats]       = useState(null);
  const [materials, setMaterials] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [search, setSearch]           = useState('');
  const [filterDiv, setFilterDiv]     = useState('');
  const [filterType, setFilterType]   = useState('');
  const [hasPrice, setHasPrice]       = useState(false);
  const [validOnly, setValidOnly]     = useState(false);
  const [page, setPage]               = useState(1);

  // Drawer state
  const [drawerMat, setDrawerMat]     = useState(null);
  const [drawerData, setDrawerData]   = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Add price modal
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceForm, setPriceForm]   = useState({ vendorId: '', unitPrice: '', currency: 'SAR', vatPercent: '15', leadTimeDays: '', validityDate: '', quotationReference: '', notes: '' });
  const [vendors, setVendors]       = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const importRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await fetch(`${API}/api/materials/stats`, { credentials: 'include' });
      if (r.ok) setStats(await r.json());
    } catch (e) {} finally { setStatsLoading(false); }
  }, []);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 50 });
      if (search)    p.set('search', search);
      if (filterDiv) p.set('csiDivision', filterDiv);
      if (filterType) p.set('materialType', filterType);
      if (hasPrice)  p.set('hasPrice', 'true');
      if (validOnly) p.set('validPricesOnly', 'true');
      const r = await fetch(`${API}/api/materials?${p}`, { credentials: 'include' });
      if (r.ok) { const d = await r.json(); setMaterials(d.data || []); setTotal(d.total || 0); }
    } catch (e) {} finally { setLoading(false); }
  }, [search, filterDiv, filterType, hasPrice, validOnly, page]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  useEffect(() => {
    fetch(`${API}/api/vendors?status=APPROVED&limit=200`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setVendors(d.data || d || []); })
      .catch(() => {});
  }, []);

  const openDrawer = async (mat) => {
    setDrawerMat(mat);
    setDrawerData(null);
    setShowHistory(false);
    setDrawerLoading(true);
    try {
      const r = await fetch(`${API}/api/materials/${mat.id}/price-comparison`, { credentials: 'include' });
      if (r.ok) setDrawerData(await r.json());
    } catch (e) {} finally { setDrawerLoading(false); }
  };

  const loadHistory = async () => {
    if (!drawerMat) return;
    setHistoryLoading(true);
    try {
      const r = await fetch(`${API}/api/materials/${drawerMat.id}/price-history`, { credentials: 'include' });
      if (r.ok) setHistoryData(await r.json());
    } catch (e) {} finally { setHistoryLoading(false); }
  };

  const toggleHistory = () => {
    if (!showHistory && historyData.length === 0) loadHistory();
    setShowHistory(p => !p);
  };

  const submitPriceEntry = async (e) => {
    e.preventDefault();
    if (!drawerMat) return;
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('materialId', drawerMat.id);
      Object.entries(priceForm).forEach(([k, v]) => { if (v) body.append(k, v); });
      const r = await fetch(`${API}/api/price-entries`, { method: 'POST', credentials: 'include', body });
      if (r.ok) {
        showToast('Price entry added');
        setShowPriceModal(false);
        setPriceForm({ vendorId: '', unitPrice: '', currency: 'SAR', vatPercent: '15', leadTimeDays: '', validityDate: '', quotationReference: '', notes: '' });
        openDrawer(drawerMat); // refresh drawer
        fetchStats();
      } else {
        showToast('Failed to add price entry', 'error');
      }
    } catch (e) { showToast('Error', 'error'); } finally { setSubmitting(false); }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const r = await fetch(`${API}/api/materials/import`, { method: 'POST', credentials: 'include', body });
      const d = await r.json();
      if (r.ok) { showToast(`Imported ${d.imported}, Updated ${d.updated}. ${d.errors?.length ? d.errors.length + ' errors.' : ''}`); fetchMaterials(); fetchStats(); }
      else showToast('Import failed', 'error');
    } catch (e) { showToast('Import error', 'error'); } finally { setImportLoading(false); e.target.value = ''; }
  };

  // Build price history chart data per vendor
  const priceChartData = historyData.reduce((acc, entry) => {
    const date = new Date(entry.createdAt).toLocaleDateString('en-SA', { month: 'short', year: '2-digit' });
    let row = acc.find(r => r.date === date);
    if (!row) { row = { date }; acc.push(row); }
    row[entry.vendorName] = entry.unitPrice;
    return acc;
  }, []);
  const historyVendors = [...new Set(historyData.map(e => e.vendorName))];
  const CHART_COLORS = ['#B8960A', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <ResponsiveLayout>
      <div className="p-4 md:p-6 space-y-5 bg-gray-50 min-h-screen">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#0A1628] text-white'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]" style={{ fontFamily: 'Playfair Display, serif' }}>
              CSI Materials & Pricing Database
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Centralized material catalog with vendor pricing and historical data</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => router.push('/dashboard/procurement/materials/create')}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a2e4a] transition-colors">
              <Plus size={15} /> Add Material
            </button>
            <button onClick={() => importRef.current?.click()} disabled={importLoading}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
              {importLoading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />} Import
            </button>
            <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
            <a href={`${API}/api/materials/export`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Download size={14} /> Export
            </a>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-16 animate-pulse" />)
          ) : stats ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Total Materials</p>
                <p className="text-2xl font-bold text-[#0A1628] mt-0.5">{stats.total}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">With Pricing</p>
                <p className="text-2xl font-bold text-[#0A1628] mt-0.5">{stats.withPricing}
                  <span className="text-sm font-normal text-gray-400 ml-1">
                    ({stats.total > 0 ? Math.round(stats.withPricing / stats.total * 100) : 0}%)
                  </span>
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Active Price Entries</p>
                <p className="text-2xl font-bold text-[#0A1628] mt-0.5">{stats.activePriceEntries}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Expiring This Month</p>
                <p className={`text-2xl font-bold mt-0.5 ${stats.expiringThisMonth > 0 ? 'text-orange-500' : 'text-[#0A1628]'}`}>
                  {stats.expiringThisMonth}
                  {stats.expiringThisMonth > 0 && <AlertTriangle size={14} className="inline ml-1 text-orange-500" />}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, code, CSI..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#B8960A] focus:border-[#B8960A] outline-none" />
          </div>
          <select value={filterDiv} onChange={e => { setFilterDiv(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none">
            <option value="">All Divisions</option>
            {CSI_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none">
            <option value="">All Types</option>
            {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={hasPrice} onChange={e => { setHasPrice(e.target.checked); setPage(1); }}
              className="rounded accent-[#B8960A]" />
            Has Price
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={validOnly} onChange={e => { setValidOnly(e.target.checked); setPage(1); }}
              className="rounded accent-[#B8960A]" />
            Valid Only
          </label>
        </div>

        {/* Table — Desktop */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#0A1628] text-white">
                  {['Code', 'CSI Code', 'Division', 'Material Name', 'Type', 'Unit', 'Vendors', 'Lowest Price', 'Std Price', 'Updated', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 11 }).map((_, j) => (
                        <td key={j} className="py-3 px-3"><div className="h-3 bg-gray-200 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : materials.length === 0 ? (
                  <tr><td colSpan={11} className="py-12 text-center text-gray-400">No materials found</td></tr>
                ) : materials.map(m => (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-[#B8960A]/5">
                    <td className="py-3 px-3 font-mono text-gray-600">{m.materialCode || '—'}</td>
                    <td className="py-3 px-3 text-gray-600">{m.csiCode || '—'}</td>
                    <td className="py-3 px-3">
                      {m.csiDivision ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${divColor(m.csiDivision)}`}>
                          {m.csiDivision.slice(0, 12)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#0A1628] max-w-[180px] truncate">
                      {m.materialName || m.name}
                    </td>
                    <td className="py-3 px-3 text-gray-600">{m.materialType || '—'}</td>
                    <td className="py-3 px-3 text-gray-600">{m.unit || '—'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                        {m.vendorCount || 0}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-emerald-600">
                      {m.lowestPrice != null ? formatCurrency(m.lowestPrice) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      {m.standardPrice != null ? formatCurrency(m.standardPrice) : '—'}
                    </td>
                    <td className="py-3 px-3 text-gray-400">
                      {m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <button onClick={() => openDrawer(m)}
                          className="px-2 py-1 bg-[#B8960A] text-white rounded text-[10px] font-medium hover:bg-[#a07d08]">
                          Prices
                        </button>
                        <button onClick={() => router.push(`/dashboard/procurement/materials/create?edit=${m.id}`)}
                          className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-[10px] hover:bg-gray-50">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 50 && (
            <div className="flex items-center justify-between p-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total}</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 border border-gray-200 rounded text-xs disabled:opacity-40">Prev</button>
                <button disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border border-gray-200 rounded text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {materials.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-medium text-sm text-[#0A1628]">{m.materialName || m.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{m.materialCode}</p>
                </div>
                {m.csiDivision && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${divColor(m.csiDivision)}`}>
                    {m.csiDivision.slice(0, 10)}
                  </span>
                )}
              </div>
              <div className="flex gap-4 text-xs text-gray-500 mb-3">
                <span>Type: <b>{m.materialType || '—'}</b></span>
                <span>Unit: <b>{m.unit || '—'}</b></span>
                <span>Vendors: <b>{m.vendorCount || 0}</b></span>
              </div>
              {m.lowestPrice != null && (
                <p className="text-sm font-bold text-emerald-600 mb-2">Lowest: {formatCurrency(m.lowestPrice)}</p>
              )}
              <button onClick={() => openDrawer(m)}
                className="w-full py-1.5 bg-[#0A1628] text-white rounded-lg text-xs font-medium">
                View Prices
              </button>
            </div>
          ))}
        </div>

        {/* Price Comparison Drawer */}
        {drawerMat && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDrawerMat(null)} />
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
              {/* Drawer Header */}
              <div className="bg-[#0A1628] text-white p-4 flex items-start justify-between">
                <div>
                  <p className="font-bold">{drawerMat.materialName || drawerMat.name}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{drawerMat.csiCode} • {drawerMat.unit}</p>
                </div>
                <button onClick={() => setDrawerMat(null)} className="text-gray-400 hover:text-white mt-0.5">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {drawerLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <RefreshCw className="animate-spin text-[#B8960A]" size={24} />
                  </div>
                ) : drawerData ? (
                  <>
                    {/* Price Table */}
                    {drawerData.entries?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gray-200">
                              {['Vendor', 'Unit Price', 'VAT%', 'w/ VAT', 'Lead', 'Valid Until', 'Ref', ''].map(h => (
                                <th key={h} className="text-left py-2 px-2 text-gray-500 font-medium whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {drawerData.entries.map((e, i) => {
                              const expired  = isExpired(e.validityDate);
                              const expiring = isExpiring(e.validityDate);
                              return (
                                <tr key={i} className={`border-b border-gray-100 ${expired ? 'opacity-50' : ''}`}>
                                  <td className="py-2 px-2">
                                    <p className="font-medium">{e.vendorName}</p>
                                    <span className="text-[10px] px-1 py-0.5 rounded text-white font-bold"
                                      style={{ backgroundColor: { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444' }[e.vendorClass] || '#6b7280' }}>
                                      {e.vendorClass}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 font-medium text-[#0A1628]">{formatCurrency(e.unitPrice, e.currency)}</td>
                                  <td className="py-2 px-2 text-gray-600">{e.vatPercent}%</td>
                                  <td className="py-2 px-2 text-gray-700">{formatCurrency(e.priceWithVAT, e.currency)}</td>
                                  <td className="py-2 px-2 text-gray-500">{e.leadTimeDays ? `${e.leadTimeDays}d` : '—'}</td>
                                  <td className={`py-2 px-2 text-[10px] ${expired ? 'text-red-500' : expiring ? 'text-orange-500' : 'text-gray-500'}`}>
                                    {e.validityDate ? new Date(e.validityDate).toLocaleDateString() : '—'}
                                    {expired && ' (Expired)'}
                                    {expiring && !expired && ' (Soon)'}
                                  </td>
                                  <td className="py-2 px-2 text-gray-400">{e.quotationReference || '—'}</td>
                                  <td className="py-2 px-2">
                                    {e.isLowest && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-8">No price entries yet for this material.</p>
                    )}

                    {/* Summary */}
                    {drawerData.summary && drawerData.entries?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 text-xs">
                        <div className="text-center">
                          <p className="text-gray-400">Lowest</p>
                          <p className="font-bold text-emerald-600">{formatCurrency(drawerData.summary.lowestPrice)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Average</p>
                          <p className="font-bold text-gray-700">{formatCurrency(drawerData.summary.averagePrice)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400">Highest</p>
                          <p className="font-bold text-red-500">{formatCurrency(drawerData.summary.highestPrice)}</p>
                        </div>
                      </div>
                    )}

                    {/* Price History Toggle */}
                    <button onClick={toggleHistory}
                      className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      Price History
                      {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showHistory && (
                      <div>
                        {historyLoading ? (
                          <div className="flex items-center justify-center h-24"><RefreshCw className="animate-spin text-[#B8960A]" size={20} /></div>
                        ) : priceChartData.length > 1 ? (
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={priceChartData}>
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip formatter={v => formatCurrency(v)} />
                              <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                              {historyVendors.map((vendor, i) => (
                                <Line key={vendor} dataKey={vendor} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-4">Not enough history to chart</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">Failed to load price data.</p>
                )}
              </div>

              {/* Add Price Entry Button */}
              <div className="p-4 border-t border-gray-200">
                <button onClick={() => setShowPriceModal(true)}
                  className="w-full py-2.5 bg-[#B8960A] text-white rounded-xl text-sm font-medium hover:bg-[#a07d08] transition-colors">
                  + Add Price Entry
                </button>
              </div>
            </div>
          </>
        )}

        {/* Add Price Modal */}
        {showPriceModal && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-bold text-[#0A1628] text-sm">Add Price Entry — {drawerMat?.materialName || drawerMat?.name}</h3>
                <button onClick={() => setShowPriceModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <form onSubmit={submitPriceEntry} className="p-4 space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Vendor *</label>
                  <select required value={priceForm.vendorId} onChange={e => setPriceForm(p => ({ ...p, vendorId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none">
                    <option value="">Select vendor...</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.companyLegalName}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Unit Price *</label>
                    <input type="number" step="0.01" required value={priceForm.unitPrice}
                      onChange={e => setPriceForm(p => ({ ...p, unitPrice: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Currency</label>
                    <select value={priceForm.currency} onChange={e => setPriceForm(p => ({ ...p, currency: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none">
                      <option>SAR</option><option>USD</option><option>EUR</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">VAT %</label>
                    <input type="number" step="0.1" value={priceForm.vatPercent}
                      onChange={e => setPriceForm(p => ({ ...p, vatPercent: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Lead Time (days)</label>
                    <input type="number" value={priceForm.leadTimeDays}
                      onChange={e => setPriceForm(p => ({ ...p, leadTimeDays: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Valid Until</label>
                  <input type="date" value={priceForm.validityDate}
                    onChange={e => setPriceForm(p => ({ ...p, validityDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quotation Reference</label>
                  <input type="text" value={priceForm.quotationReference}
                    onChange={e => setPriceForm(p => ({ ...p, quotationReference: e.target.value }))}
                    placeholder="e.g. QUO-2025-0123"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Notes</label>
                  <textarea value={priceForm.notes} onChange={e => setPriceForm(p => ({ ...p, notes: e.target.value }))}
                    rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none resize-none" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowPriceModal(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2 bg-[#B8960A] text-white rounded-xl text-sm font-medium hover:bg-[#a07d08] disabled:opacity-50">
                    {submitting ? 'Saving...' : 'Save Price Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ResponsiveLayout>
  );
}
