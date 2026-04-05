"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, X, RefreshCw, Download, FileText, Plus } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { formatCurrency } from '@/utils/formatters';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const GOLD = '#B8960A';

export default function PriceComparisonSheetPage() {
  const router = useRouter();

  // Step 1 — select materials
  const [matSearch, setMatSearch]       = useState('');
  const [matResults, setMatResults]     = useState([]);
  const [matSearching, setMatSearching] = useState(false);
  const [selected, setSelected]         = useState([]); // [{id, materialName, csiCode, unit}]
  const [rfqs, setRfqs]                 = useState([]);
  const [selectedRfq, setSelectedRfq]   = useState('');
  const searchTimer = useRef(null);

  // Step 2 — configure
  const [title, setTitle]       = useState(`Price Comparison Sheet — ${new Date().toLocaleDateString()}`);
  const [project, setProject]   = useState('');
  const [notes, setNotes]       = useState('');

  // Step 3 — result
  const [matrix, setMatrix]       = useState(null); // { vendors: [{id,name}], rows: [{materialId, materialName, unit, prices: {vendorId: {unitPrice, isLowest}}}] }
  const [generating, setGenerating] = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    fetch(`${API}/api/rfqs?status=OPEN&limit=50`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRfqs(d.data || d || []); })
      .catch(() => {});
  }, []);

  const searchMaterials = useCallback((q) => {
    if (!q || q.length < 2) { setMatResults([]); return; }
    setMatSearching(true);
    fetch(`${API}/api/materials?search=${encodeURIComponent(q)}&limit=20`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { setMatResults(d?.data || []); })
      .catch(() => {})
      .finally(() => setMatSearching(false));
  }, []);

  const onSearchChange = (v) => {
    setMatSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchMaterials(v), 350);
  };

  const addMaterial = (m) => {
    if (selected.find(s => s.id === m.id)) return;
    setSelected(p => [...p, { id: m.id, materialName: m.materialName || m.name, csiCode: m.csiCode, unit: m.unit }]);
    setMatSearch('');
    setMatResults([]);
  };

  const removeMaterial = (id) => setSelected(p => p.filter(s => s.id !== id));

  const loadFromRfq = async (rfqId) => {
    setSelectedRfq(rfqId);
    if (!rfqId) return;
    // RFQ items may have csiCode — try to find matching materials
    try {
      const r = await fetch(`${API}/api/rfqs/${rfqId}`, { credentials: 'include' });
      if (!r.ok) return;
      const rfq = await r.json();
      if (rfq.csiCode) {
        const mr = await fetch(`${API}/api/materials?search=${encodeURIComponent(rfq.csiCode)}&limit=20`, { credentials: 'include' });
        if (mr.ok) { const d = await mr.json(); (d.data || []).forEach(addMaterial); }
      }
      if (rfq.projectName && !project) setProject(rfq.projectName);
    } catch (e) {}
  };

  const generate = async () => {
    if (selected.length === 0) { showToast('Select at least one material', 'error'); return; }
    setGenerating(true);
    setMatrix(null);
    try {
      // Fetch price comparison for each material in parallel
      const comparisons = await Promise.all(
        selected.map(m => fetch(`${API}/api/materials/${m.id}/price-comparison`, { credentials: 'include' }).then(r => r.ok ? r.json() : null))
      );

      // Build union of all vendor names
      const vendorMap = {};
      comparisons.forEach(c => {
        if (!c) return;
        (c.entries || []).forEach(e => { vendorMap[e.vendorId] = e.vendorName; });
      });
      const vendors = Object.entries(vendorMap).map(([id, name]) => ({ id: parseInt(id), name }));

      // Build rows
      const rows = selected.map((mat, i) => {
        const comp = comparisons[i];
        const prices = {};
        vendors.forEach(v => { prices[v.id] = null; });
        if (comp) {
          (comp.entries || []).forEach(e => { prices[e.vendorId] = { unitPrice: e.unitPrice, isLowest: e.isLowest, currency: e.currency }; });
        }
        return { materialId: mat.id, materialName: mat.materialName, csiCode: mat.csiCode, unit: mat.unit, prices };
      });

      // Total per vendor (sum of lowest per row where they're lowest)
      const totals = {};
      vendors.forEach(v => {
        totals[v.id] = rows.reduce((sum, row) => {
          const p = row.prices[v.id];
          return sum + (p?.unitPrice || 0);
        }, 0);
      });

      setMatrix({ vendors, rows, totals });
    } catch (e) { showToast('Generation failed', 'error'); }
    finally { setGenerating(false); }
  };

  const exportToCsv = () => {
    if (!matrix) return;
    const headers = ['#', 'Material', 'CSI Code', 'Unit', ...matrix.vendors.map(v => v.name), 'Best Price'];
    const rows = matrix.rows.map((row, i) => {
      const prices = matrix.vendors.map(v => row.prices[v.id]?.unitPrice ?? 'N/A');
      const validPrices = prices.filter(p => p !== 'N/A');
      const best = validPrices.length > 0 ? Math.min(...validPrices) : 'N/A';
      return [i + 1, row.materialName, row.csiCode || '', row.unit || '', ...prices, best];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `price-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('CSV exported');
  };

  const saveAsRfqComparison = async () => {
    if (!selectedRfq || !matrix) { showToast('No RFQ selected', 'error'); return; }
    try {
      const r = await fetch(`${API}/api/rfqs/${selectedRfq}/price-comparison-sheet`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialIds: selected.map(m => m.id) }),
      });
      if (r.ok) showToast('Saved as RFQ comparison');
      else showToast('Failed to save', 'error');
    } catch (e) { showToast('Error', 'error'); }
  };

  return (
    <ResponsiveLayout>
      <div className="p-4 md:p-6 min-h-screen bg-gray-50 space-y-5">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#0A1628] text-white'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-[#0A1628]"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-bold text-[#0A1628]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Price Comparison Sheet Generator
            </h1>
            <p className="text-sm text-gray-500">Generate professional price comparison sheets for procurement decisions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Left Column — Steps 1 & 2 */}
          <div className="space-y-4">

            {/* Step 1 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-[#0A1628] mb-3">
                <span className="bg-[#0A1628] text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs mr-2">1</span>
                Select Materials
              </h3>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={matSearch} onChange={e => onSearchChange(e.target.value)}
                  placeholder="Search materials..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#B8960A] focus:border-[#B8960A] outline-none" />
                {matSearching && <RefreshCw size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
              </div>

              {/* Results Dropdown */}
              {matResults.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-3 divide-y divide-gray-100">
                  {matResults.slice(0, 8).map(m => (
                    <button key={m.id} onClick={() => addMaterial(m)}
                      className="w-full text-left px-3 py-2 hover:bg-[#B8960A]/10 text-sm flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#0A1628] text-xs">{m.materialName || m.name}</p>
                        <p className="text-[10px] text-gray-400">{m.materialCode} • {m.unit}</p>
                      </div>
                      <Plus size={14} className="text-[#B8960A] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Selected chips */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selected.map(m => (
                    <span key={m.id} className="flex items-center gap-1 bg-[#0A1628] text-white rounded-full px-2.5 py-1 text-xs">
                      {(m.materialName || '').slice(0, 20)}{m.materialName?.length > 20 ? '…' : ''}
                      <button onClick={() => removeMaterial(m.id)} className="hover:text-red-300"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-gray-400">{selected.length} material{selected.length !== 1 ? 's' : ''} selected</p>

              {/* From RFQ */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <label className="block text-xs text-gray-500 mb-1">Select from RFQ</label>
                <select value={selectedRfq} onChange={e => loadFromRfq(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#B8960A] outline-none">
                  <option value="">Choose an RFQ...</option>
                  {rfqs.map(r => <option key={r.id} value={r.id}>{r.rfqNumber} — {r.title?.slice(0, 30)}</option>)}
                </select>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="text-sm font-bold text-[#0A1628] mb-3">
                <span className="bg-[#0A1628] text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs mr-2">2</span>
                Configure
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sheet Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Project Name</label>
                  <input value={project} onChange={e => setProject(e.target.value)}
                    placeholder="e.g. Tower A - Phase 2"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none resize-none" />
                </div>
              </div>
            </div>

            <button onClick={generate} disabled={generating || selected.length === 0}
              className="w-full py-3 bg-[#0A1628] text-white rounded-xl text-sm font-bold hover:bg-[#1a2e4a] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {generating ? <><RefreshCw size={14} className="animate-spin" /> Generating...</> : 'Generate Comparison'}
            </button>
          </div>

          {/* Right Column — Step 3 Preview */}
          <div className="md:col-span-2">
            {!matrix && !generating && (
              <div className="bg-white rounded-2xl border border-gray-200 h-64 flex flex-col items-center justify-center text-gray-400">
                <FileText size={40} className="mb-3 opacity-30" />
                <p className="text-sm">Select materials and click Generate to preview the comparison</p>
              </div>
            )}
            {generating && (
              <div className="bg-white rounded-2xl border border-gray-200 h-64 flex flex-col items-center justify-center">
                <RefreshCw className="animate-spin text-[#B8960A] mb-3" size={32} />
                <p className="text-sm text-gray-500">Fetching prices for {selected.length} material{selected.length > 1 ? 's' : ''}...</p>
              </div>
            )}
            {matrix && !generating && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Comparison header */}
                <div className="bg-[#0A1628] text-white p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold">{title}</p>
                    {project && <p className="text-xs text-gray-300 mt-0.5">{project}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={exportToCsv}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B8960A] rounded-lg text-xs font-medium hover:bg-[#a07d08]">
                      <Download size={12} /> Export CSV
                    </button>
                    {selectedRfq && (
                      <button onClick={saveAsRfqComparison}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-500 rounded-lg text-xs hover:bg-white/10">
                        Save as RFQ
                      </button>
                    )}
                  </div>
                </div>

                {/* Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-2 px-3 text-gray-500 font-medium sticky left-0 bg-gray-50">#</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium min-w-[160px]">Material</th>
                        <th className="text-left py-2 px-3 text-gray-500 font-medium">Unit</th>
                        {matrix.vendors.map(v => (
                          <th key={v.id} className="text-left py-2 px-3 text-gray-500 font-medium min-w-[120px]">{v.name}</th>
                        ))}
                        <th className="text-left py-2 px-3 text-emerald-600 font-medium">Best</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.rows.map((row, i) => {
                        const prices = matrix.vendors.map(v => row.prices[v.id]?.unitPrice).filter(Boolean);
                        const best = prices.length > 0 ? Math.min(...prices) : null;
                        return (
                          <tr key={row.materialId} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-400 sticky left-0 bg-white">{i + 1}</td>
                            <td className="py-2 px-3 font-medium text-[#0A1628]">
                              <p>{row.materialName}</p>
                              {row.csiCode && <p className="text-[10px] text-gray-400">{row.csiCode}</p>}
                            </td>
                            <td className="py-2 px-3 text-gray-500">{row.unit || '—'}</td>
                            {matrix.vendors.map(v => {
                              const p = row.prices[v.id];
                              const isLowest = p?.unitPrice != null && p.unitPrice === best;
                              return (
                                <td key={v.id} className={`py-2 px-3 font-medium ${isLowest ? 'text-white font-bold rounded' : 'text-gray-700'}`}
                                  style={isLowest ? { backgroundColor: GOLD } : {}}>
                                  {p?.unitPrice != null ? formatCurrency(p.unitPrice, p.currency) : <span className="text-gray-300">N/A</span>}
                                </td>
                              );
                            })}
                            <td className="py-2 px-3 font-bold text-emerald-600">
                              {best != null ? formatCurrency(best) : '—'}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Total row */}
                      <tr className="bg-[#0A1628] text-white font-bold">
                        <td className="py-2 px-3" colSpan={3}>Total (Sum of All Items)</td>
                        {matrix.vendors.map(v => (
                          <td key={v.id} className="py-2 px-3">{formatCurrency(matrix.totals[v.id] || 0)}</td>
                        ))}
                        <td className="py-2 px-3 text-[#B8960A]">
                          {formatCurrency(Math.min(...matrix.vendors.map(v => matrix.totals[v.id] || Infinity).filter(v => v !== Infinity)) || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {notes && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500"><b>Notes:</b> {notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </ResponsiveLayout>
  );
}
