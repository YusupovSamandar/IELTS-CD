'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { currentUser } from '@/actions/auth/user';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';

export const submitWritingEssay = async ({
  assessmentId,
  part1Result,
  part2Result
}: {
  assessmentId: string;
  part1Result?: string;
  part2Result?: string;
}) => {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  // Check if user has already submitted this essay
  const existingEssay = await db.userEssay.findUnique({
    where: {
      userId_assessmentId: {
        userId: user.id,
        assessmentId
      }
    }
  });

  if (existingEssay) {
    // Redirect to home page instead of throwing error
    redirect('/');
  }

  // Create user essay submission
  await db.userEssay.create({
    data: {
      userId: user.id,
      assessmentId,
      part1Result: part1Result || '',
      part2Result: part2Result || '',
      isAssessed: false
    }
  });

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

export const getUserEssaysForTeacher = async () => {
  const user = await currentUser();

  if (!user || user.role !== UserRole.TEACHER) {
    throw new Error('Unauthorized: Only teachers can access this');
  }

  // Get all unassigned essays and essays assigned to this teacher
  return await db.userEssay.findMany({
    where: {
      OR: [
        { teacherId: null }, // Unassigned essays
        { teacherId: user.id } // Essays assigned to this teacher
      ]
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      assessment: {
        select: {
          name: true,
          sectionType: true
        }
      },
      teacher: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const takeEssayForAssessment = async (essayId: string) => {
  const user = await currentUser();

  if (!user || user.role !== UserRole.TEACHER) {
    throw new Error('Unauthorized: Only teachers can take essays');
  }

  // Check if essay is already taken
  const essay = await db.userEssay.findUnique({
    where: { id: essayId }
  });

  if (!essay) {
    throw new Error('Essay not found');
  }

  if (essay.teacherId && essay.teacherId !== user.id) {
    throw new Error('Already taken by another teacher');
  }

  // Assign essay to teacher
  await db.userEssay.update({
    where: { id: essayId },
    data: { teacherId: user.id }
  });

  revalidatePath('/teacher');
};

export const assessEssay = async ({
  essayId,
  score
}: {
  essayId: string;
  score: number;
}) => {
  const user = await currentUser();

  if (!user || user.role !== UserRole.TEACHER) {
    throw new Error('Unauthorized: Only teachers can assess essays');
  }

  // Validate score range
  if (score < 1 || score > 9) {
    throw new Error('Score must be between 1 and 9');
  }

  // Check if teacher owns this essay
  const essay = await db.userEssay.findUnique({
    where: { id: essayId }
  });

  if (!essay || essay.teacherId !== user.id) {
    throw new Error('You can only assess essays assigned to you');
  }

  await db.userEssay.update({
    where: { id: essayId },
    data: {
      score,
      isAssessed: true
    }
  });

  revalidatePath('/teacher');
};

export const getNextEssayForTeacher = async (currentEssayId: string) => {
  const user = await currentUser();

  if (!user || user.role !== UserRole.TEACHER) {
    throw new Error('Unauthorized: Only teachers can access this');
  }

  // Get the next unassessed essay assigned to this teacher
  const nextEssay = await db.userEssay.findFirst({
    where: {
      teacherId: user.id,
      isAssessed: false,
      id: { not: currentEssayId }
    },
    select: {
      id: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return nextEssay;
};
