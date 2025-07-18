'use client';

import { useState, useTransition } from 'react';
import { takeEssayForAssessment } from '@/actions/test-exam/user-essay';
import { formatDistanceToNow } from 'date-fns';
import { FileText, UserIcon, Calendar, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

type EssayData = {
  id: string;
  createdAt: Date;
  isAssessed: boolean;
  score: number | null;
  teacherId: string | null;
  user: {
    name: string | null;
    email: string | null;
  };
  assessment: {
    name: string;
    sectionType: string;
  };
  teacher: {
    name: string | null;
  } | null;
};

interface TeacherDashboardClientProps {
  essays: EssayData[];
}

export function TeacherDashboardClient({ essays }: TeacherDashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const [takenEssays, setTakenEssays] = useState<Set<string>>(new Set());

  // Separate essays into available (unassigned) and my essays (assigned to current teacher)
  const availableEssays = essays.filter(essay => !essay.teacherId);
  const myEssays = essays.filter(essay => essay.teacherId);

  const handleTakeEssay = (essayId: string) => {
    startTransition(async () => {
      try {
        await takeEssayForAssessment(essayId);
        setTakenEssays(prev => new Set([...prev, essayId]));
        toast.success('Essay assigned to you successfully');
        // Refresh the page to update the lists
        window.location.reload();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to take essay');
      }
    });
  };

  const handleAccessEssay = (essayId: string) => {
    // Navigate to assessment page
    window.location.href = `/teacher/assess/${essayId}`;
  };

  const EssayTable = ({ 
    essays, 
    actionType, 
    actionLabel 
  }: { 
    essays: EssayData[], 
    actionType: 'take' | 'access',
    actionLabel: string 
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {actionType === 'take' ? 'Available Essays' : 'My Essays'}
        </CardTitle>
        <CardDescription>
          {actionType === 'take' 
            ? 'Essays waiting to be assigned and assessed'
            : 'Essays assigned to you for assessment'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {essays.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{actionType === 'take' ? 'No essays available' : 'No essays assigned to you'}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {essays.map((essay) => (
                <TableRow key={essay.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{essay.user.name || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">{essay.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{essay.assessment.name}</p>
                      <Badge variant="outline">{essay.assessment.sectionType}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(essay.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {actionType === 'access' ? (
                      <Badge 
                        variant={essay.isAssessed ? 'default' : 'secondary'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {essay.isAssessed ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Assessed
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Not Assessed
                          </>
                        )}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Available</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={actionType === 'take' ? 'default' : 'outline'}
                      disabled={isPending || takenEssays.has(essay.id)}
                      onClick={() => 
                        actionType === 'take' 
                          ? handleTakeEssay(essay.id)
                          : handleAccessEssay(essay.id)
                      }
                    >
                      {takenEssays.has(essay.id) ? 'Taking...' : actionLabel}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Essays</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableEssays.length}</div>
            <p className="text-xs text-muted-foreground">
              Waiting to be assigned
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Essays</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myEssays.length}</div>
            <p className="text-xs text-muted-foreground">
              Assigned to you
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myEssays.filter(essay => essay.isAssessed).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed assessments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted rounded-lg">
          <TabsTrigger 
            value="available" 
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm border-0 rounded-md transition-all"
          >
            Available Essays
          </TabsTrigger>
          <TabsTrigger 
            value="my-essays"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm border-0 rounded-md transition-all"
          >
            My Essays
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="available">
          <EssayTable 
            essays={availableEssays} 
            actionType="take"
            actionLabel="Take"
          />
        </TabsContent>
        
        <TabsContent value="my-essays">
          <EssayTable 
            essays={myEssays} 
            actionType="access"
            actionLabel="Access"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
