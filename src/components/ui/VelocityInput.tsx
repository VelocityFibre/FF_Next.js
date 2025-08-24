/**
 * VelocityInput Component - Premium input with floating labels and glass effects
 * Features: Floating labels, glassmorphism, neon focus, validation states, password reveal
 * 
 * Enhanced with:
 * - VELOCITY theme integration
 * - Password reveal functionality
 * - Enhanced validation states
 * - Accessibility features
 * - Performance optimizations
 * - TypeScript form integration
 */

import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
// Removed unused useVelocityTheme import

const velocityInputVariants = cva(
  // Base styles with VELOCITY enhancements
  'w-full rounded-lg border-0 bg-transparent px-4 py-3 text-base placeholder-transparent transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:ring-0 resize-none',
  {
    variants: {
      variant: {
        glass: 'bg-white/8 backdrop-blur-md border border-white/20 text-white focus:bg-white/12 focus:border-blue-400/60 focus:shadow-[0_0_25px_rgba(0,102,255,0.4)] hover:border-white/30',
        'glass-dark': 'bg-black/25 backdrop-blur-md border border-white/15 text-white focus:bg-black/35 focus:border-blue-400/60 focus:shadow-[0_0_25px_rgba(0,102,255,0.4)] hover:border-white/25',
        'glass-intense': 'bg-white/15 backdrop-blur-lg border border-white/30 text-white focus:bg-white/20 focus:border-blue-400/70 focus:shadow-[0_0_30px_rgba(0,102,255,0.5)] hover:border-white/40',
        
        // Enhanced neon variants
        neon: 'bg-transparent border-2 border-cyan-400/40 text-cyan-100 focus:border-cyan-300/80 focus:shadow-[0_0_25px_rgba(0,245,255,0.5)] focus:text-cyan-50 hover:border-cyan-400/60',
        'neon-purple': 'bg-transparent border-2 border-purple-400/40 text-purple-100 focus:border-purple-300/80 focus:shadow-[0_0_25px_rgba(99,102,241,0.5)] focus:text-purple-50 hover:border-purple-400/60',
        'neon-pink': 'bg-transparent border-2 border-pink-400/40 text-pink-100 focus:border-pink-300/80 focus:shadow-[0_0_25px_rgba(236,72,153,0.5)] focus:text-pink-50 hover:border-pink-400/60',
        'neon-green': 'bg-transparent border-2 border-green-400/40 text-green-100 focus:border-green-300/80 focus:shadow-[0_0_25px_rgba(34,197,94,0.5)] focus:text-green-50 hover:border-green-400/60',
        
        // Premium variants
        holographic: 'bg-gradient-to-br from-transparent via-purple-500/8 to-cyan-500/8 border border-purple-400/25 text-white focus:border-cyan-400/60 backdrop-blur-md focus:shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:border-purple-400/40',
        
        plasma: 'bg-gradient-conic from-cyan-400/10 via-purple-500/10 to-pink-500/10 border border-purple-400/25 text-white focus:border-cyan-400/60 backdrop-blur-sm focus:shadow-[0_0_30px_rgba(138,43,226,0.4)] hover:border-purple-400/40',
        
        aurora: 'bg-gradient-to-br from-green-400/8 via-blue-500/8 to-purple-600/8 border border-blue-400/25 text-white focus:border-green-400/60 backdrop-blur-sm focus:shadow-[0_0_25px_rgba(34,197,94,0.3)] hover:border-blue-400/40',
        
        // Solid variants
        solid: 'bg-blue-900/40 border border-blue-600/50 text-blue-100 focus:bg-blue-900/60 focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-600/70',
        minimal: 'bg-transparent border-b-2 border-white/20 rounded-none text-white focus:border-blue-400/60 focus:shadow-[0_2px_8px_rgba(0,102,255,0.3)] hover:border-white/30 px-0',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      },
      state: {
        default: '',
        error: 'border-red-400/50 text-red-100 focus:border-red-400 focus:shadow-[0_0_20px_rgba(239,68,68,0.4)]',
        success: 'border-green-400/50 text-green-100 focus:border-green-400 focus:shadow-[0_0_20px_rgba(34,197,94,0.4)]',
        warning: 'border-yellow-400/50 text-yellow-100 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      },
    },
    defaultVariants: {
      variant: 'glass',
      size: 'md',
      state: 'default',
    },
  }
);

const velocityLabelVariants = cva(
  // Base label styles
  'absolute left-4 transition-all duration-300 pointer-events-none origin-left',
  {
    variants: {
      variant: {
        glass: 'text-white/70 peer-focus:text-blue-300',
        'glass-dark': 'text-white/70 peer-focus:text-blue-300',
        'glass-intense': 'text-white/70 peer-focus:text-blue-300',
        neon: 'text-cyan-300/70 peer-focus:text-cyan-200',
        'neon-purple': 'text-purple-300/70 peer-focus:text-purple-200',
        'neon-pink': 'text-pink-300/70 peer-focus:text-pink-200',
        'neon-green': 'text-green-300/70 peer-focus:text-green-200',
        holographic: 'text-white/70 peer-focus:text-cyan-300',
        plasma: 'text-white/70 peer-focus:text-cyan-300',
        aurora: 'text-white/70 peer-focus:text-green-300',
        solid: 'text-blue-200/70 peer-focus:text-blue-100',
        minimal: 'text-white/70 peer-focus:text-blue-300',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      state: {
        default: '',
        error: 'text-red-300 peer-focus:text-red-200',
        success: 'text-green-300 peer-focus:text-green-200',
        warning: 'text-yellow-300 peer-focus:text-yellow-200',
      },
      floating: {
        true: '-top-2 left-3 scale-75 bg-black/50 px-2 rounded',
        false: '',
      },
    },
    compoundVariants: [
      {
        size: 'sm',
        floating: false,
        class: 'top-2',
      },
      {
        size: 'md', 
        floating: false,
        class: 'top-3',
      },
      {
        size: 'lg',
        floating: false,
        class: 'top-4',
      },
    ],
    defaultVariants: {
      variant: 'glass',
      size: 'md',
      state: 'default',
      floating: false,
    },
  }
);

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

const VelocityInput = React.forwardRef<HTMLInputElement, VelocityInputProps>(
  ({ 
    className,
    variant,
    size,
    state,
    label,
    error,
    success,
    warning,
    icon,
    iconPosition = 'right',
    showPasswordReveal = false,
    helperText,
    showCharacterCount = false,
    maxLength,
    neonColor,
    loading = false,
    fullWidth = true,
    disableFloating = false,
    value,
    defaultValue,
    type: inputType = 'text',
    onChange,
    onFocus,
    onBlur,
    style,
    ...props 
  }, ref) => {
    // Removed unused utils variable
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(Boolean(value || defaultValue));
    const [showPassword, setShowPassword] = useState(false);
    const [currentValue, setCurrentValue] = useState(value || defaultValue || '');
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Determine current state based on props
    const currentState = error ? 'error' : success ? 'success' : warning ? 'warning' : state || 'default';
    
    // Check if label should be floating
    const isFloating = !disableFloating && (focused || hasValue);
    
    // Handle password reveal
    const isPasswordInput = inputType === 'password' && showPasswordReveal;
    const actualType = isPasswordInput && showPassword ? 'text' : inputType;
    
    // Custom neon color styling
    const customNeonStyle = React.useMemo(() => {
      if (neonColor && variant?.includes('neon')) {
        return {
          borderColor: focused ? neonColor : `${neonColor}60`,
          boxShadow: focused ? `0 0 25px ${neonColor}80` : undefined,
          color: neonColor,
        };
      }
      return {};
    }, [neonColor, variant, focused]);
    
    useEffect(() => {
      setHasValue(Boolean(value));
      setCurrentValue(value || '');
    }, [value]);
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(Boolean(e.target.value));
      onBlur?.(e);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      onChange?.(newEvent as React.ChangeEvent<HTMLInputElement>);
    };
    
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    
    const combinedStyle = {
      ...style,
      ...customNeonStyle,
    };
    
    // Character count
    const characterCount = String(currentValue).length;
    const isNearLimit = maxLength && characterCount >= maxLength * 0.9;
    const isAtLimit = maxLength && characterCount >= maxLength;

    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto')}>
        {/* Input field container */}
        <div className="relative">
          {/* Left icon */}
          {icon && iconPosition === 'left' && !loading && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors',
              variant?.includes('neon') && focused && 'text-current drop-shadow-[0_0_4px_currentColor]',
              !focused && 'text-white/50'
            )}>
              {icon}
            </div>
          )}
          
          {/* Loading spinner */}
          {loading && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <div className={cn(
                'animate-spin rounded-full border-2 border-transparent border-t-current',
                size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
              )} />
            </div>
          )}
          
          <input
            ref={ref || inputRef}
            type={actualType}
            className={cn(
              velocityInputVariants({ variant, size, state: currentState }),
              // Icon padding adjustments
              (icon && iconPosition === 'left') || loading ? 'pl-10' : '',
              (icon && iconPosition === 'right') || isPasswordInput ? 'pr-10' : '',
              // Character counter padding
              showCharacterCount && !isPasswordInput && !icon && 'pr-16',
              // Full width
              fullWidth && 'w-full',
              'peer',
              className
            )}
            value={value}
            defaultValue={defaultValue}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder=" " // Required for floating label CSS selector
            aria-describedby={
              [
                error && `${props.id}-error`,
                success && `${props.id}-success`, 
                warning && `${props.id}-warning`,
                helperText && `${props.id}-helper`,
                showCharacterCount && `${props.id}-count`
              ].filter(Boolean).join(' ') || undefined
            }
            aria-invalid={!!error}
            style={combinedStyle}
            {...props}
          />
          
          {/* Floating label */}
          {label && (
            <label
              className={cn(
                velocityLabelVariants({ 
                  variant, 
                  size, 
                  state: currentState,
                  floating: isFloating 
                }),
                variant?.includes('neon') && focused && 'drop-shadow-[0_0_4px_currentColor]'
              )}
              htmlFor={props.id}
            >
              {label}
            </label>
          )}
          
          {/* Right side elements */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            {/* Character counter */}
            {showCharacterCount && maxLength && (
              <span 
                id={`${props.id}-count`}
                className={cn(
                  'text-xs transition-colors',
                  isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-white/50'
                )}
              >
                {characterCount}/{maxLength}
              </span>
            )}
            
            {/* Password reveal button */}
            {isPasswordInput && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={cn(
                  'text-white/50 hover:text-white/80 transition-colors p-1',
                  variant?.includes('neon') && 'hover:drop-shadow-[0_0_4px_currentColor]'
                )}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            )}
            
            {/* Right icon */}
            {icon && iconPosition === 'right' && !isPasswordInput && (
              <div className={cn(
                'transition-colors',
                variant?.includes('neon') && focused && 'text-current drop-shadow-[0_0_4px_currentColor]',
                !focused && 'text-white/50'
              )}>
                {icon}
              </div>
            )}
          </div>
        </div>
        
        {/* Messages and helper text */}
        <div className="mt-2 space-y-1">
          {/* Error message */}
          {error && (
            <p id={`${props.id}-error`} className="text-sm text-red-300 animate-fadeIn flex items-center">
              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          
          {/* Warning message */}
          {warning && !error && (
            <p id={`${props.id}-warning`} className="text-sm text-yellow-300 animate-fadeIn flex items-center">
              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {warning}
            </p>
          )}
          
          {/* Success message */}
          {success && !error && !warning && (
            <p id={`${props.id}-success`} className="text-sm text-green-300 animate-fadeIn flex items-center">
              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </p>
          )}
          
          {/* Helper text */}
          {helperText && !error && !warning && !success && (
            <p id={`${props.id}-helper`} className="text-sm text-white/60">
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  }
);

VelocityInput.displayName = 'VelocityInput';

export { VelocityInput, velocityInputVariants };