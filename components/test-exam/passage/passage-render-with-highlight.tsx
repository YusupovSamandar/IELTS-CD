'use client';

import { memo } from 'react';
import { PassageExtended } from '@/types/test-exam';
import { HighlightableWrapper } from '@/components/common/highlightable-wrapper';
import { ActionButton } from '../action-button';

function PassageRenderWithHighlightComponent({
  passage
}: {
  passage: PassageExtended;
}) {
  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex justify-between">
        <div>
          <p className="font-bold">{passage.title}</p>
          <p className="italic font-light">{passage.description}</p>
        </div>
        <div className="flex gap-2">
          <ActionButton
            actionType="update"
            editType="editPassage"
            data={{ passage }}
          />
          <ActionButton
            actionType="delete"
            editType="deletePassage"
            data={{ passage }}
          />
        </div>
      </div>

      {passage.type === 'PASSAGE_SIMPLE' && passage.content && (
        <HighlightableWrapper
          elementId={`passage-simple-${passage.id}`}
          className="whitespace-pre-line"
        >
          {passage.content}
        </HighlightableWrapper>
      )}

      {passage.type === 'PASSAGE_MULTI_HEADING' && (
        <>
          {passage.passageHeadingList.map((passageHeading) => (
            <div key={passageHeading.id}>
              <div className="flex justify-between">
                <p className="font-bold">{passageHeading.title}</p>
                <div className="flex gap-1">
                  <ActionButton
                    actionType="update"
                    editType="editPassageMultiHeading"
                    data={{ passageHeading }}
                  />
                  <ActionButton
                    actionType="delete"
                    editType="deletePassageHeading"
                    data={{ passageHeading }}
                  />
                </div>
              </div>
              {passageHeading.content && (
                <HighlightableWrapper
                  elementId={`passage-heading-${passageHeading.id}`}
                  className="whitespace-pre-line"
                >
                  {passageHeading.content}
                </HighlightableWrapper>
              )}
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <ActionButton
              actionType="create"
              editType="createPassageHeading"
              data={{ passage }}
            >
              <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                + Add Paragraph
              </div>
            </ActionButton>
          </div>
        </>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary rerenders when timer updates
export const PassageRenderWithHighlight = memo(
  PassageRenderWithHighlightComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.passage.id === nextProps.passage.id &&
      prevProps.passage.title === nextProps.passage.title &&
      prevProps.passage.content === nextProps.passage.content &&
      JSON.stringify(prevProps.passage.passageHeadingList) ===
        JSON.stringify(nextProps.passage.passageHeadingList)
    );
  }
);
