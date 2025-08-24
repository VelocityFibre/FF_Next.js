/**
 * AuthService - Legacy Compatibility Layer
 * @deprecated Use imports from @/services/auth/authentication instead
 * 
 * This file provides backward compatibility for existing imports.
 * New code should import directly from the modular structure:
 * - import { authService } from '@/services/auth/authentication'
 * 
 * Original file: 341 lines → Split into focused modules
 */

// Re-export everything from the new modular structure
export { authService, AuthService } from './authentication';