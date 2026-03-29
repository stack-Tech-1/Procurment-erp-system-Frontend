"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, Save, Send, Plus, Trash2, FileText, Building,
  Package, AlertTriangle, Search, X,
  ChevronDown, CheckCircle
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const UNITS = ['SQM', 'CBM', 'Piece', 'Ton', 'm', 'KG', 'L', 'Set', 'LS', 'No.'];
const CURRENCIES = ['SAR', 'USD', 'EUR'];

const emptyItem = () => ({
  _key: Math.random().toString(36).slice(2),
  description: '',
  csiCode: '',
  quantity: '',
  unit: 'Piece',
  unitPrice: '',
  totalPrice: 0,
  costCode: '',
});

export default function CreatePurchaseOrderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preRfqId = searchParams.get('rfqId');

  const [activeTab, setActiveTab] = useState('details'); // details | items | review
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Lookup data
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [rfqSearch, setRfqSearch] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showRfqDropdown, setShowRfqDropdown] = useState(false);

  // Form state
  const [form, setForm] = useState({
    projectName: '',
    vendorId: '',
    vendorName: '',
    vendorClass: '',
    rfqId: preRfqId || '',
    rfqNumber: '',
    currency: 'SAR',
    requiredDate: '',
    deliveryLocation: '',
    paymentTerms: '',
    warrantyPeriod: '',
    notes: '',
  });
  const [items, setItems] = useState([emptyItem()]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, rRes] = await Promise.all([
          fetch(`${API_BASE}/api/vendors`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/rfqs`, { headers: authHeaders() }),
        ]);
        if (vRes.ok) {
          const vData = await vRes.json();
          setVendors(Array.isArray(vData) ? vData : (vData.data || []));
        }
        if (rRes.ok) {
          const rData = await rRes.json();
          setRfqs(Array.isArray(rData) ? rData : (rData.data || []));
        }
      } catch (e) {
        console.error('Failed to load lookup data', e);
      }
    };
    load();
  }, []);

  // ── Item helpers ───────────────────────────────────────────────────────────
  const updateItem = (key, field, value) => {
    setItems(prev => prev.map(item => {
      if (item._key !== key) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
        const price = parseFloat(field === 'unitPrice' ? value : updated.unitPrice) || 0;
        updated.totalPrice = qty * price;
      }
      return updated;
    }));
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (key) => setItems(prev => prev.filter(i => i._key !== key));

  const totalValue = items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.projectName.trim()) e.projectName = 'Project name is required';
    if (!form.vendorId) e.vendorId = 'Vendor is required';
    const validItems = items.filter(i => i.description.trim() && parseFloat(i.quantity) > 0 && parseFloat(i.unitPrice) >= 0);
    if (validItems.length === 0) e.items = 'At least one item with description, quantity and unit price is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submit = async (submitForApproval = false) => {
    if (!validate()) { setActiveTab('details'); return; }
    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        projectName: form.projectName,
        vendorId: parseInt(form.vendorId),
        rfqId: form.rfqId ? parseInt(form.rfqId) : null,
        currency: form.currency,
        requiredDate: form.requiredDate || null,
        deliveryLocation: form.deliveryLocation,
        paymentTerms: form.paymentTerms,
        warrantyPeriod: form.warrantyPeriod,
        notes: form.notes,
        items: items
          .filter(i => i.description.trim())
          .map(i => ({
            description: i.description,
            csiCode: i.csiCode,
            quantity: parseFloat(i.quantity),
            unit: i.unit,
            unitPrice: parseFloat(i.unitPrice),
            costCode: i.costCode,
          })),
      };

      const res = await fetch(`${API_BASE}/api/purchase-orders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) {
        const err = await res.json();
        setApiError(err.error || 'Failed to create purchase order');
        return;
      }

      const created = await res.json();

      // If submit for approval, immediately patch status
      if (submitForApproval) {
        await fetch(`${API_BASE}/api/purchase-orders/${created.id}/status`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ status: 'PENDING_APPROVAL' }),
        });
      }

      router.push('/dashboard/procurement/purchase-orders');
    } catch (e) {
      setApiError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filtered lookups ───────────────────────────────────────────────────────
  const filteredVendors = vendors.filter(v =>
    (v.companyLegalName || '').toLowerCase().includes(vendorSearch.toLowerCase())
  ).slice(0, 8);

  const filteredRfqs = rfqs.filter(r =>
    (r.rfqNumber || '').toLowerCase().includes(rfqSearch.toLowerCase()) ||
    (r.projectName || '').toLowerCase().includes(rfqSearch.toLowerCase())
  ).slice(0, 8);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'details', label: 'PO Details', icon: FileText },
    { id: 'items', label: 'Line Items', icon: Package },
    { id: 'review', label: 'Review', icon: CheckCircle },
  ];

  return (
    <ResponsiveLayout>
      <div className="max-w-5xl mx-auto w-full p-4 lg:p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/dashboard/procurement/purchase-orders')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0A1628' }}>New Purchase Order</h1>
            <p className="text-sm text-gray-500">Fill in the details to create a purchase order</p>
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {apiError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-yellow-600 text-yellow-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === id ? { borderColor: '#B8960A', color: '#B8960A' } : {}}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Details ──────────────────────────────────────────────── */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
            <h2 className="font-semibold text-gray-800 text-base border-b pb-3">PO Details</h2>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 ${errors.projectName ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="e.g. Tower B Construction"
                value={form.projectName}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              />
              {errors.projectName && <p className="text-xs text-red-500 mt-1">{errors.projectName}</p>}
            </div>

            {/* Vendor */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <div
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${errors.vendorId ? 'border-red-400' : 'border-gray-300'}`}
                onClick={() => { setShowVendorDropdown(true); setVendorSearch(''); }}
              >
                <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className={`text-sm flex-1 ${form.vendorId ? 'text-gray-900' : 'text-gray-400'}`}>
                  {form.vendorName || 'Select vendor…'}
                </span>
                {form.vendorId
                  ? <X className="w-4 h-4 text-gray-400" onClick={(e) => { e.stopPropagation(); setForm({ ...form, vendorId: '', vendorName: '', vendorClass: '' }); }} />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
              {showVendorDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2 border-b">
                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        autoFocus
                        className="flex-1 text-sm bg-transparent outline-none"
                        placeholder="Search vendors…"
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredVendors.length === 0
                      ? <p className="text-xs text-gray-400 text-center py-4">No vendors found</p>
                      : filteredVendors.map(v => (
                        <button
                          key={v.id}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => {
                            setForm({ ...form, vendorId: String(v.id), vendorName: v.companyLegalName, vendorClass: v.vendorClass || '' });
                            setShowVendorDropdown(false);
                          }}
                        >
                          <span className="text-sm text-gray-800">{v.companyLegalName}</span>
                          {v.vendorClass && (
                            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Class {v.vendorClass}</span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}
              {showVendorDropdown && (
                <div className="fixed inset-0 z-10" onClick={() => setShowVendorDropdown(false)} />
              )}
              {errors.vendorId && <p className="text-xs text-red-500 mt-1">{errors.vendorId}</p>}
            </div>

            {/* Link to RFQ */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to RFQ <span className="text-gray-400 font-normal">(optional)</span></label>
              <div
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                onClick={() => { setShowRfqDropdown(true); setRfqSearch(''); }}
              >
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className={`text-sm flex-1 ${form.rfqId ? 'text-gray-900' : 'text-gray-400'}`}>
                  {form.rfqNumber || 'Select RFQ…'}
                </span>
                {form.rfqId
                  ? <X className="w-4 h-4 text-gray-400" onClick={(e) => { e.stopPropagation(); setForm({ ...form, rfqId: '', rfqNumber: '' }); }} />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
              {showRfqDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2 border-b">
                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        autoFocus
                        className="flex-1 text-sm bg-transparent outline-none"
                        placeholder="Search RFQ number or project…"
                        value={rfqSearch}
                        onChange={(e) => setRfqSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredRfqs.length === 0
                      ? <p className="text-xs text-gray-400 text-center py-4">No RFQs found</p>
                      : filteredRfqs.map(r => (
                        <button
                          key={r.id}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50"
                          onClick={() => {
                            setForm({ ...form, rfqId: String(r.id), rfqNumber: r.rfqNumber });
                            setShowRfqDropdown(false);
                          }}
                        >
                          <div className="text-sm font-medium text-gray-800">{r.rfqNumber}</div>
                          <div className="text-xs text-gray-500">{r.projectName}</div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
              {showRfqDropdown && (
                <div className="fixed inset-0 z-10" onClick={() => setShowRfqDropdown(false)} />
              )}
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Delivery Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                  value={form.requiredDate}
                  onChange={(e) => setForm({ ...form, requiredDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g. Site B, Jeddah"
                  value={form.deliveryLocation}
                  onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g. 30% advance, 70% on delivery"
                  value={form.paymentTerms}
                  onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Period</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g. 12 months"
                  value={form.warrantyPeriod}
                  onChange={(e) => setForm({ ...form, warrantyPeriod: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none resize-none"
                placeholder="Any internal notes for this PO…"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                className="px-5 py-2 text-sm text-white rounded-lg font-medium"
                style={{ backgroundColor: '#B8960A' }}
                onClick={() => setActiveTab('items')}
              >
                Next: Line Items →
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Items ────────────────────────────────────────────────── */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-5">
              <h2 className="font-semibold text-gray-800">Line Items</h2>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white rounded-lg"
                style={{ backgroundColor: '#B8960A' }}
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {errors.items && (
              <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertTriangle className="w-4 h-4" /> {errors.items}
              </div>
            )}

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={item._key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Item #{idx + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item._key)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                    <div className="lg:col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Description *</label>
                      <input
                        type="text"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg outline-none"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(item._key, 'description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">CSI Code</label>
                      <input
                        type="text"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg outline-none"
                        placeholder="Optional"
                        value={item.csiCode}
                        onChange={(e) => updateItem(item._key, 'csiCode', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Qty *</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg outline-none"
                        value={item.quantity}
                        onChange={(e) => updateItem(item._key, 'quantity', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Unit</label>
                      <select
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg outline-none"
                        value={item.unit}
                        onChange={(e) => updateItem(item._key, 'unit', e.target.value)}
                      >
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Unit Price *</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg outline-none"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item._key, 'unitPrice', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Cost Code:</label>
                      <input
                        type="text"
                        className="px-2 py-1 text-xs border border-gray-300 rounded outline-none w-32"
                        placeholder="Optional"
                        value={item.costCode}
                        onChange={(e) => updateItem(item._key, 'costCode', e.target.value)}
                      />
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      Total: {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {form.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Running Total */}
            <div className="mt-5 flex justify-end">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-3 text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Value</p>
                <p className="text-xl font-bold" style={{ color: '#B8960A' }}>
                  {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {form.currency}
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-5 border-t mt-5">
              <button
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setActiveTab('details')}
              >
                ← Back
              </button>
              <button
                className="px-5 py-2 text-sm text-white rounded-lg font-medium"
                style={{ backgroundColor: '#B8960A' }}
                onClick={() => setActiveTab('review')}
              >
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Review ───────────────────────────────────────────────── */}
        {activeTab === 'review' && (
          <div className="space-y-5">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-800 border-b pb-3 mb-4">Review Summary</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Project</span><span className="font-medium text-gray-900">{form.projectName || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-medium text-gray-900">{form.vendorName || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">RFQ</span><span className="font-medium text-gray-900">{form.rfqNumber || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Currency</span><span className="font-medium text-gray-900">{form.currency}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Required Date</span><span className="font-medium text-gray-900">{form.requiredDate || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery Location</span><span className="font-medium text-gray-900">{form.deliveryLocation || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Payment Terms</span><span className="font-medium text-gray-900">{form.paymentTerms || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Warranty Period</span><span className="font-medium text-gray-900">{form.warrantyPeriod || '—'}</span></div>
                {form.notes && <div className="lg:col-span-2 flex justify-between"><span className="text-gray-500">Notes</span><span className="font-medium text-gray-900 max-w-xs text-right">{form.notes}</span></div>}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['#', 'Description', 'CSI Code', 'Qty', 'Unit', 'Unit Price', 'Total'].map(h => (
                        <th key={h} className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.filter(i => i.description.trim()).map((item, idx) => (
                      <tr key={item._key}>
                        <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-3 text-gray-900 font-medium">{item.description}</td>
                        <td className="py-2 px-3 text-gray-500">{item.csiCode || '—'}</td>
                        <td className="py-2 px-3">{item.quantity}</td>
                        <td className="py-2 px-3 text-gray-500">{item.unit}</td>
                        <td className="py-2 px-3">{parseFloat(item.unitPrice || 0).toLocaleString()}</td>
                        <td className="py-2 px-3 font-semibold">{item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td colSpan={6} className="py-2 px-3 text-right font-semibold text-gray-700">Total Value</td>
                      <td className="py-2 px-3 font-bold text-lg" style={{ color: '#B8960A' }}>
                        {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} {form.currency}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setActiveTab('items')}
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => router.push('/dashboard/procurement/purchase-orders')}
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm border-2 text-yellow-800 rounded-lg font-medium disabled:opacity-50"
                  style={{ borderColor: '#B8960A', color: '#B8960A' }}
                  onClick={() => submit(false)}
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving…' : 'Save as Draft'}
                </button>
                <button
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm text-white rounded-lg font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#0A1628' }}
                  onClick={() => submit(true)}
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting…' : 'Submit for Approval'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
