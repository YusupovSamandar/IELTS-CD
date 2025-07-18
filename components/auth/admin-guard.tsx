'use client';

import { useCurrentRole } from '@/hooks/use-current-role';
import { FormError } from './form-error';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminGuard = ({ children, fallback }: AdminGuardProps) => {
  const role = useCurrentRole();

  if (role !== 'ADMIN') {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <FormError message="You do not have permission to view this content!" />
        </div>
      )
    );
  }

  return <>{children}</>;
};
