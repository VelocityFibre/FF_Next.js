/**
 * Dark Theme Configuration
 * Complete dark theme definition
 */

import { ThemeConfig } from '@/types/theme.types';
import { darkColors } from './colors';
import { darkTypography } from './typography';
import { baseSpacing, baseBorderRadius, darkShadows } from './spacing';

export const darkTheme: ThemeConfig = {
  name: 'dark',
  displayName: 'Dark',
  description: 'Modern dark theme for low-light environments',
  isDark: true,
  colors: darkColors,
  brand: {},
  shadows: darkShadows,
  borderRadius: baseBorderRadius,
  spacing: baseSpacing,
  typography: darkTypography,
};