"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText, Image, X, Minus, Plus, Maximize, Minimize, Download
} from 'lucide-react';

function detectFileType(fileType, fileName) {
  if (fileType) return fileType;
  if (!fileName) return 'other';
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'].includes(ext)) return 'image';
  return 'other';
}

export default function FilePreviewModal({ isOpen, onClose, fileUrl, fileName, fileType }) {
  const [zoom, setZoom] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const containerRef = useRef(null);

  const { t } = useTranslation();
  const resolvedType = detectFileType(fileType, fileName);

  // Reset state when a new file is opened
  useEffect(() => {
    if (isOpen) {
      setZoom(1.0);
      setLoadState('loading');
    }
  }, [isOpen, fileUrl]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Keyboard listeners
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === '+' || e.key === '=') { setZoom(z => Math.min(2.0, parseFloat((z + 0.25).toFixed(2)))); }
    if (e.key === '-') { setZoom(z => Math.max(0.5, parseFloat((z - 0.25).toFixed(2)))); }
  }, [isOpen, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Fullscreen change sync
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const zoomIn = () => setZoom(z => Math.min(2.0, parseFloat((z + 0.25).toFixed(2))));
  const zoomOut = () => setZoom(z => Math.max(0.5, parseFloat((z - 0.25).toFixed(2))));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  if (!isOpen) return null;

  const FileIcon = resolvedType === 'image' ? Image : FileText;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={containerRef}
        className="flex flex-col rounded-lg overflow-hidden shadow-2xl"
        style={{ width: '90vw', height: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ backgroundColor: '#0A1628' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon className="w-5 h-5 text-white shrink-0" />
            <span className="text-white text-sm font-medium truncate max-w-xs" title={fileName}>
              {fileName || t('filePreview')}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Zoom controls — only meaningful for pdf/image */}
            {(resolvedType === 'pdf' || resolvedType === 'image') && (
              <>
                <button
                  onClick={zoomOut}
                  disabled={zoom <= 0.5}
                  className="p-1.5 rounded text-white hover:bg-white/20 disabled:opacity-40 transition-colors"
                  title={t('zoomOut')}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-white text-sm w-12 text-center select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  disabled={zoom >= 2.0}
                  className="p-1.5 rounded text-white hover:bg-white/20 disabled:opacity-40 transition-colors"
                  title={t('zoomIn')}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded text-white hover:bg-white/20 transition-colors"
              title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded text-white hover:bg-white/20 transition-colors"
              title={t('downloadOpenNewTab')}
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-white hover:bg-white/20 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-auto relative"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {resolvedType === 'pdf' && (
            <>
              {loadState === 'loading' && <LoadingOverlay />}
              {loadState === 'error' && <ErrorOverlay fileUrl={fileUrl} />}
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  width: '100%',
                  height: zoom === 1.0 ? '100%' : `${100 / zoom}%`,
                }}
              >
                <iframe
                  src={fileUrl}
                  width="100%"
                  height="100%"
                  title={fileName}
                  onLoad={() => setLoadState('loaded')}
                  onError={() => setLoadState('error')}
                  style={{ border: 'none', display: 'block' }}
                />
              </div>
            </>
          )}

          {resolvedType === 'image' && (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              {loadState === 'loading' && <LoadingOverlay />}
              {loadState === 'error' && <ErrorOverlay fileUrl={fileUrl} />}
              <img
                src={fileUrl}
                alt={fileName}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  display: loadState === 'error' ? 'none' : 'block',
                }}
                onLoad={() => setLoadState('loaded')}
                onError={() => setLoadState('error')}
              />
            </div>
          )}

          {resolvedType === 'other' && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400">
              <FileText className="w-16 h-16 text-gray-600" />
              <p className="text-lg">Preview not available for this file type.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#B8960A' }}
              >
                <Download className="w-4 h-4" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/60">
      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
      <span className="text-white text-sm">Loading preview...</span>
    </div>
  );
}

function ErrorOverlay({ fileUrl }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900/80 gap-4 text-gray-300">
      <p>Could not load file preview.</p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded text-white text-sm font-medium hover:opacity-90"
        style={{ backgroundColor: '#B8960A' }}
      >
        <Download className="w-4 h-4" />
        Download File
      </a>
    </div>
  );
}
