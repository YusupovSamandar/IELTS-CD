'use client';

import { useContext, useEffect } from 'react';
import { ExamContext } from '@/global/exam-context';
import { AssessmentExtended } from '@/types/test-exam';
import { ModeType } from '@/lib/validations/params';
import { TestExamContentRender } from '../content-render';
import TextExamHeaderRender from '../header-render';

const AssessmentRender = ({
  assessment,
  mode
}: {
  assessment: AssessmentExtended;
  mode: ModeType;
}) => {
  const { setSelectedAssessment, setMode, timeRemaining, isSubmit } =
    useContext(ExamContext);

  useEffect(() => {
    setSelectedAssessment(assessment);
    setMode(mode);
  }, [assessment, setSelectedAssessment, mode, setMode]);

  // Add reload warning when exam is in progress
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Show warning only if:
      // 1. Mode is exam or practice (actual exam)
      // 2. Exam is not yet submitted
      // 3. There's time remaining (exam is active)
      if (
        (mode === 'exam' || mode === 'practice') &&
        !isSubmit &&
        timeRemaining > 0
      ) {
        // Cancel the event
        event.preventDefault();

        // Chrome requires returnValue to be set
        event.returnValue = '';

        // For older browsers
        return '';
      }
    };

    const handleUnload = () => {
      // This will trigger when the page is actually being unloaded
      if (
        (mode === 'exam' || mode === 'practice') &&
        !isSubmit &&
        timeRemaining > 0
      ) {
        // You could save exam state here if needed
        console.log('Exam session ended unexpectedly');
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [mode, isSubmit, timeRemaining]);

  return (
    <div className="max-h-screen h-screen flex flex-col relative">
      <TextExamHeaderRender />
      <TestExamContentRender />
      
      {/* Disable exam interface when submitting */}
      {isSubmit && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 pointer-events-auto">
          {/* This overlay prevents any interaction with the exam */}
        </div>
      )}
    </div>
  );
};

export default AssessmentRender;
