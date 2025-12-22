"use client";
import { useState, useEffect } from 'react';
import { 
  Truck, CheckCircle, Clock, AlertTriangle, TrendingUp, TrendingDown, 
  RefreshCw, Database, WifiOff, Eye, BarChart, PieChart as PieChartIcon,
  Users, Calendar, Filter, Download, ChevronRight, Search,
  Building, Package, Shield, Box, Gauge, Percent
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const DeliveriesDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('fallback');
  const [timeRange, setTimeRange] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for Deliveries
  const generateFallbackData = () => ({
    summary: {
      completedDeliveries: 245,
      lateDeliveries: 32,
      qcRejections: 18,
      poDeliveredPercentage: 78.5,
      onTimeRate: 87.3
    },
    charts: {
      deliveriesByProject: [
        { project: 'Core DQ', count: 85 },
        { project: 'Obhur Beach', count: 56 },
        { project: 'Tower B', count: 72 },
        { project: 'Commercial', count: 48 },
        { project: 'HQ Office', count: 34 }
      ],
      supplierPerformance: [
        { supplier: 'TechBuild Co.', onTime: 45, late: 8, color: '#3b82f6' },
        { supplier: 'Gulf Materials', onTime: 38, late: 12, color: '#10b981' },
        { supplier: 'SteelTech', onTime: 28, late: 6, color: '#ef4444' },
        { supplier: 'Concrete Masters', onTime: 32, late: 4, color: '#f59e0b' }
      ],
      poDeliveryStatus: [
        { po: 'PO-2024-0456', ordered: 100, delivered: 85, percentage: 85 },
        { po: 'PO-2024-0457', ordered: 50, delivered: 50, percentage: 100 },
        { po: 'PO-2024-0458', ordered: 75, delivered: 60, percentage: 80 },
        { po: 'PO-2024-0459', ordered: 100, delivered: 70, percentage: 70 }
      ]
    },
    deliveries: [
      {
        id: 1,
        deliveryNo: 'DL-2024-0789',
        poNo: 'PO-2024-0456',
        project: 'Tower B Construction',
        supplier: 'TechBuild Co.',
        requiredDate: '2024-01-15',
        deliveryDate: '2024-01-18',
        qcStatus: 'Passed',
        delayDays: 3,
        quantityDelivered: 85,
        quantityOrdered: 100
      },
      {
        id: 2,
        deliveryNo: 'DL-2024-0790',
        poNo: 'PO-2024-0457',
        project: 'Commercial Complex',
        supplier: 'Gulf Materials',
        requiredDate: '2024-01-18',
        deliveryDate: '2024-01-18',
        qcStatus: 'Passed',
        delayDays: 0,
        quantityDelivered: 50,
        quantityOrdered: 50
      },
      {
        id: 3,
        deliveryNo: 'DL-2024-0791',
        poNo: 'PO-2024-0458',
        project: 'Obhur Beach',
        supplier: 'SteelTech',
        requiredDate: '2024-01-12',
        deliveryDate: '2024-01-20',
        qcStatus: 'Rejected',
        delayDays: 8,
        quantityDelivered: 60,
        quantityOrdered: 75
      },
      {
        id: 4,
        deliveryNo: 'DL-2024-0792',
        poNo: 'PO-2024-0459',
        project: 'Core DQ',
        supplier: 'Concrete Masters',
        requiredDate: '2024-01-20',
        deliveryDate: '2024-01-19',
        qcStatus: 'Pending',
        delayDays: -1,
        quantityDelivered: 70,
        quantityOrdered: 100
      },
      {
        id: 5,
        deliveryNo: 'DL-2024-0793',
        poNo: 'PO-2024-0460',
        project: 'HQ Office',
        supplier: 'TechBuild Co.',
        requiredDate: '2024-01-22',
        deliveryDate: '2024-01-25',
        qcStatus: 'Passed',
        delayDays: 3,
        quantityDelivered: 45,
        quantityOrdered: 50
      },
      {
        id: 6,
        deliveryNo: 'DL-2024-0794',
        poNo: 'PO-2024-0461',
        project: 'Tower B Construction',
        supplier: 'Gulf Materials',
        requiredDate: '2024-01-25',
        deliveryDate: '2024-01-23',
        qcStatus: 'Passed',
        delayDays: -2,
        quantityDelivered: 100,
        quantityOrdered: 100
      },
      {
        id: 7,
        deliveryNo: 'DL-2024-0795',
        poNo: 'PO-2024-0462',
        project: 'Commercial Complex',
        supplier: 'SteelTech',
        requiredDate: '2024-01-28',
        deliveryDate: null,
        qcStatus: 'Not Delivered',
        delayDays: null,
        quantityDelivered: 0,
        quantityOrdered: 80
      }
    ]
  });

  useEffect(() => {
    setTimeout(() => {
      setDashboardData(generateFallbackData());
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const handleRetry = () => {
    setLoading(true);
    setTimeout(() => {
      setDashboardData(generateFallbackData());
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
      info: 'bg-teal-100 text-teal-800 border-teal-200'
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

  const QCStatusBadge = ({ status }) => {
    const config = {
      'Passed': { color: 'bg-green-100 text-green-800' },
      'Pending': { color: 'bg-blue-100 text-blue-800' },
      'Rejected': { color: 'bg-red-100 text-red-800' },
      'Not Delivered': { color: 'bg-gray-100 text-gray-800' }
    };
    
    const { color } = config[status] || config['Pending'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
        {status}
      </span>
    );
  };

  const DeliveryStatusBadge = ({ delayDays }) => {
    if (delayDays === null) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-gray-100 text-gray-800">
          Not Delivered
        </span>
      );
    }
    
    if (delayDays <= 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-green-100 text-green-800">
          On Time
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-red-100 text-red-800">
        {delayDays} day{delayDays !== 1 ? 's' : ''} late
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading Deliveries Dashboard...</h2>
        </div>
      </div>
    );
  }

  const { summary, charts, deliveries } = dashboardData;

  return (
    <ResponsiveLayout>
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Deliveries Dashboard</h1>
          <p className="text-gray-600 mt-1">Track material deliveries and supplier performance</p>
          <div className="flex items-center gap-2 mt-2">
            <DataSourceIndicator />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>        
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<Truck className="text-green-500" size={24} />}
          title="Completed"
          value={summary.completedDeliveries}
          subtitle="Deliveries fulfilled"
          color="success"
          trend="+24"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Clock className="text-amber-500" size={24} />}
          title="Late Deliveries"
          value={summary.lateDeliveries}
          subtitle="Past required date"
          color="warning"
          trend="-5"
          trendPositive={true}
        />
        
        <KPICard
          icon={<AlertTriangle className="text-red-500" size={24} />}
          title="QC Rejections"
          value={summary.qcRejections}
          subtitle="Failed quality checks"
          color="error"
          trend="-3"
          trendPositive={true}
        />
        
        <KPICard
          icon={<Percent className="text-blue-500" size={24} />}
          title="PO Delivered"
          value={`${summary.poDeliveredPercentage}%`}
          subtitle={`${summary.onTimeRate}% on-time rate`}
          color="primary"
          trend="+2.5%"
          trendPositive={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliveries by Project */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Deliveries by Project</h3>
          <div className="h-64">
            <div className="flex items-end h-48 gap-2 mt-4">
              {charts.deliveriesByProject.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-3/4 bg-blue-500 rounded-t"
                    style={{ height: `${(item.count / 100) * 100}%` }}
                    title={`${item.project}: ${item.count} deliveries`}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{item.project.substring(0, 5)}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Total deliveries across all projects: <span className="font-semibold">295</span>
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Supplier On-Time vs Late</h3>
          <div className="h-64">
            <div className="flex items-end h-48 gap-4 mt-4 justify-center">
              {charts.supplierPerformance.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex gap-1 mb-2">
                    <div 
                      className="w-6 bg-green-500 rounded-t"
                      style={{ height: `${(item.onTime / 50) * 100}%` }}
                      title={`On-time: ${item.onTime}`}
                    ></div>
                    <div 
                      className="w-6 bg-red-500 rounded-t"
                      style={{ height: `${(item.late / 50) * 100}%` }}
                      title={`Late: ${item.late}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{item.supplier.substring(0, 8)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">On-time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Late</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PO Delivery Gauge */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">PO Delivery Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {charts.poDeliveryStatus.map((po, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-800">{po.po}</span>
                <span className="text-sm font-semibold text-blue-600">{po.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div 
                  className={`h-2 rounded-full ${
                    po.percentage >= 90 ? 'bg-green-500' : 
                    po.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${po.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {po.delivered} of {po.ordered} units
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Delivery Tracking</h3>
            <p className="text-gray-600 text-sm">All material deliveries and QC status</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search deliveries..."
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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[120px]">Delivery No</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[120px]">PO No</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[150px]">Project</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[140px]">Supplier</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Required Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Delivery Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[100px]">QC Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[100px]">Delay Days</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-600">{item.deliveryNo}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-700">{item.poNo}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.project}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{item.supplier}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{new Date(item.requiredDate).toLocaleDateString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">
                      {item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : 'Not delivered'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <QCStatusBadge status={item.qcStatus} />
                  </td>
                  <td className="py-3 px-4">
                    <DeliveryStatusBadge delayDays={item.delayDays} />
                    {item.quantityDelivered > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.quantityDelivered}/{item.quantityOrdered} units
                      </p>
                    )}
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

export default DeliveriesDashboard;