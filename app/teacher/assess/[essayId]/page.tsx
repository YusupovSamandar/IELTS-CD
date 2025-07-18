import { notFound, redirect } from 'next/navigation';
import { currentUser } from '@/actions/auth/user';
import { db } from '@/lib/db';
import { EssayAssessmentClient } from './essay-assessment-client';

interface AssessEssayPageProps {
  params: {
    essayId: string;
  };
}

const AssessEssayPage = async ({ params }: AssessEssayPageProps) => {
  const user = await currentUser();

  if (!user || user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  const essay = await db.userEssay.findUnique({
    where: { id: params.essayId },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      assessment: {
        select: {
          name: true,
          sectionType: true
        }
      }
    }
  });

  if (!essay) {
    notFound();
  }

  // Check if this teacher owns this essay
  if (essay.teacherId !== user.id) {
    redirect('/teacher');
  }

  return (
    <div className="container mx-auto py-6">
      <EssayAssessmentClient essay={essay} currentEssayId={params.essayId} />
    </div>
  );
};

export default AssessEssayPage;
