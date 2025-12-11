"use client";
import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar,
  Download,
  Plus,
  Eye,
  History,
  X
} from 'lucide-react';

const EnhancedQualificationDocumentManager = ({ 
  documentData, 
  setDocumentData, 
  isEditable,
  vendorType,
  vendorConfig 
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);

  // Enhanced document checklist with vendor type conditions
  const ENHANCED_DOCUMENT_CHECKLIST = [
    { 
      label: "Commercial Registration (CR)", 
      dbKey: "COMMERCIAL_REGISTRATION", 
      hasExpiry: true, 
      hasNumber: true, 
      isMandatory: true, 
      numberLabel: "CR Number",
      description: "Official commercial registration document",
      forAllVendors: true
    },
    { 
      label: "Zakat Certificate", 
      dbKey: "ZAKAT_CERTIFICATE", 
      hasExpiry: true, 
      hasNumber: false, 
      isMandatory: true,
      description: "Zakat compliance certificate",
      forAllVendors: true
    },
    { 
      label: "VAT Certificate", 
      dbKey: "VAT_CERTIFICATE", 
      hasExpiry: false, 
      hasNumber: true, 
      isMandatory: true, 
      numberLabel: "VAT Number",
      description: "Value Added Tax registration",
      forAllVendors: true
    },
    { 
      label: "GOSI Certificate", 
      dbKey: "GOSI_CERTIFICATE", 
      hasExpiry: true, 
      hasNumber: true, 
      isMandatory: true, 
      numberLabel: "GOSI Number",
      description: "General Organization for Social Insurance",
      forAllVendors: true
    },
    { 
      label: "ISO Certificate", 
      dbKey: "ISO_CERTIFICATE", 
      hasExpiry: true, 
      hasNumber: false, 
      isMandatory: true, 
      hasIsoType: true,
      description: "ISO quality management certification",
      forAllVendors: true
    },
    { 
      label: "SASO/SABER Certificate", 
      dbKey: "SASO_SABER_CERTIFICATE", 
      hasExpiry: true, 
      hasNumber: true, 
      isMandatory: vendorType === 'Supplier' || vendorType === 'Manufacturer' || vendorType === 'Distributor',
      condition: "For Suppliers/Manufacturers/Distributors",
      description: "Saudi Standards, Metrology and Quality Organization",
      forAllVendors: false
    },
    { 
      label: "HSE Plan", 
      dbKey: "HSE_PLAN", 
      hasExpiry: false, 
      hasNumber: false, 
      isMandatory: vendorType === 'Contractor' || vendorType === 'Subcontractor',
      condition: "For Contractors/Subcontractors",
      description: "Health, Safety and Environment plan",
      forAllVendors: false
    },
    { 
      label: "Insurance Certificates", 
      dbKey: "INSURANCE_CERTIFICATE", 
      hasExpiry: true, 
      hasNumber: false, 
      isMandatory: true,
      description: "Insurance coverage certificates",
      forAllVendors: true
    },
    { 
      label: "Organization Chart", 
      dbKey: "ORGANIZATION_CHART", 
      hasExpiry: false, 
      hasNumber: false, 
      isMandatory: vendorType === 'Contractor' || vendorType === 'Subcontractor' || true,
      description: "Company organizational structure",
      forAllVendors: true
    },
    { 
      label: "Technical File", 
      dbKey: "TECHNICAL_FILE", 
      hasExpiry: false, 
      hasNumber: false, 
      isMandatory: true,
      description: "Technical specifications and capabilities",
      forAllVendors: true
    },
    { 
      label: "Financial File", 
      dbKey: "FINANCIAL_FILE", 
      hasExpiry: false, 
      hasNumber: false, 
      isMandatory: true,
      description: "Audited financial statements and bank information",
      forAllVendors: true
    },
    { 
      label: "Bank Letter/IBAN", 
      dbKey: "BANK_LETTER", 
      hasExpiry: false, 
      hasNumber: false, 
      isMandatory: true,
      description: "Bank account verification letter",
      forAllVendors: true
    },
    { 
      label: "Warranty Certificate", 
      dbKey: "WARRANTY_CERTIFICATE", 
      hasExpiry: false, 
      hasNumber: false, 
      isMandatory: vendorType === 'Supplier' || vendorType === 'Manufacturer' || true,
      description: "Product/service warranty documentation",
      forAllVendors: true
    },
    { 
      label: "Quality Plan", 
      dbKey: "QUALITY_PLAN", 
      hasExpiry: false, 
      hasNumber: false, 
      isMandatory: true,
      description: "Quality management and assurance plan",
      forAllVendors: true
    },
    { 
      label: "Industry Licenses/Permits", 
      dbKey: "INDUSTRY_LICENSE", 
      hasExpiry: true, 
      hasNumber: false, 
      isMandatory: false,
      description: "Industry-specific licenses and permits",
      forAllVendors: false
    },
    { 
      label: "Vendor Code of Conduct", 
      dbKey: "VENDOR_CODE_OF_CONDUCT", 
      hasExpiry: false, 
      hasNumber: false, 
      isMandatory: true,
      description: "Company code of conduct and ethics",
      forAllVendors: true
    },
    { 
      label: "Company Profile (PDF)", 
      dbKey: "COMPANY_PROFILE", 
      hasExpiry: false, 
      hasNumber: false, 
      isMandatory: true,
      description: "Company overview and capabilities",
      forAllVendors: true
    },
  ];

  // Filter documents based on vendor type and config
  const getFilteredDocuments = () => {
    return ENHANCED_DOCUMENT_CHECKLIST.filter(doc => {
      // Show all documents for all vendors
      if (doc.forAllVendors) return true;
      
      // Show documents based on vendor type
      if (vendorType) {
        // Hide documents that are specifically hidden for this vendor type
        if (vendorConfig?.hiddenDocuments?.includes(doc.dbKey)) {
          return false;
        }
        
        // Show documents that are specifically added for this vendor type
        if (vendorConfig?.additionalDocuments?.includes(doc.dbKey)) {
          return true;
        }
        
        // For conditional documents
        // Update the condition check in getFilteredDocuments():
        if (doc.condition) {
          const vendorTypeLower = vendorType?.toLowerCase() || '';
          
          if (doc.condition.toLowerCase().includes("suppliers") && 
              (vendorTypeLower.includes('supplier') || 
              vendorTypeLower.includes('manufacturer') || 
              vendorTypeLower.includes('distributor'))) {
            return true;
          }
          
          if (doc.condition.toLowerCase().includes("contractors") && 
              (vendorTypeLower.includes('contractor') || 
              vendorTypeLower.includes('subcontractor'))) {
            return true;
          }
        }
      }
      
      return false;
    });
  };

  const filteredDocuments = getFilteredDocuments();

  const getDocumentStatus = (doc) => {
    const docEntry = documentData[doc.dbKey];
    if (!docEntry || !docEntry.file) {
      return { status: 'missing', color: 'bg-gray-100 border-gray-300' };
    }
    
    const isExpired = doc.hasExpiry && docEntry.expiry && new Date(docEntry.expiry) < new Date();
    const isExpiringSoon = doc.hasExpiry && docEntry.expiry && new Date(docEntry.expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    if (isExpired) return { status: 'expired', color: 'bg-red-50 border-red-200' };
    if (isExpiringSoon) return { status: 'expiring', color: 'bg-orange-50 border-orange-200' };
    return { status: 'valid', color: 'bg-green-50 border-green-200' };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expiring': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'expired': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleUploadClick = (docType) => {
    setSelectedDocType(docType);
    setShowUploadModal(true);
  };

  const handleFileUpload = (file, metadata = {}) => {
    if (selectedDocType) {
      setDocumentData(prev => ({
        ...prev,
        [selectedDocType]: {
          ...prev[selectedDocType],
          file: file,
          ...metadata
        }
      }));
      setShowUploadModal(false);
      setSelectedDocType(null);
    }
  };

    // Calculate compliance summary - UPDATED for filtered documents
    const summary = filteredDocuments.reduce((acc, doc) => {
      const { status } = getDocumentStatus(doc);
      if (doc.isMandatory) {
        if (status === 'valid') acc.compliant++;
        acc.totalMandatory++;
      }
      return acc;
    }, { compliant: 0, totalMandatory: 0 });
  
    const compliancePercentage = summary.totalMandatory > 0 
      ? Math.round((summary.compliant / summary.totalMandatory) * 100) 
      : 0;

       // Document Row Component (replaces grid cards with rows)
  const DocumentRow = ({ doc }) => {
    const { status, color } = getDocumentStatus(doc);
    const docEntry = documentData[doc.dbKey];
    
    return (
      <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${color} mb-3`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left side: Document info */}
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              {getStatusIcon(status)}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="font-semibold text-gray-800">
                    {doc.label}
                  </h5>
                  {doc.isMandatory && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      Required
                    </span>
                  )}
                  {doc.condition && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {doc.condition}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {doc.description}
                </p>
                
                {/* Document details */}
                {docEntry && docEntry.file && (
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{docEntry.file.name}</span>
                    </p>
                    {docEntry.expiry && (
                      <p className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Expires: {new Date(docEntry.expiry).toLocaleDateString()}</span>
                      </p>
                    )}
                    {docEntry.number && (
                      <p>Number: {docEntry.number}</p>
                    )}
                    {docEntry.isoType && (
                      <p>ISO Type: {docEntry.isoType}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-3">
            {isEditable ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedDocType(doc.dbKey);
                  setShowUploadModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{docEntry?.file ? 'Replace' : 'Upload'}</span>
              </button>
            ) : (
              <span className="text-gray-500">View Only</span>
            )}

            {docEntry?.file && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const fileUrl = URL.createObjectURL(docEntry.file);
                    window.open(fileUrl, '_blank');
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title="View Document"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    const fileUrl = URL.createObjectURL(docEntry.file);
                    link.href = fileUrl;
                    link.download = docEntry.file.name;
                    link.click();
                    URL.revokeObjectURL(fileUrl);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title="Download Document"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
      
  // Document Upload Modal Component
  const DocumentUploadModal = () => {
    const [file, setFile] = useState(null);
    const [expiryDate, setExpiryDate] = useState('');
    const [docNumber, setDocNumber] = useState('');
    const [isoType, setIsoType] = useState('');

    if (!showUploadModal) return null;

    const selectedDoc = ENHANCED_DOCUMENT_CHECKLIST.find(doc => doc.dbKey === selectedDocType);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!file) return;

      const metadata = {};
      if (selectedDoc.hasExpiry) metadata.expiry = expiryDate;
      if (selectedDoc.hasNumber) metadata.number = docNumber;
      if (selectedDoc.hasIsoType) metadata.isoType = isoType;

      handleFileUpload(file, metadata);
      setFile(null);
      setExpiryDate('');
      setDocNumber('');
      setIsoType('');
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">        
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              {/* Add close button on overlay click */}
              <div 
                className="fixed inset-0" 
                onClick={() => setShowUploadModal(false)}
              ></div>
              
              <div className="relative z-10"> {/* Add this wrapper */}
                {/* Rest of your modal content */}
              </div>
            </div>
          </div>
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">
              Upload {selectedDoc?.label}
            </h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {file ? file.name : 'Click to select file'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, JPG, PNG (Max 10MB)
                </p>
              </label>
            </div>
          </div>

          {/* Dynamic Fields */}
          {selectedDoc?.hasExpiry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          {selectedDoc?.hasNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedDoc.numberLabel || "Document Number"}
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter document number"
              />
            </div>
          )}

          {selectedDoc?.hasIsoType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISO Type
              </label>
              <input
                type="text"
                value={isoType}
                onChange={(e) => setIsoType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g., 9001, 14001"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button" // ✅ Changed from "submit" to "button"
              onClick={handleSubmit} // ✅ Manually call handleSubmit
              disabled={!file}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

return (
  <div className="space-y-6">
    {/* Compliance Summary */}
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-blue-800">Document Compliance</h4>
          <p className="text-sm text-blue-600">
            {summary.compliant} of {summary.totalMandatory} mandatory documents uploaded
            {vendorType && (
              <span className="ml-2 text-blue-500">
                (Filtered for {vendorType})
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-blue-800">
            {compliancePercentage}% Complete
          </p>
          <div className="w-32 bg-blue-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${compliancePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>

      {/* Document List in Rows */}
      <div className="space-y-3">
        {filteredDocuments.map((doc) => (
          <DocumentRow key={doc.dbKey} doc={doc} />
        ))}
      </div>

      {vendorType && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Note:</span> Documents are filtered for 
            <span className="font-semibold ml-1">
              {vendorType === 'ServiceProvider' ? 'Service Provider' : 
              vendorType === 'GeneralContractor' ? 'General Contractor' : 
              vendorType}
            </span> vendors.
            Some documents may be hidden if they don't apply.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal />
    </div>
  );
};

export default EnhancedQualificationDocumentManager;