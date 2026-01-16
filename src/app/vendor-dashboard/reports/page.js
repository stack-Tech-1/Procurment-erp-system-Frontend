"use client";
import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Filter, Calendar, Printer, 
  Eye, Share2, FileSpreadsheet, FilePieChart,
  TrendingUp, CheckCircle, AlertTriangle, Loader2,
  Database, RefreshCw, Info, ExternalLink, Clock,
  Star, StarOff, Users, FileBarChart, Receipt,
  DollarSign, Package, CheckSquare, XCircle
} from 'lucide-react';

const VendorReportsPage = () => {
  const [selectedReports, setSelectedReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [format, setFormat] = useState('excel');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0], // Last 6 months
    end: new Date().toISOString().split('T')[0] // Today
  });
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reportExecutions, setReportExecutions] = useState([]);
  const [vendorInfo, setVendorInfo] = useState(null);

  // Report categories with icons
  const reportCategories = {
    VENDOR: { icon: <Users className="text-blue-500" size={20} />, color: 'bg-blue-100 text-blue-800' },
    CONTRACT: { icon: <FileText className="text-green-500" size={20} />, color: 'bg-green-100 text-green-800' },
    RFQ: { icon: <FileBarChart className="text-purple-500" size={20} />, color: 'bg-purple-100 text-purple-800' },
    IPC: { icon: <Receipt className="text-amber-500" size={20} />, color: 'bg-amber-100 text-amber-800' },
    FINANCIAL: { icon: <DollarSign className="text-emerald-500" size={20} />, color: 'bg-emerald-100 text-emerald-800' },
    PERFORMANCE: { icon: <TrendingUp className="text-indigo-500" size={20} />, color: 'bg-indigo-100 text-indigo-800' },
    COMPLIANCE: { icon: <CheckSquare className="text-teal-500" size={20} />, color: 'bg-teal-100 text-teal-800' }
  };

  // Fetch vendor information
  const fetchVendorInfo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVendorInfo(data);
      }
    } catch (err) {
      console.error('Error fetching vendor info:', err);
    }
  };

  // Fetch reports from backend
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch vendor-specific reports (public reports + vendor's own reports)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Filter reports to show vendor-accessible reports
        const vendorReports = result.data.filter(report => 
          report.category === 'VENDOR' || 
          report.dataSource === 'vendors' ||
          report.isPublic
        ).map(report => ({
          id: report.id,
          title: report.name,
          description: report.description || 'Detailed report',
          category: report.category || 'VENDOR',
          dataSource: report.dataSource,
          frequency: 'On Demand',
          lastGenerated: getLatestExecutionDate(report.id),
          size: 'N/A',
          icon: getIconForCategory(report.category || 'VENDOR'),
          available: true,
          isFavorite: report.isFavorite || false,
          createdBy: report.createdBy?.name || 'System',
          executionCount: report._count?.executions || 0,
          columns: report.columns || [],
          filters: report.filters || []
        }));
        
        setReports(vendorReports);
        setFavorites(vendorReports.filter(r => r.isFavorite));
      } else {
        throw new Error(result.message || 'Failed to fetch reports');
      }

      // Fetch report executions history
      await fetchReportExecutions();
      
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
      setReports(getDefaultVendorReports());
    } finally {
      setLoading(false);
    }
  };

  // Fetch report executions history
  const fetchReportExecutions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      // Get executions for all reports
      const executions = [];
      for (const report of reports) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${report.id}/executions?limit=5`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            executions.push(...result.data.map(exec => ({
              ...exec,
              reportId: report.id,
              reportName: report.title
            })));
          }
        }
      }
      
      setReportExecutions(executions);
    } catch (err) {
      console.error('Error fetching executions:', err);
    }
  };

  // Get default vendor reports (fallback)
  const getDefaultVendorReports = () => [
    {
      id: 1,
      title: 'Vendor Performance Summary',
      description: 'Overall vendor rating, KPIs, and trends',
      category: 'PERFORMANCE',
      dataSource: 'vendors',
      frequency: 'On Demand',
      lastGenerated: 'Never',
      size: 'N/A',
      icon: <FilePieChart className="text-blue-600" size={24} />,
      available: true,
      isFavorite: false,
      createdBy: 'System',
      executionCount: 0
    },
    {
      id: 2,
      title: 'Proposal Activity Report',
      description: 'All submitted proposals with status and outcomes',
      category: 'VENDOR',
      dataSource: 'vendors',
      frequency: 'On Demand',
      lastGenerated: 'Never',
      size: 'N/A',
      icon: <FileText className="text-green-600" size={24} />,
      available: true,
      isFavorite: false,
      createdBy: 'System',
      executionCount: 0
    },
    {
      id: 3,
      title: 'Compliance Status Report',
      description: 'Document validity and compliance matrix',
      category: 'COMPLIANCE',
      dataSource: 'vendors',
      frequency: 'On Demand',
      lastGenerated: 'Never',
      size: 'N/A',
      icon: <CheckCircle className="text-purple-600" size={24} />,
      available: true,
      isFavorite: false,
      createdBy: 'System',
      executionCount: 0
    },
    {
      id: 4,
      title: 'Financial Summary Report',
      description: 'Contract values, payments, and revenue',
      category: 'FINANCIAL',
      dataSource: 'vendors',
      frequency: 'On Demand',
      lastGenerated: 'Never',
      size: 'N/A',
      icon: <DollarSign className="text-amber-600" size={24} />,
      available: true,
      isFavorite: false,
      createdBy: 'System',
      executionCount: 0
    }
  ];

  // Get icon based on category
  const getIconForCategory = (category) => {
    switch (category?.toUpperCase()) {
      case 'VENDOR':
        return <Users className="text-blue-600" size={24} />;
      case 'PERFORMANCE':
        return <FilePieChart className="text-blue-600" size={24} />;
      case 'FINANCIAL':
        return <DollarSign className="text-green-600" size={24} />;
      case 'COMPLIANCE':
        return <CheckSquare className="text-purple-600" size={24} />;
      case 'CONTRACT':
        return <FileText className="text-amber-600" size={24} />;
      case 'RFQ':
        return <FileBarChart className="text-indigo-600" size={24} />;
      case 'IPC':
        return <Receipt className="text-teal-600" size={24} />;
      default:
        return <FileSpreadsheet className="text-gray-600" size={24} />;
    }
  };

  // Get latest execution date for a report
  const getLatestExecutionDate = (reportId) => {
    const execution = reportExecutions.find(exec => exec.reportId === reportId);
    if (execution) {
      return new Date(execution.executedAt).toLocaleDateString();
    }
    return 'Never';
  };

  useEffect(() => {
    fetchVendorInfo();
    fetchReports();
  }, []);

  const handleReportSelect = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleToggleFavorite = async (reportId, e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please login to manage favorites');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Update local state
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, isFavorite: result.isFavorite }
            : report
        ));
        // Refresh favorites list
        fetchReports();
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorite');
    }
  };

  const handleGenerateReport = async (reportId, isExport = false) => {
    try {
      setGenerating(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please login to generate reports');
        return;
      }

      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      // Build filters for vendor-specific data
      const filters = [
        {
          field: 'id',
          operator: 'equals',
          value: vendorInfo?.id || '0'
        },
        {
          field: 'createdAt',
          operator: 'between',
          value: {
            start: dateRange.start,
            end: dateRange.end
          }
        }
      ];

      if (isExport) {
        // Export report
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/export`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            format: format,
            filters: filters
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Export failed: ${response.status} ${errorText}`);
        }

        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from content-disposition header or generate one
        const contentDisposition = response.headers.get('content-disposition');
        let fileName = `report_${report.title.replace(/\s+/g, '_')}_${Date.now()}`;
        
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch) {
            fileName = fileNameMatch[1];
          }
        } else {
          fileName += format === 'excel' ? '.xlsx' : format === 'csv' ? '.csv' : '.pdf';
        }
        
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        alert(`Report exported successfully as ${format.toUpperCase()}`);
      } else {
        // Execute report to view data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/${reportId}/execute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filters: filters })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Show report data in a modal or new tab
            showReportDataModal(result.data);
          }
        }
      }
      
      // Refresh executions history
      fetchReportExecutions();
      
    } catch (err) {
      console.error('Error generating report:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const showReportDataModal = (reportData) => {
    // Create a simple modal to display report data
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Report Preview</h3>
            <p class="text-sm text-gray-600 mt-1">${reportData.totalRecords} records generated</p>
          </div>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6 overflow-auto">
          <div class="mb-6">
            <h4 class="font-semibold text-gray-800 mb-2">Summary</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              ${Object.entries(reportData.summary || {}).map(([key, value]) => `
                <div class="bg-gray-50 p-3 rounded-lg">
                  <div class="text-sm text-gray-600">${key}</div>
                  <div class="font-bold text-gray-800">${value}</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <h4 class="font-semibold text-gray-800 mb-2">Data Preview</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  ${reportData.columns?.map(col => `
                    <th class="px-4 py-2 text-left font-medium text-gray-700">${col.columnLabel}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${reportData.rows?.slice(0, 10).map(row => `
                  <tr class="hover:bg-gray-50">
                    ${reportData.columns?.map(col => `
                      <td class="px-4 py-2">${row[col.fieldName] || ''}</td>
                    `).join('')}
                  </tr>
                `).join('')}
                ${reportData.rows?.length > 10 ? `
                  <tr>
                    <td colspan="${reportData.columns?.length}" class="px-4 py-2 text-center text-gray-500">
                      ... and ${reportData.rows.length - 10} more records
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
          
          <div class="mt-6 flex justify-between items-center">
            <div class="text-sm text-gray-600">
              Generated in ${reportData.executionTime || 0}ms
            </div>
            <button onclick="exportFullReport()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Export Full Report
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(modal);
    
    // Add export function
    window.exportFullReport = () => {
      modal.remove();
      handleGenerateReport(reportData.reportId, true);
    };
  };

  const handleGenerateSelected = () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report');
      return;
    }
    
    // For now, handle the first selected report
    const reportId = selectedReports[0];
    handleGenerateReport(reportId, true);
  };

  const handleDownloadAll = async () => {
    if (reports.length === 0) {
      alert('No reports available');
      return;
    }
    
    // Create a batch export for all vendor reports
    try {
      setGenerating(true);
      alert('Batch export feature is under development. Please export reports individually.');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleScheduleExport = () => {
    if (!vendorInfo) {
      alert('Please wait for vendor information to load');
      return;
    }
    
    alert('Scheduling feature coming soon!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" />
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FileText className="text-blue-600" size={28} />
              Vendor Reports Center
            </h1>
            {vendorInfo && (
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {vendorInfo.companyLegalName || 'Vendor'}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-gray-600">Generate and download your vendor performance and activity reports</p>
            <button 
              onClick={fetchReports}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadAll}
            disabled={generating || reports.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70"
          >
            {generating ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Download size={20} />
            )}
            Batch Export
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                {error}. Showing available reports.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Info Card */}
      {vendorInfo && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{vendorInfo.companyLegalName}</h3>
                <p className="text-sm text-gray-600">
                  Vendor Class: <span className="font-medium text-blue-600">{vendorInfo.vendorClass || 'Not Rated'}</span> • 
                  Status: <span className={`font-medium ${vendorInfo.status === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>
                    {vendorInfo.status || 'UNKNOWN'}
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {vendorInfo.qualificationScore ? `${vendorInfo.qualificationScore.toFixed(1)}/100` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Qualification Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-500" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 min-w-[20px] text-center">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <select 
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="excel">Excel Format</option>
                <option value="csv">CSV Format</option>
                <option value="pdf">PDF Format</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Database size={20} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {reports.length} reports available
              </span>
            </div>
          </div>

          {selectedReports.length > 0 && (
            <button
              onClick={handleGenerateSelected}
              disabled={generating}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-70 min-w-[200px] justify-center"
            >
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Export Selected ({selectedReports.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            Favorite Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((report) => (
              <ReportCard 
                key={report.id} 
                report={report} 
                isSelected={selectedReports.includes(report.id)}
                onSelect={handleReportSelect}
                onToggleFavorite={handleToggleFavorite}
                onGenerate={handleGenerateReport}
                onPreview={handleGenerateReport}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Reports Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">All Vendor Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard 
              key={report.id} 
              report={report} 
              isSelected={selectedReports.includes(report.id)}
              onSelect={handleReportSelect}
              onToggleFavorite={handleToggleFavorite}
              onGenerate={handleGenerateReport}
              onPreview={handleGenerateReport}
            />
          ))}
        </div>
      </div>

      {/* Report Executions History */}
      {reportExecutions.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-gray-500" size={20} />
            Recent Report Executions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Report</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Generated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Records</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportExecutions.slice(0, 5).map((execution, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">{execution.reportName || 'Unknown Report'}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(execution.executedAt).toLocaleDateString()} {new Date(execution.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {execution.recordCount || 0} records
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {execution.executionTime || 0}ms
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        execution.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        execution.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {execution.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => execution.reportId && handleGenerateReport(execution.reportId, true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Re-export
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.print()}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Printer className="text-gray-600 mb-2" size={24} />
            <span className="font-medium">Print Dashboard</span>
          </button>
          <button 
            onClick={handleScheduleExport}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Calendar className="text-gray-600 mb-2" size={24} />
            <span className="font-medium">Schedule Reports</span>
          </button>
          <button 
            onClick={() => window.location.href = '/vendor-dashboard/performance'}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <TrendingUp className="text-gray-600 mb-2" size={24} />
            <span className="font-medium">View Performance</span>
          </button>
          <button 
            onClick={() => window.location.href = '/vendor-dashboard/documents'}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FileText className="text-gray-600 mb-2" size={24} />
            <span className="font-medium">Document Center</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Info size={20} />
          How to Use Vendor Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700">1. Select Date Range</h4>
            <p className="text-blue-600 text-sm">Choose the time period for your report data</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700">2. Choose Report</h4>
            <p className="text-blue-600 text-sm">Select from available vendor-specific reports</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700">3. Export Format</h4>
            <p className="text-blue-600 text-sm">Export as Excel for analysis, CSV for data, or PDF for sharing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Card Component
const ReportCard = ({ report, isSelected, onSelect, onToggleFavorite, onGenerate, onPreview }) => {
  const categoryInfo = {
    VENDOR: { color: 'bg-blue-100 text-blue-800', label: 'Vendor' },
    PERFORMANCE: { color: 'bg-indigo-100 text-indigo-800', label: 'Performance' },
    FINANCIAL: { color: 'bg-green-100 text-green-800', label: 'Financial' },
    COMPLIANCE: { color: 'bg-purple-100 text-purple-800', label: 'Compliance' },
    CONTRACT: { color: 'bg-amber-100 text-amber-800', label: 'Contract' },
    RFQ: { color: 'bg-gray-100 text-gray-800', label: 'RFQ' },
    IPC: { color: 'bg-teal-100 text-teal-800', label: 'IPC' }
  }[report.category] || { color: 'bg-gray-100 text-gray-800', label: report.category || 'General' };

  return (
    <div 
      className={`bg-white rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={() => onSelect(report.id)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {report.icon}
            <div>
              <h3 className="font-semibold text-gray-800">{report.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 ${categoryInfo.color} rounded-full`}>
                  {categoryInfo.label}
                </span>
                {report.executionCount > 0 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                    {report.executionCount} runs
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleFavorite(report.id, e)}
              className={`p-1 ${report.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
              title={report.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {report.isFavorite ? <Star size={18} /> : <StarOff size={18} />}
            </button>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-5 h-5 text-blue-600 rounded"
            />
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{report.description}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              Last: {report.lastGenerated}
            </span>
            {report.createdBy && (
              <span className="text-xs">By: {report.createdBy}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              className="p-1 hover:text-blue-600"
              title="Preview"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(report.id, false);
              }}
            >
              <Eye size={18} />
            </button>
            <button 
              className="p-1 hover:text-green-600"
              title="Export"
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(report.id, true);
              }}
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorReportsPage;