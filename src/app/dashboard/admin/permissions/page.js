"use client";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, RefreshCw, Info } from 'lucide-react';

const PERMISSIONS_DATA = {
  'Vendor Management': [
    { key: 'vendor.view', name: 'View Vendors', admin: true, manager: true, officer: true, vendor: false },
    { key: 'vendor.create', name: 'Create Vendor', admin: true, manager: true, officer: true, vendor: false },
    { key: 'vendor.approve', name: 'Approve / Reject Vendor', admin: true, manager: true, officer: false, vendor: false },
    { key: 'vendor.evaluate', name: 'Evaluate Vendor', admin: true, manager: true, officer: true, vendor: false },
    { key: 'vendor.delete', name: 'Delete Vendor', admin: true, manager: false, officer: false, vendor: false },
  ],
  'Purchase Orders': [
    { key: 'po.view', name: 'View Purchase Orders', admin: true, manager: true, officer: true, vendor: true },
    { key: 'po.create', name: 'Create Purchase Order', admin: true, manager: true, officer: true, vendor: false },
    { key: 'po.approve', name: 'Approve Purchase Order', admin: true, manager: true, officer: false, vendor: false },
    { key: 'po.cancel', name: 'Cancel Purchase Order', admin: true, manager: true, officer: false, vendor: false },
    { key: 'po.export', name: 'Export PO to PDF/Excel', admin: true, manager: true, officer: true, vendor: false },
  ],
  'RFQ / Quotations': [
    { key: 'rfq.view', name: 'View RFQs', admin: true, manager: true, officer: true, vendor: true },
    { key: 'rfq.create', name: 'Create RFQ', admin: true, manager: true, officer: true, vendor: false },
    { key: 'rfq.submit', name: 'Submit Quotation (Vendor)', admin: false, manager: false, officer: false, vendor: true },
    { key: 'rfq.award', name: 'Award RFQ', admin: true, manager: true, officer: false, vendor: false },
    { key: 'rfq.compare', name: 'Compare Quotations', admin: true, manager: true, officer: true, vendor: false },
  ],
  'Reports': [
    { key: 'reports.view', name: 'View Reports', admin: true, manager: true, officer: false, vendor: false },
    { key: 'reports.export', name: 'Export Reports', admin: true, manager: true, officer: false, vendor: false },
    { key: 'reports.schedule', name: 'Schedule Reports', admin: true, manager: false, officer: false, vendor: false },
  ],
  'User Management': [
    { key: 'users.view', name: 'View Users', admin: true, manager: false, officer: false, vendor: false },
    { key: 'users.create', name: 'Create / Invite Users', admin: true, manager: false, officer: false, vendor: false },
    { key: 'users.edit', name: 'Edit User Profiles', admin: true, manager: false, officer: false, vendor: false },
    { key: 'users.suspend', name: 'Suspend / Deactivate Users', admin: true, manager: false, officer: false, vendor: false },
    { key: 'users.resetpw', name: 'Reset User Passwords', admin: true, manager: false, officer: false, vendor: false },
  ],
  'Audit Logs': [
    { key: 'audit.view', name: 'View Audit Logs', admin: true, manager: false, officer: false, vendor: false },
    { key: 'audit.export', name: 'Export Audit Logs', admin: true, manager: false, officer: false, vendor: false },
  ],
  'System Settings': [
    { key: 'settings.branding', name: 'Branding Settings', admin: true, manager: false, officer: false, vendor: false },
    { key: 'settings.permissions', name: 'Permissions Matrix', admin: true, manager: false, officer: false, vendor: false },
    { key: 'settings.notifications', name: 'Notification Settings', admin: true, manager: true, officer: false, vendor: false },
  ],
  'Contracts': [
    { key: 'contracts.view', name: 'View Contracts', admin: true, manager: true, officer: true, vendor: true },
    { key: 'contracts.create', name: 'Create Contract', admin: true, manager: true, officer: false, vendor: false },
    { key: 'contracts.sign', name: 'Sign Contract', admin: true, manager: true, officer: false, vendor: true },
  ],
};

const ROLES = [
  { key: 'admin', label: 'Executive (Admin)', color: '#DC2626', bg: '#FEE2E2' },
  { key: 'manager', label: 'Proc. Manager', color: '#D97706', bg: '#FEF3C7' },
  { key: 'officer', label: 'Proc. Officer', color: '#2563EB', bg: '#DBEAFE' },
  { key: 'vendor', label: 'Vendor', color: '#059669', bg: '#D1FAE5' },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <button onClick={() => !disabled && onChange(!checked)} disabled={disabled}
      style={{ width: 40, height: 22, borderRadius: 11, background: checked ? '#22C55E' : '#D1D5DB', border: 'none', cursor: disabled ? 'default' : 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0, opacity: disabled ? 0.6 : 1 }}>
      <span style={{ position: 'absolute', top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

export default function PermissionsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Only admin column overrides are tracked; other roles are read-only
  const [overrides, setOverrides] = useState({});

  const getEffective = (key, role) => {
    if (role === 'admin' && overrides[key] !== undefined) return overrides[key];
    const module = Object.values(PERMISSIONS_DATA).flat().find(p => p.key === key);
    return module ? module[role] : false;
  };

  const toggleAdmin = (key, currentVal) => {
    setOverrides(prev => ({ ...prev, [key]: !currentVal }));
  };

  const resetDefaults = () => setOverrides({});

  const changedCount = Object.keys(overrides).length;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ padding: '24px 28px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0A1628' }}>Permissions Matrix</h1>
          <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: 14 }}>Role-based access control — Admin column is interactive</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {changedCount > 0 && (
            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              {changedCount} override{changedCount !== 1 ? 's' : ''}
            </span>
          )}
          <button onClick={resetDefaults} style={{ padding: '9px 16px', background: '#fff', color: '#374151', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
            <RefreshCw size={14} /> Reset to Defaults
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Info size={16} color="#2563EB" style={{ marginTop: 1, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: 13, color: '#1E40AF' }}>
          This matrix reflects the current role-based access enforced in the backend middleware. Only the <strong>Executive (Admin)</strong> column can be toggled here. Changes take effect at next system reload. Other roles are read-only — they are enforced by controller-level authorization.
        </p>
      </div>

      {/* Matrix Table */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#374151', minWidth: 260 }}>Permission</th>
              {ROLES.map(role => (
                <th key={role.key} style={{ padding: '14px 20px', textAlign: 'center', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  <span style={{ background: role.bg, color: role.color, borderRadius: 20, padding: '4px 12px', display: 'inline-block' }}>{role.label}</span>
                  {role.key === 'admin' && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Interactive</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(PERMISSIONS_DATA).map(([module, perms]) => (
              <React.Fragment key={module}>
                {/* Module header row */}
                <tr style={{ background: '#F1F5F9' }}>
                  <td colSpan={5} style={{ padding: '10px 20px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <Shield size={12} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                    {module}
                  </td>
                </tr>
                {/* Permission rows */}
                {perms.map((perm, idx) => (
                  <tr key={perm.key} style={{ borderBottom: '1px solid #F3F4F6', background: idx % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '12px 20px 12px 32px', fontSize: 13, color: '#374151' }}>{perm.name}</td>
                    {ROLES.map(role => {
                      const effective = getEffective(perm.key, role.key);
                      const isAdmin = role.key === 'admin';
                      return (
                        <td key={role.key} style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {isAdmin
                              ? <Toggle checked={effective} onChange={() => toggleAdmin(perm.key, effective)} disabled={false} />
                              : <Toggle checked={effective} onChange={() => {}} disabled={true} />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
          <div style={{ width: 40, height: 22, borderRadius: 11, background: '#22C55E', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 3, right: 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', display: 'block' }} />
          </div>
          Allowed
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
          <div style={{ width: 40, height: 22, borderRadius: 11, background: '#D1D5DB', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 3, left: 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', display: 'block' }} />
          </div>
          Not Allowed
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
          <Lock size={14} color="#9CA3AF" /> Read-only (backend enforced)
        </div>
      </div>
    </div>
  );
}
