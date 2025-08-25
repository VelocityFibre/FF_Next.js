/**
 * VELOCITY Modal Animation Variants
 * Animation variants for modals and overlays
 */

import { Variants } from 'framer-motion';
import { VELOCITY_EASING, VELOCITY_SPRINGS } from './config';

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