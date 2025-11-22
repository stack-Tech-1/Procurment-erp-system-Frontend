// frontend/src/components/approvals/WorkflowBuilder.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';

const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    entityType: 'CONTRACT',
    conditions: [],
    steps: []
  });
  const [newStep, setNewStep] = useState({
    stepName: '',
    approverRole: '',
    slaHours: 24
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Role options
  const roleOptions = [
    { value: 1, label: 'Director' },
    { value: 2, label: 'Procurement Manager' },
    { value: 3, label: 'Procurement Officer' }
  ];

  // Entity type options
  const entityTypeOptions = [
    { value: 'VENDOR', label: 'Vendor Qualification' },
    { value: 'RFQ', label: 'RFQ Approval' },
    { value: 'CONTRACT', label: 'Contract Approval' },
    { value: 'PO', label: 'Purchase Order' },
    { value: 'IPC', label: 'IPC Approval' }
  ];

  // Load workflows
  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advanced-approvals/workflows`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setWorkflows(result.data);
      } else {
        throw new Error('Failed to load workflows');
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  // Create workflow
  const handleCreateWorkflow = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advanced-approvals/workflows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWorkflow)
      });

      if (response.ok) {
        const result = await response.json();
        setWorkflows([...workflows, result.data]);
        setNewWorkflow({
          name: '',
          description: '',
          entityType: 'CONTRACT',
          conditions: [],
          steps: []
        });
        setOpenDialog(false);
        setSuccess('Workflow created successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      setError('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = () => {
    if (newStep.stepName && newStep.approverRole) {
      const step = {
        ...newStep,
        stepNumber: newWorkflow.steps.length + 1,
        slaHours: parseInt(newStep.slaHours)
      };
      
      setNewWorkflow({
        ...newWorkflow,
        steps: [...newWorkflow.steps, step]
      });
      
      setNewStep({
        stepName: '',
        approverRole: '',
        slaHours: 24
      });
    }
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = newWorkflow.steps.filter((_, i) => i !== index);
    // Re-number steps
    const renumberedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    }));
    
    setNewWorkflow({
      ...newWorkflow,
      steps: renumberedSteps
    });
  };

  // Load workflows on component mount
  useEffect(() => {
    loadWorkflows();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Success/Error Alerts */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Approval Workflow Builder
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Workflow
        </Button>
      </Box>

      {/* Workflows List */}
      <Grid container spacing={3}>
        {workflows.map((workflow) => (
          <Grid item xs={12} md={6} key={workflow.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {workflow.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {workflow.description}
                    </Typography>
                    <Chip 
                      label={workflow.entityType} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Approval Steps ({workflow.steps.length})
                </Typography>
                
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {workflow.steps.map((step, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < workflow.steps.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {step.stepNumber}. {step.stepName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {roleOptions.find(r => r.value === step.approverRole)?.label} • {step.slaHours}h SLA
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {workflow.conditions && workflow.conditions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Conditions: {workflow.conditions.map(c => `${c.type}: ${c.threshold}`).join(', ')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Workflow Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Create New Approval Workflow
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workflow Name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="e.g., High Value Contract Approval"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="Describe the purpose of this workflow..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Entity Type</InputLabel>
                <Select
                  value={newWorkflow.entityType}
                  label="Entity Type"
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, entityType: e.target.value })}
                >
                  {entityTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Steps Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Approval Steps
              </Typography>
              
              {/* Add Step Form */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="end">
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Step Name"
                      value={newStep.stepName}
                      onChange={(e) => setNewStep({ ...newStep, stepName: e.target.value })}
                      placeholder="e.g., Legal Review"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <InputLabel>Approver Role</InputLabel>
                      <Select
                        value={newStep.approverRole}
                        label="Approver Role"
                        onChange={(e) => setNewStep({ ...newStep, approverRole: e.target.value })}
                      >
                        {roleOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label="SLA Hours"
                      type="number"
                      value={newStep.slaHours}
                      onChange={(e) => setNewStep({ ...newStep, slaHours: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddStep}
                      disabled={!newStep.stepName || !newStep.approverRole}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Steps List */}
              {newWorkflow.steps.length > 0 && (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Step</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Approver</TableCell>
                        <TableCell>SLA</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {newWorkflow.steps.map((step, index) => (
                        <TableRow key={index}>
                          <TableCell>{step.stepNumber}</TableCell>
                          <TableCell>{step.stepName}</TableCell>
                          <TableCell>
                            {roleOptions.find(r => r.value === step.approverRole)?.label}
                          </TableCell>
                          <TableCell>{step.slaHours}h</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveStep(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateWorkflow}
            disabled={!newWorkflow.name || newWorkflow.steps.length === 0 || loading}
            startIcon={<SaveIcon />}
          >
            {loading ? 'Creating...' : 'Create Workflow'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowBuilder;