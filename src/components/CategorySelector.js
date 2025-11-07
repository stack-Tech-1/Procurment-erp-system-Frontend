// src/components/CategorySelector.jsx
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, Search, X, Tag } from 'lucide-react';

// Mock data for categories. In a real application, this would be fetched from an API.
const MOCK_CATEGORIES = [
    { id: 1, name: 'Architectural', code: 'A100' },
    { id: 2, name: 'Structural', code: 'S200' },
    { id: 3, name: 'MEP (Mechanical)', code: 'M301' },
    { id: 4, name: 'MEP (Electrical)', code: 'M302' },
    { id: 5, name: 'HVAC Systems', code: 'M303' },
    { id: 6, name: 'Plumbing & Drainage', code: 'M304' },
    { id: 7, name: 'Interior Design & Fit-Out', code: 'I400' },
    { id: 8, name: 'Finishing Materials', code: 'F500' },
    { id: 9, name: 'Civil Works', code: 'C600' },
    { id: 10, name: 'Infrastructure & Utilities', code: 'U700' },
    { id: 11, name: 'Landscaping', code: 'L800' },
    { id: 12, name: 'Safety & Security', code: 'S900' },
];

/**
 * A multi-select component for managing Vendor Categories (CSI).
 * @param {object} props
 * @param {Array<number>} props.selectedIds - The array of currently selected category IDs.
 * @param {function} props.setSelectedIds - State setter function for the selected IDs.
 */
const CategorySelector = ({ selectedIds, setSelectedIds }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Toggle function for the dropdown
    const toggleOpen = () => setIsOpen(prev => !prev);

    // Filter categories based on search term
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return MOCK_CATEGORIES;
        const lowerSearch = searchTerm.toLowerCase();
        return MOCK_CATEGORIES.filter(cat => 
            cat.name.toLowerCase().includes(lowerSearch) || 
            cat.code.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm]);

    // Determine the name of the selected categories for display
    const selectedCategories = useMemo(() => {
        return MOCK_CATEGORIES.filter(cat => selectedIds.includes(cat.id));
    }, [selectedIds]);

    // Handler to add/remove a category ID
    const handleToggleCategory = useCallback((categoryId) => {
        setSelectedIds(prevIds => {
            if (prevIds.includes(categoryId)) {
                // Remove ID
                return prevIds.filter(id => id !== categoryId);
            } else {
                // Add ID
                return [...prevIds, categoryId];
            }
        });
    }, [setSelectedIds]);

    // Handler to remove a category from the display badge
    const handleRemoveTag = (e, categoryId) => {
        e.stopPropagation(); // Prevents the dropdown from opening
        handleToggleCategory(categoryId);
    };

    return (
        <div className="relative z-10">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Tag className="w-4 h-4 mr-1 text-blue-500" />
                CSI / Main Categories
            </label>
            
            <div 
                onClick={toggleOpen} 
                className="min-h-[44px] cursor-pointer bg-white border border-gray-300 rounded-lg p-2 flex items-center flex-wrap shadow-sm transition duration-150 hover:border-blue-400"
            >
                {selectedCategories.length === 0 ? (
                    <span className="text-gray-500 text-sm pl-2">Select categories (CSI codes)</span>
                ) : (
                    selectedCategories.map(cat => (
                        <div 
                            key={cat.id} 
                            className="flex items-center bg-blue-100 text-blue-800 text-xs font-semibold mr-1 mb-1 px-2.5 py-1 rounded-full"
                        >
                            {cat.name}
                            <X 
                                className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900" 
                                onClick={(e) => handleRemoveTag(e, cat.id)}
                            />
                        </div>
                    ))
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search category name or code..."
                                className="w-full p-2 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                            <div
                                key={cat.id}
                                className={`p-3 text-sm flex justify-between items-center cursor-pointer transition duration-100 ${
                                    selectedIds.includes(cat.id) ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleToggleCategory(cat.id)}
                            >
                                <span>{cat.name}</span>
                                <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                                    selectedIds.includes(cat.id) ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {cat.code}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">No categories found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategorySelector;
