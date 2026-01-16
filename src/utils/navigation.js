// frontend/src/utils/navigation.js - UPDATED WITH TRANSLATION KEYS
import { 
  Home, Users, ClipboardList, Briefcase, Receipt, BarChart3, FileText, 
  TrendingUp, DollarSign, Shield, CheckCircle, Building, Send, ListOrdered,
  CheckSquare, UserPlus, Settings, MessageSquare, Grid, Truck 
} from 'lucide-react';
import { ROLES } from '../constants/roles';

export const getNavigationItems = (roleId) => {
  const baseItems = [
    { 
      name: "Dashboard", 
      translationKey: "dashboard",
      icon: <Home size={18} />, 
      href: getDashboardRoute(roleId)
    }
  ];

  switch (roleId) {
    case ROLES.EXECUTIVE:
      return [
        ...baseItems,
        { name: "Financial Analytics", translationKey: "financialAnalytics", icon: <DollarSign size={18} />, href: "/dashboard/executive/financial" },
        { name: "Vendor Performance", translationKey: "vendorPerformance", icon: <BarChart3 size={18} />, href: "/dashboard/procurement/vendors" },
        { name: "Project Portfolio", translationKey: "projectPortfolio", icon: <Briefcase size={18} />, href: "/dashboard/executive/projects" },
        { name: "Compliance Dashboard", translationKey: "complianceDashboard", icon: <Shield size={18} />, href: "/dashboard/executive/compliance" },
        { name: "Approvals", translationKey: "approvals", icon: <CheckCircle size={18} />, href: "/dashboard/approvals" }, 
        { name: "Information Requests", translationKey: "informationRequests", icon: <MessageSquare size={18} />, href: "/dashboard/procurement/information-requests" }, 
        { name: "User Management", translationKey: "userManagement", icon: <UserPlus size={18} />, href: "/dashboard/admin/users" },
        { name: "Reports", translationKey: "reports", icon: <FileText size={18} />, href: "/dashboard/admin/reports" },
        { name: "System Settings", translationKey: "systemSettings", icon: <Settings size={18} />, href: "/dashboard/admin/settings" },
        { name: "Account Approvals", translationKey: "accountApprovals", icon: <CheckCircle size={18} />, href: "/dashboard/admin/approvals" },        
        { name: "Workflow Builder", translationKey: "workflowBuilder", icon: <Settings size={18} />, href: "/dashboard/approvals/workflows"}
      ];

    case ROLES.PROCUREMENT_MANAGER:
      return [
        ...baseItems,
        { name: "Team Overview", translationKey: "teamOverview", icon: <Users size={18} />, href: "/dashboard/manager/team" },
        { name: "Approval Queue", translationKey: "approvalQueue", icon: <CheckCircle size={18} />, href: "/dashboard/manager/approvals" },
        { name: "Information Requests", translationKey: "informationRequests", icon: <MessageSquare size={18} />, href: "/dashboard/procurement/information-requests" },
        { name: "Approvals", translationKey: "approvals", icon: <CheckCircle size={18} />, href: "/dashboard/approvals" },
        { name: "Material Submittals", translationKey: "materialSubmittals", icon: <FileText size={18} />, href: "/dashboard/manager/material-submittals" },
        { name: "Shop Drawings", translationKey: "shopDrawings", icon: <Grid size={18} />, href: "/dashboard/manager/shop-drawings" },
        { name: "Deliveries", translationKey: "deliveries", icon: <Truck size={18} />, href: "/dashboard/manager/deliveries" },
        { name: "Budget Control", translationKey: "budgetControl", icon: <DollarSign size={18} />, href: "/dashboard/manager/budget-control" },
        { name: "Supplier Performance", translationKey: "supplierPerformance", icon: <Users size={18} />, href: "/dashboard/manager/supplier-performance" },
        { name: "Task Assignment", translationKey: "taskAssignment", icon: <CheckSquare size={18} />, href: "/dashboard/tasks" },
        { name: "Vendor Management", translationKey: "vendorManagement", icon: <Building size={18} />, href: "/dashboard/procurement/vendors" },
        { name: "RFQs", translationKey: "rfqs", icon: <ClipboardList size={18} />, href: "/dashboard/procurement/rfq" },
        { name: "POs", translationKey: "pos", icon: <TrendingUp size={18} />, href: "/dashboard/procurement/purchase-orders" },
        { name: "PRs", translationKey: "prs", icon: <Receipt size={18} />, href: "/dashboard/procurement/purchase-requests" },
        { name: "Contracts", translationKey: "contracts", icon: <FileText size={18} />, href: "/dashboard/procurement/contracts" },
        { name: "Invoice", translationKey: "invoice", icon: <DollarSign size={18} />, href: "/dashboard/procurement/invoices" },
        { name: "IPCs", translationKey: "ipcs", icon: <Receipt size={18} />, href: "/dashboard/procurement/ipcs" },        
        { name: "Performance Metrics", translationKey: "performanceMetrics", icon: <BarChart3 size={18} />, href: "/dashboard/procurement/cost-control" },
        { name: "Reports", translationKey: "reports", icon: <FileText size={18} />, href: "/dashboard/admin/reports" },        
        { name: "Workflow Builder", translationKey: "workflowBuilder", icon: <Settings size={18} />, href: "/dashboard/approvals/workflows"}        
      ];

    case ROLES.PROCUREMENT_OFFICER:
      return [
        ...baseItems,
        { name: "My Tasks", translationKey: "myTasks", icon: <CheckSquare size={18} />, href: "/dashboard/officer/tasks" },
        { name: "Approvals", translationKey: "approvals", icon: <CheckCircle size={18} />, href: "/dashboard/approvals" },
        { name: "Information Requests", translationKey: "informationRequests", icon: <MessageSquare size={18} />, href: "/dashboard/procurement/information-requests" },
        { name: "Vendors", translationKey: "vendors", icon: <Users size={18} />, href: "/dashboard/procurement/vendors" },
        { name: "RFOs", translationKey: "rfos", icon: <Send size={18} />, href: "/dashboard/procurement/rfos" },
        { name: "Contracts", translationKey: "contracts", icon: <Briefcase size={18} />, href: "/dashboard/procurement/contracts" },
        { name: "IPCs", translationKey: "ipcs", icon: <Receipt size={18} />, href: "/dashboard/procurement/ipcs" },
        { name: "Cost Control", translationKey: "costControl", icon: <BarChart3 size={18} />, href: "/dashboard/procurement/cost-control" }
      ];

    case ROLES.VENDOR:
      return [
        { name: 'Dashboard', translationKey: 'dashboard', href: '/vendor-dashboard', icon: <Home size={18} /> },
        { name: 'Submit Proposal', translationKey: 'submitProposal', href: '/vendor-dashboard/proposal', icon: <Send size={18} /> },
        { name: 'Track Submissions', translationKey: 'trackSubmissions', href: '/vendor-dashboard/tracker', icon: <ListOrdered size={18} /> },
        { name: 'Information Requests', translationKey: 'informationRequests', href: '/vendor-dashboard/requests', icon: <MessageSquare size={18} /> }, 
        { name: 'My Profile', translationKey: 'myProfile', href: '/dashboard/vendors/profile', icon: <Briefcase size={18} /> },
      ];

    default:
      return baseItems;
  }
};

const getDashboardRoute = (roleId) => {
  switch (roleId) {
    case ROLES.EXECUTIVE: return "/dashboard/executive";
    case ROLES.PROCUREMENT_MANAGER: return "/dashboard/manager";
    case ROLES.PROCUREMENT_OFFICER: return "/dashboard/officer";
    case ROLES.VENDOR: return "/vendor-dashboard";
    default: return "/dashboard";
  }
};