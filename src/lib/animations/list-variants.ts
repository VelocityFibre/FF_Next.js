/**
 * VELOCITY List Animation Variants
 * Animation variants for lists and staggered elements
 */

import { Variants } from 'framer-motion';
import { VELOCITY_EASING } from './config';

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