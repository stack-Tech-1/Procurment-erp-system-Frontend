"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, CheckCircle, Award, FileText, Users, DollarSign,
  BarChart3, TrendingUp, Send, Save, Printer, Download,
  AlertTriangle, ThumbsUp, ThumbsDown, Clock, Star
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Link from 'next/link';

const mockAPI = {
  getEvaluationSummary: async (rfqId) => {
    return {
      rfqId: rfqId,
      rfqNumber: "RFQ-2024-00123",
      title: "HVAC System Procurement",
      project: "Tower B Construction",
      scope: "Supply and installation of 10HP HVAC system",
      recommendedSupplier: {
        id: 101,
        name: "Al Redwan Trading",
        technicalScore: 95,
        financialRank: 2,
        justification: "Best balance of technical compliance and commercial terms. Fully compliant with specifications and offers reasonable delivery time.",
        totalPrice: 56000,
        currency: "SAR",
        deliveryTimeDays: 12,
        paymentTerms: "30% advance, 70% after delivery",
        warranty: "1 year"
      },
      technicalScores: [
        { supplier: "Al Redwan Trading", score: 95, compliance: "YES" },
        { supplier: "Gulf Engineering", score: 80, compliance: "PARTIAL" },
        { supplier: "Elite Industrial", score: 45, compliance: "NO" }
      ],
      financialComparison: [
        { supplier: "Al Redwan Trading", totalPrice: 56000, rank: 2 },
        { supplier: "Gulf Engineering", totalPrice: 54000, rank: 1 },
        { supplier: "Elite Industrial", totalPrice: 62500, rank: 3 }
      ],
      evaluationSummary: {
        technicalWeight: 40,
        commercialWeight: 60,
        finalScore: 87.5,
        recommendation: "AWARD",
        approvalStatus: "PENDING",
        requiredApprovals: ["Procurement Manager", "Finance Department"],
        evaluator: "Sarah Mohamed",
        evaluationDate: "2024-01-18"
      },
      nextSteps: [
        { step: "Procurement Manager Approval", status: "PENDING" },
        { step: "Finance Department Review", status: "PENDING" },
        { step: "Create Purchase Order", status: "NOT_STARTED" }
      ]
    };
  }
};

const EvaluationSummaryPage = () => {
  const params = useParams();
  const router = useRouter();
  const rfqId = params.id;
  console.log("Current RFQ ID from URL:", rfqId);
  
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState("PENDING");
  const [approvalComments, setApprovalComments] = useState("");

  useEffect(() => {
    // Only fetch if rfqId actually exists
    if (rfqId) {
      fetchSummaryData();
    }
  }, [rfqId]);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      const data = await mockAPI.getEvaluationSummary(rfqId);
      setSummaryData(data);
      setApprovalStatus(data.evaluationSummary.approvalStatus);
    } catch (error) {
      console.error('Failed to fetch evaluation summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setApprovalStatus("APPROVED");
    alert("Evaluation approved! You can now create a Purchase Order.");
  };

  const handleReject = () => {
    setApprovalStatus("REJECTED");
  };

  const handleCreatePO = () => {
    router.push(`/dashboard/procurement/purchase-orders/create?rfqId=${rfqId}&supplierId=${summaryData.recommendedSupplier.id}`);
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
      <div className="max-w-6xl mx-auto w-full p-4 lg:p-6">
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
              <h1 className="text-2xl font-bold text-gray-800">Evaluation Summary & Award Recommendation</h1>
              <p className="text-gray-600">RFQ: {summaryData.rfqNumber} - {summaryData.title}</p>
            </div>
            
            <div className="flex space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {approvalStatus === 'APPROVED' && <CheckCircle className="w-4 h-4 mr-1" />}
                {approvalStatus === 'REJECTED' && <AlertTriangle className="w-4 h-4 mr-1" />}
                {approvalStatus === 'PENDING' && <Clock className="w-4 h-4 mr-1" />}
                {approvalStatus}
              </span>
              
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Supplier Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center">
              <Award className="w-12 h-12 text-green-600 mr-4" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Recommended Supplier</h2>
                <p className="text-2xl font-bold text-green-700">{summaryData.recommendedSupplier.name}</p>
                <p className="text-gray-600">Supplier ID: {summaryData.recommendedSupplier.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-green-200">
                  <span className="text-2xl font-bold text-green-700">{summaryData.recommendedSupplier.technicalScore}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Technical Score</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-blue-200">
                  <span className="text-2xl font-bold text-blue-700">{summaryData.recommendedSupplier.financialRank}rd</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Price Rank</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-purple-200">
                  <span className="text-2xl font-bold text-purple-700">{summaryData.evaluationSummary.finalScore}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Final Score</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg">
            <h3 className="font-semibold mb-2">Award Justification</h3>
            <p className="text-gray-700">{summaryData.recommendedSupplier.justification}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Technical Scores */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Technical Evaluation Results</h3>
              <span className="ml-auto text-sm text-gray-500">Weight: {summaryData.evaluationSummary.technicalWeight}%</span>
            </div>
            
            <div className="space-y-4">
              {summaryData.technicalScores.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.supplier}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      item.compliance === 'YES' ? 'bg-green-100 text-green-800' :
                      item.compliance === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.compliance} Compliance
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-3">
                      <div 
                        className={`h-2.5 rounded-full ${
                          item.score >= 80 ? 'bg-green-600' :
                          item.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-lg">{item.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Financial Comparison</h3>
              <span className="ml-auto text-sm text-gray-500">Weight: {summaryData.evaluationSummary.commercialWeight}%</span>
            </div>
            
            <div className="space-y-4">
              {summaryData.financialComparison.map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  item.rank === 1 ? 'bg-green-50 border border-green-200' :
                  item.rank === 2 ? 'bg-blue-50 border border-blue-200' :
                  'bg-gray-50'
                }`}>
                  <div>
                    <p className="font-medium">{item.supplier}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      item.rank === 1 ? 'bg-green-100 text-green-800' :
                      item.rank === 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      Rank #{item.rank}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{item.totalPrice.toLocaleString()} SAR</p>
                    <p className="text-sm text-gray-500">Total Price</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supplier Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Recommended Supplier Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailCard 
              icon={DollarSign}
              title="Commercial Terms"
              items={[
                `Total Price: ${summaryData.recommendedSupplier.totalPrice.toLocaleString()} ${summaryData.recommendedSupplier.currency}`,
                `Delivery: ${summaryData.recommendedSupplier.deliveryTimeDays} days`,
                `Payment: ${summaryData.recommendedSupplier.paymentTerms}`,
                `Warranty: ${summaryData.recommendedSupplier.warranty}`
              ]}
              color="green"
            />
            
            <DetailCard 
              icon={Star}
              title="Technical Assessment"
              items={[
                `Technical Score: ${summaryData.recommendedSupplier.technicalScore}/100`,
                "Compliance: Fully Compliant (YES)",
                "All specifications met",
                "Complete documentation provided"
              ]}
              color="blue"
            />
            
            <DetailCard 
              icon={Users}
              title="Evaluation Information"
              items={[
                `Evaluator: ${summaryData.evaluationSummary.evaluator}`,
                `Date: ${summaryData.evaluationSummary.evaluationDate}`,
                `Status: ${summaryData.evaluationSummary.recommendation}`,
                `Required Approvals: ${summaryData.evaluationSummary.requiredApprovals.join(', ')}`
              ]}
              color="purple"
            />
          </div>
        </div>

        {/* Approval Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Approval Process</h3>
          
          <div className="space-y-4 mb-6">
            {summaryData.nextSteps.map((step, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  step.status === 'COMPLETED' ? 'bg-green-100' :
                  step.status === 'PENDING' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  {step.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {step.status === 'PENDING' && <Clock className="w-4 h-4 text-yellow-600" />}
                  {step.status === 'NOT_STARTED' && <FileText className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{step.step}</p>
                  <p className="text-sm text-gray-500">Status: {step.status}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Approval Comments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approval Comments
            </label>
            <textarea
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add comments for approval or rejection..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
            {approvalStatus === 'PENDING' && (
              <>
                <button
                  onClick={handleReject}
                  className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject Recommendation
                </button>
                <button
                  onClick={handleApprove}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve Recommendation
                </button>
              </>
            )}
            
            {approvalStatus === 'APPROVED' && (
              <Link 
                href={`/dashboard/procurement/purchase-orders/create?rfqId=${rfqId}&supplierId=${summaryData.recommendedSupplier.id}`}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Link>
            )}
            
            <button className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

const DetailCard = ({ icon: Icon, title, items, color = 'blue' }) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Icon className={`w-5 h-5 mr-2 ${colorClasses[color]}`} />
        <h4 className="font-semibold">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-600 flex items-start">
            <span className="inline-block w-2 h-2 bg-gray-300 rounded-full mr-2 mt-1.5"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EvaluationSummaryPage;