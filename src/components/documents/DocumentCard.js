"use client";
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/formatters';
import { FileText, Eye, Upload, CheckSquare, Square } from 'lucide-react';

function getStatus(doc) {
  if (!doc) return 'MISSING';
  if (doc.status) return doc.status;
  if (!doc.expiryDate) return 'VALID';
  const expiry = new Date(doc.expiryDate);
  const now = new Date();
  if (expiry < now) return 'EXPIRED';
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (expiry < thirtyDays) return 'EXPIRING_SOON';
  return 'VALID';
}

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const map = {
    VALID: 'bg-green-100 text-green-700',
    EXPIRED: 'bg-red-100 text-red-700',
    EXPIRING_SOON: 'bg-orange-100 text-orange-700',
    MISSING: 'bg-gray-100 text-gray-500',
  };
  const keys = {
    VALID: 'valid',
    EXPIRED: 'expired',
    EXPIRING_SOON: 'expiringSoon',
    MISSING: 'missing',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || map.MISSING}`}>
      {t(keys[status] || 'missing', status)}
    </span>
  );
}

function RequiredForBadge({ requiredFor }) {
  const map = {
    BOTH: 'bg-blue-100 text-blue-700',
    SUPPLIER: 'bg-green-100 text-green-700',
    CONTRACTOR: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[requiredFor] || 'bg-gray-100 text-gray-500'}`}>
      {requiredFor}
    </span>
  );
}

function borderClass(status) {
  switch (status) {
    case 'VALID': return 'border-l-4 border-l-green-500';
    case 'EXPIRED': return 'border-l-4 border-l-red-500';
    case 'EXPIRING_SOON': return 'border-l-4 border-l-yellow-500';
    default: return 'border-l-4 border-l-gray-300';
  }
}

export default function DocumentCard({
  docType,
  label,
  document,
  onUpload,
  onPreview,
  requiredFor = 'BOTH',
  isUploading = false,
  canVerify = false,
  onVerify,
}) {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef(null);
  const status = getStatus(document);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) onUpload(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const docFileName = document?.fileName || document?.fileUrl?.split('/').pop() || null;
  const truncatedName = docFileName && docFileName.length > 30
    ? docFileName.slice(0, 27) + '...'
    : docFileName;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3 ${borderClass(status)}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-800 leading-tight">{label}</span>
        </div>
        <RequiredForBadge requiredFor={requiredFor} />
      </div>

      {/* Middle row */}
      {document ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          <StatusBadge status={status} />
          {truncatedName && (
            <span className="truncate max-w-[160px]" title={docFileName}>{truncatedName}</span>
          )}
          {document.expiryDate && (
            <span className="text-gray-400">
              {t('exp')}: {formatDate(document.expiryDate, i18n.language)}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">{t('noDocumentUploaded')}</p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <span className="text-xs text-gray-400">
          {document?.uploadedAt
            ? `${t('uploaded')}: ${formatDate(document.uploadedAt, i18n.language)}`
            : document?.createdAt
            ? `${t('uploaded')}: ${formatDate(document.createdAt, i18n.language)}`
            : ''}
        </span>

        <div className="flex items-center gap-1.5">
          {canVerify && document && (
            <button
              onClick={() => onVerify?.(!document.isVerified)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors"
              style={document.isVerified
                ? { borderColor: '#16a34a', color: '#16a34a', backgroundColor: '#f0fdf4' }
                : { borderColor: '#d1d5db', color: '#6b7280', backgroundColor: 'white' }}
              title={document.isVerified ? 'Mark as unverified' : 'Mark as verified'}
            >
              {document.isVerified
                ? <CheckSquare className="w-3.5 h-3.5" />
                : <Square className="w-3.5 h-3.5" />}
              {t('verified')}
            </button>
          )}

          {document && onPreview && (
            <button
              onClick={() => onPreview({ fileUrl: document.url || document.fileUrl, fileName: docFileName })}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors hover:opacity-80"
              style={{ borderColor: '#B8960A', color: '#B8960A', backgroundColor: '#fffbeb' }}
              title="Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          )}

          <button
            onClick={triggerUpload}
            disabled={isUploading}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors hover:opacity-80 disabled:opacity-50"
            style={document
              ? { borderColor: '#d1d5db', color: '#374151', backgroundColor: 'white' }
              : { borderColor: '#0A1628', color: 'white', backgroundColor: '#0A1628' }}
            title={document ? 'Replace file' : 'Upload file'}
          >
            {isUploading ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {document ? t('replace') : t('upload')}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
