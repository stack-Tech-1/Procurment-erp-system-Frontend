// frontend/src/app/dashboard/procurement/vendors/page.js - UPDATED WITH i18n
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { Search, Sliders, ChevronDown, CheckCircle, Clock, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import VendorChart from '@/components/VendorChart'; 
import StatusChart from '@/components/StatusChart';
import ExpiryRiskCard from '@/components/ExpiryRiskCard';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/vendor`;

const STATUS_OPTIONS = ['NEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_RENEWAL'];
const TYPE_OPTIONS = ['GeneralContractor', 'SubContractor', 'Supplier'];

const VendorListPage = () => {
    const { t } = useTranslation(); // ADD THIS HOOK
    const [vendors, setVendors] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ search: '', status: '', type: '', sortField: 'updatedAt', sortOrder: 'desc' });

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken'); 
            if (!token) {
                console.warn("Authentication token missing. Skipping data fetch.");
                return;
            }

            const params = {
                page: pagination.page,
                pageSize: pagination.pageSize,
                search: filters.search,
                status: filters.status,
                type: filters.type,
                sortField: filters.sortField,
                sortOrder: filters.sortOrder
            };

            const listResponse = await axios.get(`${API_BASE_URL}/list`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const summaryResponse = await axios.get(`${API_BASE_URL}/analytics/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setVendors(listResponse.data.data);
            setPagination(prev => ({ ...prev, total: listResponse.data.total, totalPages: listResponse.data.totalPages }));
            setSummary(summaryResponse.data);

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.pageSize, filters]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    const getStatusIcon = (status) => {
        const iconClasses = "w-4 h-4 mr-2";
        switch (status) {
            case 'APPROVED': return <CheckCircle className={`${iconClasses} text-green-500`} />;
            case 'REJECTED': return <XCircle className={`${iconClasses} text-red-500`} />;
            case 'NEEDS_RENEWAL': return <XCircle className={`${iconClasses} text-orange-500`} />;
            case 'UNDER_REVIEW': 
            case 'NEW':
            default: return <Clock className={`${iconClasses} text-blue-500`} />;
        }
    };
    
    const getExpiryClass = (dateString) => {
        if (!dateString) return 'text-gray-500';

        const expiryDate = new Date(dateString);
        const today = new Date();
        const oneMonth = 30 * 24 * 60 * 60 * 1000;

        if (expiryDate < today) {
            return 'text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-sm';
        }

        if (expiryDate.getTime() - today.getTime() <= oneMonth) {
            return 'text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-sm';
        }

        return 'text-green-600';
    };

    const handleSort = (field) => {
        setFilters(prev => ({
            ...prev,
            sortField: field,
            sortOrder: prev.sortField === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
        }));
        setPagination(prev => ({ ...prev, page: 1 })); 
    };

    const renderSortArrow = (field) => {
        if (filters.sortField !== field) return null;
        return filters.sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Helper function to translate status
    const translateStatus = (status) => {
        const statusMap = {
            'APPROVED': t('approved'),
            'REJECTED': t('rejected'),
            'NEEDS_RENEWAL': t('needsRenewal'),
            'UNDER_REVIEW': t('underReview'),
            'NEW': t('new')
        };
        return statusMap[status] || status;
    };

    // Helper function to translate vendor type
    const translateVendorType = (type) => {
        const typeMap = {
            'GeneralContractor': t('generalContractor'),
            'SubContractor': t('subContractor'),
            'Supplier': t('supplier')
        };
        return typeMap[type] || type;
    };

    return (
        <ResponsiveLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                        {t('vendorQualificationDashboard')}
                    </h1>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">
                        {t('vendorDashboardSubtitle')}
                    </p>
                </div>

                {/* KPI Summary - Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        { label: t('totalVendors'), icon: Clock, color: 'blue', dataKey: 'totalVendors' },
                        { label: t('approved'), icon: CheckCircle, color: 'green', dataKey: 'statusBreakdown?.APPROVED' },
                        { label: t('underReview'), icon: Clock, color: 'yellow', dataKey: 'statusBreakdown?.UNDER_REVIEW' },
                        { label: t('expired'), icon: XCircle, color: 'red', dataKey: 'expiredVendorsCount' },
                        { label: t('expiringSoon'), icon: Clock, color: 'orange', dataKey: 'expiringSoonVendorsCount' },
                    ].map(({ label, icon: Icon, color, dataKey }) => {
                        let value = 0;
                        
                        if (label === t('underReview')) {
                            value = (summary.statusBreakdown?.UNDER_REVIEW || 0) + (summary.statusBreakdown?.NEW || 0);
                        } else if (dataKey.includes('.')) {
                            value = dataKey.split('.').reduce((acc, part) => acc?.[part.replace('?', '')] ?? 0, summary);
                        } else {
                            value = summary[dataKey] || 0;
                        }

                        return (
                            <div key={label} className={`bg-white p-4 rounded-xl shadow-lg border-l-4 border-${color}-500`}>
                                <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium text-gray-500">{label}</p>
                                    <Icon className={`text-${color}-500 w-6 h-6`} />
                                </div>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Analytics Section - Stack on mobile, side-by-side on desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <ExpiryRiskCard 
                            expired={summary.expiredVendorsCount || 0}
                            expiringSoon={summary.expiringSoonVendorsCount || 0}
                            total={summary.totalVendors || 0}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <StatusChart data={summary.statusBreakdown} />
                    </div>
                </div>

                {/* Filter and Search - Responsive layout */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        <div className="relative flex-grow w-full lg:w-auto">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <select
                                className="p-2 border border-gray-300 rounded-lg text-sm"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">{t('allStatuses')}</option>
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{translateStatus(status)}</option>
                                ))}
                            </select>

                            <select
                                className="p-2 border border-gray-300 rounded-lg text-sm"
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <option value="">{t('allTypes')}</option>
                                {TYPE_OPTIONS.map(type => (
                                    <option key={type} value={type}>{translateVendorType(type)}</option>
                                ))}
                            </select>

                            <button 
                                className="text-gray-500 hover:text-gray-700 p-2 border border-gray-300 rounded-lg"
                                onClick={() => setFilters({ search: '', status: '', type: '', sortField: 'updatedAt', sortOrder: 'desc' })}
                            >
                                <Sliders className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vendor Table - Horizontal scroll on mobile */}
                <div className="bg-white rounded-lg shadow-xl overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">{t('loadingVendors')}</div>
                    ) : (
                        <div className="min-w-full">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            t('vendorId'),
                                            t('name'),
                                            t('type'),
                                            t('status'),
                                            t('updated'),
                                            t('crExpiry'),
                                            t('isoExpiry'),
                                            t('zakatExpiry')
                                        ].map((header, index) => {
                                            const field = ['vendorId', 'name', 'vendorType', 'status', 'updatedAt', 'crExpiry', 'isoExpiry', 'zakatExpiry'][index];
                                            return (
                                                <th
                                                    key={field}
                                                    scope="col"
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                                                    onClick={() => handleSort(field)}
                                                >
                                                    <div className="flex items-center">
                                                        {header}
                                                        {renderSortArrow(field)}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{t('action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vendors.length === 0 ? (
                                        <tr><td colSpan="10" className="px-6 py-4 text-center text-gray-500">{t('noVendorsMatch')}</td></tr>
                                    ) : (
                                        vendors.map((vendor) => (
                                            <tr key={vendor.id} className="odd:bg-white even:bg-gray-50/50 hover:bg-blue-50 transition duration-150">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.vendorId}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{vendor.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{translateVendorType(vendor.vendorType)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${vendor.status === 'APPROVED' ? 'bg-green-100 text-green-800' : vendor.status === 'REJECTED' || vendor.status === 'NEEDS_RENEWAL' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {getStatusIcon(vendor.status)}
                                                        {translateStatus(vendor.status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(vendor.updatedAt).toLocaleDateString()}</td>
                                                
                                                {/* Expiry cells */}
                                                {['crExpiry', 'isoExpiry', 'zakatExpiry'].map((field) => (
                                                    <td key={field} className="px-4 py-4 whitespace-nowrap text-sm">
                                                        <span className={getExpiryClass(vendor[field])}>
                                                            {vendor[field] ? new Date(vendor[field]).toLocaleDateString() : t('na')}
                                                        </span>
                                                    </td>
                                                ))}
                                                
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <a href={`/dashboard/procurement/vendors/${vendor.id}`} className="text-blue-600 hover:text-blue-900 font-semibold transition duration-150 text-sm">
                                                        {t('review')}
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600">
                        {t('showingEntries', {
                            start: Math.min(pagination.total, (pagination.page - 1) * pagination.pageSize + 1),
                            end: Math.min(pagination.total, pagination.page * pagination.pageSize),
                            total: pagination.total
                        })}
                    </p>
                    <div className="flex space-x-2">
                        <button 
                            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-sm"
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            {t('previous')}
                        </button>
                        <button 
                            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 text-sm"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            {t('next')}
                        </button>
                    </div>
                </div>
            </div>
        </ResponsiveLayout>
    );
};

export default VendorListPage;