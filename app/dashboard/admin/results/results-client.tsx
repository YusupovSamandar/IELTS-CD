'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UsersWithResults } from '@/actions/admin/user-results';
import { UserRole } from '@prisma/client';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface ResultsClientProps {
  usersWithResults: UsersWithResults;
}

export function ResultsClient({ usersWithResults }: ResultsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('query') || ''
  );
  const [selectedRole, setSelectedRole] = useState<string>(
    searchParams.get('role') || 'all'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [openCollapsibles, setOpenCollapsibles] = useState<
    Record<string, boolean>
  >({});

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('query', searchQuery);
    } else {
      params.delete('query');
    }
    if (selectedRole && selectedRole !== 'all') {
      params.set('role', selectedRole);
    } else {
      params.delete('role');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    const params = new URLSearchParams(searchParams.toString());
    if (role && role !== 'all') {
      params.set('role', role);
    } else {
      params.delete('role');
    }
    if (searchQuery) {
      params.set('query', searchQuery);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/export-user-results');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `user-results-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('User results exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export user results');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleCollapsible = (userId: string) => {
    setOpenCollapsibles((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="max-w-xs bg-white border border-blue-300 text-blue-900"
          />
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[180px] bg-white border border-blue-300 text-blue-900">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="TEACHER">Teacher</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleSearch}
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            Search
          </Button>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Users Excel'}
        </Button>
      </div>
      <div className="rounded-xl shadow-lg overflow-x-auto bg-white border border-blue-200">
        <Table>
          <TableHeader className="bg-blue-100">
            <TableRow>
              <TableHead className="w-[40px]" />
              <TableHead className="text-blue-900">Name</TableHead>
              <TableHead className="text-blue-900">Email</TableHead>
              <TableHead className="text-blue-900">Role</TableHead>
              <TableHead className="text-blue-900">Assessments Taken</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersWithResults.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-blue-700"
                >
                  No users or results found.
                </TableCell>
              </TableRow>
            ) : (
              usersWithResults.map((user) => (
                <Collapsible
                  asChild
                  key={user.id}
                  open={openCollapsibles[user.id] || false}
                  onOpenChange={() => toggleCollapsible(user.id)}
                >
                  <>
                    <TableRow className="hover:bg-blue-50 transition">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-700"
                          >
                            {openCollapsibles[user.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium text-blue-900">
                        {user.name || (
                          <span className="italic text-blue-400">No name</span>
                        )}
                      </TableCell>
                      <TableCell className="text-blue-800">
                        {user.email}
                      </TableCell>
                      <TableCell className="text-blue-800">
                        <Badge
                          variant={
                            user.role === 'ADMIN'
                              ? 'default'
                              : user.role === 'TEACHER'
                                ? 'secondary'
                                : 'destructive'
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
                      <TableCell className="text-blue-800">
                        {user.results.length + user.userEssays.length}
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={5} className="bg-blue-50">
                          <div className="p-4 text-blue-900">
                            <h4 className="font-semibold mb-2">
                              Detailed Results for {user.name || user.email}
                            </h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-blue-900">
                                    Assessment
                                  </TableHead>
                                  <TableHead className="text-blue-900">
                                    Type
                                  </TableHead>
                                  <TableHead className="text-blue-900">
                                    Score
                                  </TableHead>
                                  <TableHead className="text-blue-900">
                                    Correct answers
                                  </TableHead>
                                  <TableHead className="text-blue-900">
                                    Status
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {user.results.map((result) => (
                                  <TableRow key={result.id}>
                                    <TableCell className="text-blue-900">
                                      {result.assessment?.name || (
                                        <span className="italic text-blue-400">
                                          Unknown
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-blue-900">
                                      {result.assessment?.sectionType ||
                                        'Unknown'}
                                    </TableCell>
                                    <TableCell className="text-blue-900">
                                      {typeof result.score === 'number'
                                        ? result.score.toFixed(2)
                                        : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-blue-900">
                                      {result.totalCorrectAnswers}
                                    </TableCell>
                                    <TableCell>
                                      <Badge className="bg-green-100 text-green-800">
                                        Completed
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {user.userEssays.map((essay) => (
                                  <TableRow key={essay.id}>
                                    <TableCell className="text-blue-900">
                                      {essay.assessment?.name || (
                                        <span className="italic text-blue-400">
                                          Unknown
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-blue-900">
                                      WRITING
                                    </TableCell>
                                    <TableCell className="text-blue-900">
                                      {typeof essay.score === 'number'
                                        ? essay.score.toFixed(2)
                                        : 'Not Assessed'}
                                    </TableCell>
                                    <TableCell className="text-blue-900">
                                      N/A
                                    </TableCell>
                                    <TableCell>
                                      {essay.isAssessed ? (
                                        <Badge className="bg-green-100 text-green-800">
                                          Assessed
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                          Not Assessed
                                        </Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
