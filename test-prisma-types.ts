// Test file to check Prisma types
import { db } from '@/lib/db';

async function testAssessmentUpdate() {
  // This should work if audioPath exists in Assessment model
  const result = await db.assessment.update({
    where: { id: 'test-id' },
    data: { audioPath: 'test-path' }
  });

  console.log(result);
}

testAssessmentUpdate();
