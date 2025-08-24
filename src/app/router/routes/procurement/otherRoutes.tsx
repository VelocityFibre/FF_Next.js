import { Suspense } from 'react';
import { Loading } from '../../components';
import {
  // Quote Evaluation
  QuoteEvaluationDashboard,
  QuoteComparison,
  EvaluationMatrix,
  AwardProcess,
  QuoteHistory,
  
  // Purchase Orders
  PurchaseOrderDashboard,
  PurchaseOrderCreate,
  PurchaseOrderEdit,
  PurchaseOrderView,
  PurchaseOrderList,
  
  // Supplier Portal
  SupplierPortalDashboard,
  SuppliersPage,
  
  // Reporting
  ProcurementReporting,
  ProcurementKPIDashboard,
  CostAnalysis,
  SupplierPerformance,
  ComplianceReports
} from '../../lazyImports';

export const quoteEvaluationRoutes = {
  path: 'quote-evaluation',
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<Loading />}>
          <QuoteEvaluationDashboard />
        </Suspense>
      ),
    },
    {
      path: 'comparison',
      element: (
        <Suspense fallback={<Loading />}>
          <QuoteComparison />
        </Suspense>
      ),
    },
    {
      path: 'matrix',
      element: (
        <Suspense fallback={<Loading />}>
          <EvaluationMatrix />
        </Suspense>
      ),
    },
    {
      path: 'award',
      element: (
        <Suspense fallback={<Loading />}>
          <AwardProcess />
        </Suspense>
      ),
    },
    {
      path: 'history',
      element: (
        <Suspense fallback={<Loading />}>
          <QuoteHistory />
        </Suspense>
      ),
    },
  ],
};

export const purchaseOrderRoutes = {
  path: 'purchase-orders',
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<Loading />}>
          <PurchaseOrderDashboard />
        </Suspense>
      ),
    },
    {
      path: 'list',
      element: (
        <Suspense fallback={<Loading />}>
          <PurchaseOrderList />
        </Suspense>
      ),
    },
    {
      path: 'create',
      element: (
        <Suspense fallback={<Loading />}>
          <PurchaseOrderCreate />
        </Suspense>
      ),
    },
    {
      path: ':id/edit',
      element: (
        <Suspense fallback={<Loading />}>
          <PurchaseOrderEdit />
        </Suspense>
      ),
    },
    {
      path: ':id/view',
      element: (
        <Suspense fallback={<Loading />}>
          <PurchaseOrderView />
        </Suspense>
      ),
    },
  ],
};

export const supplierPortalRoutes = {
  path: 'suppliers',
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<Loading />}>
          <SupplierPortalDashboard />
        </Suspense>
      ),
    },
    {
      path: 'list',
      element: (
        <Suspense fallback={<Loading />}>
          <SuppliersPage />
        </Suspense>
      ),
    },
  ],
};

export const reportingRoutes = {
  path: 'reporting',
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<Loading />}>
          <ProcurementReporting />
        </Suspense>
      ),
    },
    {
      path: 'kpi',
      element: (
        <Suspense fallback={<Loading />}>
          <ProcurementKPIDashboard />
        </Suspense>
      ),
    },
    {
      path: 'cost-analysis',
      element: (
        <Suspense fallback={<Loading />}>
          <CostAnalysis />
        </Suspense>
      ),
    },
    {
      path: 'supplier-performance',
      element: (
        <Suspense fallback={<Loading />}>
          <SupplierPerformance />
        </Suspense>
      ),
    },
    {
      path: 'compliance',
      element: (
        <Suspense fallback={<Loading />}>
          <ComplianceReports />
        </Suspense>
      ),
    },
  ],
};