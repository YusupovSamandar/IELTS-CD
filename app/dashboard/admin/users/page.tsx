import { Suspense } from 'react';
import { AdminGuard } from '@/components/auth/admin-guard';
import { UserManagementClient } from './user-management-client';

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-100 to-blue-300 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              User Management
            </h1>
            <p className="text-lg text-blue-700">
              Create and manage user accounts.
            </p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <UserManagementClient />
          </Suspense>
        </div>
      </div>
    </AdminGuard>
  );
}
