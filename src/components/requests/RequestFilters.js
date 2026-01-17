// frontend/src/components/requests/RequestFilters.js
"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS
import { 
  Filter, 
  Search, 
  X, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { REQUEST_TYPES, REQUEST_STATUS, PRIORITY_LEVELS } from '@/utils/mockRequests';

const RequestFilters = ({ 
  activeFilters, 
  onFilterChange, 
  onClearFilters,
  onSearch,
  isVendorView = true 
}) => {
  const { t } = useTranslation(); // ADD THIS
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(activeFilters.search || '');
  const [dateRange, setDateRange] = useState({
    startDate: activeFilters.dateRange?.startDate || '',
    endDate: activeFilters.dateRange?.endDate || ''
  });

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleStatusChange = (status) => {
    onFilterChange({ status: status === activeFilters.status ? '' : status });
  };

  const handleTypeChange = (type) => {
    onFilterChange({ type: type === activeFilters.type ? '' : type });
  };

  const handlePriorityChange = (priority) => {
    onFilterChange({ priority: priority === activeFilters.priority ? '' : priority });
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    
    if (newDateRange.startDate && newDateRange.endDate) {
      onFilterChange({ dateRange: newDateRange });
    }
  };

  const clearDateRange = () => {
    setDateRange({ startDate: '', endDate: '' });
    onFilterChange({ dateRange: null });
  };

  const hasActiveFilters = () => {
    return activeFilters.status || activeFilters.type || activeFilters.priority || 
           activeFilters.search || activeFilters.dateRange;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.status) count++;
    if (activeFilters.type) count++;
    if (activeFilters.priority) count++;
    if (activeFilters.search) count++;
    if (activeFilters.dateRange) count++;
    return count;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <span className="font-medium text-gray-700">{t('filters')}</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFilterCount()} {t('active')}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
            >
              <X size={14} />
              {t('clearAll')}
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showFilters ? t('hide') : t('show')} {t('filters')}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder={t('searchRequestsPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="space-y-6 pt-4 border-t border-gray-100">
          {/* Status Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('status')}</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(REQUEST_STATUS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  className={`
                    px-3 py-1.5 text-sm rounded-full border transition-colors
                    ${activeFilters.status === key 
                      ? `${config.bgColor} ${config.borderColor} font-medium`
                      : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filters */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('requestType')}</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(REQUEST_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key)}
                  className={`
                    px-3 py-1.5 text-sm rounded-full border transition-colors
                    ${activeFilters.type === key 
                      ? `bg-${config.color}-100 border-${config.color}-200 text-${config.color}-800 font-medium`
                      : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filters */}
          {!isVendorView && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t('priority')}</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRIORITY_LEVELS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handlePriorityChange(key)}
                    className={`
                      px-3 py-1.5 text-sm rounded-full border transition-colors
                      ${activeFilters.priority === key 
                        ? `bg-${config.color}-100 border-${config.color}-200 text-${config.color}-800 font-medium`
                        : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">{t('dateRange')}</h4>
              {(dateRange.startDate || dateRange.endDate) && (
                <button
                  onClick={clearDateRange}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  {t('clearDates')}
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('fromDate')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('toDate')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {activeFilters.dateRange && (
              <div className="mt-2 text-xs text-gray-500">
                {t('showingRequestsFromTo', { start: dateRange.startDate, end: dateRange.endDate })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {activeFilters.status && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {t('status')}: {REQUEST_STATUS[activeFilters.status].label}
                <button
                  onClick={() => handleStatusChange(activeFilters.status)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            {activeFilters.type && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {t('type')}: {REQUEST_TYPES[activeFilters.type].label}
                <button
                  onClick={() => handleTypeChange(activeFilters.type)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            {activeFilters.priority && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {t('priority')}: {PRIORITY_LEVELS[activeFilters.priority].label}
                <button
                  onClick={() => handlePriorityChange(activeFilters.priority)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            {activeFilters.search && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {t('search')}: "{activeFilters.search}"
                <button
                  onClick={() => {
                    setSearchTerm('');
                    onSearch('');
                  }}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            
            {activeFilters.dateRange && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {t('dateRange')}: {dateRange.startDate} {t('to')} {dateRange.endDate}
                <button
                  onClick={clearDateRange}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestFilters;