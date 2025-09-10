import { Save } from 'lucide-react';
import { PoleData } from '../types/pole-tracker.types';
import { cn } from '@/utils/cn';
import { usePoleCapture } from './hooks/usePoleCapture';
import { 
  PoleFormHeader, 
  GPSLocationCapture, 
  PhotoCaptureGrid, 
  DropManagement 
} from './components/index';

interface PoleCaptureMobileProps {
  projectId: string;
  onSave: (data: Partial<PoleData>) => Promise<void>;
  onCancel: () => void;
}

export function PoleCaptureMobile({ projectId, onSave, onCancel }: PoleCaptureMobileProps) {
  const {
    formData,
    setFormData,
    photos,
    gpsLocation,
    isCapturingGPS,
    fileInputRef,
    allRequiredComplete,
    captureGPS,
    handlePhotoCapture,
    handleFileSelect,
    addDrop,
    updateDrop,
    validateAndPrepareSaveData
  } = usePoleCapture(projectId);

  const handleSubmit = async () => {
    const poleData = validateAndPrepareSaveData();
    if (poleData) {
      await onSave(poleData);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <PoleFormHeader onCancel={onCancel} />

      <div className="p-4 space-y-4">
        {/* Pole Number */}
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Pole Number *
          </label>
          <input
            type="text"
            value={formData.poleNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, poleNumber: e.target.value }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            placeholder="Enter pole number"
          />
        </div>

        <GPSLocationCapture 
          gpsLocation={gpsLocation}
          isCapturingGPS={isCapturingGPS}
          onCaptureGPS={captureGPS}
        />

        <PhotoCaptureGrid 
          photos={photos}
          onPhotoCapture={handlePhotoCapture}
        />

        <DropManagement 
          formData={formData}
          onAddDrop={addDrop}
          onUpdateDrop={updateDrop}
        />

        {/* Notes */}
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4">
        <button
          onClick={handleSubmit}
          disabled={!allRequiredComplete}
          className={cn(
            'w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2',
            allRequiredComplete
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-200 text-neutral-400'
          )}
        >
          <Save className="h-5 w-5" />
          Save Pole Data
        </button>
      </div>
    </div>
  );
}