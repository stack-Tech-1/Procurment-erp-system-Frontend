// frontend/src/components/tasks/CreateTaskModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Chip,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  alpha,
  useTheme,
  IconButton // ADD THIS IMPORT
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as TaskIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';

const CreateTaskModal = ({ open, onClose, onSubmit, onTaskCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: '',
    assignedTo: '',
    dueDate: '',
    priority: 'MEDIUM',
    remarks: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const theme = useTheme();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?role=PROCUREMENT_OFFICER`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const steps = ['Basic Info', 'Assignment', 'Review'];

  const taskTypes = [
    { value: 'VENDOR_REVIEW', label: 'Vendor Review', icon: '👥', color: '#4f46e5' },
    { value: 'RFQ_EVALUATION', label: 'RFQ Evaluation', icon: '📊', color: '#059669' },
    { value: 'CONTRACT_REVIEW', label: 'Contract Review', icon: '📝', color: '#dc2626' },
    { value: 'IPC_PROCESSING', label: 'IPC Processing', icon: '💰', color: '#7c3aed' },
    { value: 'DOCUMENT_VERIFICATION', label: 'Document Verification', icon: '📄', color: '#ea580c' },
    { value: 'PROJECT_FOLLOWUP', label: 'Project Follow-up', icon: '🏗️', color: '#0891b2' },
    { value: 'DELIVERY_TRACKING', label: 'Delivery Tracking', icon: '🚚', color: '#65a30d' },
    { value: 'SHOP_DRAWING_REVIEW', label: 'Shop Drawing Review', icon: '📐', color: '#9333ea' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'success', emoji: '💚' },
    { value: 'MEDIUM', label: 'Medium', color: 'warning', emoji: '💛' },
    { value: 'HIGH', label: 'High', color: 'error', emoji: '🧡' },
    { value: 'URGENT', label: 'Urgent', color: 'error', emoji: '❤️' }
  ];

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.title.trim()) newErrors.title = 'Task title is required';
      if (!formData.taskType) newErrors.taskType = 'Task type is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }
    
    if (step === 1) {
      if (!formData.assignedTo) newErrors.assignedTo = 'Assignee is required';
      if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const taskData = {
        ...formData,
        assignedById: JSON.parse(localStorage.getItem('user') || '{}').id
      };

      await onSubmit(taskData);
      handleClose();
      if (onTaskCreated) onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      taskType: '',
      assignedTo: '',
      dueDate: '',
      priority: 'MEDIUM',
      remarks: ''
    });
    setActiveStep(0);
    setErrors({});
    onClose();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.title}
                onChange={handleChange('title')}
                placeholder="What needs to be done?"
                error={!!errors.title}
                helperText={errors.title}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.taskType}>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={formData.taskType}
                  label="Task Type"
                  onChange={handleChange('taskType')}
                  sx={{ borderRadius: 2 }}
                >
                  {taskTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ fontSize: '1.2rem' }}>{type.icon}</Box>
                        <Box>
                          <Typography variant="body1">{type.label}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {type.value.replace(/_/g, ' ').toLowerCase()}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.taskType && (
                  <Typography variant="caption" color="error">
                    {errors.taskType}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                placeholder="Describe the task in detail..."
                error={!!errors.description}
                helperText={errors.description}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.assignedTo}>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assignedTo}
                  label="Assign To"
                  onChange={handleChange('assignedTo')}
                  sx={{ borderRadius: 2 }}
                >
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                          {user.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">{user.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.assignedTo && (
                  <Typography variant="caption" color="error">
                    {errors.assignedTo}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={handleChange('dueDate')}
                error={!!errors.dueDate}
                helperText={errors.dueDate}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={handleChange('priority')}
                  sx={{ borderRadius: 2 }}
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ fontSize: '1.1rem' }}>{priority.emoji}</Box>
                        <Typography>{priority.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Remarks"
                value={formData.remarks}
                onChange={handleChange('remarks')}
                placeholder="Any special instructions or notes..."
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        const selectedTaskType = taskTypes.find(t => t.value === formData.taskType);
        const selectedPriority = priorities.find(p => p.value === formData.priority);
        const selectedUser = users.find(u => u.id === formData.assignedTo);

        return (
          <Box>
            <Typography variant="h6" gutterBottom color="textSecondary">
              Review Task Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, border: `2px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Task Information</Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Title</Typography>
                        <Typography variant="body1" fontWeight="500">{formData.title}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Type</Typography>
                        <Chip 
                          label={selectedTaskType?.label} 
                          size="small"
                          sx={{ background: selectedTaskType?.color, color: 'white' }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Description</Typography>
                        <Typography variant="body2">{formData.description}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, border: `2px solid ${theme.palette.divider}` }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Assignment Details</Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Assigned To</Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                            {selectedUser?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Typography variant="body2">{selectedUser?.name || 'Loading...'}</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Due Date</Typography>
                        <Typography variant="body2">
                          {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Not set'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">Priority</Typography>
                        <Chip 
                          label={selectedPriority?.label} 
                          size="small"
                          color={selectedPriority?.color}
                          icon={<PriorityIcon />}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Create New Task
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Streamline your workflow with organized task management
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Stepper */}
        <Box sx={{ px: 3, pt: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Box sx={{ p: 3 }}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        gap: 2,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Button 
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          variant="outlined"
        >
          Back
        </Button>
        
        <Box flex={1} />
        
        {activeStep === steps.length - 1 ? (
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              px: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        ) : (
          <Button 
            onClick={handleNext}
            variant="contained"
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskModal;