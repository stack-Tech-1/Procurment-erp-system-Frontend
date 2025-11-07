"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DocumentChecklist from '@/components/DocumentChecklist';
import EvaluationPanel from '@/components/EvaluationPanel'; 
import CSIClassification from '@/components/CSIClassification';
import ReviewTabs from '@/components/ReviewTabs';
import EnhancedCompanyInfo from '@/components/EnhancedCompanyInfo';
import {
    Building2, FileText, CheckCircle, Clock, XCircle,
    User, Mail, Phone, MapPin, Loader2, Save, Send,
    FileText as FileIcon, Calendar, Hash,
    Briefcase, Award, Users, Home, CheckSquare, TrendingUp,
    ArrowLeft, History, Download, Tag  // Add these
} from 'lucide-react';

// Use your actual API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Helper Functions and Components
const getStatusClass = (status) => {
    switch (status) {
        case 'APPROVED': return 'bg-green-100 text-green-800 border-green-400';
        case 'REJECTED': return 'bg-red-100 text-red-800 border-red-400';
        case 'BLACKLISTED': return 'bg-gray-700 text-white border-gray-900';
        case 'NEEDS_RENEWAL': return 'bg-orange-100 text-orange-800 border-orange-400';
        case 'UNDER_REVIEW': 
        case 'NEW':
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-400';
    }
};

const SectionHeader = ({ title, icon: Icon, className = "" }) => (
    <div className={`flex items-center space-x-3 pb-3 border-b-2 border-blue-100/70 mb-6 ${className}`}>
        {Icon && <Icon className="w-6 h-6 text-blue-600" />}
        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            {title}
        </h2>
    </div>
);

const DetailItem = ({ label, value, icon: Icon, className = '' }) => (
    <div className={`p-3 bg-gray-50 rounded-lg text-sm border ${className || 'border-gray-200'}`}>
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <div className="flex items-center text-gray-800 font-semibold">
            {Icon && <Icon className="w-4 h-4 mr-2 flex-shrink-0" />}
            <span className="truncate">{value || 'N/A'}</span>
        </div>
    </div>
);

const CategorySelector = ({ selectedIds, setSelectedIds, categories = [] }) => {
    const handleToggle = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const displayCategories = categories.map(cat => ({
        ...cat,
        isSelected: selectedIds.includes(cat.id)
    }));

    return (
        <div className="flex flex-wrap gap-2">
            {displayCategories.map(cat => (
                <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggle(cat.id)}
                    className={`px-3 py-1 text-sm rounded-full transition-all duration-150 border 
                        ${cat.isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:border-blue-300'
                        }`
                    }
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
};

const QualificationPanel = ({ form, setForm, onSubmit, isSubmitting, submitMessage, currentReviewerName, lastReviewedBy, lastReviewNotes }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const StatusOption = ({ status, icon: Icon, color, description }) => (
        <label className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
            form.newStatus === status 
                ? `${color} border-4 shadow-lg ring-4 ring-offset-2 ring-opacity-50 ring-current`
                : 'border-gray-200 hover:border-blue-400'
        }`}>
            <input
                type="radio"
                name="newStatus"
                value={status}
                checked={form.newStatus === status}
                onChange={handleChange}
                className="hidden"
            />
            <Icon className={`w-6 h-6 mr-3 ${form.newStatus === status ? 'text-white' : 'text-gray-500'}`} />
            <div>
                <span className={`font-bold block ${form.newStatus === status ? 'text-white' : 'text-gray-800'}`}>{status.replace(/_/g, ' ')}</span>
                <span className="text-xs text-gray-200">{description}</span>
            </div>
        </label>
    );

    return (
        <div className="sticky top-6">
            <form onSubmit={onSubmit} className="bg-blue-800 p-6 rounded-xl shadow-2xl border-b-8 border-blue-600">
                <div className="flex items-center mb-6">
                    <CheckSquare className="w-7 h-7 mr-3 text-white" />
                    <h3 className="text-2xl font-bold text-white">Qualification Review</h3>
                </div>

                {/* Status Selection */}
                <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-blue-100">1. Update Vendor Status</label>
                    <StatusOption status="APPROVED" icon={CheckCircle} color="bg-green-600" description="Vendor is qualified for active engagement." />
                    <StatusOption status="NEEDS_RENEWAL" icon={Clock} color="bg-orange-500" description="Requires updated documents or review." />
                    <StatusOption status="REJECTED" icon={XCircle} color="bg-red-600" description="Fails to meet minimum requirements." />
                    <StatusOption status="BLACKLISTED" icon={XCircle} color="bg-gray-900" description="Permanent exclusion from tenders." />
                </div>

                {/* Classification & Score */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="vendorClass" className="block text-sm font-medium text-blue-100 mb-1">2. Vendor Class</label>
                        <select
                            id="vendorClass"
                            name="vendorClass"
                            value={form.vendorClass}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        >
                            {['A', 'B', 'C', 'D'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="qualificationScore" className="block text-sm font-medium text-blue-100 mb-1">3. Qualification Score (0-100)</label>
                        <input
                            type="number"
                            id="qualificationScore"
                            name="qualificationScore"
                            value={form.qualificationScore}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        />
                    </div>
                </div>
                
                {/* Reviewer & Next Review */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="assignedReviewerId" className="block text-sm font-medium text-blue-100 mb-1">4. Assigned Reviewer (ID)</label>
                        <input
                            type="number"
                            id="assignedReviewerId"
                            name="assignedReviewerId"
                            value={form.assignedReviewerId || ''}
                            onChange={handleChange}
                            placeholder="e.g. 5"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        />
                    </div>
                    <div>
                        <label htmlFor="nextReviewDate" className="block text-sm font-medium text-blue-100 mb-1">5. Next Review Date</label>
                        <input
                            type="date"
                            id="nextReviewDate"
                            name="nextReviewDate"
                            value={form.nextReviewDate}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        />
                    </div>
                </div>

                {/* Review Notes */}
                <div className="mb-6">
                    <label htmlFor="reviewNotes" className="block text-sm font-medium text-blue-100 mb-1">6. Review Notes (Mandatory)</label>
                    <textarea
                        id="reviewNotes"
                        name="reviewNotes"
                        rows="4"
                        value={form.reviewNotes}
                        onChange={handleChange}
                        placeholder="Detail the rationale for the status update, key findings, and action items."
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        required
                    />
                </div>
                
                {/* Submission Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-lg transition duration-150 ${
                        isSubmitting 
                            ? 'bg-blue-600 cursor-not-allowed text-white' 
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Updating Status...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Submit Review & Update Profile
                        </>
                    )}
                </button>

                {/* Submission Message */}
                {submitMessage && (
                    <div className={`mt-4 p-3 text-sm rounded-lg ${
                        submitMessage.type === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {submitMessage.text}
                    </div>
                )}
                
                {/* Review History */}
                <div className="mt-6 pt-4 border-t border-blue-700">
                    <h4 className="text-md font-bold text-blue-200 flex items-center"><Clock className="w-4 h-4 mr-2" /> Last Review History</h4>
                    <p className="text-sm text-blue-100 mt-2">
                        <span className="font-semibold">Reviewed By:</span> {lastReviewedBy}
                    </p>
                    <p className="text-sm text-blue-100 italic mt-1 max-h-20 overflow-y-auto">
                        <span className="font-semibold not-italic">Notes:</span> {lastReviewNotes || 'No previous notes recorded.'}
                    </p>
                </div>
            </form>
        </div>
    );
};

// Main Component
const VendorDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const vendorId = params.id;

    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [projectExperience, setProjectExperience] = useState([]);
    
    const [qualificationForm, setQualificationForm] = useState({
        newStatus: '',
        vendorClass: 'D',
        qualificationScore: 0,
        assignedReviewerId: null,
        nextReviewDate: '',
        reviewNotes: '',
        categoryIds: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);

    // Get authentication token
    const getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken');
        }
        return null;
    };

    // Data Fetching Logic
    const fetchVendorDetails = useCallback(async () => {
        if (!vendorId) {
            console.error('❌ No vendorId provided');
            return;
        }
        
        const token = getAuthToken();
        console.log('🔍 Debug Info:', {
            tokenExists: !!token,
            vendorId,
            API_BASE_URL
        });

        if (!token) {
            setError('Authentication required. Please log in.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            // ✅ CORRECT ENDPOINT: Use the plural "vendors" that we confirmed works
            const endpoint = `${API_BASE_URL}/api/vendors/${vendorId}`;
            console.log('🚀 Fetching vendor from:', endpoint);
            
            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 10000,
            });
            
            console.log('✅ Success! Response:', {
                status: response.status,
                data: response.data
            });
            
            const data = response.data;
            setVendor(data);

            // Populate state from backend data
            setSelectedCategoryIds(data.categories?.map(c => c.id) || []);
            setProjectExperience(data.projectExperience || []);

            setQualificationForm(prev => ({
                ...prev,
                newStatus: data.status,
                vendorClass: data.vendorClass || 'D',
                qualificationScore: data.qualificationScore || 0,
                assignedReviewerId: data.assignedReviewer?.id || null,
                nextReviewDate: data.profileValidityUntil ? data.profileValidityUntil.substring(0, 10) : '',
                categoryIds: data.categories?.map(c => c.id) || [],
            }));

        } catch (err) {
            console.error('❌ Error fetching vendor:', err);
            
            let errorMessage = 'Could not load vendor data.';
            if (err.response?.status === 404) {
                errorMessage = 'Vendor not found. Please check the vendor ID.';
            } else if (err.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [vendorId]);



    const handleSaveCategories = async (categoryCsiCodes) => {
        try {
          const token = getAuthToken();
          if (!token) throw new Error('Authentication required');
      
          console.log('🔄 Selected CSI codes from frontend:', categoryCsiCodes);
      
          // 1. Get all categories from the newly seeded database
          const categoriesResponse = await axios.get(
            `${API_BASE_URL}/api/categories`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          const allCategories = categoriesResponse.data;
          console.log('📋 All categories from backend:', allCategories);
          
          // 2. Map CSI codes to category IDs
          const categoryIds = categoryCsiCodes.map(csiCode => {
            const category = allCategories.find(cat => {
              console.log(`Comparing: Frontend "${csiCode}" vs Backend "${cat.csiCode}"`);
              return cat.csiCode === csiCode;
            });
            
            if (category) {
              console.log(`✅ Match found: ${csiCode} -> ${category.name} (ID: ${category.id})`);
            } else {
              console.log(`❌ No match for CSI code: ${csiCode}`);
            }
            
            return category ? category.id : null;
          }).filter(id => id !== null);
      
          console.log('📋 Final category IDs to save:', categoryIds);
      
          if (categoryIds.length === 0) {
            throw new Error('No matching categories found. Please check CSI codes.');
          }
      
          // 3. Update vendor with category IDs
          const response = await axios.put(
            `${API_BASE_URL}/api/vendors/${vendor.id}`,
            { 
              categoryIds 
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
      
          console.log('✅ Categories saved successfully!');
          console.log('📦 Response:', response.data);
          
          // Refresh vendor data to show updated categories
          fetchVendorDetails();
          
          return response.data;
        } catch (error) {
          console.error('❌ Failed to save categories:', error);
          
          // Detailed error logging
          if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error status:', error.response.status);
          }
          
          throw error;
        }
      };




      // In your VendorDetailPage component, add the evaluation save handler
const handleEvaluationSave = async (evaluationData) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');
  
      console.log('💾 Saving evaluation:', evaluationData);
  
      // Update vendor with evaluation data
      const response = await axios.put(
        `${API_BASE_URL}/api/vendors/${vendor.id}`,
        { 
          // Map evaluation data to your vendor fields
          qualificationScore: evaluationData.totalScore,
          vendorClass: evaluationData.vendorClass,
          evaluationNotes: evaluationData.notes,
          documentComplianceScore: evaluationData.documentCompliance,
          technicalCapabilityScore: evaluationData.technicalCapability,
          financialStrengthScore: evaluationData.financialStrength,
          experienceScore: evaluationData.experience,
          responsivenessScore: evaluationData.responsiveness,
          lastEvaluatedAt: new Date().toISOString(),
          evaluatedBy: evaluationData.evaluatedBy
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('✅ Evaluation saved successfully:', response.data);
      
      // Refresh vendor data
      fetchVendorDetails();
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to save evaluation:', error);
      throw error;
    }
  };

      
    

    useEffect(() => {
        fetchVendorDetails();
    }, [fetchVendorDetails]);

    // Update form categoryIds when selectedCategoryIds changes
    useEffect(() => {
        setQualificationForm(prev => ({
            ...prev,
            categoryIds: selectedCategoryIds
        }));
    }, [selectedCategoryIds]);

    // Review Submission Logic
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        
        if (!qualificationForm.newStatus || !qualificationForm.reviewNotes || !vendor.id) {
            setSubmitMessage({ type: 'error', text: 'Status, Review Notes, and Vendor ID are required.' });
            return;
        }

        const token = getAuthToken();
        if (!token) {
            setSubmitMessage({ type: 'error', text: 'Authentication required. Please log in.' });
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage(null);
        
        try {
            const payload = {
                ...qualificationForm,
                qualificationScore: parseFloat(qualificationForm.qualificationScore),
                assignedReviewerId: parseInt(qualificationForm.assignedReviewerId) || null,
            };

            // Try different status update endpoints - you may need to test which one works
            const statusEndpoints = [
                `${API_BASE_URL}/api/admin/submissions/${vendor.id}/status`,
                `${API_BASE_URL}/api/vendors/${vendor.id}/status`,
                `${API_BASE_URL}/api/vendors/${vendor.id}`,
            ];

            let success = false;
            for (const endpoint of statusEndpoints) {
                try {
                    console.log('🚀 Trying status update at:', endpoint);
                    await axios.patch(endpoint, payload, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log('✅ Status updated successfully at:', endpoint);
                    success = true;
                    break;
                } catch (endpointErr) {
                    console.log(`❌ Status update failed at ${endpoint}:`, endpointErr.response?.status);
                }
            }

            if (success) {
                setSubmitMessage({ type: 'success', text: `Vendor status updated to ${qualificationForm.newStatus}.` });
                fetchVendorDetails(); // Refresh data
            } else {
                throw new Error('All status update endpoints failed');
            }

        } catch (err) {
            console.error("Failed to update status:", err);
            setSubmitMessage({ 
                type: 'error', 
                text: err.response?.data?.error || err.message || 'Failed to update vendor status.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Render Logic
    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="ml-3 text-lg text-gray-600">Loading vendor details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center h-screen bg-gray-50">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
                <p className="text-gray-600">{error}</p>
                <button 
                    onClick={() => router.back()} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="p-8 text-center text-gray-600">
                Vendor not found.
            </div>
        );
    }

    // Document Rendering Helper
    const renderDocuments = () => {
        if (!vendor.documents || vendor.documents.length === 0) {
            return <p className="text-gray-500 italic">No documents submitted.</p>;
        }

        return (
            <div className="space-y-4">
                {vendor.documents.map(doc => (
                    <div key={doc.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-white transition">
                        <div className="col-span-1 md:col-span-2 flex items-center">
                            <FileIcon className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                            <span className="font-semibold text-gray-800">{doc.docType?.replace(/_/g, ' ') || 'Document'}</span>
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            Exp: {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                            <Hash className="w-4 h-4 mr-1 text-gray-400" />
                            No: {doc.documentNumber || 'N/A'}
                        </div>
                        <div className="col-span-1 md:col-span-1 text-right">
                            {doc.url && (
                                <a 
                                    href={doc.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-medium"
                                >
                                    View File
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    // Project Experience Rendering Helper
    const renderProjects = () => {
        if (!vendor.projectExperience || vendor.projectExperience.length === 0) {
            return <p className="text-gray-500 italic">No project experience provided.</p>;
        }

        return (
            <div className="space-y-4">
                {vendor.projectExperience.map(project => (
                    <div key={project.id} className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                        <h4 className="text-lg font-bold text-blue-600">{project.projectName}</h4>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <DetailItem label="Client Name" value={project.clientName} icon={User} />
                            <DetailItem label="Contract Value" value={`${project.contractValue?.toLocaleString()} SAR`} icon={Save} />
                            <DetailItem label="Start Date" value={project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} icon={Calendar} />
                            <DetailItem label="End Date" value={project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'} icon={Calendar} />
                        </div>
                        <p className="mt-3 text-sm text-gray-700">
                            <span className="font-semibold">Scope:</span> {project.scopeDescription}
                        </p>
                        <div className="mt-3 text-right">
                            {project.completionFile && (
                                <a 
                                    href={project.completionFile} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-medium text-sm"
                                >
                                    View Completion File
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            {/* Header / Title Bar */}            
<header className="bg-white shadow-xl p-6 rounded-xl mb-6">
  {/* Breadcrumb Navigation */}
  <nav className="mb-4">
    <div className="flex items-center space-x-2 text-sm text-gray-500">
      <button 
        onClick={() => router.back()}
        className="flex items-center hover:text-blue-600 transition duration-150"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </button>
      <span>/</span>
      <Link href="/dashboard/procurement/vendors" className="hover:text-blue-600">
        Vendors
      </Link>
      <span>/</span>
      <span className="text-gray-700 font-medium">{vendor.companyName || vendor.companyLegalName}</span>
    </div>
  </nav>

  <div className="flex items-center justify-between flex-wrap gap-4">
    <div className="flex items-center space-x-4">
      {/* Vendor Logo - Only show if logo exists */}
      {vendor.logo && (
        <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden">
          <img 
            src={vendor.logo} 
            alt={`${vendor.companyName} logo`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <Briefcase className="w-7 h-7 mr-3 text-blue-600" />
          {vendor.companyName || vendor.companyLegalName}
        </h1>
        <p className="text-gray-500 mt-1">
          Vendor ID: {vendor.vendorId} | CR No: {vendor.crNumber || vendor.licenseNumber}
        </p>
        {/* Activity Log Link */}
        <button className="text-blue-600 hover:text-blue-800 text-sm mt-1 flex items-center">
          <History className="w-4 h-4 mr-1" />
          View Activity Log
        </button>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg border ${getStatusClass(vendor.status)}`}>
        {vendor.status?.replace(/_/g, ' ') || 'UNKNOWN'}
      </span>
      <span className={`px-4 py-2 text-white text-sm font-bold rounded-full shadow-lg ${vendor.vendorClass === 'A' ? 'bg-indigo-600' : 'bg-gray-600'}`}>
        Class {vendor.vendorClass || 'N/A'}
      </span>
      {/* Profile Validity */}
      {vendor.profileValidityUntil && (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200">
          Valid until: {new Date(vendor.profileValidityUntil).toLocaleDateString()}
        </span>
      )}
    </div>
  </div>
  
  {/* Key Metrics Row - Keep your existing one, it's good! */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-4">
    <DetailItem 
      label="Qualification Score" 
      value={`${vendor.qualificationScore || 0}/100`} 
      icon={Award}
      className="bg-blue-50 border-blue-200"
    />
    <DetailItem 
      label="Profile Validity Until" 
      value={vendor.profileValidityUntil ? new Date(vendor.profileValidityUntil).toLocaleDateString() : 'N/A'} 
      icon={Calendar}
      className="bg-green-50 border-green-200"
    />
    <DetailItem 
      label="Assigned Reviewer" 
      value={vendor.assignedReviewer?.name || 'N/A'} 
      icon={Users}
    />
    <DetailItem 
      label="Last Reviewed By" 
      value={vendor.lastReviewedBy?.name || 'N/A'} 
      icon={Clock}
    />
  </div>
</header>

            {/* Main Content: Details + Review Panel */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Left/Main Column: Vendor Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* A. Enhanced Company Information */}
                <section className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                <SectionHeader title="A. Company Information" icon={Building2} />
                <EnhancedCompanyInfo vendor={vendor} />
                </section>

                    {/* B. Enhanced Contact Information */}
                    <section className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                    <SectionHeader title="B. Contact Information" icon={Users} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Primary Contact */}
                        <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 border-b pb-2">Primary Contact</h4>
                        <DetailItem label="Name" value={vendor.primaryContact?.name} icon={User} />
                        <DetailItem label="Email" value={vendor.primaryContact?.email} icon={Mail} />
                        <DetailItem label="Phone" value={vendor.primaryContact?.phone} icon={Phone} />
                        <DetailItem label="Job Title" value={vendor.primaryContact?.title} />
                        </div>

                        {/* Technical Contact */}
                        <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 border-b pb-2">Technical Contact</h4>
                        <DetailItem label="Name" value={vendor.technicalContact?.name} icon={User} />
                        <DetailItem label="Email" value={vendor.technicalContact?.email} icon={Mail} />
                        <DetailItem label="Phone" value={vendor.technicalContact?.phone} icon={Phone} />
                        </div>

                        {/* Financial Contact */}
                        <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 border-b pb-2">Financial Contact</h4>
                        <DetailItem label="Name" value={vendor.financialContact?.name} icon={User} />
                        <DetailItem label="Email" value={vendor.financialContact?.email} icon={Mail} />
                        <DetailItem label="Phone" value={vendor.financialContact?.phone} icon={Phone} />
                        </div>
                    </div>

                    {/* Additional Contact Information */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                        <DetailItem 
                        label="Company Website" 
                        value={vendor.website ? (
                            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {vendor.website}
                            </a>
                        ) : 'N/A'} 
                        />
                        
                        <DetailItem 
                        label="Head Office Address" 
                        value={vendor.headOfficeLocation} 
                        icon={MapPin}
                        />
                    </div>

                    {/* Organization Chart */}
                    {vendor.organizationChart && (
                        <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold text-gray-700 mb-3">Organization Chart</h4>
                        <a 
                            href={vendor.organizationChart}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                        >
                            <FileText className="w-4 h-4" />
                            <span>View Organization Chart</span>
                        </a>
                        </div>
                    )}
                    </section>

                    {/* C. Enhanced CSI Classification with Backend Integration */}
                    <section className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                    <SectionHeader title="C. CSI Classification & Specializations" icon={Tag} />
                    <CSIClassification 
                        selectedCategories={vendor.categories || []}
                        onCategoriesChange={(newClassifications) => {
                        console.log('Frontend classifications updated:', newClassifications);
                        }}
                        onSave={async (categoryCsiCodes) => {
                        // This function will save to your backend
                        return await handleSaveCategories(categoryCsiCodes);
                        }}
                        vendorType={vendor.vendorType}
                        vendorId={vendor.id}
                    />
                    </section>
                    
                    {/* D. Enhanced Documents & Compliance */}
                    <section className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                        <SectionHeader title="D. Documents & Compliance" icon={FileText} />
                        <DocumentChecklist 
                            documents={vendor.documents || []}
                            vendorType={vendor.vendorType}
                        />
                    </section>

                    {/* E. Project Experience */}
                    <section className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                        <SectionHeader title="E. Project Experience" icon={FileText} />
                        {renderProjects()}
                    </section>

                </div>
                
                {/* Right Column: Review Tabs */}
                <div className="lg:col-span-1">
                <ReviewTabs
                    qualificationProps={{
                    children: (
                        <QualificationPanel 
                        form={qualificationForm}
                        setForm={setQualificationForm}
                        onSubmit={handleReviewSubmit}
                        isSubmitting={isSubmitting}
                        submitMessage={submitMessage}
                        currentReviewerName={vendor.assignedReviewer?.name || 'N/A'}
                        lastReviewedBy={vendor.lastReviewedBy?.name || 'N/A'}
                        lastReviewNotes={vendor.reviewNotes}
                        />
                    )
                    }}
                    evaluationProps={{
                    children: (
                        <EvaluationPanel 
                        vendor={vendor}
                        onEvaluationSave={handleEvaluationSave}
                        currentReviewer={vendor.assignedReviewer}
                        />
                    )
                    }}
                />
                </div>
            </div>
        </div>
    );
};

export default VendorDetailPage;