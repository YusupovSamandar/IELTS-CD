import { RenderElementProps } from 'slate-react';
import CompletionBlankRender from '@/components/question-type/completion/blank-render';
import LetterAnswerBlankRender from '@/components/question-type/letter-answer/blank-render';

type ReadonlyElementRenderProps =
  | {
      slateProps: RenderElementProps;
      type: 'Completion';
      mode: 'edit' | 'readonly';
    }
  | {
      slateProps: RenderElementProps;
      type: 'Completion';
      mode: 'result';
      assessmentId: string;
    }
  | {
      slateProps: RenderElementProps;
      type: 'LetterAnswer';
      mode: 'edit' | 'readonly';
    }
  | {
      slateProps: RenderElementProps;
      type: 'LetterAnswer';
      mode: 'result';
      assessmentId: string;
    };
export const ElementRender = (props: ReadonlyElementRenderProps) => {
  const { slateProps } = props;
  const { attributes, children, element } = slateProps;
  switch (element.type) {
    case 'blank':
      if (props.mode === 'edit') {
        return (
          <span {...attributes} className="bg-red-500">
            {children}
          </span>
        );
      }
      if (props.mode === 'readonly') {
        if (props.type === 'Completion') {
          return (
            <CompletionBlankRender questionNumber={element.questionNumber} />
          );
        }
        if (props.type === 'LetterAnswer') {
          return (
            <LetterAnswerBlankRender questionNumber={element.questionNumber} />
          );
        }
      }
    case 'table':
      return (
        <table className="w-full">
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case 'table-row':
      return (
        <tr className="m-0 border-t p-0" {...attributes}>
          {children}
        </tr>
      );
    case 'table-cell':
      return (
        <td
          className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
          {...attributes}
        >
          {children}
        </td>
      );
    case 'blockquote':
      return (
        <blockquote className="mt-6 border-l-2 pl-6 italic" {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      const h1AlignClass = element.align
        ? {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right',
            justify: 'text-justify'
          }[element.align]
        : '';

      return (
        <h1
          className={`scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ${h1AlignClass}`}
          {...attributes}
        >
          {children}
        </h1>
      );
    case 'heading-two':
      const h2AlignClass = element.align
        ? {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right',
            justify: 'text-justify'
          }[element.align]
        : '';

      return (
        <h2
          className={`mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 ${h2AlignClass}`}
          {...attributes}
        >
          {children}
        </h2>
      );
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    case 'paragraph':
    default:
      // Handle paragraphs and default elements with proper alignment
      const alignmentClass = element.align
        ? {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right',
            justify: 'text-justify'
          }[element.align]
        : '';

      return (
        <p className={alignmentClass} {...attributes}>
          {children}
        </p>
      );
  }
};
