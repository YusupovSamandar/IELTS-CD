'use client';

import { useContext } from 'react';
import { AlignJustify, Bell, Wifi } from 'lucide-react';
import { ExamContext } from '@/global/exam-context';
import { Button } from '../ui/button';
import { Icons } from '../ui/icons';
import PublicAssessmentButton from './public-assessment-button';
import TimeRemainingRender from './time-remaining-render';
import BackHomeButton from './back-home-button';

const TextExamHeaderRender = () => {
  const { mode } = useContext(ExamContext);
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
      <div className="flex flex-1 items-center justify-end m">
        <nav className="flex items-center">
          <div className="p-4">
            <Wifi />
          </div>
          <Button variant="ghost">
            <Bell />
          </Button>
          <Button variant="ghost">
            <AlignJustify />
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default TextExamHeaderRender;
