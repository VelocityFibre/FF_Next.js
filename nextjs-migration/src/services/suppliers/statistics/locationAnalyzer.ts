/**
 * Location Analyzer - Backward Compatibility Layer
 * @deprecated Use ./location/index.ts for improved modular location analysis
 * 
 * This file provides backward compatibility for existing imports.
 * New code should use the modular location analysis system in ./location/
 */

// Re-export everything from the new modular structure
export * from './location';

// Import classes for backward compatibility
import { GeographicAnalyzer } from './location/geographic-analyzer';
import { LocationMetricsCalculator } from './location/location-metrics';

/**
 * Legacy LocationAnalyzer class for backward compatibility
 */
export class LocationAnalyzer {
  /**
   * Get location distribution
   * @deprecated Use GeographicAnalyzer.getLocationDistribution instead
   */
  static async getLocationDistribution() {
    return GeographicAnalyzer.getLocationDistribution();
  }

  /**
   * Get province distribution
   * @deprecated Use GeographicAnalyzer.getProvinceDistribution instead
   */
  static async getProvinceDistribution() {
    return GeographicAnalyzer.getProvinceDistribution();
  }

  /**
   * Get suppliers near location
   * @deprecated Use GeographicAnalyzer.getSuppliersNearLocation instead
   */
  static async getSuppliersNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 50
  ) {
    return GeographicAnalyzer.getSuppliersNearLocation(latitude, longitude, {
      radius: radiusKm,
      unit: 'km'
    });
  }

  /**
   * Get location concentration
   * @deprecated Use GeographicAnalyzer.getLocationConcentration instead
   */
  static async getLocationConcentration() {
    return GeographicAnalyzer.getLocationConcentration();
  }

  /**
   * Get suppliers without location
   * @deprecated Use GeographicAnalyzer.getSuppliersWithoutLocation instead
   */
  static async getSuppliersWithoutLocation() {
    return GeographicAnalyzer.getSuppliersWithoutLocation();
  }

  /**
   * Calculate distance between two points
   * @deprecated Use LocationMetricsCalculator.calculateDistance instead
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    return LocationMetricsCalculator.calculateDistance(lat1, lon1, lat2, lon2);
  }

  /**
   * Get location summary
   * @deprecated Use GeographicAnalyzer.getLocationSummary instead
   */
  static async getLocationSummary() {
    return GeographicAnalyzer.getLocationSummary();
  }
}