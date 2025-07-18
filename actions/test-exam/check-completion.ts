'use server';

import { currentUser } from '@/actions/auth/user';
import { db } from '@/lib/db';

export const hasUserCompletedAssessment = async (assessmentId: string) => {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return false;
    }

    // Check if assessment is a writing assessment
    const assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      select: { sectionType: true }
    });

    if (!assessment) {
      return false;
    }

    // For writing assessments, check UserEssay table
    if (assessment.sectionType === 'WRITING') {
      const userEssay = await db.userEssay.findUnique({
        where: {
          userId_assessmentId: {
            userId: user.id,
            assessmentId: assessmentId
          }
        }
      });
      return !!userEssay;
    }

    // For other assessments, check Result table
    const result = await db.$queryRaw`
      SELECT id FROM "Result" 
      WHERE "userId" = ${user.id} AND "assessmentId" = ${assessmentId}
      LIMIT 1
    `;

    return Array.isArray(result) && result.length > 0;
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

  // Get all public assessments with their types
  const allAssessments = await db.assessment.findMany({
    where: {},
    select: { id: true, sectionType: true }
  });

  let completedCount = 0;

  // Check completion for each assessment individually
  for (const assessment of allAssessments) {
    if (assessment.sectionType === 'WRITING') {
      // Check UserEssay table for writing assessments
      const userEssay = await db.userEssay.findUnique({
        where: {
          userId_assessmentId: {
            userId: user.id,
            assessmentId: assessment.id
          }
        }
      });
      if (userEssay) completedCount++;
    } else {
      // Check Result table for other assessments
      const result = await db.$queryRaw`
        SELECT id FROM "Result" 
        WHERE "userId" = ${user.id} AND "assessmentId" = ${assessment.id}
        LIMIT 1
      `;
      if (Array.isArray(result) && result.length > 0) completedCount++;
    }
  }

  const totalCount = allAssessments.length;

  return {
    completed: completedCount >= totalCount && totalCount > 0,
    totalCount,
    completedCount
  };
};
