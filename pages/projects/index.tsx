import { GetServerSideProps } from 'next';
// import { getAuth } from '@clerk/nextjs/server';
import dynamic from 'next/dynamic';

// Dynamically import the Projects component to avoid SSR issues
const ProjectList = dynamic(() => import('@/modules/projects/components/ProjectList').then(mod => mod.ProjectList || mod.default), {
  ssr: false,
  loading: () => <div>Loading projects...</div>
});

export default function ProjectsPage() {
  return <ProjectList />;
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