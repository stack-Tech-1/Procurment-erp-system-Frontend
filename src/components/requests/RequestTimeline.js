// frontend/src/components/requests/RequestTimeline.js
"use client";

import React from 'react';
import {
  FilePlus,
  Bell,
  Upload,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  User
} from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

const RequestTimeline = ({ events = [] }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'REQUEST_CREATED':
        return <FilePlus className="text-blue-500" size={16} />;
      case 'NOTIFICATION_SENT':
        return <Bell className="text-yellow-500" size={16} />;
      case 'RESPONSE_SUBMITTED':
        return <Upload className="text-green-500" size={16} />;
      case 'REQUEST_APPROVED':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'REQUEST_REJECTED':
        return <XCircle className="text-red-500" size={16} />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="text-purple-500" size={16} />;
      case 'REMINDER_SENT':
        return <Bell className="text-orange-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'REQUEST_CREATED':
        return 'bg-blue-100 border-blue-200';
      case 'NOTIFICATION_SENT':
        return 'bg-yellow-100 border-yellow-200';
      case 'RESPONSE_SUBMITTED':
        return 'bg-green-100 border-green-200';
      case 'REQUEST_APPROVED':
        return 'bg-green-100 border-green-200';
      case 'REQUEST_REJECTED':
        return 'bg-red-100 border-red-200';
      case 'COMMENT_ADDED':
        return 'bg-purple-100 border-purple-200';
      case 'REMINDER_SENT':
        return 'bg-orange-100 border-orange-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto text-gray-400 mb-3" size={32} />
        <p className="text-gray-500">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-full ${getEventColor(event.type)} border`}>
              {getEventIcon(event.type)}
            </div>
            {index !== events.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
            )}
          </div>
          
          {/* Event content */}
          <div className="flex-1 pb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-800">{event.title}</h4>
                  {event.user && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <User size={12} />
                      {event.user}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(event.timestamp, 'medium')}
                </span>
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-600">{event.description}</p>
              )}
              
              {event.details && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                  {event.details}
                </div>
              )}
              
              {event.attachments && event.attachments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {event.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                      >
                        📎 {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestTimeline;