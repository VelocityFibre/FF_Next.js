import { Suspense } from 'react';
import { Loading } from '../components';
import { ProcurementLayout, ProcurementDashboard } from '../lazyImports';
import { boqRoutes } from './procurement/boqRoutes';
import { rfqRoutes } from './procurement/rfqRoutes';
import { stockRoutes } from './procurement/stockRoutes';
import { 
  quoteEvaluationRoutes, 
  purchaseOrderRoutes, 
  supplierPortalRoutes, 
  reportingRoutes 
} from './procurement/otherRoutes';

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
    
    // Sub-route modules
    boqRoutes,
    rfqRoutes,
    stockRoutes,
    quoteEvaluationRoutes,
    purchaseOrderRoutes,
    supplierPortalRoutes,
    reportingRoutes,
  ],
};