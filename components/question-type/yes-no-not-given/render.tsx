'use client';

import { useContext, useEffect, useState } from 'react';
import { IdentifyChoice } from '@prisma/client';
import { AnswerType, ExamContext } from '@/global/exam-context';
import { useExamHandler } from '@/global/use-exam-handler';
import { YesNoNotGivenExtended } from '@/types/test-exam';
import { cn } from '@/lib/utils';
import { ActionButton } from '@/components/test-exam/action-button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const YesNoNotGivenRender = ({
  yesNoNotGiven
}: {
  yesNoNotGiven: YesNoNotGivenExtended;
}) => {
  const { questionRefs, currentRef, userAnswers } = useContext(ExamContext);
  const [answer, setAnswer] = useState<AnswerType | undefined>(undefined);
  const { handleAnswerChange: handleAnswerSelected } = useExamHandler();

  // Get YES/NO/NOT GIVEN labels
  const getChoiceLabel = (choice: IdentifyChoice) => {
    switch (choice) {
      case IdentifyChoice.TRUE:
        return 'YES';
      case IdentifyChoice.FALSE:
        return 'NO';
      case IdentifyChoice.NOT_GIVEN:
        return 'NOT GIVEN';
      default:
        return choice;
    }
  };

  useEffect(() => {
    const answer = userAnswers.find(
      (answer) =>
        answer.questionNumber === yesNoNotGiven.question.questionNumber
    );
    setAnswer(answer);
  }, [userAnswers, yesNoNotGiven.question]);

  return (
    <div
      className="space-y-2"
      ref={questionRefs[yesNoNotGiven.question.questionNumber - 1]}
      tabIndex={0}
    >
      <div className="flex items-center gap-2 ">
        <p
          className={cn(
            'px-2 py-1',
            currentRef === yesNoNotGiven.question.questionNumber - 1
              ? 'border border-foreground'
              : ''
          )}
        >
          {yesNoNotGiven.question.questionNumber}
        </p>
        <p>{yesNoNotGiven.title}</p>
        <ActionButton
          actionType="update"
          editType="editYesNoNotGiven"
          data={{ yesNoNotGiven }}
        />
      </div>

      <RadioGroup
        onValueChange={(value: IdentifyChoice) =>
          handleAnswerSelected({
            questionNumber: yesNoNotGiven.question.questionNumber,
            type: 'YES_NO_NOT_GIVEN',
            content: value
          })
        }
        value={
          answer && answer.type === 'YES_NO_NOT_GIVEN' ? answer.content : ''
        }
      >
        {[
          IdentifyChoice.TRUE,
          IdentifyChoice.FALSE,
          IdentifyChoice.NOT_GIVEN
        ].map((answer) => (
          <div
            key={answer}
            className="flex items-center space-x-2 px-4 w-full hover:bg-secondary"
          >
            <RadioGroupItem
              value={answer}
              id={`${yesNoNotGiven.id}-${answer}`}
            />
            <Label
              htmlFor={`${yesNoNotGiven.id}-${answer}`}
              className="py-4 w-full cursor-pointer"
            >
              {getChoiceLabel(answer)}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
