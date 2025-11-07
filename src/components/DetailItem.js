// src/components/DetailItem.jsx

import React from 'react';
import { Tag } from 'lucide-react';

/**
 * A reusable component to display a single read-only detail field.
 * @param {object} props
 * @param {string} props.label - The label for the data point.
 * @param {string} props.value - The value to display.
 * @param {React.ReactNode} [props.icon] - Optional icon component (e.g., Lucide icon).
 * @param {string} [props.className] - Optional Tailwind CSS class for the container.
 */
const DetailItem = ({ label, value, icon: Icon, className = '' }) => {
    return (
        <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                {Icon && <Icon className="w-3 h-3 mr-1" />}
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800 break-words">
                {value || 'N/A'}
            </p>
        </div>
    );
};

export default DetailItem;
