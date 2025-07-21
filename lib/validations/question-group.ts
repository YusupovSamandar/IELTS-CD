import { QuestionType } from '@prisma/client';
import { z } from 'zod';

export type QuestionGroupSchemaType = {
  title: string;
  description?: string;
  type: QuestionType;
  startQuestionNumber: number;
  endQuestionNumber: number;
  additionalLetterOptions?: string;
} & (
  | {
      type: Exclude<QuestionType, 'TABLE_COMPLETION'>;
      numberColumns?: never;
      numberRows?: never;
    }
  | {
      type: 'TABLE_COMPLETION';
      numberColumns: number;
      numberRows: number;
    }
);

export const QuestionGroupSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    type: z.enum([
      QuestionType.MULTIPLE_CHOICE_ONE_ANSWER,
      QuestionType.MULTIPLE_CHOICE_MORE_ANSWERS,
      QuestionType.IDENTIFYING_INFORMATION,
      QuestionType.YES_NO_NOT_GIVEN,
      QuestionType.COMPLETION,
      QuestionType.TABLE_COMPLETION,
      QuestionType.LETTER_ANSWER
    ]),
    numberColumns: z.coerce.number().optional(),
    numberRows: z.coerce.number().optional(),
    startQuestionNumber: z.coerce.number().min(1),
    endQuestionNumber: z.coerce.number().min(1),
    additionalLetterOptions: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.endQuestionNumber < data.startQuestionNumber) {
        return false;
      }

      return true;
    },
    {
      message: 'End question must be greater than or equal to start question',
      path: ['endQuestionNumber']
    }
  )
  .refine(
    (data) => {
      if (data.endQuestionNumber > 40) {
        return false;
      }
      return true;
    },
    {
      message: 'in Reading section The endQuestionNumber must be 40 or fewer.',
      path: ['endQuestionNumber']
    }
  )
  .refine(
    (data) => {
      if (
        data.type === QuestionType.TABLE_COMPLETION &&
        (typeof data.numberColumns !== 'number' ||
          typeof data.numberRows !== 'number')
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        'For TABLE_COMPLETION type, numberColumns and numberRows must be provided',
      path: ['type']
    }
  )
  .refine(
    (data) => {
      if (data.type === QuestionType.MULTIPLE_CHOICE_MORE_ANSWERS) {
        const totalQuestions =
          data.endQuestionNumber - data.startQuestionNumber + 1;
        if (totalQuestions % 2 !== 0) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        'Multiple Choice More Answers requires an even number of questions (questions are paired: 5-6, 7-8, etc.)',
      path: ['endQuestionNumber']
    }
  );
