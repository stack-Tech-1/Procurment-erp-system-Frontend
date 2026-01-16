// src/components/ExpiryRiskCard.jsx - UPDATED WITH i18n
"use client";
import React from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { AlertTriangle, Clock } from 'lucide-react';

const ExpiryRiskCard = ({ expired, expiringSoon, total }) => {
    const { t } = useTranslation(); // ADD THIS HOOK
    
    const highRisk = expired + expiringSoon;
    const riskPercentage = total > 0 ? ((highRisk / total) * 100).toFixed(1) : 0;
    
    let riskColor = 'text-green-600 bg-green-100';
    let riskLabel = t('lowRisk');

    if (highRisk > 0 && highRisk <= total * 0.2) {
        riskColor = 'text-orange-600 bg-orange-100';
        riskLabel = t('moderateRisk');
    } else if (highRisk > total * 0.2) {
        riskColor = 'text-red-600 bg-red-100';
        riskLabel = t('highRisk');
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col justify-between border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-700">{t('documentExpiryRisk')}</h3>
                <AlertTriangle className={`w-6 h-6 ${riskColor.split(' ')[0]}`} />
            </div>

            <div className="space-y-4">
                {/* Total Risk */}
                <div className="border-b pb-3">
                    <p className="text-sm font-medium text-gray-500">{t('vendorsAtHighRisk')}</p>
                    <p className="text-4xl font-extrabold text-gray-900 mt-1">{highRisk}</p>
                </div>
                
                {/* Risk Breakdown */}
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                        <p className="text-red-500 font-bold">{expired}</p>
                        <p className="text-gray-500">{t('expired')}</p>
                    </div>
                    <div>
                        <p className="text-orange-500 font-bold">{expiringSoon}</p>
                        <p className="text-gray-500">{t('expiringSoon')}</p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-700">{total - highRisk}</p>
                        <p className="text-gray-500">{t('active')}</p>
                    </div>
                </div>

            </div>
            
            {/* Risk Indicator Tag */}
            <div className={`mt-4 px-3 py-1 text-sm font-semibold rounded-full w-max ${riskColor}`}>
                {riskLabel} ({riskPercentage}% {t('ofTotal')})
            </div>
        </div>
    );
};

export default ExpiryRiskCard;