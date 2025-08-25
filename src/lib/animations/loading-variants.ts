/**
 * VELOCITY Loading Animation Variants
 * Animation variants for loading states, spinners, and effects
 */

import { Variants } from 'framer-motion';
import { VELOCITY_EASING } from './config';

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