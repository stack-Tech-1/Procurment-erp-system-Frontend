// frontend/src/components/reports/ReportBuilder.js
"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { Save, X, Plus, Trash2, FileText, Users, ClipboardList, DollarSign, Building } from 'lucide-react';

const ReportBuilder = ({ report = null, onSave, onCancel }) => {
  const { t } = useTranslation(); // ADD THIS HOOK
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'CUSTOM',
    dataSource: 'vendors',
    isPublic: false,
    filters: [],
    columns: []
  });

  const [errors, setErrors] = useState({});

  // Data source options
  const dataSources = [
    { value: 'vendors', label: t('vendors'), icon: Users, description: t('vendorsDataSourceDescription') },
    { value: 'contracts', label: t('contracts'), icon: FileText, description: t('contractsDataSourceDescription') },
    { value: 'rfqs', label: t('rfqs'), icon: ClipboardList, description: t('rfqsDataSourceDescription') },
    { value: 'financial', label: t('financialOverview'), icon: DollarSign, description: t('financialDataSourceDescription') }
  ];

  // Available fields by data source
  const fieldOptions = {
    vendors: [
      { field: 'companyLegalName', label: t('companyName'), type: 'string' },
      { field: 'vendorType', label: t('vendorType'), type: 'string' },
      { field: 'status', label: t('status'), type: 'string' },
      { field: 'vendorClass', label: t('vendorClass'), type: 'string' },
      { field: 'qualificationScore', label: t('qualificationScore'), type: 'number' },
      { field: 'documentCount', label: t('documentCount'), type: 'number' },
      { field: 'contractCount', label: t('contractCount'), type: 'number' },
      { field: 'totalContractValue', label: t('totalContractValue'), type: 'currency' }
    ],
    contracts: [
      { field: 'contractNumber', label: t('contractNumber'), type: 'string' },
      { field: 'vendor', label: t('vendor'), type: 'string' },
      { field: 'contractValue', label: t('contractValue'), type: 'currency' },
      { field: 'status', label: t('status'), type: 'string' },
      { field: 'startDate', label: t('startDate'), type: 'date' },
      { field: 'endDate', label: t('endDate'), type: 'date' }
    ]
  };

  useEffect(() => {
    if (report) {
      setFormData({
        name: report.name || '',
        description: report.description || '',
        category: report.category || 'CUSTOM',
        dataSource: report.dataSource || 'vendors',
        isPublic: report.isPublic || false,
        filters: report.filters || [],
        columns: report.columns || []
      });
    }
  }, [report]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('reportNameRequired');
    }
    
    if (!formData.dataSource) {
      newErrors.dataSource = t('dataSourceRequired');
    }
    
    if (formData.columns.length === 0) {
      newErrors.columns = t('atLeastOneColumnRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const addFilter = () => {
    setFormData(prev => ({
      ...prev,
      filters: [...prev.filters, {
        fieldName: '',
        filterLabel: '',
        filterType: 'text',
        defaultValue: '',
        sortOrder: prev.filters.length,
        isRequired: false
      }]
    }));
  };

  const removeFilter = (index) => {
    setFormData(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const updateFilter = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      filters: prev.filters.map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      )
    }));
  };

  const toggleColumn = (field) => {
    setFormData(prev => {
      const existingIndex = prev.columns.findIndex(col => col.fieldName === field.field);
      
      if (existingIndex >= 0) {
        // Remove column
        return {
          ...prev,
          columns: prev.columns.filter((_, i) => i !== existingIndex)
        };
      } else {
        // Add column
        return {
          ...prev,
          columns: [
            ...prev.columns,
            {
              fieldName: field.field,
              columnLabel: field.label,
              dataType: field.type.toUpperCase(),
              aggregationType: 'NONE',
              sortOrder: prev.columns.length,
            }
          ]
        };
      }
    });
  };

  const isColumnSelected = (fieldName) => {
    return formData.columns.some(col => col.fieldName === fieldName);
  };

  const availableFields = fieldOptions[formData.dataSource] || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {report ? t('editReport') : t('createNewReport')}
          </h1>
          <p className="text-gray-600">
            {report ? t('editing') : t('creating')}: {formData.name || t('newReport')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('saveReport')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('basicInformation')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reportName')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('reportNamePlaceholder')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('category')}
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="FINANCIAL">{t('financial')}</option>
                <option value="VENDOR">{t('vendor')}</option>
                <option value="CONTRACT">{t('contract')}</option>
                <option value="PROJECT">{t('project')}</option>
                <option value="CUSTOM">{t('custom')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('reportDescriptionPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Data Source Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('dataSource')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataSources.map((source) => (
              <div
                key={source.value}
                className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  formData.dataSource === source.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('dataSource', source.value)}
              >
                <div className="flex items-center mb-2">
                  <source.icon className={`w-5 h-5 ${
                    formData.dataSource === source.value ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <span className={`ml-2 font-medium ${
                    formData.dataSource === source.value ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {source.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{source.description}</p>
              </div>
            ))}
          </div>
          {errors.dataSource && (
            <p className="mt-2 text-sm text-red-600">{errors.dataSource}</p>
          )}
        </div>

        {/* Available Fields */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {t('availableFields')} ({availableFields.length})
          </h2>
          <p className="text-gray-600 mb-4">{t('selectFieldsDescription')}</p>
          
          {errors.columns && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">{errors.columns}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableFields.map((field) => (
              <button
                key={field.field}
                onClick={() => toggleColumn(field)}
                className={`p-3 border rounded-lg text-left transition ${
                  isColumnSelected(field.field)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{field.label}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isColumnSelected(field.field)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {field.type}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Columns */}
        {formData.columns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {t('selectedColumns')} ({formData.columns.length})
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {formData.columns.map((column, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {column.columnLabel}
                    <button
                      onClick={() => toggleColumn({ field: column.fieldName })}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{t('filters')}</h2>
            <button
              onClick={addFilter}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('addFilter')}
            </button>
          </div>

          {formData.filters.map((filter, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">{t('filter')} {index + 1}</h3>
                <button
                  onClick={() => removeFilter(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('field')}
                  </label>
                  <select
                    value={filter.fieldName}
                    onChange={(e) => updateFilter(index, 'fieldName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">{t('selectField')}</option>
                    {availableFields.map(field => (
                      <option key={field.field} value={field.field}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('filterType')}
                  </label>
                  <select
                    value={filter.filterType}
                    onChange={(e) => updateFilter(index, 'filterType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="text">{t('text')}</option>
                    <option value="number">{t('number')}</option>
                    <option value="date">{t('date')}</option>
                    <option value="select">{t('select')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('label')}
                  </label>
                  <input
                    type="text"
                    value={filter.filterLabel}
                    onChange={(e) => updateFilter(index, 'filterLabel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder={t('userFriendlyLabel')}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visibility Settings */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-700">{t('reportVisibility')}</h3>
            <p className="text-sm text-gray-600">
              {t('makeReportPublicDescription')}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;