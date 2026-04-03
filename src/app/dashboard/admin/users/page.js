"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users, Search, Filter, Download, RefreshCw, Plus, Mail, Upload,
  Shield, Lock, Unlock, Eye, Edit, Key, UserX, UserCheck, ChevronDown,
  MoreVertical, X, Check, AlertTriangle, Activity, Clock, Building,
  Briefcase, IdCard, Phone, Globe, FileText, CheckSquare, Square,
  LogIn, Settings, Loader2, ChevronRight, Trash2, Send
} from 'lucide-react';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

const ROLE_COLORS = {
  1: { bg: '#FEE2E2', text: '#991B1B', label: 'Executive' },
  2: { bg: '#FEF3C7', text: '#92400E', label: 'Proc. Manager' },
  3: { bg: '#DBEAFE', text: '#1E40AF', label: 'Proc. Officer' },
  4: { bg: '#D1FAE5', text: '#065F46', label: 'Vendor' },
};

const ROLE_AVATAR_BG = { 1: '#DC2626', 2: '#D97706', 3: '#2563EB', 4: '#059669' };

function getLastLoginDot(lastLoginDate) {
  if (!lastLoginDate) return '#9CA3AF';
  const days = (Date.now() - new Date(lastLoginDate)) / 86400000;
  if (days < 7) return '#22C55E';
  if (days < 30) return '#EAB308';
  return '#EF4444';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── Password strength ──────────────────────────────────────────────
function passwordStrength(p) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
}

const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColor = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A'];

// ── Sub-components ─────────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 160 }}>
      <div style={{ background: color + '20', borderRadius: 10, padding: 10, color }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#0A1628' }}>{value ?? '—'}</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>{label}</div>
      </div>
    </div>
  );
}

function RoleBadge({ roleId }) {
  const r = ROLE_COLORS[roleId] || { bg: '#F3F4F6', text: '#374151', label: 'Unknown' };
  return (
    <span style={{ background: r.bg, color: r.text, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{r.label}</span>
  );
}

function StatusPill({ user }) {
  if (user.isSuspended) return <span style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Suspended</span>;
  if (!user.isActive) return <span style={{ background: '#F3F4F6', color: '#6B7280', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Inactive</span>;
  return <span style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>Active</span>;
}

function Avatar({ user }) {
  const bg = ROLE_AVATAR_BG[user.roleId] || '#6B7280';
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
      {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : initials}
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button onClick={() => !disabled && onChange(!checked)} disabled={disabled}
      style={{ width: 40, height: 22, borderRadius: 11, background: checked ? '#B8960A' : '#D1D5DB', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0, flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
    </button>
  );
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0A1628' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827' };
const selectStyle = { ...inputStyle, background: '#fff', cursor: 'pointer' };

// ── Add User Modal ─────────────────────────────────────────────────
function AddUserModal({ onClose, onSaved, token }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', roleId: 3, employeeId: '', jobTitle: '', department: '', phoneNumber: '', accessScope: 'ALL_PROJECTS' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const score = passwordStrength(form.password);

  const genPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let p = '';
    for (let i = 0; i < 12; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setForm(f => ({ ...f, password: p }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required.'); return; }
    setLoading(true); setError('');
    try {
      await fetch(`${API_BASE}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, roleId: Number(form.roleId) }) });
      onSaved();
    } catch (e) { setError('Failed to create user.'); }
    setLoading(false);
  };

  return (
    <Modal title="Add New User" onClose={onClose} width={540}>
      {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <Field label="Full Name" required><input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
        <Field label="Email" required><input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Field>
        <Field label="Password" required>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...inputStyle, flex: 1 }} type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <button onClick={genPassword} style={{ background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: 8, padding: '0 10px', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap' }}>Generate</button>
          </div>
          {form.password && <div style={{ marginTop: 6 }}>
            <div style={{ height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(score / 5) * 100}%`, height: '100%', background: strengthColor[score], transition: 'all 0.3s' }} />
            </div>
            <span style={{ fontSize: 11, color: strengthColor[score] }}>{strengthLabel[score]}</span>
          </div>}
        </Field>
        <Field label="Role" required>
          <select style={selectStyle} value={form.roleId} onChange={e => setForm(f => ({ ...f, roleId: e.target.value }))}>
            <option value={1}>Executive (Admin)</option>
            <option value={2}>Procurement Manager</option>
            <option value={3}>Procurement Officer</option>
            <option value={4}>Vendor</option>
          </select>
        </Field>
        <Field label="Employee ID"><input style={inputStyle} value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} /></Field>
        <Field label="Job Title"><input style={inputStyle} value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} /></Field>
        <Field label="Department"><input style={inputStyle} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></Field>
        <Field label="Phone"><input style={inputStyle} value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} /></Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
        <button onClick={onClose} style={{ padding: '9px 20px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSubmit} disabled={loading} style={{ padding: '9px 20px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Create User
        </button>
      </div>
    </Modal>
  );
}

// ── Invite User Modal ──────────────────────────────────────────────
function InviteUserModal({ onClose, token }) {
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState(3);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    if (!email) { setError('Email is required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/invitations`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, roleId: Number(roleId) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const link = `${window.location.origin}/signup?invitation=${data.token}`;
      setInviteLink(link);
    } catch (e) { setError(e.message || 'Failed to create invitation.'); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <Modal title="Invite User" onClose={onClose}>
      {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
      {!inviteLink ? <>
        <Field label="Email Address" required><input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@company.com" /></Field>
        <Field label="Role">
          <select style={selectStyle} value={roleId} onChange={e => setRoleId(e.target.value)}>
            <option value={2}>Procurement Manager</option>
            <option value={3}>Procurement Officer</option>
            <option value={4}>Vendor</option>
          </select>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleInvite} disabled={loading} style={{ padding: '9px 20px', background: '#B8960A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading ? <Loader2 size={14} /> : <Send size={14} />} Send Invitation
          </button>
        </div>
      </> : <>
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          Invitation created! Share this link with the user (expires in 48 hours):
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input style={{ ...inputStyle, flex: 1, background: '#F9FAFB', fontSize: 12 }} readOnly value={inviteLink} />
          <button onClick={copy} style={{ padding: '9px 14px', background: copied ? '#22C55E' : '#0A1628', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            {copied ? <Check size={14} /> : null}{copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Done</button>
        </div>
      </>}
    </Modal>
  );
}

// ── Import Users Modal ─────────────────────────────────────────────
function ImportUsersModal({ onClose, onDone, token }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = f => { if (f) setFile(f); };
  const onDrop = e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/users/import`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      setResult(data);
    } catch { setResult({ error: 'Import failed.' }); }
    setLoading(false);
  };

  return (
    <Modal title="Import Users" onClose={onClose}>
      {!result ? <>
        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
          style={{ border: `2px dashed ${dragging ? '#B8960A' : '#D1D5DB'}`, borderRadius: 12, padding: 32, textAlign: 'center', background: dragging ? '#FFFBEB' : '#F9FAFB', cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => document.getElementById('import-file').click()}>
          <Upload size={32} color="#9CA3AF" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, color: '#374151', fontWeight: 600 }}>Drop your Excel/CSV file here</p>
          <p style={{ margin: '4px 0 0', color: '#9CA3AF', fontSize: 13 }}>Columns: name, email, roleId, employeeId, jobTitle, department</p>
          {file && <p style={{ margin: '12px 0 0', color: '#0A1628', fontWeight: 600, fontSize: 13 }}>{file.name}</p>}
          <input id="import-file" type="file" accept=".xlsx,.csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleImport} disabled={!file || loading} style={{ padding: '9px 20px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: !file ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            {loading ? <Loader2 size={14} /> : <Upload size={14} />} Import
          </button>
        </div>
      </> : <>
        {result.error
          ? <div style={{ background: '#FEE2E2', color: '#991B1B', padding: 16, borderRadius: 8 }}>{result.error}</div>
          : <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px 20px', borderRadius: 8, flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{result.created}</div><div style={{ fontSize: 12 }}>Created</div>
              </div>
              <div style={{ background: '#FEF3C7', color: '#92400E', padding: '12px 20px', borderRadius: 8, flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{result.skipped}</div><div style={{ fontSize: 12 }}>Skipped</div>
              </div>
            </div>
            {result.errors?.length > 0 && <div style={{ background: '#FEE2E2', borderRadius: 8, padding: 12, fontSize: 12, maxHeight: 120, overflowY: 'auto' }}>
              {result.errors.map((e, i) => <div key={i} style={{ color: '#991B1B' }}>Row {e.row}: {e.reason}</div>)}
            </div>}
          </div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onDone} style={{ padding: '9px 20px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Done</button>
        </div>
      </>}
    </Modal>
  );
}

// ── Action Modal ───────────────────────────────────────────────────
function ActionModal({ type, user, onClose, onDone, token }) {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [suspendedUntil, setSuspendedUntil] = useState('');
  const [newRoleId, setNewRoleId] = useState(user?.roleId || 3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const needsConfirm = ['deactivate', 'suspend'].includes(type);

  const titles = { 'change-role': 'Change Role', 'reset-password': 'Reset Password', deactivate: 'Deactivate Account', suspend: 'Suspend Account', unsuspend: 'Unsuspend Account', activate: 'Activate Account' };
  const isDestructive = needsConfirm && confirmText !== 'CONFIRM';

  const handleAction = async () => {
    if (needsConfirm && confirmText !== 'CONFIRM') return;
    setLoading(true); setError('');
    try {
      const h = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      if (type === 'change-role') {
        await fetch(`${API_BASE}/users/${user.id}/role`, { method: 'PATCH', headers: h, body: JSON.stringify({ roleId: Number(newRoleId) }) });
      } else if (type === 'reset-password') {
        await fetch(`${API_BASE}/users/${user.id}/reset-password`, { method: 'PATCH', headers: h });
      } else if (type === 'deactivate') {
        await fetch(`${API_BASE}/users/${user.id}/status`, { method: 'PATCH', headers: h, body: JSON.stringify({ isActive: false }) });
      } else if (type === 'activate') {
        await fetch(`${API_BASE}/users/${user.id}/status`, { method: 'PATCH', headers: h, body: JSON.stringify({ isActive: true }) });
      } else if (type === 'suspend') {
        await fetch(`${API_BASE}/users/${user.id}/suspend`, { method: 'PATCH', headers: h, body: JSON.stringify({ reason, suspendedUntil: suspendedUntil || null }) });
      } else if (type === 'unsuspend') {
        await fetch(`${API_BASE}/users/${user.id}/unsuspend`, { method: 'PATCH', headers: h });
      }
      onDone();
    } catch { setError('Action failed. Please try again.'); }
    setLoading(false);
  };

  return (
    <Modal title={titles[type]} onClose={onClose}>
      {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
      <p style={{ margin: '0 0 16px', color: '#374151', fontSize: 14 }}>
        {type === 'reset-password' && `A temporary password will be generated and sent to ${user?.email}. The user will be required to change it on next login.`}
        {type === 'deactivate' && `This will deactivate ${user?.name}'s account. They will no longer be able to log in.`}
        {type === 'activate' && `This will re-activate ${user?.name}'s account.`}
        {type === 'unsuspend' && `This will lift the suspension on ${user?.name}'s account.`}
        {type === 'change-role' && `Change role for ${user?.name}:`}
        {type === 'suspend' && `Suspend ${user?.name}'s account:`}
      </p>
      {type === 'change-role' && (
        <Field label="New Role">
          <select style={selectStyle} value={newRoleId} onChange={e => setNewRoleId(e.target.value)}>
            <option value={1}>Executive (Admin)</option>
            <option value={2}>Procurement Manager</option>
            <option value={3}>Procurement Officer</option>
            <option value={4}>Vendor</option>
          </select>
        </Field>
      )}
      {type === 'suspend' && <>
        <Field label="Reason" required><input style={inputStyle} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Policy violation" /></Field>
        <Field label="Suspend Until (optional)"><input style={inputStyle} type="date" value={suspendedUntil} onChange={e => setSuspendedUntil(e.target.value)} /></Field>
      </>}
      {needsConfirm && <div style={{ marginBottom: 16 }}>
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#92400E' }}>
          <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />Type <strong>CONFIRM</strong> to proceed.
        </div>
        <input style={inputStyle} value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="Type CONFIRM" />
      </div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button onClick={onClose} style={{ padding: '9px 20px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleAction} disabled={loading || (needsConfirm && isDestructive) || (type === 'suspend' && !reason)}
          style={{ padding: '9px 20px', background: ['deactivate', 'suspend'].includes(type) ? '#DC2626' : '#0A1628', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: (needsConfirm && isDestructive) ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? <Loader2 size={14} /> : null}{titles[type]}
        </button>
      </div>
    </Modal>
  );
}

// ── User Action Menu ───────────────────────────────────────────────
function UserActionMenu({ user, onAction }) {
  const [open, setOpen] = useState(false);
  const items = [
    { label: 'View Profile', action: 'view', icon: <Eye size={14} /> },
    { label: 'Edit', action: 'edit', icon: <Edit size={14} /> },
    { label: 'Change Role', action: 'change-role', icon: <Shield size={14} /> },
    { label: 'Reset Password', action: 'reset-password', icon: <Key size={14} /> },
    user.isSuspended ? { label: 'Unsuspend', action: 'unsuspend', icon: <Unlock size={14} /> } : { label: 'Suspend', action: 'suspend', icon: <Lock size={14} /> },
    user.isActive ? { label: 'Deactivate', action: 'deactivate', icon: <UserX size={14} />, danger: true } : { label: 'Activate', action: 'activate', icon: <UserCheck size={14} /> },
    { label: 'View Audit Log', action: 'audit', icon: <Activity size={14} /> },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6B7280', borderRadius: 4 }}>
        <MoreVertical size={16} />
      </button>
      {open && <>
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
        <div style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 170, zIndex: 100, overflow: 'hidden' }}>
          {items.map(item => (
            <button key={item.action} onClick={() => { setOpen(false); onAction(item.action, user); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: item.danger ? '#DC2626' : '#374151' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              {item.icon}{item.label}
            </button>
          ))}
        </div>
      </>}
    </div>
  );
}

// ── Side Drawer ────────────────────────────────────────────────────
function UserDrawer({ user, onClose, onAction, token, onRefresh }) {
  const [notes, setNotes] = useState(user.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [activity, setActivity] = useState([]);
  const [toggling2fa, setToggling2fa] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/users/${user.id}/activity?page=1&pageSize=5`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setActivity(d.logs || [])).catch(() => {});
  }, [user.id, token]);

  const saveNotes = async () => {
    setSavingNotes(true);
    await fetch(`${API_BASE}/users/${user.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ notes }) });
    setSavingNotes(false);
  };

  const toggle2fa = async () => {
    setToggling2fa(true);
    await fetch(`${API_BASE}/users/${user.id}/toggle-2fa`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ twoFactorEnabled: !user.twoFactorEnabled }) });
    setToggling2fa(false);
    onRefresh();
  };

  const Section = ({ title, children }) => (
    <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: 20, marginBottom: 20 }}>
      <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
      {children}
    </div>
  );

  const Row = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <span style={{ color: '#9CA3AF', marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{label}</div>
        <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100vh', background: '#fff', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', zIndex: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: '#0A1628', padding: '20px 20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar user={user} />
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{user.name}</div>
            <div style={{ color: '#93C5FD', fontSize: 12 }}>{user.email}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={20} /></button>
      </div>
      {/* Status row */}
      <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB', padding: '10px 20px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <StatusPill user={user} />
        <RoleBadge roleId={user.roleId} />
        {user.twoFactorEnabled && <span style={{ background: '#FEF3C7', color: '#B8960A', fontSize: 11, borderRadius: 6, padding: '2px 8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={10} /> 2FA</span>}
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {/* A — Identity */}
        <Section title="A — Identity">
          <Row icon={<IdCard size={14} />} label="Employee ID" value={user.employeeId} />
          <Row icon={<Briefcase size={14} />} label="Job Title" value={user.jobTitle} />
          <Row icon={<Building size={14} />} label="Department" value={user.department} />
          <Row icon={<Phone size={14} />} label="Phone" value={user.phoneNumber} />
          <Row icon={<Globe size={14} />} label="Access Scope" value={user.accessScope} />
        </Section>
        {/* B — Security */}
        <Section title="B — Security">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Two-Factor Auth</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>Method: {user.twoFactorMethod || 'Not set'}</div>
            </div>
            <Toggle checked={!!user.twoFactorEnabled} onChange={toggle2fa} disabled={toggling2fa} />
          </div>
          <Row icon={<Key size={14} />} label="Last Password Change" value={formatDate(user.lastPasswordChange)} />
          {user.isSuspended && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 12px', borderRadius: 8, fontSize: 12, marginTop: 8 }}>
            <strong>Suspended:</strong> {user.suspendedReason || 'No reason given'}
            {user.suspendedUntil && <div>Until: {formatDate(user.suspendedUntil)}</div>}
          </div>}
          {user.mustChangePassword && <div style={{ background: '#FEF3C7', color: '#92400E', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginTop: 8 }}>
            Password change required on next login.
          </div>}
        </Section>
        {/* C — Activity */}
        <Section title="C — Recent Activity">
          <Row icon={<Clock size={14} />} label="Last Login" value={formatDateTime(user.lastLoginDate)} />
          <Row icon={<Clock size={14} />} label="Account Created" value={formatDate(user.createdAt)} />
          <div style={{ marginTop: 12 }}>
            {activity.length === 0 ? <div style={{ color: '#9CA3AF', fontSize: 12 }}>No recent activity.</div>
              : activity.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 12 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#B8960A', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{a.action}</span>
                    <span style={{ color: '#9CA3AF', marginLeft: 6 }}>{formatDateTime(a.createdAt)}</span>
                  </div>
                </div>
              ))}
          </div>
        </Section>
        {/* D — Actions */}
        <div>
          <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>D — Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => onAction('change-role', user)} style={{ padding: '9px 14px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={14} color="#374151" /> Change Role
            </button>
            <button onClick={() => onAction('reset-password', user)} style={{ padding: '9px 14px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Key size={14} color="#374151" /> Reset Password
            </button>
            {user.isSuspended
              ? <button onClick={() => onAction('unsuspend', user)} style={{ padding: '9px 14px', background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Unlock size={14} color="#065F46" /> Unsuspend Account
                </button>
              : <button onClick={() => onAction('suspend', user)} style={{ padding: '9px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Lock size={14} color="#92400E" /> Suspend Account
                </button>}
            {user.isActive
              ? <button onClick={() => onAction('deactivate', user)} style={{ padding: '9px 14px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, color: '#991B1B' }}>
                  <UserX size={14} /> Deactivate Account
                </button>
              : <button onClick={() => onAction('activate', user)} style={{ padding: '9px 14px', background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, color: '#065F46' }}>
                  <UserCheck size={14} /> Activate Account
                </button>}
          </div>
          {/* Admin Notes */}
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Admin Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
            <button onClick={saveNotes} disabled={savingNotes} style={{ marginTop: 8, padding: '7px 16px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              {savingNotes ? <Loader2 size={12} /> : <FileText size={12} />} Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: '', status: '', department: '', twoFa: '', page: 1, pageSize: 20 });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [drawerUser, setDrawerUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [actionModal, setActionModal] = useState(null); // { type, user }
  const [bulkLoading, setBulkLoading] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('authToken') || '';
    setToken(t);
  }, []);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/users/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setStats(data);
    } catch {}
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.role) params.set('role', filters.role);
      if (filters.status === 'active') params.set('isActive', 'true');
      if (filters.status === 'inactive') params.set('isActive', 'false');
      if (filters.status === 'suspended') params.set('isSuspended', 'true');
      if (filters.twoFa) params.set('twoFactorEnabled', filters.twoFa);
      params.set('page', filters.page);
      params.set('pageSize', filters.pageSize);
      const res = await fetch(`${API_BASE}/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [token, filters]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/export`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'users-export.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    await fetch(`${API_BASE}/users/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ userIds: [...selectedIds], action }) });
    setBulkLoading(false);
    setSelectedIds(new Set());
    fetchUsers(); fetchStats();
  };

  const handleAction = (type, user) => {
    if (type === 'view') { setDrawerUser(user); return; }
    if (type === 'audit') { window.open(`/dashboard/admin/audit-log?userId=${user.id}`, '_blank'); return; }
    setActionModal({ type, user });
  };

  const handleActionDone = () => {
    setActionModal(null);
    setDrawerUser(null);
    fetchUsers(); fetchStats();
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map(u => u.id)));
  };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const btnPrimary = { padding: '9px 16px', background: '#0A1628', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600 };
  const btnOutline = { padding: '9px 16px', background: '#fff', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500 };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '24px 28px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0A1628' }}>User Management</h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 14 }}>{total} users total</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={btnOutline} onClick={handleExport}><Download size={15} /> Export</button>
          <button style={btnOutline} onClick={() => setShowImportModal(true)}><Upload size={15} /> Import</button>
          <button style={btnOutline} onClick={() => setShowInviteModal(true)}><Mail size={15} /> Invite</button>
          <button style={btnPrimary} onClick={() => setShowAddModal(true)}><Plus size={15} /> Add User</button>
        </div>
      </div>

      {/* Security Summary Widget */}
      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon={<Users size={20} />} label="Total Users" value={stats.totalUsers} color="#2563EB" />
          <StatCard icon={<UserCheck size={20} />} label="Active Users" value={stats.activeUsers} color="#22C55E" />
          <StatCard icon={<UserX size={20} />} label="Suspended" value={stats.suspendedUsers} color="#EF4444" />
          <StatCard icon={<Shield size={20} />} label="2FA Enabled" value={`${stats.twoFactorEnabledCount} (${stats.twoFactorEnabledPercent ?? 0}%)`} color="#B8960A" />
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input value={filters.search} onChange={e => setFilter('search', e.target.value)} placeholder="Search name, email, ID..."
            style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <select style={{ ...selectStyle, flex: '0 1 150px', minWidth: 130 }} value={filters.role} onChange={e => setFilter('role', e.target.value)}>
          <option value="">All Roles</option>
          <option value="1">Executive</option>
          <option value="2">Proc. Manager</option>
          <option value="3">Proc. Officer</option>
          <option value="4">Vendor</option>
        </select>
        <select style={{ ...selectStyle, flex: '0 1 140px', minWidth: 120 }} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <select style={{ ...selectStyle, flex: '0 1 130px', minWidth: 110 }} value={filters.twoFa} onChange={e => setFilter('twoFa', e.target.value)}>
          <option value="">All 2FA</option>
          <option value="true">2FA On</option>
          <option value="false">2FA Off</option>
        </select>
        <button onClick={() => setFilters({ search: '', role: '', status: '', department: '', twoFa: '', page: 1, pageSize: 20 })}
          style={{ ...btnOutline, padding: '9px 12px' }}><RefreshCw size={14} /></button>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div style={{ background: '#B8960A', borderRadius: 10, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{selectedIds.size} selected</span>
          <button onClick={() => handleBulkAction('activate')} disabled={bulkLoading} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Activate</button>
          <button onClick={() => handleBulkAction('deactivate')} disabled={bulkLoading} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Deactivate</button>
          <button onClick={() => handleBulkAction('suspend')} disabled={bulkLoading} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Suspend</button>
          <button onClick={() => handleBulkAction('reset-password')} disabled={bulkLoading} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Reset Passwords</button>
          {bulkLoading && <Loader2 size={16} color="#fff" className="spin" />}
          <button onClick={() => setSelectedIds(new Set())} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {/* User Table */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', width: 36 }}>
                <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0 }}>
                  {selectedIds.size === users.length && users.length > 0 ? <CheckSquare size={16} color="#0A1628" /> : <Square size={16} />}
                </button>
              </th>
              {['User', 'Employee ID', 'Title / Dept', 'Role', 'Status', 'Last Login', '2FA', ''].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}><Loader2 size={24} className="spin" style={{ display: 'inline' }} /></td></tr>
              : users.length === 0
              ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No users found.</td></tr>
              : users.map(user => (
                <tr key={user.id} onClick={() => setDrawerUser(user)}
                  style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleSelect(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0 }}>
                      {selectedIds.has(user.id) ? <CheckSquare size={16} color="#0A1628" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar user={user} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{user.employeeId || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, color: '#374151' }}>{user.jobTitle || '—'}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{user.department || '—'}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}><RoleBadge roleId={user.roleId} /></td>
                  <td style={{ padding: '12px 14px' }}><StatusPill user={user} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getLastLoginDot(user.lastLoginDate), flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#6B7280' }}>{user.lastLoginDate ? formatDate(user.lastLoginDate) : 'Never'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {user.twoFactorEnabled
                      ? <Lock size={14} color="#B8960A" />
                      : <Lock size={14} color="#D1D5DB" />}
                  </td>
                  <td style={{ padding: '12px 10px' }} onClick={e => e.stopPropagation()}>
                    <UserActionMenu user={user} onAction={handleAction} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {/* Pagination */}
        {total > filters.pageSize && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#6B7280' }}>Showing {((filters.page - 1) * filters.pageSize) + 1}–{Math.min(filters.page * filters.pageSize, total)} of {total}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setFilter('page', Math.max(1, filters.page - 1))} disabled={filters.page === 1}
                style={{ ...btnOutline, padding: '6px 12px', opacity: filters.page === 1 ? 0.4 : 1 }}>← Prev</button>
              <button onClick={() => setFilter('page', filters.page + 1)} disabled={filters.page * filters.pageSize >= total}
                style={{ ...btnOutline, padding: '6px 12px', opacity: filters.page * filters.pageSize >= total ? 0.4 : 1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Side Drawer backdrop */}
      {drawerUser && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 499 }} onClick={() => setDrawerUser(null)} />}
      {drawerUser && <UserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} onAction={handleAction} token={token} onRefresh={fetchUsers} />}

      {/* Modals */}
      {showAddModal && <AddUserModal token={token} onClose={() => setShowAddModal(false)} onSaved={() => { setShowAddModal(false); fetchUsers(); fetchStats(); }} />}
      {showInviteModal && <InviteUserModal token={token} onClose={() => setShowInviteModal(false)} />}
      {showImportModal && <ImportUsersModal token={token} onClose={() => setShowImportModal(false)} onDone={() => { setShowImportModal(false); fetchUsers(); fetchStats(); }} />}
      {actionModal && <ActionModal type={actionModal.type} user={actionModal.user} token={token} onClose={() => setActionModal(null)} onDone={handleActionDone} />}
    </div>
  );
}
