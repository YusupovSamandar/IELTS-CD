import { IdentifyChoice } from '@prisma/client';
import { z } from 'zod';

export const ChoiceSchema = z.object({
  content: z.string().min(1, {
    message: 'Content Choice is required'
  }),
  isCorrect: z.boolean()
});

export const MultiOneSchema = z.object({
  title: z.string().min(1, {
    message: 'Title Multiple Choice is required'
  }),
  choiceId: z.string()
});

export const MultiOneUpdateSchema = z.object({
  title: z.string().min(1, {
    message: 'Title Multiple Choice is required'
  }),
  choices: z
    .array(
      z.object({
        id: z.string().optional(),
        content: z.string().min(1, { message: 'Choice content is required' }),
        isCorrect: z.boolean()
      })
    )
    .min(3, { message: 'At least 3 choices are required' })
    .refine(
      (choices) => {
        const correctChoices = choices.filter((choice) => choice.isCorrect);
        return correctChoices.length === 1;
      },
      {
        message: 'Exactly 1 choice must be marked as correct',
        path: ['choices']
      }
    )
});

export const MultiMoreSchema = z.object({
  title: z.string().min(1, {
    message: 'Title Multiple Choice is required'
  }),
  choiceIdList: z.array(z.string())
});

export const MultiMoreUpdateSchema = z.object({
  title: z.string().min(1, {
    message: 'Title Multiple Choice is required'
  }),
  choices: z
    .array(
      z.object({
        id: z.string().optional(),
        content: z.string().min(1, { message: 'Choice content is required' }),
        isCorrect: z.boolean()
      })
    )
    .min(3, { message: 'At least 3 choices are required' })
    .refine(
      (choices) => {
        const correctChoices = choices.filter((choice) => choice.isCorrect);
        return correctChoices.length === 2;
      },
      {
        message: 'Exactly 2 choices must be marked as correct',
        path: ['choices']
      }
    )
});

export const IdentifyInfoSchema = z.object({
  title: z.string().min(1),
  choiceCorrect: z.enum([
    IdentifyChoice.TRUE,
    IdentifyChoice.FALSE,
    IdentifyChoice.NOT_GIVEN
  ])
});

export const CompletionAnswerSchema = z.object({
  questions: z.array(
    z.object({
      correctAnswer: z.string()
    })
  )
});
