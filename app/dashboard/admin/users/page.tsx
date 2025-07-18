import { Suspense } from 'react';
import { AdminGuard } from '@/components/auth/admin-guard';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading
} from '@/components/page-header';
import { UserManagementClient } from './user-management-client';

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <div className="container relative">
        <PageHeader>
          <PageHeaderHeading>User Management</PageHeaderHeading>
          <PageHeaderDescription>
            Create and manage user accounts
          </PageHeaderDescription>
        </PageHeader>

        <Suspense fallback={<div>Loading...</div>}>
          <UserManagementClient />
        </Suspense>
      </div>
    </AdminGuard>
  );
}
