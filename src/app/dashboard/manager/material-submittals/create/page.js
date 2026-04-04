"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function CreateSubmittalPage() {
  const router = useRouter();
  const [saving, setSaving]     = useState(false);
  const [vendors, setVendors]   = useState([]);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers]       = useState([]);
  const [form, setForm]         = useState({
    specSection:    '',
    materialType:   '',
    projectName:    '',
    vendorId:       '',
    contractId:     '',
    reviewerId:     '',
    requiredDate:   '',
    submissionDate: '',
    notes:          '',
  });
  const [errors, setErrors] = useState({});

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    // Load vendors, contracts, reviewers in parallel
    Promise.all([
      fetch(`${API_BASE}/api/vendors?status=APPROVED&pageSize=200`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.ok ? r.json() : { vendors: [] }),
      fetch(`${API_BASE}/api/contracts?status=ACTIVE&pageSize=200`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.ok ? r.json() : { contracts: [] }),
      fetch(`${API_BASE}/api/users?roleId=2,3&isActive=true`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.ok ? r.json() : []),
    ]).then(([v, c, u]) => {
      setVendors(v.vendors || v || []);
      setContracts(c.contracts || c || []);
      setUsers(Array.isArray(u) ? u : u.users || []);
    }).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.specSection.trim()) e.specSection = 'Required';
    if (!form.projectName.trim()) e.projectName = 'Required';
    if (!form.requiredDate) e.requiredDate = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        vendorId:    form.vendorId    ? parseInt(form.vendorId)   : undefined,
        contractId:  form.contractId  ? parseInt(form.contractId) : undefined,
        reviewerId:  form.reviewerId  ? parseInt(form.reviewerId) : undefined,
      };
      const res = await fetch(`${API_BASE}/api/submittals`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create');
      }
      const data = await res.json();
      router.push(`/dashboard/manager/material-submittals/${data.submittal?.id || ''}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/manager/material-submittals')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} /> Back to Submittals
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Material Submittal</h1>
            <p className="text-sm text-gray-500">A submittal number will be auto-assigned</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Core info */}
          <div className="card card-body space-y-4">
            <h3 className="font-semibold text-gray-800">Submittal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Spec Section <span className="text-red-500">*</span></label>
                <input
                  className={`form-input ${errors.specSection ? 'border-red-400' : ''}`}
                  placeholder="e.g. 03300 - Ready-Mix Concrete"
                  value={form.specSection}
                  onChange={set('specSection')}
                />
                {errors.specSection && <p className="text-xs text-red-500 mt-1">{errors.specSection}</p>}
              </div>
              <div>
                <label className="form-label">Material Type</label>
                <input
                  className="form-input"
                  placeholder="e.g. Structural, Finishing, MEP…"
                  value={form.materialType}
                  onChange={set('materialType')}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Project Name <span className="text-red-500">*</span></label>
              <input
                className={`form-input ${errors.projectName ? 'border-red-400' : ''}`}
                placeholder="e.g. Tower B Construction"
                value={form.projectName}
                onChange={set('projectName')}
              />
              {errors.projectName && <p className="text-xs text-red-500 mt-1">{errors.projectName}</p>}
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea
                className="form-input min-h-[80px]"
                placeholder="Additional notes or instructions…"
                value={form.notes}
                onChange={set('notes')}
              />
            </div>
          </div>

          {/* Parties */}
          <div className="card card-body space-y-4">
            <h3 className="font-semibold text-gray-800">Parties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Vendor</label>
                <select className="form-input" value={form.vendorId} onChange={set('vendorId')}>
                  <option value="">— Select vendor —</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.companyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Contract</label>
                <select className="form-input" value={form.contractId} onChange={set('contractId')}>
                  <option value="">— Select contract —</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>{c.contractNumber} {c.title ? `— ${c.title}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Assigned Reviewer</label>
                <select className="form-input" value={form.reviewerId} onChange={set('reviewerId')}>
                  <option value="">— Assign reviewer —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="card card-body space-y-4">
            <h3 className="font-semibold text-gray-800">Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Submission Date</label>
                <input type="date" className="form-input" value={form.submissionDate} onChange={set('submissionDate')} />
              </div>
              <div>
                <label className="form-label">Required Approval Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className={`form-input ${errors.requiredDate ? 'border-red-400' : ''}`}
                  value={form.requiredDate}
                  onChange={set('requiredDate')}
                />
                {errors.requiredDate && <p className="text-xs text-red-500 mt-1">{errors.requiredDate}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
              Create Submittal
            </button>
          </div>
        </form>
      </div>
    </ResponsiveLayout>
  );
}
