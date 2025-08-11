'use client';

import { useEffect, useState, useTransition } from 'react';
import { deleteUser, getUsers } from '@/actions/admin/user-management';
import { ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: 'USER' | 'ADMIN' | 'TEACHER';
  emailVerified: Date | null;
  isTwoFactorEnabled: boolean;
}

interface UsersData {
  users: User[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface UsersTableProps {
  refreshTrigger?: number;
  currentUserId?: string;
}

export function UsersTable({ refreshTrigger, currentUserId }: UsersTableProps) {
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const data = await getUsers(page, 10);
      setUsersData(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, refreshTrigger]);

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers(currentPage);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to delete user'
        );
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="rounded-xl shadow-lg overflow-hidden bg-white border border-blue-200 p-4">
        <div className="h-6 w-48 animate-pulse rounded bg-blue-100 mb-3" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded bg-blue-50 mb-2"
          />
        ))}
      </div>
    );
  }

  if (!usersData) {
    return <div>Failed to load users</div>;
  }

  // Client-side search (filters current page only; backend unchanged)
  const filteredUsers = usersData.users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 bg-white border border-blue-300 text-blue-900 placeholder:text-blue-400"
          />
        </div>
        <Button
          className="bg-blue-700 text-white hover:bg-blue-800"
          onClick={() => {}}
        >
          Search
        </Button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl shadow-lg overflow-x-auto bg-white border border-blue-200">
        <div className="overflow-auto max-h-[70vh]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-blue-100">
              <TableRow>
                <TableHead className="text-blue-900 text-xs uppercase tracking-wide">
                  Name
                </TableHead>
                <TableHead className="text-blue-900 text-xs uppercase tracking-wide">
                  Email
                </TableHead>
                <TableHead className="text-blue-900 text-xs uppercase tracking-wide">
                  Role
                </TableHead>
                <TableHead className="text-blue-900 text-xs uppercase tracking-wide">
                  Email Verified
                </TableHead>
                <TableHead className="text-blue-900 text-xs uppercase tracking-wide">
                  2FA Enabled
                </TableHead>
                <TableHead className="text-blue-900 w-[100px] text-xs uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-blue-50 transition"
                  >
                    <TableCell className="font-medium text-blue-900">
                      {user.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-blue-800">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === 'ADMIN'
                            ? 'default'
                            : user.role === 'TEACHER'
                              ? 'secondary'
                              : 'outline'
                        }
                        className={
                          user.role === 'USER'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : ''
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Not Verified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isTwoFactorEnabled ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          Enabled
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-200 text-gray-700">
                          Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.id === currentUserId ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          title="You cannot delete your own account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the user account for{' '}
                                {user.email}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {usersData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 10 + 1} to{' '}
            {Math.min(currentPage * 10, usersData.totalCount)} of{' '}
            {usersData.totalCount} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {[...Array(usersData.totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;

                // Show only a few pages around current page
                if (
                  page === 1 ||
                  page === usersData.totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === usersData.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
