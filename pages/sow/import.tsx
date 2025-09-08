import { GetServerSideProps } from 'next';
import { getAuth } from '../../lib/auth-mock';
import dynamic from 'next/dynamic';

const SOWImportPage = dynamic(() => import('@/modules/sow/SOWImportPage').then(mod => mod.SOWImportPage || mod.default), {
  ssr: false,
  loading: () => <div>Loading SOW import...</div>
});

export default function SOWImportPageWrapper() {
  return <SOWImportPage />;
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