'use client';

import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ExamContext } from '@/global/exam-context';
import { useExamHandler } from '@/global/use-exam-handler';
import { MultiMoreExtended } from '@/types/test-exam';
import { cn } from '@/lib/utils';
import { HighlightableWrapper } from '@/components/common/highlightable-wrapper';
import { ActionButton } from '@/components/test-exam/action-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const MultiMoreRender = ({
  multiMore
}: {
  multiMore: MultiMoreExtended;
}) => {
  const { questionRefs, currentRef, userAnswers } = useContext(ExamContext);
  const [choiceIdList, setChoiceIdList] = useState<string[]>([]);
  const { handleAnswerChange: handleAnswerSelected } = useExamHandler();

  useEffect(() => {
    const answer = userAnswers.find(
      (answer) => answer.questionNumber === multiMore.question.questionNumber
    );
    if (answer && answer.type === 'MULTI_MORE') {
      setChoiceIdList(answer.choiceIdList);
    }
  }, [userAnswers, multiMore.question.questionNumber]);

  if (!multiMore) {
    return null;
  }

  const handleCheck = (checked: boolean, choiceId: string) => {
    let updatedChoiceIdList: string[];

    if (checked) {
      // Only allow maximum 2 selections
      if (choiceIdList.length >= 2) {
        toast.error('You can only select maximum 2 answers');
        return;
      }
      updatedChoiceIdList = [...choiceIdList, choiceId];
    } else {
      updatedChoiceIdList = choiceIdList.filter((id) => id !== choiceId);
    }

    setChoiceIdList(updatedChoiceIdList);
    handleAnswerSelected({
      questionNumber: multiMore.question.questionNumber,
      type: 'MULTI_MORE',
      choiceIdList: updatedChoiceIdList
    });
  };

  return (
    <div
      className="space-y-2"
      ref={questionRefs[multiMore.question.questionNumber - 1]}
      tabIndex={0}
    >
      <div className="flex items-center gap-2 ">
        <p
          className={cn(
            'px-2 py-1',
            currentRef === multiMore.question.questionNumber - 1
              ? 'border border-foreground'
              : ''
          )}
        >
          {multiMore.question.questionNumber}
        </p>
        <HighlightableWrapper
          elementId={`question-${multiMore.question.id}-title`}
        >
          {multiMore.title}
        </HighlightableWrapper>
        <p className="text-sm text-muted-foreground">
          Select exactly 2 answers ({choiceIdList.length}/2 selected)
        </p>
        <ActionButton
          actionType="update"
          editType="editMultiMore"
          data={{ multiMore }}
        />
      </div>

      {multiMore.choices.map((choice) => {
        return (
          <div key={choice.id}>
            <div className="flex items-center space-x-2 px-4 w-full hover:bg-secondary">
              <Checkbox
                checked={choiceIdList.includes(choice.id)}
                onCheckedChange={(checked: boolean) =>
                  handleCheck(checked, choice.id)
                }
                value={choice.id}
                id={choice.id}
              />
              <Label htmlFor={choice.id} className="py-4 w-full cursor-pointer">
                <HighlightableWrapper elementId={`choice-${choice.id}-content`}>
                  {choice.content}
                </HighlightableWrapper>
              </Label>
              <ActionButton
                actionType="update"
                editType="editChoice"
                data={{
                  choiceData: {
                    type: 'MULTI_MORE',
                    multiMoreId: multiMore.id,
                    choice
                  }
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
