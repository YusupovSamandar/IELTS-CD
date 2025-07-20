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

  // Get all available letter options from admin configuration
  const availableLetters = useMemo(() => {
    if (!selectedAssessment) {
      return ['A', 'B', 'C', 'D']; // Minimal fallback
    }

    const allOptions = new Set<string>();

    // Collect all letters from question groups (correct answers + admin-configured options)
    selectedAssessment.parts?.forEach((part) => {
      part.questionGroups?.forEach((qg) => {
        // Add correct letters from letter answers
        qg.letterAnswers?.forEach((la) => {
          if (la.correctLetter) {
            allOptions.add(la.correctLetter);
          }
        });

        // Add admin-configured additional letter options
        if (qg.additionalLetterOptions) {
          qg.additionalLetterOptions.split(',').forEach((letter: string) => {
            const trimmed = letter.trim().toUpperCase();
            if (/^[A-Z]$/.test(trimmed)) {
              allOptions.add(trimmed);
            }
          });
        }
      });
    });

    // If no options are configured by admin, provide minimal fallback
    if (allOptions.size === 0) {
      return ['A', 'B', 'C', 'D'];
    }

    // Sort and return admin-configured options
    return Array.from(allOptions).sort();
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
