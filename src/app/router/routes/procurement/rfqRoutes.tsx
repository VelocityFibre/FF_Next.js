import { Suspense } from 'react';
import { Loading } from '../../components';
import {
  RFQDashboard,
  RFQCreate,
  RFQEdit,
  RFQView,
  RFQList,
  RFQBuilder,
  RFQDistribution,
  RFQTracking,
  RFQArchive,
} from '../../lazyImports';

export const rfqRoutes = {
  path: 'rfq',
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<Loading />}>
          <RFQDashboard />
        </Suspense>
      ),
    },
    {
      path: 'list',
      element: (
        <Suspense fallback={<Loading />}>
          <RFQList />
        </Suspense>
      ),
    },
    {
      path: 'create',
      element: (
        <Suspense fallback={<Loading />}>
          <RFQCreate />
        </Suspense>
      ),
    },
    {
      path: ':id/edit',
      element: (
        <Suspense fallback={<Loading />}>
          <RFQEdit />
        </Suspense>
      ),
    },
    {
      path: ':id/view',
      element: (
        <Suspense fallback={<Loading />}>
          <RFQView />
        </Suspense>
      ),
    },
    {
      path: 'builder',
      element: (
        <Suspense fallback={<Loading />}>
          <RFQBuilder />
        </Suspense>
      ),
    },
    {
      path: 'distribution',
      element: (
        <Suspense fallback={<Loading />}>
          <RFQDistribution />
        </Suspense>
      ),
    },
    {
      path: 'tracking',
      element: (
        <Suspense fallback={<Loading />}>
          <RFQTracking />
        </Suspense>
      ),
    },
    {
      path: 'archive',
      element: (
        <Suspense fallback={<Loading />}>
          <RFQArchive />
        </Suspense>
      ),
    },
  ],
};