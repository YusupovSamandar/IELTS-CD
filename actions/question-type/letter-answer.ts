'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getTotalQuestions } from '@/lib/utils';

export interface LetterAnswerData {
  questionGroupId: string;
  questionId: string;
  title: string;
  correctLetter: string;
}

export const createLetterAnswer = async (data: LetterAnswerData) => {
  try {
    const { questionGroupId, questionId, title, correctLetter } = data;

    // Updated validation to allow alphanumeric characters
    const cleanAnswer = correctLetter.trim().toUpperCase();
    if (cleanAnswer.length === 0) {
      return { error: 'Answer is required' };
    }

    // Allow letters and numbers, but no special characters
    if (!/^[A-Z0-9]+$/.test(cleanAnswer)) {
      return { error: 'Answer must contain only letters and numbers' };
    }

    const letterAnswer = await db.letterAnswer.create({
      data: {
        questionGroupId,
        questionId,
        title,
        correctLetter: cleanAnswer
      }
    });

    revalidatePath('/dashboard');
    return {
      success: 'Letter answer created successfully',
      data: letterAnswer
    };
  } catch (error) {
    console.error('Error creating letter answer:', error);
    return { error: 'Failed to create letter answer' };
  }
};

export const updateLetterAnswer = async (
  id: string,
  data: Partial<LetterAnswerData>
) => {
  try {
    const updateData: any = { ...data };

    // Updated validation to allow alphanumeric characters
    if (data.correctLetter) {
      const cleanAnswer = data.correctLetter.trim().toUpperCase();
      if (cleanAnswer.length === 0) {
        return { error: 'Answer is required' };
      }

      // Allow letters and numbers, but no special characters
      if (!/^[A-Z0-9]+$/.test(cleanAnswer)) {
        return { error: 'Answer must contain only letters and numbers' };
      }
      updateData.correctLetter = cleanAnswer;
    }

    const letterAnswer = await db.letterAnswer.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/dashboard');
    return {
      success: 'Letter answer updated successfully',
      data: letterAnswer
    };
  } catch (error) {
    console.error('Error updating letter answer:', error);
    return { error: 'Failed to update letter answer' };
  }
};

export const deleteLetterAnswer = async (id: string) => {
  try {
    await db.letterAnswer.delete({
      where: { id }
    });

    revalidatePath('/dashboard');
    return { success: 'Letter answer deleted successfully' };
  } catch (error) {
    console.error('Error deleting letter answer:', error);
    return { error: 'Failed to delete letter answer' };
  }
};

export const getLetterAnswer = async (questionId: string) => {
  try {
    const letterAnswer = await db.letterAnswer.findUnique({
      where: { questionId }
    });

    return { data: letterAnswer };
  } catch (error) {
    console.error('Error fetching letter answer:', error);
    return { error: 'Failed to fetch letter answer' };
  }
};

export const getLetterAnswersByQuestionGroup = async (
  questionGroupId: string
) => {
  try {
    const letterAnswers = await db.letterAnswer.findMany({
      where: { questionGroupId },
      include: {
        question: true
      }
    });

    return { data: letterAnswers };
  } catch (error) {
    console.error('Error fetching letter answers:', error);
    return { error: 'Failed to fetch letter answers' };
  }
};

export const createLetterAnswerList = async (
  questionGroup: any,
  assessmentId: string
) => {
  try {
    const totalQuestions = getTotalQuestions(questionGroup);

    // Create a paragraph structure similar to completion but with letter inputs
    const letterAnswerInitial = Array.from(
      { length: totalQuestions },
      (_, i) => ({
        type: 'paragraph',
        children: [
          {
            text: `Question ${questionGroup.startQuestionNumber + i}: Choose the correct letter `
          },
          {
            type: 'letterBlank',
            children: [{ text: 'A' }],
            questionNumber: questionGroup.startQuestionNumber + i
          },
          { text: ' for this answer.' }
        ]
      })
    );

    // Create questions and letter answers for each question
    const promises = Array.from({ length: totalQuestions }).map(
      async (_, questionIndex) => {
        const question = await db.question.create({
          data: {
            questionNumber: questionGroup.startQuestionNumber + questionIndex,
            questionGroupId: questionGroup.id,
            correctAnswer: 'A', // Default letter
            partId: questionGroup.partId,
            assessmentId: assessmentId
          }
        });

        // Create the letter answer for this question with paragraph for the first one
        return await db.letterAnswer.create({
          data: {
            questionGroupId: questionGroup.id,
            questionId: question.id,
            title: `Question ${question.questionNumber}`,
            paragraph:
              questionIndex === 0 ? JSON.stringify(letterAnswerInitial) : null, // Only first one gets paragraph
            correctLetter: 'A' // Default letter, can be changed later
          }
        });
      }
    );

    await Promise.all(promises);

    return { success: 'Letter answers created successfully' };
  } catch (error) {
    console.error('Error creating letter answer list:', error);
    return { error: 'Failed to create letter answers' };
  }
};

export const updateLetterAnswerParagraph = async ({
  letterAnswerId,
  paragraph
}: {
  letterAnswerId: string;
  paragraph: string;
}) => {
  try {
    console.log(
      'updateLetterAnswerParagraph called with letterAnswerId:',
      letterAnswerId
    );

    const letterAnswer = await db.letterAnswer.findUnique({
      where: { id: letterAnswerId },
      select: {
        questionGroup: {
          select: {
            part: {
              select: { assessmentId: true }
            }
          }
        }
      }
    });

    if (!letterAnswer) {
      throw new Error('Letter Answer not found');
    }

    console.log('Updating letter answer paragraph...');
    await db.letterAnswer.update({
      where: {
        id: letterAnswerId
      },
      data: {
        paragraph
      }
    });

    const assessmentId = letterAnswer.questionGroup.part.assessmentId;
    revalidatePath(`/assessments/${assessmentId}`);

    return { success: 'Letter answer paragraph updated successfully' };
  } catch (error) {
    console.error('Error updating letter answer paragraph:', error);
    return { error: 'Failed to update letter answer paragraph' };
  }
};

export const updateLetterAnswerAnswers = async ({
  letterAnswers
}: {
  letterAnswers: Array<{
    id: string;
    correctLetter: string;
  }>;
}) => {
  try {
    console.log('updateLetterAnswerAnswers called with:', letterAnswers);

    // Update each letter answer
    const updatePromises = letterAnswers.map((letterAnswer) => {
      const cleanAnswer = letterAnswer.correctLetter.trim().toUpperCase();

      if (cleanAnswer.length === 0) {
        throw new Error(`Answer is required for question`);
      }

      // Allow letters and numbers, but no special characters
      if (!/^[A-Z0-9]+$/.test(cleanAnswer)) {
        throw new Error(`Answer must contain only letters and numbers`);
      }

      return db.letterAnswer.update({
        where: { id: letterAnswer.id },
        data: {
          correctLetter: cleanAnswer,
          question: {
            update: {
              data: {
                correctAnswer: cleanAnswer
              }
            }
          }
        }
      });
    });

    await Promise.all(updatePromises);

    // Get assessment ID for revalidation
    if (letterAnswers.length > 0) {
      const firstLetterAnswer = await db.letterAnswer.findUnique({
        where: { id: letterAnswers[0].id },
        select: {
          questionGroup: {
            select: {
              part: {
                select: { assessmentId: true }
              }
            }
          }
        }
      });

      if (firstLetterAnswer) {
        const assessmentId = firstLetterAnswer.questionGroup.part.assessmentId;
        revalidatePath(`/assessments/${assessmentId}`);
      }
    }

    return { success: 'Letter answers updated successfully' };
  } catch (error) {
    console.error('Error updating letter answers:', error);
    return { error: 'Failed to update letter answers' };
  }
};
