/**
 * VELOCITY Basic Animation Variants
 * Core animation variants for common patterns (fade, slide, scale)
 */

import { Variants } from 'framer-motion';
import { VELOCITY_EASING, VELOCITY_SPRINGS } from './config';

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