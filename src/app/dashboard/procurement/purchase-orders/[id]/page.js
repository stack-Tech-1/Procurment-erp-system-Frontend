"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Building, DollarSign, Calendar,
  CheckCircle, Clock, Truck, Package, User,
  AlertTriangle, XCircle, Send, ExternalLink,
  RefreshCw, WifiOff, ChevronRight
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  DRAFT:               { label: 'Draft',               color: 'bg-gray-100 text-gray-700',       dot: 'bg-gray-400' },
  PENDING_APPROVAL:    { label: 'Pending Approval',    color: 'bg-yellow-100 text-yellow-800',   dot: 'bg-yellow-500' },
  APPROVED:            { label: 'Approved',            color: 'bg-blue-100 text-blue-800',       dot: 'bg-blue-500' },
  ISSUED:              { label: 'Issued',              color: 'bg-green-100 text-green-700',     dot: 'bg-green-500' },
  PARTIALLY_DELIVERED: { label: 'Partially Delivered', color: 'bg-orange-100 text-orange-800',  dot: 'bg-orange-500' },
  DELIVERED:           { label: 'Delivered',           color: 'bg-teal-100 text-teal-800',      dot: 'bg-teal-500' },
  CLOSED:              { label: 'Closed',              color: 'bg-emerald-900 text-emerald-100', dot: 'bg-emerald-700' },
  CANCELLED:           { label: 'Cancelled',           color: 'bg-red-100 text-red-800',        dot: 'bg-red-500' },
};

const WORKFLOW_STAGES = [
  'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ISSUED',
  'PARTIALLY_DELIVERED', 'DELIVERED', 'CLOSED',
];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Confirmation Modal ───────────────────────────────────────────────────────

const ConfirmModal = ({ title, message, confirmLabel, confirmStyle, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className={`px-4 py-2 text-sm text-white rounded-lg font-medium ${confirmStyle}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [po, setPO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [modal, setModal] = useState(null); // { title, message, confirmLabel, confirmStyle, newStatus }

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  const fetchPO = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/purchase-orders/${id}`, { headers: authHeaders() });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 404) { setError('Purchase order not found.'); return; }
      if (!res.ok) throw new Error('API error');
      setPO(await res.json());
    } catch {
      setError('Could not load purchase order. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPO();
    // Decode role from JWT
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.roleId);
      }
    } catch {
      setUserRole(null);
    }
  }, [fetchPO]);

  const performStatusUpdate = async (newStatus) => {
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch(`${API_BASE}/api/purchase-orders/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) {
        const err = await res.json();
        setActionError(err.error || 'Action failed. Please try again.');
        return;
      }
      await fetchPO();
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const triggerAction = (newStatus, title, message, confirmLabel, confirmStyle) => {
    if (['APPROVED', 'ISSUED', 'CANCELLED', 'CLOSED'].includes(newStatus)) {
      setModal({ title, message, confirmLabel, confirmStyle, newStatus });
    } else {
      performStatusUpdate(newStatus);
    }
  };

  // ── Action bar logic ───────────────────────────────────────────────────────

  const getActionButtons = () => {
    if (!po || !userRole) return null;
    const status = po.status;
    const isManager = userRole <= 2; // Executive (1) or Manager (2)
    const isOfficer = userRole <= 3;

    const buttons = [];

    if (status === 'DRAFT' && isOfficer) {
      buttons.push(
        <button key="submit" onClick={() => triggerAction('PENDING_APPROVAL', 'Submit for Approval', `Submit PO ${po.poNumber} for management approval?`, 'Submit', 'bg-yellow-600 hover:bg-yellow-700')}
          disabled={actionLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm text-white rounded-lg font-medium disabled:opacity-50"
          style={{ backgroundColor: '#B8960A' }}>
          <Send className="w-4 h-4" /> Submit for Approval
        </button>
      );
    }

    if (status === 'PENDING_APPROVAL' && isManager) {
      buttons.push(
        <button key="approve" onClick={() => triggerAction('APPROVED', 'Approve Purchase Order', `Approve PO ${po.poNumber}? This will set you as the approving authority.`, 'Approve', 'bg-green-600 hover:bg-green-700')}
          disabled={actionLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50">
          <CheckCircle className="w-4 h-4" /> Approve PO
        </button>,
        <button key="reject" onClick={() => performStatusUpdate('DRAFT')}
          disabled={actionLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium disabled:opacity-50">
          <XCircle className="w-4 h-4" /> Reject (Return to Draft)
        </button>
      );
    }

    if (status === 'APPROVED' && isManager) {
      buttons.push(
        <button key="issue" onClick={() => triggerAction('ISSUED', 'Issue PO to Vendor', `Issue PO ${po.poNumber} to ${po.vendor?.companyLegalName}? An email notification will be sent.`, 'Issue PO', 'bg-green-600 hover:bg-green-700')}
          disabled={actionLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm text-white rounded-lg font-medium disabled:opacity-50"
          style={{ backgroundColor: '#0A1628' }}>
          <Send className="w-4 h-4" /> Issue PO to Vendor
        </button>
      );
    }

    if (status === 'ISSUED' && isOfficer) {
      buttons.push(
        <button key="partial" onClick={() => performStatusUpdate('PARTIALLY_DELIVERED')}
          disabled={actionLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-lg font-medium disabled:opacity-50">
          <Truck className="w-4 h-4" /> Mark Partially Delivered
        </button>
      );
    }

    if (status === 'PARTIALLY_DELIVERED' && isOfficer) {
      buttons.push(
        <button key="delivered" onClick={() => performStatusUpdate('DELIVERED')}
          disabled={actionLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-medium disabled:opacity-50">
          <Package className="w-4 h-4" /> Mark Fully Delivered
        </button>
      );
    }

    if (status === 'DELIVERED' && isManager) {
      buttons.push(
        <button key="close" onClick={() => triggerAction('CLOSED', 'Close Purchase Order', `Close PO ${po.poNumber}? This action cannot be undone.`, 'Close PO', 'bg-emerald-700 hover:bg-emerald-800')}
          disabled={actionLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm text-white rounded-lg font-medium disabled:opacity-50"
          style={{ backgroundColor: '#166534' }}>
          <CheckCircle className="w-4 h-4" /> Close PO
        </button>
      );
    }

    // Cancel button — secondary, shown for all non-final statuses for managers
    if (!['CLOSED', 'CANCELLED'].includes(status) && isManager) {
      buttons.push(
        <button key="cancel" onClick={() => triggerAction('CANCELLED', 'Cancel Purchase Order', `Cancel PO ${po.poNumber}? This action cannot be undone.`, 'Cancel PO', 'bg-red-600 hover:bg-red-700')}
          disabled={actionLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-sm text-red-600 border border-red-300 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50">
          <XCircle className="w-4 h-4" /> Cancel PO
        </button>
      );
    }

    return buttons.length > 0 ? buttons : null;
  };

  const actionButtons = getActionButtons();

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex flex-col items-center justify-center h-80">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-4" style={{ borderColor: '#B8960A' }} />
          <p className="text-gray-400 text-sm">Loading purchase order…</p>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="max-w-xl mx-auto mt-16 p-6 text-center">
          <WifiOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchPO} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: '#B8960A' }}>
            <RefreshCw className="w-4 h-4 inline mr-1" /> Retry
          </button>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!po) return null;

  const stageIndex = WORKFLOW_STAGES.indexOf(po.status);

  return (
    <ResponsiveLayout>
      <div className="max-w-6xl mx-auto w-full p-4 lg:p-6 pb-32">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4 flex items-center gap-1">
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/dashboard/procurement/purchase-orders" className="hover:text-gray-700">Purchase Orders</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-medium">{po.poNumber}</span>
        </nav>

        {/* Back + Refresh */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => router.push('/dashboard/procurement/purchase-orders')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> Back to list
          </button>
          <button onClick={fetchPO} disabled={loading}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Purchase Order</p>
              <h1 className="text-3xl font-bold mt-0.5" style={{ color: '#B8960A' }}>{po.poNumber}</h1>
              <p className="text-gray-700 font-medium mt-1">{po.projectName}</p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-2">
              <StatusBadge status={po.status} />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{po.vendor?.companyLegalName || '—'}</span>
                {po.vendor?.vendorClass && (
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Class {po.vendor.vendorClass}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-lg font-bold text-gray-900">
                <DollarSign className="w-5 h-5 text-gray-400" />
                {po.totalValue?.toLocaleString()} {po.currency}
              </div>
            </div>
          </div>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {actionError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5 gap-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'documents', label: 'Linked Documents' },
            { id: 'activity', label: 'Activity Log' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id ? 'border-yellow-600 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === id ? { borderColor: '#B8960A', color: '#B8960A' } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Overview ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* PO Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> PO Details
                </h3>
                <dl className="space-y-3 text-sm">
                  {[
                    { label: 'Required Date', value: po.requiredDate ? new Date(po.requiredDate).toLocaleDateString() : '—', icon: Calendar },
                    { label: 'Delivery Location', value: po.deliveryLocation || '—', icon: Truck },
                    { label: 'Payment Terms', value: po.paymentTerms || '—', icon: DollarSign },
                    { label: 'Warranty Period', value: po.warrantyPeriod || '—', icon: Package },
                    { label: 'Currency', value: po.currency, icon: DollarSign },
                    { label: 'Issued By', value: po.issuedBy?.name || '—', icon: User },
                    { label: 'Approved By', value: po.approvedBy?.name || '—', icon: CheckCircle },
                    { label: 'Approved At', value: po.approvedAt ? new Date(po.approvedAt).toLocaleString() : '—', icon: Calendar },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{label}</span>
                      <span className="font-medium text-gray-800 text-right max-w-[55%]">{value}</span>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Status Timeline */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" /> Status Timeline
                </h3>
                <div className="space-y-2">
                  {WORKFLOW_STAGES.map((stage, i) => {
                    const cfg = STATUS_CONFIG[stage];
                    const done = stageIndex >= i && po.status !== 'CANCELLED';
                    const current = po.status === stage;
                    const cancelled = po.status === 'CANCELLED';
                    return (
                      <div key={stage} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${current ? 'bg-yellow-50 border border-yellow-200' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          cancelled && i > 0 ? 'bg-red-100' :
                          done ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {done && !cancelled ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <span className={`w-2 h-2 rounded-full ${cancelled && i > 0 ? 'bg-red-300' : done ? 'bg-green-400' : 'bg-gray-300'}`} />
                          )}
                        </div>
                        <span className={`text-sm ${current ? 'font-semibold' : 'text-gray-600'}`} style={current ? { color: '#B8960A' } : {}}>
                          {cfg?.label}
                        </span>
                        {current && <span className="ml-auto text-xs text-gray-400">Current</span>}
                      </div>
                    );
                  })}
                  {po.status === 'CANCELLED' && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm font-semibold text-red-700">Cancelled</span>
                      <span className="ml-auto text-xs text-red-400">Current</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {po.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                <p className="font-semibold mb-1">Internal Notes</p>
                <p>{po.notes}</p>
              </div>
            )}

            {/* Items Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Line Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['#', 'Description', 'CSI Code', 'Qty', 'Unit', 'Unit Price', 'Total'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(po.items || []).map((item, i) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-gray-500">{item.csiCode || '—'}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                        <td className="px-4 py-3">{item.unitPrice?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold">{item.totalPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan={6} className="px-4 py-3 text-right font-semibold text-gray-700">Total Value</td>
                      <td className="px-4 py-3 font-bold text-base" style={{ color: '#B8960A' }}>
                        {po.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {po.currency}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Linked Documents ─────────────────────────────────────── */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {/* Linked RFQ */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Linked RFQ</h3>
              {po.rfq ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <p className="font-semibold text-blue-900">{po.rfq.rfqNumber}</p>
                    <p className="text-xs text-blue-600">{po.rfq.projectName}</p>
                  </div>
                  <Link
                    href={`/dashboard/procurement/rfq/${po.rfq.id}`}
                    className="flex items-center gap-1 text-xs text-blue-700 font-medium hover:underline"
                  >
                    View RFQ <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No RFQ linked to this purchase order.</p>
              )}
            </div>

            {/* Linked Purchase Request */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Linked Purchase Request</h3>
              {po.purchaseRequestId ? (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="font-semibold text-purple-900">PR #{po.purchaseRequestId}</p>
                  <Link
                    href={`/dashboard/procurement/purchase-requests/${po.purchaseRequestId}`}
                    className="flex items-center gap-1 text-xs text-purple-700 font-medium hover:underline"
                  >
                    View PR <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No purchase request linked.</p>
              )}
            </div>

            {/* Linked IPCs */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Linked IPCs</h3>
              {po.ipcs && po.ipcs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {po.ipcs.map(ipc => (
                    <div key={ipc.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{ipc.ipcNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Value: {ipc.currentValue?.toLocaleString()} SAR &nbsp;·&nbsp;
                          Net Payable: {ipc.netPayable?.toLocaleString()} SAR
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={ipc.status} />
                        <Link
                          href={`/dashboard/procurement/ipcs/${ipc.id}`}
                          className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No IPCs linked to this purchase order.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Activity Log ────────────────────────────────────────── */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-5">Activity Log</h3>
            <div className="space-y-4">
              {/* Created entry */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="w-px flex-1 bg-gray-200 mt-1" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-gray-900">PO Created</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    By {po.issuedBy?.name || '—'} · {new Date(po.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Status set to <strong>Draft</strong></p>
                </div>
              </div>

              {/* Approval entry */}
              {po.approvedAt && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-gray-900">PO Approved</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      By {po.approvedBy?.name || '—'} · {new Date(po.approvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Current status */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
                  <Clock className="w-4 h-4" style={{ color: '#B8960A' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Current Status</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(po.updatedAt).toLocaleString()}</p>
                  <div className="mt-1"><StatusBadge status={po.status} /></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Action Bar ───────────────────────────────────────────── */}
      {actionButtons && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-800">{po.poNumber}</span>
              <span className="mx-2">·</span>
              <StatusBadge status={po.status} />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {actionLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
                  Processing…
                </div>
              )}
              {actionButtons}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ──────────────────────────────────────────── */}
      {modal && (
        <ConfirmModal
          title={modal.title}
          message={modal.message}
          confirmLabel={modal.confirmLabel}
          confirmStyle={modal.confirmStyle}
          onConfirm={() => performStatusUpdate(modal.newStatus)}
          onCancel={() => setModal(null)}
        />
      )}
    </ResponsiveLayout>
  );
}
