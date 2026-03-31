"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import Link from 'next/link';
import DocumentChecklist from '@/components/DocumentChecklist';
import EvaluationPanel from '@/components/EvaluationPanel';
import CSIClassification from '@/components/CSIClassification';
import ReviewTabs from '@/components/ReviewTabs';
import EnhancedCompanyInfo from '@/components/EnhancedCompanyInfo';
import FilePreviewModal from '@/components/documents/FilePreviewModal';
import DocumentCard from '@/components/documents/DocumentCard';
import {
    Building2, FileText, CheckCircle, Clock, XCircle,
    User, Mail, Phone, MapPin, Loader2, Save, Send,
    FileText as FileIcon, Calendar, Hash,
    Briefcase, Award, Users, Home, CheckSquare, TrendingUp,
    ArrowLeft, History, Download, Tag, Sparkles, AlertTriangle
} from 'lucide-react';

// Use your actual API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


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

   

    // Main Component
    const VendorDetailPage = () => {
        const { t } = useTranslation(); // ADD THIS HOOK
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
        const [previewModal, setPreviewModal] = useState({ isOpen: false, fileUrl: '', fileName: '' });
        const [uploadingDocType, setUploadingDocType] = useState(null);

        // AI Evaluation + Admin Action state
        const [qualification, setQualification] = useState(null);
        const [aiEvalResult, setAiEvalResult] = useState(null);
        const [evalLoading, setEvalLoading] = useState(false);
        const [loadingMsg, setLoadingMsg] = useState('');
        const [scoreDisplay, setScoreDisplay] = useState(0);
        const [barsVisible, setBarsVisible] = useState(false);
        const [showEngineerModal, setShowEngineerModal] = useState(false);
        const [showActionModal, setShowActionModal] = useState(false);
        const [selectedAction, setSelectedAction] = useState(null);
        const [actionForm, setActionForm] = useState({
            vendorClass: 'D', notes: '', nextReviewDate: '',
            assignedReviewerId: '', sendEmailToVendor: true, conditionNote: ''
        });
        const [engineerForm, setEngineerForm] = useState({
            technicalScore: 5, financialScore: 5, experienceScore: 5,
            engineerNotes: '', recommendation: 'APPROVE'
        });
        const [actionToast, setActionToast] = useState(null);

        // Get authentication token
        const getAuthToken = () => {
            if (typeof window !== 'undefined') {
                return localStorage.getItem('authToken');
            }
            return null;
        };
    

        // Helper function to translate status
    const translateStatus = (status) => {
        const statusMap = {
            'APPROVED': t('approved'),
            'REJECTED': t('rejected'),
            'NEEDS_RENEWAL': t('needsRenewal'),
            'UNDER_REVIEW': t('underReview'),
            'NEW': t('new'),
            'BLACKLISTED': t('blacklisted')
        };
        return statusMap[status] || status;
    };

    // Data Fetching Logic
    const fetchVendorDetails = useCallback(async () => {
        if (!vendorId) {
            console.error('❌ No vendorId provided');
            return;
        }
        
        const token = getAuthToken();
        if (!token) {
            setError(t('authenticationRequired'));
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const endpoint = `${API_BASE_URL}/api/vendors/${vendorId}`;
            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 10000,
            });
            
            const data = response.data;
            setVendor(data);

            // Populate qualification state
            const latestQ = data.vendorQualifications?.[0] || null;
            setQualification(latestQ);
            if (latestQ) {
                setEngineerForm(prev => ({
                    ...prev,
                    technicalScore: latestQ.technicalScore || 5,
                    financialScore: latestQ.financialScore || 5,
                    experienceScore: latestQ.experienceScore || 5,
                }));
            }

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
            
            let errorMessage = t('couldNotLoadVendorData');
            if (err.response?.status === 404) {
                errorMessage = t('vendorNotFound');
            } else if (err.response?.status === 401) {
                errorMessage = t('authenticationFailed');
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [vendorId, t]);



        const handleDocumentUpload = async (docType, file) => {
            const token = getAuthToken();
            if (!token) return;
            setUploadingDocType(docType);
            try {
                const formData = new FormData();
                formData.append('file', file);
                await axios.put(
                    `${API_BASE_URL}/api/vendors/${vendorId}/documents/${docType}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                );
                await fetchVendorDetails();
            } catch (err) {
                console.error('Document upload failed:', err);
            } finally {
                setUploadingDocType(null);
            }
        };

        const handleDocumentVerify = async (docType, verified) => {
            const token = getAuthToken();
            if (!token) return;
            try {
                await axios.patch(
                    `${API_BASE_URL}/api/vendors/${vendorId}/documents/${docType}/verify`,
                    { verified },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                await fetchVendorDetails();
            } catch (err) {
                console.error('Document verify failed:', err);
            }
        };

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


        const showToast = (msg, type = 'success') => {
            setActionToast({ msg, type });
            setTimeout(() => setActionToast(null), 4000);
        };

        const handleRunAIEvaluation = async () => {
            const token = getAuthToken();
            if (!token) return;
            setEvalLoading(true);
            setBarsVisible(false);
            setScoreDisplay(0);

            const loadingMessages = [
                'Analyzing vendor documents...',
                'Evaluating technical capability...',
                'Assessing financial strength...',
                'Calculating scores...',
                'Generating recommendation...',
            ];
            let msgIdx = 0;
            setLoadingMsg(loadingMessages[0]);
            const msgInterval = setInterval(() => {
                msgIdx = (msgIdx + 1) % loadingMessages.length;
                setLoadingMsg(loadingMessages[msgIdx]);
            }, 1500);

            try {
                const res = await axios.post(
                    `${API_BASE_URL}/api/ai/evaluate-vendor/${vendorId}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                clearInterval(msgInterval);
                const evalData = res.data.evaluation;
                const qualData = res.data.qualification || res.data;
                setAiEvalResult(evalData);
                setQualification(qualData);

                // Animate score count-up
                const targetScore = Math.round(evalData.totalScore || 0);
                let current = 0;
                const step = Math.ceil(targetScore / 20);
                const countUp = setInterval(() => {
                    current = Math.min(current + step, targetScore);
                    setScoreDisplay(current);
                    if (current >= targetScore) {
                        clearInterval(countUp);
                        setTimeout(() => setBarsVisible(true), 200);
                    }
                }, 50);

                showToast('AI evaluation complete');
            } catch (err) {
                clearInterval(msgInterval);
                showToast(err.response?.data?.error || 'Evaluation failed', 'error');
            } finally {
                setEvalLoading(false);
                setLoadingMsg('');
            }
        };

        const handleEngineerReviewSubmit = async () => {
            const token = getAuthToken();
            if (!token) return;
            if (!engineerForm.engineerNotes.trim()) {
                showToast('Engineer notes are required', 'error');
                return;
            }
            try {
                const res = await axios.post(
                    `${API_BASE_URL}/api/vendors/${vendorId}/evaluation/review`,
                    engineerForm,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setQualification(res.data);
                setShowEngineerModal(false);
                showToast('Engineer review submitted');
            } catch (err) {
                showToast(err.response?.data?.error || 'Review failed', 'error');
            }
        };

        const handleAdminAction = async () => {
            const token = getAuthToken();
            if (!token) return;
            try {
                await axios.post(
                    `${API_BASE_URL}/api/vendors/${vendorId}/qualification/admin-action`,
                    { action: selectedAction, ...actionForm },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setShowActionModal(false);
                setSelectedAction(null);
                showToast(`Action "${selectedAction}" applied successfully`);
                await fetchVendorDetails();
            } catch (err) {
                showToast(err.response?.data?.error || 'Action failed', 'error');
            }
        };

        const DetailItem = ({ label, value, icon: Icon, className = '' }) => (
            <div className={`p-3 bg-gray-50 rounded-lg text-sm border ${className || 'border-gray-200'}`}>
                <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                <div className="flex items-center text-gray-800 font-semibold">
                    {Icon && <Icon className="w-4 h-4 mr-2 flex-shrink-0" />}
                    <span className="truncate">{value || t('na')}</span>
                </div>
            </div>
        );


        const QualificationPanel = ({ form, setForm, onSubmit, isSubmitting, submitMessage, currentReviewerName, lastReviewedBy, lastReviewNotes }) => {
            const { t } = useTranslation(); // ADD THIS HOOK
    
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
                        <span className={`font-bold block ${form.newStatus === status ? 'text-white' : 'text-gray-800'}`}>
                            {translateStatus(status)}
                        </span>
                        <span className="text-xs text-gray-200">{description}</span>
                    </div>
                </label>
            );
    
            return (
                <div className="sticky top-6">
                    <form onSubmit={onSubmit} className="bg-blue-800 p-6 rounded-xl shadow-2xl border-b-8 border-blue-600">
                        <div className="flex items-center mb-6">
                            <CheckSquare className="w-7 h-7 mr-3 text-white" />
                            <h3 className="text-2xl font-bold text-white">{t('qualificationReview')}</h3>
                        </div>
    
                        {/* Status Selection */}
                        <div className="space-y-3 mb-6">
                            <label className="block text-sm font-medium text-blue-100">{t('updateVendorStatus')}</label>
                            <StatusOption status="APPROVED" icon={CheckCircle} color="bg-green-600" description={t('approvedDescription')} />
                            <StatusOption status="NEEDS_RENEWAL" icon={Clock} color="bg-orange-500" description={t('needsRenewalDescription')} />
                            <StatusOption status="REJECTED" icon={XCircle} color="bg-red-600" description={t('rejectedDescription')} />
                            <StatusOption status="BLACKLISTED" icon={XCircle} color="bg-gray-900" description={t('blacklistedDescription')} />
                        </div>
    
                        {/* Classification & Score */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label htmlFor="vendorClass" className="block text-sm font-medium text-blue-100 mb-1">{t('vendorClass')}</label>
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
                                <label htmlFor="qualificationScore" className="block text-sm font-medium text-blue-100 mb-1">{t('qualificationScore')}</label>
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
                                <label htmlFor="assignedReviewerId" className="block text-sm font-medium text-blue-100 mb-1">{t('assignedReviewerId')}</label>
                                <input
                                    type="number"
                                    id="assignedReviewerId"
                                    name="assignedReviewerId"
                                    value={form.assignedReviewerId || ''}
                                    onChange={handleChange}
                                    placeholder={t('reviewerIdPlaceholder')}
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                                />
                            </div>
                            <div>
                                <label htmlFor="nextReviewDate" className="block text-sm font-medium text-blue-100 mb-1">{t('nextReviewDate')}</label>
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
                            <label htmlFor="reviewNotes" className="block text-sm font-medium text-blue-100 mb-1">{t('reviewNotes')}</label>
                            <textarea
                                id="reviewNotes"
                                name="reviewNotes"
                                rows="4"
                                value={form.reviewNotes}
                                onChange={handleChange}
                                placeholder={t('reviewNotesPlaceholder')}
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
                                    {t('updatingStatus')}
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    {t('submitReview')}
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
                            <h4 className="text-md font-bold text-blue-200 flex items-center"><Clock className="w-4 h-4 mr-2" /> {t('lastReviewHistory')}</h4>
                            <p className="text-sm text-blue-100 mt-2">
                                <span className="font-semibold">{t('reviewedBy')}:</span> {lastReviewedBy}
                            </p>
                            <p className="text-sm text-blue-100 italic mt-1 max-h-20 overflow-y-auto">
                                <span className="font-semibold not-italic">{t('notes')}:</span> {lastReviewNotes || t('noPreviousNotes')}
                            </p>
                        </div>
                    </form>
                </div>
            );
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
                return <p className="text-gray-500 italic">{t('noDocumentsSubmitted')}</p>;
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
                                {t('exp')}: {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : t('na')}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center">
                                <Hash className="w-4 h-4 mr-1 text-gray-400" />
                                {t('no')}: {doc.documentNumber || t('na')}
                            </div>
                            <div className="col-span-1 md:col-span-1 text-right">
                                {doc.url && (
                                    <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-medium"
                                    >
                                        {t('viewFile')}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        };
    
        // Update renderProjects function
        const renderProjects = () => {
            if (!vendor.projectExperience || vendor.projectExperience.length === 0) {
                return <p className="text-gray-500 italic">{t('noProjectExperience')}</p>;
            }
    
            return (
                <div className="space-y-4">
                    {vendor.projectExperience.map(project => (
                        <div key={project.id} className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                            <h4 className="text-lg font-bold text-blue-600">{project.projectName}</h4>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <DetailItem label={t('clientName')} value={project.clientName} icon={User} />
                                <DetailItem label={t('contractValue')} value={`${project.contractValue?.toLocaleString()} SAR`} icon={Save} />
                                <DetailItem label={t('startDate')} value={project.startDate ? new Date(project.startDate).toLocaleDateString() : t('na')} icon={Calendar} />
                                <DetailItem label={t('endDate')} value={project.endDate ? new Date(project.endDate).toLocaleDateString() : t('na')} icon={Calendar} />
                            </div>
                            <p className="mt-3 text-sm text-gray-700">
                                <span className="font-semibold">{t('scope')}:</span> {project.scopeDescription}
                            </p>
                            <div className="mt-3 text-right">
                                {project.completionFile && (
                                    <a 
                                        href={project.completionFile} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition font-medium text-sm"
                                    >
                                        {t('viewCompletionFile')}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        };
    
        if (loading) {
            return (
                <div className="p-8 flex justify-center items-center h-screen bg-gray-50">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="ml-3 text-lg text-gray-600">{t('loadingVendorDetails')}</p>
                </div>
            );
        }
    
        if (error) {
            return (
                <div className="p-8 text-center h-screen bg-gray-50">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">{t('error')}</h1>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => router.back()} 
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {t('goBack')}
                    </button>
                </div>
            );
        }
    
        if (!vendor) {
            return (
                <div className="p-8 text-center text-gray-600">
                    {t('vendorNotFound')}
                </div>
            );
        }

        return (
            <>
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
                                {t('backToDashboard')}
                            </button>
                            <span>/</span>
                            <Link href="/dashboard/procurement/vendors" className="hover:text-blue-600">
                                {t('vendors')}
                            </Link>
                            <span>/</span>
                            <span className="text-gray-700 font-medium">{vendor.companyName || vendor.companyLegalName}</span>
                        </div>
                    </nav>
    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
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
                                    {t('vendorId')}: {vendor.vendorId} | {t('crNo')}: {vendor.crNumber || vendor.licenseNumber}
                                </p>
                                <button className="text-blue-600 hover:text-blue-800 text-sm mt-1 flex items-center">
                                    <History className="w-4 h-4 mr-1" />
                                    {t('viewActivityLog')}
                                </button>
                            </div>
                        </div>
    
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg border ${getStatusClass(vendor.status)}`}>
                                {translateStatus(vendor.status) || 'UNKNOWN'}
                            </span>
                            <span className={`px-4 py-2 text-white text-sm font-bold rounded-full shadow-lg ${vendor.vendorClass === 'A' ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                                {t('class')} {vendor.vendorClass || t('na')}
                            </span>
                            {vendor.profileValidityUntil && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200">
                                    {t('validUntil')}: {new Date(vendor.profileValidityUntil).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-4">
                        <DetailItem 
                            label={t('qualificationScore')} 
                            value={`${vendor.qualificationScore || 0}/100`} 
                            icon={Award}
                            className="bg-blue-50 border-blue-200"
                        />
                        <DetailItem 
                            label={t('profileValidityUntil')} 
                            value={vendor.profileValidityUntil ? new Date(vendor.profileValidityUntil).toLocaleDateString() : t('na')} 
                            icon={Calendar}
                            className="bg-green-50 border-green-200"
                        />
                        <DetailItem 
                            label={t('assignedReviewer')} 
                            value={vendor.assignedReviewer?.name || t('na')} 
                            icon={Users}
                        />
                        <DetailItem 
                            label={t('lastReviewedBy')} 
                            value={vendor.lastReviewedBy?.name || t('na')} 
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
                            <SectionHeader title={t('companyInformation')} icon={Building2} />
                            <EnhancedCompanyInfo vendor={vendor} />
                        </section>
    
                        {/* B. Enhanced Contact Information */}
                        <section className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                            <SectionHeader title={t('contactInformation')} icon={Users} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Primary Contact */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700 border-b pb-2">{t('primaryContact')}</h4>
                                    <DetailItem label={t('name')} value={vendor.primaryContact?.name} icon={User} />
                                    <DetailItem label={t('email')} value={vendor.primaryContact?.email} icon={Mail} />
                                    <DetailItem label={t('phone')} value={vendor.primaryContact?.phone} icon={Phone} />
                                    <DetailItem label={t('jobTitle')} value={vendor.primaryContact?.title} />
                                </div>
    
                                {/* Technical Contact */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700 border-b pb-2">{t('technicalContact')}</h4>
                                    <DetailItem label={t('name')} value={vendor.technicalContact?.name} icon={User} />
                                    <DetailItem label={t('email')} value={vendor.technicalContact?.email} icon={Mail} />
                                    <DetailItem label={t('phone')} value={vendor.technicalContact?.phone} icon={Phone} />
                                </div>
    
                                {/* Financial Contact */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700 border-b pb-2">{t('financialContact')}</h4>
                                    <DetailItem label={t('name')} value={vendor.financialContact?.name} icon={User} />
                                    <DetailItem label={t('email')} value={vendor.financialContact?.email} icon={Mail} />
                                    <DetailItem label={t('phone')} value={vendor.financialContact?.phone} icon={Phone} />
                                </div>
                            </div>
    
                            {/* Additional Contact Information */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                                <DetailItem 
                                    label={t('companyWebsite')}
                                    value={vendor.website ? (
                                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {vendor.website}
                                        </a>
                                    ) : t('na')} 
                                />
                                
                                <DetailItem 
                                    label={t('headOfficeAddress')}
                                    value={vendor.headOfficeLocation} 
                                    icon={MapPin}
                                />
                            </div>
    
                            {/* Organization Chart */}
                            {vendor.organizationChart && (
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-semibold text-gray-700 mb-3">{t('organizationChart')}</h4>
                                    <a 
                                        href={vendor.organizationChart}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>{t('viewOrganizationChart')}</span>
                                    </a>
                                </div>
                            )}
                        </section>
    
                        {/* C. Enhanced CSI Classification */}
                        <section className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                            <SectionHeader title={t('csiClassification')} icon={Tag} />
                            <CSIClassification 
                                selectedCategories={vendor.categories || []}
                                onCategoriesChange={(newClassifications) => {
                                    console.log('Frontend classifications updated:', newClassifications);
                                }}
                                onSave={async (categoryCsiCodes) => {
                                    return await handleSaveCategories(categoryCsiCodes);
                                }}
                                vendorType={vendor.vendorType}
                                vendorId={vendor.id}
                            />
                        </section>
                        
                        {/* D. Enhanced Documents & Compliance */}
                        <section className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                            <SectionHeader title={t('documentsCompliance')} icon={FileText} />
                            {(() => {
                                const userRoleId = typeof window !== 'undefined'
                                    ? (JSON.parse(localStorage.getItem('user') || '{}').roleId || 99)
                                    : 99;
                                const canVerify = userRoleId <= 3;
                                const DOC_TYPES = [
                                    { key: 'COMMERCIAL_REGISTRATION', label: 'Commercial Registration (CR)', requiredFor: 'BOTH' },
                                    { key: 'ZAKAT_CERTIFICATE', label: 'Zakat Certificate', requiredFor: 'BOTH' },
                                    { key: 'VAT_CERTIFICATE', label: 'VAT Certificate', requiredFor: 'BOTH' },
                                    { key: 'GOSI_CERTIFICATE', label: 'GOSI Certificate', requiredFor: 'BOTH' },
                                    { key: 'ISO_CERTIFICATE', label: 'ISO Certificate', requiredFor: 'BOTH' },
                                    { key: 'SASO_SABER_CERTIFICATE', label: 'SASO/SABER Certificate', requiredFor: 'SUPPLIER' },
                                    { key: 'HSE_PLAN', label: 'HSE Plan', requiredFor: 'CONTRACTOR' },
                                    { key: 'WARRANTY_CERTIFICATE', label: 'Warranty Certificate', requiredFor: 'BOTH' },
                                    { key: 'QUALITY_PLAN', label: 'Quality Plan', requiredFor: 'BOTH' },
                                    { key: 'BANK_LETTER', label: 'Bank Letter', requiredFor: 'BOTH' },
                                    { key: 'COMPANY_PROFILE', label: 'Company Profile', requiredFor: 'BOTH' },
                                    { key: 'TECHNICAL_FILE', label: 'Technical File', requiredFor: 'BOTH' },
                                    { key: 'FINANCIAL_FILE', label: 'Financial File', requiredFor: 'BOTH' },
                                    { key: 'INSURANCE_CERTIFICATE', label: 'Insurance Certificate', requiredFor: 'BOTH' },
                                    { key: 'INDUSTRY_LICENSE', label: 'Industry License', requiredFor: 'BOTH' },
                                    { key: 'VENDOR_CODE_OF_CONDUCT', label: 'Code of Conduct', requiredFor: 'BOTH' },
                                    { key: 'ORGANIZATION_CHART', label: 'Organization Chart', requiredFor: 'BOTH' },
                                ];
                                const docs = vendor.documents || [];
                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {DOC_TYPES.map(({ key, label, requiredFor }) => {
                                            const doc = docs.find(d => d.docType === key) || null;
                                            return (
                                                <DocumentCard
                                                    key={key}
                                                    docType={key}
                                                    label={label}
                                                    document={doc}
                                                    requiredFor={requiredFor}
                                                    isUploading={uploadingDocType === key}
                                                    canVerify={canVerify}
                                                    onUpload={(file) => handleDocumentUpload(key, file)}
                                                    onPreview={({ fileUrl, fileName }) =>
                                                        setPreviewModal({ isOpen: true, fileUrl, fileName })
                                                    }
                                                    onVerify={(verified) => handleDocumentVerify(key, verified)}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </section>
    
                        {/* E. Project Experience */}
                        <section className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                            <SectionHeader title={t('projectExperience')} icon={FileText} />
                            {renderProjects()}
                        </section>
                    </div>
                    
                    {/* Right Column: AI Evaluation + Admin Action Panel */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Toast */}
                        {actionToast && (
                            <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all ${
                                actionToast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
                            }`}>
                                {actionToast.msg}
                            </div>
                        )}

                        {/* Section A: AI Evaluation Panel */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 pb-3 border-b-2 border-blue-100/70 mb-5">
                                <Sparkles className="w-6 h-6" style={{ color: '#B8960A' }} />
                                <h2 className="text-xl font-extrabold text-gray-800">AI Evaluation</h2>
                                {(qualification?.isAIGenerated || aiEvalResult) && (
                                    <span className="ml-auto flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                        <Sparkles className="w-3 h-3" /> AI Generated
                                    </span>
                                )}
                            </div>

                            {/* Loading state */}
                            {evalLoading && (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#B8960A' }} />
                                    <p className="text-sm font-medium text-gray-600 animate-pulse">{loadingMsg}</p>
                                </div>
                            )}

                            {/* No evaluation yet */}
                            {!evalLoading && !qualification?.totalScore && !aiEvalResult && (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 text-sm mb-5">No evaluation yet. Run AI scoring to generate a qualification score.</p>
                                    <button
                                        onClick={handleRunAIEvaluation}
                                        className="px-5 py-2.5 rounded-lg text-white font-semibold text-sm flex items-center mx-auto gap-2"
                                        style={{ backgroundColor: '#B8960A' }}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Run AI Evaluation
                                    </button>
                                </div>
                            )}

                            {/* Rich results panel — shows after evaluation */}
                            {!evalLoading && (qualification?.totalScore || aiEvalResult) && (() => {
                                const eval_ = aiEvalResult || {};
                                const score = eval_.totalScore || qualification?.totalScore || 0;
                                const displayScore = aiEvalResult ? scoreDisplay : Math.round(score);
                                const scoreColor = score >= 85 ? '#22c55e' : score >= 70 ? '#B8960A' : score >= 50 ? '#f97316' : '#ef4444';
                                const vc = eval_.vendorClass || vendor.vendorClass || 'D';
                                const vcColor = vc === 'A' ? '#22c55e' : vc === 'B' ? '#B8960A' : vc === 'C' ? '#f97316' : '#ef4444';
                                const riskColor = eval_.riskLevel === 'LOW' ? 'text-green-700 bg-green-50' : eval_.riskLevel === 'HIGH' ? 'text-red-700 bg-red-50' : 'text-orange-700 bg-orange-50';
                                const bars = [
                                    { label: 'Document Compliance', weight: '20%', score: eval_.documentScore ?? qualification?.documentScore, color: '#0A1628' },
                                    { label: 'Technical Capability', weight: '25%', score: eval_.technicalScore ?? qualification?.technicalScore, color: '#B8960A' },
                                    { label: 'Financial Strength', weight: '20%', score: eval_.financialScore ?? qualification?.financialScore, color: '#22c55e' },
                                    { label: 'Experience', weight: '25%', score: eval_.experienceScore ?? qualification?.experienceScore, color: '#3b82f6' },
                                    { label: 'Responsiveness', weight: '10%', score: eval_.responsivenessScore ?? qualification?.responsivenessScore, color: '#8b5cf6' },
                                ];
                                const recBanner = eval_.recommendation === 'APPROVE'
                                    ? { text: 'AI Recommends: Approve this vendor', cls: 'bg-green-50 border-green-300 text-green-800' }
                                    : eval_.recommendation === 'CONDITIONAL_APPROVE'
                                    ? { text: 'AI Recommends: Conditional Approval — review conditions', cls: 'bg-amber-50 border-amber-300 text-amber-800' }
                                    : eval_.recommendation === 'REJECT'
                                    ? { text: 'AI Recommends: Do not approve this vendor', cls: 'bg-red-50 border-red-300 text-red-800' }
                                    : null;

                                return (
                                    <div>
                                        {/* Score card */}
                                        <div className="flex items-center justify-center mb-5">
                                            <div className="relative w-28 h-28">
                                                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                                                    <circle
                                                        cx="50" cy="50" r="42" fill="none"
                                                        stroke={scoreColor}
                                                        strokeWidth="10"
                                                        strokeDasharray={`${(displayScore / 100) * 263.9} 263.9`}
                                                        strokeLinecap="round"
                                                        style={{ transition: 'stroke-dasharray 0.05s linear' }}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-extrabold text-gray-800">{displayScore}</span>
                                                    <span className="text-xs text-gray-500">/ 100</span>
                                                </div>
                                            </div>
                                            <div className="ml-4 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500">Class</span>
                                                    <span className="text-2xl font-black" style={{ color: vcColor }}>{vc}</span>
                                                </div>
                                                {eval_.riskLevel && (
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskColor}`}>
                                                        {eval_.riskLevel} RISK
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Score bars */}
                                        <div className="space-y-2 mb-4">
                                            {bars.map(({ label, weight, score: s, color }, idx) => (
                                                <div key={label}>
                                                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                                                        <span className="font-medium">{label} <span className="text-gray-400">({weight})</span></span>
                                                        <span className="font-bold">{s != null ? Number(s).toFixed(1) : '—'}/10</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-2 rounded-full transition-all duration-700"
                                                            style={{
                                                                width: barsVisible && s != null ? `${(s / 10) * 100}%` : '0%',
                                                                backgroundColor: color,
                                                                transitionDelay: `${idx * 150}ms`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Strengths & Weaknesses */}
                                        {(eval_.strengths?.length > 0 || eval_.weaknesses?.length > 0) && (
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                {eval_.strengths?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-green-700 mb-1">Strengths</p>
                                                        <ul className="space-y-1">
                                                            {eval_.strengths.map((s, i) => (
                                                                <li key={i} className="flex items-start gap-1 text-xs text-gray-700">
                                                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                                    {s}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {eval_.weaknesses?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-red-700 mb-1">Weaknesses</p>
                                                        <ul className="space-y-1">
                                                            {eval_.weaknesses.map((w, i) => (
                                                                <li key={i} className="flex items-start gap-1 text-xs text-gray-700">
                                                                    <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                                                    {w}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* AI Evaluation Notes */}
                                        {(eval_.evaluationNotes || qualification?.aiEvaluationNotes) && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                                <p className="text-xs italic text-gray-600">
                                                    {eval_.evaluationNotes || qualification?.aiEvaluationNotes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Recommendation banner */}
                                        {recBanner && (
                                            <div className={`border rounded-lg px-3 py-2 mb-4 text-xs font-semibold ${recBanner.cls}`}>
                                                {recBanner.text}
                                                <p className="mt-1 font-normal text-gray-500">Engineer Review Required before final action.</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleRunAIEvaluation}
                                                disabled={evalLoading}
                                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-1"
                                            >
                                                <Sparkles className="w-3 h-3" /> Re-evaluate
                                            </button>
                                            <button
                                                onClick={() => setShowEngineerModal(true)}
                                                className="flex-1 px-3 py-2 rounded-lg text-white text-xs font-semibold"
                                                style={{ backgroundColor: '#0A1628' }}
                                            >
                                                Engineer Review
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Section B: Manager Action Panel */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 pb-3 border-b-2 border-blue-100/70 mb-5">
                                <CheckSquare className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-extrabold text-gray-800">Qualification Action</h2>
                            </div>

                            <p className="text-xs text-gray-500 mb-4">Current status: <span className="font-bold text-gray-800">{vendor.status}</span></p>

                            <div className="space-y-2">
                                {[
                                    { action: 'APPROVE', label: 'Approve', color: 'bg-green-600 hover:bg-green-700' },
                                    { action: 'CONDITIONAL_APPROVE', label: 'Conditional Approve', color: 'bg-teal-600 hover:bg-teal-700' },
                                    { action: 'REJECT', label: 'Reject', color: 'bg-red-600 hover:bg-red-700' },
                                    { action: 'NEEDS_RENEWAL', label: 'Needs Renewal', color: 'bg-orange-500 hover:bg-orange-600' },
                                    { action: 'SEND_FOR_CORRECTION', label: 'Send for Correction', color: 'bg-blue-500 hover:bg-blue-600' },
                                    { action: 'TEMPORARY_HOLD', label: 'Temporary Hold', color: 'bg-yellow-600 hover:bg-yellow-700' },
                                    { action: 'BLACKLIST', label: 'Blacklist', color: 'bg-gray-800 hover:bg-gray-900' },
                                ].map(({ action, label, color }) => (
                                    <button
                                        key={action}
                                        onClick={() => { setSelectedAction(action); setShowActionModal(true); }}
                                        className={`w-full px-4 py-2.5 rounded-lg text-white text-sm font-semibold text-left ${color} transition-colors`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Engineer Review Modal */}
                        {showEngineerModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Engineer Review</h3>

                                    {[
                                        { key: 'technicalScore', label: 'Technical Score' },
                                        { key: 'financialScore', label: 'Financial Score' },
                                        { key: 'experienceScore', label: 'Experience Score' },
                                    ].map(({ key, label }) => (
                                        <div key={key} className="mb-4">
                                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                                <span>{label}</span><span>{engineerForm[key]} / 10</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="10" step="0.5"
                                                value={engineerForm[key]}
                                                onChange={e => setEngineerForm(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                                                className="w-full accent-yellow-600"
                                            />
                                        </div>
                                    ))}

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Recommendation *</label>
                                        <div className="flex gap-3">
                                            {['APPROVE', 'REJECT', 'NEEDS_MORE_INFO'].map(rec => (
                                                <label key={rec} className="flex items-center gap-1 text-sm cursor-pointer">
                                                    <input
                                                        type="radio" name="recommendation" value={rec}
                                                        checked={engineerForm.recommendation === rec}
                                                        onChange={() => setEngineerForm(prev => ({ ...prev, recommendation: rec }))}
                                                    />
                                                    {rec.replace(/_/g, ' ')}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Engineer Notes *</label>
                                        <textarea
                                            rows={3}
                                            value={engineerForm.engineerNotes}
                                            onChange={e => setEngineerForm(prev => ({ ...prev, engineerNotes: e.target.value }))}
                                            placeholder="Detailed review notes..."
                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setShowEngineerModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium">Cancel</button>
                                        <button onClick={handleEngineerReviewSubmit} className="flex-1 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: '#0A1628' }}>Submit Review</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin Action Modal */}
                        {showActionModal && selectedAction && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{selectedAction.replace(/_/g, ' ')}</h3>
                                    <p className="text-xs text-gray-500 mb-4">Confirm action for <span className="font-semibold">{vendor.companyLegalName || vendor.user?.name}</span></p>

                                    {['APPROVE', 'CONDITIONAL_APPROVE'].includes(selectedAction) && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Class *</label>
                                            <select
                                                value={actionForm.vendorClass}
                                                onChange={e => setActionForm(prev => ({ ...prev, vendorClass: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                            >
                                                {['A', 'B', 'C', 'D'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {selectedAction === 'CONDITIONAL_APPROVE' && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition Note *</label>
                                            <textarea
                                                rows={2}
                                                value={actionForm.conditionNote}
                                                onChange={e => setActionForm(prev => ({ ...prev, conditionNote: e.target.value }))}
                                                placeholder="Describe the condition..."
                                                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                            />
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea
                                            rows={3}
                                            value={actionForm.notes}
                                            onChange={e => setActionForm(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Review notes..."
                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Review Date</label>
                                        <input
                                            type="date"
                                            value={actionForm.nextReviewDate}
                                            onChange={e => setActionForm(prev => ({ ...prev, nextReviewDate: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                                        />
                                    </div>

                                    <div className="mb-5">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={actionForm.sendEmailToVendor}
                                                onChange={e => setActionForm(prev => ({ ...prev, sendEmailToVendor: e.target.checked }))}
                                                className="w-4 h-4 accent-blue-600"
                                            />
                                            <span className="text-sm text-gray-700">Send notification email to vendor</span>
                                        </label>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => { setShowActionModal(false); setSelectedAction(null); }} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium">Cancel</button>
                                        <button onClick={handleAdminAction} className="flex-1 px-4 py-2 rounded-lg text-white text-sm font-semibold bg-blue-700 hover:bg-blue-800">Confirm</button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <FilePreviewModal
                isOpen={previewModal.isOpen}
                onClose={() => setPreviewModal({ isOpen: false, fileUrl: '', fileName: '' })}
                fileUrl={previewModal.fileUrl}
                fileName={previewModal.fileName}
            />
            </>
        );
    };

    export default VendorDetailPage;