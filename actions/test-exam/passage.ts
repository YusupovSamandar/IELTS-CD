'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  PassageMultiHeadingSchema,
  PassageSchema
} from '@/lib/validations/text-exam';
import { getAssessmentIdByPartId } from './assessment';

export const createPassageSimple = async ({
  title,
  partId
}: {
  title: string;
  partId: string;
}) => {
  await db.passage.create({
    data: {
      title,
      content: 'This is example for simple passage',
      partId,
      description: 'this is description',
      type: 'PASSAGE_SIMPLE'
    }
  });
};
export const createPassageMultiHeading = async ({
  title,
  partId
}: {
  title: string;
  partId: string;
}) => {
  const numberHeading = 5;
  await db.passage.create({
    data: {
      title,
      content: 'This is example for simple passage',
      partId,
      description: 'this is description',
      type: 'PASSAGE_MULTI_HEADING',
      passageHeadingList: {
        createMany: {
          data: Array.from({ length: numberHeading }).map((_, i) => ({
            title: `Title for Heading ${i + 1}`,
            content: 'this is Example for create multiple heading',
            order: i
          }))
        }
      }
    }
  });
};
export const createPassage = async ({
  formData,
  partId
}: {
  formData: z.infer<typeof PassageSchema>;
  partId: string;
}) => {
  const assessmentId = await getAssessmentIdByPartId(partId);

  const { type, title } = formData;
  if (type === 'PASSAGE_SIMPLE') {
    await createPassageSimple({ title, partId });
  }
  if (type === 'PASSAGE_MULTI_HEADING') {
    await createPassageMultiHeading({ title, partId });
  }
  revalidatePath(`/assessments/${assessmentId}`);
};

export const updatePassageHeading = async ({
  formData,
  id
}: {
  formData: z.infer<typeof PassageMultiHeadingSchema>;
  id: string;
}) => {
  const passageHeading = await db.passageHeading.findUnique({
    where: {
      id
    },
    select: {
      passage: {
        select: {
          part: {
            select: {
              assessmentId: true
            }
          }
        }
      }
    }
  });
  if (!passageHeading) {
    throw new Error('Passage heading not found, please try again.');
  }
  await db.passageHeading.update({
    where: {
      id
    },
    data: formData
  });
  revalidatePath(`/assessments/${passageHeading.passage.part.assessmentId}`);
  return;
};

export const updatePassage = async ({
  formData,
  id
}: {
  formData: z.infer<typeof PassageSchema>;
  id: string;
}) => {
  const passage = await db.passage.findUnique({
    where: { id },
    select: { part: { select: { assessmentId: true } } }
  });
  if (!passage) {
    throw new Error('Passage Id Not Found');
  }
  await db.passage.update({
    where: { id },
    data: { ...formData }
  });
  revalidatePath(`/assessments/${passage.part.assessmentId}`);
};

export const deletePassage = async (passageId: string) => {
  const passage = await db.passage.findUnique({
    where: { id: passageId },
    select: { part: { select: { assessmentId: true } } }
  });

  if (!passage) {
    throw new Error('Passage not found');
  }

  await db.passage.delete({
    where: { id: passageId }
  });

  revalidatePath(`/assessments/${passage.part.assessmentId}`);
};

export const createPassageHeading = async (passageId: string) => {
  const passage = await db.passage.findUnique({
    where: { id: passageId },
    select: {
      part: { select: { assessmentId: true } },
      passageHeadingList: {
        select: { order: true },
        orderBy: { order: 'desc' },
        take: 1
      }
    }
  });

  if (!passage) {
    throw new Error('Passage not found');
  }

  // Get the next order number
  const nextOrder =
    passage.passageHeadingList.length > 0
      ? passage.passageHeadingList[0].order + 1
      : 0;

  // Calculate the letter for the heading (A, B, C, etc.)
  const headingLetter = String.fromCharCode(65 + nextOrder); // A=65, B=66, etc.

  await db.passageHeading.create({
    data: {
      title: `Paragraph ${headingLetter}`,
      content: 'Enter your paragraph content here...',
      order: nextOrder,
      passageId
    }
  });

  revalidatePath(`/assessments/${passage.part.assessmentId}`);
};

export const deletePassageHeading = async (headingId: string) => {
  const heading = await db.passageHeading.findUnique({
    where: { id: headingId },
    select: {
      passage: { select: { part: { select: { assessmentId: true } } } }
    }
  });

  if (!heading) {
    throw new Error('Passage heading not found');
  }

  await db.passageHeading.delete({
    where: { id: headingId }
  });

  revalidatePath(`/assessments/${heading.passage.part.assessmentId}`);
};
