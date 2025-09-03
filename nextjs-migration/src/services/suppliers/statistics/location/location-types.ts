/**
 * Location Analysis Types
 * Type definitions for supplier location analysis
 */

export interface LocationDistribution {
  city: string;
  province: string;
  country: string;
  count: number;
  percentage: number;
  suppliers: string[];
}

export interface ProvinceDistribution {
  province: string;
  country: string;
  supplierCount: number;
  percentage: number;
  cities: Array<{
    city: string;
    count: number;
  }>;
}

export interface LocationConcentration {
  totalLocations: number;
  topLocations: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
  concentrationIndex: number;
  diversityScore: number;
}

export interface LocationSummary {
  totalSuppliers: number;
  suppliersWithLocation: number;
  suppliersWithoutLocation: number;
  uniqueCities: number;
  uniqueProvinces: number;
  uniqueCountries: number;
  topCity: string;
  topProvince: string;
  topCountry: string;
  locationCoverage: number;
}

export interface GeographicCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationSearchOptions {
  radius?: number;
  unit?: 'km' | 'miles';
  includeCoordinates?: boolean;
  sortBy?: 'distance' | 'name' | 'supplierCount';
  limit?: number;
}

export interface SupplierLocation {
  supplierId: string;
  supplierName: string;
  address: {
    street?: string;
    city: string;
    province?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: GeographicCoordinates;
  };
  distance?: number;
}

export interface LocationAnalysisOptions {
  includeInactive?: boolean;
  excludeCountries?: string[];
  groupBy?: 'city' | 'province' | 'country';
  minimumSuppliers?: number;
}

export interface RegionAnalysis {
  region: string;
  supplierCount: number;
  averageRating: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  marketShare: number;
}

export interface LocationTrend {
  location: string;
  timeframe: string;
  growth: {
    newSuppliers: number;
    totalSuppliers: number;
    growthRate: number;
  };
  trend: 'growing' | 'stable' | 'declining';
}