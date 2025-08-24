import { Suspense } from 'react';
import { Loading } from '../../components';
import {
  BOQDashboard,
  BOQCreate,
  BOQEdit,
  BOQView,
  BOQList,
  BOQUpload,
  BOQMappingReview,
  BOQViewer,
  BOQHistory,
} from '../../lazyImports';

export const boqRoutes = {
  path: 'boq',
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<Loading />}>
          <BOQDashboard />
        </Suspense>
      ),
    },
    {
      path: 'list',
      element: (
        <Suspense fallback={<Loading />}>
          <BOQList />
        </Suspense>
      ),
    },
    {
      path: 'create',
      element: (
        <Suspense fallback={<Loading />}>
          <BOQCreate />
        </Suspense>
      ),
    },
    {
      path: ':id/edit',
      element: (
        <Suspense fallback={<Loading />}>
          <BOQEdit />
        </Suspense>
      ),
    },
    {
      path: ':id/view',
      element: (
        <Suspense fallback={<Loading />}>
          <BOQView />
        </Suspense>
      ),
    },
    {
      path: 'upload',
      element: (
        <Suspense fallback={<Loading />}>
          <BOQUpload />
        </Suspense>
      ),
    },
    {
      path: 'mapping-review',
      element: (
        <Suspense fallback={<Loading />}>
          <BOQMappingReview />
        </Suspense>
      ),
    },
    {
      path: 'viewer',
      element: (
        <Suspense fallback={<Loading />}>
          <BOQViewer />
        </Suspense>
      ),
    },
    {
      path: 'history',
      element: (
        <Suspense fallback={<Loading />}>
          <BOQHistory />
        </Suspense>
      ),
    },
  ],
};