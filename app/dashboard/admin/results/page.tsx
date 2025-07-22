import { getUserResults } from '@/actions/admin/user-results';
import { ResultsClient } from './results-client';

export default async function UserResultsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query =
    typeof searchParams.query === 'string' ? searchParams.query : undefined;
  const usersWithResults = await getUserResults({ query });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-100 to-blue-300 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            User Results
          </h1>
          <p className="text-lg text-blue-700">
            View and manage user assessment results.
          </p>
        </div>
        <ResultsClient usersWithResults={usersWithResults} />
      </div>
    </div>
  );
}
