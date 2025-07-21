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
      return []; // No assessment, no options
    }

    // Find the specific question group for the current questionNumber
    let currentQuestionGroup = null;
    for (const part of selectedAssessment.parts || []) {
      for (const qg of part.questionGroups || []) {
        if (
          questionNumber >= qg.startQuestionNumber &&
          questionNumber <= qg.endQuestionNumber
        ) {
          currentQuestionGroup = qg;
          break;
        }
      }
      if (currentQuestionGroup) break;
    }

    // If a specific question group is found
    if (currentQuestionGroup) {
      // If the group has admin-configured options, use ONLY those.
      if (currentQuestionGroup.additionalLetterOptions) {
        const options = currentQuestionGroup.additionalLetterOptions
          .split(',')
          .map((letter) => letter.trim().toUpperCase())
          .filter((letter) => /^[A-Z]$/.test(letter));

        if (options.length > 0) {
          return options.sort();
        }
      }

      // If no admin options, fallback to collecting correct letters from THIS group only
      const optionsFromCorrectAnswers = new Set<string>();
      currentQuestionGroup.letterAnswers?.forEach((la) => {
        if (la.correctLetter) {
          optionsFromCorrectAnswers.add(la.correctLetter);
        }
      });

      if (optionsFromCorrectAnswers.size > 0) {
        return Array.from(optionsFromCorrectAnswers).sort();
      }
    }

    // Ultimate fallback if no group is found or no options are configured at all
    return ['A', 'B', 'C', 'D'];
  }, [selectedAssessment, questionNumber]);

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
