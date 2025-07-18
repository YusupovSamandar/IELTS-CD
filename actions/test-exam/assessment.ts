'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { currentRole } from '@/actions/auth/user';
import { z } from 'zod';
import { MODE } from '@/config/constants';
import { db } from '@/lib/db';
import { createUrl } from '@/lib/utils';
import { AssessmentSchema } from '@/lib/validations/text-exam';

export const createAssessment = async ({
  formData
}: {
  formData: z.infer<typeof AssessmentSchema>;
}) => {
  const { name, sectionType } = formData;

  if (sectionType === 'WRITING') {
    // Writing assessment setup - 2 parts only
    const assessment = await db.assessment.create({
      data: {
        name: name!,
        sectionType,
        totalQuestions: 2, // Writing has 2 tasks
        duration: 3600, // 60 minutes
        parts: {
          create: Array.from({ length: 2 }).map((_, i) => ({
            title: `Part ${i + 1}`,
            description: i === 0 ? 'Writing Task 1' : 'Writing Task 2',
            order: i
          }))
        }
      },
      include: {
        parts: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    // Create essay parts and link them to the corresponding parts
    for (let i = 0; i < 2; i++) {
      await db.essayPart.create({
        data: {
          assessmentId: assessment.id,
          partId: assessment.parts[i].id,
          partNumber: i + 1,
          topic: `Writing Task ${i + 1}`,
          title: i === 0 ? 'Report Writing' : 'Essay Writing',
          description:
            i === 0
              ? 'Write a report based on the given information'
              : 'Write an essay on the given topic',
          maxWords: i === 0 ? 150 : 250
        }
      });
    }

    const newSearchParams = new URLSearchParams();
    newSearchParams.set('mode', MODE.edit);
    const pathname = `/assessments/${assessment.id}`;
    redirect(createUrl(pathname, newSearchParams));
  } else {
    // Reading/Listening assessment setup
    const isListening = sectionType === 'LISTENING';
    const numParts = isListening ? 4 : 3;
    const duration = isListening ? 30 * 60 : 60 * 60; // 30 minutes for listening, 60 for reading

    const assessment = await db.assessment.create({
      data: {
        name: name!,
        sectionType,
        totalQuestions: 40,
        duration,
        parts: {
          create: Array.from({ length: numParts }).map((_, i) => ({
            title: `Part ${i + 1}`,
            description: 'Part Description',
            order: i
          }))
        }
      }
    });

    const newSearchParams = new URLSearchParams();
    newSearchParams.set('mode', MODE.edit);
    const pathname = `/assessments/${assessment.id}`;
    redirect(createUrl(pathname, newSearchParams));
  }
};
export async function getAssessmentIdByQuestionGroupId(
  questionGroupId: string
) {
  const questionGroup = await db.questionGroup.findUnique({
    where: {
      id: questionGroupId
    },
    select: {
      part: {
        select: {
          assessmentId: true
        }
      }
    }
  });

  if (!questionGroup) {
    throw new Error('Question Group Id Not found');
  }

  return questionGroup.part.assessmentId;
}

export async function getAssessmentIdByPartId(partId: string) {
  const part = await db.part.findUnique({
    where: {
      id: partId
    },
    select: {
      assessmentId: true
    }
  });

  if (!part) {
    throw new Error('Part Id Not found');
  }

  return part.assessmentId;
}
export async function publicAssessment(assessmentId: string) {
  await db.assessment.update({
    where: {
      id: assessmentId
    },
    data: {
      isPublic: true
    }
  });
}

export const deleteAssessment = async (assessmentId: string) => {
  const role = await currentRole();

  if (role !== 'ADMIN') {
    throw new Error('Unauthorized: Only admins can delete assessments');
  }

  if (!assessmentId) {
    throw new Error('Assessment ID is required');
  }

  // Check if assessment exists
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          questions: true,
          parts: true
        }
      }
    }
  });

  if (!assessment) {
    throw new Error('Assessment not found');
  }

  // Delete the assessment - Prisma will cascade delete all related data
  await db.assessment.delete({
    where: { id: assessmentId }
  });

  // Revalidate the pages that show assessments
  revalidatePath('/');
  revalidatePath('/dashboard/admin');

  return {
    success: true,
    message: `Assessment "${assessment.name}" and all related data have been deleted successfully`
  };
};
