// 🟢 WORKING: Router integration for procurement portal tabs
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProcurementPortalPage } from '../ProcurementPortalPage';
import {
  DashboardTab,
  BOQTab,
  RFQTab,
  QuoteEvaluationTab,
  StockMovementTab,
  PurchaseOrdersTab,
  SuppliersTab,
  ReportsTab
} from './tabs';

/**
 * Procurement Portal Router Component
 * Handles routing for all procurement portal tabs
 */
export function ProcurementPortalRouter() {
  return (
    <ProcurementPortalPage>
      <Routes>
        {/* Default redirect to dashboard */}
        <Route 
          path="/" 
          element={<Navigate to="?tab=overview" replace />} 
        />
        
        {/* Dashboard/Overview Tab */}
        <Route 
          path="/overview" 
          element={<DashboardTab />} 
        />
        
        {/* BOQ Tab */}
        <Route 
          path="/boq/*" 
          element={<BOQTab />} 
        />
        
        {/* RFQ Tab */}
        <Route 
          path="/rfq/*" 
          element={<RFQTab />} 
        />
        
        {/* Quote Evaluation Tab */}
        <Route 
          path="/quotes/*" 
          element={<QuoteEvaluationTab />} 
        />
        
        {/* Purchase Orders Tab */}
        <Route 
          path="/orders/*" 
          element={<PurchaseOrdersTab />} 
        />
        
        {/* Stock Movement Tab */}
        <Route 
          path="/stock/*" 
          element={<StockMovementTab />} 
        />
        
        {/* Suppliers Tab */}
        <Route 
          path="/suppliers/*" 
          element={<SuppliersTab />} 
        />
        
        {/* Reports Tab */}
        <Route 
          path="/reports/*" 
          element={<ReportsTab />} 
        />
        
        {/* Catch-all redirect */}
        <Route 
          path="*" 
          element={<Navigate to="?tab=overview" replace />} 
        />
      </Routes>
    </ProcurementPortalPage>
  );
}

/**
 * Helper function to get the current tab from URL
 */
export function getCurrentTabFromPath(pathname: string): string {
  if (pathname.includes('/boq')) return 'boq';
  if (pathname.includes('/rfq')) return 'rfq';
  if (pathname.includes('/quotes')) return 'quotes';
  if (pathname.includes('/orders')) return 'orders';
  if (pathname.includes('/stock')) return 'stock';
  if (pathname.includes('/suppliers')) return 'suppliers';
  if (pathname.includes('/reports')) return 'reports';
  return 'overview';
}

/**
 * Helper function to get path for a tab
 */
export function getTabPath(tabId: string): string {
  const tabPaths = {
    overview: '/app/procurement',
    boq: '/app/procurement/boq',
    rfq: '/app/procurement/rfq',
    quotes: '/app/procurement/quotes',
    'purchase-orders': '/app/procurement/orders',
    stock: '/app/procurement/stock',
    suppliers: '/app/procurement/suppliers',
    reports: '/app/procurement/reports'
  };
  
  return tabPaths[tabId as keyof typeof tabPaths] || '/app/procurement';
}