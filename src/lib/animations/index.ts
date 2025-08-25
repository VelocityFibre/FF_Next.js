/**
 * VELOCITY Micro-Animations System
 * Comprehensive Framer Motion variants and animation utilities for premium UX
 * Features: Performance optimization, accessibility support, responsive animations
 */

// Configuration and utilities
export * from './config';
export * from './utils';

// Animation variants by category
export * from './basic-variants';
export * from './interactive-variants';
export * from './loading-variants';
export * from './list-variants';
export * from './modal-variants';
export * from './navigation-variants';

// Re-export individual variant collections for convenience
import { fadeVariants, slideVariants, scaleVariants, pageVariants } from './basic-variants';
import { buttonVariants, cardVariants, inputVariants, magnetVariants } from './interactive-variants';
import { spinnerVariants, pulseVariants, glowVariants, floatVariants, breathingVariants } from './loading-variants';
import { listContainerVariants, listItemVariants } from './list-variants';
import { modalVariants, overlayVariants } from './modal-variants';
import { sidebarVariants, menuItemVariants, dropdownVariants, toastVariants } from './navigation-variants';

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