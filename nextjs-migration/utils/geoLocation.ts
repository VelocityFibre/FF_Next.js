
/**
 * Geolocation utilities for reverse geocoding in South Africa
 */

export interface LocationData {
  city: string;
  municipalDistrict: string;
  province: string;
}

/**
 * Reverse geocode GPS coordinates to get location information for South Africa
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
  try {
    // Using Nominatim (OpenStreetMap) for free reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=za&addressdetails=1&accept-language=en`,
      {
        headers: {
          'User-Agent': 'FibreFlow-Project-Management'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();

    if (!data || !data.address) {
      return null;
    }

    const address = data.address;

    // Extract location information for South Africa
    const city = 
      address.city || 
      address.town || 
      address.village || 
      address.suburb || 
      address.hamlet || 
      'Unknown City';

    // South African municipal districts (local municipalities)
    const municipalDistrict = 
      address.municipality ||
      address.county ||
      address.state_district ||
      extractMunicipalityFromDisplayName(data.display_name) ||
      'Unknown Municipality';

    // South African provinces
    const province = mapToSouthAfricanProvince(address.state || address.province);

    return {
      city: city.trim(),
      municipalDistrict: municipalDistrict.trim(),
      province: province
    };

  } catch (error) {
    // log.error('Reverse geocoding failed:', { data: error }, 'geoLocation');
    return null;
  }
}

/**
 * Map various province names to official South African province names
 */
function mapToSouthAfricanProvince(provinceName: string): string {
  if (!provinceName) return '';

  const name = provinceName.toLowerCase().trim();

  const provinceMap: Record<string, string> = {
    'eastern cape': 'Eastern Cape',
    'ec': 'Eastern Cape',
    'free state': 'Free State',
    'fs': 'Free State',
    'gauteng': 'Gauteng',
    'gp': 'Gauteng',
    'kwazulu-natal': 'KwaZulu-Natal',
    'kzn': 'KwaZulu-Natal',
    'limpopo': 'Limpopo',
    'lp': 'Limpopo',
    'mpumalanga': 'Mpumalanga',
    'mp': 'Mpumalanga',
    'northern cape': 'Northern Cape',
    'nc': 'Northern Cape',
    'north west': 'North West',
    'northwest': 'North West',
    'nw': 'North West',
    'western cape': 'Western Cape',
    'wc': 'Western Cape'
  };

  return provinceMap[name] || provinceName;
}

/**
 * Extract municipality from display name if not in address components
 */
function extractMunicipalityFromDisplayName(displayName: string): string | null {
  if (!displayName) return null;

  // Common patterns for South African municipalities
  const patterns = [
    /([A-Za-z\s]+)\s+Local\s+Municipality/i,
    /([A-Za-z\s]+)\s+Municipality/i,
    /([A-Za-z\s]+)\s+Metropolitan\s+Municipality/i,
    /([A-Za-z\s]+)\s+District\s+Municipality/i
  ];

  for (const pattern of patterns) {
    const match = displayName.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Validate GPS coordinates for South Africa
 */
export function validateSouthAfricanGPS(lat: number, lng: number): boolean {
  // South Africa bounds (approximate)
  const SA_BOUNDS = {
    minLat: -35.0,
    maxLat: -22.0,
    minLng: 16.0,
    maxLng: 33.0
  };

  return (
    lat >= SA_BOUNDS.minLat && 
    lat <= SA_BOUNDS.maxLat && 
    lng >= SA_BOUNDS.minLng && 
    lng <= SA_BOUNDS.maxLng
  );
}

/**
 * Parse GPS coordinates from various formats
 */
export function parseGPSCoordinates(input: string): { lat: number; lng: number } | null {
  if (!input || typeof input !== 'string') return null;

  const cleanInput = input.trim();

  // Format 1: "-34.031085438557376, 18.463559275830423"
  const decimalPair = cleanInput.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (decimalPair) {
    const lat = parseFloat(decimalPair[1]);
    const lng = parseFloat(decimalPair[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // Format 2: "33.9221° S, 18.4231° E" or "33°55'28.3" S, 18°25'26.6" E"
  const dmsPattern = /(\d+(?:\.\d+)?(?:°\d+(?:\.\d+)?['′]\d+(?:\.\d+)?["″]?|°)?)\s*([NSEW])\s*,?\s*(\d+(?:\.\d+)?(?:°\d+(?:\.\d+)?['′]\d+(?:\.\d+)?["″]?|°)?)\s*([NSEW])/i;
  const dmsMatch = cleanInput.match(dmsPattern);
  if (dmsMatch) {
    const [, coord1, dir1, coord2, dir2] = dmsMatch;
    
    const lat = parseCoordinate(coord1, dir1);
    const lng = parseCoordinate(coord2, dir2);
    
    if (lat !== null && lng !== null) {
      return { lat, lng };
    }
  }

  // Format 3: Single coordinate pair without separators "34.031085438557376 18.463559275830423"
  const spaceSeparated = cleanInput.match(/^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/);
  if (spaceSeparated) {
    const lat = parseFloat(spaceSeparated[1]);
    const lng = parseFloat(spaceSeparated[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat: Math.abs(lat) * -1, lng }; // Assume SA coordinates (negative latitude)
    }
  }

  // Format 4: Try to extract two decimal numbers from anywhere in the string
  const allDecimals = cleanInput.match(/-?\d+\.?\d*/g);
  if (allDecimals && allDecimals.length >= 2) {
    const lat = parseFloat(allDecimals[0]);
    const lng = parseFloat(allDecimals[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  return null;
}

/**
 * Parse coordinate from DMS or decimal format with direction
 */
function parseCoordinate(coord: string, direction: string): number | null {
  const dir = direction.toUpperCase();
  
  // If it's already decimal
  const decimal = parseFloat(coord.replace(/[°'"″′]/g, ''));
  if (!isNaN(decimal)) {
    const multiplier = (dir === 'S' || dir === 'W') ? -1 : 1;
    return decimal * multiplier;
  }

  // Try to parse DMS format (degrees, minutes, seconds)
  const dmsPattern = /(\d+)(?:°|d)?\s*(\d+(?:\.\d+)?)(?:['′]|m)?\s*(\d+(?:\.\d+)?)(?:["″]|s)?/i;
  const dmsMatch = coord.match(dmsPattern);
  
  if (dmsMatch) {
    const degrees = parseInt(dmsMatch[1]);
    const minutes = parseFloat(dmsMatch[2]) || 0;
    const seconds = parseFloat(dmsMatch[3]) || 0;
    
    const decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
    const multiplier = (dir === 'S' || dir === 'W') ? -1 : 1;
    
    return decimalDegrees * multiplier;
  }

  return null;
}

/**
 * Get current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}