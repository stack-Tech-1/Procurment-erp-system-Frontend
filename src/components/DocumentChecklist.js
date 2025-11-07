"use client";
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileText, Calendar, Download } from 'lucide-react';

const DOCUMENT_TYPES = [
  { key: 'COMMERCIAL_REGISTRATION', label: 'Commercial Registration (CR)', hasExpiry: true, isMandatory: true },
  { key: 'ZAKAT_CERTIFICATE', label: 'Zakat Certificate', hasExpiry: true, isMandatory: true },
  { key: 'VAT_CERTIFICATE', label: 'VAT Certificate', hasExpiry: false, isMandatory: true },
  { key: 'GOSI_CERTIFICATE', label: 'GOSI Certificate', hasExpiry: true, isMandatory: true },
  { key: 'ISO_CERTIFICATE', label: 'ISO Certificate', hasExpiry: true, isMandatory: true },
  { key: 'SASO_SABER_CERTIFICATE', label: 'SASO/SABER Certificate', hasExpiry: true, isMandatory: false },
  { key: 'HSE_PLAN', label: 'HSE Plan', hasExpiry: false, isMandatory: false, condition: 'For Contractors' },
  { key: 'WARRANTY_CERTIFICATE', label: 'Warranty Certificate', hasExpiry: false, isMandatory: true },
  { key: 'QUALITY_PLAN', label: 'Quality Plan', hasExpiry: false, isMandatory: true },
  { key: 'BANK_LETTER', label: 'Bank Letter/IBAN', hasExpiry: false, isMandatory: true },
  { key: 'COMPANY_PROFILE', label: 'Company Profile (PDF)', hasExpiry: false, isMandatory: true },
  { key: 'TECHNICAL_FILE', label: 'Technical File', hasExpiry: false, isMandatory: true },
  { key: 'FINANCIAL_FILE', label: 'Financial File (Audited + Bank)', hasExpiry: false, isMandatory: true },
  { key: 'INSURANCE_CERTIFICATE', label: 'Insurance Certificates', hasExpiry: true, isMandatory: true },
  { key: 'INDUSTRY_LICENSE', label: 'Industry Licenses/Permits', hasExpiry: true, isMandatory: false },
  { key: 'VENDOR_CODE_OF_CONDUCT', label: 'Vendor Code of Conduct', hasExpiry: false, isMandatory: true },
  { key: 'ORGANIZATION_CHART', label: 'Organization Chart', hasExpiry: false, isMandatory: true },
];

const DocumentChecklist = ({ documents = [], vendorType = 'Supplier' }) => {
  const getDocumentStatus = (docKey) => {
    const doc = documents.find(d => d.docType === docKey);
    if (!doc) return { status: 'missing', document: null };
    
    const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
    const isExpiringSoon = doc.expiryDate && new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    if (isExpired) return { status: 'expired', document: doc };
    if (isExpiringSoon) return { status: 'expiring', document: doc };
    return { status: 'valid', document: doc };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expiring': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'expired': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'bg-green-50 border-green-200 text-green-800';
      case 'expiring': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'expired': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  // Calculate summary
  const summary = DOCUMENT_TYPES.reduce((acc, docType) => {
    const { status } = getDocumentStatus(docType.key);
    if (status === 'valid') acc.valid++;
    if (status === 'expired') acc.expired++;
    if (status === 'expiring') acc.expiring++;
    if (status === 'missing') acc.missing++;
    return acc;
  }, { valid: 0, expired: 0, expiring: 0, missing: 0 });

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold text-blue-800">Document Compliance Summary</h4>
            <p className="text-sm text-blue-600">
              Valid: {summary.valid} • Expired: {summary.expired} • Expiring Soon: {summary.expiring} • Missing: {summary.missing}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-800">
              Completion: {Math.round((summary.valid / DOCUMENT_TYPES.length) * 100)}%
            </p>
            <div className="w-32 bg-blue-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(summary.valid / DOCUMENT_TYPES.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {DOCUMENT_TYPES.map((docType) => {
          const { status, document } = getDocumentStatus(docType.key);
          
          return (
            <div 
              key={docType.key}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${getStatusColor(status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{docType.label}</span>
                      {docType.condition && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          {docType.condition}
                        </span>
                      )}
                      {docType.isMandatory && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Mandatory
                        </span>
                      )}
                    </div>
                    
                    {document && (
                      <div className="text-sm mt-1 space-y-1">
                        {document.documentNumber && (
                          <p>Number: {document.documentNumber}</p>
                        )}
                        {document.expiryDate && (
                          <p className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Expires: {new Date(document.expiryDate).toLocaleDateString()}</span>
                          </p>
                        )}
                        {document.verifiedBy && (
                          <p className="text-gray-600">
                            Verified by: {document.verifiedBy} on {document.verificationDate ? new Date(document.verificationDate).toLocaleDateString() : 'N/A'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {document?.url && (
                    <a 
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentChecklist;