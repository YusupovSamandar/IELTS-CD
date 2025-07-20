'use client';

import { RefObject, useContext, useMemo } from 'react';
import { ExamContext } from '@/global/exam-context';
import { useExamHandler } from '@/global/use-exam-handler';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

function LetterAnswerBlankRender({
  questionNumber
}: {
  questionNumber: number;
}) {
  const { questionRefs, userAnswers, selectedAssessment } =
    useContext(ExamContext);
  const { handleAnswerChange, handleQuestionSelected } = useExamHandler();

  const answer = userAnswers.find(
    (answer) => answer.questionNumber === questionNumber
  );

  // Get all available letter options from the current assessment
  const availableLetters = useMemo(() => {
    if (!selectedAssessment) {
      // Provide default options A-H if no assessment
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    }

    const allLetters = new Set<string>();

    // Collect all correct letters from all letter answer question groups
    selectedAssessment.parts?.forEach((part) => {
      part.questionGroups?.forEach((qg) => {
        qg.letterAnswers?.forEach((la) => {
          if (la.correctLetter) {
            allLetters.add(la.correctLetter);
          }
        });
      });
    });

    // If no letters found in the assessment, provide reasonable defaults
    if (allLetters.size === 0) {
      return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    }

    // Ensure we have at least a reasonable range, fill gaps if needed
    const sortedLetters = Array.from(allLetters).sort();
    const firstLetter = sortedLetters[0];
    const lastLetter = sortedLetters[sortedLetters.length - 1];

    // Generate range from first to last letter found
    const fullRange = [];
    for (
      let i = firstLetter.charCodeAt(0);
      i <= lastLetter.charCodeAt(0);
      i++
    ) {
      fullRange.push(String.fromCharCode(i));
    }

    return fullRange.length > 0
      ? fullRange
      : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  }, [selectedAssessment]);

  return (
    <Select
      onValueChange={(value) => {
        handleAnswerChange({
          questionNumber,
          type: 'COMPLETION',
          content: value
        });
      }}
      onOpenChange={(open) => {
        if (open) {
          handleQuestionSelected(questionNumber);
        }
      }}
      value={answer && answer.type === 'COMPLETION' ? answer.content : ''}
    >
      <SelectTrigger className="inline-flex w-16 h-8 text-center">
        <SelectValue placeholder="?" />
      </SelectTrigger>
      <SelectContent>
        {availableLetters.map((letter) => (
          <SelectItem key={letter} value={letter}>
            {letter}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default LetterAnswerBlankRender;
