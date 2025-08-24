/**
 * Theme Configuration
 * Centralized exports for all theme functionality
 */

// Individual themes
export { lightTheme } from './lightTheme';
export { darkTheme } from './darkTheme';
export { vfTheme, fibreflowTheme } from './brandThemes';
export { velocityTheme } from './velocityTheme';

// VELOCITY theme enhancements
export { velocityStyles, velocityUtils, velocityThemeHelpers } from './velocityUtils';
export type { VelocityStyleKey, VelocityUtilKey } from './velocityUtils';

// VELOCITY React hooks
export { 
  useVelocityTheme, 
  useVelocityStyle, 
  useVelocityDynamicStyles,
  useVelocityResponsive,
  useVelocityA11y 
} from './useVelocityTheme';
export type { 
  VelocityThemeHookOptions, 
  VelocityThemeUtils, 
  VelocityThemeStyles 
} from './useVelocityTheme';

// Theme building blocks
export { lightColors, darkColors } from './colors';
export { 
  baseTypography, 
  lightTypography, 
  darkTypography, 
  vfTypography, 
  fibreflowTypography 
} from './typography';
export { 
  baseSpacing, 
  baseBorderRadius, 
  baseShadows, 
  darkShadows, 
  vfBorderRadius, 
  fibreflowBorderRadius 
} from './spacing';

// Theme utilities
export {
  DEFAULT_THEME,
  AVAILABLE_THEMES,
  isValidTheme,
  getThemeDescription,
} from './themeUtils';

// Import utility functions that need themes object
import {
  getTheme as getThemeUtil,
  getThemeDisplayName as getThemeDisplayNameUtil,
  getThemeOptions as getThemeOptionsUtil,
  getThemesByMode as getThemesByModeUtil,
} from './themeUtils';

// Theme registry
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';
import { vfTheme, fibreflowTheme } from './brandThemes';
import { velocityTheme } from './velocityTheme';
import { ThemeName, ThemeConfig } from '@/types/theme.types';

export const themes: Record<ThemeName, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme,
  vf: vfTheme,
  fibreflow: fibreflowTheme,
  velocity: velocityTheme,
};

// Wrapper functions that use the themes registry
export const getTheme = (name: ThemeName): ThemeConfig => {
  return getThemeUtil(name, themes);
};

export const getThemeDisplayName = (name: ThemeName): string => {
  return getThemeDisplayNameUtil(name, themes);
};

export const getThemeOptions = () => {
  return getThemeOptionsUtil(themes);
};

export const getThemesByMode = (isDark: boolean): ThemeName[] => {
  return getThemesByModeUtil(themes, isDark);
};