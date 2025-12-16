// frontend/src/components/requests/RequestStatusBadge.js
"use client";

import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Upload,
  AlertTriangle
} from 'lucide-react';
import { REQUEST_STATUS } from '@/utils/mockRequests';

const RequestStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const statusConfig = REQUEST_STATUS[status] || REQUEST_STATUS.PENDING;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };
  
  const iconSize = {
    sm: 12,
    md: 14,
    lg: 16
  };
  
  const getIcon = () => {
    switch (status) {
      case 'PENDING':
        return <Clock size={iconSize[size]} />;
      case 'SUBMITTED':
        return <Upload size={iconSize[size]} />;
      case 'APPROVED':
        return <CheckCircle size={iconSize[size]} />;
      case 'REJECTED':
        return <XCircle size={iconSize[size]} />;
      case 'OVERDUE':
        return <AlertTriangle size={iconSize[size]} />;
      default:
        return <AlertCircle size={iconSize[size]} />;
    }
  };
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full border font-medium
      ${statusConfig.bgColor}
      ${statusConfig.borderColor}
      ${sizeClasses[size]}
      ${status === 'OVERDUE' ? 'text-red-700 border-red-300' : 
        status === 'PENDING' ? 'text-yellow-700 border-yellow-300' :
        status === 'SUBMITTED' ? 'text-blue-700 border-blue-300' :
        status === 'APPROVED' ? 'text-green-700 border-green-300' :
        'text-red-700 border-red-300'
      }
    `}>
      {showIcon && getIcon()}
      <span>{statusConfig.label}</span>
    </span>
  );
};

export default RequestStatusBadge;