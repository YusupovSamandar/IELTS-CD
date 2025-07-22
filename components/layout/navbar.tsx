'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import { UserButton } from '../auth/user-button';

export const Navbar = () => {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <nav className="bg-secondary flex justify-between items-center p-4 rounded-xl w-[600px] shadow-sm">
      <div className="flex gap-x-2">
        <Button
          asChild
          variant={pathname === '/dashboard/server' ? 'default' : 'outline'}
        >
          <Link href="/dashboard/server">Server</Link>
        </Button>
        <Button
          asChild
          variant={pathname === '/dashboard/client' ? 'default' : 'outline'}
        >
          <Link href="/dashboard/client">Client</Link>
        </Button>
        <Button
          asChild
          variant={pathname === '/dashboard/admin' ? 'default' : 'outline'}
        >
          <Link href="/dashboard/admin">Admin</Link>
        </Button>
        <Button
          asChild
          variant={
            pathname === '/dashboard/admin/users' ? 'default' : 'outline'
          }
        >
          <Link href="/dashboard/admin/users">Users</Link>
        </Button>
        {user?.role === 'ADMIN' && (
          <Button
            asChild
            variant={pathname === '/dashboard/admin/results' ? 'default' : 'outline'}
          >
            <Link href="/dashboard/admin/results">Results</Link>
          </Button>
        )}
        {user?.role === 'TEACHER' && (
          <Button
            asChild
            variant={pathname === '/teacher' ? 'default' : 'outline'}
          >
            <Link href="/teacher">Teacher</Link>
          </Button>
        )}
        <Button
          asChild
          variant={pathname === '/dashboard/settings' ? 'default' : 'outline'}
        >
          <Link href="/dashboard/settings">Settings</Link>
        </Button>
      </div>
      <UserButton />
    </nav>
  );
};
