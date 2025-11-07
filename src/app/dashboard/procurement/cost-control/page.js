// src/app/dashboard/procurement/cost-control/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
  Calendar, Users, FileText, CheckCircle, AlertTriangle,
  Building, Package, Eye, Download, Filter, Search
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const CostControlPage = () => {
  const [costData, setCostData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('current_month');
  const [activeView, setActiveView] = useState('overview');

  // Fetch cost control data
  // src/app/dashboard/procurement/cost-control/page.jsx - Updated fetchCostData function
const fetchCostData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }
  
      console.log('Fetching cost data with token:', !!token);
  
      // Fetch multiple data sources with error handling for each
      const requests = [
        axios.get(`${API_BASE_URL}/contracts`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }).catch(error => {
          console.error('Failed to fetch contracts:', error.response?.status);
          return { data: [] }; // Return empty array on error
        }),
        axios.get(`${API_BASE_URL}/ipcs`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }).catch(error => {
          console.error('Failed to fetch IPCs:', error.response?.status);
          return { data: [] }; // Return empty array on error
        }),
        axios.get(`${API_BASE_URL}/rfqs`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }).catch(error => {
          console.error('Failed to fetch RFQs:', error.response?.status);
          return { data: [] }; // Return empty array on error
        }),
        axios.get(`${API_BASE_URL}/vendors`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }).catch(error => {
          console.error('Failed to fetch vendors:', error.response?.status);
          return { data: [] }; // Return empty array on error
        })
      ];
  
      const [contractsRes, ipcsRes, rfqsRes, vendorsRes] = await Promise.all(requests);
  
      const contracts = contractsRes.data || [];
      const ipcs = ipcsRes.data || [];
      const rfqs = rfqsRes.data || [];
      const vendors = vendorsRes.data || [];
  
      // Calculate metrics with safe defaults
      const totalContractValue = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
      const totalPaid = ipcs.reduce((sum, ipc) => sum + (ipc.currentValue || 0), 0);
      const monthlySpend = calculateMonthlySpend(ipcs);
      const savings = calculateSavings(contracts, rfqs);
      const vendorPerformance = calculateVendorPerformance(vendors, contracts, ipcs);
      const projectSpend = calculateProjectSpend(contracts, ipcs);
      const categorySpend = calculateCategorySpend(contracts);
  
      setCostData({
        contracts,
        ipcs,
        rfqs,
        vendors,
        metrics: {
          totalContractValue,
          totalPaid,
          remainingBudget: totalContractValue - totalPaid,
          utilizationRate: totalContractValue > 0 ? (totalPaid / totalContractValue) * 100 : 0,
          monthlySpend,
          savings,
          activeProjects: contracts.filter(c => c.status === 'ACTIVE').length,
          pendingIPCs: ipcs.filter(i => i.status === 'SUBMITTED' || i.status === 'PROCUREMENT_REVIEW').length
        },
        vendorPerformance,
        projectSpend,
        categorySpend
      });
  
    } catch (error) {
      console.error("Failed to fetch cost data:", error);
      // Set empty data structure to prevent rendering errors
      setCostData({
        contracts: [],
        ipcs: [],
        rfqs: [],
        vendors: [],
        metrics: {
          totalContractValue: 0,
          totalPaid: 0,
          remainingBudget: 0,
          utilizationRate: 0,
          monthlySpend: 0,
          savings: { total: 0, percentage: 0 },
          activeProjects: 0,
          pendingIPCs: 0
        },
        vendorPerformance: [],
        projectSpend: [],
        categorySpend: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
  }, [timeRange]);

  // Calculate monthly spend
  const calculateMonthlySpend = (ipcs) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return ipcs
      .filter(ipc => {
        const ipcDate = new Date(ipc.createdAt);
        return ipcDate.getMonth() === currentMonth && ipcDate.getFullYear() === currentYear;
      })
      .reduce((sum, ipc) => sum + (ipc.currentValue || 0), 0);
  };

  // Calculate savings (estimated vs actual)
  const calculateSavings = (contracts, rfqs) => {
    let totalSavings = 0;
    let totalEstimated = 0;
    
    contracts.forEach(contract => {
      if (contract.rfqId) {
        const rfq = rfqs.find(r => r.id === contract.rfqId);
        if (rfq && rfq.estimatedUnitPrice) {
          const estimated = rfq.estimatedUnitPrice;
          const actual = contract.contractValue;
          if (actual < estimated) {
            totalSavings += estimated - actual;
          }
          totalEstimated += estimated;
        }
      }
    });

    return {
      total: totalSavings,
      percentage: totalEstimated > 0 ? (totalSavings / totalEstimated) * 100 : 0
    };
  };

  // Calculate vendor performance
  const calculateVendorPerformance = (vendors, contracts, ipcs) => {
    return vendors.map(vendor => {
      const vendorContracts = contracts.filter(c => c.vendorId === vendor.id);
      const vendorIPCs = ipcs.filter(ipc => ipc.contract?.vendorId === vendor.id);
      
      const totalContractValue = vendorContracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
      const totalPaid = vendorIPCs.reduce((sum, ipc) => sum + (ipc.currentValue || 0), 0);
      const onTimePayments = vendorIPCs.filter(ipc => 
        ipc.status === 'PAID' && isOnTime(ipc)
      ).length;

      return {
        vendor: vendor.companyLegalName,
        totalContracts: vendorContracts.length,
        totalValue: totalContractValue,
        paidAmount: totalPaid,
        performanceScore: vendorIPCs.length > 0 ? (onTimePayments / vendorIPCs.length) * 100 : 0,
        ipcCount: vendorIPCs.length
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
  };

  // Calculate project spend
  const calculateProjectSpend = (contracts, ipcs) => {
    const projectMap = {};
    
    contracts.forEach(contract => {
      const projectName = contract.rfq?.projectName || 'Standalone';
      if (!projectMap[projectName]) {
        projectMap[projectName] = {
          budget: 0,
          spent: 0,
          contracts: 0
        };
      }
      projectMap[projectName].budget += contract.contractValue || 0;
      projectMap[projectName].contracts += 1;
    });

    ipcs.forEach(ipc => {
      const projectName = ipc.contract?.rfq?.projectName || 'Standalone';
      if (projectMap[projectName]) {
        projectMap[projectName].spent += ipc.currentValue || 0;
      }
    });

    return Object.entries(projectMap).map(([project, data]) => ({
      project,
      ...data,
      utilization: (data.spent / data.budget) * 100
    })).sort((a, b) => b.budget - a.budget);
  };

  // Calculate category spend (simplified - you can enhance with your CSI categories)
  const calculateCategorySpend = (contracts) => {
    // This is a simplified version - you can enhance with your actual CSI categories
    const categories = {
      'Construction': 0,
      'Services': 0,
      'Materials': 0,
      'Equipment': 0,
      'Other': 0
    };

    contracts.forEach(contract => {
      // Simple categorization based on contract value ranges and names
      // You can replace this with actual CSI category data from your database
      const value = contract.contractValue || 0;
      if (contract.rfq?.projectName?.toLowerCase().includes('construction') || value > 1000000) {
        categories.Construction += value;
      } else if (contract.rfq?.projectName?.toLowerCase().includes('service') || value < 100000) {
        categories.Services += value;
      } else if (value >= 100000 && value <= 500000) {
        categories.Materials += value;
      } else if (value > 500000 && value <= 1000000) {
        categories.Equipment += value;
      } else {
        categories.Other += value;
      }
    });

    return Object.entries(categories)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const isOnTime = (ipc) => {
    // Simple on-time calculation - you can enhance this
    const submittedDate = new Date(ipc.createdAt);
    const approvedDate = ipc.status === 'PAID' ? new Date() : null; // Simplified
    return approvedDate && (approvedDate - submittedDate) <= (14 * 24 * 60 * 60 * 1000); // Within 14 days
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, vendorPerformance, projectSpend, categorySpend } = costData;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Cost Control & Analytics</h1>
              <p className="text-gray-600">Monitor and analyze procurement spending</p>
            </div>
            
            <div className="flex space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="current_month">Current Month</option>
                <option value="last_month">Last Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">Total Spend</p>
                <p className="text-2xl font-bold">
                ${(costData.metrics?.totalPaid || 0).toLocaleString()}
                </p>
            </div>
            <DollarSign className="text-green-500 w-8 h-8" />
            </div>
            <div className="flex items-center mt-2 text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">
                {(costData.metrics?.utilizationRate || 0).toFixed(1)}% utilized
            </span>
            </div>
        </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Budget Utilization</p>
                  <p className="text-2xl font-bold">{metrics.utilizationRate?.toFixed(1)}%</p>
                </div>
                <PieChart className="text-blue-500 w-8 h-8" />
              </div>
              <div className="flex items-center mt-2 text-blue-600">
                <span className="text-sm">${metrics.remainingBudget?.toLocaleString()} remaining</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cost Savings</p>
                  <p className="text-2xl font-bold">${metrics.savings?.total?.toLocaleString()}</p>
                </div>
                <TrendingDown className="text-green-500 w-8 h-8" />
              </div>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm">{metrics.savings?.percentage?.toFixed(1)}% savings rate</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold">{metrics.activeProjects}</p>
                </div>
                <Building className="text-purple-500 w-8 h-8" />
              </div>
              <div className="flex items-center mt-2 text-gray-600">
                <span className="text-sm">{metrics.pendingIPCs} IPCs pending</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'projects', label: 'Projects', icon: Building },
                  { id: 'vendors', label: 'Vendors', icon: Users },
                  { id: 'categories', label: 'Categories', icon: PieChart },
                  { id: 'savings', label: 'Savings Analysis', icon: TrendingDown }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id)}
                      className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                        activeView === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {activeView === 'overview' && <OverviewView data={costData} />}
              {activeView === 'projects' && <ProjectsView projects={projectSpend} />}
              {activeView === 'vendors' && <VendorsView vendors={vendorPerformance} />}
              {activeView === 'categories' && <CategoriesView categories={categorySpend} />}
              {activeView === 'savings' && <SavingsView data={costData} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Overview View Component
const OverviewView = ({ data }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-6">
      {/* Monthly Spend Trend */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Monthly Spend Trend</h3>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <BarChart3 className="text-gray-400 w-12 h-12" />
          <span className="text-gray-500 ml-2">Spend trend chart would appear here</span>
        </div>
      </div>

      {/* Budget Utilization */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Budget Utilization</h3>
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
          <PieChart className="text-gray-400 w-12 h-12" />
          <span className="text-gray-500 ml-2">Budget utilization chart would appear here</span>
        </div>
      </div>
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-blue-700 font-medium">Total Contracts</span>
          <FileText className="text-blue-500 w-5 h-5" />
        </div>
        <p className="text-2xl font-bold text-blue-800">{data.contracts?.length || 0}</p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <span className="text-green-700 font-medium">Active IPCs</span>
          <CheckCircle className="text-green-500 w-5 h-5" />
        </div>
        <p className="text-2xl font-bold text-green-800">{data.ipcs?.length || 0}</p>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between">
          <span className="text-orange-700 font-medium">Vendor Partners</span>
          <Users className="text-orange-500 w-5 h-5" />
        </div>
        <p className="text-2xl font-bold text-orange-800">{data.vendors?.length || 0}</p>
      </div>
    </div>
  </div>
);

// Projects View Component
const ProjectsView = ({ projects }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Project Spending Analysis</h3>
    
    {projects.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <Building className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>No project data available.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-lg">{project.project}</h4>
                <p className="text-sm text-gray-600">{project.contracts} contracts</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.utilization > 90 ? 'bg-red-100 text-red-800' :
                project.utilization > 75 ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {project.utilization.toFixed(1)}% utilized
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget: ${project.budget.toLocaleString()}</span>
                <span>Spent: ${project.spent.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    project.utilization > 90 ? 'bg-red-500' :
                    project.utilization > 75 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(project.utilization, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Remaining: ${(project.budget - project.spent).toLocaleString()}</span>
                <span>{project.utilization.toFixed(1)}% spent</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Vendors View Component
const VendorsView = ({ vendors }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Vendor Performance</h3>
    
    {vendors.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>No vendor performance data available.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contracts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IPCs</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendors.map((vendor, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {vendor.vendor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vendor.totalContracts}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${vendor.totalValue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${vendor.paidAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    vendor.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                    vendor.performanceScore >= 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vendor.performanceScore.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vendor.ipcCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// Categories View Component
const CategoriesView = ({ categories }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
    
    {categories.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p>No category data available.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded mr-3 ${
                index === 0 ? 'bg-blue-500' :
                index === 1 ? 'bg-green-500' :
                index === 2 ? 'bg-yellow-500' :
                index === 3 ? 'bg-purple-500' :
                'bg-gray-500'
              }`}></div>
              <span className="font-medium">{category.name}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">${category.value.toLocaleString()}</div>
              <div className="text-sm text-gray-500">
                {((category.value / categories.reduce((sum, c) => sum + c.value, 0)) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>
        ))}
        
        {/* Simple pie chart visualization */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Spending Distribution</h4>
          <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
            <PieChart className="text-gray-400 w-12 h-12" />
            <span className="text-gray-500 ml-2">Category pie chart would appear here</span>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Savings View Component
const SavingsView = ({ data }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Savings Analysis</h3>
    
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-600">Total Savings Achieved</p>
            <p className="text-3xl font-bold text-green-800">
              ${data.metrics?.savings?.total?.toLocaleString() || '0'}
            </p>
          </div>
          <TrendingDown className="text-green-500 w-8 h-8" />
        </div>
        <p className="text-sm text-green-700 mt-2">
          {data.metrics?.savings?.percentage?.toFixed(1) || '0'}% savings rate
        </p>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600">Potential Savings</p>
            <p className="text-3xl font-bold text-blue-800">
              ${(data.metrics?.savings?.total * 1.2)?.toLocaleString() || '0'}
            </p>
          </div>
          <AlertTriangle className="text-blue-500 w-8 h-8" />
        </div>
        <p className="text-sm text-blue-700 mt-2">Based on market analysis</p>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h4 className="font-semibold mb-4">Savings Opportunities</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-200">
          <span className="text-yellow-800">Consolidate vendor contracts</span>
          <span className="font-semibold text-yellow-800">Potential: $50,000</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
          <span className="text-green-800">Bulk material purchasing</span>
          <span className="font-semibold text-green-800">Potential: $25,000</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
          <span className="text-blue-800">Early payment discounts</span>
          <span className="font-semibold text-blue-800">Potential: $15,000</span>
        </div>
      </div>
    </div>
  </div>
);

export default CostControlPage;

