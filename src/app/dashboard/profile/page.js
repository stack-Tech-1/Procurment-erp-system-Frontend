"use client";
import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  User, Shield, Smartphone, Bell, Palette, Upload, Trash2, Check, X, Eye, EyeOff,
  Copy, Download, Printer, Loader2, AlertTriangle, CheckCircle, Lock, Unlock,
  Globe, Clock, Key, ChevronRight, Save, Camera, ExternalLink
} from 'lucide-react';

const API = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : ''; }
function authHeaders() { return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }; }

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? '#D1FAE5' : '#FEE2E2';
  const tc = type === 'success' ? '#065F46' : '#991B1B';
  const icon = type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: bg, color: tc, padding: '12px 18px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 9999, fontSize: 14, fontWeight: 600 }}>
      {icon}{msg}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      style={{ width: 44, height: 24, borderRadius: 12, background: checked ? '#B8960A' : '#D1D5DB', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0, flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const colors = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A'];
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const checks = [
    { met: password.length >= 8, label: '8+ characters' },
    { met: /[A-Z]/.test(password), label: 'Uppercase' },
    { met: /[a-z]/.test(password), label: 'Lowercase' },
    { met: /[0-9]/.test(password), label: 'Number' },
    { met: /[^A-Za-z0-9]/.test(password), label: 'Special character' },
  ];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? colors[score] : '#E5E7EB', transition: 'background 0.3s' }} />)}
      </div>
      <div style={{ fontSize: 11, color: colors[score], fontWeight: 600, marginBottom: 8 }}>{labels[score]}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11, color: c.met ? '#22C55E' : '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={10} color={c.met ? '#22C55E' : '#D1D5DB'} />{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff' };
const readOnlyStyle = { ...inputStyle, background: '#F9FAFB', color: '#6B7280', cursor: 'default' };
const btnPrimary = { padding: '10px 20px', background: '#B8960A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 };
const btnOutline = { padding: '10px 20px', background: '#fff', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer', fontSize: 14 };
const btnDanger = { padding: '10px 20px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 };

const TABS = [
  { id: 'profile', label: 'Profile Information', icon: <User size={16} /> },
  { id: 'security', label: 'Security & Password', icon: <Shield size={16} /> },
  { id: '2fa', label: 'Two-Factor Auth', icon: <Smartphone size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'appearance', label: 'Appearance & Language', icon: <Palette size={16} /> },
];

const TIMEZONES = ['Asia/Riyadh', 'Asia/Dubai', 'Africa/Cairo', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Asia/Singapore', 'UTC'];

// ── Tab: Profile ─────────────────────────────────────────────────────────────
function ProfileTab({ user, onSave, onToast }) {
  const [form, setForm] = useState({ name: user.name || '', jobTitle: user.jobTitle || '', phoneNumber: user.phoneNumber || '' });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/profile/me`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSave(data);
      onToast('Profile updated successfully', 'success');
    } catch (e) { onToast(e.message || 'Failed to save', 'error'); }
    setSaving(false);
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await fetch(`${API}/profile/avatar`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSave({ ...user, avatarUrl: data.avatarUrl });
      onToast('Photo updated', 'success');
    } catch (e) { onToast(e.message || 'Upload failed', 'error'); }
    setUploadingAvatar(false);
  };

  const handleRemoveAvatar = async () => {
    try {
      await fetch(`${API}/profile/avatar`, { method: 'DELETE', headers: authHeaders() });
      onSave({ ...user, avatarUrl: null });
      onToast('Photo removed', 'success');
    } catch { onToast('Failed to remove photo', 'error'); }
  };

  const completion = user.profileCompletion || 0;
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Avatar + completion */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700, overflow: 'hidden', marginBottom: 12, position: 'relative' }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL}/${user.avatarUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
              style={{ ...btnOutline, padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              {uploadingAvatar ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={12} />}
              Upload Photo
            </button>
            {user.avatarUrl && <button onClick={handleRemoveAvatar} style={{ ...btnDanger, padding: '6px 12px', fontSize: 12 }}><Trash2 size={12} /></button>}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleAvatarUpload(e.target.files[0])} />
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Profile {completion}% complete</span>
          </div>
          <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: `${completion}%`, height: '100%', background: completion === 100 ? '#22C55E' : '#B8960A', transition: 'width 0.5s' }} />
          </div>
          {user.missing?.length > 0 && (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {user.missing.map(m => (
                <li key={m} style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#D1D5DB' }} />{m}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Job Title</label>
          <input style={inputStyle} value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Phone Number</label>
          <input style={inputStyle} value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="+966 5X XXX XXXX" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Employee ID <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(admin only)</span></label>
          <input style={readOnlyStyle} value={user.employeeId || ''} readOnly />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(admin only)</span></label>
          <input style={readOnlyStyle} value={user.email || ''} readOnly />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Department <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(admin only)</span></label>
          <input style={readOnlyStyle} value={user.department || ''} readOnly />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Role</label>
          <div style={{ padding: '10px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8 }}>
            <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{user.role?.name || 'N/A'}</span>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={btnPrimary}>
        {saving ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
        Save Changes
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Tab: Security ─────────────────────────────────────────────────────────────
function SecurityTab({ user, onToast }) {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showC, setShowC] = useState(false);
  const [showN, setShowN] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = async () => {
    if (!current || !newPw || !confirm) { onToast('All fields are required', 'error'); return; }
    if (newPw !== confirm) { onToast('Passwords do not match', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/profile/change-password`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ currentPassword: current, newPassword: newPw, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrent(''); setNewPw(''); setConfirm('');
      onToast('Password changed successfully', 'success');
    } catch (e) { onToast(e.message || 'Failed', 'error'); }
    setSaving(false);
  };

  const daysSincePwChange = user.lastPasswordChange
    ? Math.floor((Date.now() - new Date(user.lastPasswordChange)) / 86400000)
    : null;
  const pwWarning = daysSincePwChange !== null && daysSincePwChange > 90;

  const pwField = (label, val, setVal, show, setShow) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={show ? 'text' : 'password'} value={val} onChange={e => setVal(e.target.value)}
          style={{ ...inputStyle, paddingRight: 40 }} />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Change Password */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Change Password</h3>
        {pwField('Current Password', current, setCurrent, showC, setShowC)}
        {pwField('New Password', newPw, setNewPw, showN, setShowN)}
        <StrengthBar password={newPw} />
        <div style={{ marginBottom: 16, marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showCf ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
              style={{ ...inputStyle, paddingRight: 40, borderColor: confirm && newPw !== confirm ? '#EF4444' : '#D1D5DB' }} />
            <button type="button" onClick={() => setShowCf(s => !s)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
              {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirm && newPw === confirm && <div style={{ fontSize: 12, color: '#22C55E', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} />Passwords match</div>}
        </div>
        <button onClick={handleChange} disabled={saving} style={btnPrimary}>
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Key size={14} />} Change Password
        </button>
      </div>

      {/* Account Security Status */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Account Security Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: pwWarning ? '#FEF3C7' : '#F9FAFB', borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Last Password Change</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                {user.lastPasswordChange
                  ? `${daysSincePwChange} days ago (${new Date(user.lastPasswordChange).toLocaleDateString()})`
                  : 'Never changed'}
              </div>
            </div>
            {pwWarning && <span style={{ fontSize: 12, color: '#92400E', fontWeight: 600, background: '#FDE68A', padding: '3px 10px', borderRadius: 20 }}>Update Recommended</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Failed Login Attempts</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{user.failedLoginAttempts || 0} failed attempts</div>
            </div>
            {user.failedLoginAttempts > 0 && <span style={{ fontSize: 12, color: '#92400E', background: '#FEF3C7', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>Suspicious</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Account Status</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{user.isSuspended ? 'Suspended' : user.isActive ? 'Active' : 'Inactive'}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: user.isActive && !user.isSuspended ? '#D1FAE5' : '#FEE2E2', color: user.isActive && !user.isSuspended ? '#065F46' : '#991B1B' }}>
              {user.isSuspended ? 'Suspended' : user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Active Sessions</h3>
        <div style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Current Session</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Last login: {user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString() : 'Unknown'}</div>
          </div>
          <span style={{ background: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>Active Now</span>
        </div>
        <button onClick={() => alert('Coming soon — sign out all other sessions.')} style={btnOutline}>Sign out all other sessions</button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Tab: 2FA ──────────────────────────────────────────────────────────────────
function TwoFATab({ user, onSave, onToast }) {
  const [step, setStep] = useState(0); // 0=idle, 1=install, 2=scan, 3=verify, 4=backup
  const [qrData, setQrData] = useState(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [backupCount, setBackupCount] = useState(null);
  const [savedCheck, setSavedCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);

  useEffect(() => {
    if (user.twoFactorEnabled) {
      fetch(`${API}/profile/2fa/backup-codes/count`, { headers: authHeaders() })
        .then(r => r.json()).then(d => setBackupCount(d.remaining)).catch(() => {});
    }
  }, [user.twoFactorEnabled]);

  const startSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/profile/2fa/setup`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQrData(data);
      setStep(2);
    } catch (e) { onToast(e.message, 'error'); }
    setLoading(false);
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/profile/2fa/verify`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ token: code }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBackupCodes(data.backupCodes);
      setStep(4);
    } catch (e) { onToast(e.message || 'Invalid code', 'error'); }
    setLoading(false);
  };

  const disableTwoFA = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/profile/2fa/disable`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ password: disablePassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSave({ ...user, twoFactorEnabled: false, twoFactorMethod: null });
      setShowDisableModal(false);
      onToast('2FA disabled', 'success');
    } catch (e) { onToast(e.message, 'error'); }
    setLoading(false);
  };

  const copyAll = () => { navigator.clipboard.writeText(backupCodes.join('\n')); onToast('Copied to clipboard', 'success'); };
  const downloadCodes = () => {
    const blob = new Blob([`KUN ProcureTrack - Backup Codes\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKeep these safe. Each code can only be used once.`], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'backup-codes.txt'; a.click();
  };

  if (user.twoFactorEnabled && step === 0) {
    return (
      <div>
        <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <CheckCircle size={24} color="#059669" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#065F46', fontSize: 15 }}>Two-Factor Authentication is Active</div>
            <div style={{ fontSize: 13, color: '#047857' }}>Method: {user.twoFactorMethod || 'Authenticator App'}</div>
          </div>
        </div>

        {backupCount !== null && (
          <div style={{ background: backupCount < 3 ? '#FEF3C7' : '#F9FAFB', border: `1px solid ${backupCount < 3 ? '#FDE68A' : '#E5E7EB'}`, borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
            {backupCount < 3 && <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><AlertTriangle size={16} color="#D97706" /><span style={{ fontWeight: 600, color: '#92400E', fontSize: 13 }}>Low backup codes — only {backupCount} remaining</span></div>}
            <div style={{ fontSize: 13, color: '#374151' }}>{backupCount} backup code{backupCount !== 1 ? 's' : ''} remaining</div>
          </div>
        )}

        <button onClick={() => setShowDisableModal(true)} style={btnDanger}><Lock size={14} /> Disable 2FA</button>

        {showDisableModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#0A1628' }}>Disable Two-Factor Auth</h3>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6B7280' }}>Enter your password to confirm disabling 2FA.</p>
              <input type="password" value={disablePassword} onChange={e => setDisablePassword(e.target.value)} placeholder="Current password" style={{ ...inputStyle, marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowDisableModal(false)} style={btnOutline}>Cancel</button>
                <button onClick={disableTwoFA} disabled={loading || !disablePassword} style={btnDanger}>
                  {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null} Disable 2FA
                </button>
              </div>
            </div>
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Setup wizard
  if (step === 0) return (
    <div>
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <Shield size={32} color="#0284C7" style={{ marginBottom: 12 }} />
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#0C4A6E' }}>Protect Your Account with 2FA</h3>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: '#075985' }}>Two-factor authentication adds an extra layer of security. Even if someone steals your password, they still can't access your account without your phone.</p>
      </div>
      <button onClick={() => setStep(1)} style={{ ...btnPrimary, background: '#B8960A' }}><Smartphone size={15} /> Enable Two-Factor Authentication</button>
    </div>
  );

  if (step === 1) return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Step 1 — Install an Authenticator App</h3>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151' }}>Download one of these authenticator apps on your phone:</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
        {[['Google Authenticator', '🔐', 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'],
          ['Microsoft Authenticator', '🛡️', 'https://www.microsoft.com/en-us/security/mobile-authenticator-app'],
          ['Authy', '🔑', 'https://authy.com/download/']].map(([name, emoji, url]) => (
          <a key={name} href={url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', border: '1px solid #E5E7EB', borderRadius: 10, textDecoration: 'none', color: '#374151', fontSize: 14, fontWeight: 500, background: '#fff' }}>
            <span style={{ fontSize: 20 }}>{emoji}</span>{name}<ExternalLink size={12} color="#9CA3AF" />
          </a>
        ))}
      </div>
      <button onClick={startSetup} disabled={loading} style={btnPrimary}>
        {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null} I have an app installed
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (step === 2) return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Step 2 — Scan QR Code</h3>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151' }}>Open your authenticator app and scan this QR code:</p>
      {qrData && <img src={qrData.qrCodeDataUrl} alt="QR Code" style={{ border: '1px solid #E5E7EB', borderRadius: 8, display: 'block', marginBottom: 20 }} />}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Can't scan? Enter this key manually:</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <code style={{ flex: 1, padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', letterSpacing: '0.1em', color: '#374151', wordBreak: 'break-all' }}>{qrData?.manualEntryKey}</code>
          <button onClick={() => { navigator.clipboard.writeText(qrData?.manualEntryKey || ''); onToast('Copied', 'success'); }} style={{ ...btnOutline, padding: '10px 14px' }}><Copy size={14} /></button>
        </div>
      </div>
      <button onClick={() => setStep(3)} style={btnPrimary}>Next <ChevronRight size={14} /></button>
    </div>
  );

  if (step === 3) return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Step 3 — Verify Code</h3>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151' }}>Enter the 6-digit code from your authenticator app:</p>
      <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6}
        placeholder="000000"
        style={{ ...inputStyle, fontSize: 28, letterSpacing: '0.3em', textAlign: 'center', maxWidth: 200, fontFamily: 'monospace', marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setStep(2)} style={btnOutline}>Back</button>
        <button onClick={verifyCode} disabled={loading || code.length !== 6} style={{ ...btnPrimary, opacity: code.length !== 6 ? 0.5 : 1 }}>
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />} Verify & Enable
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (step === 4) return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Step 4 — Save Backup Codes</h3>
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#991B1B', fontWeight: 600 }}>
        ⚠️ Save these codes now. They will only be shown ONCE. If you lose your phone, use these codes to access your account.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {backupCodes.map(c => (
          <code key={c} style={{ padding: '10px 14px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.1em', textAlign: 'center', color: '#0A1628', fontWeight: 700 }}>{c}</code>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={copyAll} style={btnOutline}><Copy size={14} /> Copy All</button>
        <button onClick={downloadCodes} style={btnOutline}><Download size={14} /> Download .txt</button>
        <button onClick={() => window.print()} style={btnOutline}><Printer size={14} /> Print</button>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
        <input type="checkbox" checked={savedCheck} onChange={e => setSavedCheck(e.target.checked)} style={{ width: 16, height: 16 }} />
        I have saved my backup codes in a safe place
      </label>
      <button onClick={() => { onSave({ ...user, twoFactorEnabled: true }); setStep(0); onToast('2FA enabled successfully!', 'success'); }}
        disabled={!savedCheck} style={{ ...btnPrimary, opacity: !savedCheck ? 0.5 : 1 }}>
        <Check size={14} /> Finish Setup
      </button>
    </div>
  );
}

// ── Tab: Notifications ────────────────────────────────────────────────────────
function NotificationsTab({ user, onToast }) {
  const defaultPrefs = {
    emailOnTaskAssigned: true, emailOnTaskOverdue: true, emailOnVendorStatusChange: true,
    emailOnPOApproval: true, emailOnDocumentExpiry: true, emailOnApprovalRequired: true,
    weeklyDigest: true,
    inAppOnTaskAssigned: true, inAppOnVendorStatus: true, inAppOnPOApproval: true, inAppOnDocumentExpiry: true,
  };
  const [prefs, setPrefs] = useState({ ...defaultPrefs, ...(user.notificationPrefs || {}) });
  const [savedIndicator, setSavedIndicator] = useState(false);
  const debounceRef = useRef(null);

  const handleToggle = (key, val) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await fetch(`${API}/profile/notifications`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(next) });
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      } catch { onToast('Failed to save', 'error'); }
    }, 1000);
  };

  const NotifRow = ({ label, desc, prefKey }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{desc}</div>}
      </div>
      <Toggle checked={!!prefs[prefKey]} onChange={v => handleToggle(prefKey, v)} />
    </div>
  );

  const SectionHead = ({ title }) => (
    <h4 style={{ margin: '24px 0 8px', fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
  );

  return (
    <div>
      {savedIndicator && <div style={{ color: '#22C55E', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>✓ Saved</div>}
      <SectionHead title="Email Notifications" />
      <NotifRow label="Task assigned to me" desc="Receive email when a task is assigned to you" prefKey="emailOnTaskAssigned" />
      <NotifRow label="Task overdue reminder" desc="Daily reminder for overdue tasks" prefKey="emailOnTaskOverdue" />
      <NotifRow label="Vendor status changed" desc="When a vendor is approved, rejected, or suspended" prefKey="emailOnVendorStatusChange" />
      <NotifRow label="PO approval required" desc="When a purchase order needs your approval" prefKey="emailOnPOApproval" />
      <NotifRow label="Document expiring" desc="Alerts for documents expiring soon" prefKey="emailOnDocumentExpiry" />
      <NotifRow label="New approval needed" desc="When you're in an approval chain" prefKey="emailOnApprovalRequired" />
      <NotifRow label="Weekly digest summary" desc="Receive a weekly summary of procurement activity" prefKey="weeklyDigest" />
      <SectionHead title="In-App Notifications" />
      <NotifRow label="Task assigned to me" prefKey="inAppOnTaskAssigned" />
      <NotifRow label="Vendor status changed" prefKey="inAppOnVendorStatus" />
      <NotifRow label="PO approval required" prefKey="inAppOnPOApproval" />
      <NotifRow label="Document expiring" prefKey="inAppOnDocumentExpiry" />
    </div>
  );
}

// ── Tab: Appearance ───────────────────────────────────────────────────────────
function AppearanceTab({ user, onSave, onToast }) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(user.preferredLanguage || 'en');
  const [timezone, setTimezone] = useState(user.timezone || 'Asia/Riyadh');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  const handleLangChange = async (newLang) => {
    setLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
    try {
      const res = await fetch(`${API}/profile/me`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ preferredLanguage: newLang }) });
      const data = await res.json();
      if (res.ok) { onSave(data); onToast('Language updated', 'success'); }
    } catch { onToast('Failed to save', 'error'); }
  };

  const handleTimezoneChange = async (tz) => {
    setTimezone(tz);
    try {
      const res = await fetch(`${API}/profile/me`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ timezone: tz }) });
      const data = await res.json();
      if (res.ok) { onSave(data); onToast('Timezone updated', 'success'); }
    } catch {}
  };

  return (
    <div>
      {/* Language */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Language</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          {[['en', '🇺🇸 English', 'English'], ['ar', '🇸🇦 عربي', 'Arabic']].map(([code, flag, name]) => (
            <button key={code} onClick={() => handleLangChange(code)}
              style={{ flex: 1, padding: '20px', border: `2px solid ${lang === code ? '#B8960A' : '#E5E7EB'}`, borderRadius: 12, background: lang === code ? '#FFFBEB' : '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
              <span style={{ fontSize: 28 }}>{flag.split(' ')[0]}</span>
              <span style={{ fontWeight: lang === code ? 700 : 500, color: lang === code ? '#B8960A' : '#374151' }}>{name}</span>
              {lang === code && <span style={{ fontSize: 11, color: '#B8960A', fontWeight: 600 }}>✓ Selected</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Theme</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          {[['light', '☀️', 'Light', false], ['dark', '🌙', 'Dark', true], ['system', '💻', 'System', true]].map(([id, emoji, name, coming]) => (
            <div key={id} style={{ flex: 1, padding: 16, border: `2px solid ${id === 'light' ? '#B8960A' : '#E5E7EB'}`, borderRadius: 12, background: id === 'light' ? '#FFFBEB' : '#F9FAFB', textAlign: 'center', position: 'relative', cursor: coming ? 'default' : 'pointer' }}>
              {coming && <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 10, background: '#F3F4F6', color: '#9CA3AF', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>Soon</div>}
              <div style={{ fontSize: 24, marginBottom: 6 }}>{emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: coming ? '#9CA3AF' : '#374151' }}>{name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timezone */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Timezone</h3>
        <select value={timezone} onChange={e => handleTimezoneChange(e.target.value)} style={{ ...inputStyle, maxWidth: 340 }}>
          {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
        </select>
      </div>

      {/* Date Format */}
      <div>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0A1628' }}>Date Format</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          {['DD/MM/YYYY', 'MM/DD/YYYY'].map(fmt => (
            <button key={fmt} onClick={() => setDateFormat(fmt)}
              style={{ padding: '10px 24px', border: `2px solid ${dateFormat === fmt ? '#B8960A' : '#E5E7EB'}`, borderRadius: 8, background: dateFormat === fmt ? '#FFFBEB' : '#fff', cursor: 'pointer', fontSize: 14, fontWeight: dateFormat === fmt ? 700 : 400, color: dateFormat === fmt ? '#B8960A' : '#374151' }}>
              {fmt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function ProfilePageInner() {
  const searchParams = useSearchParams();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    fetch(`${API}/profile/me`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = (updated) => {
    setUser(u => ({ ...u, ...updated }));
    // Sync to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...updated }));
    } catch {}
  };

  const onToast = (msg, type) => setToast({ msg, type });

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 size={32} color="#B8960A" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <div style={{ padding: 40, color: '#EF4444' }}>Failed to load profile.</div>;

  const tabContent = {
    profile: <ProfileTab user={user} onSave={handleSave} onToast={onToast} />,
    security: <SecurityTab user={user} onToast={onToast} />,
    '2fa': <TwoFATab user={user} onSave={handleSave} onToast={onToast} />,
    notifications: <NotificationsTab user={user} onToast={onToast} />,
    appearance: <AppearanceTab user={user} onSave={handleSave} onToast={onToast} />,
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '28px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0A1628' }}>Profile Settings</h1>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 14 }}>Manage your personal information, security, and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left nav */}
        <div style={{ width: 220, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 8, flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 8, border: 'none', background: activeTab === tab.id ? '#FEF3C7' : 'transparent', color: activeTab === tab.id ? '#B8960A' : '#374151', cursor: 'pointer', fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, textAlign: 'left', transition: 'all 0.15s' }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div style={{ flex: 1, minWidth: 320, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28 }}>
          {tabContent[activeTab]}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>}>
      <ProfilePageInner />
    </Suspense>
  );
}
