'use client';

import { useContext } from 'react';
import { ExamContext } from '@/global/exam-context';
import { Icons } from '../ui/icons';
import BackHomeButton from './back-home-button';
import PublicAssessmentButton from './public-assessment-button';
import TimeRemainingRender from './time-remaining-render';

const TextExamHeaderRender = () => {
  const { mode } = useContext(ExamContext);

  // Defensive check for mode
  if (!mode) {
    return (
      <div className="px-4 py-2 flex items-center">
        <div className="gap-6 flex items-center">
          <Icons.logo className="h-6 w-6" aria-hidden="true" />
          <div className="">
            <TimeRemainingRender />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 flex items-center ">
      {mode === 'edit' && (
        <div className="flex items-center gap-2">
          <BackHomeButton />
          <PublicAssessmentButton />
        </div>
      )}
      <div className="gap-6 flex items-center">
        <Icons.logo className="h-6 w-6" aria-hidden="true" />
        <div className="">
          <TimeRemainingRender />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end">
        {/* Icons removed as requested */}
      </div>
    </div>
  );
};

export default TextExamHeaderRender;
