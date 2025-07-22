import { type SidebarNavItem } from '@/types';

export interface DashboardConfig {
  sidebarNav: SidebarNavItem[];
  adminSidebarNav: SidebarNavItem[];
}

export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    {
      title: 'Account',
      href: '/dashboard/account',
      icon: 'add',
      items: []
    },
    {
      title: 'Stores',
      href: '/dashboard/stores',
      icon: 'store',
      items: []
    },
    {
      title: 'Billing',
      href: '/dashboard/billing',
      icon: 'credit',
      items: []
    },
    {
      title: 'Purchases',
      href: '/dashboard/purchases',
      icon: 'dollarSign',
      items: []
    }
  ],
  adminSidebarNav: [
    {
      title: 'Assessments',
      href: '/dashboard/admin/assessments',
      icon: 'add',
      items: []
    },
    {
      title: 'User Results',
      href: '/dashboard/admin/results',
      icon: 'user',
      items: []
    }
  ]
};
