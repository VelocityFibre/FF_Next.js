/**
 * VelocityInput Hooks
 * Custom hooks for VelocityInput state and behavior management
 */

import { useState, useEffect, useMemo } from 'react';

export interface UseVelocityInputStateProps {
  value?: string | number | readonly string[] | undefined;
  defaultValue?: string | number | readonly string[] | undefined;
  inputType?: string;
  showPasswordReveal?: boolean;
  maxLength?: number;
  neonColor?: string;
  variant?: string;
}

export const useVelocityInputState = ({
  value,
  defaultValue,
  inputType = 'text',
  showPasswordReveal = false,
  maxLength,
  neonColor,
  variant,
}: UseVelocityInputStateProps) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value || defaultValue));
  const [showPassword, setShowPassword] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || defaultValue || '');

  // Handle password reveal
  const isPasswordInput = inputType === 'password' && showPasswordReveal;
  const actualType = isPasswordInput && showPassword ? 'text' : inputType;

  // Custom neon color styling
  const customNeonStyle = useMemo(() => {
    if (neonColor && variant?.includes('neon')) {
      return {
        borderColor: focused ? neonColor : `${neonColor}60`,
        boxShadow: focused ? `0 0 25px ${neonColor}80` : undefined,
        color: neonColor,
      };
    }
    return {};
  }, [neonColor, variant, focused]);

  // Character count calculations
  const characterCount = String(currentValue).length;
  const isNearLimit = maxLength && characterCount >= maxLength * 0.9;
  const isAtLimit = maxLength && characterCount >= maxLength;

  useEffect(() => {
    setHasValue(Boolean(value));
    setCurrentValue(value || '');
  }, [value]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = (callback?: (e: React.FocusEvent<HTMLInputElement>) => void) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      callback?.(e);
    };

  const handleBlur = (callback?: (e: React.FocusEvent<HTMLInputElement>) => void) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(Boolean(e.target.value));
      callback?.(e);
    };

  const handleChange = (callback?: (e: React.ChangeEvent<HTMLInputElement>) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Handle max length
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      setHasValue(Boolean(newValue));
      setCurrentValue(newValue);

      // Create new event with updated value for controlled components
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: newValue,
        },
      };

      callback?.(newEvent as React.ChangeEvent<HTMLInputElement>);
    };

  return {
    focused,
    hasValue,
    showPassword,
    currentValue,
    actualType,
    isPasswordInput,
    customNeonStyle,
    characterCount,
    isNearLimit,
    isAtLimit,
    togglePasswordVisibility,
    handleFocus,
    handleBlur,
    handleChange,
  };
};