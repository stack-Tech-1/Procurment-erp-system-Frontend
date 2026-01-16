"use client";
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Target, Award, 
  Calendar, Download, Filter, ArrowUpRight, ArrowDownRight,
  Loader2, RefreshCw, AlertCircle, Info, Database, CloudOff
} from 'lucide-react';

const VendorPerformancePage = () => {
  const [timeRange, setTimeRange] = useState('12m');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('unknown'); // 'api', 'fallback', 'mock'

  // Fetch performance data from API
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Try to fetch from your analytics endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/vendor-performance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 404 || response.status === 501) {
        // Endpoint doesn't exist yet - we'll create it
        console.log('Performance endpoint not implemented yet');
        setDataSource('fallback');
        await fetchVendorStatsFromOtherEndpoints();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Fetched REAL data from analytics API:', result.data);
        setPerformanceData(result.data);
        setLastUpdated(result.lastUpdated);
        setDataSource('api');
      } else {
        throw new Error(result.error || 'Failed to fetch performance data');
      }
      
    } catch (err) {
      console.error('Error fetching performance data:', err.message);
      setError(err.message);
      setDataSource('error');
      
      // Try to fetch basic vendor info as fallback
      await fetchVendorStatsFromOtherEndpoints();
      
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor stats from existing endpoints
  const fetchVendorStatsFromOtherEndpoints = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      console.log('📊 Fetching vendor stats from other endpoints...');
      
      // Fetch vendor basic info
      const vendorRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (vendorRes.ok) {
        const vendor = await vendorRes.json();
        
        // Fetch vendor submissions
        const submissionsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/vendor`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const submissions = submissionsRes.ok ? await submissionsRes.json() : [];
        
        // Fetch total vendors for ranking
        const vendorsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/list?pageSize=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        let totalVendors = 1;
        if (vendorsRes.ok) {
          const vendorsData = await vendorsRes.json();
          totalVendors = vendorsData.total || 1;
        }
        
        // Calculate vendor rank (simplified - based on ID or random)
        const rank = Math.min(vendor.id || 1, totalVendors);
        
        // Create performance data from REAL database info
        const realData = {
          vendorRating: vendor.qualificationScore ? parseFloat((vendor.qualificationScore / 10).toFixed(1)) : 0,
          vendorClass: vendor.vendorClass || 'D',
          rank: rank,
          totalVendors: totalVendors,
          trends: {
            deliveryCompliance: { 
              current: 0, 
              previous: 0, 
              trend: 'down' 
            },
            responseTime: { 
              current: 0, 
              previous: 0, 
              trend: 'neutral' 
            },
            winRate: { 
              current: 0, 
              previous: 0, 
              trend: 'neutral' 
            },
            satisfactionScore: { 
              current: 0, 
              previous: 0, 
              trend: 'neutral' 
            }
          },
          monthlyData: generateEmptyMonthlyData(),
          kpis: {
            totalProposals: submissions.length || 0,
            successfulDeliveries: 0,
            onTimeDelivery: 0,
            delayedDeliveries: 0,
            rejectedProposals: 0,
            averageContractValue: 0,
            totalRevenue: 0
          }
        };
        
        console.log('📊 Created REAL data from database:', realData);
        setPerformanceData(realData);
        setLastUpdated(new Date().toISOString());
        setDataSource('fallback');
      }
    } catch (err) {
      console.error('Error fetching vendor stats:', err);
      // If everything fails, show an empty state with clear message
      setPerformanceData({
        vendorRating: 0,
        vendorClass: 'D',
        rank: 1,
        totalVendors: 1,
        trends: {
          deliveryCompliance: { current: 0, previous: 0, trend: 'neutral' },
          responseTime: { current: 0, previous: 0, trend: 'neutral' },
          winRate: { current: 0, previous: 0, trend: 'neutral' },
          satisfactionScore: { current: 0, previous: 0, trend: 'neutral' }
        },
        monthlyData: generateEmptyMonthlyData(),
        kpis: {
          totalProposals: 0,
          successfulDeliveries: 0,
          onTimeDelivery: 0,
          delayedDeliveries: 0,
          rejectedProposals: 0,
          averageContractValue: 0,
          totalRevenue: 0
        }
      });
      setDataSource('empty');
    }
  };

  // Generate empty monthly data
  const generateEmptyMonthlyData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return Array.from({ length: 12 }, (_, i) => {
      const monthIndex = (currentMonth - 11 + i + 12) % 12;
      return {
        month: monthNames[monthIndex],
        rating: 0,
        proposals: 0,
        wins: 0
      };
    });
  };

  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchPerformanceData();
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please login to export data');
        return;
      }

      // Create CSV content from performance data
      const csvContent = createCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vendor-performance-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const createCSVContent = () => {
    if (!performanceData) return '';
    
    const headers = [
      'Metric',
      'Current Value',
      'Previous Value',
      'Trend',
      'Change',
      'Data Source',
      'Last Updated'
    ];
    
    const rows = [
      ['Vendor Rating', `${performanceData.vendorRating}/10`, '', '', '', dataSource, lastUpdated],
      ['Vendor Class', performanceData.vendorClass, '', '', '', dataSource, lastUpdated],
      ['Rank', `${performanceData.rank}/${performanceData.totalVendors}`, '', '', '', dataSource, lastUpdated],
      ['Delivery Compliance', `${performanceData.trends.deliveryCompliance.current}%`, `${performanceData.trends.deliveryCompliance.previous}%`, performanceData.trends.deliveryCompliance.trend, `${(performanceData.trends.deliveryCompliance.current - performanceData.trends.deliveryCompliance.previous).toFixed(1)}%`, dataSource, lastUpdated],
      ['Response Time', `${performanceData.trends.responseTime.current} days`, `${performanceData.trends.responseTime.previous} days`, performanceData.trends.responseTime.trend, `${(performanceData.trends.responseTime.current - performanceData.trends.responseTime.previous).toFixed(1)} days`, dataSource, lastUpdated],
      ['Win Rate', `${performanceData.trends.winRate.current}%`, `${performanceData.trends.winRate.previous}%`, performanceData.trends.winRate.trend, `${(performanceData.trends.winRate.current - performanceData.trends.winRate.previous).toFixed(1)}%`, dataSource, lastUpdated],
      ['Total Proposals', performanceData.kpis.totalProposals, '', '', '', dataSource, lastUpdated],
      ['Successful Deliveries', performanceData.kpis.successfulDeliveries, '', '', '', dataSource, lastUpdated],
      ['On-Time Delivery', performanceData.kpis.onTimeDelivery, '', '', '', dataSource, lastUpdated],
      ['Average Contract Value', `SAR ${performanceData.kpis.averageContractValue.toLocaleString()}`, '', '', '', dataSource, lastUpdated],
      ['Total Revenue', `SAR ${performanceData.kpis.totalRevenue.toLocaleString()}`, '', '', '', dataSource, lastUpdated]
    ];
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  };

  const MetricCard = ({ title, value, change, icon, trend, isZero = false }) => (
    <div className={`bg-white p-6 rounded-xl border ${isZero ? 'border-gray-200' : 'border-gray-200 shadow-sm'} hover:shadow-md transition-shadow relative`}>
      {isZero && (
        <div className="absolute top-2 right-2">
          <Info size={14} className="text-gray-400" title="No data available yet" />
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {trend && change && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : trend === 'down' ? <ArrowDownRight size={16} /> : null}
            {change}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold ${isZero ? 'text-gray-400' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );

  if (loading && !performanceData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" />
        <p className="text-gray-600">Loading performance data...</p>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <p className="text-sm text-red-700 mt-1">
                {error || 'Failed to load performance data'}
              </p>
            </div>
          </div>
          <button
            onClick={fetchPerformanceData}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if we have real data or zeros
  const hasRealData = performanceData.kpis.totalProposals > 0 || 
                     performanceData.kpis.totalRevenue > 0 || 
                     performanceData.vendorRating > 0;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={28} />
              Performance Analytics
            </h1>
            <div className="flex items-center gap-2">
              {dataSource === 'api' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  <Database size={12} />
                  Live Data
                </span>
              )}
              {dataSource === 'fallback' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  <Database size={12} />
                  Real DB Data
                </span>
              )}
              {dataSource === 'empty' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  <CloudOff size={12} />
                  No Activity Yet
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-gray-600">Track your vendor performance, ratings, and improvement areas</p>
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          {!hasRealData && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Info size={16} />
                <p>No performance data yet. Start by submitting proposals to RFQs to see your metrics here.</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          </button>
          <button 
            onClick={handleExport}
            disabled={!hasRealData}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title={hasRealData ? "Export data" : "No data to export"}
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {error && dataSource !== 'api' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                Analytics API not available. Showing data from other sources.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          icon={<Award className={performanceData.vendorRating > 0 ? "text-purple-500" : "text-gray-400"} size={24} />}
          title="Vendor Rating"
          value={`${performanceData.vendorRating.toFixed(1)}/10`}
          change={performanceData.vendorRating > 0 ? "+0.0" : ""}
          trend={performanceData.vendorRating > 0 ? "neutral" : null}
          isZero={performanceData.vendorRating === 0}
        />
        <MetricCard
          icon={<Target className={performanceData.trends.deliveryCompliance.current > 0 ? "text-green-500" : "text-gray-400"} size={24} />}
          title="Delivery Compliance"
          value={`${performanceData.trends.deliveryCompliance.current.toFixed(1)}%`}
          change={performanceData.trends.deliveryCompliance.current > 0 ? 
            `${performanceData.trends.deliveryCompliance.current - performanceData.trends.deliveryCompliance.previous >= 0 ? '+' : ''}${(performanceData.trends.deliveryCompliance.current - performanceData.trends.deliveryCompliance.previous).toFixed(1)}%` : ''}
          trend={performanceData.trends.deliveryCompliance.trend}
          isZero={performanceData.trends.deliveryCompliance.current === 0}
        />
        <MetricCard
          icon={<TrendingUp className={performanceData.trends.responseTime.current > 0 ? "text-blue-500" : "text-gray-400"} size={24} />}
          title="Response Time"
          value={performanceData.trends.responseTime.current > 0 ? 
            `${performanceData.trends.responseTime.current.toFixed(1)} days` : 'No data'}
          change={performanceData.trends.responseTime.current > 0 ? 
            `${performanceData.trends.responseTime.current - performanceData.trends.responseTime.previous <= 0 ? '-' : '+'}${Math.abs(performanceData.trends.responseTime.current - performanceData.trends.responseTime.previous).toFixed(1)} days` : ''}
          trend={performanceData.trends.responseTime.trend}
          isZero={performanceData.trends.responseTime.current === 0}
        />
        <MetricCard
          icon={<BarChart3 className={performanceData.trends.winRate.current > 0 ? "text-orange-500" : "text-gray-400"} size={24} />}
          title="Win Rate"
          value={`${performanceData.trends.winRate.current.toFixed(1)}%`}
          change={performanceData.trends.winRate.current > 0 ? 
            `${performanceData.trends.winRate.trend === 'up' ? '+' : '-'}${Math.abs(performanceData.trends.winRate.current - performanceData.trends.winRate.previous).toFixed(1)}%` : ''}
          trend={performanceData.trends.winRate.trend}
          isZero={performanceData.trends.winRate.current === 0}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Rating Trend */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">12-Month Performance Trend</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Vendor Class: </span>
              <span className="font-bold text-blue-600">Class {performanceData.vendorClass}</span>
              <span className="text-gray-500">• Rank: {performanceData.rank}/{performanceData.totalVendors}</span>
            </div>
          </div>
          
          {performanceData.monthlyData.some(m => m.proposals > 0) ? (
            <>
              <div className="h-64 flex items-end gap-1 mb-6 overflow-x-auto pb-4">
                {performanceData.monthlyData.map((month, index) => (
                  <div key={index} className="flex-1 min-w-[50px] flex flex-col items-center">
                    <div 
                      className={`w-8 rounded-t-sm transition-all hover:opacity-80 cursor-pointer ${month.rating > 0 ? 'bg-gradient-to-t from-blue-500 to-blue-300' : 'bg-gray-200'}`}
                      style={{ height: `${Math.min(month.rating * 20, 200)}px` }}
                      title={month.rating > 0 ? 
                        `Rating: ${month.rating}/10\nProposals: ${month.proposals}\nWins: ${month.wins}` :
                        'No data for this month'}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{month.month}</span>
                    <div className="mt-1 flex gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${month.wins > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs">{month.wins}/{month.proposals}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Current Rating</div>
                  <div className="text-2xl font-bold text-gray-800">{performanceData.vendorRating.toFixed(1)}/10</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Peak Rating</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {Math.max(...performanceData.monthlyData.map(m => m.rating)).toFixed(1)}/10
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">Average Rating</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {(performanceData.monthlyData.reduce((sum, m) => sum + m.rating, 0) / performanceData.monthlyData.length).toFixed(1)}/10
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg mb-6">
              <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">No performance data available yet.</p>
              <p className="text-gray-400 text-sm mt-2">Submit proposals to see your performance trend</p>
            </div>
          )}
        </div>

        {/* Right Column - KPI Details */}
        <div className="space-y-6">
          <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Performance KPIs</h3>
              {!hasRealData && (
                <Info size={16} className="text-gray-400" title="No activity recorded yet" />
              )}
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Proposals</span>
                <span className={`font-semibold ${performanceData.kpis.totalProposals > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                  {performanceData.kpis.totalProposals}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Successful Deliveries</span>
                <span className={`font-semibold ${performanceData.kpis.successfulDeliveries > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {performanceData.kpis.successfulDeliveries}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On-Time Delivery</span>
                <span className={`font-semibold ${performanceData.kpis.onTimeDelivery > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                  {performanceData.kpis.onTimeDelivery}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Delayed Deliveries</span>
                <span className={`font-semibold ${performanceData.kpis.delayedDeliveries > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {performanceData.kpis.delayedDeliveries}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected Proposals</span>
                <span className={`font-semibold ${performanceData.kpis.rejectedProposals > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {performanceData.kpis.rejectedProposals}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Contract Value</span>
                  <span className={`font-semibold ${performanceData.kpis.averageContractValue > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                    SAR {performanceData.kpis.averageContractValue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Revenue</span>
                <span className={`font-semibold ${performanceData.kpis.totalRevenue > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                  SAR {performanceData.kpis.totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Document Compliance</span>
                <span className="text-green-600">Complete</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span className="font-medium">Vendor Status</span>
                <span className="text-amber-600">Needs Renewal</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Performance Activity</span>
                <span className={`${hasRealData ? 'text-green-600' : 'text-gray-600'}`}>
                  {hasRealData ? 'Active' : 'No Activity Yet'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/vendor-dashboard/documents'}
              className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Documents
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-blue-600" size={24} />
          <h3 className="text-xl font-semibold text-gray-800">Getting Started</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📋 Submit Proposals</h4>
            <p className="text-gray-600 text-sm">
              Browse and submit proposals to available RFQs to start building your performance history
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📊 Track Performance</h4>
            <p className="text-gray-600 text-sm">
              Once you submit proposals and win contracts, your performance metrics will appear here
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📈 Improve Rating</h4>
            <p className="text-gray-600 text-sm">
              Complete deliveries on-time and maintain good communication to improve your vendor rating
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPerformancePage;