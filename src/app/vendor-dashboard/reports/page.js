"use client";
import React, { useState } from 'react';
import { 
  FileText, Download, Filter, Calendar, Printer, 
  Eye, Share2, FileSpreadsheet, FilePieChart,
  TrendingUp, CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';

const VendorReportsPage = () => {
  const [selectedReports, setSelectedReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });

  const reports = [
    {
      id: 'performance-summary',
      title: 'Performance Summary Report',
      description: 'Overall vendor rating, KPIs, and trends',
      frequency: 'Monthly',
      lastGenerated: '2024-09-15',
      size: '2.4 MB',
      icon: <FilePieChart className="text-blue-600" size={24} />,
      available: true
    },
    {
      id: 'proposal-activity',
      title: 'Proposal Activity Report',
      description: 'All submitted proposals with status and outcomes',
      frequency: 'Weekly',
      lastGenerated: '2024-09-20',
      size: '1.8 MB',
      icon: <FileText className="text-green-600" size={24} />,
      available: true
    },
    {
      id: 'compliance-status',
      title: 'Compliance Status Report',
      description: 'Document validity and compliance matrix',
      frequency: 'Quarterly',
      lastGenerated: '2024-09-01',
      size: '3.2 MB',
      icon: <CheckCircle className="text-purple-600" size={24} />,
      available: true
    },
    {
      id: 'financial-summary',
      title: 'Financial Summary Report',
      description: 'Contract values, payments, and revenue',
      frequency: 'Monthly',
      lastGenerated: '2024-09-10',
      size: '4.1 MB',
      icon: <TrendingUp className="text-amber-600" size={24} />,
      available: true
    },
    {
      id: 'delivery-performance',
      title: 'Delivery Performance Report',
      description: 'On-time delivery metrics and delays',
      frequency: 'Monthly',
      lastGenerated: '2024-09-18',
      size: '2.9 MB',
      icon: <AlertTriangle className="text-red-600" size={24} />,
      available: true
    },
    {
      id: 'vendor-comparison',
      title: 'Vendor Comparison Report',
      description: 'Benchmark against class competitors',
      frequency: 'Quarterly',
      lastGenerated: '2024-08-30',
      size: '5.3 MB',
      icon: <FileSpreadsheet className="text-indigo-600" size={24} />,
      available: false
    }
  ];

  const handleReportSelect = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleGenerateReports = () => {
    if (selectedReports.length === 0) return;
    
    setGenerating(true);
    // Simulate generation
    setTimeout(() => {
      alert(`Reports generated successfully! You can now download ${selectedReports.length} report(s) in ${format.toUpperCase()} format.`);
      setGenerating(false);
      setSelectedReports([]);
    }, 2000);
  };

  const handleDownloadAll = () => {
    setGenerating(true);
    setTimeout(() => {
      alert('All available reports are being prepared for download...');
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="text-blue-600" size={32} />
            Reports Center
          </h1>
          <p className="text-gray-600 mt-2">Generate, download, and analyze your vendor performance reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={20} />
            Download All Available
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select 
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="pdf">PDF Format</option>
              <option value="excel">Excel Format</option>
              <option value="csv">CSV Format</option>
            </select>
          </div>

          {selectedReports.length > 0 && (
            <button
              onClick={handleGenerateReports}
              disabled={generating}
              className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-70"
            >
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Generate Selected ({selectedReports.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div 
            key={report.id}
            className={`bg-white rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
              selectedReports.includes(report.id) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200'
            } ${!report.available ? 'opacity-60' : ''}`}
            onClick={() => report.available && handleReportSelect(report.id)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {report.icon}
                  <div>
                    <h3 className="font-semibold text-gray-800">{report.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {report.frequency}
                      </span>
                      {!report.available && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {report.available && (
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {report.size}
                  </span>
                  <span>Last: {report.lastGenerated}</span>
                </div>
                <div className="flex gap-2">
                  {report.available && (
                    <>
                      <button 
                        className="p-1 hover:text-blue-600"
                        title="Preview"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Preview of ${report.title}`);
                        }}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="p-1 hover:text-green-600"
                        title="Download"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Downloading ${report.title}`);
                        }}
                      >
                        <Download size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Report Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50">
            <Printer className="text-gray-600 mb-2" size={24} />
            <span className="font-medium">Print Summary</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50">
            <Share2 className="text-gray-600 mb-2" size={24} />
            <span className="font-medium">Share Reports</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50">
            <Calendar className="text-gray-600 mb-2" size={24} />
            <span className="font-medium">Schedule Export</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50">
            <Filter className="text-gray-600 mb-2" size={24} />
            <span className="font-medium">Custom Reports</span>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 How to Use Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700">1. Select Reports</h4>
            <p className="text-blue-600 text-sm">Check the boxes of reports you want to generate or download individually</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700">2. Choose Format</h4>
            <p className="text-blue-600 text-sm">Select PDF for presentation, Excel for analysis, or CSV for data processing</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700">3. Set Date Range</h4>
            <p className="text-blue-600 text-sm">Customize the period for your reports to focus on specific timeframes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorReportsPage;