/**
 * VELOCITY Animation Configuration
 * Core configuration, presets, and easing curves for the animation system
 */

import { Transition } from 'framer-motion';

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

// 🟢 WORKING: Utility functions for creating transitions
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