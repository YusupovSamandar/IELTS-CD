'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { currentUser } from '@/actions/auth/user';
import { db } from '@/lib/db';

export const createOrUpdateResult = async ({
  score,
  timeSpent,
  totalCorrectAnswers,
  assessmentId
}: {
  score: number;
  assessmentId: string;
  timeSpent: number;
  totalCorrectAnswers: number;
}) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  // Check if result exists for this user and assessment
  const existingResult = await db.$queryRaw`
    SELECT id FROM "Result" 
    WHERE "userId" = ${user.id} AND "assessmentId" = ${assessmentId}
    LIMIT 1
  `;

  if (Array.isArray(existingResult) && existingResult.length > 0) {
    // Update existing result
    await db.$executeRaw`
      UPDATE "Result" 
      SET "timeSpent" = ${timeSpent}, 
          "score" = ${score}, 
          "totalCorrectAnswers" = ${totalCorrectAnswers},
          "updatedAt" = NOW()
      WHERE "userId" = ${user.id} AND "assessmentId" = ${assessmentId}
    `;
  } else {
    // Create new result
    await db.$executeRaw`
      INSERT INTO "Result" ("id", "timeSpent", "score", "totalCorrectAnswers", "userId", "assessmentId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, ${timeSpent}, ${score}, ${totalCorrectAnswers}, ${user.id}, ${assessmentId}, NOW(), NOW())
    `;
  }

  // Check if user has completed all assessments
  const totalAssessments = await db.$queryRaw`
    SELECT COUNT(*) as count FROM "Assessment" WHERE "isPublic" = true
  `;

  // Count both regular results and writing essay submissions
  const userCompletedResults = await db.$queryRaw`
    SELECT COUNT(*) as count FROM "Result" 
    WHERE "userId" = ${user.id}
  `;

  const userCompletedEssays = await db.$queryRaw`
    SELECT COUNT(*) as count FROM "UserEssay" 
    WHERE "userId" = ${user.id}
  `;

  const totalCount =
    Array.isArray(totalAssessments) && totalAssessments.length > 0
      ? Number(totalAssessments[0].count)
      : 0;
  const completedResultsCount =
    Array.isArray(userCompletedResults) && userCompletedResults.length > 0
      ? Number(userCompletedResults[0].count)
      : 0;
  const completedEssaysCount =
    Array.isArray(userCompletedEssays) && userCompletedEssays.length > 0
      ? Number(userCompletedEssays[0].count)
      : 0;

  const totalCompletedCount = completedResultsCount + completedEssaysCount;

  revalidatePath('/');

  // Always return completion status, let client handle display
  return {
    completed: totalCompletedCount >= totalCount,
    totalCount,
    completedCount: totalCompletedCount
  };
};

export const getResultByAssessmentId = async (assessmentId: string) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const result = await db.$queryRaw`
    SELECT r.*, a.name as "assessmentTitle", a."totalQuestions" as "maxScore"
    FROM "Result" r
    JOIN "Assessment" a ON r."assessmentId" = a.id
    WHERE r."userId" = ${user.id} AND r."assessmentId" = ${assessmentId}
    LIMIT 1
  `;

  return Array.isArray(result) && result.length > 0 ? result[0] : null;
};
