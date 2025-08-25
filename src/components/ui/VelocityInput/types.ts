/**
 * VelocityInput Types
 * TypeScript interfaces and type definitions
 */

import React from 'react';
import { VariantProps } from 'class-variance-authority';
import { velocityInputVariants } from './variants';

export interface VelocityInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof velocityInputVariants> {
  /** Input label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Warning message */
  warning?: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Show password reveal button for password inputs */
  showPasswordReveal?: boolean;
  /** Helper text below input */
  helperText?: string;
  /** Character counter */
  showCharacterCount?: boolean;
  /** Maximum character limit */
  maxLength?: number;
  /** Custom neon color for neon variants */
  neonColor?: string;
  /** Loading state */
  loading?: boolean;
  /** Full width input */
  fullWidth?: boolean;
  /** Disable floating label animation */
  disableFloating?: boolean;
}