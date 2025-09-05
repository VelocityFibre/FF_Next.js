import { GetServerSideProps } from 'next';
// import { getAuth } from '@clerk/nextjs/server';
import dynamic from 'next/dynamic';

const SOWListPage = dynamic(() => import('@/modules/sow/SOWListPage').then(mod => mod.SOWListPage || mod.default), {
  ssr: false,
  loading: () => <div>Loading SOW list...</div>
});

export default function SOWListPageWrapper() {
  return <SOWListPage />;
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