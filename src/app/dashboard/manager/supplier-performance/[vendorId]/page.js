"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, ExternalLink,
  Download, RefreshCw, Package, FileText, Truck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, LineChart, Line, CartesianGrid
} from 'recharts';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { formatCurrency } from '@/utils/formatters';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const RISK_CONFIG  = { LOW: { cls: 'bg-emerald-100 text-emerald-700', label: 'Low Risk' }, MEDIUM: { cls: 'bg-orange-100 text-orange-700', label: 'Medium Risk' }, HIGH: { cls: 'bg-red-100 text-red-700', label: 'High Risk' } };
const TREND_CONFIG = { IMPROVING: { icon: '↑', cls: 'text-emerald-600', label: 'Improving' }, STABLE: { icon: '→', cls: 'text-gray-500', label: 'Stable' }, DECLINING: { icon: '↓', cls: 'text-red-500', label: 'Declining' } };
const CLASS_COLORS = { A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#ef4444' };

function scoreColor(s) { if (s >= 80) return '#10b981'; if (s >= 60) return '#f59e0b'; return '#ef4444'; }
function scoreBorder(s) { if (s >= 80) return 'border-emerald-400'; if (s >= 60) return 'border-orange-400'; return 'border-red-400'; }
function pct(v) { return typeof v === 'number' ? v.toFixed(1) + '%' : '—'; }

function MetricCard({ label, value, weight, score }) {
  const pctScore = typeof score === 'number' ? score : 0;
  const color = scoreColor(pctScore);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xs text-gray-400">Weight: {weight}%</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>{typeof value === 'number' ? value.toFixed(1) : value}</p>
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pctScore)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function formatMonth(m) {
  if (!m) return '';
  const [y, mo] = m.split('-');
  return new Date(parseInt(y), parseInt(mo) - 1).toLocaleString('default', { month: 'short' });
}

function formatM(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
}

export default function VendorPerformanceDetailPage() {
  const router = useRouter();
  const { vendorId } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/supplier-performance/${vendorId}`, { credentials: 'include' });
        if (r.ok) setData(await r.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [vendorId]);

  if (loading) return (
    <ResponsiveLayout>
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin text-[#B8960A]" size={32} />
      </div>
    </ResponsiveLayout>
  );

  if (!data) return (
    <ResponsiveLayout>
      <div className="p-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#0A1628] mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-gray-500">Vendor not found or performance data unavailable.</p>
      </div>
    </ResponsiveLayout>
  );

  const trend = TREND_CONFIG[data.performanceTrend] || TREND_CONFIG.STABLE;
  const risk  = RISK_CONFIG[data.riskLevel] || RISK_CONFIG.LOW;
  const s     = data.overallScore || 0;

  const deliveryTrendData = (data.monthlyDeliveryTrend || []).map(m => ({
    month: formatMonth(m.month),
    'On-Time': m.onTime,
    Late: m.late,
  }));

  const spendTrendData = (data.monthlySpendTrend || []).map(m => ({
    month: formatMonth(m.month),
    amount: m.amount,
  }));

  const scoreHistoryData = (data.scoreHistory || []).map(h => ({
    date: new Date(h.date).toLocaleDateString('en-SA', { month: 'short', year: '2-digit' }),
    score: h.score,
  }));

  const classAvg = data.classAverages || {};

  const metrics = [
    { label: 'Delivery On-Time', weight: 25, score: data.onTimeDeliveryRate, value: data.onTimeDeliveryRate },
    { label: 'QC Acceptance', weight: 20, score: 100 - data.qcRejectionRate, value: 100 - data.qcRejectionRate },
    { label: 'Doc Compliance', weight: 20, score: data.documentComplianceRate, value: data.documentComplianceRate },
    { label: 'RFQ Response', weight: 15, score: data.responseRate, value: data.responseRate },
    { label: 'Qualification', weight: 20, score: data.qualificationScore, value: data.qualificationScore },
  ];

  const classAverageMetrics = [
    { label: 'Score', mine: s, avg: classAvg.averageScore },
    { label: 'On-Time', mine: data.onTimeDeliveryRate, avg: classAvg.averageOnTimeRate },
    { label: 'Docs', mine: data.documentComplianceRate, avg: classAvg.averageDocCompliance },
    { label: 'Response', mine: data.responseRate, avg: classAvg.averageResponseRate },
    { label: 'Win Rate', mine: data.winRate, avg: classAvg.averageWinRate },
  ];

  const STATUS_MAP = {
    COMPLETED: { cls: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
    DELIVERED: { cls: 'bg-blue-100 text-blue-700', label: 'Delivered' },
    IN_TRANSIT: { cls: 'bg-yellow-100 text-yellow-700', label: 'In Transit' },
    PENDING: { cls: 'bg-gray-100 text-gray-700', label: 'Pending' },
    CANCELLED: { cls: 'bg-red-100 text-red-700', label: 'Cancelled' },
  };

  return (
    <ResponsiveLayout>
      <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button onClick={() => router.back()} className="mt-1 text-gray-400 hover:text-[#0A1628]">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#0A1628]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {data.vendorName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: CLASS_COLORS[data.vendorClass] || '#6b7280' }}>
                  Class {data.vendorClass}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk.cls}`}>{risk.label}</span>
                <span className={`font-bold text-base ${trend.cls}`} title={data.performanceTrend}>
                  {trend.icon} {trend.label}
                </span>
                <button onClick={() => router.push(`/dashboard/procurement/vendors/${vendorId}`)}
                  className="flex items-center gap-1 text-xs text-[#B8960A] hover:underline">
                  <ExternalLink size={12} /> View Vendor Profile
                </button>
              </div>
            </div>
          </div>
          {/* Score circle */}
          <div className={`w-16 h-16 rounded-full border-4 ${scoreBorder(s)} flex items-center justify-center flex-shrink-0`}>
            <div className="text-center">
              <p className="text-lg font-bold leading-none" style={{ color: scoreColor(s) }}>{s.toFixed(0)}</p>
              <p className="text-[9px] text-gray-400">score</p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Score Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {metrics.map(m => (
              <MetricCard key={m.label} label={m.label} weight={m.weight} score={m.score} value={m.value} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Overall = (Delivery×0.25) + (QC×0.20) + (Docs×0.20) + (RFQ×0.15) + (Qual×0.20)
          </p>
        </div>

        {/* vs Class Average */}
        {classAvg.averageScore != null && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-3">vs Class {data.vendorClass} Average</h3>
            <div className="flex flex-wrap gap-4">
              {classAverageMetrics.map(m => {
                const diff = (m.mine || 0) - (m.avg || 0);
                const above = diff >= 0;
                return (
                  <div key={m.label} className="text-center">
                    <p className="text-xs text-gray-400">{m.label}</p>
                    <p className={`text-sm font-bold ${above ? 'text-emerald-600' : 'text-red-500'}`}>
                      {above ? '+' : ''}{diff.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Delivery Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-[#0A1628] mb-3">Monthly Delivery Trend</h3>
            {deliveryTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={deliveryTrendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="On-Time" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Late"    stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-gray-400 h-40 flex items-center justify-center">No delivery data</p>}
          </div>

          {/* Spend Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-[#0A1628] mb-3">Monthly Spend Trend</h3>
            {spendTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={spendTrendData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B8960A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#B8960A" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={formatM} />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Area dataKey="amount" stroke="#B8960A" fill="url(#spendGrad)" strokeWidth={2} dot={false} name="Spend" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-xs text-gray-400 h-40 flex items-center justify-center">No spend data</p>}
          </div>

          {/* Score History */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-[#0A1628] mb-3">Score History</h3>
            {scoreHistoryData.length > 1 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={scoreHistoryData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <Tooltip />
                  <Line dataKey="score" stroke="#B8960A" strokeWidth={2} dot={{ fill: '#B8960A', r: 4 }} name="Score" />
                </LineChart>
              </ResponsiveContainer>
            ) : scoreHistoryData.length === 1 ? (
              <div className="h-40 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold" style={{ color: scoreColor(scoreHistoryData[0].score) }}>{scoreHistoryData[0].score}</p>
                <p className="text-xs text-gray-400 mt-1">{scoreHistoryData[0].date}</p>
                <p className="text-xs text-gray-400">1 evaluation on record</p>
              </div>
            ) : <p className="text-xs text-gray-400 h-40 flex items-center justify-center">No evaluation history</p>}
          </div>
        </div>

        {/* Projects Breakdown */}
        {data.projectsInvolved?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Projects Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Project', 'POs', 'Total Value', 'Deliveries', 'Delivery Rate'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.projectsInvolved.map((p, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-[#0A1628]">{p.projectName}</td>
                      <td className="py-2 px-3 text-gray-600">{p.posCount}</td>
                      <td className="py-2 px-3 text-gray-700 font-medium">{formatCurrency(p.totalValue)}</td>
                      <td className="py-2 px-3 text-gray-600">{p.deliveries}</td>
                      <td className="py-2 px-3">
                        <span className={p.deliveryRate >= 85 ? 'text-emerald-600' : p.deliveryRate >= 70 ? 'text-orange-500' : 'text-red-500'}>
                          {p.deliveryRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Deliveries */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-[#0A1628] mb-3 flex items-center gap-1">
              <Truck size={13} /> Recent Deliveries
            </h3>
            {(data.recentDeliveries || []).length === 0 ? (
              <p className="text-xs text-gray-400">No deliveries</p>
            ) : (data.recentDeliveries || []).map((d, i) => {
              const sc = STATUS_MAP[d.status] || STATUS_MAP.PENDING;
              return (
                <div key={i} className="py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-600">{d.deliveryNumber}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${sc.cls}`}>{sc.label}</span>
                  </div>
                  {d.deliveryDate && <p className="text-[10px] text-gray-400">{new Date(d.deliveryDate).toLocaleDateString()}</p>}
                  {d.delayDays > 0 && <p className="text-[10px] text-red-400">{d.delayDays}d late</p>}
                </div>
              );
            })}
          </div>

          {/* RFQs */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-[#0A1628] mb-3 flex items-center gap-1">
              <FileText size={13} /> Recent RFQs
            </h3>
            {(data.recentRFQs || []).length === 0 ? (
              <p className="text-xs text-gray-400">No RFQ submissions</p>
            ) : (data.recentRFQs || []).map((r, i) => (
              <div key={i} className="py-1.5 border-b border-gray-100 last:border-0">
                <p className="text-xs font-mono text-gray-600">{r.rfq?.rfqNumber || `RFQ #${r.rfqId}`}</p>
                <p className="text-[10px] text-gray-500">{r.rfq?.projectName}</p>
                {r.status && <span className={`text-[10px] font-medium ${r.status === 'AWARDED' || r.status === 'SELECTED' ? 'text-emerald-600' : 'text-gray-500'}`}>{r.status}</span>}
                {(r.totalAmount || r.totalValue) && <p className="text-[10px] text-[#B8960A] font-medium">{formatCurrency(r.totalAmount || r.totalValue)}</p>}
              </div>
            ))}
          </div>

          {/* IPCs */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-[#0A1628] mb-3 flex items-center gap-1">
              <Package size={13} /> Recent IPCs
            </h3>
            {(data.recentIPCs || []).length === 0 ? (
              <p className="text-xs text-gray-400">No IPCs</p>
            ) : (data.recentIPCs || []).map((ipc, i) => (
              <div key={i} className="py-1.5 border-b border-gray-100 last:border-0">
                <p className="text-xs font-mono text-gray-600">{ipc.ipcNumber}</p>
                <p className="text-[10px] text-gray-500">{ipc.status}</p>
                <p className="text-[10px] text-[#B8960A] font-medium">{formatCurrency(ipc.amount)}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ResponsiveLayout>
  );
}
