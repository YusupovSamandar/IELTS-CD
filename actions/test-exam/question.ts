'use server';

import { QuestionType } from '@prisma/client';
import { db } from '@/lib/db';

export const getCorrectAnswerByQuestionId = async (id: string) => {
  const question = await db.question.findUnique({
    where: { id },
    select: { correctAnswer: true }
  });
  if (!question) {
    throw new Error('Question Id Not FOund');
  }
  return question.correctAnswer;
};

export const getIdentifyInfoByQuestionId = async (questionId: string) => {
  const identifyInfo = await db.identifyingInformation.findUnique({
    where: { questionId },
    select: { choiceCorrect: true }
  });
  if (!identifyInfo) {
    throw new Error('IdentifyInfo not found for questionId');
  }
  return identifyInfo.choiceCorrect;
};
export const updateRespond = async ({
  questionId,
  respond
}: {
  questionId: string;
  respond: string;
}) => {
  await db.question.update({
    where: { id: questionId },
    data: { respond }
  });
};

export const getQuestion = async ({
  assessmentId,
  questionNumber
}: {
  assessmentId: string;
  questionNumber: number;
}) => {
  const question = await db.question.findUnique({
    where: {
      assessmentId_questionNumber: {
        assessmentId,
        questionNumber
      }
    }
  });
  if (!question) {
    throw new Error('Assessment Id or Question Number wrong');
  }
  return question;
};
