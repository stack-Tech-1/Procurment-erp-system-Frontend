// frontend/src/services/mockRequestService.js

import { 
    mockInformationRequests, 
    mockVendors, 
    mockDocuments, 
    mockExecutives,
    getRequestById,
    getVendorById,
    getExecutiveById,  
    getVendorRequests,
    getAllRequests,
    getRequestTimeline,
    isRequestOverdue,
    getDaysUntilDue,
    REQUEST_TYPES,
    REQUEST_STATUS,
    PRIORITY_LEVELS
  } from '@/utils/mockRequests';
  
  // Simulate API delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  class MockRequestService {
    
    // ========== VENDOR ENDPOINTS ==========
    
    // Get all requests for a vendor
    async getVendorRequests(vendorId, filters = {}) {
      await delay(300);
      
      let requests = getVendorRequests(vendorId);
      
      // Apply filters
      if (filters.status) {
        requests = requests.filter(req => req.status === filters.status);
      }
      
      if (filters.type) {
        requests = requests.filter(req => req.requestType === filters.type);
      }
      
      if (filters.priority) {
        requests = requests.filter(req => req.priority === filters.priority);
      }
      
      if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        requests = requests.filter(req => {
          const reqDate = new Date(req.createdAt);
          return reqDate >= new Date(startDate) && reqDate <= new Date(endDate);
        });
      }

      
      
      // Check for overdue status
      requests = requests.map(req => {
        if (req.status === 'PENDING' && isRequestOverdue(req.dueDate)) {
          return { ...req, status: 'OVERDUE' };
        }
        return req;
      });
      
      return {
        success: true,
        data: requests,
        total: requests.length,
        stats: {
          pending: requests.filter(r => r.status === 'PENDING').length,
          submitted: requests.filter(r => r.status === 'SUBMITTED').length,
          approved: requests.filter(r => r.status === 'APPROVED').length,
          rejected: requests.filter(r => r.status === 'REJECTED').length,
          overdue: requests.filter(r => r.status === 'OVERDUE').length,
          total: requests.length
        }
      };
    }
    
    // Get single request details
async getRequestDetails(requestId) {
    await delay(200);
    
    const request = getRequestById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }
    
    const vendor = getVendorById(request.vendorId);
    const createdBy = getExecutiveById(request.createdBy);
    const timeline = getRequestTimeline(requestId);
    
    // Create detailed timeline with proper data
    const detailedTimeline = timeline.map(event => ({
      id: event.id,
      type: event.type,
      title: event.title,
      description: event.description,
      timestamp: event.timestamp,
      user: event.user,
      icon: event.icon,
      details: request.notes,
      attachments: request.responseFiles
    }));
    
    return {
      success: true,
      data: {
        ...request,
        vendor,
        createdByName: createdBy?.name || request.createdByName,
        createdByEmail: createdBy?.email,
        timeline: detailedTimeline
      }
    };
  }
    
    // Submit response to a request
    async submitResponse(requestId, responseData) {
      await delay(500);
      
      const request = getRequestById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      
      if (request.status !== 'PENDING' && request.status !== 'OVERDUE') {
        throw new Error('Cannot submit response for this request status');
      }
      
      // In a real scenario, this would update the database
      const updatedRequest = {
        ...request,
        responseText: responseData.responseText,
        responseFiles: responseData.files.map(file => ({
          name: file.name,
          url: `/uploads/responses/${file.name}`,
          size: file.size,
          type: file.type
        })),
        responseDate: new Date().toISOString(),
        status: 'SUBMITTED'
      };
      
      console.log('Response submitted:', updatedRequest);
      
      return {
        success: true,
        data: updatedRequest,
        message: 'Response submitted successfully'
      };
    }
    
    // Get pending request count for notification badge
    async getPendingCount(vendorId) {
      await delay(100);
      
      const requests = getVendorRequests(vendorId);
      const pendingCount = requests.filter(req => 
        req.status === 'PENDING' || req.status === 'OVERDUE'
      ).length;
      
      return {
        success: true,
        data: {
          count: pendingCount,
          hasOverdue: requests.some(req => req.status === 'OVERDUE')
        }
      };
    }
    
    // ========== EXECUTIVE ENDPOINTS ==========
    
    // Get all requests (for executives)
    async getAllExecutiveRequests(filters = {}) {
      await delay(400);
      
      let requests = getAllRequests();
      
      // Apply filters
      if (filters.vendorId) {
        requests = requests.filter(req => req.vendorId === filters.vendorId);
      }
      
      if (filters.status) {
        requests = requests.filter(req => req.status === filters.status);
      }
      
      if (filters.type) {
        requests = requests.filter(req => req.requestType === filters.type);
      }
      
      if (filters.priority) {
        requests = requests.filter(req => req.priority === filters.priority);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        requests = requests.filter(req => 
          req.title.toLowerCase().includes(searchTerm) ||
          req.vendorName.toLowerCase().includes(searchTerm) ||
          req.description.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.dateRange) {
        const { startDate, endDate } = filters.dateRange;
        requests = requests.filter(req => {
          const reqDate = new Date(req.createdAt);
          return reqDate >= new Date(startDate) && reqDate <= new Date(endDate);
        });
      }
      
      // Check for overdue status
      requests = requests.map(req => {
        if (req.status === 'PENDING' && isRequestOverdue(req.dueDate)) {
          return { ...req, status: 'OVERDUE' };
        }
        return req;
      });
      
      return {
        success: true,
        data: requests,
        total: requests.length,
        stats: {
          byStatus: {
            pending: requests.filter(r => r.status === 'PENDING').length,
            submitted: requests.filter(r => r.status === 'SUBMITTED').length,
            approved: requests.filter(r => r.status === 'APPROVED').length,
            rejected: requests.filter(r => r.status === 'REJECTED').length,
            overdue: requests.filter(r => r.status === 'OVERDUE').length
          },
          byType: Object.keys(REQUEST_TYPES).reduce((acc, type) => {
            acc[type] = requests.filter(r => r.requestType === type).length;
            return acc;
          }, {}),
          byPriority: Object.keys(PRIORITY_LEVELS).reduce((acc, priority) => {
            acc[priority] = requests.filter(r => r.priority === priority).length;
            return acc;
          }, {})
        }
      };
    }
    
    // Create new request
    async createRequest(requestData) {
      await delay(600);
      
      const newRequest = {
        id: `req-${Date.now()}`,
        ...requestData,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        lastNotified: new Date().toISOString().split('T')[0],
        notificationCount: 1,
        escalated: false,
        responseText: '',
        responseFiles: [],
        responseDate: null,
        approvedBy: null,
        approvedDate: null,
        rejectionReason: null
      };
      
      console.log('New request created:', newRequest);
      
      return {
        success: true,
        data: newRequest,
        message: 'Request created successfully'
      };
    }
    
    // Update request status (approve/reject)
    async updateRequestStatus(requestId, statusData) {
      await delay(400);
      
      const request = getRequestById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      
      if (request.status !== 'SUBMITTED') {
        throw new Error('Cannot update status for this request');
      }
      
      const updatedRequest = {
        ...request,
        status: statusData.status,
        approvedBy: statusData.status === 'APPROVED' ? 'executive-001' : null,
        approvedDate: statusData.status === 'APPROVED' ? new Date().toISOString() : null,
        rejectionReason: statusData.status === 'REJECTED' ? statusData.reason : null,
        notes: statusData.notes || request.notes
      };
      
      console.log('Request status updated:', updatedRequest);
      
      return {
        success: true,
        data: updatedRequest,
        message: `Request ${statusData.status.toLowerCase()} successfully`
      };
    }
    
    // Bulk create requests
    async bulkCreateRequests(requestsData) {
      await delay(800);
      
      const createdRequests = requestsData.map((data, index) => ({
        id: `req-bulk-${Date.now()}-${index}`,
        ...data,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        lastNotified: new Date().toISOString().split('T')[0],
        notificationCount: 1,
        escalated: false,
        responseText: '',
        responseFiles: [],
        responseDate: null,
        approvedBy: null,
        approvedDate: null,
        rejectionReason: null
      }));
      
      console.log('Bulk requests created:', createdRequests.length);
      
      return {
        success: true,
        data: createdRequests,
        message: `${createdRequests.length} requests created successfully`
      };
    }
    
    // Send reminder for a request
    async sendReminder(requestId) {
      await delay(300);
      
      const request = getRequestById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      
      console.log(`Reminder sent for request: ${requestId} to vendor: ${request.vendorName}`);
      
      return {
        success: true,
        message: 'Reminder sent successfully',
        data: {
          ...request,
          lastNotified: new Date().toISOString().split('T')[0],
          notificationCount: request.notificationCount + 1
        }
      };
    }
    
    // Escalate request
    async escalateRequest(requestId) {
      await delay(300);
      
      const request = getRequestById(requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      
      console.log(`Request escalated: ${requestId}`);
      
      return {
        success: true,
        message: 'Request escalated to procurement manager',
        data: {
          ...request,
          escalated: true,
          priority: 'CRITICAL'
        }
      };
    }
    
    // Get request statistics
    async getRequestStats(vendorId = null) {
      await delay(200);
      
      let requests = getAllRequests();
      
      if (vendorId) {
        requests = requests.filter(req => req.vendorId === vendorId);
      }
      
      // Calculate response times
      const respondedRequests = requests.filter(req => req.responseDate);
      const avgResponseTime = respondedRequests.length > 0 
        ? respondedRequests.reduce((sum, req) => {
            const created = new Date(req.createdAt);
            const responded = new Date(req.responseDate);
            return sum + (responded - created) / (1000 * 60 * 60 * 24); // Days
          }, 0) / respondedRequests.length
        : 0;
      
      // Calculate compliance rate
      const totalRequests = requests.length;
      const completedRequests = requests.filter(req => 
        req.status === 'APPROVED' || req.status === 'REJECTED'
      ).length;
      const complianceRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;
      
      return {
        success: true,
        data: {
          totalRequests,
          avgResponseTime: avgResponseTime.toFixed(1),
          complianceRate: complianceRate.toFixed(1),
          overdueCount: requests.filter(req => req.status === 'OVERDUE').length,
          pendingCount: requests.filter(req => req.status === 'PENDING').length,
          byStatus: {
            pending: requests.filter(r => r.status === 'PENDING').length,
            submitted: requests.filter(r => r.status === 'SUBMITTED').length,
            approved: requests.filter(r => r.status === 'APPROVED').length,
            rejected: requests.filter(r => r.status === 'REJECTED').length,
            overdue: requests.filter(r => r.status === 'OVERDUE').length
          }
        }
      };
    }
  }
  
  // Create singleton instance
  const mockRequestService = new MockRequestService();
  
  export default mockRequestService;