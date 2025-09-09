import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomeInstallsDashboard } from '@/src/modules/projects/home-installs/HomeInstallsDashboard';

export default function InstallationsPage() {
  return (
    <AppLayout>
      <HomeInstallsDashboard />
    </AppLayout>
  );
}