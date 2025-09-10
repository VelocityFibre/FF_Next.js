import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FiberStringingDashboard } from '@/modules/projects/fiber-stringing/FiberStringingDashboard';

export default function FiberStringingPage() {
  return (
    <AppLayout>
      <FiberStringingDashboard />
    </AppLayout>
  );
}

// Prevent static generation to avoid router mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};