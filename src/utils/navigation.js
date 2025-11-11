// frontend/src/utils/navigation.js
import { 
  Home, Users, ClipboardList, Briefcase, Receipt, BarChart3, FileText, 
  TrendingUp, DollarSign, Shield, CheckCircle, Building, Send, ListOrdered,
  CheckSquare, UserPlus, Settings
} from 'lucide-react';
import { ROLES } from '../constants/roles';

export const getNavigationItems = (roleId) => {
  const baseItems = [
    { 
      name: "Dashboard", 
      icon: <Home size={18} />, 
      href: getDashboardRoute(roleId)
    }
  ];

  switch (roleId) {
    case ROLES.EXECUTIVE:
      return [
        ...baseItems,
        { name: "Financial Analytics", icon: <DollarSign size={18} />, href: "/dashboard/executive/financial" },
        { name: "Vendor Performance", icon: <BarChart3 size={18} />, href: "/dashboard/procurement/vendors" },
        { name: "Project Portfolio", icon: <Briefcase size={18} />, href: "/dashboard/executive/projects" },
        { name: "Compliance Dashboard", icon: <Shield size={18} />, href: "/dashboard/executive/compliance" },
        { name: "Approvals", icon: <CheckCircle size={18} />, href: "/dashboard/approvals" }, // ADDED HERE
        { name: "User Management", icon: <UserPlus size={18} />, href: "/dashboard/admin/users" },
        { name: "Reports", icon: <FileText size={18} />, href: "/dashboard/admin/reports" },
        { name: "System Settings", icon: <Settings size={18} />, href: "/dashboard/admin/settings" },
        { name: "Account Approvals", icon: <CheckCircle size={18} />, href: "/dashboard/admin/approvals" }
      ];

    case ROLES.PROCUREMENT_MANAGER:
      return [
        ...baseItems,
        { name: "Team Overview", icon: <Users size={18} />, href: "/dashboard/manager/team" },
        { name: "Approval Queue", icon: <CheckCircle size={18} />, href: "/dashboard/manager/approvals" },
        { name: "Approvals", icon: <CheckCircle size={18} />, href: "/dashboard/approvals" }, // ADDED HERE
        { name: "Task Assignment", icon: <CheckSquare size={18} />, href: "/dashboard/tasks" },
        { name: "Vendor Management", icon: <Building size={18} />, href: "/dashboard/procurement/vendors" },
        { name: "RFOs", icon: <ClipboardList size={18} />, href: "/dashboard/procurement/rfos" },
        { name: "Contracts", icon: <FileText size={18} />, href: "/dashboard/procurement/contracts" },
        { name: "Performance Metrics", icon: <BarChart3 size={18} />, href: "/dashboard/procurement/cost-control" },
        { name: "Reports", icon: <FileText size={18} />, href: "/dashboard/admin/reports" }        
      ];

    case ROLES.PROCUREMENT_OFFICER:
      return [
        ...baseItems,
        { name: "My Tasks", icon: <CheckSquare size={18} />, href: "/dashboard/officer/tasks" },
        { name: "Approvals", icon: <CheckCircle size={18} />, href: "/dashboard/approvals" }, // ADDED HERE
        { name: "Vendors", icon: <Users size={18} />, href: "/dashboard/procurement/vendors" },
        { name: "RFOs", icon: <Send size={18} />, href: "/dashboard/officer/rfos" },
        { name: "Contracts", icon: <Briefcase size={18} />, href: "/dashboard/officer/contracts" },
        { name: "IPCs", icon: <Receipt size={18} />, href: "/dashboard/officer/ipcs" },
        { name: "Cost Control", icon: <BarChart3 size={18} />, href: "/dashboard/officer/cost-control" }
      ];

    case ROLES.VENDOR:
      return [
        { name: 'Dashboard', href: '/vendor-dashboard', icon: <Home size={18} /> },
        { name: 'Submit Proposal', href: '/vendor-dashboard/proposal', icon: <Send size={18} /> },
        { name: 'Track Submissions', href: '/vendor-dashboard/tracker', icon: <ListOrdered size={18} /> },
        { name: 'My Profile', href: '/dashboard/vendors/profile', icon: <Briefcase size={18} /> },
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