'use client';

import { ExtendedUser } from '@/auth';
import { Assessment } from '@prisma/client';
import { AssessmentCard } from '@/components/assessment-card';
import { ContentSection } from '@/components/content-section';

interface RootPageClientProps {
  assessments: Assessment[];
  user: ExtendedUser | null;
}

export const RootPageClient = ({ assessments, user }: RootPageClientProps) => {
  return (
    <ContentSection
      title="Available exams"
      href="/"
      linkText="View all test"
      className="pt-8 md:pt-10 lg:pt-12"
    >
      {assessments.map((assessment) => (
        <AssessmentCard
          key={assessment.id}
          assessment={assessment}
          userRole={user?.role || 'USER'}
        />
      ))}
    </ContentSection>
  );
};
