'use client';

import { QuestionGroupExtended } from '@/types/test-exam';
import { ActionButton } from '@/components/test-exam/action-button';
import { buttonVariants } from '@/components/ui/button';
import LetterAnswerParagraphRender from './paragraph-render';

const LetterAnswerRender = ({
  questionGroup
}: {
  questionGroup: QuestionGroupExtended;
}) => {
  // Get the first letter answer (always show UI even if no paragraph yet)
  const firstLetterAnswer = questionGroup.letterAnswers?.[0];

  if (!firstLetterAnswer) {
    return null;
  }

  return (
    <>
      <div className="gap-4 flex justify-between items-center">
        <ActionButton
          actionType="update"
          editType="editLetterAnswerParagraph"
          data={{ questionGroup }}
        >
          <div className={buttonVariants()}>Update Paragraph</div>
        </ActionButton>
        <ActionButton
          actionType="update"
          editType="editLetterAnswerAnswer"
          data={{ questionGroup }}
        >
          <div className={buttonVariants()}>Update Answers</div>
        </ActionButton>
      </div>

      <LetterAnswerParagraphRender letterAnswer={firstLetterAnswer} />
    </>
  );
};

export { LetterAnswerRender };
export default LetterAnswerRender;
