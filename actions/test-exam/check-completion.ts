'use server';

import { currentUser } from '@/actions/auth/user';
import { db } from '@/lib/db';

export const hasUserCompletedAssessment = async (assessmentId: string) => {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return false;
    }

    // Single optimized query to check completion for all assessment types
    // This combines the assessment lookup with the completion check
    const completionCheck = await db.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        sectionType: true,
        results: {
          where: { userId: user.id },
          select: { id: true },
          take: 1
        },
        userEssays: {
          where: { userId: user.id },
          select: { id: true },
          take: 1
        }
      }
    });

    if (!completionCheck) {
      return false;
    }

    // Check completion based on assessment type
    if (completionCheck.sectionType === 'WRITING') {
      return completionCheck.userEssays.length > 0;
    } else {
      return completionCheck.results.length > 0;
    }
  } catch (error) {
    console.error('Error checking assessment completion:', error);
    return false;
  }
};

export const checkUserCompletionStatus = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return { completed: false, totalCount: 0, completedCount: 0 };
  }

  // Single optimized query to get all assessments with completion status
  const assessmentsWithCompletion = await db.assessment.findMany({
    select: {
      id: true,
      sectionType: true,
      results: {
        where: { userId: user.id },
        select: { id: true },
        take: 1
      },
      userEssays: {
        where: { userId: user.id },
        select: { id: true },
        take: 1
      }
    }
  });

  let completedCount = 0;

  // Check completion for each assessment
  for (const assessment of assessmentsWithCompletion) {
    if (assessment.sectionType === 'WRITING') {
      if (assessment.userEssays.length > 0) completedCount++;
    } else {
      if (assessment.results.length > 0) completedCount++;
    }
  }

  const totalCount = assessmentsWithCompletion.length;

  return {
    completed: completedCount >= totalCount && totalCount > 0,
    totalCount,
    completedCount
  };
};
