// frontend/src/components/EnhancedDocumentManager.js - WITH BULK OPERATIONS
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  History, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Users,
  Tag,
  FolderOpen,
  GitCompare,
  RotateCcw,
  Calendar,
  User,
  X,
  CheckSquare,
  Square,
  Trash2,
  Archive,
  Send,
  CheckCircle2,
  Ban,
  Package,
  MoreVertical
} from 'lucide-react';

// Document Version Browser Component (Integrated)
const DocumentVersionBrowser = ({ documentId, documentName, onVersionSelect, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [compareMode, setCompareMode] = useState(false);

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
                <X className="w-6 h-6" />
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

// Bulk Actions Toolbar Component
const BulkActionsToolbar = ({ selectedCount, onBulkAction, onClearSelection }) => {
  const [showMoreActions, setShowMoreActions] = useState(false);

  const bulkActions = [
    {
      label: 'Download as ZIP',
      icon: Package,
      action: 'download',
      color: 'text-blue-600 hover:text-blue-800'
    },
    {
      label: 'Approve Selected',
      icon: CheckCircle2,
      action: 'approve',
      color: 'text-green-600 hover:text-green-800'
    },
    {
      label: 'Reject Selected',
      icon: Ban,
      action: 'reject',
      color: 'text-red-600 hover:text-red-800'
    },
    {
      label: 'Send for Approval',
      icon: Send,
      action: 'send-for-approval',
      color: 'text-orange-600 hover:text-orange-800'
    },
    {
      label: 'Archive Selected',
      icon: Archive,
      action: 'archive',
      color: 'text-gray-600 hover:text-gray-800'
    },
    {
      label: 'Delete Selected',
      icon: Trash2,
      action: 'delete',
      color: 'text-red-600 hover:text-red-800'
    }
  ];

  const handleAction = (action) => {
    onBulkAction(action);
    setShowMoreActions(false);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-800">
              {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAction('download')}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              <Package className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
            
            <button
              onClick={() => handleAction('approve')}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve</span>
            </button>

            {/* More Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                <MoreVertical className="w-4 h-4" />
                <span>More</span>
              </button>

              {showMoreActions && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {bulkActions.slice(2).map((action) => (
                    <button
                      key={action.action}
                      onClick={() => handleAction(action.action)}
                      className={`flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-50 ${action.color}`}
                    >
                      <action.icon className="w-4 h-4" />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};

// Main Enhanced Document Manager Component
const EnhancedDocumentManager = ({ vendorId, vendorName }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    searchTerm: '',
    approvalStatus: '',
    signatureStatus: ''
  });
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  
  // Version Browser State
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showVersionBrowser, setShowVersionBrowser] = useState(false);

  // Fetch documents from backend
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/search?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setDocuments(result.data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDocuments(new Set());
    } else {
      const allIds = new Set(documents.map(doc => doc.id));
      setSelectedDocuments(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectDocument = (documentId) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
    setSelectAll(newSelected.size === documents.length);
  };

  const clearSelection = () => {
    setSelectedDocuments(new Set());
    setSelectAll(false);
  };

  // Bulk actions handler
  const handleBulkAction = async (action) => {
    if (selectedDocuments.size === 0) return;

    const selectedIds = Array.from(selectedDocuments);

    try {
      const token = localStorage.getItem('authToken');
      
      switch (action) {
        case 'download':
          // Download as ZIP
          const downloadResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/documents/bulk-download`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ documentIds: selectedIds })
            }
          );

          if (downloadResponse.ok) {
            const blob = await downloadResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `documents_bulk_${Date.now()}.zip`;
            link.click();
            window.URL.revokeObjectURL(url);
          }
          break;

        case 'approve':
        case 'reject':
        case 'archive':
          // Update status
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/documents/bulk-update`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                documentIds: selectedIds,
                updates: { 
                  approvalStatus: action === 'approve' ? 'APPROVED' : 
                                action === 'reject' ? 'REJECTED' : 'ARCHIVED'
                }
              })
            }
          );
          alert(`${action.charAt(0).toUpperCase() + action.slice(1)} operation completed!`);
          break;

        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedIds.length} document(s)? This action cannot be undone.`)) {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/documents/bulk-delete`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ documentIds: selectedIds })
              }
            );
            alert('Documents deleted successfully!');
          }
          break;

        case 'send-for-approval':
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/documents/bulk-send-approval`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ documentIds: selectedIds })
            }
          );
          alert('Documents sent for approval!');
          break;
      }

      // Refresh documents after bulk operation
      fetchDocuments();
      clearSelection();

    } catch (error) {
      console.error('Bulk operation error:', error);
      alert('Operation failed. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      PENDING_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      ARCHIVED: { color: 'bg-purple-100 text-purple-800', icon: Archive }
    };
    
    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  // Handle document actions
  const handleViewDocument = (document) => {
    window.open(document.url, '_blank');
  };

  const handleDownloadDocument = async (document) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${document.id}/download`,
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
        link.download = document.fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handleViewVersions = (document) => {
    setSelectedDocument(document);
    setShowVersionBrowser(true);
  };

  return (
    <div className="relative">
      {/* Main Document Manager */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FolderOpen className="w-6 h-6 mr-3 text-blue-600" />
                Document Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage documents for {vendorName}
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedDocuments.size > 0 && (
          <BulkActionsToolbar
            selectedCount={selectedDocuments.size}
            onBulkAction={handleBulkAction}
            onClearSelection={clearSelection}
          />
        )}

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="contract">Contract</option>
              <option value="financial">Financial</option>
              <option value="technical">Technical</option>
              <option value="compliance">Compliance</option>
            </select>

            <select
              value={filters.approvalStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, approvalStatus: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center"
                  >
                    {selectAll ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(document.id)}
                      onChange={() => handleSelectDocument(document.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {document.fileName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {document.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {document.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {document.version > 1 ? (
                      <button
                        onClick={() => handleViewVersions(document)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <History className="w-4 h-4" />
                        <span>v{document.version}</span>
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">v{document.version}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(document.approvalStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDocument(document)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadDocument(document)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {document.version > 1 && (
                        <button 
                          onClick={() => handleViewVersions(document)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Version History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {documents.length === 0 && !loading && (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents found</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Upload your first document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Version Browser Modal */}
      {showVersionBrowser && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Version History - {selectedDocument.fileName}
              </h3>
              <button
                onClick={() => {
                  setShowVersionBrowser(false);
                  setSelectedDocument(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <DocumentVersionBrowser
                documentId={selectedDocument.id}
                documentName={selectedDocument.fileName}
                onVersionSelect={(version) => {
                  // Handle when a version is selected/restored
                  console.log('Version selected:', version);
                  fetchDocuments(); // Refresh the document list
                }}
                onClose={() => {
                  setShowVersionBrowser(false);
                  setSelectedDocument(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDocumentManager;