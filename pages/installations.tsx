import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomeInstallsDashboard } from '@/modules/projects/home-installs/HomeInstallsDashboard';

export default function InstallationsPage() {
  return (
    <AppLayout>
      <HomeInstallsDashboard />
    </AppLayout>
  );
}

// Prevent static generation to avoid router mounting issues
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};