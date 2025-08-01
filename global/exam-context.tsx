import { Dispatch, RefObject, SetStateAction, createContext } from 'react';
import { IdentifyChoice, QuestionType } from '@prisma/client';
import { AssessmentExtended, PartExtended } from '@/types/test-exam';
import { ModeType } from '@/lib/validations/params';

export type AnswerType =
  | {
      questionNumber: number;
      type: 'MULTIPLE_CHOICE_ONE_ANSWER';
      choiceId: string;
    }
  | {
      questionNumber: number;
      type: 'MULTI_MORE';
      choiceIdList: string[];
    }
  | {
      questionNumber: number;
      type: 'IDENTIFY_INFO';
      content: IdentifyChoice;
    }
  | {
      questionNumber: number;
      type: 'YES_NO_NOT_GIVEN';
      content: IdentifyChoice;
    }
  | {
      questionNumber: number;
      type: 'COMPLETION';
      content: string;
    };

interface ExamContextProps {
  activeTab: string;
  selectedAssessment: AssessmentExtended | null;
  questionRefs: RefObject<HTMLDivElement>[];
  currentRef: number;
  selectedPart: PartExtended | null;
  timeRemaining: number;
  mode: ModeType | null;
  isSubmit: boolean;
  submitProgress: number;
  setIsSubmit: Dispatch<SetStateAction<boolean>>;
  setSubmitProgress: Dispatch<SetStateAction<number>>;
  setMode: Dispatch<SetStateAction<ModeType | null>>;
  setTimeRemaining: Dispatch<SetStateAction<number>>;
  setSelectedPart: Dispatch<SetStateAction<PartExtended | null>>;
  setCurrentRef: Dispatch<SetStateAction<number>>;
  setQuestionRefs: Dispatch<SetStateAction<RefObject<HTMLDivElement>[]>>;
  setSelectedAssessment: Dispatch<SetStateAction<AssessmentExtended | null>>;
  setActiveTab: Dispatch<SetStateAction<string>>;
  listHeading: string[];
  setListHeading: Dispatch<SetStateAction<string[]>>;
  userAnswers: AnswerType[];
  setUserAnswers: Dispatch<SetStateAction<AnswerType[]>>;
  essayValues: { [key: number]: string };
  setEssayValues: Dispatch<SetStateAction<{ [key: number]: string }>>;
  triggerAutoSubmit: boolean;
  setTriggerAutoSubmit: Dispatch<SetStateAction<boolean>>;
}

export const ExamContext = createContext<ExamContextProps>({
  activeTab: '',
  selectedAssessment: null,
  questionRefs: [],
  userAnswers: [],
  listHeading: [],
  timeRemaining: 0,
  mode: null,
  isSubmit: false,
  submitProgress: 0,
  setIsSubmit: () => {},
  setSubmitProgress: () => {},
  setMode: () => {},
  setTimeRemaining: () => {},
  selectedPart: null,
  setSelectedPart: () => {},
  setListHeading: () => {},
  setUserAnswers: () => {},
  essayValues: {},
  setEssayValues: () => {},
  currentRef: 0,
  setCurrentRef: () => {},
  setQuestionRefs: () => {},
  setSelectedAssessment: () => {},
  setActiveTab: () => {},
  triggerAutoSubmit: false,
  setTriggerAutoSubmit: () => {}
});
