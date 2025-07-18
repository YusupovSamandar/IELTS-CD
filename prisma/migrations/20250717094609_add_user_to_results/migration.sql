/*
  Warnings:

  - A unique constraint covering the columns `[userId,assessmentId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Result_assessmentId_key";

-- First, add the userId column as nullable
ALTER TABLE "Result" ADD COLUMN "userId" TEXT;

-- Update existing results to assign them to the first user (or create a default user)
-- This assumes there's at least one user in the database
DO $$
DECLARE
    first_user_id TEXT;
BEGIN
    -- Get the first user ID
    SELECT id INTO first_user_id FROM "User" LIMIT 1;
    
    -- If no users exist, create a default admin user
    IF first_user_id IS NULL THEN
        INSERT INTO "User" (id, email, name, role) 
        VALUES (gen_random_uuid()::text, 'admin@test.com', 'Admin User', 'ADMIN')
        RETURNING id INTO first_user_id;
    END IF;
    
    -- Update all existing results to belong to this user
    UPDATE "Result" SET "userId" = first_user_id WHERE "userId" IS NULL;
END $$;

-- Now make the userId column required
ALTER TABLE "Result" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Result_userId_assessmentId_key" ON "Result"("userId", "assessmentId");

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
