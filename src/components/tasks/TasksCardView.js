// frontend/src/components/tasks/TasksCardView.jsx
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const TasksCardView = ({ tasks, loading, onUpdateStatus, isManager }) => {
  const [actionMenu, setActionMenu] = React.useState({ anchor: null, task: null });
  const theme = useTheme();

  const handleActionClick = (event, task) => {
    setActionMenu({ anchor: event.currentTarget, task });
  };

  const handleActionClose = () => {
    setActionMenu({ anchor: null, task: null });
  };

  const handleStatusUpdate = async (status, remarks = '') => {
    if (actionMenu.task) {
      await onUpdateStatus(actionMenu.task.id, status, remarks);
      handleActionClose();
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      'NOT_STARTED': { label: 'Not Started', color: 'default', bgColor: theme.palette.grey[100] },
      'IN_PROGRESS': { label: 'In Progress', color: 'primary', bgColor: alpha(theme.palette.primary.main, 0.1) },
      'COMPLETED': { label: 'Completed', color: 'success', bgColor: alpha(theme.palette.success.main, 0.1) },
      'OVERDUE': { label: 'Overdue', color: 'error', bgColor: alpha(theme.palette.error.main, 0.1) }
    };
    return config[status] || config.NOT_STARTED;
  };

  const getPriorityConfig = (priority) => {
    const config = {
      'LOW': { label: 'Low', color: 'success', emoji: '💚' },
      'MEDIUM': { label: 'Medium', color: 'warning', emoji: '💛' },
      'HIGH': { label: 'High', color: 'error', emoji: '🧡' },
      'URGENT': { label: 'Urgent', color: 'error', emoji: '❤️' }
    };
    return config[priority] || config.MEDIUM;
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressValue = (task) => {
    switch (task.status) {
      case 'NOT_STARTED': return 0;
      case 'IN_PROGRESS': return 50;
      case 'COMPLETED': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  if (tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={6}>
        <Typography color="textSecondary">No tasks found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {tasks.map((task) => {
          const statusConfig = getStatusConfig(task.status);
          const priorityConfig = getPriorityConfig(task.priority);
          const daysUntilDue = getDaysUntilDue(task.dueDate);
          const isOverdue = daysUntilDue < 0 && task.status !== 'COMPLETED';
          const progressValue = getProgressValue(task);

          return (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                background: `linear-gradient(135deg, ${statusConfig.bgColor} 0%, #ffffff 100%)`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="600" gutterBottom sx={{ lineHeight: 1.3 }}>
                        {task.title}
                      </Typography>
                      <Chip 
                        label={task.taskType.replace(/_/g, ' ')}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionClick(e, task)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  {/* Description */}
                  {task.description && (
                    <Typography 
                      variant="body2" 
                      color="textSecondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {task.description}
                    </Typography>
                  )}

                  {/* Progress Bar */}
                  <LinearProgress 
                    variant="determinate" 
                    value={progressValue}
                    color={statusConfig.color}
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      mb: 2,
                      background: alpha(theme.palette.grey[400], 0.2)
                    }}
                  />

                  {/* Metadata */}
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    {/* Assignee */}
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main }}>
                        {task.assignedUser?.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography variant="body2" flex={1}>
                        {task.assignedUser?.name || 'Unassigned'}
                      </Typography>
                    </Box>

                    {/* Due Date */}
                    <Box display="flex" alignItems="center" gap={1}>
                      <TimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </Typography>
                      {isOverdue && (
                        <Chip 
                          label="Overdue" 
                          size="small" 
                          color="error"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>

                    {/* Priority and Status */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip 
                        label={
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Box sx={{ fontSize: '0.9rem' }}>{priorityConfig.emoji}</Box>
                            <Typography variant="caption">{priorityConfig.label}</Typography>
                          </Box>
                        }
                        size="small"
                        variant="outlined"
                      />
                      <Chip 
                        label={statusConfig.label}
                        size="small"
                        color={statusConfig.color}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu.anchor}
        open={Boolean(actionMenu.anchor)}
        onClose={handleActionClose}
      >
        {actionMenu.task?.status === 'NOT_STARTED' && (
          <MenuItem onClick={() => handleStatusUpdate('IN_PROGRESS')}>
            <StartIcon fontSize="small" sx={{ mr: 1 }} />
            Start Task
          </MenuItem>
        )}
        {actionMenu.task?.status === 'IN_PROGRESS' && (
          <MenuItem onClick={() => handleStatusUpdate('COMPLETED')}>
            <CompleteIcon fontSize="small" sx={{ mr: 1 }} />
            Mark Complete
          </MenuItem>
        )}
        {actionMenu.task?.status === 'COMPLETED' && (
          <MenuItem onClick={() => handleStatusUpdate('IN_PROGRESS')}>
            <PendingIcon fontSize="small" sx={{ mr: 1 }} />
            Reopen Task
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default TasksCardView;