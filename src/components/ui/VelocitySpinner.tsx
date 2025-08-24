/**
 * VelocitySpinner Component - Premium loading spinner with glassmorphism and neon effects
 * Features: 6+ animation types, glow effects, customizable colors, performance optimized
 * 
 * Enhanced with:
 * - VELOCITY theme integration
 * - Performance optimizations
 * - New animation types: bars, spiral, matrix
 * - Customizable colors and sizes
 * - Loading text support
 * - Accessibility features
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
// Removed unused useVelocityTheme import

const velocitySpinnerVariants = cva('', {
  variants: {
    variant: {
      default: 'text-blue-400',
      // Enhanced neon variants
      neon: 'text-cyan-400 drop-shadow-[0_0_12px_rgba(0,245,255,0.8)]',
      'neon-purple': 'text-purple-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]',
      'neon-pink': 'text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]',
      'neon-green': 'text-green-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]',
      'neon-yellow': 'text-yellow-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]',
      
      // Premium gradient variants
      holographic: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500',
      plasma: 'text-transparent bg-clip-text bg-gradient-conic from-cyan-400 via-purple-500 to-pink-500',
      aurora: 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-600',
      
      // Special effects
      pulse: 'text-blue-400 animate-pulse drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]',
      glow: 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]',
      
      // Theme variants
      primary: 'text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]',
      success: 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]',
      warning: 'text-yellow-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]',
      error: 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]',
    },
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
      '2xl': 'w-16 h-16',
    },
    speed: {
      slow: 'animate-spin-slow',
      normal: 'animate-spin',
      fast: 'animate-spin-fast',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
    speed: 'normal',
  },
});

export interface VelocitySpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof velocitySpinnerVariants> {
  /** Animation type */
  type?: 'circular' | 'dots' | 'pulse' | 'wave' | 'orbit' | 'matrix' | 'bars' | 'spiral';
  /** Show glass background */
  showBackground?: boolean;
  /** Loading text to display */
  text?: string;
  /** Text position relative to spinner */
  textPosition?: 'bottom' | 'right' | 'top' | 'left';
  /** Custom color (overrides variant) */
  color?: string;
  /** Center the spinner */
  centered?: boolean;
  /** Overlay mode (full screen) */
  overlay?: boolean;
  /** Disable animation (for reduced motion) */
  disableAnimation?: boolean;
}

// Circular spinner (default)
const CircularSpinner: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Dots spinner
const DotsSpinner: React.FC<{ className: string; variant: string }> = ({ className, variant }) => (
  <div className={cn('flex space-x-1', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'w-2 h-2 rounded-full animate-bounce',
          variant === 'neon' && 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.7)]',
          variant === 'neon-purple' && 'bg-purple-400 shadow-[0_0_10px_rgba(128,0,255,0.7)]',
          variant === 'neon-pink' && 'bg-pink-400 shadow-[0_0_10px_rgba(255,0,128,0.7)]',
          variant === 'holographic' && 'bg-gradient-to-r from-cyan-400 to-purple-500',
          variant === 'default' && 'bg-blue-400',
        )}
        style={{
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </div>
);

// Pulse spinner
const PulseSpinner: React.FC<{ className: string; variant: string }> = ({ className, variant }) => (
  <div className={cn('relative', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'absolute inset-0 rounded-full animate-ping',
          variant === 'neon' && 'border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.5)]',
          variant === 'neon-purple' && 'border-2 border-purple-400 shadow-[0_0_20px_rgba(128,0,255,0.5)]',
          variant === 'neon-pink' && 'border-2 border-pink-400 shadow-[0_0_20px_rgba(255,0,128,0.5)]',
          variant === 'holographic' && 'border-2 border-gradient-to-r from-cyan-400 to-purple-500',
          variant === 'default' && 'border-2 border-blue-400',
        )}
        style={{
          animationDelay: `${i * 0.3}s`,
        }}
      />
    ))}
  </div>
);

// Wave spinner
const WaveSpinner: React.FC<{ className: string; variant: string }> = ({ className, variant }) => (
  <div className={cn('flex items-end space-x-1', className)}>
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className={cn(
          'w-1 animate-wave',
          variant === 'neon' && 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.7)]',
          variant === 'neon-purple' && 'bg-purple-400 shadow-[0_0_10px_rgba(128,0,255,0.7)]',
          variant === 'neon-pink' && 'bg-pink-400 shadow-[0_0_10px_rgba(255,0,128,0.7)]',
          variant === 'holographic' && 'bg-gradient-to-t from-cyan-400 to-purple-500',
          variant === 'default' && 'bg-blue-400',
        )}
        style={{
          height: '100%',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

// Orbit spinner
const OrbitSpinner: React.FC<{ className: string; variant: string }> = ({ className, variant }) => (
  <div className={cn('relative animate-spin', className)}>
    <div
      className={cn(
        'absolute inset-0 rounded-full',
        variant === 'neon' && 'border-2 border-transparent border-t-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.5)]',
        variant === 'neon-purple' && 'border-2 border-transparent border-t-purple-400 shadow-[0_0_20px_rgba(128,0,255,0.5)]',
        variant === 'neon-pink' && 'border-2 border-transparent border-t-pink-400 shadow-[0_0_20px_rgba(255,0,128,0.5)]',
        variant === 'holographic' && 'border-2 border-transparent border-t-blue-400',
        variant === 'default' && 'border-2 border-transparent border-t-blue-400',
      )}
    />
    <div
      className={cn(
        'absolute inset-1 rounded-full animate-spin-reverse',
        variant === 'neon' && 'border border-transparent border-r-cyan-300 opacity-60',
        variant === 'neon-purple' && 'border border-transparent border-r-purple-300 opacity-60',
        variant === 'neon-pink' && 'border border-transparent border-r-pink-300 opacity-60',
        variant === 'holographic' && 'border border-transparent border-r-purple-300 opacity-60',
        variant === 'default' && 'border border-transparent border-r-blue-300 opacity-60',
      )}
    />
  </div>
);

// Matrix-style spinner
const MatrixSpinner: React.FC<{ className: string }> = ({ className }) => (
  <div className={cn('grid grid-cols-3 gap-1', className)}>
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className="w-1 h-1 bg-green-400 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.7)]"
        style={{
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

// Bars spinner
const BarsSpinner: React.FC<{ className: string; variant: string }> = ({ className, variant }) => (
  <div className={cn('flex items-end justify-center space-x-1', className)}>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={cn(
          'animate-bounce',
          variant === 'neon' && 'bg-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.7)]',
          variant === 'neon-purple' && 'bg-purple-400 shadow-[0_0_10px_rgba(99,102,241,0.7)]',
          variant === 'neon-pink' && 'bg-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.7)]',
          variant === 'neon-green' && 'bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.7)]',
          variant === 'holographic' && 'bg-gradient-to-t from-cyan-400 to-purple-500',
          variant === 'plasma' && 'bg-gradient-to-t from-purple-500 to-pink-500',
          variant === 'aurora' && 'bg-gradient-to-t from-green-400 to-blue-500',
          variant === 'default' && 'bg-blue-400',
        )}
        style={{
          width: '3px',
          height: ['12px', '20px', '16px', '24px'][i],
          animationDelay: `${i * 0.15}s`,
          animationDuration: '1s',
        }}
      />
    ))}
  </div>
);

// Spiral spinner
const SpiralSpinner: React.FC<{ className: string; variant: string }> = ({ className, variant }) => (
  <div className={cn('relative', className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          'absolute inset-0 rounded-full border-2 border-transparent animate-spin',
          variant === 'neon' && 'border-t-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.5)]',
          variant === 'neon-purple' && 'border-t-purple-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]',
          variant === 'neon-pink' && 'border-t-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.5)]',
          variant === 'neon-green' && 'border-t-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]',
          variant === 'holographic' && 'border-t-blue-400',
          variant === 'default' && 'border-t-blue-400',
        )}
        style={{
          animationDelay: `${i * 0.2}s`,
          animationDuration: `${1 + i * 0.3}s`,
          transform: `scale(${1 - i * 0.2})`,
        }}
      />
    ))}
  </div>
);

const VelocitySpinner = React.forwardRef<HTMLDivElement, VelocitySpinnerProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    speed = 'normal',
    type = 'circular',
    showBackground = false,
    text,
    textPosition = 'bottom',
    color,
    centered = false,
    overlay = false,
    disableAnimation = false,
    style,
    ...props 
  }, ref) => {
    // Removed unused utils variable
    
    // Handle reduced motion preference
    const prefersReducedMotion = React.useMemo(() => {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
      return false;
    }, []);
    
    const shouldAnimate = !disableAnimation && !prefersReducedMotion;
    
    // Custom color styling
    const customColorStyle = React.useMemo(() => {
      if (color) {
        return {
          color: color,
          filter: `drop-shadow(0 0 10px ${color}60)`,
        };
      }
      return {};
    }, [color]);
    
    const spinnerClasses = cn(
      velocitySpinnerVariants({ variant, size, speed: shouldAnimate ? speed : undefined }),
      !shouldAnimate && 'animate-none',
      className
    );

    const renderSpinner = () => {
      const spinnerVariant = variant || 'default';
      
      switch (type) {
        case 'dots':
          return <DotsSpinner className={spinnerClasses} variant={spinnerVariant} />;
        case 'pulse':
          return <PulseSpinner className={spinnerClasses} variant={spinnerVariant} />;
        case 'wave':
          return <WaveSpinner className={spinnerClasses} variant={spinnerVariant} />;
        case 'orbit':
          return <OrbitSpinner className={spinnerClasses} variant={spinnerVariant} />;
        case 'bars':
          return <BarsSpinner className={spinnerClasses} variant={spinnerVariant} />;
        case 'spiral':
          return <SpiralSpinner className={spinnerClasses} variant={spinnerVariant} />;
        case 'matrix':
          return <MatrixSpinner className={spinnerClasses} />;
        default:
          return <CircularSpinner className={spinnerClasses} />;
      }
    };

    const spinnerElement = (
      <div
        className={cn(
          'flex items-center justify-center gap-3',
          textPosition === 'right' && 'flex-row',
          textPosition === 'left' && 'flex-row-reverse',
          textPosition === 'bottom' && 'flex-col',
          textPosition === 'top' && 'flex-col-reverse',
        )}
        style={{...style, ...customColorStyle}}
      >
        {renderSpinner()}
        {text && (
          <span 
            className={cn(
              'text-sm font-medium',
              variant?.includes('neon') && 'drop-shadow-[0_0_4px_currentColor]',
              !shouldAnimate && 'animate-none'
            )}
            style={customColorStyle}
          >
            {text}
          </span>
        )}
      </div>
    );

    // Overlay mode
    if (overlay) {
      return (
        <div
          ref={ref}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            showBackground ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent',
          )}
          {...props}
        >
          <div
            className={cn(
              showBackground && 'bg-black/30 backdrop-blur-md rounded-xl p-6 border border-white/10',
            )}
          >
            {spinnerElement}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          centered && 'mx-auto',
          showBackground && 'bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10',
        )}
        role="status"
        aria-label={text || 'Loading'}
        {...props}
      >
        {spinnerElement}
      </div>
    );
  }
);

VelocitySpinner.displayName = 'VelocitySpinner';

export { VelocitySpinner, velocitySpinnerVariants };