// frontend/src/utils/requestConstants.js (new file)
export const REQUEST_TYPES = {
    DOCUMENT_REQUEST: {
      label: 'Document Request',
      color: 'blue',
      icon: '📄'
    },
    CLARIFICATION: {
      label: 'Clarification',
      color: 'green',
      icon: '❓'
    },
    INFO_REQUEST: {
      label: 'Information Request',
      color: 'purple',
      icon: 'ℹ️'
    },
    UPDATE_REQUEST: {
      label: 'Update Request',
      color: 'orange',
      icon: '🔄'
    },
    OTHER: {
      label: 'Other',
      color: 'gray',
      icon: '📝'
    }
  };
  
  export const PRIORITY_LEVELS = {
    URGENT: {
      label: 'Urgent',
      color: 'red'
    },
    HIGH: {
      label: 'High',
      color: 'orange'
    },
    MEDIUM: {
      label: 'Medium',
      color: 'yellow'
    },
    LOW: {
      label: 'Low',
      color: 'green'
    },
    NORMAL: {
      label: 'Normal',
      color: 'gray'
    }
  };
  
  export const REQUEST_STATUS = {
    PENDING: {
      label: 'Pending',
      color: 'yellow'
    },
    SUBMITTED: {
      label: 'Submitted',
      color: 'blue'
    },
    APPROVED: {
      label: 'Approved',
      color: 'green'
    },
    REJECTED: {
      label: 'Rejected',
      color: 'red'
    },
    OVERDUE: {
      label: 'Overdue',
      color: 'red'
    },
    CANCELLED: {
      label: 'Cancelled',
      color: 'gray'
    }
  };