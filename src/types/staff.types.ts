/**
 * Staff Types - Re-export all staff type definitions
 * This file maintains backward compatibility while organizing types into smaller modules
 */

export * from './staff/index';

// Re-export Timestamp for backward compatibility
export { Timestamp } from 'firebase/firestore';