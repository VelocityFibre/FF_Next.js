/**
 * BOQ Viewer Table Component
 */

import { ArrowUpDown } from 'lucide-react';
import { BOQItem } from '@/types/procurement/boq.types';
import { EditingItem, SortField, VisibleColumns } from './BOQViewerTypes';
import BOQViewerTableRow from './BOQViewerTableRow';

interface BOQViewerTableProps {
  items: BOQItem[];
  mode: 'view' | 'edit';
  editingItems: Map<string, EditingItem>;
  visibleColumns: VisibleColumns;
  sortField: SortField;
  onSort: (field: SortField) => void;
  onStartEdit: (item: BOQItem) => void;
  onCancelEdit: (itemId: string) => void;
  onUpdateEdit: (itemId: string, field: keyof BOQItem, value: any) => void;
  onSaveEdit: (itemId: string) => void;
  isSaving: boolean;
}

export default function BOQViewerTable({
  items,
  mode,
  editingItems,
  visibleColumns,
  sortField,
  onSort,
  onStartEdit,
  onCancelEdit,
  onUpdateEdit,
  onSaveEdit,
  isSaving
}: BOQViewerTableProps) {
  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center space-x-1 hover:text-gray-700 ${
        sortField === field ? 'text-gray-900 font-medium' : 'text-gray-500'
      }`}
    >
      <span>{label}</span>
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {mode === 'edit' && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
            
            {visibleColumns.lineNumber && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="lineNumber" label="Line #" />
              </th>
            )}
            
            {visibleColumns.itemCode && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Code
              </th>
            )}
            
            {visibleColumns.description && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="description" label="Description" />
              </th>
            )}
            
            {visibleColumns.category && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
            )}
            
            {visibleColumns.quantity && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="quantity" label="Quantity" />
              </th>
            )}
            
            {visibleColumns.uom && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UOM
              </th>
            )}
            
            {visibleColumns.unitPrice && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="unitPrice" label="Unit Price" />
              </th>
            )}
            
            {visibleColumns.totalPrice && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="totalPrice" label="Total Price" />
              </th>
            )}
            
            {visibleColumns.mappingStatus && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="mappingConfidence" label="Mapping" />
              </th>
            )}
            
            {visibleColumns.procurementStatus && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Procurement
              </th>
            )}
            
            {visibleColumns.phase && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phase
              </th>
            )}
            
            {visibleColumns.task && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
            )}
            
            {visibleColumns.site && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
            )}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <BOQViewerTableRow
              key={item.id}
              item={item}
              mode={mode}
              editing={editingItems.get(item.id)}
              visibleColumns={visibleColumns}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onUpdateEdit={onUpdateEdit}
              onSaveEdit={onSaveEdit}
              isSaving={isSaving}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}