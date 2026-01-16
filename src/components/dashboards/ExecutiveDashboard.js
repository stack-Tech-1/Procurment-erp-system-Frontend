// frontend/src/components/dashboards/ExecutiveDashboard.js - CORRECTED
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, Users, FileText, DollarSign, CheckCircle, Briefcase, 
  Clock, TrendingUp, AlertTriangle, PieChart, Target, BarChart,
  Calendar, Shield, TrendingDown, Eye, RefreshCw, Database,
  Zap, TrendingUp as TrendingUpIcon, Activity, Target as TargetIcon
} from 'lucide-react';

const ExecutiveDashboard = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('unknown');
  const [timeRange, setTimeRange] = useState('month');
  const [previousKPIs, setPreviousKPIs] = useState(null);

  // Enhanced mock data that matches your API structure
  const generateFallbackData = () => ({
    summary: {
      totalVendors: 156,
      approvedVendors: 128,
      totalSpend: 45200000,
      totalContracts: 89,
      pendingApprovals: 12,
      activeProjects: 23,
      teamMembers: 18,
      overdueTasks: 3
    },
    financialMetrics: {
      monthlySpend: 2400000,
      budgetUtilization: 78,
      costSavings: 450000,
      ytdSpend: 28500000,
      budgetRemaining: 16700000,
      spendTrend: 'up'
    },
    vendorPerformance: {
      averageScore: 84,
      topPerformers: 12,
      needsReview: 8,
      complianceRate: 92,
      qualificationRate: 82
    },
    projectAnalytics: {
      onTimeDelivery: 78,
      delayedProjects: 5,
      completedThisMonth: 12,
      totalMilestones: 156,
      completedMilestones: 134
    },
    kpis: {
      procurementEfficiency: 87,
      vendorSatisfaction: 89,
      contractCompliance: 94,
      costSavingsRate: 15.2
    },
    alerts: {
      expiringDocuments: 7,
      highRiskVendors: 3,
      budgetOverruns: 2,
      delayedDeliveries: 4
    }
  });

  const calculateTrendFromHistory = (currentValue, metricName) => {
    if (!previousKPIs || !currentValue) {
      return { value: "No history", positive: true };
    }
    
    const previousValue = previousKPIs[metricName];
    
    if (previousValue === undefined || previousValue === 0) {
      return { value: "New metric", positive: true };
    }
    
    const change = ((currentValue - previousValue) / previousValue) * 100;
    const positive = change >= 0;
    
    // Only show trend if change is significant (> 0.5%)
    if (Math.abs(change) < 0.5) {
      return { value: "Steady", positive: true };
    }
    
    return {
      value: `${positive ? '+' : ''}${change.toFixed(1)}%`,
      positive
    };
  };

  // Fetch analytics data from new service
  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const [kpisResponse, forecastResponse, spendAnalysisResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/kpis?range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/forecast?range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/spend-analysis?category=all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const analyticsResult = {
        kpis: kpisResponse.ok ? await kpisResponse.json() : null,
        forecast: forecastResponse.ok ? await forecastResponse.json() : null,
        spendAnalysis: spendAnalysisResponse.ok ? await spendAnalysisResponse.json() : null
      };

      setAnalyticsData(analyticsResult);
      
      if (analyticsResult.kpis?.data) {
        setPreviousKPIs({
          procurementEfficiency: analyticsResult.kpis.data.operational?.approvalEfficiency || 0,
          costSavingsRate: analyticsResult.kpis.data.financial?.savingsRate || 0,
          contractCompliance: analyticsResult.kpis.data.quality?.contractCompliance || 0,
          vendorSatisfaction: analyticsResult.kpis.data.quality?.vendorSatisfaction || 0,
          timestamp: new Date().toISOString()
        });
      }
      
      if (kpisResponse.ok) {
        setDataSource('api');
        console.log('✅ Using real analytics data');
      } else {
        setDataSource('fallback');
        console.log('⚠️ Using fallback data for analytics');
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setDataSource('fallback');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Fetching executive dashboard data from API...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 Dashboard API response:', result);
      
      if (result.success) {
        console.log('✅ Successfully loaded real data from API');
        setDashboardData(result.data);      
        setDataSource('api');
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.log('⚠️ API unavailable, using fallback data:', error.message);
      setError(`Database temporarily unavailable. Showing sample data.`);
      setDashboardData(generateFallbackData());
      setDataSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(`🔄 useEffect triggered for timeRange: ${timeRange}`);
    fetchDashboardData();
    fetchAnalyticsData();
  }, [timeRange]);

  const handleRetry = () => {
    fetchDashboardData();
    fetchAnalyticsData();
  };

  const handleRefreshAnalytics = () => {
    fetchAnalyticsData();
  };

  // Update time range handler to use translations:
  const handleTimeRangeChange = (e) => {
    const newRange = e.target.value;
    console.log(`🔄 Changing time range to: ${newRange}`);
    setTimeRange(newRange);
    
    // Show loading state
    setLoading(true);
    setAnalyticsLoading(true);
  };

  // Add these handler functions for Quick Actions
  const handleViewReports = () => {
    console.log('📊 Navigating to Reports...');
    router.push('/dashboard/admin/reports');
  };

  const handleVendorAnalysis = () => {
    console.log('👥 Navigating to Vendor Analysis...');
    router.push('/dashboard/procurement/vendors');
  };

  const handleFinancialSummary = () => {
    console.log('💰 Financial Summary clicked - Add functionality later');
    alert('Financial Summary feature coming soon!');
  };

  const handlePerformanceReview = () => {
    console.log('📈 Performance Review clicked - Add functionality later');
    alert('Performance Review feature coming soon!');
  };

  const handleRefreshAll = () => {
    console.log('🔄 Manually refreshing all data...');
    fetchDashboardData();
    fetchAnalyticsData();
  };

  const DataSourceIndicator = () => {
    if (dataSource === 'api') {
      const hasRealData = analyticsData && (
        analyticsData.kpis || 
        analyticsData.forecast || 
        analyticsData.spendAnalysis
      );
      
      if (hasRealData) {
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
            <Database size={16} />
            {t('liveData')}
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
            <Database size={16} />
            {t('apiConnected')}
          </div>
        );
      }
    } else if (dataSource === 'fallback') {
      return (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
          <AlertTriangle size={16} />
          {t('sampleData')}
        </div>
      );
    }
    return null;
  };

  // Enhanced KPI card with analytics integration - ADD THIS COMPONENT
  const EnhancedKPICard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary', 
    trend, 
    trendPositive,
    analyticsValue,
    isLoading = false 
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {icon}
          <h3 className="text-lg font-semibold ml-3 text-gray-800">{title}</h3>
        </div>
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        ) : (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            trendPositive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {trend}
          </span>
        )}
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">
            {analyticsValue !== undefined ? analyticsValue : value}
          </p>
          <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
        </>
      )}
    </div>
  );

  const enhancedKPIs = [
    {
      icon: <TrendingUp className="text-green-500" size={24} />,
      title: t('procurementEfficiency'),
      value: `${dashboardData?.kpis?.procurementEfficiency || 0}%`,
      analyticsValue: analyticsData?.kpis?.data?.operational?.approvalEfficiency !== undefined
        ? `${analyticsData.kpis.data.operational.approvalEfficiency}%`
        : undefined,
      subtitle: t('processOptimizationScore'),
      trendKey: 'procurementEfficiency'
    },
    {
      icon: <DollarSign className="text-blue-500" size={24} />,
      title: t('costSavingsRate'),
      value: `${dashboardData?.kpis?.costSavingsRate || 0}%`,
      analyticsValue: analyticsData?.kpis?.data?.financial?.savingsRate !== undefined
        ? `${analyticsData.kpis.data.financial.savingsRate.toFixed(1)}%`
        : undefined,
      subtitle: t('againstTotalSpend'),
      trendKey: 'costSavingsRate'
    },
    {
      icon: <Shield className="text-purple-500" size={24} />,
      title: t('contractCompliance'),
      value: `${dashboardData?.kpis?.contractCompliance || 0}%`,
      analyticsValue: analyticsData?.kpis?.data?.quality?.contractCompliance !== undefined
        ? `${analyticsData.kpis.data.quality.contractCompliance}%`
        : undefined,
      subtitle: t('adherenceToTerms'),
      trendKey: 'contractCompliance'
    },
    {
      icon: <Users className="text-orange-500" size={24} />,
      title: t('vendorSatisfaction'),
      value: `${dashboardData?.kpis?.vendorSatisfaction || 0}%`,
      analyticsValue: analyticsData?.kpis?.data?.quality?.vendorSatisfaction !== undefined
        ? `${analyticsData.kpis.data.quality.vendorSatisfaction}%`
        : undefined,
      subtitle: t('partnerFeedbackScore'),
      trendKey: 'vendorSatisfaction'
    }
  ];

  // New Analytics Insights Component
  const AnalyticsInsights = () => {
    if (analyticsLoading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-blue-500" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">{t('analyticsInsights')}</h3>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-40"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!analyticsData) return null;

    // Helper to get forecast data with fallback
    const getForecastData = () => {
      if (analyticsData.forecast?.data) {
        return analyticsData.forecast.data;
      }
      return {
        forecast: 0,
        trend: 'stable',
        confidence: 0,
        message: 'Forecast data loading'
      };
    };

    // Helper to get savings opportunities with fallback
    const getSavingsOpportunities = () => {
      if (analyticsData.spendAnalysis?.data?.savingsOpportunities?.length > 0) {
        return analyticsData.spendAnalysis.data.savingsOpportunities;
      }
      return [];
    };

    // Helper to get KPI data with fallback
    const getKPIData = () => {
      if (analyticsData.kpis?.data) {
        return analyticsData.kpis.data;
      }
      return {
        operational: { approvalEfficiency: 0 },
        quality: { onTimeDelivery: 0 }
      };
    };

    const forecastData = getForecastData();
    const savingsOpportunities = getSavingsOpportunities();
    const kpiData = getKPIData();

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="text-blue-500" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">{t('analyticsInsights')}</h3>
          </div>
          <button
            onClick={handleRefreshAnalytics}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title={t('refreshAnalytics')}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Forecast Insight */}
          <div className={`p-4 rounded-lg border ${
            forecastData.trend === 'rising' 
              ? 'bg-green-50 border-green-200' 
              : forecastData.trend === 'declining'
              ? 'bg-red-50 border-red-200'
              : forecastData.confidence > 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUpIcon className={
                forecastData.trend === 'rising' 
                  ? 'text-green-600' 
                  : forecastData.trend === 'declining'
                  ? 'text-red-600'
                  : forecastData.confidence > 0
                  ? 'text-blue-600'
                  : 'text-gray-400'
              } size={16} />
              <span className="font-semibold text-sm">{t('spendForecast')}</span>
            </div>
            
            {forecastData.confidence > 0 ? (
              <>
                <p className="text-lg font-bold">
                  SAR {forecastData.forecast?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {forecastData.trend || 'stable'} {t('trend')} • {forecastData.confidence * 100}% {t('confidence')}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-400">SAR 0</p>
                <p className="text-sm text-gray-500">
                  {t('insufficientDataForForecast')}
                </p>
              </>
            )}
          </div>

          {/* Savings Opportunities */}
          <div className={`
            p-4 rounded-lg border 
            ${savingsOpportunities.length > 0 
              ? 'border-amber-200 bg-amber-50' 
              : 'border-gray-200 bg-gray-50'
            }
          `}>
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon className={
                savingsOpportunities.length > 0 
                  ? 'text-amber-600' 
                  : 'text-gray-400'
              } size={16} />
              <span className="font-semibold text-sm">
                {savingsOpportunities.length > 0 ? t('savingsOpportunities') : t('savingsAnalysis')}
              </span>
            </div>
            
            {savingsOpportunities.length > 0 ? (
              <>
                <p className="font-medium text-amber-800">
                  {savingsOpportunities[0].category || t('uncategorized')}
                </p>
                <p className="text-sm text-amber-700">
                  {t('potential')}: SAR {savingsOpportunities[0].potentialSavings?.toLocaleString() || '0'}
                </p>
                {savingsOpportunities.length > 1 && (
                  <p className="text-xs text-amber-600 mt-1">
                    +{savingsOpportunities.length - 1} {t('moreOpportunities')}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-medium text-gray-800">{t('noSavingsOpportunities')}</p>
                <p className="text-sm text-gray-600">{t('allSpendCategoriesOptimized')}</p>
              </>
            )}
          </div>

          {/* Performance Alerts */}
          <div className={`
            p-4 rounded-lg border 
            ${(kpiData.operational?.approvalEfficiency || 0) > 0 
              ? 'border-purple-200 bg-purple-50' 
              : 'border-gray-200 bg-gray-50'
            }
          `}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className={
                (kpiData.operational?.approvalEfficiency || 0) > 0 
                  ? 'text-purple-600' 
                  : 'text-gray-400'
              } size={16} />
              <span className="font-semibold text-sm">{t('performanceAlert')}</span>
            </div>
            
            {(kpiData.operational?.approvalEfficiency || 0) > 0 ? (
              <>
                <p className="font-medium text-purple-800">
                  {kpiData.operational?.approvalEfficiency || 0}% {t('efficiency')}
                </p>
                <p className="text-sm text-purple-700">
                  {kpiData.quality?.onTimeDelivery || 0}% {t('onTimeDelivery')}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-gray-800">{t('noPerformanceData')}</p>
                <p className="text-sm text-gray-600">{t('systemMetricsLoading')}</p>
              </>
            )}
          </div>
        </div>

        {/* Show data status if all are empty */}
        {forecastData.confidence === 0 && savingsOpportunities.length === 0 && !kpiData.operational?.approvalEfficiency && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              {t('analyticsDataWillPopulate')}
            </p>
          </div>
        )}
      </div>
    );
  };

  console.log('🔍 DEBUG - Dashboard Data:');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">{t('loadingDashboardFull')}</h2>
          <p className="text-gray-600 mt-2">{t('connectingDatabase')}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('unableToLoadDashboard')}</h2>
          <p className="text-gray-600 mb-4">{t('checkBackendConnection')}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('retryConnection')}
          </button>
        </div>
      </div>
    );
  }

  const calculateTrend = (currentValue, previousValue) => {
    if (!previousValue || previousValue === 0) return { value: "N/A", positive: true };
    
    const change = ((currentValue - previousValue) / previousValue) * 100;
    const positive = change >= 0;
    
    return {
      value: `${positive ? '+' : ''}${change.toFixed(1)}%`,
      positive
    };
  };

  // Use direct access:
  const summary = dashboardData?.summary || {};
  const financialMetricsData = dashboardData?.financialMetrics || {};
  const vendorPerformanceData = dashboardData?.vendorPerformance || [];
  const projectProgress = dashboardData?.projectProgress || [];
  const kpisData = dashboardData?.kpis || generateFallbackData().kpis; 
  const alertsData = dashboardData?.alerts || generateFallbackData().alerts; 
  const analyticsKPIs = analyticsData?.kpis?.data;

  // Add this function near your other helper functions in ExecutiveDashboard.js
  const calculateRealAlerts = () => {
    const realAlerts = {
      expiringDocuments: 0,
      highRiskVendors: 0,
      budgetOverruns: 0,
      delayedDeliveries: 0
    };

    // Calculate real alerts from your data
    
    // 1. Expiring Documents - Count vendors with qualification documents expiring soon
    // (You'll need to implement this in backend later)
    
    // 2. High Risk Vendors - Vendors with low scores or under review
    if (summary.totalVendors > 0 && summary.approvedVendors < summary.totalVendors) {
      realAlerts.highRiskVendors = summary.totalVendors - summary.approvedVendors;
    }
    
    // 3. Budget Overruns - Projects where spent > budget
    if (projectProgress.length > 0) {
      const overrunProjects = projectProgress.filter(project => 
        project.spent > project.budget
      ).length;
      realAlerts.budgetOverruns = overrunProjects;
    }
    
    // 4. Delayed Deliveries - Projects with low progress
    if (projectProgress.length > 0) {
      const delayedProjects = projectProgress.filter(project => 
        project.progress < 50 && project.budget > 0
      ).length;
      realAlerts.delayedDeliveries = delayedProjects;
    }

    return realAlerts;
  };

  // Then use it in your component:
  const realAlerts = calculateRealAlerts();
  const alertsToShow = dashboardData?.alerts || realAlerts; // Use real alerts if no backend alerts

  const renderHeader = () => (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{t('executiveDashboard')}</h1>
        <p className="text-gray-600 mt-1">{t('dashboardSubtitle')}</p>
        <div className="flex items-center gap-2 mt-2">
          <DataSourceIndicator />
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
            <Calendar size={14} />
            {timeRange === 'month' && t('thisMonth')}
            {timeRange === 'quarter' && t('thisQuarter')}
            {timeRange === 'year' && t('thisYear')}
          </div>
          {analyticsLoading && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
              <RefreshCw className="animate-spin" size={14} />
              {t('loadingAnalytics')}
            </div>
          )}
        </div>
      </div>        
      <div className="flex items-center space-x-4">
        <div className="relative">
          <select 
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            disabled={loading || analyticsLoading}
          >
            <option value="month">{t('thisMonth')}</option>
            <option value="quarter">{t('thisQuarter')}</option>
            <option value="year">{t('thisYear')}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>

        {/* Add refresh button */}
        <button
          onClick={handleRefreshAll}
          disabled={loading || analyticsLoading}
          className={`p-2 rounded-lg ${loading || analyticsLoading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          title={t('refreshAllData')}
        >
          <RefreshCw className={`${loading || analyticsLoading ? 'animate-spin' : ''}`} size={20} />
        </button>
      </div>
    </div>
  );

  // Financial metrics
  const financialMetrics = [
    {
      label: t('totalSpend'),
      value: `SAR ${(summary.totalSpend || 0).toLocaleString()}`,
      subtext: t('cumulativeContractValue'),
      dataSource: 'live'
    },
    {
      label: t('budgetUtilization'),
      value: `${financialMetricsData.budgetUtilization || 0}%`,
      subtext: t('basedOnEstimatedBudgets'),
      progress: financialMetricsData.budgetUtilization || 0,
      dataSource: 'live'
    },
    {
      label: t('costSavings'),
      value: `SAR ${(financialMetricsData.savings || 0).toLocaleString()}`,
      subtext: t('throughNegotiation'),
      dataSource: 'live'
    },
    {
      label: t('activeProjects'),
      value: summary.activeProjects || 0,
      subtext: `${summary.activeProjects || 0} ${t('projectsInProgress')}`,
      dataSource: 'live'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      icon: <FileText size={20} />,
      label: t('viewReports'),
      onClick: handleViewReports
    },
    {
      icon: <Users size={20} />,
      label: t('vendorAnalysis'),
      onClick: handleVendorAnalysis
    },
    {
      icon: <DollarSign size={20} />,
      label: t('financialSummary'),
      onClick: handleFinancialSummary
    },
    {
      icon: <TrendingUp size={20} />,
      label: t('performanceReview'),
      onClick: handlePerformanceReview
    }
  ];

  // MetricRow component
  const MetricRow = ({ label, value, subtext, progress, trend, alert }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-sm text-gray-500">{subtext}</p>
        {progress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${
                progress > 80 ? 'bg-red-500' : 
                progress > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
      <div className="text-right">
        <p className={`text-lg font-semibold ${
          alert ? 'text-red-600' : 'text-gray-900'
        }`}>
          {value}
          {trend === 'up' && <TrendingUp className="inline ml-1 text-green-500" size={16} />}
          {trend === 'down' && <TrendingDown className="inline ml-1 text-red-500" size={16} />}
        </p>
      </div>
    </div>
  );

  // AlertItem component
  const AlertItem = ({ type, count, label, description }) => {
    const config = {
      high: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <AlertTriangle size={16} />,
        label: t('critical')
      },
      warning: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: <Clock size={16} />,
        label: t('warning')
      },
      medium: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: <AlertTriangle size={16} />,
        label: t('medium')
      }
    };
    
    const { color, icon, label: priorityLabel } = config[type] || config.medium;

    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${color}`}>
        <div className="flex items-center">
          {icon}
          <div className="ml-3">
            <div className="flex items-center gap-2">
              <p className="font-medium">{label}</p>
              <span className="text-xs px-1.5 py-0.5 bg-white/50 rounded">
                {priorityLabel}
              </span>
            </div>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </div>
        <span className="text-lg font-bold">{count}</span>
      </div>
    );
  };

  // ActionButton component
  const ActionButton = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
    >
      <div className="text-gray-600 group-hover:text-blue-600 mb-2">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
        {label}
      </span>
    </button>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {renderHeader()}
      
      {/* Data Status Alert */}
      {dataSource === 'fallback' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600" size={20} />
            <div>
              <p className="text-amber-800 font-medium">{t('databaseConnectionIssue')}</p>
              <p className="text-amber-700 text-sm">
                {t('showingSampleData')}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="ml-auto px-3 py-1 bg-amber-100 text-amber-800 rounded text-sm hover:bg-amber-200 transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      )}

      {/* Analytics Insights Section */}
      <AnalyticsInsights />

      {/* Enhanced Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {enhancedKPIs.map((kpi, index) => (
          <EnhancedKPICard
            key={index}
            icon={kpi.icon}
            title={kpi.title}
            value={kpi.value}
            analyticsValue={kpi.analyticsValue}
            subtitle={kpi.subtitle}
            trend={calculateTrendFromHistory(
              analyticsData?.kpis?.data?.operational?.approvalEfficiency,
              kpi.trendKey
            ).value}
            trendPositive={calculateTrendFromHistory(
              analyticsData?.kpis?.data?.operational?.approvalEfficiency,
              kpi.trendKey
            ).positive}
            isLoading={analyticsLoading}
          />
        ))}
      </div>

      {/* Financial & Vendor Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <BarChart className="text-green-500 mr-3" size={24} />
              {t('financialOverview')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {t('liveData')}
              </span>
              <Eye className="text-gray-400 cursor-pointer" size={20} />
            </div>
          </div>
          <div className="space-y-4">
            {financialMetrics.map((metric, index) => (
              <MetricRow 
                key={index}
                label={metric.label}
                value={metric.value}
                subtext={metric.subtext}
                progress={metric.progress}
                dataSource={metric.dataSource}
              />
            ))}
          </div>
        </div>

        {/* Vendor Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Users className="text-blue-500 mr-3" size={24} />
              {t('vendorOverview')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {t('liveData')}
              </span>
              <Eye className="text-gray-400 cursor-pointer" size={20} />
            </div>
          </div>
          <div className="space-y-4">
            <MetricRow 
              label={t('totalVendors')}
              value={summary.totalVendors || 0}
              subtext={t('registeredInSystem')}
              dataSource="live"
            />
            <MetricRow 
              label={t('approvedVendors')}
              value={summary.approvedVendors || 0}
              subtext={`${summary.approvedVendors || 0} ${t('of')} ${summary.totalVendors || 0} ${t('approved')}`}
              progress={summary.totalVendors > 0 ? ((summary.approvedVendors / summary.totalVendors) * 100) : 0}
              dataSource="live"
            />
            <MetricRow 
              label={t('vendorsNeedingReview')}
              value={summary.totalVendors - summary.approvedVendors || 0}
              subtext={t('pendingQualificationReview')}
              alert={(summary.totalVendors - summary.approvedVendors) > 0}
              dataSource="live"
            />
            <MetricRow 
              label={t('pendingApprovals')}
              value={summary.pendingApprovals || 0}
              subtext={t('awaitingAuthorization')}
              alert={(summary.pendingApprovals || 0) > 0}
              dataSource="live"
            />
          </div>
        </div>
      </div>

      {/* Project & Alert Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <Briefcase className="text-purple-500 mr-3" size={24} />
              {t('projectPerformance')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {t('liveData')}
              </span>
              <Calendar className="text-gray-400" size={20} />
            </div>
          </div>
          <div className="space-y-4">
            <MetricRow 
              label={t('activeProjects')}
              value={summary.activeProjects || 0}
              subtext={t('currentlyInExecution')}
              dataSource="live"
            />
            
            {/* Show actual project if exists */}
            {projectProgress.length > 0 ? (
              projectProgress.map((project, index) => (
                <div key={index} className="py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-700">{project.name}</p>
                    <span className="text-lg font-semibold text-gray-900">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        project.progress > 80 ? 'bg-green-500' : 
                        project.progress > 50 ? 'bg-blue-500' : 
                        project.progress > 25 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{t('budget')}: SAR {project.budget}</span>
                    <span>{t('spent')}: SAR {project.spent}</span>
                  </div>
                </div>
              ))
            ) : (
              <MetricRow 
                label={t('noActiveProjects')}
                value="0"
                subtext={t('addProjectsToSeeProgress')}
                dataSource="live"
              />
            )}
            
            <MetricRow 
              label={t('teamMembers')}
              value={summary.teamMembers || 0}
              subtext={t('activeProcurementTeam')}
              dataSource="live"
            />
          </div>
        </div>

        {/* Risk & Compliance Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              {t('riskComplianceAlerts')}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                Object.values(realAlerts).some(count => count > 0) 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {Object.values(realAlerts).some(count => count > 0) 
                  ? t('activeAlerts') 
                  : t('allClear')
                }
              </span>
              <Shield className="text-gray-400" size={20} />
            </div>
          </div>
          
          {Object.values(realAlerts).every(count => count === 0) ? (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={32} />
              <p className="text-gray-700 font-medium">{t('noActiveAlerts')}</p>
              <p className="text-gray-500 text-sm">{t('allSystemsCompliant')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* High-Risk Vendors Alert */}
              {realAlerts.highRiskVendors > 0 && (
                <AlertItem 
                  type="high"
                  count={realAlerts.highRiskVendors}
                  label={`${realAlerts.highRiskVendors} ${t('unapprovedVendor')}${realAlerts.highRiskVendors !== 1 ? 's' : ''}`}
                  description={t('requireQualificationReview')}
                />
              )}
              
              {/* Pending Approvals Alert */}
              {summary.pendingApprovals > 0 && (
                <AlertItem 
                  type="warning"
                  count={summary.pendingApprovals}
                  label={`${summary.pendingApprovals} ${t('pendingApproval')}${summary.pendingApprovals !== 1 ? 's' : ''}`}
                  description={t('awaitingAuthorization')}
                />
              )}
              
              {/* Budget Overruns */}
              {realAlerts.budgetOverruns > 0 && (
                <AlertItem 
                  type="medium"
                  count={realAlerts.budgetOverruns}
                  label={`${realAlerts.budgetOverruns} ${t('potentialBudgetConcern')}${realAlerts.budgetOverruns !== 1 ? 's' : ''}`}
                  description={t('reviewProjectSpending')}
                />
              )}
              
              {/* Delayed Projects */}
              {realAlerts.delayedDeliveries > 0 && (
                <AlertItem 
                  type="medium"
                  count={realAlerts.delayedDeliveries}
                  label={`${realAlerts.delayedDeliveries} ${t('project')}${realAlerts.delayedDeliveries !== 1 ? 's' : ''} ${t('below50PercentProgress')}`}
                  description={t('mayRequireAttention')}
                />
              )}
              
              {/* Overdue Tasks */}
              {summary.overdueTasks > 0 && (
                <AlertItem 
                  type="high"
                  count={summary.overdueTasks}
                  label={`${summary.overdueTasks} ${t('overdueTask')}${summary.overdueTasks !== 1 ? 's' : ''}`}
                  description={t('requireImmediateAction')}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('quickActions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <ActionButton 
              key={index}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;