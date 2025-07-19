/*
  Warnings:

  - The values [MATCHING,MATCHING_HEADING] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Matching` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchingChoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('MULTIPLE_CHOICE_ONE_ANSWER', 'MULTIPLE_CHOICE_MORE_ANSWERS', 'IDENTIFYING_INFORMATION', 'COMPLETION', 'TABLE_COMPLETION');
ALTER TABLE "QuestionGroup" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Matching" DROP CONSTRAINT "Matching_questionGroupId_fkey";

-- DropForeignKey
ALTER TABLE "MatchingChoice" DROP CONSTRAINT "MatchingChoice_matchingId_fkey";

-- DropForeignKey
ALTER TABLE "MatchingChoice" DROP CONSTRAINT "MatchingChoice_questionId_fkey";

-- DropTable
DROP TABLE "Matching";

-- DropTable
DROP TABLE "MatchingChoice";
