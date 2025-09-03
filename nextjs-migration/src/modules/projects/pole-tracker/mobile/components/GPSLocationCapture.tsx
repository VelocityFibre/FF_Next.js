import { Navigation, CheckCircle } from 'lucide-react';

interface GPSLocationCaptureProps {
  gpsLocation: { lat: number; lng: number } | null;
  isCapturingGPS: boolean;
  onCaptureGPS: () => void;
}

export function GPSLocationCapture({ gpsLocation, isCapturingGPS, onCaptureGPS }: GPSLocationCaptureProps) {
  return (
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
          onClick={onCaptureGPS}
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
  );
}