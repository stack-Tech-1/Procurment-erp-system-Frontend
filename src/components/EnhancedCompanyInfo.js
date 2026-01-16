"use client";
import React from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { Building2, MapPin, Calendar, Users, Award, Globe, Hash } from 'lucide-react';

const EnhancedCompanyInfo = ({ vendor }) => {  
  const { t } = useTranslation(); // ADD THIS HOOK
  // Ownership types from your specifications
  const OWNERSHIP_TYPES = ['Local', 'Foreign', 'Joint Venture', 'Government'];
  
  // Business types from your specifications  
  const BUSINESS_TYPES = ['Supplier', 'Contractor', 'Consultant', 'Manufacturer', 'Service Provider'];

  // Chamber classes from your specifications
  const CHAMBER_CLASSES = ['First Class', 'Second Class', 'Third Class', 'Fourth Class', 'Fifth Class', 'Unclassified'];

  return (
    <div className="space-y-6">
      {/* Company Summary Card */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-blue-800 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              {t('companyProfileSummary')}
            </h4>
            <p className="text-sm text-blue-600 mt-1">
              {t('completeBusinessInformation')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-800">
              {vendor.yearsInBusiness || 0} {t('yearsInBusiness')}
            </p>
            <p className="text-xs text-blue-600">
              {vendor.gosiEmployeeCount || 0} {t('gosiEmployees')}
            </p>
          </div>
        </div>
      </div>

      {/* Core Business Information - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ownership & Business Type */}
        <div className="space-y-4">
          <h5 className="font-semibold text-gray-700 border-b pb-2">{t('businessStructure')}</h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('ownershipType')}</label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">
                  {vendor.ownershipType || t('notSpecified')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('businessType')}</label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">
                  {vendor.businessType || t('notSpecified')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('vendorType')}</label>
              <div className="p-2 bg-gray-50 rounded border">
                <span className="text-sm font-medium text-gray-800 capitalize">
                  {vendor.vendorType?.replace(/([A-Z])/g, ' $1').trim() || t('notSpecified')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chamber & Legal Information */}
        <div className="space-y-4">
          <h5 className="font-semibold text-gray-700 border-b pb-2">{t('legalChamber')}</h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('chamberClassification')}</label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">
                  {vendor.chamberClass || t('notClassified')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('chamberRegion')}</label>
              <div className="p-2 bg-gray-50 rounded border">
                <span className="text-sm text-gray-800">
                  {vendor.chamberRegion || t('notSpecified')}
                </span>
              </div>
            </div>

            {vendor.chamberExpiryDate && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('chamberExpiry')}</label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-800">
                    {new Date(vendor.chamberExpiryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location & Contact */}
        <div className="space-y-4">
          <h5 className="font-semibold text-gray-700 border-b pb-2">{t('locationOperations')}</h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('headOffice')}</label>
              <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded border">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-gray-800 block">
                    {vendor.headOfficeLocation || t('notSpecified')}
                  </span>
                  {vendor.addressStreet && (
                    <span className="text-xs text-gray-600 block mt-1">
                      {[vendor.addressStreet, vendor.addressCity, vendor.addressRegion, vendor.addressCountry]
                        .filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('yearsInBusiness')}</label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">
                  {vendor.yearsInBusiness || 0} {t('years')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('gosiEmployees')}</label>
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-800">
                  {vendor.gosiEmployeeCount || 0} {t('employees')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax & Registration Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('commercialRegistrationCr')}</label>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-mono text-gray-800">
              {vendor.crNumber || vendor.licenseNumber || t('notProvided')}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('vatNumber')}</label>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-mono text-gray-800">
              {vendor.vatNumber || t('notProvided')}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{t('website')}</label>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
            <Globe className="w-4 h-4 text-gray-400" />
            {vendor.website ? (
              <a 
                href={vendor.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {vendor.website}
              </a>
            ) : (
              <span className="text-sm text-gray-500">{t('notProvided')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Linked Projects Section */}
      {vendor.linkedProjects && vendor.linkedProjects.length > 0 && (
        <div className="pt-4 border-t">
          <h5 className="font-semibold text-gray-700 mb-3">{t('linkedProjects')}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vendor.linkedProjects.map((project, index) => (
              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-green-800 text-sm">{project.name}</span>
                    <p className="text-xs text-green-600 mt-1">{project.description}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {project.status}
                  </span>
                </div>
                {project.value && (
                  <p className="text-xs text-green-600 mt-2">
                    {t('value')}: {project.value.toLocaleString()} SAR
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSI Categories Summary */}
      {vendor.categories && vendor.categories.length > 0 && (
        <div className="pt-4 border-t">
          <h5 className="font-semibold text-gray-700 mb-3">{t('csiSpecializations')}</h5>
          <div className="flex flex-wrap gap-2">
            {vendor.categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                {category.csiCode && (
                  <span className="font-mono mr-1 bg-blue-200 px-1 rounded">
                    {category.csiCode}
                  </span>
                )}
                {category.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCompanyInfo;