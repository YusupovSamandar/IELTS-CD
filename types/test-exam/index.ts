import {
  Assessment,
  Choice,
  Completion,
  EssayPart,
  IdentifyingInformation,
  MultipleChoiceMoreAnswers,
  MultipleChoiceOneAnswer,
  Part,
  Passage,
  PassageHeading,
  Question,
  QuestionGroup,
  QuestionType,
  YesNoNotGiven
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
export type YesNoNotGivenExtended = YesNoNotGiven & {
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
