import { Prisma } from '@prisma/client';

// Test if the types are available
type YesNoNotGivenType = Prisma.YesNoNotGivenGetPayload<{}>;
type LetterAnswerType = Prisma.LetterAnswerGetPayload<{}>;

console.log('Types are available');
