'use client';

import { useCallback, useContext, useMemo } from 'react';
import { ExamContext } from '@/global/exam-context';
import WritingEssayRender from './essay-render';

const WritingBodyContentRender = () => {
  const {
    selectedAssessment,
    mode,
    selectedPart,
    essayValues,
    setEssayValues
  } = useContext(ExamContext);

  const handleEssayChange = useCallback(
    (partNumber: number, value: string) => {
      setEssayValues((prev) => ({
        ...prev,
        [partNumber]: value
      }));
    },
    [setEssayValues]
  );

  // Use the actual essayPart from selectedPart instead of creating it dynamically
  const currentEssayPart = useMemo(() => {
    if (!selectedPart?.essayPart || !selectedAssessment?.parts.length)
      return null;

    return selectedPart.essayPart;
  }, [selectedPart?.essayPart, selectedAssessment?.parts.length]);

  if (!selectedAssessment || selectedAssessment.sectionType !== 'WRITING') {
    return null;
  }

  // Show nothing if no current essay part - just like reading section
  if (!currentEssayPart) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Topic header */}
      <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 p-4">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
          {currentEssayPart.topic}
        </h2>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Currently viewing: {currentEssayPart.title}
        </p>
      </div>

      {/* Essay render - takes full height */}
      <div className="flex-1 overflow-hidden">
        <WritingEssayRender
          essayPart={currentEssayPart}
          mode={mode || 'exam'}
          value={essayValues[currentEssayPart.partNumber] || ''}
          onChange={(value) =>
            handleEssayChange(currentEssayPart.partNumber, value)
          }
        />
      </div>
    </div>
  );
};

export default WritingBodyContentRender;
