// frontend/src/components/ApprovalDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const ApprovalDashboard = ({ pendingApprovals: initialPendingApprovals, onRefresh, loading: externalLoading }) => {
  const [pendingApprovals, setPendingApprovals] = useState(initialPendingApprovals || []);
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [decision, setDecision] = useState('APPROVED');
  const [comments, setComments] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);

  const loading = externalLoading || internalLoading;

  // Update local state when props change
  useEffect(() => {
    if (initialPendingApprovals) {
      setPendingApprovals(initialPendingApprovals);
    }
  }, [initialPendingApprovals]);

  // Load pending approvals (if not provided via props)
  const loadPendingApprovals = async () => {
    if (onRefresh) {
      onRefresh();
      return;
    }

    try {
      setInternalLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advanced-approvals/my-pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPendingApprovals(result.data);
      }
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  // Process step decision
  const processStepDecision = async () => {
    if (!selectedStep) return;

    try {
      setInternalLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/advanced-approvals/steps/${selectedStep.id}/decision`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision,
          comments
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Step decision processed:', result);
        
        // Reload pending approvals
        await loadPendingApprovals();
        setOpenDialog(false);
        setSelectedStep(null);
        setComments('');
      } else {
        console.error('Failed to process step decision');
      }
    } catch (error) {
      console.error('Error processing step decision:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  // Open approval dialog
  const handleApproveStep = (step) => {
    setSelectedStep(step);
    setDecision('APPROVED');
    setComments('');
    setOpenDialog(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      case 'ESCALATED': return 'info';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircleIcon />;
      case 'REJECTED': return <CancelIcon />;
      case 'PENDING': return <ScheduleIcon />;
      case 'ESCALATED': return <WarningIcon />;
      default: return <ScheduleIcon />;
    }
  };

  // Check if step is overdue
  const isStepOverdue = (slaDeadline) => {
    return new Date(slaDeadline) < new Date();
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load data on component mount (only if no props provided)
  useEffect(() => {
    if (!initialPendingApprovals) {
      loadPendingApprovals();
    }
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/*<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Approval Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadPendingApprovals}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box> */}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Pending Approvals</Typography>
                {pendingApprovals.length > 0 && (
                  <Chip 
                    label={pendingApprovals.length} 
                    size="small" 
                    color="warning" 
                  />
                )}
              </Box>
            } 
          />
          <Tab label="Approval History" />
        </Tabs>
      </Box>

      {/* Pending Approvals Tab */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {pendingApprovals.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    No pending approvals
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    You're all caught up! There are no approvals waiting for your review.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            pendingApprovals.map((step) => (
              <Grid item xs={12} key={step.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {step.approval.entityType} - {step.approval.entityId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {step.approval.workflow?.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            icon={getStatusIcon(step.status)}
                            label={`Step ${step.stepNumber}: ${step.stepName}`}
                            color={getStatusColor(step.status)}
                            variant="outlined"
                          />
                          <Chip 
                            label={`SLA: ${formatDate(step.slaDeadline)}`}
                            color={isStepOverdue(step.slaDeadline) ? 'error' : 'default'}
                            variant="outlined"
                            size="small"
                          />
                          <Chip 
                            label={`Requested by: ${step.approval.requestedBy?.name}`}
                            variant="outlined"
                            size="small"
                          />
                        </Box>

                        {/* Progress Bar */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                              Approval Progress
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {step.approval.currentStep} of {step.approval.totalSteps} steps
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(step.approval.currentStep / step.approval.totalSteps) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApproveStep(step)}
                          disabled={loading}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setSelectedStep(step);
                            setDecision('REJECTED');
                            setComments('');
                            setOpenDialog(true);
                          }}
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </Box>
                    </Box>

                    {/* Workflow Steps Overview */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Workflow Steps:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {step.approval.workflow?.steps.map((workflowStep, index) => (
                          <Chip
                            key={index}
                            label={`${workflowStep.stepNumber}. ${workflowStep.stepName}`}
                            color={
                              workflowStep.stepNumber < step.approval.currentStep ? 'success' :
                              workflowFlow.stepNumber === step.approval.currentStep ? 'primary' : 'default'
                            }
                            variant={
                              workflowStep.stepNumber === step.stepNumber ? 'filled' : 'outlined'
                            }
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Approval History Tab */}
      {selectedTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Approval History
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your recent approval activities will appear here.
            </Typography>
            {/* TODO: Implement approval history table */}
          </CardContent>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decision === 'APPROVED' ? 'Approve Step' : 'Reject Step'}
        </DialogTitle>
        <DialogContent>
          {selectedStep && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedStep.stepName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Step {selectedStep.stepNumber} of {selectedStep.approval?.totalSteps}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Decision</InputLabel>
                <Select
                  value={decision}
                  label="Decision"
                  onChange={(e) => setDecision(e.target.value)}
                >
                  <MenuItem value="APPROVED">Approve</MenuItem>
                  <MenuItem value="REJECTED">Reject</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                sx={{ mt: 2 }}
                placeholder="Add any comments or notes about your decision..."
              />

              {decision === 'REJECTED' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Rejecting this step will stop the entire approval process and mark it as rejected.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={decision === 'APPROVED' ? 'success' : 'error'}
            onClick={processStepDecision}
            disabled={loading}
            startIcon={decision === 'APPROVED' ? <CheckCircleIcon /> : <CancelIcon />}
          >
            {decision === 'APPROVED' ? 'Approve' : 'Reject'} Step
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApprovalDashboard;