export type ThemeName = 'light' | 'dark' | 'vf' | 'fibreflow' | 'velocity';

export interface ThemeColors {
  // Primary colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Secondary colors
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Accent colors
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Semantic colors
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  info: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Neutral colors (grays)
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Neon colors for special effects (optional - only in VELOCITY theme)
  neon?: {
    cyan: string;
    blue: string;
    purple: string;
    pink: string;
    green: string;
    yellow: string;
    electric?: string;
    plasma?: string;
    laser?: string;
  };
  
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  
  // Surface colors
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
    sidebar?: string;
    sidebarSecondary?: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    subtle: string;
    focus: string;
    error: string;
    success: string;
    warning: string;
    sidebar?: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    sidebarPrimary?: string;
    sidebarSecondary?: string;
    sidebarTertiary?: string;
  };
}

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: ThemeColors;
  isDark: boolean;
  brand: {
    logo?: string;
    logoInverse?: string;
    logoText?: string;
    favicon?: string;
    showBrandName?: boolean;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  typography: {
    fontFamily: {
      sans: string[];
      serif: string[];
      mono: string[];
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeight: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
      extrabold?: string;
      black?: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
    letterSpacing?: {
      tight: string;
      normal: string;
      wide: string;
      wider: string;
      widest: string;
    };
  };
  // VELOCITY Theme Enhancements
  elevation?: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
  };
  glassmorphism?: {
    backdrop: {
      light: string;
      medium: string;
      heavy: string;
      ultra?: string;
    };
    transparency: {
      subtle: string;
      medium: string;
      strong: string;
      intense?: string;
    };
    border: {
      light: string;
      medium: string;
      strong: string;
      neon?: string;
    };
    highlight?: {
      subtle: string;
      medium: string;
      strong: string;
    };
  };
  gradients?: {
    primary: string;
    secondary: string;
    accent: string;
    surface?: string;
    card?: string;
    button?: string;
    ambient: string;
    glow: string;
    neon: string;
    holographic: string;
    plasma?: string;
    aurora?: string;
  };
  animations?: {
    duration: {
      instant?: string;
      fast: string;
      normal: string;
      slow: string;
      extended?: string;
      epic?: string;
    };
    easing: {
      smooth: string;
      bounce: string;
      sharp: string;
      elastic?: string;
      anticipate?: string;
      decelerate?: string;
      accelerate?: string;
    };
    transform?: {
      hover: string;
      press: string;
      float: string;
    };
  };
  effects?: {
    glow: {
      subtle: string;
      medium: string;
      strong: string;
      intense?: string;
    };
    neon: {
      cyan: string;
      blue: string;
      purple: string;
      plasma?: string;
      laser?: string;
      electric?: string;
    };
    ambient?: {
      soft: string;
      medium: string;
      strong: string;
    };
    particle?: {
      sparkle: string;
      shimmer: string;
    };
  };
}

export interface ThemeContextType {
  currentTheme: ThemeName;
  themeConfig: ThemeConfig;
  availableThemes: ThemeName[];
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  resetToSystemTheme: () => void;
  isSystemTheme: boolean;
  systemTheme: 'light' | 'dark';
}

// Theme preference storage
export interface ThemePreference {
  theme: ThemeName;
  useSystemTheme: boolean;
  lastChanged: Date;
}