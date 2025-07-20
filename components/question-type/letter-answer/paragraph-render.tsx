'use client';

import { useCallback, useMemo } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact
} from 'slate-react';
import { LetterAnswerExtended } from '@/types/test-exam';
import { ElementRender } from '@/components/common/text-editor/element-render';
import { LeafRender } from '@/components/common/text-editor/leaf-render/leaf-render';

const LetterAnswerParagraphRender = ({
  letterAnswer
}: {
  letterAnswer: LetterAnswerExtended;
}) => {
  const renderElement = useCallback(
    (props: RenderElementProps) => (
      <ElementRender slateProps={props} type="LetterAnswer" mode="readonly" />
    ),
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <LeafRender {...props} />,
    []
  );
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  if (!letterAnswer.paragraph) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        No paragraph content yet. Click &quot;Update Paragraph&quot; to add
        content with letter blanks.
      </div>
    );
  }

  return (
    <Slate
      key={letterAnswer.paragraph}
      editor={editor}
      initialValue={JSON.parse(letterAnswer.paragraph)}
    >
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        readOnly
      />
    </Slate>
  );
};

export default LetterAnswerParagraphRender;
