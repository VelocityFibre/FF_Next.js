import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DropsManagement } from '@/modules/projects/drops/DropsManagement';

export default function DropsPage() {
  return (
    <AppLayout>
      <DropsManagement />
    </AppLayout>
  );
}

// Prevent static generation to avoid router mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};