/**
 * VELOCITY Theme - Premium High-Tech Experience
 * Features: Glassmorphism, Neon Accents, Advanced Shadows, Gradient Systems
 */

import { ThemeConfig } from '@/types/theme.types';
import { baseSpacing, baseBorderRadius } from './spacing';
import { baseTypography } from './typography';

// VELOCITY Color System - Premium high-tech with enhanced neon accents
const velocityColors = {
  primary: {
    50: '#0a0e1a',
    100: '#1a1f2e',
    200: '#2a2f3e',
    300: '#0f3460',
    400: '#0e4b99',
    500: '#0066ff',
    600: '#2196f3',
    700: '#42a5f5',
    800: '#64b5f6',
    900: '#90caf9',
    950: '#bbdefb',
  },
  secondary: {
    50: '#0d1117',
    100: '#161b22',
    200: '#21262d',
    300: '#30363d',
    400: '#484f58',
    500: '#6e7681',
    600: '#8b949e',
    700: '#b1bac4',
    800: '#c9d1d9',
    900: '#f0f6fc',
    950: '#ffffff',
  },
  accent: {
    50: '#1a0033',
    100: '#2d0055',
    200: '#4a0080',
    300: '#6600cc',
    400: '#8000ff',
    500: '#9933ff',
    600: '#b366ff',
    700: '#cc99ff',
    800: '#e6ccff',
    900: '#f0e6ff',
    950: '#faf5ff',
  },
  success: {
    50: '#001f14',
    100: '#003d29',
    200: '#00574b',
    300: '#00796b',
    400: '#009688',
    500: '#26a69a',
    600: '#4db6ac',
    700: '#80cbc4',
    800: '#b2dfdb',
    900: '#e0f2f1',
    950: '#f0fffe',
  },
  warning: {
    50: '#1f1300',
    100: '#3d2600',
    200: '#5c3a00',
    300: '#7a4e00',
    400: '#ff9800',
    500: '#ffab40',
    600: '#ffcc02',
    700: '#fdd835',
    800: '#ffee58',
    900: '#fff9c4',
    950: '#fffde7',
  },
  error: {
    50: '#1f0013',
    100: '#3d0026',
    200: '#5c003a',
    300: '#7a004d',
    400: '#f50057',
    500: '#ff1744',
    600: '#ff5722',
    700: '#ff6b6b',
    800: '#ffab91',
    900: '#ffcdd2',
    950: '#ffebee',
  },
  info: {
    50: '#001f2e',
    100: '#003d5c',
    200: '#00578a',
    300: '#0074b8',
    400: '#00bcd4',
    500: '#26c6da',
    600: '#4dd0e1',
    700: '#80deea',
    800: '#b2ebf2',
    900: '#e0f7fa',
    950: '#f0fdff',
  },
  neutral: {
    50: '#0a0a0a',
    100: '#1a1a1a',
    200: '#2a2a2a',
    300: '#3a3a3a',
    400: '#5a5a5a',
    500: '#7a7a7a',
    600: '#9a9a9a',
    700: '#bababa',
    800: '#dadada',
    900: '#f0f0f0',
    950: '#ffffff',
  },
  // Enhanced neon accent colors for special effects
  neon: {
    cyan: '#00f5ff',
    blue: '#0066ff',
    purple: '#6366f1',
    pink: '#ff0080',
    green: '#00ff80',
    yellow: '#ffff00',
    electric: '#00ffff',
    plasma: '#8a2be2',
    laser: '#ff1493',
  },
  background: {
    primary: '#0a0e1a',
    secondary: '#1a1f2e',
    tertiary: '#2a2f3e',
    inverse: '#ffffff',
  },
  surface: {
    primary: 'rgba(26, 31, 46, 0.85)',
    secondary: 'rgba(42, 47, 62, 0.7)',
    tertiary: 'rgba(58, 63, 78, 0.5)',
    elevated: 'rgba(26, 31, 46, 0.95)',
    overlay: 'rgba(10, 14, 26, 0.9)',
    sidebar: 'rgba(26, 31, 46, 0.9)',
    sidebarSecondary: 'rgba(42, 47, 62, 0.8)',
  },
  border: {
    primary: 'rgba(0, 245, 255, 0.2)',
    secondary: 'rgba(255, 255, 255, 0.08)',
    subtle: 'rgba(255, 255, 255, 0.04)',
    focus: '#00f5ff',
    error: '#f50057',
    success: '#00796b',
    warning: '#ff9800',
    sidebar: 'rgba(0, 245, 255, 0.15)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#c9d1d9',
    tertiary: '#8b949e',
    inverse: '#0a0e1a',
    disabled: '#6e7681',
    accent: '#00f5ff',
    success: '#4db6ac',
    warning: '#ffab40',
    error: '#ff6b6b',
    sidebarPrimary: '#ffffff',
    sidebarSecondary: '#c9d1d9',
    sidebarTertiary: '#8b949e',
  },
};

// Advanced shadow system with 8 elevation levels and ambient lighting
const velocityElevation = {
  0: 'none',
  1: '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(0, 245, 255, 0.1), 0 0 12px rgba(0, 102, 255, 0.05)',
  2: '0 2px 6px rgba(0, 0, 0, 0.4), 0 0 12px rgba(0, 245, 255, 0.15), 0 0 18px rgba(0, 102, 255, 0.08)',
  3: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 245, 255, 0.2), 0 0 24px rgba(0, 102, 255, 0.1)',
  4: '0 6px 18px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 245, 255, 0.25), 0 0 32px rgba(0, 102, 255, 0.12)',
  5: '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 245, 255, 0.3), 0 0 40px rgba(0, 102, 255, 0.15)',
  6: '0 12px 30px rgba(0, 0, 0, 0.8), 0 0 28px rgba(0, 245, 255, 0.35), 0 0 48px rgba(0, 102, 255, 0.18)',
  7: '0 16px 36px rgba(0, 0, 0, 0.85), 0 0 32px rgba(0, 245, 255, 0.4), 0 0 56px rgba(0, 102, 255, 0.2)',
  8: '0 24px 48px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 245, 255, 0.5), 0 0 64px rgba(0, 102, 255, 0.25)',
};

// Enhanced glassmorphism effects with neon accents
const velocityGlassmorphism = {
  backdrop: {
    light: 'blur(8px) saturate(150%)',
    medium: 'blur(16px) saturate(180%)',
    heavy: 'blur(32px) saturate(200%)',
    ultra: 'blur(48px) saturate(220%)',
  },
  transparency: {
    subtle: 'rgba(26, 31, 46, 0.6)',
    medium: 'rgba(26, 31, 46, 0.75)',
    strong: 'rgba(26, 31, 46, 0.85)',
    intense: 'rgba(26, 31, 46, 0.92)',
  },
  border: {
    light: '1px solid rgba(0, 245, 255, 0.15)',
    medium: '1px solid rgba(0, 245, 255, 0.25)',
    strong: '1px solid rgba(0, 245, 255, 0.4)',
    neon: '1px solid rgba(0, 245, 255, 0.6)',
  },
  highlight: {
    subtle: 'rgba(0, 245, 255, 0.08)',
    medium: 'rgba(0, 245, 255, 0.12)',
    strong: 'rgba(0, 245, 255, 0.18)',
  },
};

// Premium gradient system with enhanced effects
const velocityGradients = {
  primary: 'linear-gradient(135deg, #0066ff 0%, #00f5ff 50%, #42a5f5 100%)',
  secondary: 'linear-gradient(135deg, #1a1f2e 0%, #2a2f3e 50%, #0f3460 100%)',
  accent: 'linear-gradient(135deg, #6366f1 0%, #8a2be2 50%, #b366ff 100%)',
  surface: 'linear-gradient(145deg, rgba(26, 31, 46, 0.95) 0%, rgba(42, 47, 62, 0.8) 100%)',
  card: 'linear-gradient(145deg, rgba(26, 31, 46, 0.9) 0%, rgba(42, 47, 62, 0.7) 100%)',
  button: 'linear-gradient(135deg, rgba(0, 245, 255, 0.2) 0%, rgba(0, 102, 255, 0.3) 100%)',
  ambient: 'radial-gradient(ellipse at center, rgba(0, 245, 255, 0.3) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)',
  glow: 'radial-gradient(ellipse at center, rgba(0, 245, 255, 0.6) 0%, rgba(0, 245, 255, 0.3) 30%, transparent 70%)',
  neon: 'linear-gradient(90deg, #00f5ff 0%, #0066ff 25%, #6366f1 50%, #8a2be2 75%, #00ff80 100%)',
  holographic: 'linear-gradient(45deg, #00f5ff, #0066ff, #6366f1, #8a2be2, #ff1493, #00ff80)',
  plasma: 'conic-gradient(from 0deg, #00f5ff, #0066ff, #6366f1, #8a2be2, #ff1493, #00f5ff)',
  aurora: 'linear-gradient(120deg, rgba(0, 245, 255, 0.3), rgba(99, 102, 241, 0.4), rgba(138, 43, 226, 0.3))',
};

// Enhanced animation system with performance optimization
const velocityAnimations = {
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    extended: '800ms',
    epic: '1200ms',
  },
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    sharp: 'cubic-bezier(0.4, 0, 1, 1)',
    elastic: 'cubic-bezier(0.68, -0.75, 0.265, 1.75)',
    anticipate: 'cubic-bezier(0.2, 1, 0.3, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  transform: {
    hover: 'translateY(-2px) scale(1.02)',
    press: 'translateY(0px) scale(0.98)',
    float: 'translateY(-4px)',
  },
};

// Enhanced special effects system
const velocityEffects = {
  glow: {
    subtle: '0 0 10px rgba(0, 245, 255, 0.3)',
    medium: '0 0 20px rgba(0, 245, 255, 0.5)',
    strong: '0 0 30px rgba(0, 245, 255, 0.8)',
    intense: '0 0 40px rgba(0, 245, 255, 1)',
  },
  neon: {
    cyan: '0 0 5px #00f5ff, 0 0 10px #00f5ff, 0 0 15px #00f5ff, 0 0 20px #00f5ff',
    blue: '0 0 5px #0066ff, 0 0 10px #0066ff, 0 0 15px #0066ff, 0 0 20px #0066ff',
    purple: '0 0 5px #6366f1, 0 0 10px #6366f1, 0 0 15px #6366f1, 0 0 20px #6366f1',
    plasma: '0 0 5px #8a2be2, 0 0 10px #8a2be2, 0 0 15px #8a2be2, 0 0 20px #8a2be2',
    laser: '0 0 5px #ff1493, 0 0 10px #ff1493, 0 0 15px #ff1493, 0 0 20px #ff1493',
    electric: '0 0 2px #00ffff, 0 0 4px #00ffff, 0 0 6px #00ffff, 0 0 8px #00ffff, 0 0 10px #00ffff',
  },
  ambient: {
    soft: 'drop-shadow(0 0 10px rgba(0, 245, 255, 0.2))',
    medium: 'drop-shadow(0 0 20px rgba(0, 245, 255, 0.3))',
    strong: 'drop-shadow(0 0 30px rgba(0, 245, 255, 0.5))',
  },
  particle: {
    sparkle: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 12px rgba(0, 245, 255, 0.6))',
    shimmer: 'drop-shadow(0 0 8px rgba(0, 245, 255, 0.4)) drop-shadow(0 0 16px rgba(99, 102, 241, 0.3))',
  },
};

// Enhanced typography for premium high-tech feel
const velocityTypography = {
  ...baseTypography,
  fontFamily: {
    sans: ['Inter Variable', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
    serif: ['ui-serif', 'Georgia', 'Cambria', 'serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
    display: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '4rem',     // 64px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

export const velocityTheme: ThemeConfig = {
  name: 'velocity',
  displayName: 'VELOCITY',
  description: 'Premium high-tech theme with glassmorphism effects, neon accents, and advanced visual enhancements',
  colors: velocityColors,
  isDark: true,
  brand: {
    logo: '/logo-velocity.svg',
    logoInverse: '/logo-velocity-light.svg',
    logoText: 'VELOCITY',
    favicon: '/favicon-velocity.ico',
    showBrandName: true,
  },
  shadows: {
    sm: velocityElevation[1],
    md: velocityElevation[3],
    lg: velocityElevation[5],
    xl: velocityElevation[7],
    '2xl': velocityElevation[8],
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  },
  borderRadius: baseBorderRadius,
  spacing: baseSpacing,
  typography: velocityTypography,
  // VELOCITY-specific enhancements
  elevation: velocityElevation,
  glassmorphism: velocityGlassmorphism,
  gradients: velocityGradients,
  animations: velocityAnimations,
  effects: velocityEffects,
};