/**
 * Theme Configuration - Legacy Compatibility Layer
 * @deprecated Use imports from @/config/themes instead
 * 
 * This file provides backward compatibility for existing imports.
 * New code should import directly from the modular structure:
 * - import { themes, getTheme } from '@/config/themes'
 * 
 * Original file: 455 lines → Split into focused theme modules
 */

// Re-export everything from the new modular structure
export {
  themes,
  lightTheme,
  darkTheme,
  vfTheme,
  fibreflowTheme,
  DEFAULT_THEME,
  AVAILABLE_THEMES,
  getTheme,
  isValidTheme,
  getThemeDisplayName,
  getThemeDescription,
  getThemeOptions,
  getThemesByMode,
  // VELOCITY theme hooks
  useVelocityTheme,
  useVelocityResponsive,
  useVelocityStyle,
  useVelocityDynamicStyles,
  useVelocityA11y,
  // VELOCITY theme utilities
  velocityStyles,
  velocityUtils,
  velocityThemeHelpers,
} from './themes/index';