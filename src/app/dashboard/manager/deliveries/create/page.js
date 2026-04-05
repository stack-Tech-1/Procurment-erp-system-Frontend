"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Upload, Package, RefreshCw } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function CreateDeliveryPage() {
  const router = useRouter();
  const [pos, setPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [poDetails, setPODetails] = useState(null);
  const [loadingPO, setLoadingPO] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    poId: '',
    requiredDate: '',
    deliveryLocation: '',
    isPartial: false,
    notes: '',
  });

  const [items, setItems] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch issued POs for dropdown
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/purchase-orders?status=ISSUED&limit=200`, { headers });
        if (r.ok) {
          const data = await r.json();
          setPOs(data.purchaseOrders || data || []);
        }
      } catch (_) {}
    })();
  }, []);

  // Fetch PO details when PO selected
  const onPOChange = async (poId) => {
    setForm(f => ({ ...f, poId }));
    if (!poId) { setPODetails(null); setItems([]); return; }
    setLoadingPO(true);
    try {
      const r = await fetch(`${API}/api/purchase-orders/${poId}`, { headers });
      if (r.ok) {
        const po = await r.json();
        setPODetails(po);
        setSelectedPO(po);
        // Pre-populate items from PO
        setItems((po.items || []).map(item => ({
          poItemId: item.id,
          description: item.description,
          quantityOrdered: item.quantity,
          quantityDelivered: item.quantity, // default to full
          unit: item.unit || 'unit',
          qcStatus: 'PENDING',
        })));
      }
    } catch (_) {}
    setLoadingPO(false);
  };

  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      poItemId: null, description: '', quantityOrdered: 1, quantityDelivered: 1, unit: 'unit', qcStatus: 'PENDING',
    }]);
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.poId || !form.requiredDate) {
      alert('PO and Required Date are required');
      return;
    }
    if (items.length === 0) {
      alert('Add at least one delivery item');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/api/deliveries`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          poId: parseInt(form.poId),
          vendorId: poDetails?.vendorId,
          projectName: poDetails?.projectName || '',
          items,
        }),
      });
      if (r.ok) {
        const created = await r.json();

        // Upload attachments if any
        if (files.length > 0) {
          const fd = new FormData();
          Array.from(files).forEach(f => fd.append('files', f));
          await fetch(`${API}/api/deliveries/${created.id}/attachments`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          });
        }

        router.push(`/dashboard/manager/deliveries/${created.id}`);
      } else {
        const e = await r.json();
        alert(e.error || 'Failed to create delivery');
      }
    } catch (_) { alert('Network error'); }
    setSubmitting(false);
  };

  return (
    <ResponsiveLayout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0A1628]">New Site Delivery (GRN)</h1>
            <p className="text-gray-500 text-sm">Record a new material delivery against a Purchase Order</p>
          </div>
        </div>

        {/* Section 1: Delivery Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-[#0A1628] border-b border-gray-100 pb-3">Delivery Details</h2>

          {/* PO Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order <span className="text-red-500">*</span></label>
            <select
              value={form.poId}
              onChange={e => onPOChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
            >
              <option value="">Select a PO...</option>
              {pos.map(po => (
                <option key={po.id} value={po.id}>
                  {po.poNumber} — {po.projectName} ({po.vendor?.companyName || po.vendor?.companyLegalName || 'Vendor'})
                </option>
              ))}
            </select>
            {loadingPO && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><RefreshCw size={11} className="animate-spin" /> Loading PO details...</p>}
          </div>

          {/* Auto-filled from PO */}
          {poDetails && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg text-sm">
              <div>
                <span className="text-gray-400 text-xs">Vendor</span>
                <p className="font-medium text-gray-800 mt-0.5">{poDetails.vendor?.companyName || poDetails.vendor?.companyLegalName || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-xs">Project</span>
                <p className="font-medium text-gray-800 mt-0.5">{poDetails.projectName || '—'}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Delivery Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.requiredDate}
                onChange={e => setForm(f => ({ ...f, requiredDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
              <input
                type="text"
                value={form.deliveryLocation}
                onChange={e => setForm(f => ({ ...f, deliveryLocation: e.target.value }))}
                placeholder="e.g. Site Gate 3, Warehouse B"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPartial"
              checked={form.isPartial}
              onChange={e => setForm(f => ({ ...f, isPartial: e.target.checked }))}
              className="accent-[#C6A35D]"
            />
            <label htmlFor="isPartial" className="text-sm text-gray-700">This is a partial delivery</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Any additional notes about this delivery..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6A35D]/30 resize-none"
            />
          </div>
        </div>

        {/* Section 2: Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-semibold text-[#0A1628]">Items to Deliver</h2>
            <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-[#C6A35D] hover:text-[#b8924a] font-medium">
              <Plus size={14} /> Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              <Package size={28} className="mx-auto mb-2 opacity-30" />
              {form.poId ? 'No items on this PO' : 'Select a PO to load items'}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Ordered</div>
                <div className="col-span-2 text-right">Delivering</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-1" />
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C6A35D]/30"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantityOrdered}
                      readOnly={!!item.poItemId}
                      onChange={e => updateItem(idx, 'quantityOrdered', parseFloat(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-right focus:outline-none bg-gray-50"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantityDelivered}
                      min={0}
                      max={item.quantityOrdered}
                      onChange={e => updateItem(idx, 'quantityDelivered', parseFloat(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#C6A35D]/30"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={e => updateItem(idx, 'unit', e.target.value)}
                      placeholder="unit"
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C6A35D]/30"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeItem(idx)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Attachments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
          <h2 className="font-semibold text-[#0A1628] border-b border-gray-100 pb-3">Attachments <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              onChange={e => setFiles(e.target.files)}
              className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-[#C6A35D]/10 file:text-[#C6A35D] hover:file:bg-[#C6A35D]/20"
            />
            {files.length > 0 && (
              <span className="text-xs text-gray-500">{files.length} file(s) selected</span>
            )}
          </div>
          <p className="text-xs text-gray-400">Upload delivery notes, packing lists, or QC certificates. Max 10MB per file.</p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button onClick={() => router.back()} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.poId || !form.requiredDate}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#C6A35D] hover:bg-[#b8924a] text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <><RefreshCw size={15} className="animate-spin" /> Creating...</>
            ) : (
              <><Truck size={15} /> Create Delivery</>
            )}
          </button>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
