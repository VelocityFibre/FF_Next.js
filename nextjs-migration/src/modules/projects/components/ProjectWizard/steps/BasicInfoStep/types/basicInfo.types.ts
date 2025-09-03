export interface GpsCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  city: string;
  region: string;
  province: string;
  coordinates: GpsCoordinates;
}

export interface BasicInfoStepProps {
  form: any; // UseFormReturn<FormData>
  clients: Array<{ id: string; name: string }>;
  isClientsLoading: boolean;
}

export interface GpsState {
  isGeocoding: boolean;
  geocodingError: string | null;
  gpsInput: string;
}