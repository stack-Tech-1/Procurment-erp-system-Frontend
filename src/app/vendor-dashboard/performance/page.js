"use client";
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Target, Award, 
  Calendar, Download, Filter, ArrowUpRight, ArrowDownRight,
  Loader2, RefreshCw, AlertCircle
} from 'lucide-react';

const VendorPerformancePage = () => {
  const [timeRange, setTimeRange] = useState('12m');
  const [loading, setLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);

  // Mock performance data - replace with API call
  const mockData = {
    vendorRating: 8.7,
    vendorClass: 'B',
    rank: 42,
    totalVendors: 156,
    trends: {
      deliveryCompliance: { current: 94.7, previous: 92.6, trend: 'up' },
      responseTime: { current: 2.3, previous: 2.8, trend: 'down' },
      winRate: { current: 35, previous: 32, trend: 'up' },
      satisfactionScore: { current: 4.2, previous: 4.0, trend: 'up' }
    },
    monthlyData: [
      { month: 'Jan', rating: 8.1, proposals: 3, wins: 1 },
      { month: 'Feb', rating: 8.3, proposals: 2, wins: 1 },
      { month: 'Mar', rating: 8.5, proposals: 4, wins: 2 },
      { month: 'Apr', rating: 8.2, proposals: 3, wins: 1 },
      { month: 'May', rating: 8.7, proposals: 5, wins: 2 },
      { month: 'Jun', rating: 8.9, proposals: 4, wins: 2 },
      { month: 'Jul', rating: 8.6, proposals: 3, wins: 1 },
      { month: 'Aug', rating: 8.8, proposals: 4, wins: 2 },
      { month: 'Sep', rating: 8.7, proposals: 5, wins: 2 },
      { month: 'Oct', rating: 8.9, proposals: 4, wins: 2 },
      { month: 'Nov', rating: 8.8, proposals: 3, wins: 1 },
      { month: 'Dec', rating: 9.0, proposals: 4, wins: 2 }
    ],
    kpis: {
      totalProposals: 42,
      successfulDeliveries: 38,
      onTimeDelivery: 36,
      delayedDeliveries: 2,
      rejectedProposals: 8,
      averageContractValue: 2450000,
      totalRevenue: 102500000
    }
  };

  useEffect(() => {
    setPerformanceData(mockData);
  }, []);

  if (!performanceData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  const MetricCard = ({ title, value, change, icon, trend }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {change}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} />
            Performance Analytics
          </h1>
          <p className="text-gray-600 mt-2">Track your vendor performance, ratings, and improvement areas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <Filter size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Award className="text-purple-500" size={24} />}
          title="Vendor Rating"
          value={`${performanceData.vendorRating}/10`}
          change="+0.3"
          trend="up"
        />
        <MetricCard
          icon={<Target className="text-green-500" size={24} />}
          title="Delivery Compliance"
          value={`${performanceData.trends.deliveryCompliance.current}%`}
          change={`+${(performanceData.trends.deliveryCompliance.current - performanceData.trends.deliveryCompliance.previous).toFixed(1)}%`}
          trend="up"
        />
        <MetricCard
          icon={<TrendingUp className="text-blue-500" size={24} />}
          title="Response Time"
          value={`${performanceData.trends.responseTime.current} days`}
          change={`-${(performanceData.trends.responseTime.previous - performanceData.trends.responseTime.current).toFixed(1)} days`}
          trend="down"
        />
        <MetricCard
          icon={<BarChart3 className="text-orange-500" size={24} />}
          title="Win Rate"
          value={`${performanceData.trends.winRate.current}%`}
          change={`+${performanceData.trends.winRate.current - performanceData.trends.winRate.previous}%`}
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Rating Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">12-Month Performance Trend</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Vendor Class: </span>
              <span className="font-bold text-blue-600">Class {performanceData.vendorClass}</span>
              <span className="text-gray-500">• Rank: {performanceData.rank}/{performanceData.totalVendors}</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-1 mb-6">
            {performanceData.monthlyData.map((month, index) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm transition-all hover:opacity-80 cursor-pointer"
                  style={{ height: `${month.rating * 20}px` }}
                  title={`Rating: ${month.rating}/10`}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                <div className="mt-1 flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="text-xs">{month.wins}/{month.proposals}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Current Rating</div>
              <div className="text-2xl font-bold text-gray-800">{performanceData.vendorRating}/10</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Peak Rating</div>
              <div className="text-2xl font-bold text-gray-800">9.0/10</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Class Average</div>
              <div className="text-2xl font-bold text-gray-800">7.5/10</div>
            </div>
          </div>
        </div>

        {/* Right Column - KPI Details */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance KPIs</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Proposals</span>
                <span className="font-semibold">{performanceData.kpis.totalProposals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Successful Deliveries</span>
                <span className="font-semibold text-green-600">{performanceData.kpis.successfulDeliveries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On-Time Delivery</span>
                <span className="font-semibold">{performanceData.kpis.onTimeDelivery}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Delayed Deliveries</span>
                <span className="font-semibold text-amber-600">{performanceData.kpis.delayedDeliveries}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected Proposals</span>
                <span className="font-semibold text-red-600">{performanceData.kpis.rejectedProposals}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Improvement Areas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Document Compliance</span>
                <span className="text-green-600">Excellent</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="font-medium">Response Time</span>
                <span className="text-amber-600">Needs improvement</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="font-medium">Technical Proposal Quality</span>
                <span className="text-red-600">Below average</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View Improvement Plan
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-blue-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Recommendations for Class A</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🎯 Target Rating</h4>
            <p className="text-gray-600 text-sm">Achieve consistent 9.0+ rating for 3 consecutive months</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📈 Performance Goals</h4>
            <p className="text-gray-600 text-sm">Increase win rate to 40% and reduce response time to 1.5 days</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📊 Documentation</h4>
            <p className="text-gray-600 text-sm">Upload updated ISO certificates and project case studies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPerformancePage;