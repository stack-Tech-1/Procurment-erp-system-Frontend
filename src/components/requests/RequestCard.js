// frontend/src/components/requests/RequestCard.js
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle,
  ChevronRight,
  Paperclip,
  Building,
  Flag
} from 'lucide-react';
import RequestStatusBadge from './RequestStatusBadge';
import { formatDate, getRelativeTime, isOverdue } from '@/utils/dateUtils';
import { REQUEST_TYPES, PRIORITY_LEVELS, REQUEST_STATUS } from '@/utils/requestConstants';

const RequestCard = ({ request, isVendorView = true, onClick }) => {

  const requestType = request.requestType || 'OTHER';
  const requestTypeConfig = REQUEST_TYPES[request.requestType] || REQUEST_TYPES.OTHER;
  const priority = request.priority || 'NORMAL';
  const priorityConfig = PRIORITY_LEVELS[request.priority] || PRIORITY_LEVELS.NORMAL;
  const dueDate = request.dueDate ? new Date(request.dueDate) : new Date();
  const isDueSoon = !isOverdue(request.dueDate) && new Date(request.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const hasAttachment = request.responseFiles && request.responseFiles.length > 0;
  
  const getPriorityBadge = () => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
      URGENT: 'bg-orange-100 text-orange-800 border-orange-200',
      NORMAL: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`
        inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border
        ${colors[request.priority] || colors.NORMAL}
      `}>
        <Flag size={10} />
        {priorityConfig.label}
      </span>
    );
  };
  
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(request);
    }
  };
  
  const cardContent = (
    <div className={`
      group bg-white border rounded-xl p-4 hover:shadow-lg transition-all duration-200
      ${isOverdue(request.dueDate) ? 'border-red-200 hover:border-red-300' :
        isDueSoon ? 'border-yellow-200 hover:border-yellow-300' :
        'border-gray-200 hover:border-gray-300'}
      ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <RequestStatusBadge status={request.status} size="sm" />
            {getPriorityBadge()}
          </div>
          
          <h3 className="text-base font-semibold text-gray-800 truncate group-hover:text-blue-600">
            {request.title}
          </h3>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {request.description}
          </p>
        </div>
        
        <div className="ml-3 flex items-center">
          <div className={`
            p-2 rounded-lg
            ${requestTypeConfig.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              requestTypeConfig.color === 'green' ? 'bg-green-100 text-green-600' :
              requestTypeConfig.color === 'purple' ? 'bg-purple-100 text-purple-600' :
              requestTypeConfig.color === 'orange' ? 'bg-orange-100 text-orange-600' :
              'bg-gray-100 text-gray-600'}
          `}>
            <FileText size={18} />
          </div>
          {onClick && (
            <ChevronRight className="ml-2 text-gray-400 group-hover:text-blue-500" size={20} />
          )}
        </div>
      </div>
      
      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* Left Column */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} />
            <span>Due: {formatDate(request.dueDate, 'short')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={14} />
            <span className={isOverdue(request.dueDate) ? 'text-red-600 font-medium' : ''}>
              {getRelativeTime(request.dueDate, true)}
            </span>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-2">
          {!isVendorView && (
            <div className="flex items-center gap-2 text-gray-600">
              <Building size={14} />
              <span className="truncate" title={request.vendorName}>
                {request.vendorName}
              </span>
            </div>
          )}
          
          {isVendorView && request.createdByName && (
            <div className="flex items-center gap-2 text-gray-600">
              <User size={14} />
              <span>By: {request.createdByName}</span>
            </div>
          )}
          
          {hasAttachment && (
            <div className="flex items-center gap-2 text-blue-600">
              <Paperclip size={14} />
              <span>{request.responseFiles.length} attachment(s)</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Warning for overdue/soon due */}
      {(isOverdue(request.dueDate) || isDueSoon) && (
        <div className={`
          mt-3 p-2 rounded-lg text-sm flex items-center gap-2
          ${isOverdue(request.dueDate) 
            ? 'bg-red-50 text-red-700 border border-red-100' 
            : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
          }
        `}>
          <AlertCircle size={14} />
          <span>
            {isOverdue(request.dueDate) 
              ? `Overdue by ${Math.abs(getRelativeTime(request.dueDate, true).match(/\d+/)?.[0] || 0)} days`
              : 'Due soon'
            }
          </span>
        </div>
      )}
      
      {/* Response preview for submitted/approved/rejected */}
      {request.responseText && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Response:</p>
          <p className="text-sm text-gray-700 line-clamp-2">
            {request.responseText}
          </p>
        </div>
      )}
    </div>
  );
  
  if (onClick) {
    return (
      <div onClick={handleClick}>
        {cardContent}
      </div>
    );
  }
  
  if (isVendorView) {
    return (
      <Link href={`/vendor-dashboard/requests/${request.id}`}>
        {cardContent}
      </Link>
    );
  }
  
  return cardContent;
};

export default RequestCard;