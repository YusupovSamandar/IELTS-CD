import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import {
  CustomResizablePanel,
  ResizableHandle,
  ResizablePanelGroup
} from '../../ui/resizable';
import PartRender from './part-render';

const ReviewAndExplainRender = async ({
  assessmentId,
  partIndex
}: {
  assessmentId: string;
  partIndex?: number;
}) => {
  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
    include: { parts: { orderBy: { order: 'asc' } } }
  });
  if (!assessment) {
    return notFound();
  }
  const part = partIndex ? assessment.parts[partIndex] : assessment.parts[0];
  return (
    <div className="min-h-[600px] flex flex-col border rounded-lg border-border bg-card">
      <div className="font-bold text-xl bg-muted p-4 rounded-t-lg border-b">
        Review And Explanation
      </div>
      <div className="flex-grow p-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Loading...
            </div>
          }
        >
          <PartRender part={part} totalParts={assessment.parts.length} />
        </Suspense>
      </div>
    </div>
  );
};

export default ReviewAndExplainRender;
