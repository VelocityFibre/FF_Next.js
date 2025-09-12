import { GetServerSideProps } from 'next';
import { getAuth } from '../../lib/auth-mock';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use dynamic import with proper loading state
const ProjectCreationWizard = dynamic(
  () => import('@/modules/projects/components/ProjectWizard/ProjectCreationWizard').then(
    (mod) => mod.ProjectCreationWizard
  ),
  {
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectCreationWizard />
    </Suspense>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);

  if (!userId) {
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    };
  }

  return { props: {} };
};