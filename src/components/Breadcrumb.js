"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const SEGMENT_LABELS = {
  dashboard: null,
  procurement: null,
  admin: null,
  vendors: 'Vendors',
  rfq: 'RFQs',
  rfos: 'RFOs',
  'purchase-orders': 'Purchase Orders',
  'purchase-requests': 'Purchase Requests',
  contracts: 'Contracts',
  invoices: 'Invoices',
  ipcs: 'IPCs',
  'cost-control': 'Cost Control',
  'information-requests': 'Information Requests',
  users: 'User Management',
  reports: 'Reports',
  approvals: 'Approvals',
  branding: 'Branding',
  settings: 'System Settings',
  'audit-log': 'Audit Log',
  permissions: 'Permissions',
  workflows: 'Workflow Builder',
  notifications: 'Notifications',
  profile: 'My Profile',
  tasks: 'Tasks',
  executive: 'Executive Dashboard',
  manager: 'Manager Dashboard',
  officer: 'Officer Dashboard',
  team: 'Team Overview',
  'material-submittals': 'Material Submittals',
  'shop-drawings': 'Shop Drawings',
  deliveries: 'Deliveries',
  'budget-control': 'Budget Control',
  'supplier-performance': 'Supplier Performance',
};

export default function Breadcrumb() {
  const pathname = usePathname();
  if (!pathname) return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [];
  let href = '';

  for (const seg of segments) {
    href += '/' + seg;
    const label = SEGMENT_LABELS[seg];
    if (label) crumbs.push({ label, href });
  }

  if (crumbs.length < 2) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 flex-wrap">
      <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
        <Home size={14} />
      </Link>
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-gray-300" />
          {i === crumbs.length - 1 ? (
            <span className="text-gray-900 font-medium">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-gray-700 transition-colors">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
