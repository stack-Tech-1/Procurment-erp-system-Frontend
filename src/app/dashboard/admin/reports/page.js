"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, DollarSign, BarChart3, FileText, Shield, Clock,
  TrendingUp, Download, Eye, Plus, Trash2, X, RefreshCw,
  Calendar, Mail, ChevronDown, Loader2, ExternalLink, Send
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import ReportViewer from '@/components/reports/ReportViewer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const REPORT_TYPES = [
  {
    key: 'vendor-master-list',
    dbKey: 'VENDOR_MASTER_LIST',
    title: 'Vendor Master List',
    description: 'All registered vendors with compliance status, class, and document completeness.',
    icon: Users,
    color: '#0A1628',
    hasExcel: true,
    hasPDF: false,
    minRole: 3,
  },
  {
    key: 'procurement-spend',
    dbKey: 'PROCUREMENT_SPEND',
    title: 'Procurement Spend',
    description: 'Purchase order spend breakdown by project, vendor, and time period.',
    icon: DollarSign,
    color: '#B8960A',
    hasExcel: true,
    hasPDF: true,
    minRole: 3,
  },
  {
    key: 'vendor-performance',
    dbKey: 'VENDOR_PERFORMANCE',
    title: 'Vendor Performance',
    description: 'RFQ participation, PO counts, lead times, and qualification scores per vendor.',
    icon: BarChart3,
    color: '#0A1628',
    hasExcel: true,
    hasPDF: false,
    minRole: 3,
  },
  {
    key: 'rfq-analytics',
    dbKey: 'RFQ_ANALYTICS',
    title: 'RFQ Analytics',
    description: 'RFQ status distribution, cycle times, and awarded vendor breakdown.',
    icon: FileText,
    color: '#B8960A',
    hasExcel: true,
    hasPDF: false,
    minRole: 3,
  },
  {
    key: 'document-compliance',
    dbKey: 'DOCUMENT_COMPLIANCE',
    title: 'Document Compliance',
    description: 'Vendor document completeness: FULL, PARTIAL, and NON_COMPLIANT vendors.',
    icon: Shield,
    color: '#0A1628',
    hasExcel: true,
    hasPDF: false,
    minRole: 3,
  },
  {
    key: 'overdue-tasks',
    dbKey: 'OVERDUE_TASKS',
    title: 'Overdue Tasks',
    description: 'All past-due procurement tasks grouped by assignee.',
    icon: Clock,
    color: '#ef4444',
    hasExcel: true,
    hasPDF: false,
    minRole: 2,
  },
  {
    key: 'weekly-summary',
    dbKey: 'WEEKLY_SUMMARY',
    title: 'Weekly Executive Summary',
    description: 'KPI snapshot: new vendors, POs issued, tasks completed, pending approvals.',
    icon: TrendingUp,
    color: '#B8960A',
    hasExcel: false,
    hasPDF: true,
    hasPreview: true,
    minRole: 2,
  },
];

const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ReportsHubPage() {
  const { t } = useTranslation();
  const [activeReport, setActiveReport] = useState(null);
  const [scheduledList, setScheduledList] = useState([]);
  const [scheduledLoading, setScheduledLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendTestLoading, setSendTestLoading] = useState(false);
  const [sendTestMsg, setSendTestMsg] = useState('');
  const [exportingMap, setExportingMap] = useState({});
  const [scheduleForm, setScheduleForm] = useState({
    reportType: 'VENDOR_MASTER_LIST',
    frequency: 'WEEKLY',
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipientEmails: '',
  });
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const getToken = () => localStorage.getItem('authToken');

  const fetchScheduled = useCallback(async () => {
    setScheduledLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/new-reports/scheduled`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setScheduledList(data.scheduled);
    } catch (e) {
      console.error('Failed to fetch scheduled reports', e);
    }
    setScheduledLoading(false);
  }, []);

  useEffect(() => { fetchScheduled(); }, [fetchScheduled]);

  const handleExport = async (reportKey, format) => {
    const mapKey = `${reportKey}-${format}`;
    setExportingMap(prev => ({ ...prev, [mapKey]: true }));
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/new-reports/${reportKey}/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      a.href = url;
      a.download = `${reportKey}-${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export error:', e);
    }
    setExportingMap(prev => ({ ...prev, [mapKey]: false }));
  };

  const handleDeleteScheduled = async (id) => {
    try {
      await fetch(`${API_BASE}/api/new-reports/scheduled/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setScheduledList(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduleError('');
    const emails = scheduleForm.recipientEmails.split(',').map(s => s.trim()).filter(Boolean);
    if (!emails.length) { setScheduleError('Enter at least one recipient email.'); return; }
    setScheduleSubmitting(true);
    try {
      const body = {
        reportType: scheduleForm.reportType,
        frequency: scheduleForm.frequency,
        recipientEmails: emails,
        ...(scheduleForm.frequency === 'WEEKLY' ? { dayOfWeek: scheduleForm.dayOfWeek } : {}),
        ...(scheduleForm.frequency === 'MONTHLY' ? { dayOfMonth: scheduleForm.dayOfMonth } : {}),
      };
      const res = await fetch(`${API_BASE}/api/new-reports/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to schedule');
      setShowScheduleModal(false);
      setScheduleForm({ reportType: 'VENDOR_MASTER_LIST', frequency: 'WEEKLY', dayOfWeek: 1, dayOfMonth: 1, recipientEmails: '' });
      fetchScheduled();
    } catch (e) {
      setScheduleError(e.message);
    }
    setScheduleSubmitting(false);
  };

  const handlePreview = async () => {
    setShowPreviewModal(true);
    setPreviewLoading(true);
    setPreviewHtml('');
    try {
      const res = await fetch(`${API_BASE}/api/new-reports/weekly-summary/preview-html`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const html = await res.text();
      setPreviewHtml(html);
    } catch (e) {
      setPreviewHtml('<p style="padding:2rem;color:red">Failed to load preview.</p>');
    }
    setPreviewLoading(false);
  };

  const handleSendTest = async () => {
    setSendTestLoading(true);
    setSendTestMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/new-reports/weekly-summary/send-test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setSendTestMsg(data.message || 'Test email sent!');
    } catch (e) {
      setSendTestMsg('Failed to send test email.');
    }
    setSendTestLoading(false);
  };

  if (activeReport) {
    return (
      <ResponsiveLayout>
        <ReportViewer
          reportType={activeReport}
          onBack={() => setActiveReport(null)}
        />
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#0A1628' }}>Reports Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Generate, export, and schedule procurement reports.</p>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            const excelKey = `${report.key}-excel`;
            const pdfKey = `${report.key}-pdf`;
            return (
              <div key={report.key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: report.color + '15' }}>
                      <Icon className="w-5 h-5" style={{ color: report.color }} />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">{report.title}</h3>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{report.description}</p>
                </div>
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveReport(report.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                    style={{ backgroundColor: report.color }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                  {report.hasExcel && (
                    <button
                      onClick={() => handleExport(report.key, 'excel')}
                      disabled={exportingMap[excelKey]}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      {exportingMap[excelKey] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      Excel
                    </button>
                  )}
                  {report.hasPDF && report.key !== 'weekly-summary' && (
                    <button
                      onClick={() => handleExport(report.key, 'pdf')}
                      disabled={exportingMap[pdfKey]}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      {exportingMap[pdfKey] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      PDF
                    </button>
                  )}
                  {report.key === 'weekly-summary' && (
                    <>
                      <button
                        onClick={() => handleExport('weekly-summary', 'pdf')}
                        disabled={exportingMap[pdfKey]}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        {exportingMap[pdfKey] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        PDF
                      </button>
                      <button
                        onClick={handlePreview}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Preview
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Summary Email Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-8">
          <h2 className="font-semibold text-gray-800 mb-1">Weekly Summary Email</h2>
          <p className="text-xs text-gray-500 mb-4">Preview the email template or send a test to your account.</p>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Email Template
            </button>
            <button
              onClick={handleSendTest}
              disabled={sendTestLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg"
              style={{ backgroundColor: '#0A1628' }}
            >
              {sendTestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Test Email
            </button>
            {sendTestMsg && (
              <span className="text-xs text-green-600 font-medium">{sendTestMsg}</span>
            )}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-800">Scheduled Reports</h2>
              <p className="text-xs text-gray-500 mt-0.5">Auto-emailed on your chosen schedule.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchScheduled}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg font-medium"
                style={{ backgroundColor: '#B8960A' }}
              >
                <Plus className="w-4 h-4" />
                Schedule Report
              </button>
            </div>
          </div>

          {scheduledLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading scheduled reports...</div>
          ) : scheduledList.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No scheduled reports yet. Click "Schedule Report" to add one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Report Type</th>
                    <th className="px-4 py-3 text-left">Frequency</th>
                    <th className="px-4 py-3 text-left">Next Run</th>
                    <th className="px-4 py-3 text-left">Recipients</th>
                    <th className="px-4 py-3 text-left">Created By</th>
                    <th className="px-4 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scheduledList.map(sr => (
                    <tr key={sr.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{sr.reportType.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-gray-600">{sr.frequency}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {sr.nextRunAt ? new Date(sr.nextRunAt).toLocaleDateString('en-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{sr.recipientEmails?.join(', ')}</td>
                      <td className="px-4 py-3 text-gray-500">{sr.createdBy?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteScheduled(sr.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800">Schedule a Report</h3>
                <p className="text-xs text-gray-500 mt-0.5">Set up automatic email delivery</p>
              </div>
              <button onClick={() => { setShowScheduleModal(false); setScheduleError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  value={scheduleForm.reportType}
                  onChange={e => setScheduleForm(f => ({ ...f, reportType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {REPORT_TYPES.map(r => (
                    <option key={r.dbKey} value={r.dbKey}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                <div className="flex gap-2">
                  {FREQUENCIES.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setScheduleForm(prev => ({ ...prev, frequency: f }))}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${scheduleForm.frequency === f ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      style={scheduleForm.frequency === f ? { backgroundColor: '#0A1628' } : {}}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {scheduleForm.frequency === 'WEEKLY' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Day of Week</label>
                  <select
                    value={scheduleForm.dayOfWeek}
                    onChange={e => setScheduleForm(f => ({ ...f, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              )}
              {scheduleForm.frequency === 'MONTHLY' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={scheduleForm.dayOfMonth}
                    onChange={e => setScheduleForm(f => ({ ...f, dayOfMonth: parseInt(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Recipient Emails</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="manager@kun.sa, ceo@kun.sa"
                    value={scheduleForm.recipientEmails}
                    onChange={e => setScheduleForm(f => ({ ...f, recipientEmails: e.target.value }))}
                    className="flex-1 text-sm focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Separate multiple emails with commas</p>
              </div>
              {scheduleError && <p className="text-xs text-red-500">{scheduleError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowScheduleModal(false); setScheduleError(''); }}
                  className="flex-1 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleSubmitting}
                  className="flex-1 py-2 text-sm text-white rounded-lg font-medium flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#B8960A' }}
                >
                  {scheduleSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Weekly Summary Email Preview</h3>
              <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {previewLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading preview...
                </div>
              ) : (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0"
                  title="Weekly Summary Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
}
