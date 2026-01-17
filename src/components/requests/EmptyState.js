// frontend/src/components/requests/EmptyState.js
"use client";

import React from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS
import { FileText, Inbox, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const EmptyState = ({ 
  type = 'default', 
  title, 
  description, 
  actionButton 
}) => {
  const { t } = useTranslation(); // ADD THIS

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
        return t('noInformationRequests');
      case 'no-pending':
        return t('allCaughtUp');
      case 'no-overdue':
        return t('noOverdueRequests');
      case 'no-results':
        return t('noResultsFound');
      case 'loading':
        return t('loading');
      default:
        return t('noDataAvailable');
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case 'no-requests':
        return t('noRequestsDescription');
      case 'no-pending':
        return t('noPendingRequestsDescription');
      case 'no-overdue':
        return t('noOverdueRequestsDescription');
      case 'no-results':
        return t('noResultsFoundDescription');
      case 'loading':
        return t('loadingRequestsDescription');
      default:
        return t('noDataAvailableDescription');
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
            <span className="font-medium">{t('tip')}:</span> {t('informationRequestsUsedFor')}
          </p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1 text-left">
            <li>• {t('missingUpdatedDocuments')}</li>
            <li>• {t('clarificationsOnProposals')}</li>
            <li>• {t('brandListsAuthorizationDetails')}</li>
            <li>• {t('additionalProjectInformation')}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmptyState;