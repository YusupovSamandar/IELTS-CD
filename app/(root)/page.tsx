import Link from 'next/link';
import { currentUser } from '@/actions/auth/user';
import { checkUserCompletionStatus } from '@/actions/test-exam/check-completion';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { AssessmentCard } from '@/components/assessment-card';
import { ContentSection } from '@/components/content-section';
import {
  PageActions,
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading
} from '@/components/page-header';
import { ActionButton } from '@/components/test-exam/action-button';
import { Button, buttonVariants } from '@/components/ui/button';
import { RootPageClient } from './root-page-client';

const RootPage = async () => {
  const assessments = await db.assessment.findMany({
    orderBy: {
      sectionType: 'asc'
    }
  });
  
  // Sort assessments in the desired order: LISTENING, READING, WRITING
  const sortedAssessments = assessments.sort((a, b) => {
    const order = { 'LISTENING': 1, 'READING': 2, 'WRITING': 3 };
    return (order[a.sectionType as keyof typeof order] || 4) - (order[b.sectionType as keyof typeof order] || 4);
  });
  
  const user = await currentUser();
  const completionStatus = user
    ? await checkUserCompletionStatus()
    : { completed: false };

  console.log('Completion Status:', completionStatus);
  console.log('User:', user?.id);

  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>OPUS</PageHeaderHeading>
        <PageHeaderDescription>
          Welcome to IELTS Simulator
        </PageHeaderDescription>
        <PageActions>
          {user?.role === 'ADMIN' && (
            <ActionButton
              actionType="create"
              editType="createAssessment"
              data={{}}
            >
              <div className={buttonVariants({ variant: 'outline' })}>
                Create Now
              </div>
            </ActionButton>
          )}
        </PageActions>
      </PageHeader>

      {/* Completion Message */}
      {user && completionStatus.completed && (
        <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            Congratulations! 🎉
          </h3>
          <p className="text-green-700 dark:text-green-300">
            You have completed all available assessments. Thank you for taking
            the exam.
          </p>
        </div>
      )}

      {user && <RootPageClient assessments={sortedAssessments} user={user} />}
      <br />
    </div>
  );
};
export default RootPage;
