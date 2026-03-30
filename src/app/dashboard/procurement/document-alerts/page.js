"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const URGENCY_STYLES = {
  CRITICAL: { pill: 'bg-red-100 text-red-700', badge: 'bg-red-500', dayText: 'text-red-600 font-bold' },
  WARNING: { pill: 'bg-orange-100 text-orange-700', badge: 'bg-orange-500', dayText: 'text-orange-600 font-bold' },
  NOTICE: { pill: 'bg-yellow-100 text-yellow-700', badge: 'bg-yellow-500', dayText: 'text-yellow-600 font-semibold' },
};

const VENDOR_STATUS_COLORS = {
  APPROVED: 'bg-green-100 text-green-700',
  CONDITIONAL_APPROVED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
};

export default function DocumentAlertsPage() {
  const router = useRouter();
  const [data, setData] = useState({ summary: { critical: 0, warning: 0, notice: 0 }, alerts: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { router.replace('/login'); return; }
    fetch(`${API_URL}/api/vendors/document-alerts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (r.status === 401) { router.replace('/login'); throw new Error('unauth'); } return r.json(); })
      .then(setData)
      .catch(err => { if (err.message !== 'unauth') console.error(err); })
      .finally(() => setLoading(false));
  }, [router]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const sendReminder = async (vendorId) => {
    const token = localStorage.getItem('authToken');
    try {
      await fetch(`${API_URL}/api/notifications/alerts/document-expiry`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId })
      });
      showToast('Reminder sent successfully');
    } catch {
      showToast('Failed to send reminder');
    }
  };

  const exportToast = () => showToast('Export to Excel coming soon');

  const filtered = filter === 'ALL' ? data.alerts
    : data.alerts.filter(a => a.urgency === filter);

  return (
    <ResponsiveLayout>
      <div className="p-6">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-[#0A1628] text-white px-5 py-3 rounded-xl shadow-lg text-sm">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Document Expiry Alerts</h1>
            <p className="text-gray-500 text-sm mt-1">Vendor documents expiring in the next 30 days</p>
          </div>
          <button
            onClick={exportToast}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            Export to Excel
          </button>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="font-bold text-red-700 text-lg">{data.summary.critical}</span>
            <span className="text-red-600 text-sm">Critical (≤7d)</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="font-bold text-orange-700 text-lg">{data.summary.warning}</span>
            <span className="text-orange-600 text-sm">Warning (8–15d)</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="font-bold text-yellow-700 text-lg">{data.summary.notice}</span>
            <span className="text-yellow-600 text-sm">Notice (16–30d)</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
          {[['ALL', 'All'], ['CRITICAL', 'Critical'], ['WARNING', 'Warning'], ['NOTICE', 'Notice']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === val ? 'bg-white text-[#0A1628] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading alerts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500 font-medium">No document alerts in this category</p>
            <p className="text-gray-400 text-sm mt-1">All vendor documents are up to date.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Vendor Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Class</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Document Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Expiry Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Days Left</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((alert, i) => {
                  const styles = URGENCY_STYLES[alert.urgency] || URGENCY_STYLES.NOTICE;
                  const vendorStatus = alert.vendor?.status || 'APPROVED';
                  return (
                    <tr key={alert.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {alert.vendor?.companyLegalName || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {alert.vendor?.vendorClass ? `Class ${alert.vendor.vendorClass}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {(alert.docType || '').replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {alert.expiryDate ? new Date(alert.expiryDate).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${styles.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${styles.badge}`} />
                          {alert.daysLeft}d
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${VENDOR_STATUS_COLORS[vendorStatus] || 'bg-gray-100 text-gray-600'}`}>
                          {vendorStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/dashboard/procurement/vendors/${alert.vendorId}`}
                            className="text-xs px-3 py-1.5 border border-[#0A1628] text-[#0A1628] rounded-lg hover:bg-[#0A1628] hover:text-white transition-colors"
                          >
                            View Vendor
                          </a>
                          <button
                            onClick={() => sendReminder(alert.vendorId)}
                            className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Send Reminder
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
