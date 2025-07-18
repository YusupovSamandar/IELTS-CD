import { Fragment, useContext } from 'react';
import { Check } from 'lucide-react';
import { ExamContext } from '@/global/exam-context';
import { useExamHandler } from '@/global/use-exam-handler';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TabsList } from '@/components/ui/tabs';

function FooterContentRender() {
  const {
    selectedAssessment,
    activeTab,
    setActiveTab,
    questionRefs,
    setCurrentRef: setCurrentQuestionIndex,
    currentRef: currentQuestionIndex
  } = useContext(ExamContext);
  const { handleSubmit } = useExamHandler();
  if (!selectedAssessment) {
    return null;
  }

  // For writing assessments, show simpler tab navigation
  if (selectedAssessment.sectionType === 'WRITING') {
    return (
      <TabsList className="flex justify-center items-center h-16 bg-transparent border-0 w-full">
        {selectedAssessment.parts.map((part) => (
          <Button
            key={part.id}
            className={cn(
              'flex-1 rounded-none border-none h-12',
              activeTab === part.id ? 'bg-primary text-primary-foreground' : ''
            )}
            variant={activeTab === part.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(part.id)}
          >
            {part.title}
          </Button>
        ))}
        <Button
          variant="secondary"
          onClick={handleSubmit}
          className="ml-4 h-12"
        >
          <Check className="h-4 w-4 mr-2" />
          Submit
        </Button>
      </TabsList>
    );
  }

  // Original logic for reading assessments
  const handleMoveToDiv = (questionIndex: number) => {
    questionRefs[questionIndex].current?.focus();
    setCurrentQuestionIndex(questionIndex);
  };

  return (
    <TabsList className="flex justify-between items-center h-16 bg-transparent border-0 w-full px-4">
      {selectedAssessment.parts.map((part) => (
        <Fragment key={part.id}>
          {activeTab === part.id ? (
            <div
              key={part.id}
              className="flex items-center justify-center gap-8 w-full"
            >
              <p className="px-1 whitespace-nowrap">{part.title}</p>
              <div className="flex items-center">
                {part.questions.map((question) => (
                  <div
                    key={question.id}
                    role="button"
                    className="hover:border hover:border-secondary-foreground"
                    onClick={() => handleMoveToDiv(question.questionNumber - 1)}
                  >
                    <p
                      className={cn(
                        'px-2',
                        currentQuestionIndex === question.questionNumber - 1
                          ? 'border border-secondary-foreground'
                          : ''
                      )}
                    >
                      {question.questionNumber}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Button
              className="w-full rounded-none border-none"
              variant="outline"
              onClick={() => setActiveTab(part.id)}
            >
              {part.title}
            </Button>
          )}
        </Fragment>
      ))}
      <Button variant="secondary" onClick={handleSubmit}>
        <Check className="h-4 w-4" />
      </Button>
    </TabsList>
  );
}

export default FooterContentRender;
