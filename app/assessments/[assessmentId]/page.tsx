import { notFound, redirect } from 'next/navigation';
import { currentRole } from '@/actions/auth/user';
import { hasUserCompletedAssessment } from '@/actions/test-exam/check-completion';
import { AssessmentExtended } from '@/types/test-exam';
import { db } from '@/lib/db';
import { ParamsAssessmentPageSchema } from '@/lib/validations/params';
import AssessmentRender from '@/components/test-exam/assessment/render';

interface AssessmentIdPageProps {
  params: {
    assessmentId: string;
  };
  searchParams: {};
}
const AssessmentIdPage = async ({
  params,
  searchParams
}: AssessmentIdPageProps) => {
  const { mode } = ParamsAssessmentPageSchema.parse(searchParams);

  // Check if user has already completed this assessment
  if (mode === 'exam') {
    const userRole = await currentRole();
    const isCompleted = await hasUserCompletedAssessment(params.assessmentId);

    // Redirect regular users who have already completed the assessment
    if (isCompleted && userRole !== 'ADMIN') {
      // For writing assessments, redirect to home instead of score page
      const assessment = await db.assessment.findUnique({
        where: { id: params.assessmentId },
        select: { sectionType: true }
      });

      if (assessment?.sectionType === 'WRITING') {
        redirect('/');
      } else {
        redirect(`/score/${params.assessmentId}`);
      }
    }
  }

  const assessment: AssessmentExtended | null = await db.assessment.findUnique({
    where: {
      id: params.assessmentId
    },
    include: {
      questions: {
        orderBy: {
          questionNumber: 'asc'
        }
      },
      parts: {
        orderBy: {
          order: 'asc'
        },
        include: {
          questionGroups: {
            orderBy: {
              startQuestionNumber: 'asc'
            },
            include: {
              identifyInfoList: {
                orderBy: {
                  question: {
                    questionNumber: 'asc'
                  }
                },
                include: {
                  question: true
                }
              },
              questions: {
                orderBy: {
                  questionNumber: 'asc'
                }
              },
              completion: {
                include: {
                  questions: {
                    orderBy: {
                      questionNumber: 'asc'
                    }
                  }
                }
              },
              multiMoreList: {
                include: {
                  choices: {
                    orderBy: {
                      order: 'asc'
                    }
                  },
                  question: true
                },
                orderBy: {
                  question: {
                    questionNumber: 'asc'
                  }
                }
              },
              multiOneList: {
                include: {
                  choices: {
                    orderBy: {
                      order: 'asc'
                    }
                  },
                  question: true
                },
                orderBy: {
                  question: {
                    questionNumber: 'asc'
                  }
                }
              }
            }
          },
          passage: {
            include: {
              passageHeadingList: {
                orderBy: {
                  order: 'asc'
                }
              }
            }
          },
          questions: {
            orderBy: {
              questionNumber: 'asc'
            }
          },
          essayPart: true
        }
      }
    }
  });
  if (!assessment || !mode) {
    return notFound();
  }
  // Using client side because it is an exam, and user don't want to wait even 3s for just load data from the server
  return <AssessmentRender assessment={assessment} mode={mode} />;
};

export default AssessmentIdPage;
