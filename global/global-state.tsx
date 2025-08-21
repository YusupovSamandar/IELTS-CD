'use client';

import { FC, RefObject, createRef, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AssessmentExtended, PartExtended } from '@/types/test-exam';
import { ModeType } from '@/lib/validations/params';
import { EditContext, EditData, EditType } from './edit-context';
import { AnswerType, ExamContext } from './exam-context';
import { UserProvider } from './user-context';
import { HighlightProvider } from './highlight-context';

interface GlobalStateProps {
  children: React.ReactNode;
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
  const searchParams = useSearchParams();
  const hasInitializedFromUrl = useRef(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [selectedPart, setSelectedPart] = useState<PartExtended | null>(null);
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentExtended | null>(null);
  const [questionRefs, setQuestionRefs] = useState<RefObject<HTMLDivElement>[]>(
    []
  );
  const [currentRef, setCurrentRef] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<AnswerType[]>([]);
  const [essayValues, setEssayValues] = useState<{ [key: number]: string }>({});
  const [textNoteCompletion, setTextNoteCompletion] = useState('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [type, setType] = useState<EditType>(null);
  const [data, setData] = useState<EditData | undefined>(undefined);
  const [listHeading, setListHeading] = useState<string[]>([]);

  const [questionGroupId, setQuestionGroupId] = useState<string>('');
  const [prevContent, setPrevContent] = useState('');
  const [mode, setMode] = useState<ModeType | null>(null);
  const [choiceGroupOver, setChoiceGroupOver] = useState(false);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [hasTimerStarted, setHasTimerStarted] = useState(false);
  const [triggerAutoSubmit, setTriggerAutoSubmit] = useState(false);
  const [dndType, setDndType] = useState<'question' | 'groupChoice' | null>(
    null
  );
  useEffect(() => {
    if (!selectedAssessment || !mode) return;

    setTimeRemaining(selectedAssessment.duration);
    setHasTimerStarted(false); // Reset timer started flag
    setQuestionRefs(() =>
      Array.from({ length: selectedAssessment.totalQuestions }, () =>
        createRef<HTMLDivElement>()
      )
    );
  }, [selectedAssessment, mode]); // Remove activeTab from dependencies

  // Separate effect for tab initialization
  useEffect(() => {
    if (!selectedAssessment) return;

    // Check if current activeTab is valid for this assessment
    const isActiveTabValid =
      activeTab &&
      selectedAssessment.parts.some((part) => part.id === activeTab);

    // Only set the first part as active tab if no valid activeTab is set
    if (!isActiveTabValid) {
      setActiveTab(selectedAssessment.parts[0].id);
      setSelectedPart(selectedAssessment.parts[0]);
    }
  }, [selectedAssessment, activeTab]);

  // Separate effect for handling URL parameters - only run once when assessment loads
  useEffect(() => {
    if (!selectedAssessment || hasInitializedFromUrl.current) return;

    const urlCurrentTab = searchParams.get('currentTab');
    if (urlCurrentTab) {
      // Validate that the URL tab exists in the current assessment
      const tabExists = selectedAssessment.parts.some(
        (part) => part.id === urlCurrentTab
      );
      if (tabExists && urlCurrentTab !== activeTab) {
        setActiveTab(urlCurrentTab);
        const selectedPartFromUrl = selectedAssessment.parts.find(
          (part) => part.id === urlCurrentTab
        );
        if (selectedPartFromUrl) {
          setSelectedPart(selectedPartFromUrl);
        }
      } else if (!tabExists) {
        // If URL tab doesn't exist in current assessment, clear it from URL and use default
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('currentTab');
        window.history.replaceState({}, '', currentUrl.toString());
      }
    }

    hasInitializedFromUrl.current = true;
  }, [selectedAssessment, searchParams, activeTab]);

  // Reset the initialization flag when assessment changes
  useEffect(() => {
    hasInitializedFromUrl.current = false;
  }, [selectedAssessment?.id]);
  useEffect(() => {
    // Only start the timer if we have time remaining and assessment is selected
    if (!selectedAssessment || timeRemaining <= 0) return;

    // Mark that timer has started
    setHasTimerStarted(true);

    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => {
        // Stop the timer at 0
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [selectedAssessment, timeRemaining]);

  // Auto-submit when time reaches 0
  useEffect(() => {
    if (
      timeRemaining === 0 &&
      hasTimerStarted && // Only trigger if timer has actually started counting
      selectedAssessment &&
      !isSubmit &&
      mode &&
      (mode === 'exam' || mode === 'practice')
    ) {
      console.log('Time is up! Auto-submitting exam...');
      setTriggerAutoSubmit(true);
    }
  }, [timeRemaining, hasTimerStarted, selectedAssessment, isSubmit, mode]);

  useEffect(() => {
    if (!selectedAssessment || !activeTab || !mode) return;

    const partIndex = selectedAssessment.parts.findIndex(
      (part) => part.id === activeTab
    );

    if (partIndex !== -1) {
      setSelectedPart(selectedAssessment.parts[partIndex]);

      const firstQuestionGroup =
        selectedAssessment.parts[partIndex].questionGroups[0];
      if (firstQuestionGroup) {
        setCurrentRef(firstQuestionGroup.startQuestionNumber - 1);
      }
    }
  }, [selectedAssessment, activeTab, mode]);

  return (
    <UserProvider>
      <HighlightProvider>
        <ExamContext.Provider
        value={{
          activeTab,
          selectedAssessment,
          questionRefs,
          userAnswers,
          currentRef,
          listHeading,
          selectedPart,
          timeRemaining,
          mode,
          isSubmit,
          submitProgress,
          setIsSubmit,
          setSubmitProgress,
          setMode,
          setTimeRemaining,
          setSelectedPart,
          setListHeading,
          setUserAnswers,
          essayValues,
          setEssayValues,
          setCurrentRef,
          setQuestionRefs,
          setSelectedAssessment,
          setActiveTab,
          triggerAutoSubmit,
          setTriggerAutoSubmit
        }}
      >
        <EditContext.Provider
          value={{
            isOpen,
            textNoteCompletion,
            setTextNoteCompletion,
            setData,
            setIsOpen,
            setType,
            type,
            data
          }}
        >
          {children}
        </EditContext.Provider>
      </ExamContext.Provider>
      </HighlightProvider>
    </UserProvider>
  );
};
