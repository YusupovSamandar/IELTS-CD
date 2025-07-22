import { DashboardShell } from '@/components/shells/dashboard-shell';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
