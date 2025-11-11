// frontend/src/components/tasks/QuickActions.jsx
import React from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  FilterList as FilterIcon,
  Download as ExportIcon,
  Add as CreateIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const QuickActions = ({ onAction }) => {
  const theme = useTheme();

  const quickActions = [
    {
      label: 'Start All',
      icon: <StartIcon />,
      color: 'primary',
      description: 'Start all pending tasks',
      onClick: () => console.log('Start all tasks')
    },
    {
      label: 'Complete Batch',
      icon: <CompleteIcon />,
      color: 'success',
      description: 'Mark multiple tasks as complete',
      onClick: () => console.log('Complete batch')
    },
    {
      label: 'Apply Filters',
      icon: <FilterIcon />,
      color: 'info',
      description: 'Quick filter setup',
      onClick: () => console.log('Apply filters')
    },
    {
      label: 'Export Data',
      icon: <ExportIcon />,
      color: 'warning',
      description: 'Export tasks to Excel',
      onClick: () => console.log('Export data')
    }
  ];

  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 3,
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.6)} 100%)`,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600" color="textPrimary">
          Quick Actions
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Frequently used actions to manage your tasks efficiently
        </Typography>
        
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Button
                fullWidth
                startIcon={action.icon}
                onClick={action.onClick}
                variant="outlined"
                sx={{
                  p: 2,
                  height: 'auto',
                  borderRadius: 2,
                  border: `2px dashed ${alpha(theme.palette[action.color].main, 0.3)}`,
                  background: alpha(theme.palette[action.color].main, 0.05),
                  color: theme.palette[action.color].main,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  '&:hover': {
                    background: alpha(theme.palette[action.color].main, 0.1),
                    border: `2px dashed ${theme.palette[action.color].main}`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight="600">
                    {action.label}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    {action.description}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;