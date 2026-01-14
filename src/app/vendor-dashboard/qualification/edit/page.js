"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, AlertCircle, CheckCircle, Building2, FileText, 
  Edit, RefreshCw, Link, FileCheck, Upload, Image
} from 'lucide-react';


const EditQualificationPage = () => {
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [projectExperience, setProjectExperience] = useState([]);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }
        
        // Fetch vendor qualification data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/qualification/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vendor data: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform API data to match the form structure
        const transformedData = {
          // Company Information
          companyLegalName: data.companyLegalName || '',
          vendorId: data.vendorId || '',
          vendorType: data.vendorType || '',
          businessType: data.businessType || '',
          licenseNumber: data.licenseNumber || '',
          yearsInBusiness: data.yearsInBusiness || '',
          gosiEmployeeCount: data.gosiEmployeeCount || '',
          chamberClass: data.chamberClass || '',
          chamberRegion: data.chamberRegion || '',
          mainCategory: Array.isArray(data.mainCategory) ? data.mainCategory.join(', ') : data.mainCategory || '',
          subCategory: data.subCategory || '',
          productsAndServices: Array.isArray(data.productsAndServices) ? data.productsAndServices.join(', ') : data.productsAndServices || '',
          csiSpecialization: data.csiSpecialization || '',
          
          // Contact Information
          contactPerson: data.contactPerson || '',
          contactPhone: data.contactPhone || '',
          contactEmail: data.contactEmail || '',
          website: data.website || '',
          addressStreet: data.addressStreet || '',
          addressCity: data.addressCity || '',
          addressRegion: data.addressRegion || '',
          addressCountry: data.addressCountry || '',
          primaryContactName: data.primaryContactName || '',
          primaryContactTitle: data.primaryContactTitle || '',
          technicalContactName: data.technicalContactName || '',
          technicalContactEmail: data.technicalContactEmail || '',
          financialContactName: data.financialContactName || '',
          financialContactEmail: data.financialContactEmail || '',
          
          // Logo
          logo: data.logo || null,
          
          // Project Experience
          projectExperience: data.projectExperience || [],
          
          // Store the raw data for reference
          _rawData: data
        };
        
        console.log('📊 Loaded vendor data for editing:', transformedData);
        setVendorData(transformedData);
        setFormData(transformedData);
        setProjectExperience(data.projectExperience || []);
        
        if (data.logo) {
          setLogoPreview(data.logo);
        }
        
      } catch (err) {
        console.error('❌ Error fetching vendor data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorData();
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Handle logo upload separately
    if (name === 'companyLogo' && files && files[0]) {
      const logoFile = files[0];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(logoFile.type)) {
        setError('Please upload a valid image file (JPG, PNG, SVG)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (logoFile.size > 5 * 1024 * 1024) {
        setError('Logo file size must be less than 5MB');
        return;
      }

      setCompanyLogo(logoFile);
      // Create preview URL
      const previewUrl = URL.createObjectURL(logoFile);
      setLogoPreview(previewUrl);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectExperienceChange = (index, field, value) => {
    const updatedProjects = [...projectExperience];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    };
    setProjectExperience(updatedProjects);
  };

  const handleAddProject = () => {
    setProjectExperience(prev => [...prev, {
      projectName: '',
      clientName: '',
      contractValue: 0,
      startDate: '',
      endDate: '',
      scopeDescription: '',
      referenceContact: '',
      completionFile: null
    }]);
  };

  const handleRemoveProject = (index) => {
    setProjectExperience(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare form data
      const finalFormData = new FormData();
      
      // Add logo file if exists
      if (companyLogo) {
        finalFormData.append('companyLogo', companyLogo);
      }

      // Prepare vendor data
      const vendorUpdateData = {
        ...formData,
        yearsInBusiness: parseInt(formData.yearsInBusiness) || 0,
        gosiEmployeeCount: parseInt(formData.gosiEmployeeCount) || 0,
        mainCategory: formData.mainCategory?.split(',').map(s => s.trim()).filter(s => s.length > 0) || [],
        productsAndServices: formData.productsAndServices?.split(',').map(s => s.trim()).filter(s => s.length > 0) || [],
        projectExperience: projectExperience.map(p => ({
          ...p,
          contractValue: parseFloat(p.contractValue) || 0
        })),
        logoUrl: !companyLogo && logoPreview ? logoPreview : null,
      };

      finalFormData.append('vendorData', JSON.stringify(vendorUpdateData));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/qualification/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: finalFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update qualification');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/vendor-dashboard/profile');
      }, 3000);

    } catch (err) {
      console.error('❌ Error updating qualification:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      router.push('/vendor-dashboard/profile');
    }, 3000);
  };

  if (loading) {
    return (
      
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your qualification data...</p>
          </div>
        </div>
      
    );
  }

  if (error && !isSubmitting) {
    return (
      
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      
    );
  }

  if (success) {
    return (
      
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-800 mb-2">Update Successful!</h2>
            <p className="text-green-600 mb-4">
              Your qualification information has been updated successfully. Redirecting to your profile...
            </p>
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {logoPreview ? (
              <div className="w-16 h-16 rounded-lg border-2 border-blue-200 bg-white p-1 shadow-sm">
                <img 
                  src={logoPreview} 
                  alt="Company Logo" 
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Edit Qualification Information
              </h1>
              <p className="text-gray-600">
                Update your company's qualification details. Changes will be submitted for review.
              </p>
            </div>
          </div>
          
          {/* Status Note */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Important Note</p>
                <p className="text-xs text-blue-700 mt-1">
                  Editing your qualification information will resubmit it for review. 
                  Your vendor status may change to "Under Review" until the updates are approved.
                  <br />
                  <strong>Note:</strong> Document management is handled separately in the Documents page.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Identity Section */}
          <section className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Company Identity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                  <span className="text-xs text-gray-500 ml-2">(Optional update)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer bg-white">
                  <input
                    type="file"
                    name="companyLogo"
                    accept=".jpg,.jpeg,.png,.svg"
                    onChange={handleChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center py-4">
                      <Image className="w-10 h-10 text-blue-500 mb-2" />
                      <p className="text-sm text-gray-600">
                        {companyLogo ? companyLogo.name : 'Click to upload new logo'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, SVG (Max 5MB)
                      </p>
                      <button
                        type="button"
                        className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        {companyLogo ? 'Change Logo' : 'Upload Logo'}
                      </button>
                    </div>
                  </label>
                </div>
                
                {logoPreview && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      <span className="font-medium">Current logo:</span> Leave empty to keep existing logo
                    </p>
                  </div>
                )}
              </div>
              
              {/* Logo Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Preview
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-inner">
                  <div className="flex flex-col items-center justify-center h-40">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Company Logo Preview" 
                        className="max-h-32 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Building2 className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">No logo uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* A. Company Information */}
          <section className="bg-blue-50/30 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">A. Company Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Vendor ID
                </label>
                <input
                  type="text"
                  value={formData.vendorId || 'Auto-Generated'}
                  className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Company Legal Name *
                </label>
                <input
                  type="text"
                  name="companyLegalName"
                  value={formData.companyLegalName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Vendor Type */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Vendor Type *
                </label>
                <select
                  name="vendorType"
                  value={formData.vendorType || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Select Vendor Type --</option>
                  <option value="GeneralContractor">General Contractor</option>
                  <option value="ServiceProvider">Service Provider</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Subcontractor">Subcontractor</option>
                  <option value="Distributor">Distributor</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Business Type *
                </label>
                <select
                  name="businessType"
                  value={formData.businessType || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Select Business Type --</option>
                  <option value="Supplier">Supplier</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="ServiceProvider">Service Provider</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Years in Business *
                </label>
                <input
                  type="number"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  GOSI Employee Count *
                </label>
                <input
                  type="number"
                  name="gosiEmployeeCount"
                  value={formData.gosiEmployeeCount || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Chamber of Commerce Cert.
                </label>
                <select
                  name="chamberClass"
                  value={formData.chamberClass || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select Classification --</option>
                  <option value="First">First Class</option>
                  <option value="Second">Second Class</option>
                  <option value="Third">Third Class</option>
                  <option value="Fourth">Fourth Class</option>
                  <option value="Fifth">Fifth Class</option>
                  <option value="Unclassified">Unclassified</option>
                </select>
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Chamber Region/City
                </label>
                <input
                  type="text"
                  name="chamberRegion"
                  value={formData.chamberRegion || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-3 flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Main Categories
                </label>
                <input
                  type="text"
                  name="mainCategory"
                  value={formData.mainCategory || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Comma-separated categories"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Sub-Category / Specialization
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., High-rise glazing"
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Products & Services *
                </label>
                <input
                  type="text"
                  name="productsAndServices"
                  value={formData.productsAndServices || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Comma-separated list"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  CSI Specialization
                </label>
                <input
                  type="text"
                  name="csiSpecialization"
                  value={formData.csiSpecialization || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 09 30 00 - Tiling"
                />
              </div>
            </div>
          </section>

          {/* B. Contact Information */}
          <section className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">B. Contact Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  name="primaryContactName"
                  value={formData.primaryContactName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Primary Contact Title *
                </label>
                <input
                  type="text"
                  name="primaryContactTitle"
                  value={formData.primaryContactTitle || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="+966 5x xxx xxxx"
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Company Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://www.company.com"
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Technical Contact Name
                </label>
                <input
                  type="text"
                  name="technicalContactName"
                  value={formData.technicalContactName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Technical Contact Email
                </label>
                <input
                  type="email"
                  name="technicalContactEmail"
                  value={formData.technicalContactEmail || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Financial Contact Name
                </label>
                <input
                  type="text"
                  name="financialContactName"
                  value={formData.financialContactName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Financial Contact Email
                </label>
                <input
                  type="email"
                  name="financialContactEmail"
                  value={formData.financialContactEmail || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Address Fields */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="addressStreet"
                  value={formData.addressStreet || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  City *
                </label>
                <input
                  type="text"
                  name="addressCity"
                  value={formData.addressCity || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Region/State *
                </label>
                <input
                  type="text"
                  name="addressRegion"
                  value={formData.addressRegion || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-600">
                  Country *
                </label>
                <input
                  type="text"
                  name="addressCountry"
                  value={formData.addressCountry || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </section>

          {/* C. Document Management Link */}
          <section className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <FileCheck className="text-green-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">C. Document Management</h2>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Manage Documents Separately</h4>
                  <p className="text-sm text-gray-600">
                    Upload, view, and manage your compliance documents in the dedicated Documents page.
                    
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Version Control</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Expiry Tracking</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">Status Monitoring</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/vendor-dashboard/documents')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileCheck size={18} />
                    Go to Documents Page
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/vendor-dashboard/documents?filter=expiring')}
                    className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <AlertCircle size={16} />
                    Check Expiring Documents
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Why Separate Document Management?</p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1">
                    <li>• Prevents accidental overwriting of existing documents</li>
                    <li>• Maintains proper version history and audit trail</li>
                    <li>• Provides dedicated expiry tracking and alerts</li>
                    <li>• Offers better organization with filtering and search</li>
                    <li>• Shows document compliance status at a glance</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* D. Project Experience */}
          <section className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">D. Project Experience</h2>
            </div>
            
            <div className="space-y-6">
              {projectExperience.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500 border border-dashed border-gray-300">
                  No project experience added. Click "Add Project" to list your relevant experience.
                </div>
              ) : (
                projectExperience.map((project, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm relative">
                    
                    <h4 className="text-md font-bold mb-4 text-blue-700">Project #{index + 1}</h4>

                    <button
                      type="button"
                      onClick={() => handleRemoveProject(index)}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:text-red-700 transition"
                      title="Remove Project"
                    >
                      ✕
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500">Project Name *</label>
                        <input
                          type="text"
                          value={project.projectName}
                          onChange={(e) => handleProjectExperienceChange(index, 'projectName', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-lg"
                          placeholder="Residential Tower 1"
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-xs font-medium text-gray-500">Client Name *</label>
                        <input
                          type="text"
                          value={project.clientName}
                          onChange={(e) => handleProjectExperienceChange(index, 'clientName', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-lg"
                          placeholder="Emaar, Aramco, etc."
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-xs font-medium text-gray-500">Contract Value (SAR) *</label>
                        <input
                          type="number"
                          value={project.contractValue}
                          onChange={(e) => handleProjectExperienceChange(index, 'contractValue', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 p-2 rounded-lg"
                          placeholder="5000000.00"
                          required
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="text-xs font-medium text-gray-500">Start Date</label>
                        <input
                          type="date"
                          value={project.startDate}
                          onChange={(e) => handleProjectExperienceChange(index, 'startDate', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="text-xs font-medium text-gray-500">End Date</label>
                        <input
                          type="date"
                          value={project.endDate}
                          onChange={(e) => handleProjectExperienceChange(index, 'endDate', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-lg"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500">Scope Description</label>
                        <input
                          type="text"
                          value={project.scopeDescription}
                          onChange={(e) => handleProjectExperienceChange(index, 'scopeDescription', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-lg"
                          placeholder="Briefly describe the scope of work."
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500">Reference Contact</label>
                        <input
                          type="text"
                          value={project.referenceContact}
                          onChange={(e) => handleProjectExperienceChange(index, 'referenceContact', e.target.value)}
                          className="w-full border border-gray-300 p-2 rounded-lg"
                          placeholder="Optional: Contact for verification"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              <button
                type="button"
                onClick={handleAddProject}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-150 shadow-md"
              >
                <span>+</span>
                <span>Add Project</span>
              </button>
            </div>
          </section>

          {/* Submission Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
            <div>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-sm text-gray-600">
                Note: Documents are managed separately
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 font-semibold text-white transition duration-150 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Submit Updates for Review
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    
  );
};

export default EditQualificationPage;