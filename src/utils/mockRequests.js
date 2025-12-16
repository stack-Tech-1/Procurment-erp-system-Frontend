// frontend/src/utils/mockRequests.js

export const REQUEST_TYPES = {
    NDA: { label: 'NDA Submission', icon: 'FileText', color: 'blue' },
    CERTIFICATE_UPDATE: { label: 'Updated Certificate', icon: 'CheckCircle', color: 'green' },
    BRAND_LIST: { label: 'Brand List', icon: 'Package', color: 'purple' },
    CLARIFICATION: { label: 'Clarification', icon: 'HelpCircle', color: 'orange' },
    ADDITIONAL_DOCS: { label: 'Additional Documents', icon: 'FolderPlus', color: 'indigo' },
    OTHER: { label: 'Other', icon: 'FileQuestion', color: 'gray' }
  };
  
  export const REQUEST_STATUS = {
    PENDING: { label: 'Pending', color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    SUBMITTED: { label: 'Submitted', color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    APPROVED: { label: 'Approved', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    REJECTED: { label: 'Rejected', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    OVERDUE: { label: 'Overdue', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
  };
  
  export const PRIORITY_LEVELS = {
    NORMAL: { label: 'Normal', color: 'gray' },
    URGENT: { label: 'Urgent', color: 'orange' },
    CRITICAL: { label: 'Critical', color: 'red' }
  };
  
  export const mockVendors = [
    {
      id: 'vendor-001',
      name: 'Global Supply Co.',
      email: 'contact@globalsupply.com',
      logo: '/logos/global-supply.png'
    },
    {
      id: 'vendor-002',
      name: 'Tech Solutions Ltd.',
      email: 'info@techsolutions.com',
      logo: '/logos/tech-solutions.png'
    },
    {
      id: 'vendor-003',
      name: 'Quality Materials Inc.',
      email: 'support@qualitymaterials.com',
      logo: '/logos/quality-materials.png'
    }
  ];
  
  export const mockDocuments = [
    {
      id: 'doc-001',
      vendorId: 'vendor-001',
      docType: 'ISO_CERTIFICATE',
      name: 'ISO 9001:2015 Certificate',
      expiryDate: '2024-12-31',
      status: 'EXPIRED'
    },
    {
      id: 'doc-002',
      vendorId: 'vendor-001',
      docType: 'COMMERCIAL_REGISTRATION',
      name: 'Commercial Registration',
      expiryDate: '2025-06-30',
      status: 'ACTIVE'
    }
  ];
  
  export const mockInformationRequests = [
    {
      id: 'req-001',
      vendorId: 'vendor-001',
      vendorName: 'Global Supply Co.',
      requestType: 'CERTIFICATE_UPDATE',
      title: 'Update Expired ISO Certificate',
      description: 'Your ISO 9001:2015 certificate has expired. Please upload the renewed certificate.',
      documentId: 'doc-001',
      documentType: 'ISO_CERTIFICATE',
      priority: 'URGENT',
      status: 'PENDING',
      dueDate: '2024-12-20',
      createdAt: '2024-12-15T10:30:00Z',
      createdBy: 'executive-001',
      createdByName: 'Procurement Manager',
      lastNotified: '2024-12-15',
      notificationCount: 1,
      escalated: false,
      responseText: '',
      responseFiles: [],
      responseDate: null,
      approvedBy: null,
      approvedDate: null,
      rejectionReason: null,
      notes: 'Auto-generated request for expired document'
    },
    {
      id: 'req-002',
      vendorId: 'vendor-001',
      vendorName: 'Global Supply Co.',
      requestType: 'BRAND_LIST',
      title: 'Submit Authorized Brands List',
      description: 'Please provide your current authorized brands list with authorization levels.',
      documentId: null,
      documentType: null,
      priority: 'NORMAL',
      status: 'SUBMITTED',
      dueDate: '2024-12-25',
      createdAt: '2024-12-10T14:20:00Z',
      createdBy: 'executive-002',
      createdByName: 'Sourcing Specialist',
      lastNotified: '2024-12-10',
      notificationCount: 2,
      escalated: false,
      responseText: 'Attached is our updated brands list. We are authorized distributors for Siemens, Schneider, and ABB.',
      responseFiles: [
        { name: 'brands-list-q4-2024.pdf', url: '/uploads/brands-list.pdf', size: '2.1 MB', type: 'pdf' }
      ],
      responseDate: '2024-12-12T09:15:00Z',
      approvedBy: null,
      approvedDate: null,
      rejectionReason: null,
      notes: 'Need to verify authorization letters'
    },
    {
      id: 'req-003',
      vendorId: 'vendor-002',
      vendorName: 'Tech Solutions Ltd.',
      requestType: 'NDA',
      title: 'Sign Mutual NDA Agreement',
      description: 'Please sign the attached mutual NDA agreement for upcoming project discussions.',
      documentId: null,
      documentType: null,
      priority: 'CRITICAL',
      status: 'APPROVED',
      dueDate: '2024-12-18',
      createdAt: '2024-12-05T11:00:00Z',
      createdBy: 'executive-001',
      createdByName: 'Procurement Manager',
      lastNotified: '2024-12-05',
      notificationCount: 3,
      escalated: true,
      responseText: 'NDA signed and notarized. Please find attached.',
      responseFiles: [
        { name: 'nda-signed-tech-solutions.pdf', url: '/uploads/nda-signed.pdf', size: '3.5 MB', type: 'pdf' }
      ],
      responseDate: '2024-12-06T16:45:00Z',
      approvedBy: 'executive-001',
      approvedDate: '2024-12-07T10:30:00Z',
      rejectionReason: null,
      notes: 'NDA executed successfully'
    },
    {
      id: 'req-004',
      vendorId: 'vendor-001',
      vendorName: 'Global Supply Co.',
      requestType: 'CLARIFICATION',
      title: 'Clarify Project Experience Details',
      description: 'Please provide additional details about your project experience with high-rise buildings.',
      documentId: null,
      documentType: null,
      priority: 'NORMAL',
      status: 'OVERDUE',
      dueDate: '2024-12-10',
      createdAt: '2024-12-01T09:00:00Z',
      createdBy: 'executive-003',
      createdByName: 'Technical Evaluator',
      lastNotified: '2024-12-08',
      notificationCount: 5,
      escalated: true,
      responseText: '',
      responseFiles: [],
      responseDate: null,
      approvedBy: null,
      approvedDate: null,
      rejectionReason: null,
      notes: 'Vendor has not responded despite multiple reminders'
    },
    {
      id: 'req-005',
      vendorId: 'vendor-003',
      vendorName: 'Quality Materials Inc.',
      requestType: 'ADDITIONAL_DOCS',
      title: 'Submit Factory Audit Reports',
      description: 'Please provide factory audit reports for your manufacturing facilities.',
      documentId: null,
      documentType: null,
      priority: 'URGENT',
      status: 'REJECTED',
      dueDate: '2024-12-12',
      createdAt: '2024-11-28T15:45:00Z',
      createdBy: 'executive-002',
      createdByName: 'Sourcing Specialist',
      lastNotified: '2024-12-12',
      notificationCount: 4,
      escalated: false,
      responseText: 'Factory audit reports attached.',
      responseFiles: [
        { name: 'factory-audit-2024.pdf', url: '/uploads/factory-audit.pdf', size: '4.2 MB', type: 'pdf' }
      ],
      responseDate: '2024-12-10T11:20:00Z',
      approvedBy: 'executive-001',
      approvedDate: null,
      rejectionReason: 'Reports are incomplete. Missing environmental compliance section.',
      notes: 'Need complete reports before approval'
    }
  ];
  
  export const mockExecutives = [
    { id: 'executive-001', name: 'Procurement Manager', email: 'procurement@kunrealestate.com' },
    { id: 'executive-002', name: 'Sourcing Specialist', email: 'sourcing@kunrealestate.com' },
    { id: 'executive-003', name: 'Technical Evaluator', email: 'technical@kunrealestate.com' }
  ];
  
  export const getVendorRequests = (vendorId) => {
    return mockInformationRequests.filter(req => req.vendorId === vendorId);
  };
  
  export const getAllRequests = () => {
    return mockInformationRequests;
  };
  
  export const getRequestById = (requestId) => {
    return mockInformationRequests.find(req => req.id === requestId);
  };
  
  export const getVendorById = (vendorId) => {
    return mockVendors.find(vendor => vendor.id === vendorId);
  };
  
  export const getExecutiveById = (executiveId) => {
    return mockExecutives.find(exec => exec.id === executiveId);
  };
  
  export const getRequestTimeline = (requestId) => {
    const request = getRequestById(requestId);
    if (!request) return [];
    
    const timeline = [
      {
        id: 'timeline-1',
        type: 'REQUEST_CREATED',
        title: 'Request Created',
        description: `Request created by ${request.createdByName}`,
        timestamp: request.createdAt,
        user: request.createdByName,
        icon: 'FilePlus'
      }
    ];
    
    if (request.lastNotified) {
      timeline.push({
        id: 'timeline-2',
        type: 'NOTIFICATION_SENT',
        title: 'Notification Sent',
        description: 'Email notification sent to vendor',
        timestamp: `${request.lastNotified}T09:00:00Z`,
        user: 'System',
        icon: 'Bell'
      });
    }
    
    if (request.responseDate) {
      timeline.push({
        id: 'timeline-3',
        type: 'RESPONSE_SUBMITTED',
        title: 'Response Submitted',
        description: 'Vendor submitted response',
        timestamp: request.responseDate,
        user: request.vendorName,
        icon: 'Upload'
      });
    }
    
    if (request.approvedDate) {
      timeline.push({
        id: 'timeline-4',
        type: 'REQUEST_APPROVED',
        title: 'Request Approved',
        description: `Approved by ${request.createdByName}`,
        timestamp: request.approvedDate,
        user: request.createdByName,
        icon: 'CheckCircle'
      });
    } else if (request.status === 'REJECTED') {
      timeline.push({
        id: 'timeline-4',
        type: 'REQUEST_REJECTED',
        title: 'Request Rejected',
        description: request.rejectionReason || 'Response was rejected',
        timestamp: request.responseDate || request.createdAt,
        user: request.createdByName,
        icon: 'XCircle'
      });
    }
    
    return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };
  
  // Helper function to check if request is overdue
  export const isRequestOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };
  
  // Helper function to get days until due
  export const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  export default {
    REQUEST_TYPES,
    REQUEST_STATUS,
    PRIORITY_LEVELS,
    mockInformationRequests,
    mockVendors,
    mockDocuments,
    mockExecutives,
    getVendorRequests,
    getAllRequests,
    getRequestById,
    getVendorById,
    getExecutiveById,
    getRequestTimeline,
    isRequestOverdue,
    getDaysUntilDue
  };