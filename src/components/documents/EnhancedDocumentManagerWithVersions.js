// frontend/src/components/documents/EnhancedDocumentManagerWithVersions.jsx
"use client";
import React, { useState } from 'react';
import EnhancedDocumentManager from './EnhancedDocumentManager';
import DocumentVersionBrowser from './DocumentVersionBrowser';
import { History, X } from 'lucide-react';

const EnhancedDocumentManagerWithVersions = (props) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showVersionBrowser, setShowVersionBrowser] = useState(false);

  // Add version action to your existing document rows
  const EnhancedDocumentRow = ({ document }) => (
    <tr key={document.id} className="hover:bg-gray-50">
      {/* Your existing row content */}
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
      
      {/* Add version badge and button */}
      <td className="px-6 py-4 whitespace-nowrap">
        {document.version > 1 && (
          <button
            onClick={() => {
              setSelectedDocument(document);
              setShowVersionBrowser(true);
            }}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            <History className="w-4 h-4" />
            <span>v{document.version}</span>
          </button>
        )}
      </td>

      {/* Rest of your existing columns */}
    </tr>
  );

  return (
    <div className="relative">
      {/* Your existing EnhancedDocumentManager */}
      <EnhancedDocumentManager 
        {...props}
        // Pass custom row renderer if needed
      />

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

export default EnhancedDocumentManagerWithVersions;