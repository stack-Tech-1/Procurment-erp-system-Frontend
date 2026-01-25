"use client";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { CheckSquare, TrendingUp, FileText, Clock } from 'lucide-react';

const ReviewTabs = ({ 
  qualificationProps, 
  evaluationProps 
}) => {
  const { t } = useTranslation(); // ADD THIS HOOK
  const [activeTab, setActiveTab] = useState('qualification');

  const tabs = [
    { 
      id: 'qualification', 
      label: t('qualification'), 
      icon: CheckSquare,
      description: t('statusClassification')
    },
    { 
      id: 'evaluation', 
      label: t('evaluation'), 
      icon: TrendingUp,
      description: t('scoringRating')
    }
  ];

  return (
    <div className="sticky top-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 bg-gray-50/80">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 transition-all duration-200 ${
                isActive
                  ? 'bg-white text-blue-700 shadow-sm border-t-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <IconComponent className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">{tab.label}</span>
              <span className="text-xs text-gray-500 mt-1">{tab.description}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
        {/* Qualification Tab */}
        {activeTab === 'qualification' && (
          <div className="p-1">
            <div className="bg-blue-800 rounded-lg m-2">
              {qualificationProps.children}
            </div>
          </div>
        )}
        
        {/* Evaluation Tab */}
        {activeTab === 'evaluation' && (
          <div className="p-1">
            <div className="m-2">
              {evaluationProps.children}
            </div>
          </div>
        )}
      </div>

      {/* Active Tab Indicator */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
        {activeTab === 'qualification' ? t('updateVendorStatusClassification') : t('evaluateVendorPerformanceScore')}
      </div>
    </div>
  );
};

export default ReviewTabs;