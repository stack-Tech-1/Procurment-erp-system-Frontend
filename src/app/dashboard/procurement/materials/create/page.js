"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, RefreshCw } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const CSI_DIVISIONS = [
  '01 General Requirements', '03 Concrete', '04 Masonry', '05 Metals',
  '06 Wood & Plastics', '07 Thermal & Moisture', '08 Openings', '09 Finishes',
  '10 Specialties', '11 Equipment', '21 Fire Suppression', '22 Plumbing',
  '23 HVAC', '25 Integrated Automation', '26 Electrical', '27 Communications',
  '28 Electronic Safety', '31 Earthwork', '32 Exterior Improvements', '33 Utilities',
];

const MATERIAL_TYPES = ['Concrete', 'Steel', 'Finishes', 'MEP', 'Furniture', 'General Supplies', 'Chemicals', 'Glass', 'Wood', 'Other'];
const UNITS = ['SQM', 'CBM', 'm', 'm²', 'm³', 'KG', 'Ton', 'Piece', 'Set', 'L', 'Roll', 'Sheet', 'Other'];
const CURRENCIES = ['SAR', 'USD', 'EUR', 'AED', 'GBP'];

export default function CreateMaterialPage() {
  const router = useRouter();
  const imageRef = useRef();

  const [form, setForm] = useState({
    csiDivision: '',
    csiCode: '',
    materialName: '',
    materialNameAr: '',
    materialType: '',
    unit: '',
    standardPrice: '',
    currency: 'SAR',
    defaultVendorId: '',
    specs: '',
    notes: '',
  });
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [vendors, setVendors]       = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]         = useState({});
  const [toast, setToast]           = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetch(`${API}/api/vendors?status=APPROVED&limit=200`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setVendors(d.data || d || []); })
      .catch(() => {});
  }, []);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!form.materialName.trim()) e.materialName = 'Material name is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') body.append(k, v); });
      if (imageFile) body.append('image', imageFile);

      const r = await fetch(`${API}/api/materials`, { method: 'POST', credentials: 'include', body });
      if (r.ok) {
        router.push('/dashboard/procurement/materials');
      } else {
        const d = await r.json();
        showToast(d.error || 'Failed to create material');
      }
    } catch (err) {
      showToast('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#B8960A] focus:border-[#B8960A] outline-none transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  return (
    <ResponsiveLayout>
      <div className="p-4 md:p-6 min-h-screen bg-gray-50">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#0A1628] text-white'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-[#0A1628]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0A1628]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Add New Material
            </h1>
            <p className="text-sm text-gray-500">Create a new CSI material record in the database</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">

          {/* Section 1 — Material Identity */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-[#0A1628] mb-4">Material Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">CSI Division</label>
                <select value={form.csiDivision} onChange={e => set('csiDivision', e.target.value)}
                  className={inputCls('csiDivision')}>
                  <option value="">Select CSI Division...</option>
                  {CSI_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">CSI Code</label>
                <input type="text" value={form.csiCode} onChange={e => set('csiCode', e.target.value)}
                  placeholder="e.g. 03 30 00"
                  className={inputCls('csiCode')} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Material Name (English) *</label>
                <input type="text" value={form.materialName} onChange={e => set('materialName', e.target.value)}
                  placeholder="e.g. Ready Mix Concrete C30"
                  className={inputCls('materialName')} />
                {errors.materialName && <p className="text-xs text-red-500 mt-0.5">{errors.materialName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">اسم المادة (Arabic — optional)</label>
                <input type="text" dir="rtl" value={form.materialNameAr} onChange={e => set('materialNameAr', e.target.value)}
                  placeholder="أدخل اسم المادة بالعربية"
                  className={`${inputCls('materialNameAr')} text-right`} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Material Type</label>
                <select value={form.materialType} onChange={e => set('materialType', e.target.value)}
                  className={inputCls('materialType')}>
                  <option value="">Select type...</option>
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Unit of Measure</label>
                <select value={form.unit} onChange={e => set('unit', e.target.value)}
                  className={inputCls('unit')}>
                  <option value="">Select unit...</option>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2 — Pricing Reference */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-[#0A1628] mb-4">Pricing Reference <span className="text-gray-400 font-normal">(optional)</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Standard Unit Price</label>
                <input type="number" step="0.01" min="0" value={form.standardPrice}
                  onChange={e => set('standardPrice', e.target.value)}
                  placeholder="0.00"
                  className={inputCls('standardPrice')} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Currency</label>
                <select value={form.currency} onChange={e => set('currency', e.target.value)}
                  className={inputCls('currency')}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Default Vendor</label>
                <select value={form.defaultVendorId} onChange={e => set('defaultVendorId', e.target.value)}
                  className={inputCls('defaultVendorId')}>
                  <option value="">None</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.companyLegalName}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3 — Specifications */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-[#0A1628] mb-4">Specifications</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Specs / Description</label>
                <textarea value={form.specs} onChange={e => set('specs', e.target.value)}
                  rows={4} placeholder="Technical specifications, standards, material properties..."
                  className={`${inputCls('specs')} resize-none`} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  rows={2} placeholder="Internal notes or procurement remarks..."
                  className={`${inputCls('notes')} resize-none`} />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Material Image <span className="text-gray-400">(optional)</span></label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="preview" className="w-32 h-32 object-cover rounded-xl border border-gray-200" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => imageRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#B8960A] hover:text-[#B8960A] transition-colors">
                    <Upload size={20} />
                    <span className="text-xs">Upload</span>
                  </button>
                )}
                <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 bg-[#0A1628] text-white rounded-xl text-sm font-bold hover:bg-[#1a2e4a] disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {submitting ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : 'Save Material'}
            </button>
          </div>
        </form>
      </div>
    </ResponsiveLayout>
  );
}
