/**
 * VELOCITY Micro-Animations System
 * Comprehensive Framer Motion variants and animation utilities for premium UX
 * Features: Performance optimization, accessibility support, responsive animations
 */

import { Variants, Transition, MotionProps } from 'framer-motion';

// 🟢 WORKING: Core animation configuration
export interface VelocityAnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  damping?: number;
  stiffness?: number;
  mass?: number;
  velocity?: number;
}

// 🟢 WORKING: Animation presets for different use cases
export const VELOCITY_PRESETS = {
  // Instant feedback for button clicks
  instant: { duration: 0.1 },
  // Fast animations for micro-interactions
  fast: { duration: 0.2 },
  // Standard animations for most UI elements
  normal: { duration: 0.3 },
  // Slower animations for complex transitions
  slow: { duration: 0.5 },
  // Extended animations for hero sections
  extended: { duration: 0.8 },
  // Epic animations for special effects
  epic: { duration: 1.2 },
} as const;

// 🟢 WORKING: Easing curves optimized for different interaction types
export const VELOCITY_EASING = {
  // Smooth general purpose easing
  smooth: [0.4, 0, 0.2, 1],
  // Bouncy for playful interactions
  bounce: [0.68, -0.55, 0.265, 1.55],
  // Sharp for instant feedback
  sharp: [0.4, 0, 1, 1],
  // Elastic for attention-grabbing effects
  elastic: [0.68, -0.75, 0.265, 1.75],
  // Anticipate for hover states
  anticipate: [0.2, 1, 0.3, 1],
  // Decelerate for entering elements
  decelerate: [0, 0, 0.2, 1],
  // Accelerate for exiting elements
  accelerate: [0.4, 0, 1, 1],
} as const;

// 🟢 WORKING: Spring physics configurations
export const VELOCITY_SPRINGS = {
  gentle: { stiffness: 200, damping: 20, mass: 1 },
  medium: { stiffness: 300, damping: 25, mass: 1 },
  stiff: { stiffness: 400, damping: 30, mass: 1 },
  snappy: { stiffness: 500, damping: 35, mass: 0.8 },
  bouncy: { stiffness: 350, damping: 15, mass: 1.2 },
  wobbly: { stiffness: 250, damping: 12, mass: 1.5 },
} as const;

// 🟢 WORKING: Core animation variants for common patterns
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: VELOCITY_EASING.decelerate }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  }
};

export const slideVariants: Variants = {
  hiddenLeft: {
    x: -50,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  hiddenRight: {
    x: 50,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  hiddenUp: {
    y: -30,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  hiddenDown: {
    y: 30,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: VELOCITY_EASING.decelerate }
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  }
};

export const scaleVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { ...VELOCITY_SPRINGS.medium, duration: 0.4 }
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  }
};

// 🟢 WORKING: Interactive element animations
export const buttonVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: '0 0 0px rgba(0, 245, 255, 0)',
    transition: { duration: 0.2, ease: VELOCITY_EASING.smooth }
  },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: '0 10px 25px rgba(0, 245, 255, 0.3)',
    transition: { duration: 0.2, ease: VELOCITY_EASING.anticipate }
  },
  tap: {
    scale: 0.98,
    y: 0,
    boxShadow: '0 5px 15px rgba(0, 245, 255, 0.2)',
    transition: { duration: 0.1, ease: VELOCITY_EASING.sharp }
  },
  focus: {
    scale: 1.01,
    boxShadow: '0 0 0 3px rgba(0, 245, 255, 0.3)',
    transition: { duration: 0.2, ease: VELOCITY_EASING.smooth }
  }
};

export const cardVariants: Variants = {
  idle: {
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 245, 255, 0.2)',
    transition: { duration: 0.3, ease: VELOCITY_EASING.smooth }
  },
  hover: {
    scale: 1.03,
    rotateX: 2,
    rotateY: 2,
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7), 0 0 28px rgba(0, 245, 255, 0.35)',
    transition: { duration: 0.3, ease: VELOCITY_EASING.anticipate }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: VELOCITY_EASING.sharp }
  }
};

export const inputVariants: Variants = {
  idle: {
    scale: 1,
    borderColor: 'rgba(0, 245, 255, 0.2)',
    boxShadow: '0 0 0px rgba(0, 245, 255, 0)',
    transition: { duration: 0.2, ease: VELOCITY_EASING.smooth }
  },
  focus: {
    scale: 1.01,
    borderColor: 'rgba(0, 245, 255, 0.6)',
    boxShadow: '0 0 0 3px rgba(0, 245, 255, 0.2)',
    transition: { duration: 0.2, ease: VELOCITY_EASING.smooth }
  },
  error: {
    x: [0, -5, 5, -5, 5, 0],
    borderColor: 'rgba(245, 0, 87, 0.8)',
    boxShadow: '0 0 0 3px rgba(245, 0, 87, 0.2)',
    transition: { duration: 0.5, ease: VELOCITY_EASING.elastic }
  },
  success: {
    borderColor: 'rgba(77, 182, 172, 0.8)',
    boxShadow: '0 0 0 3px rgba(77, 182, 172, 0.2)',
    transition: { duration: 0.3, ease: VELOCITY_EASING.smooth }
  }
};

// 🟢 WORKING: Loading and spinner animations
export const spinnerVariants: Variants = {
  spinning: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const pulseVariants: Variants = {
  idle: { scale: 1, opacity: 1 },
  pulsing: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: VELOCITY_EASING.smooth
    }
  }
};

export const glowVariants: Variants = {
  idle: {
    filter: 'drop-shadow(0 0 0px rgba(0, 245, 255, 0))',
    transition: { duration: 0.3, ease: VELOCITY_EASING.smooth }
  },
  glowing: {
    filter: [
      'drop-shadow(0 0 5px rgba(0, 245, 255, 0.3))',
      'drop-shadow(0 0 20px rgba(0, 245, 255, 0.6))',
      'drop-shadow(0 0 5px rgba(0, 245, 255, 0.3))'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: VELOCITY_EASING.smooth
    }
  }
};

// 🟢 WORKING: List and stagger animations
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const listItemVariants: Variants = {
  hidden: {
    x: -20,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: VELOCITY_EASING.decelerate }
  },
  exit: {
    x: 20,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  }
};

// 🟢 WORKING: Modal and overlay animations
export const modalVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 50,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { ...VELOCITY_SPRINGS.medium, duration: 0.4 }
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: -50,
    transition: { duration: 0.3, ease: VELOCITY_EASING.accelerate }
  }
};

export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  visible: {
    opacity: 1,
    backdropFilter: 'blur(8px)',
    transition: { duration: 0.3, ease: VELOCITY_EASING.decelerate }
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  }
};

// 🟢 WORKING: Navigation and menu animations
export const sidebarVariants: Variants = {
  closed: {
    x: -300,
    transition: { duration: 0.3, ease: VELOCITY_EASING.accelerate }
  },
  open: {
    x: 0,
    transition: { duration: 0.3, ease: VELOCITY_EASING.decelerate }
  }
};

export const menuItemVariants: Variants = {
  closed: {
    x: -20,
    opacity: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  open: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: VELOCITY_EASING.decelerate }
  }
};

export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15, ease: VELOCITY_EASING.accelerate }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: VELOCITY_EASING.decelerate }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15, ease: VELOCITY_EASING.accelerate }
  }
};

// 🟢 WORKING: Toast and notification animations
export const toastVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2, ease: VELOCITY_EASING.accelerate }
  },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { ...VELOCITY_SPRINGS.snappy, duration: 0.4 }
  },
  exit: {
    x: '100%',
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3, ease: VELOCITY_EASING.accelerate }
  }
};

// 🟢 WORKING: Advanced effect animations
export const floatVariants: Variants = {
  floating: {
    y: [-10, 0, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: VELOCITY_EASING.smooth
    }
  }
};

export const breathingVariants: Variants = {
  breathing: {
    scale: [1, 1.02, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: VELOCITY_EASING.smooth
    }
  }
};

export const magnetVariants: Variants = {
  idle: { x: 0, y: 0 },
  attracted: (custom: { x: number; y: number }) => ({
    x: custom.x * 0.3,
    y: custom.y * 0.3,
    transition: { duration: 0.2, ease: VELOCITY_EASING.anticipate }
  })
};

// 🟢 WORKING: Page transition animations
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: VELOCITY_EASING.decelerate,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: VELOCITY_EASING.accelerate
    }
  }
};

// 🟢 WORKING: Utility functions for creating custom animations
export const createStaggerTransition = (staggerDelay: number = 0.1): Transition => ({
  staggerChildren: staggerDelay,
  delayChildren: staggerDelay * 2
});

export const createSpringTransition = (config: keyof typeof VELOCITY_SPRINGS = 'medium'): Transition => ({
  type: 'spring',
  ...VELOCITY_SPRINGS[config]
});

export const createResponsiveAnimation = (
  mobile: VelocityAnimationConfig,
  desktop: VelocityAnimationConfig
) => {
  return typeof window !== 'undefined' && window.innerWidth < 768 ? mobile : desktop;
};

// 🟢 WORKING: Performance optimization utilities
export const reduceMotionVariants = (variants: Variants): Variants => {
  const reducedVariants: Variants = {};
  
  Object.keys(variants).forEach(key => {
    const variant = variants[key];
    if (typeof variant === 'object' && variant !== null) {
      reducedVariants[key] = {
        ...variant,
        transition: { duration: 0.01, ease: 'linear' }
      };
    } else {
      reducedVariants[key] = variant;
    }
  });
  
  return reducedVariants;
};

export const getAccessibilityProps = (): Partial<MotionProps> => {
  if (typeof window === 'undefined') return {};
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return prefersReducedMotion ? {
    initial: {},
    animate: {},
    exit: {},
    transition: { duration: 0.01 }
  } : {};
};

// 🟢 WORKING: Animation composition helpers
export const combineVariants = (...variantSets: Variants[]): Variants => {
  return variantSets.reduce((combined, variants) => ({
    ...combined,
    ...variants
  }), {});
};

export const withDelay = (variants: Variants, delay: number): Variants => {
  const delayedVariants: Variants = {};
  
  Object.keys(variants).forEach(key => {
    const variant = variants[key];
    if (typeof variant === 'object' && variant !== null && 'transition' in variant) {
      delayedVariants[key] = {
        ...variant,
        transition: {
          ...(typeof variant.transition === 'object' ? variant.transition : {}),
          delay
        }
      };
    } else {
      delayedVariants[key] = variant;
    }
  });
  
  return delayedVariants;
};

// 🟢 WORKING: Export all animation variants as a convenient collection
export const velocityAnimationVariants = {
  fade: fadeVariants,
  slide: slideVariants,
  scale: scaleVariants,
  button: buttonVariants,
  card: cardVariants,
  input: inputVariants,
  spinner: spinnerVariants,
  pulse: pulseVariants,
  glow: glowVariants,
  list: {
    container: listContainerVariants,
    item: listItemVariants
  },
  modal: modalVariants,
  overlay: overlayVariants,
  sidebar: sidebarVariants,
  menu: {
    item: menuItemVariants,
    dropdown: dropdownVariants
  },
  toast: toastVariants,
  effects: {
    float: floatVariants,
    breathing: breathingVariants,
    magnet: magnetVariants
  },
  page: pageVariants
};

export default velocityAnimationVariants;