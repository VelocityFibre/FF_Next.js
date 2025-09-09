import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DropsManagement } from '@/src/modules/projects/drops/DropsManagement';

export default function DropsPage() {
  return (
    <AppLayout>
      <DropsManagement />
    </AppLayout>
  );
}