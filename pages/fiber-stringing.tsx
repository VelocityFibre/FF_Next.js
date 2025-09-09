import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FiberStringingDashboard } from '@/src/modules/projects/fiber-stringing/FiberStringingDashboard';

export default function FiberStringingPage() {
  return (
    <AppLayout>
      <FiberStringingDashboard />
    </AppLayout>
  );
}