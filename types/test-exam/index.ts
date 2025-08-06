import {
  Assessment,
  Choice,
  Completion,
  EssayPart,
  IdentifyChoice,
  IdentifyingInformation,
  MultipleChoiceMoreAnswers,
  MultipleChoiceOneAnswer,
  Part,
  Passage,
  PassageHeading,
  Question,
  QuestionGroup,
  QuestionType
} from '@prisma/client';

export type AssessmentExtended = Assessment & {
  parts: PartExtended[];
  questions: Question[];
};
export type PassageExtended = Passage & {
  passageHeadingList: PassageHeading[];
};

export type PartExtended = Part & {
  passage: PassageExtended | null;
  questionGroups: QuestionGroupExtended[];
  questions: Question[];
  essayPart: EssayPart | null;
};

export type QuestionGroupExtended = QuestionGroup & {
  questions: Question[];

  multiOneList: MultiOneExtended[];
  multiMoreList: MultiMoreExtended[];
  identifyInfoList: IdentifyInfoExtended[];
  yesNoNotGivenList: YesNoNotGivenExtended[];
  letterAnswers: LetterAnswerExtended[];
  completion?: CompletionExtended | null;
  additionalLetterOptions?: string | null;
};
export type MultiOneExtended = MultipleChoiceOneAnswer & {
  choices: Choice[];
  question: Question;
};
export type MultiMoreExtended = MultipleChoiceMoreAnswers & {
  choices: Choice[];
  question: Question;
};
export type IdentifyInfoExtended = IdentifyingInformation & {
  question: Question;
};
export type YesNoNotGivenExtended = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  choiceCorrect: IdentifyChoice;
  questionId: string;
  questionGroupId: string;
  question: Question;
};
export type LetterAnswerExtended = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  paragraph?: string | null;
  correctLetter: string;
  questionId: string;
  questionGroupId: string;
  question: Question;
};
export type CompletionExtended = Completion & {
  questions: Question[];
};
