'use server';

import { revalidatePath } from 'next/cache';
import { QuestionGroup } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getTotalQuestions } from '@/lib/utils';
import {
  MultiMoreSchema,
  MultiMoreUpdateSchema
} from '@/lib/validations/question-type';

export const createMultiMoreList = async (
  questionGroup: QuestionGroup,
  assessmentId: string
) => {
  const totalQuestions = getTotalQuestions(questionGroup);

  // Each pair of questions represents one multiple choice more answers question
  const numberOfPairs = totalQuestions / 2;
  if (totalQuestions % 2 !== 0) {
    throw new Error(
      'Multiple Choice More Answers requires an even number of questions'
    );
  }

  const totalChoices = 4; // Each question has 4 choices with exactly 2 correct

  await Promise.all(
    Array.from({ length: numberOfPairs }).map(async (_, pairIndex) => {
      const firstQuestionNumber =
        questionGroup.startQuestionNumber + pairIndex * 2;
      const secondQuestionNumber = firstQuestionNumber + 1;

      // Create the first question of the pair
      await db.question.create({
        data: {
          questionNumber: firstQuestionNumber,
          questionGroupId: questionGroup.id,
          correctAnswer: 'Multiple answers expected',
          partId: questionGroup.partId,
          assessmentId: assessmentId,
          multiMore: {
            create: {
              title: `Questions ${firstQuestionNumber}-${secondQuestionNumber}: Choose TWO answers`,
              questionGroupId: questionGroup.id,
              expectedAnswers: ['Option 1', 'Option 2'],
              choices: {
                createMany: {
                  data: Array.from({ length: totalChoices }).map(
                    (_, choiceIndex) => ({
                      content: `Option ${choiceIndex + 1}`,
                      order: choiceIndex,
                      isCorrect: choiceIndex < 2 ? true : false // First 2 options are correct
                    })
                  )
                }
              }
            }
          }
        }
      });

      // Create the second question of the pair (without multiMore - it's handled by the first)
      await db.question.create({
        data: {
          questionNumber: secondQuestionNumber,
          questionGroupId: questionGroup.id,
          correctAnswer: 'Multiple answers expected',
          partId: questionGroup.partId,
          assessmentId: assessmentId
        }
      });
    })
  );
};
export const updateMultiMore = async ({
  formData,
  id
}: {
  formData: z.infer<typeof MultiMoreUpdateSchema>;
  id: string;
}) => {
  const { title, choices } = formData;

  const multiMore = await db.multipleChoiceMoreAnswers.findUnique({
    where: { id },
    select: {
      question: { select: { assessmentId: true } },
      choices: { select: { id: true } }
    }
  });

  if (!multiMore) {
    throw new Error('MultiMore ID not found');
  }

  // Update the title
  await db.multipleChoiceMoreAnswers.update({
    where: { id },
    data: { title }
  });

  // Get existing choice IDs
  const existingChoiceIds = multiMore.choices.map((choice) => choice.id);

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
        where: { multiMoreId: id },
        orderBy: { order: 'desc' },
        select: { order: true }
      });

      await db.choice.create({
        data: {
          content: choice.content,
          isCorrect: choice.isCorrect,
          order: (maxOrder?.order ?? -1) + 1,
          multiMoreId: id
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

  revalidatePath(`/assessments/${multiMore.question.assessmentId}`);
};
