'use client';

import { memo, useContext } from 'react';
import { SectionType } from '@prisma/client';
import { ExamContext } from '@/global/exam-context';
import { CompletionRender } from '@/components/question-type/completion';
import { IdentifyInfoRender } from '@/components/question-type/identify-info/render';
import { LetterAnswerRender } from '@/components/question-type/letter-answer/render';
import { MultiMoreRender } from '@/components/question-type/multiple-choice/multi-more/render';
import { MultiOneRender } from '@/components/question-type/multiple-choice/multi-one/render';
import { YesNoNotGivenRender } from '@/components/question-type/yes-no-not-given/render';
import { ActionButton } from '@/components/test-exam/action-button';
import { buttonVariants } from '@/components/ui/button';
import { HighlightableWrapper } from '@/components/common/highlightable-wrapper';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PassageRender } from '../../passage/passage-render';
import { PassageRenderWithHighlight } from '../../passage/passage-render-with-highlight';
import WritingBodyContentRender from '../../writing/body-content-render';

// Memoized component for question groups to prevent timer-related rerenders
const QuestionGroupsSection = memo(
  ({ selectedPart }: { selectedPart: any }) => {
    return (
      <div className="pb-16">
        <div className="flex justify-end">
          <ActionButton
            actionType="create"
            editType="createQuestionGroup"
            data={{ part: selectedPart }}
          >
            <div className={buttonVariants()}>New Question Group</div>
          </ActionButton>
        </div>

        {selectedPart.questionGroups &&
        selectedPart.questionGroups.length > 0 ? (
          selectedPart.questionGroups.map((questionGroup: any) => {
            return (
              <div key={questionGroup.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">
                      Questions {questionGroup.startQuestionNumber}-
                      {questionGroup.endQuestionNumber}
                    </p>
                    <HighlightableWrapper 
                      elementId={`question-group-title-${questionGroup.id}`}
                      className="whitespace-pre-line"
                    >
                      {questionGroup.title}
                    </HighlightableWrapper>
                  </div>
                  <div>
                    <ActionButton
                      actionType="update"
                      editType="editQuestionGroup"
                      data={{ questionGroup }}
                    />
                    <ActionButton
                      actionType="delete"
                      editType="deleteQuestionGroup"
                      data={{ questionGroup }}
                    />
                  </div>
                </div>

                {questionGroup.type === 'MULTIPLE_CHOICE_ONE_ANSWER' &&
                  questionGroup.multiOneList.map((multiOne: any) => (
                    <MultiOneRender multiOne={multiOne} key={multiOne.id} />
                  ))}
                {questionGroup.type === 'MULTIPLE_CHOICE_MORE_ANSWERS' &&
                  questionGroup.multiMoreList.map((multiMore: any) => (
                    <MultiMoreRender multiMore={multiMore} key={multiMore.id} />
                  ))}
                {questionGroup.type === 'IDENTIFYING_INFORMATION' &&
                  questionGroup.identifyInfoList.map((identifyInfo: any) => (
                    <IdentifyInfoRender
                      identifyInfo={identifyInfo}
                      key={identifyInfo.id}
                    />
                  ))}
                {questionGroup.type === 'YES_NO_NOT_GIVEN' &&
                  questionGroup.yesNoNotGivenList.map((yesNoNotGiven: any) => (
                    <YesNoNotGivenRender
                      yesNoNotGiven={yesNoNotGiven}
                      key={yesNoNotGiven.id}
                    />
                  ))}
                {(questionGroup.type === 'COMPLETION' ||
                  questionGroup.type === 'TABLE_COMPLETION') && (
                  <CompletionRender questionGroup={questionGroup} />
                )}
                {questionGroup.type === 'LETTER_ANSWER' && (
                  <LetterAnswerRender questionGroup={questionGroup} />
                )}
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No question groups yet. Click &quot;New Question Group&quot; to
            create one.
          </div>
        )}
      </div>
    );
  }
);

QuestionGroupsSection.displayName = 'QuestionGroupsSection';

const PartBodyContentRender = memo(() => {
  // Only extract the values we actually need to prevent timer rerenders
  const { selectedPart, selectedAssessment } = useContext(ExamContext);

  if (!selectedPart) {
    console.log('PartBodyContentRender - No selectedPart, returning null');
    return null;
  }

  // If this is a writing assessment, render the writing interface
  if (selectedAssessment?.sectionType === SectionType.WRITING) {
    return <WritingBodyContentRender />;
  }

  // If this is a listening assessment, render without resizable panels
  if (selectedAssessment?.sectionType === SectionType.LISTENING) {
    return (
      <div className="h-full">
        <ScrollArea
          type="always"
          className="w-full h-full overflow-auto pl-4 pr-8"
        >
          <QuestionGroupsSection selectedPart={selectedPart} />
          <ScrollBar className="w-4" />
        </ScrollArea>
      </div>
    );
  }

  // Otherwise render the normal reading interface with resizable panels
  return (
    <div className="h-full min-h-0 flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        <ResizablePanel defaultSize={50} className="min-h-0">
          <ScrollArea type="always" className="w-full h-full pl-4 pr-8">
            <div className="pb-16">
              {selectedPart.passage ? (
                <PassageRenderWithHighlight passage={selectedPart.passage} />
              ) : (
                <ActionButton
                  actionType="create"
                  editType="createPassage"
                  data={{ part: selectedPart }}
                >
                  <div className={buttonVariants()}>New Passage</div>
                </ActionButton>
              )}
            </div>

            <ScrollBar className="w-4" />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className="min-h-0">
          <ScrollArea type="always" className="w-full h-full pl-4 pr-8">
            <QuestionGroupsSection selectedPart={selectedPart} />
            <ScrollBar className="w-4" />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
});

// Add display name for better debugging
PartBodyContentRender.displayName = 'PartBodyContentRender';

export default PartBodyContentRender;
