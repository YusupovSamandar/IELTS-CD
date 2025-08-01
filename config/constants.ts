import { QuestionType } from '@prisma/client';

export const MODE = {
  edit: 'edit',
  exam: 'exam'
};

export const CHOICE_OPTIONS = ['A', 'B', 'C', 'D'];

type QuestionTypeStrings = {
  [K in keyof typeof QuestionType]: K;
};
export const QUESTION_TYPE_VALUE: QuestionTypeStrings = {
  COMPLETION: 'COMPLETION',
  IDENTIFYING_INFORMATION: 'IDENTIFYING_INFORMATION',
  YES_NO_NOT_GIVEN: 'YES_NO_NOT_GIVEN',
  TABLE_COMPLETION: 'TABLE_COMPLETION',
  MULTIPLE_CHOICE_ONE_ANSWER: 'MULTIPLE_CHOICE_ONE_ANSWER',
  MULTIPLE_CHOICE_MORE_ANSWERS: 'MULTIPLE_CHOICE_MORE_ANSWERS',
  LETTER_ANSWER: 'LETTER_ANSWER'
};
