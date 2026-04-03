"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Download, RefreshCw, ChevronDown, ChevronRight, Loader2, Filter, X, Monitor, Globe } from 'lucide-react';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

function getActionColor(action) {
  if (!action) return { bg: '#F3F4F6', text: '#374151' };
  const a = action.toUpperCase();
  if (a.includes('LOGIN') || a.includes('LOGOUT')) return { bg: '#DBEAFE', text: '#1E40AF' };
  if (a.includes('CREATED') || a.includes('REGISTERED')) return { bg: '#D1FAE5', text: '#065F46' };
  if (a.includes('CHANGED') || a.includes('UPDATED') || a.includes('EDITED')) return { bg: '#FEF3C7', text: '#92400E' };
  if (a.includes('DEACTIVATED') || a.includes('DELETED') || a.includes('REMOVED')) return { bg: '#FEE2E2', text: '#991B1B' };
  if (a.includes('APPROVED') || a.includes('AWARDED')) return { bg: '#FFFBEB', text: '#B8960A', border: '1px solid #B8960A' };
  if (a.includes('2FA') || a.includes('PASSWORD')) return { bg: '#F3E8FF', text: '#6D28D9' };
  if (a.includes('SUSPENDED') || a.includes('LOCKED')) return { bg: '#FEE2E2', text: '#991B1B' };
  if (a.includes('AUTO_')) return { bg: '#F1F5F9', text: '#475569' };
  return { bg: '#F3F4F6', text: '#374151' };
}

function getModuleColor(module) {
  const map = {
    AUTH: { bg: '#DBEAFE', text: '#1E40AF' },
    VENDOR_MANAGEMENT: { bg: '#D1FAE5', text: '#065F46' },
    PURCHASE_ORDERS: { bg: '#FEF3C7', text: '#92400E' },
    RFQ: { bg: '#F3E8FF', text: '#6D28D9' },
    USER_MANAGEMENT: { bg: '#FEE2E2', text: '#991B1B' },
    REPORTS: { bg: '#E0F2FE', text: '#0369A1' },
    SYSTEM: { bg: '#F1F5F9', text: '#475569' },
    CONTRACTS: { bg: '#ECFDF5', text: '#047857' },
  };
  return map[module] || { bg: '#F3F4F6', text: '#374151' };
}

function Badge({ label, colors }) {
  return (
    <span style={{ background: colors.bg, color: colors.text, border: colors.border || 'none', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
  );
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function JsonDiff({ oldValues, newValues }) {
  if (!oldValues && !newValues) return <span style={{ color: '#9CA3AF', fontSize: 12 }}>No diff available</span>;

  const allKeys = new Set([...Object.keys(oldValues || {}), ...Object.keys(newValues || {})]);
  const changedKeys = new Set();
  allKeys.forEach(k => {
    if (JSON.stringify((oldValues || {})[k]) !== JSON.stringify((newValues || {})[k])) {
      changedKeys.add(k);
    }
  });

  const renderVal = (v) => {
    if (v === undefined || v === null) return <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>null</span>;
    if (typeof v === 'boolean') return <span style={{ color: v ? '#22C55E' : '#EF4444' }}>{String(v)}</span>;
    return <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>Before</div>
        <div style={{ background: '#FEF2F2', borderRadius: 8, padding: 12, fontSize: 12, fontFamily: 'monospace' }}>
          {oldValues ? [...allKeys].map(k => (
            <div key={k} style={{ padding: '3px 0', background: changedKeys.has(k) ? 'rgba(239,68,68,0.1)' : 'transparent', borderRadius: 4, paddingLeft: changedKeys.has(k) ? 4 : 0 }}>
              <span style={{ color: '#6B7280' }}>{k}: </span>{renderVal((oldValues || {})[k])}
            </div>
          )) : <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No previous data</span>}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 8 }}>After</div>
        <div style={{ background: '#F0FDF4', borderRadius: 8, padding: 12, fontSize: 12, fontFamily: 'monospace' }}>
          {newValues ? [...allKeys].map(k => (
            <div key={k} style={{ padding: '3px 0', background: changedKeys.has(k) ? 'rgba(34,197,94,0.1)' : 'transparent', borderRadius: 4, paddingLeft: changedKeys.has(k) ? 4 : 0 }}>
              <span style={{ color: '#6B7280' }}>{k}: </span>{renderVal((newValues || {})[k])}
            </div>
          )) : <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No new data</span>}
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', background: '#fff' };
const selectStyle = { ...inputStyle, cursor: 'pointer' };

const MODULES = ['AUTH', 'VENDOR_MANAGEMENT', 'PURCHASE_ORDERS', 'RFQ', 'USER_MANAGEMENT', 'REPORTS', 'SYSTEM', 'CONTRACTS'];
const ACTIONS = ['LOGIN', 'LOGOUT', 'USER_CREATED', 'USER_DEACTIVATED', 'USER_SUSPENDED', 'VENDOR_CREATED', 'VENDOR_STATUS_CHANGED', 'PO_CREATED', 'PO_APPROVED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_BY_ADMIN', 'ROLE_CHANGED', '2FA_TOGGLED', 'AUTO_DEACTIVATED'];

export default function AuditLogPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', action: '', module: '', dateFrom: '', dateTo: '', page: 1, pageSize: 50 });
  const [expandedRow, setExpandedRow] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('authToken') || '');
  }, []);

  const buildParams = useCallback((overrides = {}) => {
    const f = { ...filters, ...overrides };
    const p = new URLSearchParams();
    if (f.search) p.set('userId', f.search); // will match user search
    if (f.action) p.set('action', f.action);
    if (f.module) p.set('module', f.module);
    if (f.dateFrom) p.set('dateFrom', f.dateFrom);
    if (f.dateTo) p.set('dateTo', f.dateTo);
    p.set('page', f.page);
    p.set('pageSize', f.pageSize);
    return p.toString();
  }, [filters]);

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/audit-logs?${buildParams()}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [token, buildParams]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit-logs/export?${buildParams()}`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'audit-log-export.xlsx'; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const toggleRow = (id) => setExpandedRow(prev => prev === id ? null : id);

  const btnOutline = { padding: '9px 14px', background: '#fff', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500 };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '24px 28px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0A1628' }}>Audit Log</h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 14 }}>{total.toLocaleString()} entries</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnOutline} onClick={fetchLogs}><RefreshCw size={14} /> Refresh</button>
          <button style={btnOutline} onClick={handleExport}><Download size={14} /> Export Excel</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input value={filters.search} onChange={e => setFilter('search', e.target.value)} placeholder="Search by user ID..."
            style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <select style={{ ...selectStyle, flex: '0 1 180px', minWidth: 160 }} value={filters.action} onChange={e => setFilter('action', e.target.value)}>
          <option value="">All Actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select style={{ ...selectStyle, flex: '0 1 170px', minWidth: 150 }} value={filters.module} onChange={e => setFilter('module', e.target.value)}>
          <option value="">All Modules</option>
          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="date" value={filters.dateFrom} onChange={e => setFilter('dateFrom', e.target.value)}
          style={{ ...inputStyle, flex: '0 1 150px', minWidth: 130 }} />
        <input type="date" value={filters.dateTo} onChange={e => setFilter('dateTo', e.target.value)}
          style={{ ...inputStyle, flex: '0 1 150px', minWidth: 130 }} />
        <button onClick={() => setFilters({ search: '', action: '', module: '', dateFrom: '', dateTo: '', page: 1, pageSize: 50 })}
          style={{ ...btnOutline, padding: '9px 12px' }}><X size={14} /></button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ width: 28 }} />
              {['Timestamp', 'User', 'Action', 'Module', 'Entity', 'IP Address', 'Device'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline' }} /></td></tr>
              : logs.length === 0
              ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>No audit entries found.</td></tr>
              : logs.map(log => (
                <React.Fragment key={log.id}>
                  <tr onClick={() => toggleRow(log.id)}
                    style={{ borderBottom: expandedRow === log.id ? 'none' : '1px solid #F3F4F6', cursor: 'pointer', background: expandedRow === log.id ? '#F8FAFC' : '#fff', transition: 'background 0.1s' }}
                    onMouseEnter={e => { if (expandedRow !== log.id) e.currentTarget.style.background = '#F9FAFB'; }} onMouseLeave={e => { if (expandedRow !== log.id) e.currentTarget.style.background = '#fff'; }}>
                    <td style={{ padding: '10px 8px 10px 14px', textAlign: 'center' }}>
                      {expandedRow === log.id ? <ChevronDown size={14} color="#6B7280" /> : <ChevronRight size={14} color="#9CA3AF" />}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>{formatDateTime(log.createdAt)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {log.user ? <>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{log.user.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{log.user.email}</div>
                      </> : <span style={{ color: '#9CA3AF', fontSize: 12 }}>System</span>}
                    </td>
                    <td style={{ padding: '10px 14px' }}><Badge label={log.action || '—'} colors={getActionColor(log.action)} /></td>
                    <td style={{ padding: '10px 14px' }}>
                      {log.module ? <Badge label={log.module} colors={getModuleColor(log.module)} /> : <span style={{ color: '#9CA3AF', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280' }}>
                      {log.entityType ? <span>{log.entityType} {log.entityId ? `#${log.entityId}` : ''}</span> : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {log.ipAddress
                        ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={12} color="#9CA3AF" /><span style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace' }}>{log.ipAddress}</span></div>
                        : <span style={{ color: '#9CA3AF', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {log.userAgent
                        ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Monitor size={12} color="#9CA3AF" />
                            <span style={{ fontSize: 11, color: '#6B7280', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }} title={log.userAgent}>
                              {log.userAgent.includes('Chrome') ? 'Chrome' : log.userAgent.includes('Firefox') ? 'Firefox' : log.userAgent.includes('Safari') ? 'Safari' : log.userAgent.slice(0, 20)}
                            </span>
                          </div>
                        : <span style={{ color: '#9CA3AF', fontSize: 12 }}>—</span>}
                    </td>
                  </tr>
                  {/* Expanded row — JSON diff */}
                  {expandedRow === log.id && (
                    <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td colSpan={8} style={{ padding: '0 20px 20px 48px', background: '#F8FAFC' }}>
                        <div style={{ paddingTop: 16 }}>
                          {(log.oldValues || log.newValues)
                            ? <JsonDiff oldValues={log.oldValues} newValues={log.newValues} />
                            : <div style={{ color: '#9CA3AF', fontSize: 13 }}>No data diff recorded for this action.</div>}
                          {log.userAgent && (
                            <div style={{ marginTop: 12, fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', background: '#F1F5F9', borderRadius: 6, padding: '6px 10px', wordBreak: 'break-all' }}>
                              User-Agent: {log.userAgent}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>

        {/* Pagination */}
        {total > filters.pageSize && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#6B7280' }}>Showing {((filters.page - 1) * filters.pageSize) + 1}–{Math.min(filters.page * filters.pageSize, total)} of {total.toLocaleString()}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setFilter('page', Math.max(1, filters.page - 1))} disabled={filters.page === 1}
                style={{ ...btnOutline, padding: '6px 12px', opacity: filters.page === 1 ? 0.4 : 1 }}>← Prev</button>
              <button onClick={() => setFilter('page', filters.page + 1)} disabled={filters.page * filters.pageSize >= total}
                style={{ ...btnOutline, padding: '6px 12px', opacity: filters.page * filters.pageSize >= total ? 0.4 : 1 }}>Next →</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
