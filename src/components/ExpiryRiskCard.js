// src/components/ExpiryRiskCard.jsx

import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

const ExpiryRiskCard = ({ expired, expiringSoon, total }) => {
    // Calculate total high-risk vendors
    const highRisk = expired + expiringSoon;
    
    // Calculate the risk percentage (handle division by zero if total is 0)
    const riskPercentage = total > 0 ? ((highRisk / total) * 100).toFixed(1) : 0;
    
    // Determine the color based on risk level
    let riskColor = 'text-green-600 bg-green-100';
    let riskLabel = 'Low Risk';

    if (highRisk > 0 && highRisk <= total * 0.2) { // up to 20% is moderate
        riskColor = 'text-orange-600 bg-orange-100';
        riskLabel = 'Moderate Risk';
    } else if (highRisk > total * 0.2) { // over 20% is high
        riskColor = 'text-red-600 bg-red-100';
        riskLabel = 'High Risk';
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col justify-between border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Document Expiry Risk</h3>
                <AlertTriangle className={`w-6 h-6 ${riskColor.split(' ')[0]}`} />
            </div>

            <div className="space-y-4">
                {/* Total Risk */}
                <div className="border-b pb-3">
                    <p className="text-sm font-medium text-gray-500">Vendors at High Risk (Expired or Expiring Soon)</p>
                    <p className="text-4xl font-extrabold text-gray-900 mt-1">{highRisk}</p>
                </div>
                
                {/* Risk Breakdown */}
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                        <p className="text-red-500 font-bold">{expired}</p>
                        <p className="text-gray-500">Expired</p>
                    </div>
                    <div>
                        <p className="text-orange-500 font-bold">{expiringSoon}</p>
                        <p className="text-gray-500">Expiring Soon</p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-700">{total - highRisk}</p>
                        <p className="text-gray-500">Active</p>
                    </div>
                </div>

            </div>
            
            {/* Risk Indicator Tag */}
            <div className={`mt-4 px-3 py-1 text-sm font-semibold rounded-full w-max ${riskColor}`}>
                {riskLabel} ({riskPercentage}% of Total)
            </div>
        </div>
    );
};

export default ExpiryRiskCard;