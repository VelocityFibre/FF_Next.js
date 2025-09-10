import { PoleCaptureMobile } from '@/modules/projects/pole-tracker/mobile/PoleCaptureMobile';

export default function PoleCapturePage() {
  return <PoleCaptureMobile />;
}

// Prevent static generation to avoid router mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};