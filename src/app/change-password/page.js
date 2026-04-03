"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Eye, EyeOff, Check, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function passwordStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColor = ['', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A'];

function StrengthBar({ password }) {
  const score = passwordStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? strengthColor[score] : '#E5E7EB', transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: strengthColor[score], fontWeight: 600 }}>{strengthLabel[score]}</span>
    </div>
  );
}

function PasswordChecks({ password }) {
  const checks = [
    { met: password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { met: /[a-z]/.test(password), label: 'One lowercase letter' },
    { met: /[0-9]/.test(password), label: 'One number' },
    { met: /[^A-Za-z0-9]/.test(password), label: 'One special character' },
  ];
  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {checks.map(c => (
        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: c.met ? '#22C55E' : '#9CA3AF' }}>
          <Check size={12} color={c.met ? '#22C55E' : '#D1D5DB'} />
          {c.label}
        </div>
      ))}
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isForcedChange, setIsForcedChange] = useState(false);
  const [userName, setUserName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    if (!token) { router.replace('/login'); return; }
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || '');
        setIsForcedChange(!!user.mustChangePassword);
      } catch {}
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) { setError('Please enter your current (temporary) password.'); return; }
    if (passwordStrength(newPassword) < 3) { setError('New password is too weak. Please meet all requirements.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword === currentPassword) { setError('New password must be different from the current password.'); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password.');

      // Update stored user to clear mustChangePassword flag
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.mustChangePassword = false;
          localStorage.setItem('user', JSON.stringify(user));
        } catch {}
      }

      setSuccess(true);

      // Redirect to dashboard based on role after short delay
      setTimeout(() => {
        const userStr = localStorage.getItem('user');
        let roleId = 1;
        try { roleId = JSON.parse(userStr || '{}').roleId || 1; } catch {}
        if (roleId === 2) router.push('/dashboard/manager');
        else if (roleId === 3) router.push('/dashboard/officer');
        else if (roleId === 4) router.push('/vendor-dashboard');
        else router.push('/dashboard/executive');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const score = passwordStrength(newPassword);
  const isValid = currentPassword && score >= 3 && newPassword === confirmPassword;

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A1628 0%, #1A365D 50%, #0A1628 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>

      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: 80, left: 60, width: 160, height: 160, background: 'radial-gradient(circle, rgba(184,150,10,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: 80, right: 60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(184,150,10,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: 40, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>

        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #B8960A, #D4A820)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(184,150,10,0.4)' }}>
            <Key size={24} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: 0 }}>
            {isForcedChange ? 'Set New Password' : 'Change Password'}
          </h1>
          {userName && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 6 }}>Welcome back, {userName}</p>}
        </div>

        {/* Forced change notice */}
        {isForcedChange && (
          <div style={{ background: 'rgba(184,150,10,0.15)', border: '1px solid rgba(184,150,10,0.4)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={16} color="#B8960A" style={{ marginTop: 1, flexShrink: 0 }} />
            <p style={{ color: '#F0C040', fontSize: 13, margin: 0 }}>
              Your account requires a password change before you can continue. Please set a new secure password below.
            </p>
          </div>
        )}

        {/* Success state */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(34,197,94,0.15)', border: '2px solid #22C55E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Check size={28} color="#22C55E" />
            </div>
            <h2 style={{ color: '#22C55E', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Password Changed!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#FCA5A5', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertTriangle size={14} style={{ marginTop: 1, flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Current / Temporary Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
                {isForcedChange ? 'Temporary Password' : 'Current Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  style={{ width: '100%', padding: '13px 44px 13px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#B8960A'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Create a strong new password"
                  style={{ width: '100%', padding: '13px 44px 13px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#B8960A'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPassword && (
                <div>
                  <StrengthBar password={newPassword} />
                  <PasswordChecks password={newPassword} />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  style={{ width: '100%', padding: '13px 44px 13px 14px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${confirmPassword && newPassword !== confirmPassword ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 12, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => { if (newPassword === confirmPassword || !confirmPassword) e.target.style.borderColor = '#B8960A'; }}
                  onBlur={e => { e.target.style.borderColor = confirmPassword && newPassword !== confirmPassword ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.15)'; }} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ color: '#FCA5A5', fontSize: 12, marginTop: 6 }}>Passwords do not match.</p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword && (
                <p style={{ color: '#86EFAC', fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Passwords match</p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || !isValid}
              style={{ width: '100%', padding: '14px', background: isValid ? 'linear-gradient(135deg, #B8960A, #D4A820)' : 'rgba(255,255,255,0.1)', color: isValid ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: isValid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', boxShadow: isValid ? '0 8px 24px rgba(184,150,10,0.4)' : 'none' }}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={18} />}
              {loading ? 'Changing Password…' : 'Set New Password'}
            </button>

            {/* Skip if not forced */}
            {!isForcedChange && (
              <button type="button" onClick={() => router.back()}
                style={{ width: '100%', marginTop: 12, padding: '12px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                Cancel
              </button>
            )}
          </form>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
