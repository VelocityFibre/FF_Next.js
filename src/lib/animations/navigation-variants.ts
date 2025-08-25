/**
 * VELOCITY Navigation Animation Variants
 * Animation variants for navigation, menus, and dropdowns
 */

import { Variants } from 'framer-motion';
import { VELOCITY_EASING, VELOCITY_SPRINGS } from './config';

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