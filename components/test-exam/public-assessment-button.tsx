'use client';

import { useContext } from 'react';
import { publicAssessment } from '@/actions/test-exam/assessment';
import { ExamContext } from '@/global/exam-context';
import { Button } from '@/components/ui/button';

function PublicAssessmentButton() {
  const { selectedAssessment } = useContext(ExamContext);
  if (!selectedAssessment) {
    return null;
  }
  const currentPassages = selectedAssessment.parts.filter(
    (part) => part.passage !== null
  ).length;
  const totalPassages = selectedAssessment.parts.length;
  return (
    <div className="absolute left-1/2 right-1/2 top-2 h-20">
      <div className="flex items-center ">
        <div className="flex flex-col">
          <p className=" whitespace-nowrap">
            {selectedAssessment.questions.length}/
            {selectedAssessment.totalQuestions} Questions
          </p>
          <p className=" whitespace-nowrap">
            {currentPassages}/{totalPassages} Passages
          </p>
        </div>
      </div>
    </div>
  );
}

export default PublicAssessmentButton;
