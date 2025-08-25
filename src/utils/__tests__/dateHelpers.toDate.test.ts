// 🟢 WORKING: Tests for .toDate() fix - ensures safe date handling
import { safeToDate, safeToISOString } from '../dateHelpers';

// Mock Firebase Timestamp for testing
class MockTimestamp {
  constructor(private seconds: number, private nanoseconds: number) {}
  
  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }
}

describe('safeToDate - .toDate() error prevention', () => {
  it('should handle JavaScript Date objects', () => {
    const date = new Date('2023-01-01');
    const result = safeToDate(date);
    expect(result).toEqual(date);
    expect(result instanceof Date).toBe(true);
  });

  it('should handle Firebase Timestamp objects', () => {
    const timestamp = new MockTimestamp(1672531200, 0); // 2023-01-01
    const result = safeToDate(timestamp);
    expect(result instanceof Date).toBe(true);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(0); // January
  });

  it('should handle ISO date strings', () => {
    const isoString = '2023-01-01T00:00:00.000Z';
    const result = safeToDate(isoString);
    expect(result instanceof Date).toBe(true);
    expect(result.getFullYear()).toBe(2023);
  });

  it('should handle null/undefined gracefully', () => {
    expect(() => safeToDate(null)).not.toThrow();
    expect(() => safeToDate(undefined)).not.toThrow();
    expect(safeToDate(null) instanceof Date).toBe(true);
    expect(safeToDate(undefined) instanceof Date).toBe(true);
  });

  it('should handle objects without toDate() method gracefully', () => {
    const invalidObject = { someProperty: 'value' };
    expect(() => safeToDate(invalidObject)).not.toThrow();
    expect(safeToDate(invalidObject) instanceof Date).toBe(true);
  });

  it('should prevent TypeError: t.toDate is not a function', () => {
    // This is the exact scenario that was causing the crash
    const mockNeonDate = '2023-01-01T00:00:00.000Z'; // From PostgreSQL/Neon
    
    // This would previously throw TypeError: mockNeonDate.toDate is not a function
    expect(() => safeToDate(mockNeonDate)).not.toThrow();
    
    const result = safeToDate(mockNeonDate);
    expect(result instanceof Date).toBe(true);
    expect(result.getFullYear()).toBe(2023);
  });

  it('should handle timestamp numbers', () => {
    const timestamp = 1672531200000; // 2023-01-01
    const result = safeToDate(timestamp);
    expect(result instanceof Date).toBe(true);
    expect(result.getFullYear()).toBe(2023);
  });
});

describe('safeToISOString - comprehensive date conversion', () => {
  it('should convert Firebase Timestamp to ISO string', () => {
    const timestamp = new MockTimestamp(1672531200, 0);
    const result = safeToISOString(timestamp);
    expect(typeof result).toBe('string');
    expect(result).toBe('2023-01-01T00:00:00.000Z');
  });

  it('should handle invalid dates gracefully', () => {
    const invalidObject = { invalid: 'data' };
    expect(() => safeToISOString(invalidObject)).not.toThrow();
    expect(typeof safeToISOString(invalidObject)).toBe('string');
  });
});