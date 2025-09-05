import { GetServerSideProps } from 'next';
// // import { getAuth } from '@clerk/nextjs/server';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const UnifiedTrackerGrid = dynamic(() => import('@/modules/projects/tracker/UnifiedTrackerGrid').then(mod => mod.UnifiedTrackerGrid || mod.default), {
  ssr: false,
  loading: () => <div>Loading tracker...</div>
});

export default function ProjectTrackerPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id) return <div>Loading...</div>;
  
  return <UnifiedTrackerGrid projectId={id as string} />;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Authentication bypassed for demo
  // const { userId } = getAuth(ctx.req);
  // if (!userId) {
  //   return {
  //     redirect: {
  //       destination: '/sign-in',
  //       permanent: false,
  //     },
  //   };
  // }

  return { props: {} };
};