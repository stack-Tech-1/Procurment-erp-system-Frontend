"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, DollarSign, TrendingDown, Clock, FileText, 
  Percent, Calendar, Globe, Download, Printer, CheckCircle,
  BarChart3, Plus, Edit, Trash2, Eye, Award
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

const mockAPI = {
  getRFQFinancialData: async (rfqId) => {
    return {
      rfqId: rfqId,
      rfqNumber: "RFQ-2024-00123",
      title: "HVAC System Procurement",
      project: "Tower B Construction",
      scope: "Supply and installation of 10HP HVAC system",
      financialEvaluations: [
        {
          id: 1,
          supplierId: 101,
          supplierName: "Al Redwan Trading",
          currency: "SAR",
          unitPrice: 112,
          quantity: 500,
          totalPrice: 56000,
          deliveryTimeDays: 12,
          paymentTerms: "30% advance, 70% after delivery",
          discount: "5%",
          warrantyPeriod: "1 year",
          notes: "Good balance of price and delivery time",
          isLowestCommercial: false,
          evaluatedBy: "Sarah Mohamed",
          evaluatedAt: "2024-01-16"
        },
        {
          id: 2,
          supplierId: 102,
          supplierName: "Gulf Engineering",
          currency: "SAR",
          unitPrice: 108,
          quantity: 500,
          totalPrice: 54000,
          deliveryTimeDays: 20,
          paymentTerms: "50% advance, 50% after delivery",
          discount: "3%",
          warrantyPeriod: "2 years",
          notes: "Cheapest but slowest delivery",
          isLowestCommercial: true,
          evaluatedBy: "Sarah Mohamed",
          evaluatedAt: "2024-01-16"
        },
        {
          id: 3,
          supplierId: 103,
          supplierName: "Elite Industrial",
          currency: "SAR",
          unitPrice: 125,
          quantity: 500,
          totalPrice: 62500,
          deliveryTimeDays: 15,
          paymentTerms: "100% after delivery",
          discount: "0%",
          warrantyPeriod: "1 year",
          notes: "Most expensive but good payment terms",
          isLowestCommercial: false,
          evaluatedBy: "Sarah Mohamed",
          evaluatedAt: "2024-01-16"
        }
      ],
      suppliers: [
        { id: 101, name: "Al Redwan Trading" },
        { id: 102, name: "Gulf Engineering" },
        { id: 103, name: "Elite Industrial" }
      ]
    };
  }
};

const RFQFinancialComparisonPage = () => {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id;
  
  const [rfqData, setRfqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({
    supplierId: '',
    currency: 'SAR',
    unitPrice: '',
    quantity: '',
    deliveryTimeDays: '',
    paymentTerms: '',
    discount: '',
    warrantyPeriod: '',
    notes: ''
  });

  useEffect(() => {
    fetchRFQData();
  }, [rfqId]);

  const fetchRFQData = async () => {
    setLoading(true);
    try {
      const data = await mockAPI.getRFQFinancialData(rfqId);
      setRfqData(data);
    } catch (error) {
      console.error('Failed to fetch RFQ data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (unitPrice, quantity) => {
    const unit = parseFloat(unitPrice) || 0;
    const qty = parseFloat(quantity) || 0;
    return unit * qty;
  };

  const handleAddEvaluation = () => {
    if (!newEvaluation.supplierId || !newEvaluation.unitPrice || !newEvaluation.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedSupplier = rfqData.suppliers.find(s => s.id === parseInt(newEvaluation.supplierId));
    const totalPrice = calculateTotalPrice(newEvaluation.unitPrice, newEvaluation.quantity);
    
    const evaluation = {
      id: Date.now(),
      supplierId: parseInt(newEvaluation.supplierId),
      supplierName: selectedSupplier?.name || '',
      currency: newEvaluation.currency,
      unitPrice: parseFloat(newEvaluation.unitPrice),
      quantity: parseInt(newEvaluation.quantity),
      totalPrice: totalPrice,
      deliveryTimeDays: parseInt(newEvaluation.deliveryTimeDays) || 0,
      paymentTerms: newEvaluation.paymentTerms,
      discount: newEvaluation.discount,
      warrantyPeriod: newEvaluation.warrantyPeriod,
      notes: newEvaluation.notes,
      isLowestCommercial: false,
      evaluatedBy: "Current User",
      evaluatedAt: new Date().toISOString().split('T')[0]
    };

    setRfqData(prev => ({
      ...prev,
      financialEvaluations: [...prev.financialEvaluations, evaluation]
    }));

    setNewEvaluation({
      supplierId: '',
      currency: 'SAR',
      unitPrice: '',
      quantity: '',
      deliveryTimeDays: '',
      paymentTerms: '',
      discount: '',
      warrantyPeriod: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const markAsLowestCommercial = (id) => {
    setRfqData(prev => ({
      ...prev,
      financialEvaluations: prev.financialEvaluations.map(evaluation => ({
        ...evaluation,
        isLowestCommercial: evaluation.id === id
      }))
    }));
  };

  const getRankColor = (price, evaluations) => {
    const prices = evaluations.map(e => e.totalPrice).sort((a, b) => a - b);
    const rank = prices.indexOf(price) + 1;
    
    switch(rank) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankText = (price, evaluations) => {
    const prices = evaluations.map(e => e.totalPrice).sort((a, b) => a - b);
    const rank = prices.indexOf(price) + 1;
    
    switch(rank) {
      case 1: return '1st (Lowest)';
      case 2: return '2nd';
      case 3: return '3rd';
      default: return `${rank}th`;
    }
  };

  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  const lowestPrice = Math.min(...rfqData.financialEvaluations.map(e => e.totalPrice));

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/dashboard/procurement/rfq/${rfqId}`}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to RFQ Details
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Financial Comparison</h1>
              <p className="text-gray-600">RFQ: {rfqData.rfqNumber} - {rfqData.title}</p>
              <p className="text-sm text-gray-500">Project: {rfqData.project} | Scope: {rfqData.scope}</p>
            </div>
            
            <div className="flex space-x-3">
              <Link
                href={`/dashboard/procurement/rfq/${rfqId}/technical`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Technical Comparison
              </Link>
              <Link
                href={`/dashboard/procurement/rfq/${rfqId}/evaluation-summary`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Evaluation Summary
              </Link>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Lowest Price</p>
                <p className="text-2xl font-bold text-green-600">
                  {lowestPrice.toLocaleString()} {rfqData.financialEvaluations[0]?.currency || 'SAR'}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(
                    rfqData.financialEvaluations.reduce((sum, evaluation) => sum + evaluation.totalPrice, 0) / 
                    rfqData.financialEvaluations.length
                  ).toLocaleString(undefined, { maximumFractionDigits: 0 })} SAR
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Fastest Delivery</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.min(...rfqData.financialEvaluations.map(e => e.deliveryTimeDays))} days
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Number of Bids</p>
                <p className="text-2xl font-bold text-purple-600">{rfqData.financialEvaluations.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Add Evaluation Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add Financial Evaluation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                <select
                  value={newEvaluation.supplierId}
                  onChange={(e) => setNewEvaluation({...newEvaluation, supplierId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Supplier</option>
                  {rfqData.suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={newEvaluation.currency}
                  onChange={(e) => setNewEvaluation({...newEvaluation, currency: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SAR">SAR (Saudi Riyal)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEvaluation.unitPrice}
                  onChange={(e) => {
                    setNewEvaluation({...newEvaluation, unitPrice: e.target.value});
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  value={newEvaluation.quantity}
                  onChange={(e) => setNewEvaluation({...newEvaluation, quantity: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time (Days)</label>
                <input
                  type="number"
                  value={newEvaluation.deliveryTimeDays}
                  onChange={(e) => setNewEvaluation({...newEvaluation, deliveryTimeDays: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                <input
                  type="text"
                  value={newEvaluation.paymentTerms}
                  onChange={(e) => setNewEvaluation({...newEvaluation, paymentTerms: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 30% advance, 70% after delivery"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                <input
                  type="text"
                  value={newEvaluation.discount}
                  onChange={(e) => setNewEvaluation({...newEvaluation, discount: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 5% or 1000 SAR"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Period</label>
                <input
                  type="text"
                  value={newEvaluation.warrantyPeriod}
                  onChange={(e) => setNewEvaluation({...newEvaluation, warrantyPeriod: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1 year, 2 years"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={newEvaluation.notes}
                onChange={(e) => setNewEvaluation({...newEvaluation, notes: e.target.value})}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add commercial evaluation notes..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvaluation}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Evaluation
              </button>
            </div>
          </div>
        )}

        {/* Financial Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Financial Evaluations ({rfqData.financialEvaluations.length})</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Evaluation
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                <Download className="w-4 h-4 mr-1" />
                Export to Excel
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                <Printer className="w-4 h-4 mr-1" />
                Print
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Terms</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warranty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rfqData.financialEvaluations.map((evaluation) => {
                  const rankColor = getRankColor(evaluation.totalPrice, rfqData.financialEvaluations);
                  const rankText = getRankText(evaluation.totalPrice, rfqData.financialEvaluations);
                  
                  return (
                    <tr key={evaluation.id} className={`hover:bg-gray-50 ${evaluation.isLowestCommercial ? 'bg-green-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{evaluation.supplierName}</p>
                          <p className="text-sm text-gray-500">ID: {evaluation.supplierId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-gray-400 mr-2" />
                          {evaluation.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                          {evaluation.unitPrice.toLocaleString()} {evaluation.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {evaluation.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-lg">
                          {evaluation.totalPrice.toLocaleString()} {evaluation.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-blue-500 mr-1" />
                          {evaluation.deliveryTimeDays} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{evaluation.paymentTerms}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {evaluation.warrantyPeriod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${rankColor}`}>
                          {rankText}
                          {evaluation.totalPrice === lowestPrice && (
                            <TrendingDown className="w-3 h-3 ml-1" />
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => markAsLowestCommercial(evaluation.id)}
                            className={`p-1 ${evaluation.isLowestCommercial ? 'text-green-600' : 'text-gray-600'} hover:text-green-800`}
                            title="Mark as Lowest Commercial"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-blue-600 hover:text-blue-800" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:text-gray-800" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Commercial Evaluation Notes</h4>
              <p className="text-sm text-yellow-700 mt-1">
                • Gulf Engineering offers the lowest price but has longer delivery time<br />
                • Al Redwan Trading provides the best balance of price and delivery<br />
                • Consider payment terms and warranty periods in final decision
              </p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default RFQFinancialComparisonPage;