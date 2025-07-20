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
      <ElementRender slateProps={props} type="Completion" mode="edit" />
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
  // Get the first letter answer, create default paragraph if none exists
  const firstLetterAnswer = questionGroup?.letterAnswers?.[0];
  const editor = useMemo(
    () => withInline(withHistory(withReact(createEditor()))),
    []
  );

  if (!questionGroup || !firstLetterAnswer || !isModalOpen) {
    return null;
  }

  const handleSubmit = () => {
    const blanksCount = countBlankOccurrences({
      editor,
      startQuesNum: questionGroup.startQuestionNumber
    });

    if (blanksCount === 0) {
      toast.error('Please add at least one blank to the paragraph.');
      return;
    }

    if (blanksCount !== questionGroup.letterAnswers?.length) {
      toast.error(
        `Number of blanks (${blanksCount}) must match number of letter answers (${questionGroup.letterAnswers?.length}).`
      );
      return;
    }

    startTransition(async () => {
      try {
        await updateLetterAnswerParagraph({
          letterAnswerId: firstLetterAnswer.id,
          paragraph: JSON.stringify(editor.children)
        });
        onClose();
        toast.success('Letter answer paragraph updated successfully');
        router.refresh();
      } catch (error) {
        catchError(error);
      }
    });
  };

  const defaultValue = firstLetterAnswer.paragraph
    ? JSON.parse(firstLetterAnswer.paragraph)
    : [{ type: 'paragraph', children: [{ text: '' }] }];

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContentWithScrollArea className="gap-0 max-w-4xl">
        <div className="px-6 pt-6">
          <h2 className="text-xl font-bold mb-4">
            Update Letter Answer Paragraph
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Add blanks where users should enter letters. Number of blanks must
            match number of letter answers (
            {questionGroup.letterAnswers?.length}).
          </p>
        </div>

        <div className="px-6 pb-6">
          <Slate editor={editor} initialValue={defaultValue}>
            <Toolbar />
            <div className="border rounded-md p-4 min-h-[200px]">
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Enter your paragraph here. Use the toolbar to add blanks where users should enter letters."
              />
            </div>
          </Slate>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Paragraph'}
          </Button>
        </div>
      </DialogContentWithScrollArea>
    </Dialog>
  );
};

export default LetterAnswerParagraphUpdateForm;
