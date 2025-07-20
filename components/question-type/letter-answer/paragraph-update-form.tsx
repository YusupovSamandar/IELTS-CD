'use client';

import { useCallback, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateLetterAnswerParagraph } from '@/actions/question-type/letter-answer';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact
} from 'slate-react';
import { toast } from 'sonner';
import { useEditHook } from '@/global/use-edit-hook';
import { catchError, countBlankOccurrences, withInline } from '@/lib/utils';
import { ElementRender } from '@/components/common/text-editor/element-render';
import { LeafRender } from '@/components/common/text-editor/leaf-render/leaf-render';
import Toolbar from '@/components/common/text-editor/toolbar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContentWithScrollArea
} from '@/components/ui/dialog';

const LetterAnswerParagraphUpdateForm = () => {
  const router = useRouter();
  const renderElement = useCallback(
    (props: RenderElementProps) => (
      <ElementRender slateProps={props} type="LetterAnswer" mode="edit" />
    ),
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <LeafRender {...props} />,
    []
  );
  const { onClose, data, isOpen, type } = useEditHook();
  const [isPending, startTransition] = useTransition();
  const isModalOpen = isOpen && type === 'editLetterAnswerParagraph';
  const questionGroup = data?.questionGroup;
  const firstLetterAnswer = questionGroup?.letterAnswers?.[0];
  const editor = useMemo(
    () => withInline(withHistory(withReact(createEditor()))),
    []
  );

  if (!questionGroup || !firstLetterAnswer || !isModalOpen) {
    return null;
  }

  const handleSave = async () => {
    const blankCount = countBlankOccurrences({
      editor,
      startQuesNum: questionGroup.startQuestionNumber
    });
    const totalQuestions = questionGroup.letterAnswers?.length || 0;
    if (blankCount !== totalQuestions) {
      toast.error(
        `Total Blank must be equal to number of letter answers
        Total Blank: ${blankCount}, Total Letter Answers: ${totalQuestions} `
      );
      return;
    }
    startTransition(async () => {
      try {
        await updateLetterAnswerParagraph({
          letterAnswerId: firstLetterAnswer.id,
          paragraph: JSON.stringify(editor.children)
        });
        toast.success('Updated');
        router.refresh();
        onClose();
      } catch (err) {
        catchError(err);
      }
    });
  };

  const defaultValue = firstLetterAnswer.paragraph
    ? JSON.parse(firstLetterAnswer.paragraph)
    : [{ type: 'paragraph', children: [{ text: '' }] }];

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContentWithScrollArea className="max-w-7xl">
        <Slate
          key={firstLetterAnswer.paragraph}
          editor={editor}
          initialValue={defaultValue}
        >
          <Toolbar />

          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Enter your paragraph here. Use the toolbar to add blanks where users should enter letters."
            spellCheck
            autoFocus
          />
          <Button disabled={isPending} onClick={handleSave}>
            Save
          </Button>
        </Slate>
        <DialogClose onClick={onClose} />
      </DialogContentWithScrollArea>
    </Dialog>
  );
};

export default LetterAnswerParagraphUpdateForm;
