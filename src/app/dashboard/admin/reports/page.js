"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, FileText, BarChart3, 
  Eye, Edit, Trash2, Star, StarOff,
  ArrowLeft, Download, Play, Settings,
  Table, PieChart, TrendingUp
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ReportBuilder from '@/components/reports/ReportBuilder';
import ReportViewer from '@/components/reports/ReportViewer';
import ReportList from '@/components/reports/ReportList';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;


const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'builder', 'viewer'
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({ 
    search: '', 
    category: '', 
    favorite: false 
  });

  // Fetch reports
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.favorite) params.append('favorite', 'true');

      const response = await fetch(`${API_BASE_URL}/reports?${params}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.data || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters.category, filters.favorite]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setCurrentView('viewer');
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setCurrentView('builder');
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setCurrentView('builder');
  };

  // In your ReportsPage component, replace the handleSaveReport function:

const handleSaveReport = async (reportData) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (selectedReport) {
      // Update existing report
      await fetch(`${API_BASE_URL}/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });
    } else {
      // Create new report
      await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });
    }
    
    setCurrentView('list');
    setSelectedReport(null);
    fetchReports(); // Refresh the list
    
  } catch (error) {
    console.error('Failed to save report:', error);
    alert('Failed to save report. Please try again.');
  }
};

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedReport(null);
    fetchReports(); // Refresh the list
  };

  // In your ReportsPage component, update the toggleFavorite function:

const toggleFavorite = async (reportId, isCurrentlyFavorite) => {
  try {
    console.log('Toggling favorite for report ID:', reportId, 'Type:', typeof reportId);

    const token = localStorage.getItem('authToken');
    
    // Convert reportId to number if it's a string
    const numericReportId = parseInt(reportId, 10);
    console.log('Converted ID:', numericReportId, 'Type:', typeof numericReportId);
    
    await fetch(`${API_BASE_URL}/reports/${numericReportId}/favorite`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    fetchReports(); // Refresh to show updated favorite status
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
  }
};

  const renderContent = () => {
    switch (currentView) {
      case 'builder':
        return (
          <ReportBuilder
            report={selectedReport}
            onSave={handleSaveReport}
            onCancel={handleBackToList}
          />
        );
      
      case 'viewer':
        return (
          <ReportViewer
            report={selectedReport}
            onBack={handleBackToList}
          />
        );
      
      default:
        return (
          <ReportList
            reports={reports}
            loading={loading}
            filters={filters}
            onFilterChange={handleFilterChange}
            onEditReport={handleEditReport}
            onViewReport={handleViewReport}
            onCreateReport={handleCreateReport}
            onToggleFavorite={toggleFavorite}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;