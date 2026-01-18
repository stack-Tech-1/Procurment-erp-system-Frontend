// frontend/src/components/reports/DrillDownChart.jsx
"use client";
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import AdvancedChart from './AdvancedChart';
import { ArrowLeft, Layers, Filter, BarChart3 } from 'lucide-react';

const DrillDownChart = ({ data, title, initialConfig = {} }) => {
  const { t } = useTranslation(); // ADD THIS HOOK
  const [drillDownStack, setDrillDownStack] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);

  const currentData = useMemo(() => {
    if (drillDownStack.length === 0) return data;
    return drillDownStack[drillDownStack.length - 1].children || [];
  }, [data, drillDownStack]);

  const handleDataPointClick = (clickData) => {
    const { dataPoint } = clickData;
    
    // If the data point has children, drill down
    if (dataPoint.children && dataPoint.children.length > 0) {
      setDrillDownStack(prev => [...prev, dataPoint]);
      setCurrentLevel(prev => prev + 1);
    }
  };

  const handleBackClick = () => {
    if (drillDownStack.length > 0) {
      setDrillDownStack(prev => prev.slice(0, -1));
      setCurrentLevel(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setDrillDownStack([]);
    setCurrentLevel(0);
  };

  const getBreadcrumb = () => {
    if (drillDownStack.length === 0) return title;
    
    return drillDownStack.map(level => level.name).join(' → ');
  };

  const getChartConfig = () => {
    const baseConfig = {
      chartType: initialConfig.chartType || 'bar',
      xAxisKey: initialConfig.xAxisKey || 'name',
      currency: initialConfig.currency || false,
      percentage: initialConfig.percentage || false,
      bars: initialConfig.bars || [{ dataKey: 'value', name: t('value') }],
      lines: initialConfig.lines,
      areas: initialConfig.areas
    };

    // Adjust config based on drill-down level
    if (currentLevel > 0) {
      return {
        ...baseConfig,
        chartType: 'bar', // Always use bar for drill-down for consistency
        bars: [{ dataKey: 'value', name: drillDownStack[currentLevel - 1]?.name || t('value') }]
      };
    }

    return baseConfig;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Drill-down Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {currentLevel > 0 && (
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              {t('back')}
            </button>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 size={20} />
              {getBreadcrumb()}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {t('level')} {currentLevel + 1} • {currentData.length} {t('items')}
              {currentLevel > 0 && ` (${t('drillDownView')})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentLevel > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {t('resetView')}
            </button>
          )}
          
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            <Layers size={16} />
            <span>{t('drillDown')} {currentLevel > 0 ? t('enabled') : t('available')}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <AdvancedChart
          data={currentData}
          title={getBreadcrumb()}
          onDataPointClick={handleDataPointClick}
          config={getChartConfig()}
          height={400}
        />
      </div>

      {/* Drill-down Info */}
      {currentLevel > 0 && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-blue-700">
              <strong>{t('drillDownActive')}:</strong> {t('drillDownActiveDescription')} "
              {drillDownStack[currentLevel - 1]?.name}".
              {t('clickToDrillDownFurther')}
            </div>
            <div className="text-blue-600">
              {drillDownStack.length} {drillDownStack.length > 1 ? t('levels') : t('level')} {t('deep')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillDownChart;