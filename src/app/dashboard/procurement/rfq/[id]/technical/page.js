"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, FileText, CheckCircle, XCircle, AlertCircle, 
  Upload, Download, Plus, Save, Send, Users, BarChart3,
  ChevronDown, ChevronUp, Trash2, Eye
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

const mockAPI = {
  getRFQTechnicalData: async (rfqId) => {
    return {
      rfqId: rfqId,
      rfqNumber: "RFQ-2024-00123",
      title: "HVAC System Procurement",
      project: "Tower B Construction",
      scope: "Supply and installation of 10HP HVAC system",
      prReference: "PR-2024-00123",
      technicalEvaluations: [
        {
          id: 1,
          supplierId: 101,
          supplierName: "Al Redwan Trading",
          compliance: "YES",
          technicalScore: 95,
          notes: "Full datasheet + test certificates provided. Meets all specifications.",
          attachments: [
            { name: "Datasheet.pdf", url: "#" },
            { name: "Test_Certificates.pdf", url: "#" }
          ],
          evaluatedBy: "Eng. Ahmed",
          evaluatedAt: "2024-01-15"
        },
        {
          id: 2,
          supplierId: 102,
          supplierName: "Gulf Engineering",
          compliance: "PARTIAL",
          technicalScore: 80,
          notes: "Missing warranty documents. Technical specs match 85%.",
          attachments: [
            { name: "Catalogue.pdf", url: "#" }
          ],
          evaluatedBy: "Eng. Ahmed",
          evaluatedAt: "2024-01-15"
        },
        {
          id: 3,
          supplierId: 103,
          supplierName: "Elite Industrial",
          compliance: "NO",
          technicalScore: 45,
          notes: "Offered different material specification. Not compliant.",
          attachments: [],
          evaluatedBy: "Eng. Ahmed",
          evaluatedAt: "2024-01-15"
        }
      ],
      suppliers: [
        { id: 101, name: "Al Redwan Trading", contact: "Mohammed Ali", email: "info@alredwan.com" },
        { id: 102, name: "Gulf Engineering", contact: "Sarah Ahmed", email: "sales@gulfeng.com" },
        { id: 103, name: "Elite Industrial", contact: "Khalid Omar", email: "contact@eliteind.com" }
      ]
    };
  }
};

const RFQTechnicalComparisonPage = () => {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id;
  
  const [rfqData, setRfqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvaluation, setNewEvaluation] = useState({
    supplierId: '',
    compliance: 'YES',
    technicalScore: '',
    notes: '',
    attachments: []
  });

  useEffect(() => {
    fetchRFQData();
  }, [rfqId]);

  const fetchRFQData = async () => {
    setLoading(true);
    try {
      const data = await mockAPI.getRFQTechnicalData(rfqId);
      setRfqData(data);
    } catch (error) {
      console.error('Failed to fetch RFQ data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvaluation = () => {
    if (!newEvaluation.supplierId || !newEvaluation.technicalScore) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedSupplier = rfqData.suppliers.find(s => s.id === parseInt(newEvaluation.supplierId));
    const evaluation = {
      id: Date.now(),
      supplierId: parseInt(newEvaluation.supplierId),
      supplierName: selectedSupplier?.name || '',
      compliance: newEvaluation.compliance,
      technicalScore: parseInt(newEvaluation.technicalScore),
      notes: newEvaluation.notes,
      attachments: newEvaluation.attachments,
      evaluatedBy: "Current User",
      evaluatedAt: new Date().toISOString().split('T')[0]
    };

    setRfqData(prev => ({
      ...prev,
      technicalEvaluations: [...prev.technicalEvaluations, evaluation]
    }));

    setNewEvaluation({
      supplierId: '',
      compliance: 'YES',
      technicalScore: '',
      notes: '',
      attachments: []
    });
    setShowAddForm(false);
  };

  const getComplianceConfig = (compliance) => {
    const configs = {
      YES: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Fully Compliant' },
      PARTIAL: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Partially Compliant' },
      NO: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Not Compliant' }
    };
    return configs[compliance] || configs.YES;
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
              <h1 className="text-2xl font-bold text-gray-800">Technical Comparison</h1>
              <p className="text-gray-600">RFQ: {rfqData.rfqNumber} - {rfqData.title}</p>
              <p className="text-sm text-gray-500">Project: {rfqData.project} | Scope: {rfqData.scope}</p>
            </div>
            
            <div className="flex flex-row items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
              <Link
                href={`/dashboard/procurement/rfq/${rfqId}/financial`}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Financial Comparison
              </Link>
              <Link 
                href={`/dashboard/procurement/rfq/${rfqId}/evaluation-summary`}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Evaluation Summary
              </Link>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Evaluation
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Evaluations</p>
                <p className="text-2xl font-bold text-blue-600">{rfqData.technicalEvaluations.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {rfqData.technicalEvaluations.length > 0 
                    ? (rfqData.technicalEvaluations.reduce((sum, evaluation) => sum + evaluation.technicalScore, 0) / rfqData.technicalEvaluations.length).toFixed(1)
                    : 0}/100
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Fully Compliant</p>
                <p className="text-2xl font-bold text-purple-600">
                  {rfqData.technicalEvaluations.filter(e => e.compliance === 'YES').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Add Evaluation Form */}
        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add Technical Evaluation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Compliance *</label>
                <select
                  value={newEvaluation.compliance}
                  onChange={(e) => setNewEvaluation({...newEvaluation, compliance: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="YES">Fully Compliant (YES)</option>
                  <option value="PARTIAL">Partially Compliant (PARTIAL)</option>
                  <option value="NO">Not Compliant (NO)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technical Score (0-100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newEvaluation.technicalScore}
                  onChange={(e) => setNewEvaluation({...newEvaluation, technicalScore: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                placeholder="Add evaluation notes, observations, recommendations..."
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

        {/* Technical Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Technical Evaluations ({rfqData.technicalEvaluations.length})</h3>
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
                Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technical Score</th>
                  <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attachments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evaluated By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rfqData.technicalEvaluations.map((evaluation) => {
                  const complianceConfig = getComplianceConfig(evaluation.compliance);
                  const ComplianceIcon = complianceConfig.icon;
                  
                  return (
                    <tr key={evaluation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{evaluation.supplierName}</p>
                          <p className="text-sm text-gray-500">ID: {evaluation.supplierId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${complianceConfig.color}`}>
                          <ComplianceIcon className="w-3 h-3 mr-1" />
                          {complianceConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                evaluation.technicalScore >= 80 ? 'bg-green-600' :
                                evaluation.technicalScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${evaluation.technicalScore}%` }}
                            ></div>
                          </div>
                          <span className="ml-3 font-medium">{evaluation.technicalScore}/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{evaluation.notes}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {evaluation.attachments.map((file, index) => (
                            <a
                              key={index}
                              href={file.url}
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              {file.name}
                            </a>
                          ))}
                          {evaluation.attachments.length === 0 && (
                            <span className="text-gray-400 text-sm">No attachments</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium">{evaluation.evaluatedBy}</p>
                          <p className="text-xs text-gray-500">{evaluation.evaluatedAt}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="p-1 text-blue-600 hover:text-blue-800" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-green-600 hover:text-green-800" title="Edit">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-800" title="Delete">
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </ResponsiveLayout>
  );
};

export default RFQTechnicalComparisonPage;