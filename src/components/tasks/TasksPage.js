// frontend/src/components/tasks/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ViewModule as CardViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material';
import TasksTable from './TasksTable';
import TasksCardView from './TasksCardView';
import TaskStats from './TaskStats';
import CreateTaskModal from './CreateTaskModal';
import QuickActions from './QuickActions';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    taskType: '',
    search: ''
  });

  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManager = user.roleId === 1 || user.roleId === 2;

  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [filters, tabValue]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.taskType) queryParams.append('taskType', filters.taskType);
      if (filters.search) queryParams.append('search', filters.search);
      if (tabValue === 1) queryParams.append('assignedTo', 'me');
      if (tabValue === 2) queryParams.append('team', 'true');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data.data?.tasks || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching task stats:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateTask = async (taskData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) throw new Error('Failed to create task');
      
      const data = await response.json();
      setCreateModalOpen(false);
      fetchTasks();
      fetchTaskStats();
      
      return data;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const handleUpdateStatus = async (taskId, status, remarks = '') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, remarks })
      });

      if (!response.ok) throw new Error('Failed to update task status');
      
      fetchTasks();
      fetchTaskStats();
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting tasks...');
  };

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
                Task Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                Streamline your procurement workflow with intelligent task tracking
              </Typography>
            </Box>
            
            <Box display="flex" gap={2} alignItems="center">
              <Tooltip title="Refresh">
                <IconButton onClick={fetchTasks} sx={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Export Tasks">
                <IconButton onClick={handleExport} sx={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>

              {isManager && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateModalOpen(true)}
                  sx={{
                    background: 'rgba(255,255,255,0.9)',
                    color: theme.palette.primary.main,
                    fontWeight: 'bold',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      background: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Create Task
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(244,67,54,0.1)'
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <QuickActions onAction={fetchTasks} />

      {/* Statistics Cards */}
      {stats && <TaskStats stats={stats} />}

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            overflow: 'visible'
          }}>
            <CardContent sx={{ p: 0 }}>
              {/* Header with Tabs and View Controls */}
              <Box sx={{ 
                p: 3, 
                borderBottom: 1, 
                borderColor: 'divider',
                background: 'linear-gradient(to right, #f8fafc, #ffffff)'
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTab-root': {
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        minHeight: 48,
                        borderRadius: 2,
                        mx: 0.5
                      },
                      '& .Mui-selected': {
                        color: theme.palette.primary.main,
                        fontWeight: 'bold'
                      }
                    }}
                  >
                    <Tab label="All Tasks" />
                    <Tab label="My Tasks" />
                    {isManager && <Tab label="Team Tasks" />}
                    <Tab label="Overdue" />
                  </Tabs>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Table View">
                      <IconButton 
                        onClick={() => setViewMode('table')}
                        color={viewMode === 'table' ? 'primary' : 'default'}
                        size="small"
                      >
                        <ListViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Card View">
                      <IconButton 
                        onClick={() => setViewMode('card')}
                        color={viewMode === 'card' ? 'primary' : 'default'}
                        size="small"
                      >
                        <CardViewIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              {/* Tasks Display */}
              <Box sx={{ p: 3 }}>
                {viewMode === 'table' ? (
                  <TasksTable
                    tasks={tasks}
                    loading={loading}
                    onUpdateStatus={handleUpdateStatus}
                    isManager={isManager}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onRefresh={fetchTasks}
                  />
                ) : (
                  <TasksCardView
                    tasks={tasks}
                    loading={loading}
                    onUpdateStatus={handleUpdateStatus}
                    isManager={isManager}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Task Modal */}
      {isManager && (
        <CreateTaskModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateTask}
          onTaskCreated={fetchTasks}
        />
      )}
    </Box>
  );
};

export default TasksPage;