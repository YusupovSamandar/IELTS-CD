'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { EssayPartSchema } from '@/lib/validations/text-exam';

export const updateEssayPart = async ({
  formData,
  id
}: {
  formData: z.infer<typeof EssayPartSchema>;
  id: string;
}) => {
  const essayPart = await db.essayPart.findUnique({
    where: { id },
    select: { assessmentId: true }
  });

  if (!essayPart) {
    throw new Error('Essay Part not found');
  }

  await db.essayPart.update({
    where: { id },
    data: formData
  });

  revalidatePath(`/assessments/${essayPart.assessmentId}`);
};

export const getEssayPartsByAssessmentId = async (assessmentId: string) => {
  return await db.essayPart.findMany({
    where: { assessmentId },
    orderBy: { partNumber: 'asc' }
  });
};
