// frontend/src/components/requests/FileUploader.js
"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, FileSpreadsheet, Trash2, Eye } from 'lucide-react';

const FileUploader = ({
  files = [],
  onChange,
  multiple = true,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png',
  label = 'Upload Files',
  description = 'Drag & drop files or click to browse',
  disabled = false
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState([]);

  const validateFile = (file) => {
    const errors = [];
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`${file.name} exceeds ${maxSizeMB}MB limit`);
    }
    
    // Check file type
    const acceptedExtensions = acceptedTypes.split(',').map(ext => ext.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedExtensions.includes(fileExtension)) {
      errors.push(`${file.name} has invalid file type`);
    }
    
    // Check total files count
    if (multiple && files.length >= maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }
    
    return errors;
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (selectedFiles) => {
    const newErrors = [];
    const validFiles = [];
    
    selectedFiles.slice(0, maxFiles - files.length).forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });
    
    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      onChange(updatedFiles);
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const type = file.type;
    
    if (type.includes('pdf')) return <FileText className="text-red-500" size={20} />;
    if (type.includes('word') || extension === 'doc' || extension === 'docx') 
      return <FileText className="text-blue-500" size={20} />;
    if (type.includes('excel') || extension === 'xls' || extension === 'xlsx') 
      return <FileSpreadsheet className="text-green-500" size={20} />;
    if (type.includes('image')) return <Image className="text-purple-500" size={20} />;
    return <FileText className="text-gray-500" size={20} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          <span className="text-xs text-gray-500 ml-2">
            ({acceptedTypes.replace(/\./g, '').toUpperCase()}, max {maxSizeMB}MB each)
          </span>
        </label>
        <p className="text-xs text-gray-500 mb-3">{description}</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Upload className="text-blue-600" size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {dragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or click to browse files from your computer
            </p>
          </div>
          <div className="text-xs text-gray-400">
            Supports: {acceptedTypes.replace(/\./g, '').toUpperCase()}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700 mb-1">Upload Errors:</p>
          <ul className="text-xs text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Selected Files ({files.length}/{maxFiles})
            </span>
            {!disabled && files.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 size={12} />
                Remove All
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getFileIcon(file)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.type || 'Unknown type'}</span>
                    </div>
                  </div>
                </div>
                
                {!disabled && (
                  <div className="flex items-center gap-2">
                    {file.type?.includes('image') || file.type?.includes('pdf') ? (
                      <button
                        type="button"
                        onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Preview"
                      >
                        <Eye size={16} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Count Warning */}
      {multiple && files.length >= maxFiles && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Maximum {maxFiles} files reached. Remove some files to upload more.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;