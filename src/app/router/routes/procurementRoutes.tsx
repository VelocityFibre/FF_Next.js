import { Suspense } from 'react';
import { Loading } from '../components';
import {
  // Main Layout
  ProcurementLayout,
  ProcurementDashboard,
  
  // BOQ Management
  BOQDashboard,
  BOQCreate,
  BOQEdit,
  BOQView,
  BOQList,
  BOQUpload,
  BOQMappingReview,
  BOQViewer,
  BOQHistory,
  
  // RFQ Management
  RFQDashboard,
  RFQCreate,
  RFQEdit,
  RFQView,
  RFQList,
  RFQBuilder,
  RFQDistribution,
  RFQTracking,
  RFQArchive,
  
  // Quote Evaluation
  QuoteEvaluationDashboard,
  QuoteComparison,
  EvaluationMatrix,
  AwardProcess,
  QuoteHistory,
  
  // Stock Management
  StockManagementDashboard,
  StockDashboard,
  GoodsReceipt,
  StockMovements,
  DrumTracking,
  
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
} from '../lazyImports';

export const procurementRoutes = {
  path: 'procurement',
  element: (
    <Suspense fallback={<Loading />}>
      <ProcurementLayout />
    </Suspense>
  ),
  children: [
    // Main Dashboard
    {
      index: true,
      element: (
        <Suspense fallback={<Loading />}>
          <ProcurementDashboard />
        </Suspense>
      ),
    },
    
    // BOQ Management Routes
    {
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
          path: 'upload',
          element: (
            <Suspense fallback={<Loading />}>
              <BOQUpload />
            </Suspense>
          ),
        },
        {
          path: ':boqId',
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<Loading />}>
                  <BOQView />
                </Suspense>
              ),
            },
            {
              path: 'edit',
              element: (
                <Suspense fallback={<Loading />}>
                  <BOQEdit />
                </Suspense>
              ),
            },
            {
              path: 'mapping',
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
        },
      ],
    },
    
    // RFQ Management Routes
    {
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
          path: 'builder',
          element: (
            <Suspense fallback={<Loading />}>
              <RFQBuilder />
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
        {
          path: ':rfqId',
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<Loading />}>
                  <RFQView />
                </Suspense>
              ),
            },
            {
              path: 'edit',
              element: (
                <Suspense fallback={<Loading />}>
                  <RFQEdit />
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
          ],
        },
      ],
    },
    
    // Quote Evaluation Routes
    {
      path: 'quotes',
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
          path: 'evaluation',
          element: (
            <Suspense fallback={<Loading />}>
              <EvaluationMatrix />
            </Suspense>
          ),
        },
        {
          path: 'awards',
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
    },
    
    // Stock Management Routes
    {
      path: 'stock',
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loading />}>
              <StockManagementDashboard />
            </Suspense>
          ),
        },
        {
          path: 'dashboard',
          element: (
            <Suspense fallback={<Loading />}>
              <StockDashboard />
            </Suspense>
          ),
        },
        {
          path: 'goods-receipt',
          element: (
            <Suspense fallback={<Loading />}>
              <GoodsReceipt />
            </Suspense>
          ),
        },
        {
          path: 'movements',
          element: (
            <Suspense fallback={<Loading />}>
              <StockMovements />
            </Suspense>
          ),
        },
        {
          path: 'drums',
          element: (
            <Suspense fallback={<Loading />}>
              <DrumTracking />
            </Suspense>
          ),
        },
      ],
    },
    
    // Purchase Orders Routes
    {
      path: 'orders',
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
          path: ':orderId',
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<Loading />}>
                  <PurchaseOrderView />
                </Suspense>
              ),
            },
            {
              path: 'edit',
              element: (
                <Suspense fallback={<Loading />}>
                  <PurchaseOrderEdit />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
    
    // Supplier Management Routes
    {
      path: 'suppliers',
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<Loading />}>
              <SuppliersPage />
            </Suspense>
          ),
        },
        {
          path: 'portal',
          element: (
            <Suspense fallback={<Loading />}>
              <SupplierPortalDashboard />
            </Suspense>
          ),
        },
      ],
    },
    
    // Reporting Routes
    {
      path: 'reports',
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
    },
  ],
};