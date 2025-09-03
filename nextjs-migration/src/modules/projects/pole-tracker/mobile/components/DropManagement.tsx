import { DropData } from '../../types/pole-tracker.types';
import { PoleFormData } from '../types/poleCapture.types';

interface DropManagementProps {
  formData: PoleFormData;
  onAddDrop: () => void;
  onUpdateDrop: (index: number, field: keyof DropData, value: string) => void;
}

export function DropManagement({ formData, onAddDrop, onUpdateDrop }: DropManagementProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-neutral-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-neutral-700">
          Drops ({formData.currentDrops}/{formData.maxDrops})
        </h3>
        {formData.currentDrops < formData.maxDrops && (
          <button
            onClick={onAddDrop}
            className="text-primary-600 text-sm"
          >
            + Add Drop
          </button>
        )}
      </div>
      
      {formData.drops.map((drop, index) => (
        <div key={index} className="mb-3 p-3 bg-neutral-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={drop.dropNumber}
              onChange={(e) => onUpdateDrop(index, 'dropNumber', e.target.value)}
              placeholder="Drop #"
              className="px-2 py-1 text-sm border border-neutral-300 rounded"
            />
            <input
              type="text"
              value={drop.customerName}
              onChange={(e) => onUpdateDrop(index, 'customerName', e.target.value)}
              placeholder="Customer"
              className="px-2 py-1 text-sm border border-neutral-300 rounded"
            />
          </div>
          <input
            type="text"
            value={drop.address}
            onChange={(e) => onUpdateDrop(index, 'address', e.target.value)}
            placeholder="Address"
            className="w-full mt-2 px-2 py-1 text-sm border border-neutral-300 rounded"
          />
        </div>
      ))}
    </div>
  );
}