// frontend/src/utils/notificationUtils.js

import NotificationsPanel from '@/components/NotificationsPanel';

export const createRequestNotification = (request, action) => {
  const notifications = {
    // Vendor notifications
    REQUEST_RECEIVED: {
      title: 'New Information Request Received',
      body: `You have a new request: "${request.title}"`,
      type: 'INFO',
      priority: request.priority === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      data: {
        requestId: request.id,
        vendorId: request.vendorId,
        action: 'view_request'
      }
    },
    REQUEST_OVERDUE: {
      title: 'Request Overdue',
      body: `Your request "${request.title}" is now overdue. Please respond immediately.`,
      type: 'WARNING',
      priority: 'HIGH',
      data: {
        requestId: request.id,
        vendorId: request.vendorId,
        action: 'view_request'
      }
    },
    REQUEST_DUE_SOON: {
      title: 'Request Due Soon',
      body: `Your request "${request.title}" is due in 3 days.`,
      type: 'REMINDER',
      priority: 'MEDIUM',
      data: {
        requestId: request.id,
        vendorId: request.vendorId,
        action: 'view_request'
      }
    },
    RESPONSE_APPROVED: {
      title: 'Response Approved',
      body: `Your response to "${request.title}" has been approved.`,
      type: 'INFO',
      priority: 'LOW',
      data: {
        requestId: request.id,
        vendorId: request.vendorId,
        action: 'view_request'
      }
    },
    RESPONSE_REJECTED: {
      title: 'Response Requires Revision',
      body: `Your response to "${request.title}" requires revision. Please check the comments.`,
      type: 'WARNING',
      priority: 'MEDIUM',
      data: {
        requestId: request.id,
        vendorId: request.vendorId,
        action: 'view_request'
      }
    },
    
    // Executive notifications
    RESPONSE_SUBMITTED: {
      title: 'New Response Submitted',
      body: `${request.vendorName} has submitted a response to "${request.title}"`,
      type: 'INFO',
      priority: 'MEDIUM',
      data: {
        requestId: request.id,
        vendorId: request.vendorId,
        action: 'review_response'
      }
    },
    REQUEST_ESCALATED: {
      title: 'Request Escalated',
      body: `Request "${request.title}" from ${request.vendorName} has been escalated due to overdue status.`,
      type: 'WARNING',
      priority: 'HIGH',
      data: {
        requestId: request.id,
        vendorId: request.vendorId,
        action: 'view_request'
      }
    }
  };
  
  return notifications[action] || {
    title: 'Request Update',
    body: `Update on request: "${request.title}"`,
    type: 'INFO',
    priority: 'MEDIUM',
    data: {
      requestId: request.id,
      vendorId: request.vendorId
    }
  };
};

export const sendEmailNotification = async (notification, recipientEmail) => {
  // This would call your email service API
  try {
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject: notification.title,
        body: notification.body,
        type: notification.type,
        priority: notification.priority,
        data: notification.data
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
};

export const createWebSocketNotification = (notification, socket) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'NOTIFICATION',
      data: notification
    }));
    return true;
  }
  return false;
};

export default {
  createRequestNotification,
  sendEmailNotification,
  createWebSocketNotification
};