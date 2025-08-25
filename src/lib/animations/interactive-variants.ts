/**
 * VELOCITY Interactive Element Variants
 * Animation variants for interactive elements (buttons, cards, inputs)
 */

import { Variants } from 'framer-motion';
import { VELOCITY_EASING } from './config';

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

// 🟢 WORKING: Advanced effect animations
export const magnetVariants: Variants = {
  idle: { x: 0, y: 0 },
  attracted: (custom: { x: number; y: number }) => ({
    x: custom.x * 0.3,
    y: custom.y * 0.3,
    transition: { duration: 0.2, ease: VELOCITY_EASING.anticipate }
  })
};