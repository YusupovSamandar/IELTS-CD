import { Suspense } from 'react';
import Image from 'next/image';
import { getResultByAssessmentId } from '@/actions/test-exam/result';
import { db } from '@/lib/db';
import { formatTime } from '@/lib/utils';
import { PlaceholderImage } from '../placeholder-image';
import BackToMainButton from './back-to-main-button';
// import AnswerKeysSection from './answer-keys-section';
import PartRenderKey from './part-render-key';

const ScoreHeaderRender = async ({
  assessmentId
}: {
  assessmentId: string;
}) => {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: { parts: { select: { id: true } } }
  });

  const result = await getResultByAssessmentId(assessmentId);

  if (!assessment || !result) {
    return null;
  }

  return (
    <div className="container max-w-4xl">
      {/* Exam Card */}
      <div className="flex flex-wrap bg-card border rounded-lg p-6 gap-4 sm:justify-start justify-center shadow-sm">
        <div className="relative">
          <div className="w-24 h-24">
            <PlaceholderImage />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-2xl text-foreground mb-2">
            {assessment.name}
          </h1>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {assessment.sectionType}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {assessment.totalQuestions} Questions
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Assessment Results</p>
        </div>
      </div>
      {/* Score Render */}
      <div className="mt-8 bg-card border rounded-lg p-6 shadow-sm">
        <p className="text-center font-bold text-2xl mb-6 text-foreground">
          Your Score
        </p>
        <div className="flex sm:flex-row flex-col items-center gap-8 justify-center">
          <div className="rounded-full h-32 w-32 flex items-center justify-center border-4 border-green-500 bg-green-50 dark:bg-green-950">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Correct
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                Answers
              </p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                {result.totalCorrectAnswers}/{assessment.totalQuestions}
              </p>
            </div>
          </div>

          <div className="rounded-full h-40 w-40 flex items-center justify-center border-4 bg-primary text-primary-foreground shadow-lg">
            <div className="text-center">
              <p className="text-xs font-medium opacity-80 mb-1">Score</p>
              <p className="font-bold text-3xl">{result.score}</p>
            </div>
          </div>

          <div className="rounded-full h-32 w-32 flex items-center justify-center border-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Time Spent
              </p>
              <p className="font-bold text-lg text-blue-700 dark:text-blue-300">
                {formatTime(result.timeSpent)}
              </p>
              <p className="text-xs text-muted-foreground">
                of {formatTime(assessment.duration)}
              </p>
            </div>
          </div>
        </div>

        <BackToMainButton />
      </div>

      {/* Answer Keys - Temporarily commented out */}
      {/* <AnswerKeysSection assessmentId={assessmentId} /> */}
    </div>
  );
};

export default ScoreHeaderRender;
