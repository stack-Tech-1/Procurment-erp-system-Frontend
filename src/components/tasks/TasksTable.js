// frontend/src/components/tasks/TasksTable.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';

const TasksTable = ({ tasks, loading, onUpdateStatus, isManager, filters, onFiltersChange }) => {
  const [actionMenu, setActionMenu] = React.useState({ anchor: null, task: null });

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

  const getStatusChip = (status) => {
    const statusConfig = {
      'NOT_STARTED': { label: 'Not Started', color: 'default' },
      'IN_PROGRESS': { label: 'In Progress', color: 'primary' },
      'COMPLETED': { label: 'Completed', color: 'success' },
      'OVERDUE': { label: 'Overdue', color: 'error' }
    };

    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      'LOW': { label: 'Low', color: 'default' },
      'MEDIUM': { label: 'Medium', color: 'primary' },
      'HIGH': { label: 'High', color: 'warning' },
      'URGENT': { label: 'Urgent', color: 'error' }
    };

    const config = priorityConfig[priority] || { label: priority, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
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
      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="NOT_STARTED">Not Started</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={filters.priority}
            label="Priority"
            onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="URGENT">Urgent</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Task Type</InputLabel>
          <Select
            value={filters.taskType}
            label="Task Type"
            onChange={(e) => onFiltersChange({ ...filters, taskType: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="VENDOR_REVIEW">Vendor Review</MenuItem>
            <MenuItem value="RFQ_EVALUATION">RFQ Evaluation</MenuItem>
            <MenuItem value="CONTRACT_REVIEW">Contract Review</MenuItem>
            <MenuItem value="IPC_PROCESSING">IPC Processing</MenuItem>
            <MenuItem value="DOCUMENT_VERIFICATION">Document Verification</MenuItem>
            <MenuItem value="PROJECT_FOLLOWUP">Project Follow-up</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow 
                key={task.id}
                sx={{ 
                  backgroundColor: isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? '#fff5f5' : 'inherit'
                }}
              >
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography variant="caption" color="textSecondary">
                        {task.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={task.taskType.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {task.assignedUser?.name || 'Unassigned'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                  {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                    <Typography variant="caption" color="error">
                      Overdue
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {getPriorityChip(task.priority)}
                </TableCell>
                <TableCell>
                  {getStatusChip(task.status)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleActionClick(e, task)}
                  >
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default TasksTable;