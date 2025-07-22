import { dashboardConfig } from '@/config/routes/dashboard-route';
import { UserButton } from '../auth/user-button';
import { MainNav } from '../layout/main-nav';
import { SiteFooter } from '../layout/site-footer';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav items={dashboardConfig.adminSidebarNav} />
          <UserButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
