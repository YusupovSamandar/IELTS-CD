'use client';

import { useContext, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasUserCompletedAssessment } from '@/actions/test-exam/check-completion';
import { CheckCircle, Edit3, Play } from 'lucide-react';
import { ExamContext } from '@/global/exam-context';
import { useEditHook } from '@/global/use-edit-hook';
import { MODE } from '@/config/constants';
import { createUrl } from '@/lib/utils';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

function OpenAssessmentModal() {
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(true);
  const [completionCache, setCompletionCache] = useState<
    Record<string, boolean>
  >({});
  const { setMode } = useContext(ExamContext);
  const router = useRouter();
  const { isOpen, data, type, onClose } = useEditHook();
  const isModalOpen = isOpen && type === 'openAssessment';
  const assessment = data?.assessment;
  const userRole = data?.userRole || 'USER';

  // Check if assessment has been completed with caching
  useEffect(() => {
    if (assessment && isModalOpen) {
      // Check cache first
      if (completionCache[assessment.id] !== undefined) {
        setIsCompleted(completionCache[assessment.id]);
        setCheckingCompletion(false);
        return;
      }

      setCheckingCompletion(true);
      hasUserCompletedAssessment(assessment.id)
        .then((completed) => {
          setIsCompleted(completed);
          // Cache the result
          setCompletionCache((prev) => ({
            ...prev,
            [assessment.id]: completed
          }));
        })
        .catch(() => setIsCompleted(false))
        .finally(() => setCheckingCompletion(false));
    }
  }, [assessment, isModalOpen, completionCache]);

  if (!assessment || !isModalOpen) {
    return null;
  }

  const canEdit = userRole === 'ADMIN';
  const canTakeExam = userRole === 'ADMIN' || !isCompleted; // Admin can always access, users only if not completed

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-semibold">
            {assessment.name}
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {assessment.sectionType}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {assessment.totalQuestions} Questions
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Choose how you want to proceed with this assessment
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          {checkingCompletion ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Checking assessment status...
              </p>
            </div>
          ) : isCompleted && userRole === 'USER' ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <div className="font-semibold text-lg">Assessment Completed</div>
              <p className="text-sm text-muted-foreground mt-1">
                You have already completed this assessment
              </p>
            </div>
          ) : (
            <>
              {canTakeExam && (
                <Button
                  size="lg"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(() => {
                      const newSearchParams = new URLSearchParams();
                      newSearchParams.set('mode', MODE.exam);
                      const pathname = `/assessments/${assessment.id}`;
                      router.push(createUrl(pathname, newSearchParams));
                      onClose();
                    });
                  }}
                  className="w-full justify-start gap-3 h-12"
                >
                  <Play className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">
                      {userRole === 'ADMIN' ? 'Simulation Mode' : 'Start Exam'}
                    </div>
                    <div className="text-xs opacity-80">
                      {userRole === 'ADMIN'
                        ? 'Take the test in simulation mode'
                        : 'Begin your assessment'}
                    </div>
                  </div>
                </Button>
              )}

              {canEdit && (
                <Button
                  size="lg"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(() => {
                      const newSearchParams = new URLSearchParams();
                      newSearchParams.set('mode', MODE.edit);
                      const pathname = `/assessments/${assessment.id}`;
                      router.push(createUrl(pathname, newSearchParams));
                      onClose();
                    });
                  }}
                  className="w-full justify-start gap-3 h-12"
                >
                  <Edit3 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Edit Mode</div>
                    <div className="text-xs opacity-70">
                      Modify questions and content
                    </div>
                  </div>
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OpenAssessmentModal;
