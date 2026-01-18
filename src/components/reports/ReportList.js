// frontend/src/components/reports/ReportList.js
"use client";
import React from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { 
  Plus, 
  Star, 
  StarOff, 
  BarChart3, 
  Table, 
  Calendar,
  Clock,
  Eye,
  Edit,
  User
} from 'lucide-react';

const ReportList = ({ 
  reports = [], 
  loading = false, 
  filters = {}, 
  onFilterChange, 
  onEditReport, 
  onViewReport, 
  onCreateReport, 
  onToggleFavorite 
}) => {
  const { t } = useTranslation(); // ADD THIS HOOK

  const getCategoryColor = (category) => {
    const colors = {
      FINANCIAL: 'bg-green-100 text-green-800 border-green-200',
      VENDOR: 'bg-blue-100 text-blue-800 border-blue-200',
      CONTRACT: 'bg-orange-100 text-orange-800 border-orange-200',
      PROJECT: 'bg-purple-100 text-purple-800 border-purple-200',
      CUSTOM: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors.CUSTOM;
  };

  const handleFilterChange = (key, value) => {
    if (onFilterChange) {
      onFilterChange(key, value);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">{t('loadingReports')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
     {/* <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports Dashboard</h1>
          <p className="text-gray-600">Create and manage custom reports</p>
        </div>
        <button 
          onClick={onCreateReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </button>
      </div>  */}

      {/* Statistics Cards */}
      {/*<div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Total Reports</span>
            <BarChart3 className="text-blue-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{reports.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Financial</span>
            <BarChart3 className="text-green-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">
            {reports.filter(r => r.category === 'FINANCIAL').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Vendor</span>
            <BarChart3 className="text-orange-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">
            {reports.filter(r => r.category === 'VENDOR').length}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Favorites</span>
            <Star className="text-yellow-500 w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">
            {reports.filter(r => r.isFavorite).length}
          </p>
        </div>
      </div> */}

      {/* Filter and Search Bar */}
      {/*<div className="bg-white p-4 rounded-lg shadow-md mb-6 flex items-center space-x-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <select
          className="p-2 border border-gray-300 rounded-lg"
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="FINANCIAL">Financial</option>
          <option value="VENDOR">Vendor</option>
          <option value="CONTRACT">Contract</option>
          <option value="PROJECT">Project</option>
          <option value="CUSTOM">Custom</option>
        </select>

        <button 
          className={`p-2 rounded-lg flex items-center space-x-2 ${
            filters.favorite 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
              : 'text-gray-500 hover:text-gray-700 border border-gray-300'
          }`}
          onClick={() => handleFilterChange('favorite', !filters.favorite)}
        >
          {filters.favorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          <span>Favorites</span>
        </button>

        <button 
          className="text-gray-500 hover:text-gray-700 p-2"
          onClick={() => {
            handleFilterChange('search', '');
            handleFilterChange('category', '');
            handleFilterChange('favorite', false);
          }}
        >
          Clear
        </button>
      </div> */}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">{t('noReportsFound')}</p>
            <button 
              onClick={onCreateReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {t('createFirstReport')}
            </button>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-lg transition duration-200 border border-gray-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-1">{report.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(report.category)}`}>
                      {t(report.category.toLowerCase())}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleFavorite) {
                        onToggleFavorite(report.id, report.isFavorite);
                      }
                    }}
                    className={`p-1 rounded ${
                      report.isFavorite 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    {report.isFavorite ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                  </button>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {report.description || t('noDescriptionProvided')}
                </p>

                {/* Stats */}
                <div className="flex space-x-2 mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                    <Table className="w-3 h-3 mr-1" />
                    {report._count?.executions || 0} {t('runs')}
                  </span>
                  {report.isPublic && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                      {t('public')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewReport(report)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('view')}
                  </button>
                  <button
                    onClick={() => onEditReport(report)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 transition flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {t('edit')}
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="w-3 h-3 mr-1" />
                    <span className="mr-3">{report.createdBy?.name || t('system')}</span>
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportList;