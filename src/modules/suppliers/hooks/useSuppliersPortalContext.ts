import { useSuppliersPortal } from '../context/SuppliersPortalContext';

// Re-export the hook with a more descriptive name for external use
export const useSuppliersPortalContext = useSuppliersPortal;

// Export individual pieces for granular access
export const useSelectedSupplier = () => {
  const { selectedSupplier, setSupplier } = useSuppliersPortal();
  return { selectedSupplier, setSupplier };
};

export const useSuppliersPortalTabs = () => {
  const { activeTab, setActiveTab, availableTabs } = useSuppliersPortal();
  return { activeTab, setActiveTab, availableTabs };
};

export const useSuppliersPortalState = () => {
  const { isLoading, error, setLoading, setError } = useSuppliersPortal();
  return { isLoading, error, setLoading, setError };
};

export const useSuppliersData = () => {
  const { suppliers, allSuppliersStats, loadSuppliers, refreshData } = useSuppliersPortal();
  return { suppliers, allSuppliersStats, loadSuppliers, refreshData };
};