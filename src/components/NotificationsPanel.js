// frontend/src/components/NotificationsPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
  Divider,
  Badge,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as ReadIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  MarkEmailRead as MarkAllReadIcon
} from '@mui/icons-material';

const NotificationsPanel = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ unread: 0, total: 0, highPriority: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchNotifications();
      fetchNotificationStats();
    }
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications?unreadOnly=false&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || { unread: 0, total: 0, highPriority: 0 });
      }
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true, readAt: new Date() }
              : notif
          )
        );
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
        );
        setStats(prev => ({ ...prev, unread: 0 }));
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type, priority) => {
    const color = priority === 'HIGH' ? 'error' : 
                 type === 'WARNING' ? 'warning' : 
                 type === 'REMINDER' ? 'info' : 'success';

    const icons = {
      WARNING: <WarningIcon color={color} />,
      REMINDER: <InfoIcon color={color} />,
      INFO: <InfoIcon color={color} />,
      ERROR: <ErrorIcon color={color} />
    };

    return icons[type] || <InfoIcon color={color} />;
  };

  const getPriorityChip = (priority) => {
    const colors = {
      HIGH: 'error',
      MEDIUM: 'warning',
      LOW: 'default'
    };

    return (
      <Chip 
        label={priority} 
        size="small" 
        color={colors[priority] || 'default'}
        variant="outlined"
      />
    );
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, maxWidth: '90vw' }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Notifications
          {stats.unread > 0 && (
            <Chip 
              label={stats.unread} 
              size="small" 
              color="error" 
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Box>
          {stats.unread > 0 && (
            <Button
              startIcon={<MarkAllReadIcon />}
              onClick={markAllAsRead}
              size="small"
              sx={{ mr: 1 }}
            >
              Mark All Read
            </Button>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">Loading notifications...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="textSecondary">No notifications</Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  borderLeft: notification.priority === 'HIGH' ? '4px solid' : 'none',
                  borderColor: 'error.main',
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
                secondaryAction={
                  !notification.read && (
                    <IconButton 
                      edge="end" 
                      onClick={() => markAsRead(notification.id)}
                      size="small"
                    >
                      <ReadIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type, notification.priority)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {notification.title}
                      </Typography>
                      {getPriorityChip(notification.priority)}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {notification.body}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider />
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {stats.unread} unread of {stats.total} total notifications
        </Typography>
      </Box>
    </Drawer>
  );
};

export default NotificationsPanel;