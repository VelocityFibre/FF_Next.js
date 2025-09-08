import { GetServerSideProps } from 'next';
import { getAuth } from '../../lib/auth-mock';
import dynamic from 'next/dynamic';

const SOWDashboard = dynamic(() => import('@/modules/sow/SOWDashboard').then(mod => mod.SOWDashboard || mod.default), {
  ssr: false,
  loading: () => <div>Loading SOW dashboard...</div>
});

export default function SOWDashboardPage() {
  return <SOWDashboard />;
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