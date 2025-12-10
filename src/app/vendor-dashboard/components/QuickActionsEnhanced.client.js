"use client";
import React, { useState } from 'react';
import { 
  FileText, BarChart3, Users, Download, HelpCircle, 
  Upload, FileCheck, ExternalLink, AlertCircle, Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const QuickActionsEnhanced = ({ vendorData }) => {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState(null);
  
  const actions = [
    {
      id: 'submit-proposal',
      icon: <FileText size={22} />,
      label: 'Submit New Proposal',
      description: 'Respond to RFQs or submit a new bid',
      path: '/vendor/proposals/new',
      disabled: vendorData.status === 'REJECTED' || vendorData.status === 'BLOCKED',
      badge: vendorData.newRFQs > 0 ? `${vendorData.newRFQs} new` : null,
      tooltip: 'Access available RFQs and submit proposals'
    },
    {
      id: 'view-performance',
      icon: <BarChart3 size={22} />,
      label: 'View Performance',
      description: 'View performance analytics and vendor rating',
      path: '/vendor/performance',
      badge: vendorData.qualificationScore < 70 ? 'Needs improvement' : null,
      tooltip: 'Detailed analytics and performance metrics'
    },
    {
      id: 'update-profile',
      icon: <Users size={22} />,
      label: 'Update Profile',
      description: 'Update company details and compliance documents',
      path: '/vendor/profile',
      badge: vendorData.documentsExpiring > 0 ? `${vendorData.documentsExpiring} expiring` : null,
      highlighted: vendorData.profileCompletion < 100,
      tooltip: 'Manage company information and documents'
    },
    {
      id: 'download-reports',
      icon: <Download size={22} />,
      label: 'Download Reports',
      description: 'Export vendor performance reports',
      path: '/vendor/reports',
      tooltip: 'Export reports in PDF or Excel format'
    },
    {
      id: 'manage-documents',
      icon: <FileCheck size={22} />,
      label: 'Manage Documents',
      description: 'Upload and manage compliance files',
      path: '/vendor/documents',
      tooltip: 'Document management and compliance'
    },
    {
      id: 'help-center',
      icon: <HelpCircle size={22} />,
      label: 'Help Center',
      description: 'Tutorials and support',
      path: '/vendor/help',
      tooltip: 'Video tutorials and guides'
    }
  ];

  const handleActionClick = async (action) => {
    if (action.disabled) return;
    
    setLoadingAction(action.id);
    
    // Show loading modal
    await new Promise(resolve => setTimeout(resolve, 600));
    
    router.push(action.path);
    setLoadingAction(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Quick Actions</h3>
          <p className="text-gray-600 text-sm mt-1">Common tasks and navigation</p>
        </div>
        <div className="text-sm text-gray-500">
          {actions.filter(a => !a.disabled).length} of {actions.length} available
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          <div key={action.id} className="relative group">
            <button
              onClick={() => handleActionClick(action)}
              disabled={action.disabled || loadingAction === action.id}
              className={`w-full flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 text-center
                ${action.disabled 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : action.highlighted
                    ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400 hover:bg-yellow-100'
                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                }
                ${loadingAction === action.id ? 'opacity-70' : ''}
              `}
              title={action.tooltip}
            >
              {loadingAction === action.id ? (
                <Loader2 className="animate-spin h-6 w-6 text-blue-600 mb-2" />
              ) : (
                <div className={`mb-2 ${action.disabled ? 'text-gray-400' : 'text-blue-600'}`}>
                  {action.icon}
                </div>
              )}
              
              <span className={`font-medium text-sm mb-1 ${
                action.disabled ? 'text-gray-500' : 'text-gray-700'
              }`}>
                {action.label}
              </span>
              
              <span className="text-xs text-gray-500 line-clamp-2">
                {action.description}
              </span>
              
              {/* Status badges */}
              {action.badge && !action.disabled && (
                <span className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  action.id === 'update-profile' && vendorData.documentsExpiring > 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {action.badge}
                </span>
              )}
              
              {action.highlighted && !action.disabled && (
                <span className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
              )}
            </button>
            
            {/* Tooltip on hover */}
            {!action.disabled && action.tooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-48">
                {action.tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
            
            {action.disabled && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-48">
                Action disabled. Your vendor status: {vendorData.status}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Needs attention</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">Disabled</span>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <HelpCircle size={16} />
            View tutorials
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsEnhanced;