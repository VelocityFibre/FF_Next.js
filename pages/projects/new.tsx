import { GetServerSideProps } from 'next';
// import { getAuth } from '@clerk/nextjs/server';
import dynamic from 'next/dynamic';

const ProjectCreationWizard = dynamic(() => import('@/modules/projects/components/ProjectWizard/ProjectCreationWizard').then(mod => mod.ProjectCreationWizard || mod.default), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function NewProjectPage() {
  return <ProjectCreationWizard />;
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