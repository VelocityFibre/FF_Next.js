/**
 * Light Theme Configuration
 * Complete light theme definition
 */

import { ThemeConfig } from '@/types/theme.types';
import { lightColors } from './colors';
import { lightTypography } from './typography';
import { baseSpacing, baseBorderRadius, baseShadows } from './spacing';

export const lightTheme: ThemeConfig = {
  name: 'light',
  displayName: 'Light',
  description: 'Clean and bright theme for daytime use',
  isDark: false,
  colors: lightColors,
  brand: {},
  shadows: baseShadows,
  borderRadius: baseBorderRadius,
  spacing: baseSpacing,
  typography: lightTypography,
};