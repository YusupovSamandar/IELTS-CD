import { Dispatch, SetStateAction, createContext } from 'react';
import { Assessment, Choice, Passage, PassageHeading } from '@prisma/client';
import {
  IdentifyInfoExtended,
  MultiMoreExtended,
  MultiOneExtended,
  PartExtended,
  QuestionGroupExtended,
  YesNoNotGivenExtended
} from '@/types/test-exam';

export type EditType =
  | 'editPart'
  | 'openAssessment'
  | 'editChoice'
  | 'editMultiOne'
  | 'editIdentifyInfo'
  | 'editYesNoNotGiven'
  | 'editCompletionParagraph'
  | 'editCompletionAnswer'
  | 'editLetterAnswerParagraph'
  | 'editLetterAnswerAnswer'
  | 'editMultiMore'
  | 'editPassage'
  | 'createPassage'
  | 'deletePassage'
  | 'editPassageMultiHeading'
  | 'createPassageHeading'
  | 'deletePassageHeading'
  | 'editQuestionGroup'
  | 'deleteQuestionGroup'
  | 'createQuestionGroup'
  | 'createAssessment'
  | 'editEssayPart'
  | null;

interface MultiOneChoice {
  type: 'MULTI_ONE';
  multiOneId: string;
  choice: Choice;
}

interface MultiMoreChoice {
  type: 'MULTI_MORE';
  multiMoreId: string;
  choice: Choice;
}

export type ChoiceData = MultiOneChoice | MultiMoreChoice;

export interface EditData {
  part?: PartExtended;
  questionGroup?: QuestionGroupExtended;
  choiceData?: ChoiceData;
  multiOne?: MultiOneExtended;
  multiMore?: MultiMoreExtended;
  identifyInfo?: IdentifyInfoExtended;
  yesNoNotGiven?: YesNoNotGivenExtended;
  passage?: Passage;
  passageHeading?: PassageHeading;
  assessment?: Assessment;
  userRole?: string;
  essayPart?: {
    id: string;
    partNumber: number;
    topic: string;
    title: string;
    description: string;
    maxWords: number;
  };
}

interface EditContextProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  data: EditData | undefined;
  setData: Dispatch<SetStateAction<EditData | undefined>>;
  type: EditType;
  setType: Dispatch<SetStateAction<EditType>>;
  textNoteCompletion: string;
  setTextNoteCompletion: Dispatch<SetStateAction<string>>;
}

export const EditContext = createContext<EditContextProps>({
  isOpen: false,
  textNoteCompletion: '',
  setTextNoteCompletion: () => {},
  setIsOpen: () => {},
  data: undefined,
  setData: () => {},
  type: null,
  setType: () => {}
});
