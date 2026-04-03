"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lock, Settings, FileText, Bell, Monitor, Save, RefreshCw,
  ChevronRight, Loader2, CheckCircle, AlertTriangle, Info, Plus, X
} from 'lucide-react';

const API = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`;
function authHeaders() { return { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : ''}`, 'Content-Type': 'application/json' }; }

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: type === 'success' ? '#D1FAE5' : '#FEE2E2', color: type === 'success' ? '#065F46' : '#991B1B', padding: '12px 18px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 9999, fontSize: 14, fontWeight: 600 }}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}{msg}
    </div>
  );
}

const CATEGORIES = [
  { id: 'SECURITY', label: 'Security', icon: <Lock size={16} /> },
  { id: 'WORKFLOW', label: 'Workflow', icon: <Settings size={16} /> },
  { id: 'DOCUMENTS', label: 'Documents', icon: <FileText size={16} /> },
  { id: 'NOTIFICATIONS', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'SYSTEM', label: 'System', icon: <Monitor size={16} /> },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CURRENCIES = ['SAR', 'USD', 'EUR', 'GBP', 'AED'];
const LANGUAGES = [{ v: 'en', l: 'English' }, { v: 'ar', l: 'Arabic' }];
const TIMEZONES = ['Asia/Riyadh', 'Asia/Dubai', 'Africa/Cairo', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'UTC'];

function SettingRow({ setting, value, onChange }) {
  const isBool = value === 'true' || value === 'false';
  const suffix = {
    session_timeout_hours: 'hours', lockout_duration_minutes: 'minutes', password_expiry_days: 'days',
    inactivity_lockout_days: 'days', vendor_renewal_months: 'months', task_escalation_days: 'days',
    doc_alert_days_critical: 'days before expiry', doc_alert_days_warning: 'days before expiry',
    doc_alert_days_notice: 'days before expiry', weekly_report_hour: '(0–23)',
    file_upload_max_mb: 'MB', pagination_page_size: 'rows',
  }[setting.key];
  const prefix = { po_approval_threshold_low: 'SAR', po_approval_threshold_high: 'SAR' }[setting.key];

  const renderInput = () => {
    if (isBool) return (
      <button type="button" onClick={() => onChange(value === 'true' ? 'false' : 'true')}
        style={{ width: 44, height: 24, borderRadius: 12, background: value === 'true' ? '#22C55E' : '#D1D5DB', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 3, left: value === 'true' ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
      </button>
    );
    if (setting.key === 'default_currency') return (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}>
        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    );
    if (setting.key === 'default_language') return (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}>
        {LANGUAGES.map(l => <option key={l.v} value={l.v}>{l.l}</option>)}
      </select>
    );
    if (setting.key === 'default_timezone') return (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}>
        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
      </select>
    );
    if (setting.key === 'weekly_report_day') return (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }}>
        {DAYS_OF_WEEK.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
      </select>
    );
    if (setting.key === 'allowed_file_types') return <TagInput value={value} onChange={onChange} />;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {prefix && <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} min="0"
          style={{ width: 90, padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, textAlign: 'right' }} />
        {suffix && <span style={{ fontSize: 12, color: '#9CA3AF' }}>{suffix}</span>}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F3F4F6', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{formatKey(setting.key)}</div>
        {setting.description && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{setting.description}</div>}
        {setting.updatedBy && <div style={{ fontSize: 11, color: '#D1D5DB', marginTop: 3 }}>Last updated by {setting.updatedBy.name}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{renderInput()}</div>
    </div>
  );
}

function TagInput({ value, onChange }) {
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];
  const [input, setInput] = useState('');
  const add = () => { const v = input.trim().replace(/^\./, '').toLowerCase(); if (v && !tags.includes(v)) { onChange([...tags, v].join(',')); } setInput(''); };
  const remove = (tag) => onChange(tags.filter(t => t !== tag).join(','));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', maxWidth: 280 }}>
      {tags.map(t => (
        <span key={t} style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 20, padding: '3px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          {t}<button onClick={() => remove(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9CA3AF', lineHeight: 1 }}><X size={10} /></button>
        </span>
      ))}
      <div style={{ display: 'flex', gap: 4 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="add..." style={{ width: 60, padding: '3px 8px', border: '1px solid #D1D5DB', borderRadius: 20, fontSize: 12, outline: 'none' }} />
        <button onClick={add} style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><Plus size={12} /></button>
      </div>
    </div>
  );
}

function DocAlertPreview({ critical, warning, notice }) {
  const c = parseInt(critical) || 7;
  const w = parseInt(warning) || 30;
  const n = parseInt(notice) || 60;
  const max = Math.max(n + 10, 70);
  const pct = (v) => `${(v / max) * 100}%`;
  return (
    <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: 16, marginTop: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' }}>Alert Timeline Preview</div>
      <div style={{ position: 'relative', height: 20 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 4, background: '#E5E7EB', borderRadius: 2, transform: 'translateY(-50%)' }} />
        <div style={{ position: 'absolute', left: 0, width: pct(c), top: '50%', height: 4, background: '#EF4444', borderRadius: 2, transform: 'translateY(-50%)', transition: 'width 0.3s' }} />
        <div style={{ position: 'absolute', left: pct(c), width: `${((w - c) / max) * 100}%`, top: '50%', height: 4, background: '#F97316', transform: 'translateY(-50%)', transition: 'all 0.3s' }} />
        <div style={{ position: 'absolute', left: pct(w), width: `${((n - w) / max) * 100}%`, top: '50%', height: 4, background: '#EAB308', transform: 'translateY(-50%)', transition: 'all 0.3s' }} />
        <div style={{ position: 'absolute', left: pct(c), top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444', border: '2px solid #fff' }} />
        </div>
        <div style={{ position: 'absolute', left: pct(w), top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F97316', border: '2px solid #fff' }} />
        </div>
        <div style={{ position: 'absolute', left: pct(n), top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EAB308', border: '2px solid #fff' }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#EF4444' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />Critical ({c}d)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#F97316' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316', display: 'inline-block' }} />Warning ({w}d)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#EAB308' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EAB308', display: 'inline-block' }} />Notice ({n}d)</span>
        </div>
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>Expiry →</span>
      </div>
    </div>
  );
}

function formatKey(key) {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Po ', 'PO ').replace('Rfq ', 'RFQ ').replace('2fa', '2FA');
}

const DEFAULT_SETTINGS_FALLBACK = {
  session_timeout_hours: '12', max_login_attempts: '10', lockout_duration_minutes: '15',
  password_expiry_days: '90', require_2fa_admin: 'true', require_2fa_manager: 'true',
  inactivity_lockout_days: '60', po_approval_threshold_low: '50000', po_approval_threshold_high: '500000',
  rfq_min_vendors: '3', vendor_renewal_months: '6', task_escalation_days: '1',
  doc_alert_days_critical: '7', doc_alert_days_warning: '30', doc_alert_days_notice: '60',
  weekly_report_day: '1', weekly_report_hour: '8', daily_digest_enabled: 'true',
  system_name: 'KUN ProcureTrack', default_currency: 'SAR', default_language: 'en',
  default_timezone: 'Asia/Riyadh', pagination_page_size: '20', file_upload_max_mb: '5',
  allowed_file_types: 'pdf,jpg,jpeg,png,xlsx,docx',
};

export default function SystemSettingsPage() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeCategory, setActiveCategory] = useState('SECURITY');
  const [allSettings, setAllSettings] = useState([]);
  const [localValues, setLocalValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: authHeaders() });
      const data = await res.json();
      const settings = data.settings || [];
      setAllSettings(settings);
      const vals = {};
      settings.forEach(s => { vals[s.key] = s.value; });
      setLocalValues({ ...DEFAULT_SETTINGS_FALLBACK, ...vals });
    } catch { setLocalValues(DEFAULT_SETTINGS_FALLBACK); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const categorySettings = allSettings.filter(s => s.category === activeCategory);

  const handleChange = (key, value) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const catKeys = (allSettings.filter(s => s.category === activeCategory).map(s => s.key));
    const updates = catKeys.map(key => ({ key, value: localValues[key] ?? '' })).filter(u => u.value !== undefined);
    try {
      const res = await fetch(API, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(updates) });
      if (!res.ok) throw new Error('Save failed');
      setToast({ msg: 'Settings saved successfully', type: 'success' });
      fetchSettings();
    } catch { setToast({ msg: 'Failed to save settings', type: 'error' }); }
    setSaving(false);
  };

  const handleReset = async () => {
    const catKeys = allSettings.filter(s => s.category === activeCategory).map(s => s.key);
    const resetVals = {};
    catKeys.forEach(k => { if (DEFAULT_SETTINGS_FALLBACK[k]) resetVals[k] = DEFAULT_SETTINGS_FALLBACK[k]; });
    setLocalValues(prev => ({ ...prev, ...resetVals }));
  };

  const lastUpdated = allSettings.find(s => s.category === activeCategory && s.updatedBy);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '28px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>
          <span>Dashboard</span><ChevronRight size={12} /><span>Administration</span><ChevronRight size={12} /><span style={{ color: '#374151' }}>System Settings</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0A1628' }}>System Settings</h1>
        <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 14 }}>Configure global system behavior and security policies</p>
      </div>

      {/* Cache notice */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '10px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: '#1E40AF' }}>
        <Info size={14} style={{ flexShrink: 0 }} />
        Settings are cached for up to 5 minutes. Security changes may take up to 5 minutes to take effect across the system.
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Left sidebar */}
        <div style={{ width: 200, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 8, flexShrink: 0 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 8, border: 'none', background: activeCategory === cat.id ? '#FEF3C7' : 'transparent', color: activeCategory === cat.id ? '#B8960A' : '#374151', cursor: 'pointer', fontSize: 13, fontWeight: activeCategory === cat.id ? 700 : 500, textAlign: 'left', transition: 'all 0.15s' }}>
              {cat.icon}{cat.label}
            </button>
          ))}
        </div>

        {/* Right content */}
        <div style={{ flex: 1, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: 28 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Loader2 size={24} color="#B8960A" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#0A1628' }}>
                {CATEGORIES.find(c => c.id === activeCategory)?.label} Settings
              </h2>
              {lastUpdated && (
                <p style={{ margin: '0 0 20px', fontSize: 12, color: '#9CA3AF' }}>
                  Last updated by {lastUpdated.updatedBy?.name} on {new Date(lastUpdated.updatedAt).toLocaleDateString()}
                </p>
              )}

              {/* Settings rows */}
              {categorySettings.length === 0
                ? <p style={{ color: '#9CA3AF', fontSize: 14 }}>No settings found for this category.</p>
                : categorySettings.map(s => (
                    <SettingRow key={s.key} setting={s} value={localValues[s.key] ?? s.value} onChange={v => handleChange(s.key, v)} />
                  ))}

              {/* Document alert preview */}
              {activeCategory === 'DOCUMENTS' && (
                <DocAlertPreview
                  critical={localValues.doc_alert_days_critical}
                  warning={localValues.doc_alert_days_warning}
                  notice={localValues.doc_alert_days_notice}
                />
              )}

              {/* Save/Reset */}
              <div style={{ display: 'flex', gap: 12, marginTop: 28, paddingTop: 20, borderTop: '1px solid #F3F4F6' }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: '10px 24px', background: '#B8960A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                  Save Changes
                </button>
                <button onClick={handleReset}
                  style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={14} /> Reset to Defaults
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
