"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Paperclip, Activity, CheckCircle, XCircle,
  RotateCcw, Clock, Upload, Download, Trash2, AlertTriangle, User,
  Building2, Calendar, Hash, Tag, ChevronRight
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const STATUS_CONFIG = {
  DRAFT:             { label: 'Draft',             cls: 'badge badge-gray',   next: ['SUBMITTED'] },
  SUBMITTED:         { label: 'Submitted',          cls: 'badge badge-blue',  next: ['UNDER_REVIEW'] },
  UNDER_REVIEW:      { label: 'Under Review',       cls: 'badge badge-gold',  next: ['APPROVED', 'REJECTED', 'RESUBMIT_REQUIRED'] },
  APPROVED:          { label: 'Approved',           cls: 'badge badge-green', next: [] },
  REJECTED:          { label: 'Rejected',           cls: 'badge badge-red',   next: [] },
  RESUBMIT_REQUIRED: { label: 'Resubmit Required',  cls: 'badge badge-orange', next: ['SUBMITTED'] },
  CANCELLED:         { label: 'Cancelled',          cls: 'badge badge-gray',  next: [] },
};

const ACTION_LABELS = {
  SUBMITTED: 'Mark as Submitted',
  UNDER_REVIEW: 'Start Review',
  APPROVED: 'Approve',
  REJECTED: 'Reject',
  RESUBMIT_REQUIRED: 'Request Resubmission',
};

const ACTION_STYLES = {
  APPROVED:          'btn btn-primary',
  REJECTED:          'btn btn-danger',
  RESUBMIT_REQUIRED: 'btn btn-secondary',
  SUBMITTED:         'btn btn-secondary',
  UNDER_REVIEW:      'btn btn-secondary',
};

export default function SubmittalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submittal, setSubmittal] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('overview');
  const [actionLoading, setActionLoading] = useState('');
  const [comment, setComment]     = useState('');
  const [uploading, setUploading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetch_ = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/submittals/${id}`, { headers });
      if (!res.ok) throw new Error('Not found');
      setSubmittal(await res.json());
    } catch {
      router.push('/dashboard/manager/material-submittals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(newStatus);
    try {
      const res = await fetch(`${API_BASE}/api/submittals/${id}/status`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comment }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // resubmission creates a new record
      if (data.newId) {
        router.push(`/dashboard/manager/material-submittals/${data.newId}`);
      } else {
        setSubmittal(data.submittal);
        setComment('');
      }
    } catch {
      alert('Failed to update status.');
    } finally {
      setActionLoading('');
    }
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      await fetch(`${API_BASE}/api/submittals/${id}/attachments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      await fetch_();
    } catch {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attId) => {
    if (!confirm('Delete this attachment?')) return;
    await fetch(`${API_BASE}/api/submittals/${id}/attachments/${attId}`, {
      method: 'DELETE',
      headers,
    });
    fetch_();
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="p-6 space-y-4 animate-pulse">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton skeleton-card h-40" />
          <div className="skeleton skeleton-card h-64" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!submittal) return null;

  const cfg = STATUS_CONFIG[submittal.status] || { label: submittal.status, cls: 'badge badge-gray', next: [] };

  return (
    <ResponsiveLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Back + Header */}
        <div>
          <button
            onClick={() => router.push('/dashboard/manager/material-submittals')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft size={16} /> Back to Submittals
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{submittal.submittalNumber}</h1>
              <p className="text-gray-500 mt-0.5">{submittal.specSection}</p>
            </div>
            <span className={cfg.cls + ' text-sm px-3 py-1'}>{cfg.label}</span>
          </div>
        </div>

        {/* Action Bar */}
        {cfg.next.length > 0 && (
          <div className="card card-body bg-gray-50 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  className="form-input text-sm"
                  placeholder="Add comment (optional)…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {cfg.next.map((ns) => (
                  <button
                    key={ns}
                    className={ACTION_STYLES[ns] || 'btn btn-secondary'}
                    disabled={!!actionLoading}
                    onClick={() => handleStatusChange(ns)}
                  >
                    {actionLoading === ns ? <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : null}
                    {ACTION_LABELS[ns] || ns}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {['overview', 'attachments', 'activity'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                  tab === t ? 'border-[#B8960A] text-[#B8960A]' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'attachments' ? `Attachments (${submittal.attachments?.length || 0})` : t}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card card-body space-y-4">
              <h3 className="font-semibold text-gray-800">Submittal Details</h3>
              <Field icon={<Hash size={15} />}      label="Number"        value={submittal.submittalNumber} />
              <Field icon={<Tag size={15} />}         label="Spec Section"  value={submittal.specSection} />
              <Field icon={<Tag size={15} />}         label="Material Type" value={submittal.materialType || '—'} />
              <Field icon={<Building2 size={15} />}   label="Project"       value={submittal.projectName || '—'} />
              <Field icon={<User size={15} />}        label="Vendor"        value={submittal.vendor?.companyName || '—'} />
              <Field icon={<User size={15} />}        label="Reviewer"      value={submittal.reviewer?.name || '—'} />
            </div>
            <div className="card card-body space-y-4">
              <h3 className="font-semibold text-gray-800">Timeline</h3>
              <Field icon={<Calendar size={15} />} label="Submission Date" value={submittal.submissionDate ? new Date(submittal.submissionDate).toLocaleDateString() : '—'} />
              <Field icon={<Calendar size={15} />} label="Required Date"   value={submittal.requiredDate ? new Date(submittal.requiredDate).toLocaleDateString() : '—'} />
              <Field icon={<Calendar size={15} />} label="Created"         value={new Date(submittal.createdAt).toLocaleDateString()} />
              {submittal.delayDays > 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700 font-medium">{submittal.delayDays} days overdue</span>
                </div>
              )}
              {submittal.revisionNumber > 0 && (
                <Field icon={<RotateCcw size={15} />} label="Revision" value={`Rev. ${submittal.revisionNumber}`} />
              )}
            </div>
            {submittal.notes && (
              <div className="card card-body md:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{submittal.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Attachments Tab */}
        {tab === 'attachments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Attachments</h3>
              <label className="btn btn-secondary cursor-pointer">
                {uploading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <Upload size={16} />}
                Upload File
                <input type="file" className="hidden" onChange={handleAttachmentUpload} disabled={uploading} />
              </label>
            </div>
            {(!submittal.attachments || submittal.attachments.length === 0) ? (
              <div className="card card-body text-center py-12 text-gray-400">
                <Paperclip size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No attachments yet</p>
              </div>
            ) : (
              <div className="card divide-y divide-gray-100">
                {submittal.attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Paperclip size={16} className="text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{att.originalName || att.fileName}</p>
                        <p className="text-xs text-gray-400">{att.uploadedBy?.name || '—'} · {new Date(att.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3 flex-shrink-0">
                      <a
                        href={`${API_BASE}/${att.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost p-1.5"
                        title="Download"
                      >
                        <Download size={15} />
                      </a>
                      <button onClick={() => handleDeleteAttachment(att.id)} className="btn btn-ghost p-1.5 text-red-500 hover:text-red-700">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {tab === 'activity' && (
          <div className="space-y-3">
            {(!submittal.activityLog || submittal.activityLog.length === 0) ? (
              <div className="card card-body text-center py-12 text-gray-400">
                <Activity size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                {submittal.activityLog.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[23px] w-4 h-4 rounded-full bg-white border-2 border-[#B8960A]" />
                    <div className="card card-body py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      {log.comment && <p className="text-sm text-gray-600">{log.comment}</p>}
                      {log.user && <p className="text-xs text-gray-400 mt-1">by {log.user.name}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}

function Field({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
      </div>
    </div>
  );
}
