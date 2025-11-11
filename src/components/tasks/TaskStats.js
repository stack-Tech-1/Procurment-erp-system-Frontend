// frontend/src/components/tasks/TaskStats.jsx
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  TrendingUp as TrendIcon,
  People as TeamIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, subtitle, icon, color = 'primary', progress, trend }) => {
  const theme = useTheme();

  return (
    <Card sx={{
      borderRadius: 3,
      background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
      border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 40px ${alpha(theme.palette[color].main, 0.15)}`
      }
    }}>
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
            {progress !== undefined && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  color={color}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    background: alpha(theme.palette[color].main, 0.2)
                  }}
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" fontWeight="600" color={color + '.main'}>
                    {progress}%
                  </Typography>
                </Box>
              </Box>
            )}
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 1 }}>
                <TrendIcon sx={{ 
                  fontSize: 16, 
                  color: trend > 0 ? 'success.main' : 'error.main',
                  transform: trend > 0 ? 'none' : 'rotate(180deg)'
                }} />
                <Typography 
                  variant="caption" 
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  fontWeight="600"
                >
                  {trend > 0 ? '+' : ''}{trend}%
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
};

const TaskStats = ({ stats }) => {
  const { overview, metrics, distribution } = stats;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title="Total Tasks"
          value={overview.total}
          subtitle="All assigned tasks"
          icon={<TaskIcon />}
          color="primary"
          trend={5.2}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title="Completed"
          value={overview.completed}
          subtitle={`${overview.completed} of ${overview.total}`}
          icon={<CompletedIcon />}
          color="success"
          progress={metrics.completionRate}
          trend={12.5}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title="Overdue"
          value={overview.overdue}
          subtitle="Requires immediate attention"
          icon={<OverdueIcon />}
          color="error"
          trend={-2.1}
        />
      </Grid>
      
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title="On Time Rate"
          value={`${metrics.onTimeRate}%`}
          subtitle="Completed on schedule"
          icon={<TrendIcon />}
          color="info"
          trend={8.7}
        />
      </Grid>
    </Grid>
  );
};

export default TaskStats;