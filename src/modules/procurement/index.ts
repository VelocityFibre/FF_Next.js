// Procurement Module - Main Exports
// Following FibreFlow Universal Module Structure

// Main Layout and Navigation
export { ProcurementLayout } from './components/layout/ProcurementLayout';
export { ProcurementDashboard } from './components/ProcurementDashboard';

// BOQ Management
export { BOQDashboard } from './boq/components/BOQDashboard';
export { BOQUpload } from './boq/components/BOQUpload';
export { BOQMappingReview } from './boq/components/BOQMappingReview';
export { BOQViewer } from './boq/components/BOQViewer';
export { BOQHistory } from './boq/components/BOQHistory';
export { BOQCreate } from './boq/components/BOQCreate';
export { BOQEdit } from './boq/components/BOQEdit';
export { BOQView } from './boq/components/BOQView';
export { BOQList } from './boq/components/BOQList';
export { BOQDetail } from './boq/components/BOQDetail';

// RFQ Management
export { RFQDashboard } from './rfq/components/RFQDashboard';
export { RFQBuilder } from './rfq/components/RFQBuilder';
export { RFQDistribution } from './rfq/components/RFQDistribution';
export { RFQTracking } from './rfq/components/RFQTracking';
export { RFQArchive } from './rfq/components/RFQArchive';
export { RFQCreate } from './rfq/components/RFQCreate';
export { RFQEdit } from './rfq/components/RFQEdit';
export { RFQView } from './rfq/components/RFQView';
export { RFQList } from './rfq/components/RFQList';
export { RFQDetail } from './rfq/components/RFQDetail';

// Quote Evaluation
export { QuoteEvaluationDashboard } from './quote-evaluation/components/QuoteEvaluationDashboard';
export { QuoteComparison } from './quote-evaluation/components/QuoteComparison';
export { EvaluationMatrix } from './quote-evaluation/components/EvaluationMatrix';
export { AwardProcess } from './quote-evaluation/components/AwardProcess';
export { QuoteHistory } from './quote-evaluation/components/QuoteHistory';

// Supplier Portal
export { SupplierPortalDashboard } from './supplier-portal/components/SupplierPortalDashboard';
export { SupplierDashboard } from './supplier-portal/components/SupplierDashboard';
export { RFQResponse } from './supplier-portal/components/RFQResponse';
export { DocumentManagement } from './supplier-portal/components/DocumentManagement';
export { CommunicationCenter } from './supplier-portal/components/CommunicationCenter';

// Stock Management
export { StockManagementDashboard } from './stock/components/StockManagementDashboard';
export { StockDashboard } from './stock/components/StockDashboard';
export { GoodsReceipt } from './stock/components/GoodsReceipt';
export { StockMovements } from './stock/components/StockMovements';
export { DrumTracking } from './stock/components/DrumTracking';

// Purchase Orders
export { PurchaseOrderDashboard } from './purchase-orders/components/PurchaseOrderDashboard';
export { PurchaseOrderCreate } from './purchase-orders/components/PurchaseOrderCreate';
export { PurchaseOrderEdit } from './purchase-orders/components/PurchaseOrderEdit';
export { PurchaseOrderView } from './purchase-orders/components/PurchaseOrderView';
export { PurchaseOrderList } from './purchase-orders/components/PurchaseOrderList';
export { PurchaseOrderDetail } from './purchase-orders/components/PurchaseOrderDetail';

// Reporting
export { ProcurementReporting } from './reporting/components/ProcurementReporting';
export { KPIDashboard } from './reporting/components/KPIDashboard';
export { CostAnalysis } from './reporting/components/CostAnalysis';
export { SupplierPerformance } from './reporting/components/SupplierPerformance';
export { ComplianceReports } from './reporting/components/ComplianceReports';

// Shared Components
export { ProcurementErrorBoundary } from './components/error/ProcurementErrorBoundary';
export { ProcurementCard } from './components/common/ProcurementCard';
export { ProcurementTable } from './components/common/ProcurementTable';
export { ProcurementFilters } from './components/common/ProcurementFilters';
export { ProcurementBreadcrumbs } from './components/common/ProcurementBreadcrumbs';

// Hooks
export { useProcurement } from './hooks/useProcurement';
export { useBoqs } from './hooks/useBoqs';
export { useRfqs } from './hooks/useRfqs';
export { useQuotes } from './hooks/useQuotes';
export { useStock } from './hooks/useStock';
export { useProcurementPermissions } from './hooks/useProcurementPermissions';

// Types
export type * from './types';

// Constants and Utils
export * from './constants/procurementConstants';
export * from './utils/procurementUtils';