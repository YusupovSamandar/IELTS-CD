'use client';

import { useEffect, useState } from 'react';
import OpenAssessmentModal from '@/components/open-assessment-modal';
import { CompletionAnswerUpdateForm } from '@/components/question-type/completion/answer-update-form';
import CompletionParagraphUpdateForm from '@/components/question-type/completion/paragraph-update-form';
import { IdentifyInfoUpdateForm } from '@/components/question-type/identify-info/update-form';
import { LetterAnswerUpdateForm } from '@/components/question-type/letter-answer/answer-update-form';
import LetterAnswerParagraphUpdateForm from '@/components/question-type/letter-answer/paragraph-update-form';
import { ChoiceUpdateForm } from '@/components/question-type/multiple-choice/choice/update-form';
import { MultiMoreUpdateForm } from '@/components/question-type/multiple-choice/multi-more/update-form';
import { MultiOneUpdateForm } from '@/components/question-type/multiple-choice/multi-one/update-form';
import { YesNoNotGivenUpdateForm } from '@/components/question-type/yes-no-not-given/update-form';
import { CreateAssessmentForm } from '@/components/test-exam/assessment/create-form';
import { UpdatePartForm } from '@/components/test-exam/part/update-form';
import { CreatePassageForm } from '@/components/test-exam/passage/create-form';
import { PassageDeleteForm } from '@/components/test-exam/passage/delete-form';
import { PassageHeadingCreateForm } from '@/components/test-exam/passage/passage-heading-create-form';
import { PassageHeadingDeleteForm } from '@/components/test-exam/passage/passage-heading-delete-form';
import { PassageHeadingUpdateForm } from '@/components/test-exam/passage/passage-heading-update-form';
import { PassageUpdateForm } from '@/components/test-exam/passage/update-form';
import { CreateQuestionGroupForm } from '@/components/test-exam/question-group/create-form';
import { DeleteQuestionGroupForm } from '@/components/test-exam/question-group/delete-form';
import SubmitModal from '@/components/test-exam/submit-modal';
import { EssayPartUpdateForm } from '@/components/test-exam/writing/essay-part-update-form';

export function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateAssessmentForm />
      <OpenAssessmentModal />

      <UpdatePartForm />

      <CreatePassageForm />
      <PassageUpdateForm />
      <PassageDeleteForm />
      <PassageHeadingCreateForm />
      <PassageHeadingUpdateForm />
      <PassageHeadingDeleteForm />

      <CreateQuestionGroupForm />
      <DeleteQuestionGroupForm />

      <MultiOneUpdateForm />
      <MultiMoreUpdateForm />
      <ChoiceUpdateForm />

      <IdentifyInfoUpdateForm />
      <YesNoNotGivenUpdateForm />

      <SubmitModal />

      <CompletionParagraphUpdateForm />
      <CompletionAnswerUpdateForm />

      <LetterAnswerParagraphUpdateForm />
      <LetterAnswerUpdateForm />

      <EssayPartUpdateForm />
    </>
  );
}
