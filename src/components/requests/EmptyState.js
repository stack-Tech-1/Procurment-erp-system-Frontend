// frontend/src/components/requests/EmptyState.js
"use client";

import React from 'react';
import { FileText, Inbox, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const EmptyState = ({ 
  type = 'default', 
  title, 
  description, 
  actionButton 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'no-requests':
        return <Inbox className="text-gray-400" size={48} />;
      case 'no-pending':
        return <CheckCircle className="text-green-400" size={48} />;
      case 'no-overdue':
        return <AlertCircle className="text-green-400" size={48} />;
      case 'no-results':
        return <FileText className="text-gray-400" size={48} />;
      case 'loading':
        return <Clock className="text-blue-400 animate-pulse" size={48} />;
      default:
        return <Inbox className="text-gray-400" size={48} />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'no-requests':
        return 'No Information Requests';
      case 'no-pending':
        return 'All Caught Up!';
      case 'no-overdue':
        return 'No Overdue Requests';
      case 'no-results':
        return 'No Results Found';
      case 'loading':
        return 'Loading...';
      default:
        return 'No Data Available';
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case 'no-requests':
        return "You don't have any information requests yet. Requests will appear here when procurement needs additional information.";
      case 'no-pending':
        return 'You have responded to all pending requests. Great work!';
      case 'no-overdue':
        return 'All your requests are up to date. Keep it up!';
      case 'no-results':
        return 'Try adjusting your filters to see more results.';
      case 'loading':
        return 'Please wait while we load your requests...';
      default:
        return 'There is no data to display at the moment.';
    }
  };

  return (
    <div className="text-center py-12 px-4">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-gray-50 rounded-full">
          {getIcon()}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title || getDefaultTitle()}
      </h3>
      
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        {description || getDefaultDescription()}
      </p>
      
      {actionButton && (
        <div className="mt-6">
          {actionButton}
        </div>
      )}
      
      {type === 'no-requests' && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Tip:</span> Information requests are used by procurement to request:
          </p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1 text-left">
            <li>• Missing or updated documents (certificates, NDAs)</li>
            <li>• Clarifications on proposals or qualifications</li>
            <li>• Brand lists and authorization details</li>
            <li>• Additional project information</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmptyState;