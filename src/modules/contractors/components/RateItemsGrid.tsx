/**
 * Rate Items Grid Component
 * Table/grid interface for managing individual service rates within a rate card
 * Provides inline editing, bulk operations, and rate comparison
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  DollarSign, 
  Package, 
  Settings, 
  Search,
  AlertTriangle
} from 'lucide-react';

import { 
  ContractorRateItem,
  ServiceTemplate,
  RateItemsGridProps,
  ContractorRateItemFormData
} from '@/types/contractor';
import { RateItemApiService, ServiceTemplateApiService } from '@/services/contractor';
import { formatCurrency } from '@/lib/utils';

// 🟢 WORKING: Rate Items Grid Component
export function RateItemsGrid({ 
  rateCard,
  serviceTemplates = [],
  onRateItemAdd,
  onRateItemUpdate,
  onRateItemDelete,
  editable = true
}: RateItemsGridProps) {
  const [rateItems, setRateItems] = useState<ContractorRateItem[]>([]);
  const [templates, setTemplates] = useState<ServiceTemplate[]>(serviceTemplates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<ContractorRateItemFormData>>({});
  
  // Add new item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemData, setNewItemData] = useState<ContractorRateItemFormData>({
    serviceTemplateId: '',
    rate: 0,
    isNegotiable: false
  });
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'deliverable' | 'service' | ''>('');
  const [showOnlyNegotiable, setShowOnlyNegotiable] = useState(false);

  // 🟢 WORKING: Load rate items and templates
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [itemsResponse, templatesResponse] = await Promise.all([
          RateItemApiService.getRateItems(rateCard.id),
          serviceTemplates.length === 0 
            ? ServiceTemplateApiService.getServiceTemplates({ isActive: true })
            : Promise.resolve({ data: serviceTemplates })
        ]);
        
        setRateItems(itemsResponse);
        setTemplates(templatesResponse.data);
        
      } catch (err) {
        setError('Failed to load rate items');
        console.error('Error loading rate items:', err);
      } finally {
        setLoading(false);
      }
    };

    if (rateCard.id) {
      loadData();
    }
  }, [rateCard.id, serviceTemplates]);

  // 🟢 WORKING: Filtered items
  const filteredItems = useMemo(() => {
    let filtered = [...rateItems];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.serviceName.toLowerCase().includes(term) ||
        item.serviceCode?.toLowerCase().includes(term) ||
        item.unit.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Apply negotiable filter
    if (showOnlyNegotiable) {
      filtered = filtered.filter(item => item.isNegotiable);
    }
    
    return filtered;
  }, [rateItems, searchTerm, selectedCategory, showOnlyNegotiable]);

  // 🟢 WORKING: CRUD operations
  const handleAddItem = async () => {
    try {
      const selectedTemplate = templates.find(t => t.id === newItemData.serviceTemplateId);
      if (!selectedTemplate) {
        setError('Please select a service template');
        return;
      }

      const itemData: ContractorRateItemFormData = {
        ...newItemData,
        // Auto-populate from template if not provided
        ...(newItemData.minimumQuantity !== undefined ? { minimumQuantity: newItemData.minimumQuantity } : {}),
        ...(newItemData.maximumQuantity !== undefined ? { maximumQuantity: newItemData.maximumQuantity } : {}),
      };

      const newItem = await RateItemApiService.addRateItem(rateCard.id, itemData);
      
      setRateItems(prev => [...prev, newItem]);
      setShowAddForm(false);
      setNewItemData({
        serviceTemplateId: '',
        rate: 0,
        isNegotiable: false
      });
      
      onRateItemAdd?.(newItem);
      
    } catch (err) {
      console.error('Error adding rate item:', err);
      setError('Failed to add rate item');
    }
  };

  const handleStartEdit = (item: ContractorRateItem) => {
    setEditingItemId(item.id);
    setEditingData({
      rate: item.rate,
      ...(item.minimumQuantity !== undefined ? { minimumQuantity: item.minimumQuantity } : {}),
      ...(item.maximumQuantity !== undefined ? { maximumQuantity: item.maximumQuantity } : {}),
      ...(item.overheadPercentage !== undefined ? { overheadPercentage: item.overheadPercentage } : {}),
      ...(item.profitMargin !== undefined ? { profitMargin: item.profitMargin } : {}),
      isNegotiable: item.isNegotiable,
      ...(item.notes !== undefined ? { notes: item.notes } : {})
    });
  };

  const handleSaveEdit = async (itemId: string) => {
    try {
      const updatedItem = await RateItemApiService.updateRateItem(itemId, editingData);
      
      setRateItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      
      setEditingItemId(null);
      setEditingData({});
      
      onRateItemUpdate?.(updatedItem);
      
    } catch (err) {
      console.error('Error updating rate item:', err);
      setError('Failed to update rate item');
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingData({});
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this rate item?')) {
      return;
    }

    try {
      await RateItemApiService.deleteRateItem(itemId);
      
      setRateItems(prev => prev.filter(item => item.id !== itemId));
      
      onRateItemDelete?.(itemId);
      
    } catch (err) {
      console.error('Error deleting rate item:', err);
      setError('Failed to delete rate item');
    }
  };

  // 🟢 WORKING: Service Template Selector
  const ServiceTemplateSelect: React.FC<{
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
  }> = ({ value, onChange, disabled = false }) => {
    const availableTemplates = templates.filter(template => 
      !rateItems.some(item => item.serviceTemplateId === template.id) || 
      template.id === value
    );

    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="">Select service...</option>
        {availableTemplates.map(template => (
          <option key={template.id} value={template.id}>
            {template.code ? `${template.code} - ` : ''}{template.name}
          </option>
        ))}
      </select>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading rate items...</span>
      </div>
    );
  }

  return (
    <div className="rate-items-grid">
      {/* Header with filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Service Rates</h3>
            <p className="text-sm text-gray-500">
              {filteredItems.length} of {rateItems.length} services
            </p>
          </div>
          {editable && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </button>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services by name, code, or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Categories</option>
            <option value="deliverable">Deliverables</option>
            <option value="service">Services</option>
          </select>

          {/* Negotiable filter */}
          <label className="flex items-center space-x-2 px-3 py-2">
            <input
              type="checkbox"
              checked={showOnlyNegotiable}
              onChange={(e) => setShowOnlyNegotiable(e.target.checked)}
              className="rounded text-sm"
            />
            <span className="text-sm text-gray-700">Negotiable only</span>
          </label>
        </div>
      </div>

      {/* Add new item form */}
      {showAddForm && editable && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Add New Service Rate</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Template
              </label>
              <ServiceTemplateSelect
                value={newItemData.serviceTemplateId}
                onChange={(value) => {
                  const template = templates.find(t => t.id === value);
                  setNewItemData(prev => ({
                    ...prev,
                    serviceTemplateId: value,
                    // Auto-fill from template
                    rate: template?.baseRate || prev.rate
                  }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate ({rateCard.currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={newItemData.rate}
                onChange={(e) => setNewItemData(prev => ({
                  ...prev,
                  rate: parseFloat(e.target.value) || 0
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                &nbsp;
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddItem}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  disabled={!newItemData.serviceTemplateId || newItemData.rate <= 0}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewItemData({
                      serviceTemplateId: '',
                      rate: 0,
                      isNegotiable: false
                    });
                  }}
                  className="px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rate items table */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rate items found</h3>
          <p className="text-gray-500 mb-4">
            {rateItems.length === 0 
              ? 'Add service rates to complete this rate card'
              : 'Try adjusting your filters or search terms'
            }
          </p>
          {rateItems.length === 0 && editable && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add First Service
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margins
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Negotiable
                  </th>
                  {editable && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {/* Service name and category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {item.category === 'deliverable' ? (
                            <Package className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Settings className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.serviceName}
                          </div>
                          {item.serviceCode && (
                            <div className="text-sm text-gray-500">
                              Code: {item.serviceCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.unit}
                    </td>

                    {/* Rate */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItemId === item.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editingData.rate || 0}
                          onChange={(e) => setEditingData(prev => ({
                            ...prev,
                            rate: parseFloat(e.target.value) || 0
                          }))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.rate, rateCard.currency)}
                        </div>
                      )}
                    </td>

                    {/* Margins */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.overheadPercentage && (
                          <div>Overhead: {item.overheadPercentage}%</div>
                        )}
                        {item.profitMargin && (
                          <div>Profit: {item.profitMargin}%</div>
                        )}
                        {!item.overheadPercentage && !item.profitMargin && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* Negotiable */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItemId === item.id ? (
                        <input
                          type="checkbox"
                          checked={editingData.isNegotiable || false}
                          onChange={(e) => setEditingData(prev => ({
                            ...prev,
                            isNegotiable: e.target.checked
                          }))}
                          className="rounded text-blue-600"
                        />
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isNegotiable
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isNegotiable ? 'Yes' : 'No'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    {editable && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingItemId === item.id ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}