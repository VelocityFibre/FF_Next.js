import { ThemeConfig, ThemeName } from '@/types/theme.types';

// Light Theme Configuration
const lightTheme: ThemeConfig = {
  name: 'light',
  displayName: 'Light',
  description: 'Clean and bright theme for daytime use',
  isDark: false,
  colors: {
    primary: {
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
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    info: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      inverse: '#111827',
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    border: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
      subtle: '#f3f4f6',
      focus: '#3b82f6',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
    },
    text: {
      primary: '#111827',
      secondary: '#374151',
      tertiary: '#6b7280',
      inverse: '#ffffff',
      disabled: '#9ca3af',
      accent: '#3b82f6',
      success: '#166534',
      warning: '#92400e',
      error: '#991b1b',
    },
  },
  brand: {},
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Monaco', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
};

// Dark Theme Configuration
const darkTheme: ThemeConfig = {
  ...lightTheme,
  name: 'dark',
  displayName: 'Dark',
  description: 'Sleek dark theme for low-light environments',
  isDark: true,
  colors: {
    ...lightTheme.colors,
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      inverse: '#ffffff',
    },
    surface: {
      primary: '#1e293b',
      secondary: '#334155',
      tertiary: '#475569',
      elevated: '#334155',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    border: {
      primary: '#475569',
      secondary: '#64748b',
      subtle: '#334155',
      focus: '#60a5fa',
      error: '#f87171',
      success: '#4ade80',
      warning: '#fbbf24',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#e2e8f0',
      tertiary: '#cbd5e1',
      inverse: '#111827',
      disabled: '#64748b',
      accent: '#60a5fa',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.5)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.75)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.5)',
  },
};

// VF (Velocity Fibre) Brand Theme
const vfTheme: ThemeConfig = {
  ...lightTheme,
  name: 'vf',
  displayName: 'VF Brand',
  description: 'Velocity Fibre branded theme with corporate colors',
  isDark: false, // Main content stays light, but sidebar is dark
  colors: {
    ...lightTheme.colors,
    // VF Brand primary colors (blue palette)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main VF brand color
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    // VF secondary colors (blue palette for accents)
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    // Keep main backgrounds light for content area
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      inverse: '#111827',
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
      // Dark sidebar surface
      sidebar: '#1e293b', // slate-800
      sidebarSecondary: '#334155', // slate-700
    },
    border: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
      subtle: '#f3f4f6',
      focus: '#3b82f6',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
      sidebar: '#475569', // slate-600
    },
    text: {
      primary: '#111827',
      secondary: '#374151',
      tertiary: '#6b7280',
      inverse: '#ffffff',
      disabled: '#9ca3af',
      accent: '#3b82f6',
      success: '#166534',
      warning: '#92400e',
      error: '#991b1b',
      // Sidebar-specific text colors
      sidebarPrimary: '#f8fafc', // slate-50
      sidebarSecondary: '#e2e8f0', // slate-200  
      sidebarTertiary: '#cbd5e1', // slate-300
    },
  },
  brand: {
    logo: '/assets/logos/vf-logo.svg',
    logoInverse: '/assets/logos/vf-logo-white.svg',
    logoText: 'VELOCITY FIBRE',
    favicon: '/assets/favicons/vf-favicon.ico',
    showBrandName: true,
  },
};

// FibreFlow Custom Theme
const fibreflowTheme: ThemeConfig = {
  ...lightTheme,
  name: 'fibreflow',
  displayName: 'FibreFlow',
  description: 'Custom FibreFlow theme with network-inspired colors',
  colors: {
    ...lightTheme.colors,
    primary: {
      50: '#f0fdf9',
      100: '#ccfbef',
      200: '#99f6e0',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      950: '#042f2e',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    accent: {
      50: '#fef7ff',
      100: '#fceeff',
      200: '#f8ddff',
      300: '#f2bfff',
      400: '#e692ff',
      500: '#d565ff',
      600: '#bf3bff',
      700: '#a31fff',
      800: '#8a18df',
      900: '#7318b6',
      950: '#4d0a7d',
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      tertiary: '#64748b',
      inverse: '#ffffff',
      disabled: '#94a3b8',
      accent: '#14b8a6',
      success: '#166534',
      warning: '#92400e',
      error: '#991b1b',
    },
  },
  brand: {
    logo: '/assets/logos/fibreflow-logo.svg',
    logoInverse: '/assets/logos/fibreflow-logo-white.svg',
    favicon: '/assets/favicons/fibreflow-favicon.ico',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
};

// Theme registry
export const themes: Record<ThemeName, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme,
  vf: vfTheme,
  fibreflow: fibreflowTheme,
};

// Default theme
export const DEFAULT_THEME: ThemeName = 'vf';

// Available themes list
export const AVAILABLE_THEMES: ThemeName[] = ['light', 'dark', 'vf', 'fibreflow'];

// Theme utilities
export function getTheme(name: ThemeName): ThemeConfig {
  return themes[name] || themes[DEFAULT_THEME];
}

export function isValidTheme(name: string): name is ThemeName {
  return AVAILABLE_THEMES.includes(name as ThemeName);
}

export function getThemeDisplayName(name: ThemeName): string {
  return getTheme(name).displayName;
}

export function getThemeDescription(name: ThemeName): string {
  return getTheme(name).description;
}

export function isDarkTheme(name: ThemeName): boolean {
  return getTheme(name).isDark;
}