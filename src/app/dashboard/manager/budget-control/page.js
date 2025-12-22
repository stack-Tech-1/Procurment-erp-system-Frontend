"use client";
import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  RefreshCw, Database, Eye, BarChart, PieChart as PieChartIcon,
  Filter, Download, Search, ChevronRight, Building, Layers,
  Percent, Calculator, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon
} from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';

const BudgetControlDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('projects'); // 'projects' or 'costcodes'
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for Budget Control
  const generateFallbackData = () => ({
    summary: {
      totalProjects: 12,
      projectsOverBudget: 3,
      costCodesOverBudget: 45,
      overallBudgetUsage: 78.5,
      totalBudget: 1250000000,
      totalCommitted: 975000000,
      totalInvoiced: 820000000,
      totalPaid: 720000000
    },
    projects: [
      {
        id: 1,
        name: 'Core DQ Tower',
        budget: 450000000,
        committed: 380000000,
        invoiced: 320000000,
        paid: 285000000,
        variance: -70000000,
        variancePercent: -15.6,
        status: 'UNDER_BUDGET'
      },
      {
        id: 2,
        name: 'Obhur Beach Resort',
        budget: 280000000,
        committed: 295000000,
        invoiced: 260000000,
        paid: 220000000,
        variance: 15000000,
        variancePercent: 5.4,
        status: 'OVER_BUDGET'
      },
      {
        id: 3,
        name: 'Tower B Construction',
        budget: 320000000,
        committed: 250000000,
        invoiced: 210000000,
        paid: 185000000,
        variance: -70000000,
        variancePercent: -21.9,
        status: 'UNDER_BUDGET'
      },
      {
        id: 4,
        name: 'Commercial Complex',
        budget: 200000000,
        committed: 210000000,
        invoiced: 180000000,
        paid: 150000000,
        variance: 10000000,
        variancePercent: 5.0,
        status: 'OVER_BUDGET'
      }
    ],
    costCodes: [
      // Core DQ Tower cost codes
      {
        id: 1,
        projectId: 1,
        projectName: 'Core DQ Tower',
        costCode: '01-01-001',
        description: 'Excavation & Earthworks',
        budget: 15000000,
        committed: 12000000,
        invoiced: 10500000,
        paid: 9500000,
        variance: -3000000,
        variancePercent: -20.0,
        status: 'UNDER_BUDGET'
      },
      {
        id: 2,
        projectId: 1,
        projectName: 'Core DQ Tower',
        costCode: '01-02-001',
        description: 'Foundation Concrete',
        budget: 35000000,
        committed: 38000000,
        invoiced: 32000000,
        paid: 28500000,
        variance: 3000000,
        variancePercent: 8.6,
        status: 'OVER_BUDGET'
      },
      {
        id: 3,
        projectId: 1,
        projectName: 'Core DQ Tower',
        costCode: '02-01-001',
        description: 'Structural Steel',
        budget: 85000000,
        committed: 90000000,
        invoiced: 75000000,
        paid: 68000000,
        variance: 5000000,
        variancePercent: 5.9,
        status: 'OVER_BUDGET'
      },
      // Obhur Beach cost codes
      {
        id: 4,
        projectId: 2,
        projectName: 'Obhur Beach Resort',
        costCode: '01-01-001',
        description: 'Site Preparation',
        budget: 12000000,
        committed: 13500000,
        invoiced: 11500000,
        paid: 10000000,
        variance: 1500000,
        variancePercent: 12.5,
        status: 'OVER_BUDGET'
      },
      {
        id: 5,
        projectId: 2,
        projectName: 'Obhur Beach Resort',
        costCode: '03-01-001',
        description: 'MEP Systems',
        budget: 65000000,
        committed: 62000000,
        invoiced: 52000000,
        paid: 48000000,
        variance: -3000000,
        variancePercent: -4.6,
        status: 'UNDER_BUDGET'
      }
    ],
    charts: {
      projectSpendVsBudget: [
        { project: 'Core DQ', budget: 450, spend: 380 },
        { project: 'Obhur Beach', budget: 280, spend: 295 },
        { project: 'Tower B', budget: 320, spend: 250 },
        { project: 'Commercial', budget: 200, spend: 210 },
        { project: 'HQ Office', budget: 150, spend: 125 }
      ]
    }
  });

  useEffect(() => {
    setTimeout(() => {
      const data = generateFallbackData();
      setDashboardData(data);
      setSelectedProject(data.projects[0]); // Select first project by default
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

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `SAR ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `SAR ${(amount / 1000).toFixed(0)}K`;
    }
    return `SAR ${amount}`;
  };

  const VarianceBadge = ({ variance, variancePercent }) => {
    const isPositive = variance >= 0;
    
    return (
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUpIcon className="text-red-500" size={14} />
        ) : (
          <TrendingDownIcon className="text-green-500" size={14} />
        )}
        <span className={`text-sm font-semibold ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
          {isPositive ? '+' : ''}{formatCurrency(variance)} ({isPositive ? '+' : ''}{variancePercent.toFixed(1)}%)
        </span>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const config = {
      'OVER_BUDGET': { color: 'bg-red-100 text-red-800', label: 'Over Budget' },
      'UNDER_BUDGET': { color: 'bg-green-100 text-green-800', label: 'Under Budget' },
      'ON_BUDGET': { color: 'bg-blue-100 text-blue-800', label: 'On Budget' }
    };
    
    const { color, label } = config[status] || config['ON_BUDGET'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${color}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading Budget Control Dashboard...</h2>
        </div>
      </div>
    );
  }

  const { summary, projects, costCodes, charts } = dashboardData;

  // Filter cost codes for selected project
  const filteredCostCodes = selectedProject 
    ? costCodes.filter(code => code.projectId === selectedProject.id)
    : costCodes;

  return (
    <ResponsiveLayout>
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Project Budget & Cost Control</h1>
          <p className="text-gray-600 mt-1">BOQ-level budget tracking and variance analysis</p>
          <div className="flex items-center gap-2 mt-2">
            <DataSourceIndicator />
          </div>
        </div>        
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<Building className="text-blue-500" size={24} />}
          title="Total Projects"
          value={summary.totalProjects}
          subtitle="Active projects"
          color="primary"
        />
        
        <KPICard
          icon={<AlertTriangle className="text-red-500" size={24} />}
          title="Projects Over Budget"
          value={summary.projectsOverBudget}
          subtitle="Requiring attention"
          color="error"
          trend="+1"
          trendPositive={false}
        />
        
        <KPICard
          icon={<Layers className="text-amber-500" size={24} />}
          title="Cost Codes Over Budget"
          value={summary.costCodesOverBudget}
          subtitle="Detailed cost variances"
          color="warning"
          trend="+8"
          trendPositive={false}
        />
        
        <KPICard
          icon={<Percent className="text-green-500" size={24} />}
          title="Budget Usage"
          value={`${summary.overallBudgetUsage}%`}
          subtitle="Overall utilization"
          color="success"
          trend="-2.3%"
          trendPositive={true}
        />
      </div>

      {/* Project Selection & Charts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Project-Level Spend vs Budget</h3>
          <div className="flex items-center gap-2">
            <Eye className="text-gray-400 cursor-pointer" size={20} />
            <Download className="text-gray-400 cursor-pointer" size={20} />
          </div>
        </div>

        {/* Project Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg ${viewMode === 'projects' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setViewMode('projects')}
          >
            Projects Overview
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${viewMode === 'costcodes' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setViewMode('costcodes')}
            disabled={!selectedProject}
          >
            {selectedProject ? `${selectedProject.name} Cost Codes` : 'Select a Project'}
          </button>
        </div>

        {/* Bar Chart Visualization */}
        <div className="mb-6">
          <div className="h-48">
            <div className="flex items-end h-40 gap-4 mt-4">
              {charts.projectSpendVsBudget.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex items-end w-full justify-center gap-1">
                    <div 
                      className="w-1/2 bg-blue-200 rounded-t"
                      style={{ height: `${(item.budget / 500) * 100}%` }}
                      title={`Budget: SAR ${item.budget}M`}
                    ></div>
                    <div 
                      className="w-1/2 bg-green-400 rounded-t"
                      style={{ height: `${(item.spend / 500) * 100}%` }}
                      title={`Spend: SAR ${item.spend}M`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{item.project}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span className="text-sm text-gray-600">Budget</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span className="text-sm text-gray-600">Actual Spend</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Selection Grid */}
        {viewMode === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {projects.map((project) => (
              <div 
                key={project.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedProject?.id === project.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{project.name}</h4>
                  <StatusBadge status={project.status} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Budget:</span>
                    <span className="text-sm font-medium">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Committed:</span>
                    <span className="text-sm font-medium">{formatCurrency(project.committed)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (project.committed / project.budget * 100) > 100 
                          ? 'bg-red-500' 
                          : (project.committed / project.budget * 100) > 85
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((project.committed / project.budget * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cost Code Details for Selected Project */}
        {viewMode === 'costcodes' && selectedProject && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cost Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">BOQ Description</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Budget</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Committed (PO)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Invoiced</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Paid</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Variance</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCostCodes.map((code) => (
                  <tr key={code.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-blue-600">{code.costCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700">{code.description}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{formatCurrency(code.budget)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{formatCurrency(code.committed)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{formatCurrency(code.invoiced)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{formatCurrency(code.paid)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <VarianceBadge variance={code.variance} variancePercent={code.variancePercent} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={code.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed BOQ Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">BOQ-Level Budget Details</h3>
            <p className="text-gray-600 text-sm">All cost codes across all projects</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search cost codes..."
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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[120px]">Project</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Cost Code</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[200px]">BOQ Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Budget</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Committed (PO)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Invoiced</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Paid</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[120px]">Variance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w=[100px]">Variance %</th>
              </tr>
            </thead>
            <tbody>
              {costCodes.map((code) => (
                <tr key={code.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-700">{code.projectName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-600">{code.costCode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700">{code.description}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatCurrency(code.budget)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatCurrency(code.committed)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatCurrency(code.invoiced)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatCurrency(code.paid)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <VarianceBadge variance={code.variance} variancePercent={code.variancePercent} />
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-semibold ${
                      code.variancePercent >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {code.variancePercent >= 0 ? '+' : ''}{code.variancePercent.toFixed(1)}%
                    </span>
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

export default BudgetControlDashboard;