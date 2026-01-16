"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { Search, X, Plus, Building, Hash, Tag, Save, Loader2 } from 'lucide-react';
import { CSI_MAIN_CATEGORIES, CSI_SUBCATEGORIES, VENDOR_SPECIALIZATIONS } from '@/data/csiClassifications';

// Transformation functions for backend-frontend data mapping
const transformBackendToFrontend = (backendCategories = []) => {
  if (!backendCategories || backendCategories.length === 0) {
    return [{ mainCategory: '', subcategories: [], specializations: [] }];
  }
  
  // Transform backend Category objects to frontend format
  return backendCategories.map(cat => ({
    mainCategory: cat.csiCode || '', // Use CSI code as main category
    subcategories: [], // Your backend doesn't store subcategories yet
    specializations: [cat.name], // Use category name as specialization
    backendCategory: cat // Keep original data for reference
  }));
};

const transformFrontendToBackend = (frontendCategories = []) => {
  // For now, we'll return the frontend format for display
  // The actual category IDs will be handled when saving to backend
  return frontendCategories;
};

const CSIClassification = ({ selectedCategories = [], onCategoriesChange, vendorType, vendorId, onSave }) => {
  const { t } = useTranslation(); // ADD THIS HOOK
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubcategories, setShowSubcategories] = useState({});
  const [internalCategories, setInternalCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Initialize categories with proper transformation
  useEffect(() => {
    const transformedCategories = transformBackendToFrontend(selectedCategories);
    setInternalCategories(transformedCategories);
  }, [selectedCategories]);


  // Notify parent when internal categories change
  useEffect(() => {
    if (internalCategories.length > 0) {
      const frontendFormat = transformFrontendToBackend(internalCategories);
      onCategoriesChange(frontendFormat);
    }
  }, [internalCategories, onCategoriesChange]);

  const handleAddCategory = () => {
    const newCategory = { mainCategory: '', subcategories: [], specializations: [] };
    const newCategories = [...internalCategories, newCategory];
    setInternalCategories(newCategories);
  };

  const handleRemoveCategory = (index) => {
    if (internalCategories.length <= 1) return;
    
    const newCategories = internalCategories.filter((_, i) => i !== index);
    setInternalCategories(newCategories);
  };

  const updateCategory = (index, field, value) => {
    const newCategories = internalCategories.map((category, i) => 
      i === index ? { ...category, [field]: value } : category
    );
    setInternalCategories(newCategories);
  };

  const toggleSubcategory = (index, subcategoryId) => {
    const category = internalCategories[index];
    const currentSubcategories = category.subcategories || [];
    
    const newSubcategories = currentSubcategories.includes(subcategoryId)
      ? currentSubcategories.filter(id => id !== subcategoryId)
      : [...currentSubcategories, subcategoryId];
    
    updateCategory(index, 'subcategories', newSubcategories);
  };

  const toggleSpecialization = (index, specialization) => {
    const category = internalCategories[index];
    const currentSpecializations = category.specializations || [];
    
    const newSpecializations = currentSpecializations.includes(specialization)
      ? currentSpecializations.filter(s => s !== specialization)
      : [...currentSpecializations, specialization];
    
    updateCategory(index, 'specializations', newSpecializations);
  };

  const toggleSubcategoryVisibility = (index) => {
    setShowSubcategories(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSaveToBackend = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Prepare data for backend - extract CSI codes from selected main categories
      const categoryCsiCodes = internalCategories
        .filter(cat => cat.mainCategory) // Only categories with main category selected
        .map(cat => cat.mainCategory);
      
      await onSave(categoryCsiCodes);
      setSaveMessage({ type: 'success', text: 'Categories saved successfully!' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save categories.' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMainCategories = CSI_MAIN_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.id.includes(searchTerm)
  );

  const getSubcategoriesForMain = (mainCategoryId) => {
    return CSI_SUBCATEGORIES[mainCategoryId] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header with Summary and Save Button */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-blue-800 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              {t('csiClassificationSystem')}
            </h4>
            <p className="text-sm text-blue-600 mt-1">
              {t('csiSystemDescription')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-800">
              {internalCategories.filter(cat => cat.mainCategory).length} {t('categories')}
            </p>
            <p className="text-xs text-blue-600">
              {internalCategories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0)} {t('subcategories')}
            </p>
          </div>
        </div>

        {/* Save Button */}
        {onSave && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveToBackend}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? t('saving') : t('saveToDatabase')}</span>
            </button>
          </div>
        )}

        {/* Save Message */}
        {saveMessage && (
          <div className={`mt-3 p-2 rounded text-sm ${
            saveMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {saveMessage.text}
          </div>
        )}
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {internalCategories.map((category, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-4">
              <h5 className="font-semibold text-gray-800">{t('category')} {index + 1}</h5>
              {internalCategories.length > 1 && (
                <button
                  onClick={() => handleRemoveCategory(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Main Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('mainCsiCategory')} *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('searchCsiCategories')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Main Category Options */}
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {filteredMainCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      updateCategory(index, 'mainCategory', cat.id);
                      setSearchTerm('');
                    }}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      category.mainCategory === cat.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">{cat.id}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Main Category Display */}
            {category.mainCategory && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-green-800">
                      {CSI_MAIN_CATEGORIES.find(c => c.id === category.mainCategory)?.name}
                    </span>
                    <span className="text-sm text-green-600 ml-2">
                      (CSI {category.mainCategory})
                    </span>
                  </div>
                  <button
                    onClick={() => toggleSubcategoryVisibility(index)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    {showSubcategories[index] ? t('hide') : t('show')} {t('subcategories')}
                  </button>
                </div>
              </div>
            )}

            {/* Subcategories */}
            {category.mainCategory && showSubcategories[index] && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('csiSubcategories')}
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {getSubcategoriesForMain(category.mainCategory).map((subcat) => (
                    <label key={subcat.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={category.subcategories?.includes(subcat.id) || false}
                        onChange={() => toggleSubcategory(index, subcat.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-sm">{subcat.name}</span>
                        <span className="text-xs text-gray-500 block">{subcat.id}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('specializationsKeywords')}
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {category.specializations?.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {spec}
                    <button
                      onClick={() => toggleSpecialization(index, spec)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              {/* Specialization Quick Select */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {VENDOR_SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => toggleSpecialization(index, spec)}
                    disabled={category.specializations?.includes(spec)}
                    className={`p-2 text-xs rounded border transition-colors ${
                      category.specializations?.includes(spec)
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Button */}
      <button
        onClick={handleAddCategory}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        {t('addAnotherCategory')}
      </button>

      {/* Summary */}
      {internalCategories.some(cat => cat.mainCategory) && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h6 className="font-semibold text-gray-700 mb-2">{t('classificationSummary')}</h6>
          <div className="space-y-2 text-sm">
            {internalCategories
              .filter(cat => cat.mainCategory)
              .map((cat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {CSI_MAIN_CATEGORIES.find(c => c.id === cat.mainCategory)?.name}
                  </span>
                  <div className="flex space-x-2">
                    {cat.subcategories?.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {cat.subcategories.length} {t('subcategoriesLower')}
                      </span>
                    )}
                    {cat.specializations?.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                        {cat.specializations.length} {t('specializationsLower')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CSIClassification;