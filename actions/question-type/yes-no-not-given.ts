'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { IdentifyChoice, QuestionGroup } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTotalQuestions } from '@/lib/utils';
import { YesNoNotGivenSchema } from '@/lib/validations/question-type';

export const createYesNoNotGivenList = async (
  questionGroup: QuestionGroup,
  assessmentId: string
) => {
  const totalQuestions = getTotalQuestions(questionGroup);
  Array.from({ length: totalQuestions }).map(
    async (_, questionIndex) =>
      await db.question.create({
        data: {
          questionNumber: questionGroup.startQuestionNumber + questionIndex,
          questionGroupId: questionGroup.id,
          correctAnswer: 'TRUE',
          partId: questionGroup.partId,
          assessmentId: assessmentId,
          yesNoNotGiven: {
            create: {
              questionGroupId: questionGroup.id,
              title: 'This is title for yes/no/not given question',
              choiceCorrect: IdentifyChoice.TRUE
            }
          }
        }
      })
  );
};

export const updateYesNoNotGiven = async ({
  formData,
  id
}: {
  formData: z.infer<typeof YesNoNotGivenSchema>;
  id: string;
}) => {
  const yesNoNotGiven = await db.yesNoNotGiven.findUnique({
    where: { id },
    select: { question: { select: { assessmentId: true } } }
  });
  if (!yesNoNotGiven) {
    throw new Error('YesNoNotGiven Id not found');
  }

  await db.yesNoNotGiven.update({
    where: { id },
    data: {
      ...formData
    }
  });
  revalidatePath(`/assessments/${yesNoNotGiven.question.assessmentId}`);
  revalidatePath(
    `/assessments/${yesNoNotGiven.question.assessmentId}`,
    'layout'
  );
  revalidatePath(`/assessments/${yesNoNotGiven.question.assessmentId}`, 'page');
  revalidateTag(`assessment-${yesNoNotGiven.question.assessmentId}`);
  revalidateTag('assessments');
};
