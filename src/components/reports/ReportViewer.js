"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Download, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Column definitions per report type
const REPORT_COLUMNS = {
  'vendor-master-list': [
    { key: 'companyName', label: 'Company Name' },
    { key: 'crNumber', label: 'CR Number' },
    { key: 'vendorClass', label: 'Class' },
    { key: 'qualificationScore', label: 'Score', render: v => v != null ? `${v}%` : '—' },
    { key: 'approvalStatus', label: 'Status' },
    { key: 'complianceLevel', label: 'Compliance' },
    { key: 'categories', label: 'Categories', render: v => Array.isArray(v) ? v.join(', ') : (v || '—') },
  ],
  'procurement-spend': [
    { key: 'projectName', label: 'Project' },
    { key: 'poNumber', label: 'PO Number' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'totalAmount', label: 'Amount (SAR)', render: v => v != null ? Number(v).toLocaleString('en-SA', { minimumFractionDigits: 2 }) : '—' },
    { key: 'status', label: 'Status' },
    { key: 'issueDate', label: 'Date', render: v => v ? new Date(v).toLocaleDateString('en-SA') : '—' },
  ],
  'vendor-performance': [
    { key: 'companyName', label: 'Vendor' },
    { key: 'vendorClass', label: 'Class' },
    { key: 'qualificationScore', label: 'Score', render: v => v != null ? `${v}%` : '—' },
    { key: 'rfqCount', label: 'RFQs' },
    { key: 'poCount', label: 'POs' },
    { key: 'avgLeadTimeDays', label: 'Avg Lead Time', render: v => v != null ? `${v} days` : '—' },
    { key: 'complianceLevel', label: 'Compliance' },
  ],
  'rfq-analytics': [
    { key: 'rfqNumber', label: 'RFQ#' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'vendorCount', label: 'Vendors' },
    { key: 'awardedVendor', label: 'Awarded Vendor', render: v => v || '—' },
    { key: 'cycleTimeDays', label: 'Cycle Time', render: v => v != null ? `${v} days` : '—' },
  ],
  'document-compliance': [
    { key: 'companyName', label: 'Vendor' },
    { key: 'complianceLevel', label: 'Level' },
    { key: 'missingDocs', label: 'Missing Docs', render: v => Array.isArray(v) ? v.join(', ') || 'None' : (v || 'None') },
    { key: 'qualificationScore', label: 'Score', render: v => v != null ? `${v}%` : '—' },
  ],
  'overdue-tasks': [
    { key: 'title', label: 'Task' },
    { key: 'assigneeName', label: 'Assignee' },
    { key: 'dueDate', label: 'Due Date', render: v => v ? new Date(v).toLocaleDateString('en-SA') : '—' },
    { key: 'priority', label: 'Priority' },
    { key: 'daysOverdue', label: 'Days Overdue', render: v => v != null ? <span className="text-red-600 font-medium">{v}</span> : '—' },
  ],
};

const STATUS_COLORS = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
  AWARDED: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-blue-100 text-blue-700',
  FULL: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  NON_COMPLIANT: 'bg-red-100 text-red-700',
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-red-100 text-red-700',
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const Badge = ({ value }) => {
  const cls = STATUS_COLORS[value] || 'bg-gray-100 text-gray-600';
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{value}</span>;
};

const isBadgeField = (key) => ['approvalStatus', 'status', 'complianceLevel', 'vendorClass', 'priority'].includes(key);

const REPORT_META = {
  'vendor-master-list': { title: 'Vendor Master List', hasExcel: true, hasPDF: false },
  'procurement-spend': { title: 'Procurement Spend', hasExcel: true, hasPDF: true },
  'vendor-performance': { title: 'Vendor Performance', hasExcel: true, hasPDF: false },
  'rfq-analytics': { title: 'RFQ Analytics', hasExcel: true, hasPDF: false },
  'document-compliance': { title: 'Document Compliance', hasExcel: true, hasPDF: false },
  'overdue-tasks': { title: 'Overdue Tasks', hasExcel: true, hasPDF: false },
  'weekly-summary': { title: 'Weekly Executive Summary', hasExcel: false, hasPDF: true },
};

export default function ReportViewer({ reportType, onBack }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const meta = REPORT_META[reportType] || { title: reportType, hasExcel: false, hasPDF: false };
  const columns = REPORT_COLUMNS[reportType] || [];

  const getToken = () => localStorage.getItem('authToken');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/new-reports/${reportType}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch report');
      setRows(data.rows || []);
      setSummary(data.summary || null);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [reportType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async (format) => {
    const setLoading = format === 'excel' ? setExportingExcel : setExportingPDF;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/new-reports/${reportType}/export/${format}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      a.href = url;
      a.download = `${reportType}-${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export error:', e);
    }
    setLoading(false);
  };

  const renderCellValue = (col, row) => {
    const raw = row[col.key];
    if (col.render) return col.render(raw, row);
    if (isBadgeField(col.key) && raw) return <Badge value={raw} />;
    return raw != null ? String(raw) : '—';
  };

  // Weekly summary: render as KPI stat grid instead of table
  if (reportType === 'weekly-summary') {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#0A1628' }}>{meta.title}</h2>
            {summary && <p className="text-xs text-gray-500 mt-0.5">Week of {summary.weekStart ? new Date(summary.weekStart).toLocaleDateString('en-SA') : 'current week'}</p>}
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
            </button>
            {meta.hasPDF && (
              <button onClick={() => handleExport('pdf')} disabled={exportingPDF} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                {exportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export PDF
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-24" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rows.map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{kpi.label || kpi.name || `KPI ${i + 1}`}</p>
                <p className="text-2xl font-bold" style={{ color: '#0A1628' }}>{kpi.value ?? '—'}</p>
                {kpi.unit && <p className="text-xs text-gray-400 mt-0.5">{kpi.unit}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#0A1628' }}>{meta.title}</h2>
          {summary && (
            <p className="text-xs text-gray-500 mt-0.5">
              {summary.total != null ? `${summary.total} records` : ''}
              {summary.totalAmount != null ? ` · SAR ${Number(summary.totalAmount).toLocaleString('en-SA', { minimumFractionDigits: 2 })}` : ''}
            </p>
          )}
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
          {meta.hasExcel && (
            <button onClick={() => handleExport('excel')} disabled={exportingExcel} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              {exportingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Excel
            </button>
          )}
          {meta.hasPDF && (
            <button onClick={() => handleExport('pdf')} disabled={exportingPDF} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              {exportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PDF
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-100 border-b border-gray-200" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 border-b border-gray-50 px-4 py-3 flex gap-4">
                {columns.map((_, j) => <div key={j} className="h-4 bg-gray-100 rounded flex-1" />)}
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-red-500">{error}</div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">No data found for this report.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  {columns.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left whitespace-nowrap">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {renderCellValue(col, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {summary && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              {summary.total != null && <span>{summary.total} total records</span>}
              {summary.totalAmount != null && <span className="ml-4">Total: SAR {Number(summary.totalAmount).toLocaleString('en-SA', { minimumFractionDigits: 2 })}</span>}
              {summary.fullCompliance != null && <span className="ml-4">Full compliance: {summary.fullCompliance}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
