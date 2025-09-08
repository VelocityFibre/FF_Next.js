import { Camera, CheckCircle } from 'lucide-react';
import { cn } from '@/src/utils/cn';
import { PhotoCapture } from '../types/poleCapture.types';

interface PhotoCaptureGridProps {
  photos: PhotoCapture[];
  onPhotoCapture: (index: number) => void;
}

export function PhotoCaptureGrid({ photos, onPhotoCapture }: PhotoCaptureGridProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-neutral-200">
      <h3 className="text-sm font-medium text-neutral-700 mb-3">
        Required Photos ({photos.filter(p => p.captured).length}/6)
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => onPhotoCapture(index)}
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
  );
}