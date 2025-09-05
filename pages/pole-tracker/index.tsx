import { GetServerSideProps } from 'next';
// import { getAuth } from '@clerk/nextjs/server';
import dynamic from 'next/dynamic';

const PoleTrackerDashboard = dynamic(() => import('@/modules/projects/pole-tracker/PoleTrackerDashboard').then(mod => mod.PoleTrackerDashboard || mod.default), {
  ssr: false,
  loading: () => <div>Loading pole tracker...</div>
});

export default function PoleTrackerPage() {
  return <PoleTrackerDashboard />;
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