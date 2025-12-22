"use client";
import { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Clock, Award, TrendingUp, TrendingDown,
  RefreshCw, Database, Eye, BarChart, PieChart as PieChartIcon,
  Filter, Download, Search, ChevronRight, Truck, Package,
  Percent, Star, Target, Calendar, DollarSign
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const SupplierPerformanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'details'
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for Supplier Performance
  const generateFallbackData = () => ({
    summary: {
      totalSuppliers: 142,
      qualifiedSuppliers: 98,
      pendingQualification: 24,
      blacklistedSuppliers: 8,
      averageLeadTime: 14.5,
      averageOnTimeRate: 87.3
    },
    topSuppliers: [
      {
        id: 1,
        name: 'TechBuild Construction Co.',
        totalSpend: 125000000,
        onTimeRate: 92.5,
        qualification: 'Qualified',
        leadTime: 12,
        performanceScore: 94,
        completedProjects: 8,
        activeProjects: 3
      },
      {
        id: 2,
        name: 'Gulf Materials Supply',
        totalSpend: 98000000,
        onTimeRate: 88.2,
        qualification: 'Qualified',
        leadTime: 16,
        performanceScore: 87,
        completedProjects: 6,
        activeProjects: 4
      },
      {
        id: 3,
        name: 'SteelTech Industries',
        totalSpend: 75000000,
        onTimeRate: 85.4,
        qualification: 'Under Evaluation',
        leadTime: 18,
        performanceScore: 82,
        completedProjects: 4,
        activeProjects: 2
      },
      {
        id: 4,
        name: 'Concrete Masters LLC',
        totalSpend: 65000000,
        onTimeRate: 94.1,
        qualification: 'Qualified',
        leadTime: 14,
        performanceScore: 96,
        completedProjects: 5,
        activeProjects: 3
      },
      {
        id: 5,
        name: 'MEP Solutions International',
        totalSpend: 55000000,
        onTimeRate: 81.3,
        qualification: 'Qualified',
        leadTime: 21,
        performanceScore: 79,
        completedProjects: 3,
        activeProjects: 2
      },
      {
        id: 6,
        name: 'Electrical Systems Ltd',
        totalSpend: 45000000,
        onTimeRate: 89.7,
        qualification: 'Qualified',
        leadTime: 15,
        performanceScore: 88,
        completedProjects: 4,
        activeProjects: 1
      }
    ],
    qualificationStatus: [
      { status: 'Qualified', count: 98, color: '#10b981' },
      { status: 'Under Evaluation', count: 24, color: '#f59e0b' },
      { status: 'Pending Documents', count: 12, color: '#8b5cf6' },
      { status: 'Rejected', count: 8, color: '#ef4444' },
      { status: 'Blacklisted', count: 8, color: '#6b7280' }
    ],
    performanceMetrics: [
      { supplier: 'TechBuild', onTime: 92.5, quality: 96, compliance: 94 },
      { supplier: 'Gulf Materials', onTime: 88.2, quality: 91, compliance: 89 },
      { supplier: 'SteelTech', onTime: 85.4, quality: 88, compliance: 86 },
      { supplier: 'Concrete Masters', onTime: 94.1, quality: 95, compliance: 96 },
      { supplier: 'MEP Solutions', onTime: 81.3, quality: 84, compliance: 82 }
    ],
    supplierDetails: [
      {
        id: 1,
        supplierName: 'TechBuild Construction Co.',
        category: 'General Contractor',
        contactPerson: 'Ahmed Al-Mansoor',
        email: 'ahmed@techbuild.com',
        phone: '+966 50 123 4567',
        joinDate: '2022-03-15',
        lastDelivery: '2024-01-18',
        totalOrders: 45,
        totalValue: 125000000,
        avgLeadTime: 12,
        onTimeRate: 92.5,
        qualityPassRate: 96.2,
        contractCompliance: 94.8,
        paymentTerms: 'Net 30',
        rating: 4.8
      }
    ]
  });

  useEffect(() => {
    setTimeout(() => {
      const data = generateFallbackData();
      setDashboardData(data);
      setSelectedSupplier(data.topSuppliers[0]); // Select first supplier by default
      setLoading(false);
    }, 1000);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setTimeout(() => {
      const data = generateFallbackData();
      setDashboardData(data);
      setLoading(false);
    }, 1000);
  };

  const DataSourceIndicator = () => (
    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
      <Database size={16} />
      Mock Data
    </div>
  );

  const KPICard = ({ title, value, subtitle, icon, color = 'primary', trend, trendPositive }) => {
    const colorClasses = {
      primary: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-amber-100 text-amber-800 border-amber-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      info: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              {icon}
            </div>
            <h3 className="text-lg font-semibold ml-3 text-gray-800">{title}</h3>
          </div>
          {trend && (
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              trendPositive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {trend}
            </span>
          )}
        </div>
        
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `SAR ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `SAR ${(amount / 1000).toFixed(0)}K`;
    }
    return `SAR ${amount}`;
  };

  const QualificationBadge = ({ qualification }) => {
    const config = {
      'Qualified': { color: 'bg-green-100 text-green-800' },
      'Under Evaluation': { color: 'bg-yellow-100 text-yellow-800' },
      'Pending Documents': { color: 'bg-purple-100 text-purple-800' },
      'Rejected': { color: 'bg-red-100 text-red-800' },
      'Blacklisted': { color: 'bg-gray-100 text-gray-800' }
    };
    
    const { color } = config[qualification] || config['Under Evaluation'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
        {qualification}
      </span>
    );
  };

  const PerformanceScoreBadge = ({ score }) => {
    let color = 'bg-red-100 text-red-800';
    if (score >= 90) color = 'bg-green-100 text-green-800';
    else if (score >= 80) color = 'bg-yellow-100 text-yellow-800';
    else if (score >= 70) color = 'bg-orange-100 text-orange-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
        {score}/100
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading Supplier Performance Dashboard...</h2>
        </div>
      </div>
    );
  }

  const { summary, topSuppliers, qualificationStatus, performanceMetrics, supplierDetails } = dashboardData;

  return (
    <ResponsiveLayout>
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Supplier Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Vendor qualification, delivery performance, and spend analysis</p>
          <div className="flex items-center gap-2 mt-2">
            <DataSourceIndicator />
          </div>
        </div>        
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<Users className="text-blue-500" size={24} />}
          title="Total Suppliers"
          value={summary.totalSuppliers}
          subtitle={`${summary.qualifiedSuppliers} qualified`}
          color="primary"
        />
        
        <KPICard
          icon={<Award className="text-green-500" size={24} />}
          title="Qualified Suppliers"
          value={summary.qualifiedSuppliers}
          subtitle={`${((summary.qualifiedSuppliers / summary.totalSuppliers) * 100).toFixed(1)}% of total`}
          color="success"
          trend="+4"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Clock className="text-amber-500" size={24} />}
          title="Avg Lead Time"
          value={`${summary.averageLeadTime} days`}
          subtitle="From PO to delivery"
          color="warning"
          trend="-1.2 days"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Percent className="text-purple-500" size={24} />}
          title="On-Time Rate"
          value={`${summary.averageOnTimeRate}%`}
          subtitle="Average delivery performance"
          color="info"
          trend="+2.3%"
          trendPositive={true}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers by Spend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Top 10 Suppliers by Spend</h3>
            <Eye className="text-gray-400 cursor-pointer" size={20} />
          </div>
          
          <div className="space-y-4">
            {topSuppliers.map((supplier) => (
              <div 
                key={supplier.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedSupplier?.id === supplier.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedSupplier(supplier)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">{supplier.name}</h4>
                  <QualificationBadge qualification={supplier.qualification} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Total Spend</p>
                    <p className="font-bold text-lg text-gray-900">{formatCurrency(supplier.totalSpend)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">On-Time Rate</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            supplier.onTimeRate >= 90 ? 'bg-green-500' : 
                            supplier.onTimeRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${supplier.onTimeRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{supplier.onTimeRate}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Lead Time</p>
                      <p className="text-sm font-medium">{supplier.leadTime} days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Score</p>
                      <PerformanceScoreBadge score={supplier.performanceScore} />
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          {/* Qualification Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Suppliers by Qualification Status</h3>
            <div className="flex items-center justify-center h-48">
              <div className="relative w-48 h-48">
                {qualificationStatus.map((status, index, arr) => {
                  const total = arr.reduce((sum, s) => sum + s.count, 0);
                  const percentage = (status.count / total) * 100;
                  
                  return (
                    <div key={index} className="absolute inset-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{total}</div>
                          <div className="text-sm text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {qualificationStatus.map((status, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                  <span className="text-sm text-gray-600">{status.status}: {status.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Supplier Performance Metrics</h3>
            <div className="h-48">
              <div className="flex items-end h-40 gap-4 mt-4">
                {performanceMetrics.map((supplier, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="flex items-end w-full justify-center gap-1">
                      <div 
                        className="w-1/3 bg-blue-500 rounded-t"
                        style={{ height: `${supplier.onTime}%` }}
                        title={`On-Time: ${supplier.onTime}%`}
                      ></div>
                      <div 
                        className="w-1/3 bg-green-500 rounded-t"
                        style={{ height: `${supplier.quality}%` }}
                        title={`Quality: ${supplier.quality}%`}
                      ></div>
                      <div 
                        className="w-1/3 bg-purple-500 rounded-t"
                        style={{ height: `${supplier.compliance}%` }}
                        title={`Compliance: ${supplier.compliance}%`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{supplier.supplier}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">On-Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-600">Compliance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Details Panel */}
      {selectedSupplier && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Supplier Details</h3>
              <p className="text-gray-600 text-sm">Performance metrics and contact information</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                View Full Profile
              </button>
              <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                Download Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Information */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Contact Person</p>
                  <p className="font-medium">Ahmed Al-Mansoor</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">ahmed@techbuild.com</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">+966 50 123 4567</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="font-medium">March 15, 2022</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Performance Metrics</h4>
              <div className="space-y-3">
                {[
                  { label: 'On-Time Delivery Rate', value: '92.5%', color: 'bg-green-100 text-green-800' },
                  { label: 'Quality Pass Rate', value: '96.2%', color: 'bg-green-100 text-green-800' },
                  { label: 'Contract Compliance', value: '94.8%', color: 'bg-green-100 text-green-800' },
                  { label: 'Average Lead Time', value: '12 days', color: 'bg-blue-100 text-blue-800' }
                ].map((metric, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{metric.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${metric.color}`}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Financial Summary</h4>
              <div className="space-y-3">
                {[
                  { label: 'Total Orders', value: '45' },
                  { label: 'Total Spend', value: formatCurrency(selectedSupplier.totalSpend) },
                  { label: 'Active Projects', value: selectedSupplier.activeProjects },
                  { label: 'Completed Projects', value: selectedSupplier.completedProjects }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-500" size={16} />
                    <span className="font-medium">Rating: {selectedSupplier.performanceScore / 20}/5</span>
                    <span className="text-xs text-gray-500">({selectedSupplier.performanceScore}/100)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Suppliers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">All Suppliers</h3>
            <p className="text-gray-600 text-sm">Complete supplier directory with performance metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search suppliers..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Filter className="text-gray-400 cursor-pointer" size={20} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Supplier Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Qualification</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Spend</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">On-Time Rate</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Avg Lead Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Performance Score</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {topSuppliers.map((supplier) => (
                <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-800">{supplier.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">General Contractor</span>
                  </td>
                  <td className="py-3 px-4">
                    <QualificationBadge qualification={supplier.qualification} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatCurrency(supplier.totalSpend)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            supplier.onTimeRate >= 90 ? 'bg-green-500' : 
                            supplier.onTimeRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${supplier.onTimeRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{supplier.onTimeRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{supplier.leadTime} days</span>
                  </td>
                  <td className="py-3 px-4">
                    <PerformanceScoreBadge score={supplier.performanceScore} />
                  </td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ResponsiveLayout>
  );
};

export default SupplierPerformanceDashboard;