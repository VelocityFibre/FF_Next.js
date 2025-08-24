/**
 * Brand Theme Configurations
 * VF and FibreFlow branded theme definitions
 */

import { ThemeConfig } from '@/types/theme.types';
import { lightColors } from './colors';
import { vfTypography, fibreflowTypography } from './typography';
import { baseSpacing, vfBorderRadius, fibreflowBorderRadius, baseShadows } from './spacing';

// VF Brand Colors (VELOCITY - Dark Navy Blue Theme)
const vfColors = {
  ...lightColors,
  // Dark navy blue primary colors for sidebar and main elements
  primary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // Medium slate
    600: '#475569', // Dark slate
    700: '#334155', // Navy slate
    800: '#1e293b', // Dark navy (sidebar)
    900: '#0f172a', // Darkest navy
    950: '#020617',
  },
  // Blue accent colors for buttons and highlights
  accent: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // VELOCITY Blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  // Background colors for VELOCITY theme
  background: {
    ...lightColors.background,
    sidebar: '#1e293b', // Dark navy for sidebar
    card: '#ffffff',
    hover: '#f8fafc',
    active: '#e2e8f0',
  },
  // Surface colors for VELOCITY theme (includes sidebar-specific)
  surface: {
    ...lightColors.surface,
    sidebar: '#1e293b', // Dark navy sidebar background
    sidebarSecondary: '#334155', // Slightly lighter navy for hover states
  },
  // Border colors for VELOCITY theme
  border: {
    ...lightColors.border,
    sidebar: '#334155', // Navy border for sidebar
    sidebarHover: '#475569', // Lighter border on hover
  },
  // Text colors for VELOCITY theme
  text: {
    ...lightColors.text,
    accent: '#3b82f6', // Blue accent text
    sidebar: '#f8fafc', // Light text on dark sidebar
    sidebarPrimary: '#f8fafc', // Primary sidebar text (white)
    sidebarSecondary: '#cbd5e1', // Secondary sidebar text (light gray)
    sidebarTertiary: '#94a3b8', // Tertiary sidebar text (muted gray)
    muted: '#64748b',
  },
};

// FibreFlow Brand Colors
const fibreflowColors = {
  ...lightColors,
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // FibreFlow Green
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  accent: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  text: {
    ...lightColors.text,
    accent: '#10b981',
  },
};

export const vfTheme: ThemeConfig = {
  name: 'vf',
  displayName: 'VELOCITY',
  description: 'VELOCITY brand theme with dark navy sidebar and blue accents',
  isDark: false,
  colors: vfColors,
  brand: {
    logo: '/assets/logos/velocity-logo.svg',
    logoInverse: '/assets/logos/velocity-logo-white.svg',
    favicon: '/assets/favicons/velocity-favicon.ico',
  },
  shadows: baseShadows,
  borderRadius: vfBorderRadius,
  spacing: baseSpacing,
  typography: vfTypography,
};

export const fibreflowTheme: ThemeConfig = {
  name: 'fibreflow',
  displayName: 'FibreFlow',
  description: 'FibreFlow brand theme with signature green',
  isDark: false,
  colors: fibreflowColors,
  brand: {
    logo: '/assets/logos/fibreflow-logo.svg',
    logoInverse: '/assets/logos/fibreflow-logo-white.svg',
    favicon: '/assets/favicons/fibreflow-favicon.ico',
  },
  shadows: baseShadows,
  borderRadius: fibreflowBorderRadius,
  spacing: baseSpacing,
  typography: fibreflowTypography,
};