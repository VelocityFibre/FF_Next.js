import { Suspense } from 'react';
import { Loading } from '../components';
import {
  ProcurementPage,
  ProcurementOverview,
  BOQListPage,
  RFQListPage,
  SuppliersPage
} from '../lazyImports';

export const procurementRoutes = {
  path: 'procurement',
  element: (
    <Suspense fallback={<Loading />}>
      <ProcurementPage />
    </Suspense>
  ),
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<Loading />}>
          <ProcurementOverview />
        </Suspense>
      ),
    },
    {
      path: 'boq',
      element: (
        <Suspense fallback={<Loading />}>
          <BOQListPage />
        </Suspense>
      ),
    },
    {
      path: 'rfq',
      element: (
        <Suspense fallback={<Loading />}>
          <RFQListPage />
        </Suspense>
      ),
    },
    {
      path: 'stock',
      element: <div className="p-6">Stock Management (Coming Soon)</div>,
    },
    {
      path: 'orders',
      element: <div className="p-6">Purchase Orders (Coming Soon)</div>,
    },
    {
      path: 'suppliers',
      element: (
        <Suspense fallback={<Loading />}>
          <SuppliersPage />
        </Suspense>
      ),
    },
  ],
};