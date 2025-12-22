"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, Save, Send, Plus, Minus, FileText, Building,
  User, DollarSign, Calendar, Package, CheckCircle, AlertTriangle,
  Search, X
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const mockAPI = {
  getRFQData: async (rfqId) => {
    if (!rfqId) return null;
    
    return {
      rfqId: rfqId,
      rfqNumber: "RFQ-2024-00123",
      title: "HVAC System Procurement",
      projectName: "Tower B Construction",
      recommendedSupplier: {
        id: 101,
        name: "Al Redwan Trading",
        contactPerson: "Mohammed Ali",
        email: "info@alredwan.com",
        phone: "+966 11 234 5678"
      },
      items: [
        { id: 1, description: "HVAC Unit 10HP", quantity: 2, unit: "PCS", unitPrice: 450000, total: 900000 },
        { id: 2, description: "Ductwork Materials", quantity: 500, unit: "M", unitPrice: 700, total: 350000 }
      ]
    };
  },

  getSuppliers: async () => {
    return [
      { id: 101, name: "Al Redwan Trading", contact: "Mohammed Ali", email: "info@alredwan.com" },
      { id: 102, name: "Gulf Engineering", contact: "Sarah Ahmed", email: "sales@gulfeng.com" },
      { id: 103, name: "Elite Industrial", contact: "Khalid Omar", email: "contact@eliteind.com" }
    ];
  }
};

const CreatePurchaseOrderPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rfqId = searchParams.get('rfqId');
  const supplierId = searchParams.get('supplierId');
  
  const [loading, setLoading] = useState(true);
  const [rfqData, setRfqData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierSearch, setShowSupplierSearch] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  
  const [formData, setFormData] = useState({
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    projectName: '',
    supplierId: '',
    supplierName: '',
    poDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    paymentTerms: '30% advance, 70% after delivery',
    incoterms: 'CIF Jeddah',
    currency: 'SAR',
    notes: '',
    items: []
  });

  useEffect(() => {
    fetchInitialData();
  }, [rfqId, supplierId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Get suppliers list
      const suppliersData = await mockAPI.getSuppliers();
      setSuppliers(suppliersData);

      // If coming from RFQ evaluation
      if (rfqId) {
        const rfqData = await mockAPI.getRFQData(rfqId);
        if (rfqData) {
          setRfqData(rfqData);
          
          // Auto-fill form from RFQ data
          setFormData(prev => ({
            ...prev,
            projectName: rfqData.projectName,
            supplierId: supplierId || rfqData.recommendedSupplier.id,
            supplierName: rfqData.recommendedSupplier.name,
            items: rfqData.items.map(item => ({
              ...item,
              poUnitPrice: item.unitPrice,
              poTotal: item.total
            }))
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSelect = (supplier) => {
    setFormData(prev => ({
      ...prev,
      supplierId: supplier.id,
      supplierName: supplier.name
    }));
    setShowSupplierSearch(false);
    setSupplierSearch('');
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate total if quantity or unit price changed
    if (field === 'quantity' || field === 'poUnitPrice') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = parseFloat(updatedItems[index].poUnitPrice) || 0;
      updatedItems[index].poTotal = quantity * unitPrice;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now(),
        description: '',
        quantity: 1,
        unit: 'PCS',
        poUnitPrice: 0,
        poTotal: 0
      }]
    }));
  };

  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.poTotal || 0), 0);
    const taxRate = 0.15; // 15% VAT
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const handleSubmit = async (status = 'DRAFT') => {
    try {
      const totals = calculateTotals();
      const poData = {
        ...formData,
        status,
        totalValue: totals.total,
        subtotal: totals.subtotal,
        tax: totals.tax,
        createdBy: "Current User"
      };

      console.log('Creating PO:', poData);
      // In real app, call API here
      
      if (status === 'DRAFT') {
        alert('Purchase Order saved as draft successfully!');
      } else {
        alert('Purchase Order issued successfully!');
      }
      
      router.push('/dashboard/procurement/purchase-orders');
    } catch (error) {
      console.error('Failed to create PO:', error);
      alert('Failed to create Purchase Order. Please try again.');
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const totals = calculateTotals();

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-6xl mx-auto w-full p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Create Purchase Order</h1>
              <p className="text-gray-600">Fill in the details to create a new purchase order</p>
              {rfqData && (
                <p className="text-sm text-green-600 mt-1">
                  Auto-filled from RFQ: {rfqData.rfqNumber} - {rfqData.title}
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleSubmit('DRAFT')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </button>
              <button
                onClick={() => handleSubmit('ISSUED')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Issue PO
              </button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Number *
              </label>
              <input
                type="text"
                value={formData.poNumber}
                onChange={(e) => setFormData({...formData, poNumber: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Supplier Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSupplierSearch(true)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {formData.supplierName ? (
                    <div>
                      <p className="font-medium">{formData.supplierName}</p>
                      <p className="text-sm text-gray-500">Click to change supplier</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Select a supplier...</p>
                  )}
                </button>
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Supplier Search Modal */}
              {showSupplierSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        placeholder="Search suppliers..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredSuppliers.map(supplier => (
                      <button
                        key={supplier.id}
                        onClick={() => handleSupplierSelect(supplier)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-gray-500">Contact: {supplier.contact}</p>
                      </button>
                    ))}
                    {filteredSuppliers.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No suppliers found
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t">
                    <button
                      onClick={() => setShowSupplierSearch(false)}
                      className="w-full p-2 text-center text-gray-600 hover:text-gray-800"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Date *
              </label>
              <input
                type="date"
                value={formData.poDate}
                onChange={(e) => setFormData({...formData, poDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date *
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 30% advance, 70% after delivery"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="SAR">SAR (Saudi Riyal)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Items ({formData.items.length})
            </h2>
            <button
              onClick={addItem}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No items added yet. Click "Add Item" to start.</p>
                    </td>
                  </tr>
                ) : (
                  formData.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Item description"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-24 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="PCS">PCS</option>
                          <option value="M">M</option>
                          <option value="KG">KG</option>
                          <option value="SET">SET</option>
                          <option value="LOT">LOT</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            step="0.01"
                            value={item.poUnitPrice}
                            onChange={(e) => handleItemChange(index, 'poUnitPrice', e.target.value)}
                            className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                          <span className="font-bold">{item.poTotal?.toLocaleString() || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          {formData.items.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{totals.subtotal.toLocaleString()} {formData.currency}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax (15%):</span>
                    <span className="font-medium">{totals.tax.toLocaleString()} {formData.currency}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200 pt-2">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-lg font-bold text-green-700">
                      {totals.total.toLocaleString()} {formData.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Additional Notes
          </h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Add any additional notes, special instructions, or terms..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('DRAFT')}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit('ISSUED')}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <Send className="w-4 h-4 mr-2" />
            Issue Purchase Order
          </button>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default CreatePurchaseOrderPage;
