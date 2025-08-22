import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Package, FileText, Send, ShoppingCart, BarChart3, Truck } from 'lucide-react';

export function ProcurementPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/app/procurement' },
    { id: 'stock', label: 'Stock', icon: Package, path: '/app/procurement/stock' },
    { id: 'boq', label: 'BOQ', icon: FileText, path: '/app/procurement/boq' },
    { id: 'rfq', label: 'RFQ', icon: Send, path: '/app/procurement/rfq' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/app/procurement/orders' },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, path: '/app/procurement/suppliers' },
  ];

  const activeTab = tabs.find(tab => 
    location.pathname === tab.path || 
    (tab.id !== 'overview' && location.pathname.startsWith(tab.path))
  )?.id || 'overview';

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    flex items-center gap-2 transition-colors
                    ${isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
}