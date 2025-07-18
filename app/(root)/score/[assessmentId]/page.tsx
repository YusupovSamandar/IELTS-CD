import { Suspense } from 'react';
import { ParamsScorePageSchema } from '@/lib/validations/params';
import ScoreHeaderRender from '@/components/score/header';
import ResetSubmitState from '@/components/score/reset-submit-state';
import ReviewAndExplainRender from '@/components/score/review-and-explain';
import { Shell } from '@/components/shells/shell';

interface ScorePageProps {
  params: {
    assessmentId: string;
  };
  searchParams: {};
}
async function ScorePage({ params, searchParams }: ScorePageProps) {
  const { part: partIndex } = ParamsScorePageSchema.parse(searchParams);
  return (
    <div className=" container mt-4">
      <ResetSubmitState />

      {/* Thank you message */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Thank you for taking the exam
        </h1>
        <p className="text-lg text-muted-foreground">Here are your results:</p>
      </div>

      <Suspense fallback={<></>}>
        <ScoreHeaderRender assessmentId={params.assessmentId} />
      </Suspense>
      {/* Review and Explanation - Temporarily commented out */}
      {/* <Suspense fallback={<></>}>
        <ReviewAndExplainRender
          assessmentId={params.assessmentId}
          partIndex={Number(partIndex)}
        />
      </Suspense> */}
      <br />
    </div>
  );
}

export default ScorePage;
