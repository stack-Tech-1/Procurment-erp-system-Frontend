"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, TrendingDown, Minus, Trophy, AlertTriangle, Users,
  Search, Filter, Download, X, Eye, ChevronRight, Crown, Star,
  BarChart2, RefreshCw, GitCompare
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { formatCurrency } from '@/utils/formatters';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const CLASS_COLORS = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444' };
const RISK_CONFIG  = {
  LOW:    { cls: 'bg-emerald-100 text-emerald-700', label: 'Low' },
  MEDIUM: { cls: 'bg-orange-100 text-orange-700',  label: 'Medium' },
  HIGH:   { cls: 'bg-red-100 text-red-700',         label: 'High' },
};
const TREND_CONFIG = {
  IMPROVING: { icon: '↑', cls: 'text-emerald-600' },
  STABLE:    { icon: '→', cls: 'text-gray-500'    },
  DECLINING: { icon: '↓', cls: 'text-red-500'     },
};

function scoreColor(s) {
  if (s >= 80) return 'text-emerald-600';
  if (s >= 60) return 'text-orange-500';
  return 'text-red-500';
}
function scoreBarColor(s) {
  if (s >= 80) return 'bg-emerald-500';
  if (s >= 60) return 'bg-orange-400';
  return 'bg-red-500';
}
function pctColor(v) {
  if (v >= 85) return 'text-emerald-600';
  if (v >= 70) return 'text-orange-500';
  return 'text-red-500';
}

const ClassBadge = ({ cls }) => (
  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: CLASS_COLORS[cls] || '#6b7280' }}>
    {cls || 'D'}
  </span>
);

const RiskBadge = ({ level }) => {
  const c = RISK_CONFIG[level] || RISK_CONFIG.LOW;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>;
};

const RADAR_COLORS = ['#B8960A', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function SupplierPerformancePage() {
  const router = useRouter();
  const [summary, setSummary]     = useState(null);
  const [vendors, setVendors]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [search, setSearch]           = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterRisk, setFilterRisk]   = useState('');
  const [sortBy, setSortBy]           = useState('overallScore');
  const [page, setPage]               = useState(1);

  const [compareList, setCompareList]   = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareData, setCompareData]   = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const r = await fetch(`${API}/api/supplier-performance/summary`, { credentials: 'include' });
      if (r.ok) setSummary(await r.json());
    } catch (e) { console.error(e); }
    finally { setSummaryLoading(false); }
  }, []);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sortBy, page, limit: 50 });
      if (filterClass) params.set('class', filterClass);
      if (filterRisk) {
        // filter client-side after fetch since API doesn't have riskLevel filter
      }
      const r = await fetch(`${API}/api/supplier-performance?${params}`, { credentials: 'include' });
      if (r.ok) {
        const d = await r.json();
        let data = d.data || [];
        if (filterRisk)  data = data.filter(v => v.riskLevel === filterRisk);
        if (search) data = data.filter(v => v.vendorName?.toLowerCase().includes(search.toLowerCase()));
        setVendors(data);
        setTotal(d.total || data.length);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterClass, filterRisk, sortBy, page, search]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const toggleCompare = (v) => {
    setCompareList(prev => {
      if (prev.find(c => c.vendorId === v.vendorId)) return prev.filter(c => c.vendorId !== v.vendorId);
      if (prev.length >= 5) return prev;
      return [...prev, v];
    });
  };

  const openCompare = async () => {
    if (compareList.length < 2) return;
    setCompareLoading(true);
    setShowCompareModal(true);
    try {
      const ids = compareList.map(v => v.vendorId).join(',');
      const r = await fetch(`${API}/api/supplier-performance/comparison?vendorIds=${ids}`, { credentials: 'include' });
      if (r.ok) setCompareData(await r.json());
    } catch (e) { console.error(e); }
    finally { setCompareLoading(false); }
  };

  // Build score distribution data
  const scoreDistData = [
    { range: '0–20',  count: vendors.filter(v => v.overallScore <= 20).length,  fill: '#ef4444' },
    { range: '21–40', count: vendors.filter(v => v.overallScore > 20 && v.overallScore <= 40).length, fill: '#f97316' },
    { range: '41–60', count: vendors.filter(v => v.overallScore > 40 && v.overallScore <= 60).length, fill: '#f59e0b' },
    { range: '61–80', count: vendors.filter(v => v.overallScore > 60 && v.overallScore <= 80).length, fill: '#B8960A' },
    { range: '81–100',count: vendors.filter(v => v.overallScore > 80).length,   fill: '#10b981' },
  ];

  const classDistData = summary
    ? Object.entries(summary.classDistribution || {}).map(([cls, count]) => ({ name: `Class ${cls}`, value: count, color: CLASS_COLORS[cls] || '#6b7280' }))
    : [];

  const radarData = compareData.length > 0
    ? ['Delivery', 'QC', 'Docs', 'Response', 'Score'].map(key => {
        const row = { metric: key };
        compareData.forEach((v, i) => {
          const val = key === 'Delivery' ? v.onTimeDeliveryRate
            : key === 'QC'       ? (100 - v.qcRejectionRate)
            : key === 'Docs'     ? v.documentComplianceRate
            : key === 'Response' ? v.responseRate
            : v.overallScore;
          row[`v${i}`] = val;
        });
        return row;
      })
    : [];

  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <ResponsiveLayout>
      <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Supplier Performance Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Comprehensive vendor performance analytics and rankings</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => compareList.length >= 2 ? openCompare() : null}
              disabled={compareList.length < 2}
              className="flex items-center gap-2 px-3 py-2 bg-[#B8960A] text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-[#a07d08] transition-colors"
            >
              <GitCompare size={16} />
              Compare{compareList.length > 0 ? ` (${compareList.length})` : ''}
            </button>
            <a href={`${API}/api/supplier-performance/export`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Download size={16} />
              Export
            </a>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse h-24" />
            ))
          ) : summary ? (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Avg Overall Score</p>
                <p className={`text-3xl font-bold mt-1 ${scoreColor(summary.averageOverallScore)}`}>
                  {summary.averageOverallScore?.toFixed(1)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">out of 100</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 flex items-center gap-1"><Trophy size={12} className="text-yellow-500" /> Top Performer</p>
                <p className="text-sm font-bold text-[#0A1628] mt-1 leading-tight">{summary.topPerformer?.vendorName || '—'}</p>
                <p className="text-xs text-[#B8960A] font-medium mt-0.5">{summary.topPerformer?.overallScore?.toFixed(1)} score</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 flex items-center gap-1"><AlertTriangle size={12} className="text-red-500" /> High Risk</p>
                <p className={`text-3xl font-bold mt-1 ${summary.highRiskCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {summary.highRiskCount}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">vendors</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp size={12} className="text-emerald-500" /> Improving</p>
                <p className="text-3xl font-bold mt-1 text-emerald-600">{summary.improvingCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">this period</p>
              </div>
            </>
          ) : null}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Class Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Vendor Class Distribution</h3>
            {classDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={classDistData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                    {classDistData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend formatter={(val) => <span className="text-xs">{val}</span>} />
                  <Tooltip formatter={(v) => `${v} vendors`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
            )}
          </div>

          {/* Score Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreDistData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(v) => `${v} vendors`} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Leaders */}
        {summary?.categoryLeaders?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Category Leaders</h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {summary.categoryLeaders.map((leader, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 min-w-[180px] flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 truncate max-w-[120px]">{leader.category}</span>
                    {i === 0 && <Crown size={14} className="text-yellow-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm font-bold text-[#0A1628] truncate">{leader.vendorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ClassBadge cls={leader.vendorClass} />
                    <span className="text-xs text-gray-500">{leader.onTimeRate}% on-time</span>
                  </div>
                  <p className={`text-lg font-bold mt-1 ${scoreColor(leader.score)}`}>{leader.score}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search vendor name..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#B8960A] focus:border-[#B8960A] outline-none"
            />
          </div>
          <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none">
            <option value="">All Classes</option>
            {['A', 'B', 'C', 'D'].map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <select value={filterRisk} onChange={e => { setFilterRisk(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none">
            <option value="">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-[#B8960A] outline-none">
            <option value="overallScore">Sort: Overall Score</option>
            <option value="deliveryRate">Sort: Delivery Rate</option>
            <option value="winRate">Sort: Win Rate</option>
            <option value="awardedValue">Sort: Awarded Value</option>
          </select>
        </div>

        {/* Rankings Table — Desktop */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0A1628] text-white">
                  <th className="text-left py-3 px-3 font-medium text-xs w-12">Rank</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Vendor</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Score</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Delivery</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">QC Acc.</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Docs</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Response</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Awarded</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Win %</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Risk</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Trend</th>
                  <th className="text-left py-3 px-3 font-medium text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 12 }).map((_, j) => (
                        <td key={j} className="py-3 px-3">
                          <div className="h-3 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-gray-400">No vendors found</td>
                  </tr>
                ) : vendors.map((v, idx) => {
                  const rank = (page - 1) * 50 + idx + 1;
                  const isTop3 = rank <= 3;
                  const isHighRisk = v.riskLevel === 'HIGH';
                  const trend = TREND_CONFIG[v.performanceTrend] || TREND_CONFIG.STABLE;
                  const isInCompare = compareList.some(c => c.vendorId === v.vendorId);
                  return (
                    <tr key={v.vendorId}
                      className={`border-b border-gray-100 hover:bg-[#B8960A]/5 ${isTop3 ? 'border-l-4 border-l-yellow-400' : ''} ${isHighRisk ? 'border-l-4 border-l-red-400' : ''}`}>
                      <td className="py-3 px-3 text-center font-bold">
                        {rank <= 3 ? MEDALS[rank - 1] : <span className="text-gray-500 text-xs">{rank}</span>}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <ClassBadge cls={v.vendorClass} />
                          <span className="font-medium text-[#0A1628] text-xs">{v.vendorName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreBarColor(v.overallScore)}`} style={{ width: `${v.overallScore}%` }} />
                          </div>
                          <span className={`font-bold text-xs ${scoreColor(v.overallScore)}`}>{v.overallScore}</span>
                        </div>
                      </td>
                      <td className={`py-3 px-3 font-medium text-xs ${pctColor(v.onTimeDeliveryRate)}`}>{v.onTimeDeliveryRate}%</td>
                      <td className={`py-3 px-3 font-medium text-xs ${pctColor(100 - v.qcRejectionRate)}`}>{(100 - v.qcRejectionRate).toFixed(1)}%</td>
                      <td className={`py-3 px-3 font-medium text-xs ${pctColor(v.documentComplianceRate)}`}>{v.documentComplianceRate}%</td>
                      <td className={`py-3 px-3 font-medium text-xs ${pctColor(v.responseRate)}`}>{v.responseRate}%</td>
                      <td className="py-3 px-3 text-xs text-gray-700">{formatCurrency(v.totalAwardedValue)}</td>
                      <td className={`py-3 px-3 font-medium text-xs ${pctColor(v.winRate)}`}>{v.winRate}%</td>
                      <td className="py-3 px-3"><RiskBadge level={v.riskLevel} /></td>
                      <td className={`py-3 px-3 font-bold text-lg ${trend.cls}`} title={v.performanceTrend}>{trend.icon}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          <button onClick={() => router.push(`/dashboard/manager/supplier-performance/${v.vendorId}`)}
                            className="px-2 py-1 bg-[#0A1628] text-white rounded text-xs hover:bg-[#1a2e4a] transition-colors">
                            View
                          </button>
                          <button
                            onClick={() => toggleCompare(v)}
                            className={`px-2 py-1 rounded text-xs transition-colors ${isInCompare ? 'bg-[#B8960A] text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                            {isInCompare ? '✓' : '+'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse h-28" />)
          ) : vendors.map((v, idx) => {
            const rank = (page - 1) * 50 + idx + 1;
            const trend = TREND_CONFIG[v.performanceTrend] || TREND_CONFIG.STABLE;
            return (
              <div key={v.vendorId}
                className={`bg-white rounded-xl border border-gray-200 p-4 ${v.riskLevel === 'HIGH' ? 'border-l-4 border-l-red-400' : ''} ${rank <= 3 ? 'border-l-4 border-l-yellow-400' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{rank <= 3 ? MEDALS[rank - 1] : `#${rank}`}</span>
                    <ClassBadge cls={v.vendorClass} />
                    <span className="font-semibold text-[#0A1628] text-sm">{v.vendorName}</span>
                  </div>
                  <RiskBadge level={v.riskLevel} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${scoreBarColor(v.overallScore)}`} style={{ width: `${v.overallScore}%` }} />
                  </div>
                  <span className={`font-bold text-sm ${scoreColor(v.overallScore)}`}>{v.overallScore}</span>
                  <span className={`font-bold text-sm ${trend.cls}`}>{trend.icon}</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 mb-2">
                  <span>Delivery: <b className={pctColor(v.onTimeDeliveryRate)}>{v.onTimeDeliveryRate}%</b></span>
                  <span>QC: <b className={pctColor(100 - v.qcRejectionRate)}>{(100 - v.qcRejectionRate).toFixed(1)}%</b></span>
                </div>
                <button onClick={() => router.push(`/dashboard/manager/supplier-performance/${v.vendorId}`)}
                  className="w-full py-1.5 bg-[#0A1628] text-white rounded-lg text-xs font-medium">
                  View Performance Report
                </button>
              </div>
            );
          })}
        </div>

        {/* Compare floating bar */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0A1628] text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 z-40">
            <span className="text-sm">{compareList.length} vendor{compareList.length > 1 ? 's' : ''} selected</span>
            <button onClick={openCompare} disabled={compareList.length < 2}
              className="px-4 py-1.5 bg-[#B8960A] rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-[#a07d08]">
              Compare Now
            </button>
            <button onClick={() => setCompareList([])} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Comparison Modal */}
        {showCompareModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-5xl my-8">
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-[#0A1628]">Vendor Comparison</h2>
                <button onClick={() => setShowCompareModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              {compareLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-[#B8960A]" size={32} />
                </div>
              ) : (
                <div className="p-5 space-y-6">
                  {/* Radar Chart */}
                  {radarData.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Dimensions</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          {compareData.map((v, i) => (
                            <Radar key={i} name={v.vendorName} dataKey={`v${i}`} stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.15} />
                          ))}
                          <Legend />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Metrics table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left py-2 px-3 font-semibold text-gray-600">Metric</th>
                          {compareData.map((v, i) => (
                            <th key={i} className="text-left py-2 px-3 font-semibold text-gray-600">{v.vendorName}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Overall Score', key: 'overallScore', fmt: v => v.toFixed(1) },
                          { label: 'Delivery On-Time', key: 'onTimeDeliveryRate', fmt: v => `${v}%` },
                          { label: 'QC Acceptance', key: 'qcRejectionRate', fmt: v => `${(100 - v).toFixed(1)}%` },
                          { label: 'Doc Compliance', key: 'documentComplianceRate', fmt: v => `${v}%` },
                          { label: 'RFQ Response', key: 'responseRate', fmt: v => `${v}%` },
                          { label: 'Win Rate', key: 'winRate', fmt: v => `${v}%` },
                          { label: 'Awarded Value', key: 'totalAwardedValue', fmt: v => formatCurrency(v) },
                        ].map(({ label, key, fmt }) => {
                          const vals = compareData.map(v => key === 'qcRejectionRate' ? (100 - (v[key] || 0)) : (v[key] || 0));
                          const max = Math.max(...vals);
                          const min = Math.min(...vals);
                          return (
                            <tr key={key} className="border-b border-gray-100">
                              <td className="py-2 px-3 font-medium text-gray-700">{label}</td>
                              {compareData.map((v, i) => {
                                const val = key === 'qcRejectionRate' ? 100 - (v[key] || 0) : (v[key] || 0);
                                const isBest = val === max;
                                const isWorst = val === min && min !== max;
                                return (
                                  <td key={i} className={`py-2 px-3 font-medium ${isBest ? 'text-emerald-700 bg-emerald-50' : isWorst ? 'text-red-600 bg-red-50' : ''}`}>
                                    {fmt(v[key] || 0)}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </ResponsiveLayout>
  );
}
