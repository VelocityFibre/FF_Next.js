import { X } from 'lucide-react';

interface PoleFormHeaderProps {
  onCancel: () => void;
}

export function PoleFormHeader({ onCancel }: PoleFormHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Capture Pole Data</h1>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-neutral-100 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}