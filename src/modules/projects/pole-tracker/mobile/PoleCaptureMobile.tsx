import { useState, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Save, 
  X, 
  Upload,
  CheckCircle,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { PoleData, DropData, PoleStatus } from '../types/pole-tracker.types';
import { cn } from '@/utils/cn';

interface PoleCaptureMobileProps {
  projectId: string;
  onSave: (data: Partial<PoleData>) => Promise<void>;
  onCancel: () => void;
}

interface PhotoCapture {
  id: string;
  label: string;
  required: boolean;
  captured: boolean;
  url?: string;
  file?: File;
}

const REQUIRED_PHOTOS: PhotoCapture[] = [
  { id: 'pole_number', label: 'Pole Number', required: true, captured: false },
  { id: 'pole_overview', label: 'Pole Overview', required: true, captured: false },
  { id: 'drop_connections', label: 'Drop Connections', required: true, captured: false },
  { id: 'fiber_routing', label: 'Fiber Routing', required: true, captured: false },
  { id: 'ground_level', label: 'Ground Level', required: true, captured: false },
  { id: 'safety_compliance', label: 'Safety Compliance', required: true, captured: false },
];

export function PoleCaptureMobile({ projectId, onSave, onCancel }: PoleCaptureMobileProps) {
  const [formData, setFormData] = useState<Partial<PoleData>>({
    projectId,
    poleNumber: '',
    status: PoleStatus.NOT_STARTED,
    maxDrops: 12,
    currentDrops: 0,
    drops: [],
  });

  const [photos, setPhotos] = useState<PhotoCapture[]>(REQUIRED_PHOTOS);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureGPS = () => {
    setIsCapturingGPS(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setGpsLocation(location);
          setFormData(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng,
          }));
          setIsCapturingGPS(false);
        },
        (error) => {
          console.error('GPS error:', error);
          setIsCapturingGPS(false);
          alert('Unable to get GPS location. Please enable location services.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('GPS not supported on this device');
      setIsCapturingGPS(false);
    }
  };

  const handlePhotoCapture = (index: number) => {
    setActivePhotoIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && activePhotoIndex !== null) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedPhotos = [...photos];
        updatedPhotos[activePhotoIndex] = {
          ...updatedPhotos[activePhotoIndex],
          captured: true,
          url: e.target?.result as string,
          file,
        };
        setPhotos(updatedPhotos);
        setActivePhotoIndex(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const addDrop = () => {
    if (formData.currentDrops! < formData.maxDrops!) {
      const newDrop: DropData = {
        id: `drop-${Date.now()}`,
        dropNumber: `D${(formData.currentDrops || 0) + 1}`,
        customerName: '',
        address: '',
        status: 'pending',
        installDate: '',
      };
      
      setFormData(prev => ({
        ...prev,
        drops: [...(prev.drops || []), newDrop],
        currentDrops: (prev.currentDrops || 0) + 1,
      }));
    }
  };

  const updateDrop = (index: number, field: keyof DropData, value: string) => {
    const updatedDrops = [...(formData.drops || [])];
    updatedDrops[index] = { ...updatedDrops[index], [field]: value };
    setFormData(prev => ({ ...prev, drops: updatedDrops }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.poleNumber) {
      alert('Pole number is required');
      return;
    }

    if (!gpsLocation) {
      alert('GPS location is required');
      return;
    }

    const requiredPhotosComplete = photos.filter(p => p.required).every(p => p.captured);
    if (!requiredPhotosComplete) {
      alert('Please capture all required photos');
      return;
    }

    // Prepare photo URLs for saving
    const photoUrls = photos.filter(p => p.captured).map(p => p.url!);
    
    await onSave({
      ...formData,
      photos: photoUrls,
      capturedAt: new Date().toISOString(),
    });
  };

  const allRequiredComplete = 
    formData.poleNumber && 
    gpsLocation && 
    photos.filter(p => p.required).every(p => p.captured);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
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

        {/* GPS Location */}
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-neutral-700">
              GPS Location *
            </label>
            {gpsLocation && (
              <CheckCircle className="h-5 w-5 text-success-600" />
            )}
          </div>
          
          {gpsLocation ? (
            <div className="text-sm text-neutral-600">
              Lat: {gpsLocation.lat.toFixed(6)}, Lng: {gpsLocation.lng.toFixed(6)}
            </div>
          ) : (
            <button
              onClick={captureGPS}
              disabled={isCapturingGPS}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              {isCapturingGPS ? (
                <>Loading...</>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Capture GPS Location
                </>
              )}
            </button>
          )}
        </div>

        {/* Photo Capture */}
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">
            Required Photos ({photos.filter(p => p.captured).length}/6)
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => handlePhotoCapture(index)}
                className={cn(
                  'relative aspect-square rounded-lg border-2 overflow-hidden',
                  photo.captured 
                    ? 'border-success-500 bg-success-50' 
                    : 'border-neutral-300 bg-neutral-50'
                )}
              >
                {photo.captured && photo.url ? (
                  <img 
                    src={photo.url} 
                    alt={photo.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-2">
                    <Camera className="h-6 w-6 text-neutral-400 mb-1" />
                    <span className="text-xs text-neutral-600 text-center">
                      {photo.label}
                    </span>
                  </div>
                )}
                
                {photo.captured && (
                  <div className="absolute top-1 right-1 bg-success-600 rounded-full p-1">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                )}
                
                {photo.required && !photo.captured && (
                  <div className="absolute top-1 left-1">
                    <span className="text-error-500 text-xs">*</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Drops */}
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-700">
              Drops ({formData.currentDrops}/{formData.maxDrops})
            </h3>
            {formData.currentDrops! < formData.maxDrops! && (
              <button
                onClick={addDrop}
                className="text-primary-600 text-sm"
              >
                + Add Drop
              </button>
            )}
          </div>
          
          {formData.drops?.map((drop, index) => (
            <div key={drop.id} className="mb-3 p-3 bg-neutral-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={drop.dropNumber}
                  onChange={(e) => updateDrop(index, 'dropNumber', e.target.value)}
                  placeholder="Drop #"
                  className="px-2 py-1 text-sm border border-neutral-300 rounded"
                />
                <input
                  type="text"
                  value={drop.customerName}
                  onChange={(e) => updateDrop(index, 'customerName', e.target.value)}
                  placeholder="Customer"
                  className="px-2 py-1 text-sm border border-neutral-300 rounded"
                />
              </div>
              <input
                type="text"
                value={drop.address}
                onChange={(e) => updateDrop(index, 'address', e.target.value)}
                placeholder="Address"
                className="w-full mt-2 px-2 py-1 text-sm border border-neutral-300 rounded"
              />
            </div>
          ))}
        </div>

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