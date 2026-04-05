"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Truck, Package, Paperclip, Clock, CheckCircle,
  XCircle, AlertTriangle, Upload, ChevronRight, RefreshCw,
  User, Calendar, MapPin, FileText, Download
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const STATUS_CONFIG = {
  PENDING:              { label: 'Pending',              cls: 'bg-gray-100 text-gray-700' },
  IN_TRANSIT:           { label: 'In Transit',           cls: 'bg-blue-100 text-blue-700' },
  DELIVERED:            { label: 'Delivered',            cls: 'bg-green-100 text-green-700' },
  PARTIALLY_DELIVERED:  { label: 'Partial Delivery',     cls: 'bg-orange-100 text-orange-700' },
  QC_IN_PROGRESS:       { label: 'QC In Progress',       cls: 'bg-yellow-100 text-yellow-700' },
  QC_ACCEPTED:          { label: 'QC Accepted',          cls: 'bg-green-100 text-green-700' },
  QC_REJECTED:          { label: 'QC Rejected',          cls: 'bg-red-100 text-red-700' },
  COMPLETED:            { label: 'Completed',            cls: 'bg-emerald-100 text-emerald-700' },
  CANCELLED:            { label: 'Cancelled',            cls: 'bg-gray-100 text-gray-500' },
};

const QC_CONFIG = {
  PENDING_INSPECTION: { label: 'Pending Inspection', cls: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS:        { label: 'In Progress',         cls: 'bg-yellow-100 text-yellow-700' },
  ACCEPTED:           { label: 'Accepted',            cls: 'bg-green-100 text-green-700' },
  REJECTED:           { label: 'Rejected',            cls: 'bg-red-100 text-red-700' },
};

const Badge = ({ value, config }) => {
  const cfg = config[value] || { label: value, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
};

const ACTIVITY_ICONS = {
  CREATED: <Package size={14} />, IN_TRANSIT: <Truck size={14} />, DELIVERED: <CheckCircle size={14} />,
  QC_IN_PROGRESS: <Clock size={14} />, QC_ACCEPTED: <CheckCircle size={14} />,
  QC_REJECTED: <XCircle size={14} />, COMPLETED: <CheckCircle size={14} />, CANCELLED: <XCircle size={14} />,
};

export default function DeliveryDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState(null); // { type, ... }
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };
  let userRole = 1;
  try { userRole = JSON.parse(atob(token?.split('.')[1] || 'e30=')).roleId || 1; } catch (_) {}

  const OFFICER_PLUS = [1, 2, 3].includes(userRole);
  const MANAGER_PLUS = [1, 2].includes(userRole);

  const fetchDelivery = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/deliveries/${id}`, { headers });
      if (r.ok) setDelivery(await r.json());
    } catch (_) {}
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchDelivery(); }, [fetchDelivery]);

  const transition = async (newStatus, extra = {}) => {
    setActionLoading(true);
    try {
      const r = await fetch(`${API}/api/deliveries/${id}/status`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes, rejectionReason, ...extra }),
      });
      if (r.ok) {
        setDelivery(await r.json());
        setModal(null);
        setNotes('');
        setRejectionReason('');
        fetchDelivery();
      } else {
        const e = await r.json();
        alert(e.error || 'Action failed');
      }
    } catch (_) { alert('Network error'); }
    setActionLoading(false);
  };

  const updateItemQC = async (itemId, qcStatus, qcNotes) => {
    try {
      await fetch(`${API}/api/deliveries/${id}/items/${itemId}/qc`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ qcStatus, qcNotes }),
      });
      fetchDelivery();
    } catch (_) {}
  };

  const handleUpload = async () => {
    if (!uploadFiles.length) return;
    setUploading(true);
    const form = new FormData();
    Array.from(uploadFiles).forEach(f => form.append('files', f));
    try {
      await fetch(`${API}/api/deliveries/${id}/attachments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      setUploadFiles([]);
      fetchDelivery();
    } catch (_) {}
    setUploading(false);
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="animate-spin h-8 w-8 text-[#C6A35D]" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!delivery) {
    return (
      <ResponsiveLayout>
        <div className="p-6 text-center text-gray-500">Delivery not found.</div>
      </ResponsiveLayout>
    );
  }

  const isOverdue = delivery.requiredDate && new Date(delivery.requiredDate) < new Date() &&
    !['COMPLETED', 'CANCELLED'].includes(delivery.status);

  return (
    <ResponsiveLayout>
      <div className="p-6 pb-28 space-y-6 bg-gray-50 min-h-screen">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-[#0A1628] font-mono">{delivery.deliveryNumber}</h1>
              <Badge value={delivery.status} config={STATUS_CONFIG} />
              <Badge value={delivery.qcStatus} config={QC_CONFIG} />
              {isOverdue && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                  <AlertTriangle size={10} /> Overdue
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{delivery.projectName}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: <FileText size={14} /> },
            { id: 'items', label: `Items (${delivery.items?.length || 0})`, icon: <Package size={14} /> },
            { id: 'attachments', label: `Attachments (${delivery.attachments?.length || 0})`, icon: <Paperclip size={14} /> },
            { id: 'activity', label: 'Activity', icon: <Clock size={14} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-[#C6A35D] text-[#C6A35D]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-[#0A1628]">Delivery Details</h3>
              <div className="space-y-3 text-sm">
                <Row label="Linked PO">
                  {delivery.purchaseOrder ? (
                    <button
                      onClick={() => router.push(`/dashboard/manager/purchase-orders/${delivery.purchaseOrder.id}`)}
                      className="text-[#C6A35D] hover:underline font-mono"
                    >
                      {delivery.purchaseOrder.poNumber}
                    </button>
                  ) : '—'}
                </Row>
                <Row label="Vendor">
                  <span className="text-gray-700">{delivery.vendor?.companyName || delivery.vendor?.companyLegalName || '—'}</span>
                </Row>
                <Row label="Project"><span className="text-gray-700">{delivery.projectName}</span></Row>
                <Row label="Required Date">
                  <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}>
                    {delivery.requiredDate ? new Date(delivery.requiredDate).toLocaleDateString() : '—'}
                    {isOverdue && ' ⚠ Overdue'}
                  </span>
                </Row>
                <Row label="Actual Delivery">
                  <span className="text-gray-700">
                    {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString() : 'Not yet delivered'}
                  </span>
                </Row>
                <Row label="Delay Days">
                  {delivery.delayDays > 0 ? (
                    <span className="text-red-600 font-semibold">{delivery.delayDays} days late</span>
                  ) : (
                    <span className="text-green-600">On time</span>
                  )}
                </Row>
                <Row label="Location">
                  <span className="text-gray-700">{delivery.deliveryLocation || '—'}</span>
                </Row>
                <Row label="Received By">
                  <span className="text-gray-700">{delivery.receivedBy?.name || '—'}</span>
                </Row>
                {delivery.isPartial && (
                  <Row label="Partial Delivery">
                    <span className="text-orange-600 font-medium">Yes</span>
                  </Row>
                )}
                {delivery.notes && (
                  <Row label="Notes"><span className="text-gray-600 italic">{delivery.notes}</span></Row>
                )}
              </div>
            </div>

            {/* QC Details */}
            <div className={`rounded-xl border shadow-sm p-5 space-y-4 ${
              delivery.qcStatus === 'ACCEPTED' ? 'bg-green-50 border-green-200' :
              delivery.qcStatus === 'REJECTED' ? 'bg-red-50 border-red-200' :
              delivery.qcStatus === 'IN_PROGRESS' ? 'bg-yellow-50 border-yellow-200' :
              'bg-white border-gray-200'
            }`}>
              <h3 className="font-semibold text-[#0A1628]">QC Inspection</h3>
              <div className="space-y-3 text-sm">
                <Row label="QC Status"><Badge value={delivery.qcStatus} config={QC_CONFIG} /></Row>
                {delivery.qcInspectedBy && (
                  <Row label="Inspector"><span className="text-gray-700">{delivery.qcInspectedBy.name}</span></Row>
                )}
                {delivery.qcInspectedAt && (
                  <Row label="Inspected At">
                    <span className="text-gray-700">{new Date(delivery.qcInspectedAt).toLocaleString()}</span>
                  </Row>
                )}
                {delivery.qcNotes && (
                  <Row label="QC Notes"><span className="text-gray-600 italic">{delivery.qcNotes}</span></Row>
                )}
                {delivery.rejectionReason && (
                  <Row label="Rejection Reason">
                    <span className="text-red-600 font-medium">{delivery.rejectionReason}</span>
                  </Row>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {tab === 'items' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {delivery.items?.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No items recorded</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Description</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">Ordered</th>
                      <th className="text-right py-3 px-4 text-gray-500 font-medium">Delivered</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">Unit</th>
                      <th className="text-left py-3 px-4 text-gray-500 font-medium">QC Status</th>
                      {delivery.status === 'QC_IN_PROGRESS' && OFFICER_PLUS && (
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {delivery.items.map(item => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-700">{item.description}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{item.quantityOrdered}</td>
                        <td className="py-3 px-4 text-right text-gray-700 font-medium">{item.quantityDelivered}</td>
                        <td className="py-3 px-4 text-gray-500">{item.unit}</td>
                        <td className="py-3 px-4">
                          <Badge value={item.qcStatus === 'ACCEPTED' ? 'ACCEPTED' : item.qcStatus === 'REJECTED' ? 'REJECTED' : 'PENDING_INSPECTION'} config={QC_CONFIG} />
                          {item.qcNotes && <p className="text-xs text-gray-400 mt-0.5">{item.qcNotes}</p>}
                        </td>
                        {delivery.status === 'QC_IN_PROGRESS' && OFFICER_PLUS && (
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateItemQC(item.id, 'ACCEPTED', '')}
                                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                              >Accept</button>
                              <button
                                onClick={() => {
                                  const n = prompt('Rejection notes:');
                                  if (n !== null) updateItemQC(item.id, 'REJECTED', n);
                                }}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                              >Reject</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Attachments Tab */}
        {tab === 'attachments' && (
          <div className="space-y-4">
            {/* Upload */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-[#0A1628] mb-3">Upload Files</h3>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  multiple
                  onChange={e => setUploadFiles(e.target.files)}
                  className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-[#C6A35D]/10 file:text-[#C6A35D] hover:file:bg-[#C6A35D]/20"
                />
                <button
                  onClick={handleUpload}
                  disabled={!uploadFiles.length || uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm disabled:opacity-50"
                >
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>

            {/* File Grid */}
            {delivery.attachments?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {delivery.attachments.map(att => (
                  <div key={att.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3">
                    <Paperclip size={20} className="text-[#C6A35D] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{att.fileName}</p>
                      <p className="text-xs text-gray-400">{att.uploadedBy?.name} · {new Date(att.createdAt).toLocaleDateString()}</p>
                    </div>
                    <a href={`${API}/${att.fileUrl}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100">
                      <Download size={14} className="text-gray-500" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-400 text-sm">
                No attachments yet
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {tab === 'activity' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            {delivery.activityLog?.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">No activity recorded</div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
                <div className="space-y-5">
                  {delivery.activityLog?.map(log => (
                    <div key={log.id} className="relative pl-10 flex gap-3">
                      <div className="absolute left-2.5 w-3 h-3 rounded-full bg-[#C6A35D] flex items-center justify-center text-white mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 text-sm">{log.action.replace(/_/g, ' ')}</p>
                          <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">{log.performedBy?.name}</p>
                        {log.notes && <p className="text-xs text-gray-600 mt-0.5 italic">{log.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fixed Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-40 flex items-center gap-3 justify-end flex-wrap">
          {delivery.status === 'PENDING' && OFFICER_PLUS && (
            <ActionBtn color="blue" onClick={() => setModal({ type: 'transit' })}>
              <Truck size={15} /> Mark In Transit
            </ActionBtn>
          )}
          {delivery.status === 'IN_TRANSIT' && OFFICER_PLUS && (
            <>
              <ActionBtn color="green" onClick={() => setModal({ type: 'delivered' })}>
                <CheckCircle size={15} /> Mark Delivered
              </ActionBtn>
              <ActionBtn color="orange" onClick={() => setModal({ type: 'partial' })}>
                <Package size={15} /> Mark Partial
              </ActionBtn>
            </>
          )}
          {['DELIVERED', 'PARTIALLY_DELIVERED'].includes(delivery.status) && OFFICER_PLUS && (
            <ActionBtn color="gold" onClick={() => transition('QC_IN_PROGRESS')}>
              <Clock size={15} /> Start QC Inspection
            </ActionBtn>
          )}
          {delivery.status === 'QC_IN_PROGRESS' && OFFICER_PLUS && (
            <>
              <ActionBtn color="green" onClick={() => setModal({ type: 'qcAccept' })}>
                <CheckCircle size={15} /> Accept Delivery
              </ActionBtn>
              <ActionBtn color="red" onClick={() => setModal({ type: 'qcReject' })}>
                <XCircle size={15} /> Reject Delivery
              </ActionBtn>
            </>
          )}
          {delivery.status === 'QC_ACCEPTED' && MANAGER_PLUS && (
            <ActionBtn color="navy" onClick={() => transition('COMPLETED')}>
              <CheckCircle size={15} /> Complete &amp; Close
            </ActionBtn>
          )}
          {!['COMPLETED', 'CANCELLED'].includes(delivery.status) && MANAGER_PLUS && (
            <ActionBtn color="outline-red" onClick={() => setModal({ type: 'cancel' })}>
              <XCircle size={15} /> Cancel
            </ActionBtn>
          )}
        </div>

        {/* Modals */}
        {modal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="font-bold text-[#0A1628] text-lg">
                {modal.type === 'transit' && 'Mark In Transit'}
                {modal.type === 'delivered' && 'Mark as Delivered'}
                {modal.type === 'partial' && 'Mark as Partial Delivery'}
                {modal.type === 'qcAccept' && 'Accept Delivery (QC Passed)'}
                {modal.type === 'qcReject' && 'Reject Delivery (QC Failed)'}
                {modal.type === 'cancel' && 'Cancel Delivery'}
              </h3>

              {modal.type === 'qcReject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                  <textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                    rows={3}
                    placeholder="Describe the quality issues..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes {modal.type === 'cancel' ? <span className="text-red-500">*</span> : '(optional)'}</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
                  rows={2}
                  placeholder={modal.type === 'cancel' ? 'Reason for cancellation...' : 'Add notes...'}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => { setModal(null); setNotes(''); setRejectionReason(''); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  disabled={actionLoading || (modal.type === 'qcReject' && !rejectionReason) || (modal.type === 'cancel' && !notes)}
                  onClick={() => {
                    const m = modal.type;
                    if (m === 'transit') transition('IN_TRANSIT');
                    else if (m === 'delivered') transition('DELIVERED');
                    else if (m === 'partial') transition('PARTIALLY_DELIVERED');
                    else if (m === 'qcAccept') transition('QC_ACCEPTED');
                    else if (m === 'qcReject') transition('QC_REJECTED');
                    else if (m === 'cancel') transition('CANCELLED');
                  }}
                  className={`px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors ${
                    modal.type === 'qcReject' || modal.type === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0A1628] hover:bg-[#0A1628]/90'
                  }`}
                >
                  {actionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

function ActionBtn({ color, onClick, children, disabled }) {
  const classes = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
    orange: 'bg-orange-500 hover:bg-orange-600 text-white',
    gold: 'bg-[#C6A35D] hover:bg-[#b8924a] text-white',
    navy: 'bg-[#0A1628] hover:bg-[#0A1628]/90 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white',
    'outline-red': 'border border-red-300 text-red-600 hover:bg-red-50',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${classes[color] || classes.navy}`}
    >
      {children}
    </button>
  );
}
