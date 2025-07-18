import { currentUser } from '@/actions/auth/user';
import { getUserEssaysForTeacher } from '@/actions/test-exam/user-essay';
import { UserRole } from '@prisma/client';
import { TeacherDashboardClient } from './teacher-dashboard-client';

const TeacherPage = async () => {
  const user = await currentUser();

  if (!user || user.role !== UserRole.TEACHER) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">
              Access Denied
            </h1>
            <p className="text-muted-foreground">
              You don&apos;t have permission to access this page. This page is
              only available for teachers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const essays = await getUserEssaysForTeacher();

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and assess student writing submissions
          </p>
        </div>

        <TeacherDashboardClient essays={essays} />
      </div>
    </div>
  );
};

export default TeacherPage;
