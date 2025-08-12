'use server';

import { revalidatePath } from 'next/cache';
import { QuestionGroup } from '@prisma/client';
import { z } from 'zod';
import { CHOICE_OPTIONS } from '@/config/constants';
import { db } from '@/lib/db';
import { getTotalQuestions } from '@/lib/utils';
import {
  MultiOneSchema,
  MultiOneUpdateSchema
} from '@/lib/validations/question-type';

export const createMultiOneList = async (
  questionGroup: QuestionGroup,
  assessmentId: string
) => {
  const totalQuestions = getTotalQuestions(questionGroup);

  // Use Promise.all to wait for all questions to be created
  await Promise.all(
    Array.from({ length: totalQuestions }).map(
      async (_, questionIndex) =>
        await db.question.create({
          data: {
            questionNumber: questionGroup.startQuestionNumber + questionIndex,
            questionGroupId: questionGroup.id,
            correctAnswer: CHOICE_OPTIONS[0],
            partId: questionGroup.partId,
            assessmentId: assessmentId,
            multiOne: {
              create: {
                title: 'This is title for multi one question',
                questionGroupId: questionGroup.id,
                choices: {
                  createMany: {
                    data: Array.from({ length: CHOICE_OPTIONS.length }).map(
                      (_, choiceIndex) => ({
                        content: `Option ${choiceIndex + 1}`,
                        order: choiceIndex,
                        isCorrect: choiceIndex === 0 ? true : false
                      })
                    )
                  }
                }
              }
            }
          }
        })
    )
  );
};

export const updateMultiOne = async ({
  formData,
  id
}: {
  formData: z.infer<typeof MultiOneUpdateSchema>;
  id: string;
}) => {
  const { title, choices } = formData;

  const multiOne = await db.multipleChoiceOneAnswer.findUnique({
    where: { id },
    select: {
      question: { select: { assessmentId: true } },
      choices: { select: { id: true } }
    }
  });

  if (!multiOne) {
    throw new Error('MultiOne ID not found');
  }

  // Update the title
  await db.multipleChoiceOneAnswer.update({
    where: { id },
    data: { title }
  });

  // Get existing choice IDs
  const existingChoiceIds = multiOne.choices.map((choice) => choice.id);

  // Process each choice
  for (const choice of choices) {
    if (choice.id && existingChoiceIds.includes(choice.id)) {
      // Update existing choice
      await db.choice.update({
        where: { id: choice.id },
        data: {
          content: choice.content,
          isCorrect: choice.isCorrect
        }
      });
    } else {
      // Create new choice
      const maxOrder = await db.choice.findFirst({
        where: { multiOneId: id },
        orderBy: { order: 'desc' },
        select: { order: true }
      });

      await db.choice.create({
        data: {
          content: choice.content,
          isCorrect: choice.isCorrect,
          order: (maxOrder?.order ?? -1) + 1,
          multiOneId: id
        }
      });
    }
  }

  // Delete choices that are no longer in the form
  const submittedChoiceIds = choices.filter((c) => c.id).map((c) => c.id);
  const choicesToDelete = existingChoiceIds.filter(
    (id) => !submittedChoiceIds.includes(id)
  );

  if (choicesToDelete.length > 0) {
    await db.choice.deleteMany({
      where: {
        id: { in: choicesToDelete }
      }
    });
  }

  revalidatePath(`/assessments/${multiOne.question.assessmentId}`);
};
export const isChoiceCorrect = async (choiceId: string) => {
  const choice = await db.choice.findUnique({
    where: {
      id: choiceId
    },
    select: {
      isCorrect: true
    }
  });

  if (!choice) {
    throw new Error('Choice Id not found');
  }

  return choice.isCorrect;
};
