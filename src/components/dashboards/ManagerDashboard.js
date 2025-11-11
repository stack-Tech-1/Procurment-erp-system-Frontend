// frontend/src/components/dashboards/ManagerDashboard.jsx
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
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ManagerDashboard = ({ data }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (data) {
      setDashboardData(data);
      setLoading(false);
    } else {
      fetchDashboardData();
    }
  }, [data]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced mock data with more realistic structure
  const mockData = {
    teamOverview: {
      teamMembers: 12,
      pendingApprovals: 8,
      overdueTasks: 3,
      vendorReviews: 15,
      activeProjects: 6,
      budgetUtilization: 78
    },
    teamPerformance: {
      teamStats: [
        { memberName: 'Ahmed Zaid', completedTasks: 23, overdueTasks: 1, vendorsReviewed: 12, completionRate: 95 },
        { memberName: 'Sarah Mohammed', completedTasks: 18, overdueTasks: 0, vendorsReviewed: 9, completionRate: 100 },
        { memberName: 'Khalid Al-Rashid', completedTasks: 21, overdueTasks: 2, vendorsReviewed: 14, completionRate: 88 },
        { memberName: 'Fatima Al-Mansoor', completedTasks: 16, overdueTasks: 1, vendorsReviewed: 8, completionRate: 92 },
        { memberName: 'Omar Hassan', completedTasks: 19, overdueTasks: 0, vendorsReviewed: 11, completionRate: 96 }
      ],
      averageCompletionRate: 94,
      totalOverdueTasks: 4,
      teamSize: 12,
      monthlyTrend: 12.5
    },
    approvalQueue: [
      { id: 1, entityType: 'Vendor', entityId: 'V-2024-0012', entityName: 'TechBuild Construction Co.', approver: { name: 'Mohammed Zaiton' }, createdAt: new Date('2024-01-15'), priority: 'HIGH' },
      { id: 2, entityType: 'RFQ', entityId: 'RFQ-2024-0205', entityName: 'Project Alpha - HVAC Systems', approver: { name: 'Mohammed Zaiton' }, createdAt: new Date('2024-01-14'), priority: 'MEDIUM' },
      { id: 3, entityType: 'Contract', entityId: 'CT-2024-0156', entityName: 'Gulf Materials Supply Agreement', approver: { name: 'Mohammed Zaiton' }, createdAt: new Date('2024-01-13'), priority: 'HIGH' },
      { id: 4, entityType: 'Purchase Order', entityId: 'PO-2024-0342', entityName: 'Office Furniture Procurement', approver: { name: 'Mohammed Zaiton' }, createdAt: new Date('2024-01-12'), priority: 'LOW' }
    ],
    deadlineTracking: [
      { id: 1, title: 'Vendor Qualification - TechBuild Co.', dueIn: 2, priority: 'HIGH', assignedTo: 'Ahmed Zaid', status: 'IN_PROGRESS', project: 'Tower A' },
      { id: 2, title: 'RFQ Evaluation - Project Alpha HVAC', dueIn: 5, priority: 'MEDIUM', assignedTo: 'Sarah Mohammed', status: 'NOT_STARTED', project: 'Project Alpha' },
      { id: 3, title: 'Contract Renewal - Gulf Materials', dueIn: 1, priority: 'URGENT', assignedTo: 'Khalid Al-Rashid', status: 'IN_PROGRESS', project: 'All Projects' },
      { id: 4, title: 'Budget Review Q1 2024', dueIn: 7, priority: 'HIGH', assignedTo: 'Fatima Al-Mansoor', status: 'NOT_STARTED', project: 'Finance' }
    ],
    performanceMetrics: {
      vendorApprovalRate: 85,
      projectOnTime: 92,
      budgetAdherence: 88,
      teamSatisfaction: 94
    },
    financialOverview: {
      totalBudget: 45000000,
      utilizedBudget: 35100000,
      committedFunds: 8100000,
      remainingBudget: 1800000,
      savings: 2700000
    }
  };

  const chartData = [
    { name: 'Jan', tasks: 45, completed: 38 },
    { name: 'Feb', tasks: 52, completed: 45 },
    { name: 'Mar', tasks: 48, completed: 42 },
    { name: 'Apr', tasks: 60, completed: 52 },
    { name: 'May', tasks: 55, completed: 48 },
    { name: 'Jun', tasks: 58, completed: 51 }
  ];

  const priorityData = [
    { name: 'High', value: 35 },
    { name: 'Medium', value: 45 },
    { name: 'Low', value: 20 }
  ];

  const COLORS = ['#ff6b6b', '#ffd93d', '#6bcf7f'];

  const dataToUse = dashboardData || mockData;

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
                  {trend > 0 ? '+' : ''}{trend}% from last month
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <Box className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></Box>
          <Typography variant="h6" color="textSecondary">Loading Manager Dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2, borderRadius: 2 }}
        action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            RETRY
          </Button>
        }
      >
        Error loading dashboard: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      {/* Header Section */}
      <Card sx={{ 
        mb: 4, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h3" gutterBottom fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                Procurement Manager Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                Strategic oversight, team performance monitoring, and workflow optimization
              </Typography>
            </Box>
            
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchDashboardData} sx={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Report">
                <IconButton sx={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Team Overview KPIs */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Team Members"
            value={dataToUse.teamOverview.teamMembers}
            subtitle="Active procurement officers"
            icon={<PeopleIcon />}
            color="primary"
            trend={8.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Pending Approvals"
            value={dataToUse.teamOverview.pendingApprovals}
            subtitle="Require your immediate review"
            icon={<AssignmentIcon />}
            color="warning"
            trend={-5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Overdue Tasks"
            value={dataToUse.teamOverview.overdueTasks}
            subtitle="Team overdue items"
            icon={<WarningIcon />}
            color="error"
            trend={-12.7}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Vendor Reviews"
            value={dataToUse.teamOverview.vendorReviews}
            subtitle="Awaiting qualification"
            icon={<GroupIcon />}
            color="info"
            trend={15.8}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Performance Charts */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Team Performance Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: 8,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tasks" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                    name="Total Tasks"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke={theme.palette.success.main} 
                    strokeWidth={3}
                    dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 4 }}
                    name="Completed Tasks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Task Priority Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Team Performance Table */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                p: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                background: 'linear-gradient(to right, #f8fafc, #ffffff)'
              }}>
                <Typography variant="h6" fontWeight="600">
                  Team Performance
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Individual performance metrics and completion rates
                </Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team Member</TableCell>
                      <TableCell align="center">Completed</TableCell>
                      <TableCell align="center">Overdue</TableCell>
                      <TableCell align="center">Success Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataToUse.teamPerformance.teamStats.map((member, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                              {member.memberName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {member.memberName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {member.vendorsReviewed} vendors reviewed
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={member.completedTasks} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {member.overdueTasks > 0 ? (
                            <Chip 
                              label={member.overdueTasks} 
                              size="small" 
                              color="error" 
                            />
                          ) : (
                            <Chip 
                              label="0" 
                              size="small" 
                              color="default" 
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={member.completionRate} 
                              color={member.completionRate >= 90 ? 'success' : member.completionRate >= 80 ? 'warning' : 'error'}
                              sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography 
                              variant="body2" 
                              color={member.completionRate >= 90 ? 'success.main' : member.completionRate >= 80 ? 'warning.main' : 'error.main'}
                              fontWeight="600"
                              minWidth={35}
                            >
                              {member.completionRate}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Approval Queue */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                p: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                background: 'linear-gradient(to right, #f8fafc, #ffffff)'
              }}>
                <Typography variant="h6" fontWeight="600">
                  Approval Queue
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Pending items requiring your approval
                </Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Requested</TableCell>
                      <TableCell>Priority</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataToUse.approvalQueue.map((approval) => (
                      <TableRow key={approval.id} hover>
                        <TableCell>
                          <Chip 
                            label={approval.entityType} 
                            size="small" 
                            color={
                              approval.entityType === 'Vendor' ? 'primary' :
                              approval.entityType === 'RFQ' ? 'secondary' : 
                              approval.entityType === 'Contract' ? 'info' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {approval.entityName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {approval.entityId}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(approval.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={approval.priority} 
                            size="small" 
                            color={
                              approval.priority === 'HIGH' ? 'error' :
                              approval.priority === 'MEDIUM' ? 'warning' : 'default'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                p: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                background: 'linear-gradient(to right, #f8fafc, #ffffff)'
              }}>
                <Typography variant="h6" fontWeight="600">
                  Critical Deadlines & Priority Items
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Upcoming deadlines requiring immediate attention
                </Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task / Deliverable</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Due In</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataToUse.deadlineTracking.map((item) => (
                      <TableRow key={item.id} hover sx={{
                        backgroundColor: item.priority === 'URGENT' ? alpha(theme.palette.error.main, 0.05) : 'inherit'
                      }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {item.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.project} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main, fontSize: '0.8rem' }}>
                              {item.assignedTo.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {item.assignedTo}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            icon={<ScheduleIcon />}
                            label={`${item.dueIn} days`}
                            size="small"
                            color={item.dueIn <= 1 ? 'error' : item.dueIn <= 3 ? 'warning' : 'default'}
                            variant={item.dueIn > 7 ? 'outlined' : 'filled'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.priority}
                            size="small"
                            color={
                              item.priority === 'URGENT' ? 'error' :
                              item.priority === 'HIGH' ? 'error' :
                              item.priority === 'MEDIUM' ? 'warning' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.status.replace('_', ' ')}
                            size="small"
                            color={item.status === 'IN_PROGRESS' ? 'primary' : 'default'}
                            variant={item.status === 'NOT_STARTED' ? 'outlined' : 'filled'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label="Review" 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            clickable
                            onClick={() => console.log('Review item:', item.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;