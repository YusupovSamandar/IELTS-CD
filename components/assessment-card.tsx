'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { deleteAssessment } from '@/actions/test-exam/assessment';
import { Assessment } from '@prisma/client';
import { CheckIcon, EyeOpenIcon, PlusIcon } from '@radix-ui/react-icons';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEditHook } from '@/global/use-edit-hook';
import { AssessmentExtended } from '@/types/test-exam';
import { cn } from '@/lib/utils';
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
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { PlaceholderImage } from './placeholder-image';

interface AssessmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  assessment: Assessment;
  variant?: 'default' | 'switchable';
  isAddedToCart?: boolean;
  onSwitch?: () => Promise<void>;
  userRole?: string;
}

export function AssessmentCard({
  assessment,
  variant = 'default',
  isAddedToCart = false,
  onSwitch,
  userRole,
  className,
  ...props
}: AssessmentCardProps) {
  const { onOpen } = useEditHook();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsDeleting(true);

    try {
      const result = await deleteAssessment(assessment.id);
      toast.success(result.message);
      // The page will automatically refresh due to revalidatePath
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete assessment'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={cn(
        'size-full overflow-hidden rounded-sm relative group',
        className
      )}
      {...props}
    >
      {/* Delete button for admins only */}
      {userRole === 'ADMIN' && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isDeleting}
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Are you sure you want to delete{' '}
                  <strong>&ldquo;{assessment.name}&rdquo;</strong>?
                </p>
                <p className="text-destructive font-medium">
                  ⚠️ This action cannot be undone. All data will be deleted
                  including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>All questions and answers</li>
                  <li>All parts and passages</li>
                  <li>Results of all candidates who took this test</li>
                  <li>All related assessment data</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div
        role="button"
        onClick={() =>
          onOpen({ type: 'openAssessment', data: { assessment, userRole } })
        }
      >
        <CardHeader className="border-b p-0">
          <AspectRatio ratio={4 / 3}>
            <PlaceholderImage className="rounded-none" asChild />
          </AspectRatio>
        </CardHeader>
        <span className="sr-only">{assessment.name}</span>
        <CardContent className="space-y-1.5 p-4">
          <CardTitle className="line-clamp-1">{assessment.name}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {assessment.sectionType}
            </span>
            <span className="text-xs text-muted-foreground">
              {assessment.totalQuestions} Questions
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
