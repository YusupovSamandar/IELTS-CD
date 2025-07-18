'use client';

import { useContext } from 'react';
import { Send } from 'lucide-react';
import { ExamContext } from '@/global/exam-context';
import { useExamHandler } from '@/global/use-exam-handler';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ActionButton } from '../action-button';
import AudioPlayerSection from '../audio-player-section';
import ButtonNavigationQuestion from '../button-nav-question';
import PartBodyContentRender from './body';
import FooterContentRender from './footer';

const TestExamContentRender = () => {
  const { selectedAssessment, activeTab } = useContext(ExamContext);
  const { handleSubmit } = useExamHandler();

  if (!selectedAssessment) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Audio Player Section - Show at assessment level for listening assessments */}
      {selectedAssessment.sectionType === 'LISTENING' && (
        <div className="p-4 border-b bg-background">
          <div className="container mx-auto max-w-4xl">
            <AudioPlayerSection
              assessment={{
                id: selectedAssessment.id,
                audioPath: (selectedAssessment as any).audioPath
              }}
            />
          </div>
        </div>
      )}

      <Tabs value={activeTab} className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          {selectedAssessment.parts.map((part) => {
            return (
              <TabsContent
                key={part.id}
                value={part.id}
                className="h-full flex flex-col"
                style={{ display: part.id === activeTab ? 'flex' : 'none' }}
              >
                <div className="p-4">
                  <div className="px-4 py-2 border-foreground rounded-md border items-center">
                    <div className="flex gap-2 justify-between items-center">
                      <div>
                        <p className=" font-bold">{part.title} </p>
                        <p> {part.description} </p>
                      </div>
                      <ActionButton
                        editType="editPart"
                        actionType="update"
                        data={{ part }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pb-20">
                  <PartBodyContentRender />
                </div>
                {(selectedAssessment.sectionType === 'READING' ||
                  selectedAssessment.sectionType === 'LISTENING') && (
                  <ButtonNavigationQuestion />
                )}
              </TabsContent>
            );
          })}
          <TabsContent
            value="delivering"
            className="h-full flex items-center justify-center pb-20"
          >
            <div className="flex justify-between items-center w-full max-w-3xl">
              <p>Click next to continue</p>
              <Button size="lg" onClick={handleSubmit}>
                <Send className="mr-2 h-4 w-4" />
                Next
              </Button>
            </div>
          </TabsContent>
        </div>

        {/* Fixed footer at bottom - still inside Tabs */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
          <FooterContentRender />
        </div>
      </Tabs>
    </div>
  );
};

export { TestExamContentRender };
