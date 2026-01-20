// frontend/src/app/dashboard/vendors/profile/page.js - UPDATED
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, Phone, MapPin, Globe, Calendar, 
  Shield, FileText, CheckCircle, AlertCircle, Edit,
  Download, Eye, Users, Briefcase, Package, Clock, 
  RefreshCw, Loader2, TrendingUp, Award, Star, Image
} from 'lucide-react';
import VendorLayout from '../../../vendor-dashboard/layout';
import { useRouter } from 'next/navigation';


const VendorProfilePage = () => {
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }
        
        // Using your existing endpoint: /api/vendors/qualification/me
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/qualification/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform data to match frontend needs
        const transformedData = {
          // Basic Info
          id: data.id,
          vendorId: data.vendorId,
          companyLegalName: data.companyLegalName,
          vendorType: data.vendorType,
          businessType: data.businessType,
          licenseNumber: data.licenseNumber,
          yearsInBusiness: data.yearsInBusiness,
          gosiEmployeeCount: data.gosiEmployeeCount,
          chamberClass: data.chamberClass,
          chamberRegion: data.chamberRegion,
          
          // Contact Info
          primaryContactName: data.primaryContactName,
          primaryContactTitle: data.primaryContactTitle,
          contactPerson: data.contactPerson,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          website: data.website,
          technicalContactName: data.technicalContactName,
          technicalContactEmail: data.technicalContactEmail,
          financialContactName: data.financialContactName,
          financialContactEmail: data.financialContactEmail,
          
          // Address
          addressStreet: data.addressStreet,
          addressCity: data.addressCity,
          addressRegion: data.addressRegion,
          addressCountry: data.addressCountry,
          
          // Status & Qualification
          status: data.status,
          isQualified: data.isQualified,
          vendorClass: data.vendorClass,
          qualificationScore: data.qualificationScore || 0,
          lastReviewedAt: data.lastReviewedAt,
          nextReviewDate: data.nextReviewDate,
          reviewNotes: data.reviewNotes,
          
          // Arrays
          productsAndServices: data.productsAndServices,
          categories: data.categories || [],
          documents: data.documents || [],
          projectExperience: data.projectExperience || [],
          
          // Document Stats (calculate from documents array)
          documentStats: {
            valid: Array.isArray(data.documents) 
              ? data.documents.filter(doc => doc.isValid && (!doc.expiryDate || new Date(doc.expiryDate) > new Date())).length
              : 0,
            expiring: Array.isArray(data.documents) 
              ? data.documents.filter(doc => {
                  if (!doc.isValid || !doc.expiryDate) return false;
                  const expiryDate = new Date(doc.expiryDate);
                  const today = new Date();
                  const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30));
                  return expiryDate > new Date() && expiryDate <= thirtyDaysFromNow;
                }).length
              : 0,
            expired: Array.isArray(data.documents) 
              ? data.documents.filter(doc => !doc.isValid || (doc.expiryDate && new Date(doc.expiryDate) <= new Date())).length
              : 0,
            total: Array.isArray(data.documents) ? data.documents.length : 0
          }
        };
        
        console.log('📊 Vendor profile data loaded:', transformedData);
        setVendorData(transformedData);
        
      } catch (err) {
        console.error('❌ Error fetching vendor profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorProfile();
  }, [router]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleEditProfile = () => {
    router.push('/vendor-dashboard/qualification/edit');
  };

  const handleViewDocument = (doc) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  if (loading) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  if (error) {
    return (
      <VendorLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Profile</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} />
              Retry
            </button>
          </div>
        </div>
      </VendorLayout>
    );
  }

  if (!vendorData) {
    return (
      <VendorLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Profile Found</h2>
            <p className="text-gray-600 mb-6">You need to complete your vendor qualification first.</p>
            <button
              onClick={() => router.push('/vendor-dashboard/qualification')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Qualification
            </button>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header with Logo */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              {vendorData.logo ? (
                <div className="w-16 h-16 rounded-lg border-2 border-blue-200 bg-white p-1 shadow-sm">
                  <img 
                    src={vendorData.logo} 
                    alt={`${vendorData.companyLegalName} Logo`} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                          <Building2 class="w-8 h-8 text-gray-400" />
                        </div>
                      `;
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Company Profile</h1>
                <p className="text-gray-600 mt-2">View and manage your company information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={handleEditProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit size={18} />
                Edit Profile
              </button>
            </div>
          </div>

        {/* Status Banner */}
        <div className={`mb-8 p-4 rounded-xl border-l-4 ${
          vendorData.status === 'APPROVED' ? 'bg-green-50 border-green-400' :
          vendorData.status === 'UNDER_REVIEW' ? 'bg-yellow-50 border-yellow-400' :
          vendorData.status === 'REJECTED' ? 'bg-red-50 border-red-400' :
          'bg-blue-50 border-blue-400'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {vendorData.status === 'APPROVED' && <CheckCircle className="text-green-600" size={24} />}
              {vendorData.status === 'UNDER_REVIEW' && <Clock className="text-yellow-600" size={24} />}
              {vendorData.status === 'REJECTED' && <AlertCircle className="text-red-600" size={24} />}
              <div>
                <h3 className="font-semibold text-gray-800">
                  {vendorData.status === 'APPROVED' ? 'Qualification Approved' :
                   vendorData.status === 'UNDER_REVIEW' ? 'Under Review' :
                   vendorData.status === 'REJECTED' ? 'Requires Attention' : 'Profile Status'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {vendorData.status === 'APPROVED' ? 'Your vendor qualification has been approved.' :
                   vendorData.status === 'UNDER_REVIEW' ? 'Our procurement team is reviewing your submission.' :
                   vendorData.status === 'REJECTED' ? 'Please address the issues noted in your review.' :
                   'Complete your qualification to become an approved vendor.'}
                </p>
              </div>
            </div>
            
            {/* Qualification Badge */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  vendorData.qualificationScore >= 80 ? 'text-green-600' :
                  vendorData.qualificationScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {vendorData.qualificationScore || 0}/100
                </div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                vendorData.vendorClass === 'A' ? 'bg-green-100 text-green-800' :
                vendorData.vendorClass === 'B' ? 'bg-blue-100 text-blue-800' :
                vendorData.vendorClass === 'C' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                Class {vendorData.vendorClass || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Review Notes (if rejected) */}
        {vendorData.status === 'REJECTED' && vendorData.reviewNotes && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Review Notes</h4>
                <p className="text-red-700">{vendorData.reviewNotes}</p>
              </div>
            </div>
          </div>
        )}

       
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Company & Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Company Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Legal Name" value={vendorData.companyLegalName} />
                <InfoField label="Vendor ID" value={vendorData.vendorId} />
                <InfoField label="Vendor Type" value={vendorData.vendorType} />
                <InfoField label="Business Type" value={vendorData.businessType} />
                <InfoField label="License Number" value={vendorData.licenseNumber} />
                <InfoField label="Years in Business" value={vendorData.yearsInBusiness} />
                <InfoField label="GOSI Employees" value={vendorData.gosiEmployeeCount} />
                <div className="md:col-span-2">
                  <InfoField 
                    label="Products & Services" 
                    value={Array.isArray(vendorData.productsAndServices) 
                      ? vendorData.productsAndServices.join(', ')
                      : vendorData.productsAndServices
                    } 
                    multiline
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField label="Primary Contact" value={vendorData.primaryContactName} subValue={vendorData.primaryContactTitle} />
                  <InfoField label="Contact Person" value={vendorData.contactPerson} />
                </div>
                
                <InfoField label="Email" value={vendorData.contactEmail} icon={<Mail size={16} />} />
                <InfoField label="Phone" value={vendorData.contactPhone} icon={<Phone size={16} />} />
                
                {vendorData.website && (
                  <div className="md:col-span-2">
                    <InfoField label="Website" value={vendorData.website} icon={<Globe size={16} />} link />
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Address</h4>
                  <div className="flex items-start gap-2 text-gray-800">
                    <MapPin size={18} className="mt-0.5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p>{vendorData.addressStreet || 'Not specified'}</p>
                      <p>{[vendorData.addressCity, vendorData.addressRegion, vendorData.addressCountry].filter(Boolean).join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Quick Info */}
          <div className="space-y-8">
            {/* Qualification Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Award className="text-purple-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Qualification Summary</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Qualification Score</span>
                    <span className="text-sm font-medium text-gray-800">{vendorData.qualificationScore || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        vendorData.qualificationScore >= 80 ? 'bg-green-500' :
                        vendorData.qualificationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${vendorData.qualificationScore || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <InfoField label="Vendor Class" value={`Class ${vendorData.vendorClass || 'N/A'}`} />
                <InfoField label="Qualified" value={vendorData.isQualified ? 'Yes' : 'No'} />
                <InfoField label="Status" value={vendorData.status?.replace('_', ' ')} />
                <InfoField 
                  label="Last Reviewed" 
                  value={vendorData.lastReviewedAt ? new Date(vendorData.lastReviewedAt).toLocaleDateString() : 'Never'} 
                />
                <InfoField 
                  label="Next Review" 
                  value={vendorData.nextReviewDate ? new Date(vendorData.nextReviewDate).toLocaleDateString() : 'Not scheduled'} 
                />
              </div>
            </div>

            {/* Documents Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="text-orange-600" size={24} />
                  <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
                </div>
                <span className="text-sm font-medium text-gray-700">{vendorData.documentStats.total} total</span>
              </div>
              
              <div className="space-y-4">
                <DocumentStat 
                  label="Valid" 
                  count={vendorData.documentStats.valid} 
                  color="green" 
                  icon={<CheckCircle size={16} />}
                />
                <DocumentStat 
                  label="Expiring Soon" 
                  count={vendorData.documentStats.expiring} 
                  color="orange" 
                  icon={<AlertCircle size={16} />}
                />
                <DocumentStat 
                  label="Expired" 
                  count={vendorData.documentStats.expired} 
                  color="red" 
                  icon={<AlertCircle size={16} />}
                />
                
                <button
                  onClick={() => router.push('/vendor-dashboard/documents')}
                  className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View All Documents
                </button>
              </div>
            </div>

            {/* Categories */}
            {vendorData.categories && vendorData.categories.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="text-indigo-600" size={24} />
                  <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {vendorData.categories.slice(0, 5).map((category, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                      {category.name}
                      {category.csiCode && ` (${category.csiCode})`}
                    </span>
                  ))}
                  {vendorData.categories.length > 5 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      +{vendorData.categories.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

// Helper Components
const InfoField = ({ label, value, subValue, icon, multiline = false, link = false }) => {
  if (!value) return null;
  
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      <div className={`flex items-center gap-2 ${multiline ? 'mt-1' : 'mt-1.5'}`}>
        {icon}
        {link ? (
          <a 
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-words"
          >
            {value}
          </a>
        ) : multiline ? (
          <p className="text-gray-800 font-medium whitespace-pre-wrap break-words">{value}</p>
        ) : (
          <p className="text-gray-800 font-medium truncate">{value}</p>
        )}
      </div>
      {subValue && <p className="text-sm text-gray-600 mt-0.5">{subValue}</p>}
    </div>
  );
};

const DocumentStat = ({ label, count, color, icon }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700'
  };
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-bold text-lg">{count}</span>
    </div>
  );
};

export default VendorProfilePage;