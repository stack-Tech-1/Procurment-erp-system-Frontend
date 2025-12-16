// frontend/src/components/documents/DocumentVersionBrowser.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { 
  History, 
  GitCompare, 
  RotateCcw, 
  Download, 
  Eye, 
  Calendar,
  User,
  FileText,
  ChevronDown,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const DocumentVersionBrowser = ({ documentId, documentName, onVersionSelect, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    user: '',
    dateRange: ''
  });

  // Fetch version history
  const fetchVersionHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}/history`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setVersions(result.data);
        // Auto-select current version
        const currentVersion = result.data.find(v => v.isCurrent);
        if (currentVersion) {
          setSelectedVersions([currentVersion]);
        }
      }
    } catch (error) {
      console.error('Error fetching version history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchVersionHistory();
    }
  }, [documentId]);

  // Handle version selection for comparison
  const handleVersionSelect = (version) => {
    if (compareMode) {
      if (selectedVersions.find(v => v.id === version.id)) {
        setSelectedVersions(selectedVersions.filter(v => v.id !== version.id));
      } else if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, version]);
      }
    } else {
      setSelectedVersions([version]);
    }
  };

  // Rollback to previous version
  const handleRollback = async (versionId) => {
    if (!confirm('Are you sure you want to restore this version? Current version will be archived.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}/rollback`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ versionId })
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('Version restored successfully!');
        fetchVersionHistory(); // Refresh the list
        if (onVersionSelect) {
          onVersionSelect(result.data);
        }
      }
    } catch (error) {
      console.error('Error rolling back version:', error);
      alert('Failed to restore version');
    }
  };

  // Download version
  const handleDownload = async (version) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${version.id}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${version.fileName}_v${version.version}`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading version:', error);
    }
  };

  // Get status badge
  const getStatusBadge = (version) => {
    if (version.isCurrent) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Current
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <History className="w-3 h-3 mr-1" />
        Archived
      </span>
    );
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading version history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Version History</h2>
              <p className="text-gray-600">{documentName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Compare Mode Toggle */}
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                compareMode 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare</span>
              {compareMode && selectedVersions.length > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {selectedVersions.length}/2
                </span>
              )}
            </button>

            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Comparison Info */}
        {compareMode && selectedVersions.length === 2 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-blue-800">
                  Comparing versions {selectedVersions[0].version} and {selectedVersions[1].version}
                </span>
                <span className="text-sm text-blue-600">
                  {Math.abs(selectedVersions[0].version - selectedVersions[1].version)} version(s) apart
                </span>
              </div>
              <button
                onClick={() => {
                  // Implement comparison view
                  console.log('Show comparison:', selectedVersions);
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Show Comparison
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Version List */}
      <div className="overflow-y-auto max-h-96">
        {versions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No version history found</p>
            <p className="text-sm text-gray-400 mt-1">
              This document doesn't have any previous versions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {versions.map((version) => (
              <div
                key={version.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedVersions.find(v => v.id === version.id) 
                    ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                    : ''
                }`}
                onClick={() => handleVersionSelect(version)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Selection Indicator */}
                    <div className={`w-4 h-4 mt-1 rounded border ${
                      selectedVersions.find(v => v.id === version.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}></div>

                    {/* Version Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          Version {version.version}
                        </span>
                        {getStatusBadge(version)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(version.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{version.uploadedBy?.name || 'Unknown User'}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{formatFileSize(version.size)}</span>
                        </div>

                        {version.description && (
                          <div>
                            <span className="text-gray-500">{version.description}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {version.tags && version.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {version.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {!version.isCurrent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRollback(version.id);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Restore this version"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(version);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Download this version"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Preview version
                        window.open(version.url, '_blank');
                      }}
                      className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Preview this version"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{versions.length} version(s) total</span>
          <div className="flex items-center space-x-4">
            <span>
              {versions.filter(v => v.isCurrent).length} current version
            </span>
            <span>
              {versions.filter(v => !v.isCurrent).length} archived versions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVersionBrowser;