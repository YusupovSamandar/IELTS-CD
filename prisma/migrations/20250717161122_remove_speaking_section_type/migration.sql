/*
  Warnings:

  - The values [SPEAKING] on the enum `SectionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SectionType_new" AS ENUM ('READING', 'LISTENING', 'WRITING');
ALTER TABLE "Assessment" ALTER COLUMN "sectionType" DROP DEFAULT;
ALTER TABLE "Assessment" ALTER COLUMN "sectionType" TYPE "SectionType_new" USING ("sectionType"::text::"SectionType_new");
ALTER TYPE "SectionType" RENAME TO "SectionType_old";
ALTER TYPE "SectionType_new" RENAME TO "SectionType";
DROP TYPE "SectionType_old";
ALTER TABLE "Assessment" ALTER COLUMN "sectionType" SET DEFAULT 'READING';
COMMIT;
