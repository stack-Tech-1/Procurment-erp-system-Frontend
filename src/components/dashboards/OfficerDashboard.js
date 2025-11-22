// frontend/src/components/dashboards/OfficerDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
  Storage as DatabaseIcon,
  WifiOff as WifiOffIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const OfficerDashboard = ({ data }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('unknown');
  const theme = useTheme();

  // Enhanced mock data for officer dashboard matching specifications
  const generateFallbackData = () => ({
    personalMetrics: {
      myTasks: 8,
      upcomingDeadlines: 3,
      pendingSubmissions: 2,
      completedThisWeek: 5,
      overdueTasks: 1
    },
    assignedWork: [
      { 
        id: 1, 
        title: 'Vendor Qualification - SteelTech Industries', 
        taskType: 'VENDOR_REVIEW', 
        dueDate: '2024-01-20', 
        priority: 'HIGH', 
        status: 'IN_PROGRESS',
        project: 'Tower B Construction',
        progress: 65
      },
      { 
        id: 2, 
        title: 'RFQ Evaluation - Electrical Systems', 
        taskType: 'RFQ_EVALUATION', 
        dueDate: '2024-01-25', 
        priority: 'MEDIUM', 
        status: 'NOT_STARTED',
        project: 'Commercial Complex',
        progress: 0
      },
      { 
        id: 3, 
        title: 'Contract Review - HVAC Maintenance', 
        taskType: 'CONTRACT_REVIEW', 
        dueDate: '2024-01-18', 
        priority: 'HIGH', 
        status: 'IN_PROGRESS',
        project: 'All Buildings',
        progress: 40
      },
      { 
        id: 4, 
        title: 'Document Verification - Concrete Supplier', 
        taskType: 'DOCUMENT_VERIFICATION', 
        dueDate: '2024-01-22', 
        priority: 'MEDIUM', 
        status: 'NOT_STARTED',
        project: 'Residential Tower',
        progress: 0
      }
    ],
    performance: {
      tasksCompleted: 18,
      totalTasks: 22,
      overdueTasks: 1,
      onTimeRate: 92,
      efficiencyScore: 88,
      qualityScore: 95
    },
    quickStats: {
      vendorsProcessed: 12,
      rfqsEvaluated: 8,
      contractsReviewed: 6,
      savingsIdentified: 450000
    }
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Fetching officer dashboard data from API...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/officer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Successfully loaded real officer data from API');
        setDashboardData(result.data);
        setDataSource('api');
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.log('⚠️ API unavailable, using fallback data:', error.message);
      setError('Database temporarily unavailable. Showing sample data.');
      setDashboardData(generateFallbackData());
      setDataSource('fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      setDashboardData(data);
      setDataSource('api');
      setLoading(false);
    } else {
      fetchDashboardData();
    }
  }, [data]);

  const handleRetry = () => {
    fetchDashboardData();
  };

  // Weekly activity data - consistent across data sources
  const weeklyData = [
    { day: 'Mon', completed: 3, assigned: 4 },
    { day: 'Tue', completed: 2, assigned: 3 },
    { day: 'Wed', completed: 4, assigned: 5 },
    { day: 'Thu', completed: 3, assigned: 4 },
    { day: 'Fri', completed: 2, assigned: 3 },
    { day: 'Sat', completed: 1, assigned: 2 },
    { day: 'Sun', completed: 0, assigned: 1 }
  ];

  const dataToUse = dashboardData || generateFallbackData();

  // Data Source Indicator Component
  const DataSourceIndicator = () => {
    if (dataSource === 'api') {
      return (
        <Chip 
          icon={<DatabaseIcon />}
          label="Live Data"
          color="success"
          variant="outlined"
          size="small"
        />
      );
    } else if (dataSource === 'fallback') {
      return (
        <Chip 
          icon={<WifiOffIcon />}
          label="Sample Data (DB Offline)"
          color="warning"
          variant="outlined"
          size="small"
        />
      );
    }
    return null;
  };

  // KPI Card Component
  const KPICard = ({ title, value, subtitle, icon, color = 'primary', trend, onClick }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${alpha(theme.palette[color].main, 0.15)}`
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="overline" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" fontWeight="bold" color={color + '.main'}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 1 }}>
                <TrendingUpIcon sx={{ 
                  fontSize: 16, 
                  color: trend > 0 ? 'success.main' : 'error.main',
                  transform: trend > 0 ? 'none' : 'rotate(180deg)'
                }} />
                <Typography 
                  variant="caption" 
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  fontWeight="600"
                >
                  {trend > 0 ? '+' : ''}{trend}% this week
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ 
            color: `${color}.main`,
            background: alpha(theme.palette[color].main, 0.1),
            borderRadius: 3,
            p: 1.5
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 32 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'success';
      case 'OVERDUE': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <Box className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></Box>
          <Typography variant="h6" color="textSecondary">Loading Officer Dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center" maxWidth="400px">
          <WifiOffIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" color="textPrimary" gutterBottom>
            Connection Issue
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleRetry}
            sx={{ mt: 2 }}
          >
            Retry Connection
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      {/* Header with Data Source Indicator */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Procurement Officer Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Your tasks, deadlines, and performance metrics
            </Typography>
            <DataSourceIndicator />
          </Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>

        {/* Data Status Alert */}
        {dataSource === 'fallback' && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                RETRY
              </Button>
            }
          >
            Database connection issue. Showing sample data for demonstration.
          </Alert>
        )}
      </Box>

      {/* Personal Metrics KPIs */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="My Tasks"
            value={dataToUse.personalMetrics.myTasks}
            subtitle="Currently assigned"
            icon={<AssignmentIcon />}
            color="primary"
            trend={12.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Upcoming Deadlines"
            value={dataToUse.personalMetrics.upcomingDeadlines}
            subtitle="Next 7 days"
            icon={<ScheduleIcon />}
            color="warning"
            trend={-8.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Pending Review"
            value={dataToUse.personalMetrics.pendingSubmissions}
            subtitle="Awaiting manager approval"
            icon={<WarningIcon />}
            color="error"
            trend={5.7}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Completed This Week"
            value={dataToUse.personalMetrics.completedThisWeek}
            subtitle="Your weekly progress"
            icon={<CheckCircleIcon />}
            color="success"
            trend={15.2}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Assigned Work & Performance */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                p: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                background: 'linear-gradient(to right, #f8fafc, #ffffff)'
              }}>
                <Typography variant="h6" fontWeight="600">
                  Your Assigned Work
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Active tasks and current assignments
                </Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task / Deliverable</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataToUse.assignedWork.map((task) => (
                      <TableRow key={task.id} hover sx={{
                        backgroundColor: task.priority === 'URGENT' ? alpha(theme.palette.error.main, 0.05) : 'inherit'
                      }}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {task.taskType?.replace(/_/g, ' ')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={task.project} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                          {new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && (
                            <Chip 
                              label="Overdue" 
                              size="small" 
                              color="error"
                              sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={task.progress || 0} 
                              color={task.progress >= 80 ? 'success' : task.progress >= 50 ? 'primary' : 'warning'}
                              sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" fontWeight="600" minWidth={35}>
                              {task.progress || 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={task.status?.replace('_', ' ')}
                            size="small"
                            color={getStatusColor(task.status)}
                            variant={task.status === 'NOT_STARTED' ? 'outlined' : 'filled'}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlayArrowIcon />}
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {task.status === 'NOT_STARTED' ? 'Start' : 'Continue'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Overview & Quick Stats */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Performance Overview */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Performance Overview
                  </Typography>
                  
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">On-Time Completion</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {dataToUse.performance.onTimeRate}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={dataToUse.performance.onTimeRate} 
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Efficiency Score</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {dataToUse.performance.efficiencyScore}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={dataToUse.performance.efficiencyScore} 
                      color="primary"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Quality Rating</Typography>
                      <Typography variant="body2" fontWeight="bold" color="info.main">
                        {dataToUse.performance.qualityScore}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={dataToUse.performance.qualityScore} 
                      color="info"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2} bgcolor="success.light" borderRadius={2}>
                        <Typography variant="h6" fontWeight="bold" color="success.dark">
                          {dataToUse.performance.tasksCompleted}
                        </Typography>
                        <Typography variant="caption" color="success.dark">
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" p={2} bgcolor="error.light" borderRadius={2}>
                        <Typography variant="h6" fontWeight="bold" color="error.dark">
                          {dataToUse.performance.overdueTasks}
                        </Typography>
                        <Typography variant="caption" color="error.dark">
                          Overdue
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Weekly Activity Chart */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Weekly Activity
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis dataKey="day" stroke={theme.palette.text.secondary} />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          borderRadius: 8,
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="completed" 
                        fill={theme.palette.success.main} 
                        name="Completed"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="assigned" 
                        fill={theme.palette.primary.main} 
                        name="Assigned"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfficerDashboard;