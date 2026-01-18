// frontend/src/components/reports/RealTimeChart.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import AdvancedChart from './AdvancedChart';
import { Play, Pause, RefreshCw, Zap, Clock } from 'lucide-react';

const RealTimeChart = ({ 
  dataUrl, 
  title, 
  config, 
  refreshInterval = 30000, // 30 seconds
  maxDataPoints = 50 
}) => {
  const { t } = useTranslation(); // ADD THIS HOOK
  const [chartData, setChartData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    if (!dataUrl) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(dataUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(t('failedToFetchData'));
      
      const result = await response.json();
      
      if (result.success) {
        const newData = result.data.slice(-maxDataPoints); // Keep only recent data
        setChartData(newData);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || t('failedToLoadData'));
      }
    } catch (err) {
      console.error('Real-time chart error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startAutoRefresh = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      fetchData();
    }, refreshInterval);
    
    setIsPlaying(true);
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleAutoRefresh = () => {
    if (isPlaying) {
      stopAutoRefresh();
    } else {
      startAutoRefresh();
      fetchData(); // Immediate refresh
    }
  };

  // Initial data load
  useEffect(() => {
    fetchData();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dataUrl]);

  const handleManualRefresh = () => {
    fetchData();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Real-time Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          
          {lastUpdated && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock size={14} />
              {t('updated')}: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-refresh Toggle */}
          <button
            onClick={toggleAutoRefresh}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isPlaying 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? t('pause') : t('autoRefresh')}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {t('manualRefresh')}
          </button>

          {/* Status Indicator */}
          <div className={`w-3 h-3 rounded-full ${
            isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-red-700 text-sm">
            <strong>{t('error')}:</strong> {error}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6">
        <AdvancedChart
          data={chartData}
          title={title}
          config={config}
          height={400}
          isLoading={isLoading}
        />
      </div>

      {/* Real-time Info Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              <strong>{t('interval')}:</strong> {refreshInterval / 1000}s
            </span>
            <span>
              <strong>{t('dataPoints')}:</strong> {chartData.length}
            </span>
            <span>
              <strong>{t('mode')}:</strong> {isPlaying ? t('live') : t('paused')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isPlaying && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{t('live')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChart;