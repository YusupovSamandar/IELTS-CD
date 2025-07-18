import { Suspense } from 'react';
import { db } from '@/lib/db';
import PartRenderKey from './part-render-key';

const AnswerKeysSection = async ({
  assessmentId
}: {
  assessmentId: string;
}) => {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: { parts: { select: { id: true } } }
  });

  if (!assessment) {
    return null;
  }

  return (
    <div className="mt-8 bg-card border rounded-lg p-6 shadow-sm">
      <p className="font-bold text-xl mb-4 text-foreground">Answer Keys</p>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            Loading answer keys...
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {assessment.parts.map((part) => (
            <PartRenderKey partId={part.id} key={part.id} />
          ))}
        </div>
      </Suspense>
    </div>
  );
};

export default AnswerKeysSection;
