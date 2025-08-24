/**
 * PageTransition Component - Smooth page transitions with VELOCITY theme effects
 * Features: 5+ transition types, glassmorphism loading states, React Router integration
 * 
 * Enhanced with:
 * - VELOCITY theme integration
 * - React Router integration
 * - Performance optimizations
 * - Accessibility features
 * - Custom transition timing
 * - Loading states with premium animations
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { VelocitySpinner } from './VelocitySpinner';
// Removed unused useVelocityTheme import

export type TransitionType = 'fade' | 'slide' | 'scale' | 'blur' | 'matrix' | 'glow' | 'flip' | 'zoom';

const transitionVariants: Record<TransitionType, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: 30, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -30, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
  },
  blur: {
    initial: { filter: 'blur(10px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    exit: { filter: 'blur(5px)', opacity: 0 },
  },
  matrix: {
    initial: { 
      opacity: 0, 
      rotateX: -15,
      transformPerspective: 1000,
      y: 20,
    },
    animate: { 
      opacity: 1, 
      rotateX: 0,
      transformPerspective: 1000,
      y: 0,
    },
    exit: { 
      opacity: 0, 
      rotateX: 15,
      transformPerspective: 1000,
      y: -20,
    },
  },
  // New enhanced transitions
  glow: {
    initial: { 
      opacity: 0,
      scale: 0.95,
      filter: 'brightness(0.5) saturate(1.5)',
    },
    animate: { 
      opacity: 1,
      scale: 1,
      filter: 'brightness(1) saturate(1)',
    },
    exit: { 
      opacity: 0,
      scale: 1.05,
      filter: 'brightness(1.2) saturate(1.8)',
    },
  },
  flip: {
    initial: {
      opacity: 0,
      rotateY: -90,
      transformPerspective: 1000,
    },
    animate: {
      opacity: 1,
      rotateY: 0,
      transformPerspective: 1000,
    },
    exit: {
      opacity: 0,
      rotateY: 90,
      transformPerspective: 1000,
    },
  },
  zoom: {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
    },
  },
};

interface PageTransitionProps {
  children: React.ReactNode;
  /** Transition animation type */
  type?: TransitionType;
  /** Animation duration in seconds */
  duration?: number;
  /** Show loading state */
  loading?: boolean;
  /** Loading spinner type */
  loadingType?: 'circular' | 'dots' | 'pulse' | 'wave' | 'orbit' | 'matrix' | 'bars' | 'spiral';
  /** Loading text */
  loadingText?: string;
  /** Custom easing function */
  easing?: [number, number, number, number];
  /** Disable animation on reduced motion preference */
  respectReducedMotion?: boolean;
  /** Custom className */
  className?: string;
  /** Custom delay before showing content */
  delay?: number;
  /** Show glassmorphism background during loading */
  glassBackground?: boolean;
}

interface RouteTransitionProps {
  children: React.ReactNode;
  /** React Router location key */
  locationKey: string;
  /** Transition type */
  type?: TransitionType;
  /** Animation duration */
  duration?: number;
  /** Custom easing */
  easing?: [number, number, number, number];
  /** Respect reduced motion */
  respectReducedMotion?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 0.3,
  loading = false,
  loadingType = 'orbit',
  loadingText = 'Loading...',
  easing = [0.4, 0, 0.2, 1],
  respectReducedMotion = true,
  className = '',
  delay = 0,
  glassBackground = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(!loading);
  // Removed unused utils variable

  // Handle reduced motion preference
  const prefersReducedMotion = React.useMemo(() => {
    if (!respectReducedMotion || typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [respectReducedMotion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, [delay]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      return undefined;
    }
  }, [loading]);

  const variants = prefersReducedMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : transitionVariants[type];
    
  const transition = prefersReducedMotion
    ? { duration: 0.15 }
    : { duration, ease: easing };

  if (loading || !showContent) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-[400px] relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
        role="status"
        aria-live="polite"
        aria-label={loadingText}
      >
        {/* Enhanced glassmorphism loading background */}
        {glassBackground && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-purple-500/8 backdrop-blur-sm" />
        )}
        
        {/* Loading content with enhanced styling */}
        <div className="relative z-10 text-center space-y-6">
          <VelocitySpinner 
            type={loadingType} 
            variant="neon" 
            size="xl"
            text={loadingText}
            textPosition="bottom"
            showBackground={glassBackground}
            disableAnimation={prefersReducedMotion}
          />
          
          {/* Animated loading dots */}
          <motion.div 
            className="flex justify-center space-x-1"
            animate={prefersReducedMotion ? {} : { opacity: [0.4, 1, 0.4] }}
            transition={prefersReducedMotion ? {} : { duration: 2, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-cyan-400 rounded-full"
                animate={prefersReducedMotion ? {} : { 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={prefersReducedMotion ? {} : {
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className={className}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Higher-order component for easy page wrapping
export const withPageTransition = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  transitionProps?: Omit<PageTransitionProps, 'children'>
) => {
  const TransitionedComponent: React.FC<P> = (props) => (
    <PageTransition {...transitionProps}>
      <WrappedComponent {...props} />
    </PageTransition>
  );

  TransitionedComponent.displayName = `withPageTransition(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return TransitionedComponent;
};

// Enhanced Route transition wrapper for React Router
export const RouteTransition: React.FC<RouteTransitionProps> = ({ 
  children, 
  locationKey, 
  type = 'fade',
  duration = 0.3,
  easing = [0.4, 0, 0.2, 1],
  respectReducedMotion = true,
}) => {
  // Handle reduced motion preference
  const prefersReducedMotion = React.useMemo(() => {
    if (!respectReducedMotion || typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [respectReducedMotion]);

  const variants = prefersReducedMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : transitionVariants[type];
    
  const transition = prefersReducedMotion
    ? { duration: 0.15 }
    : { duration, ease: easing };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Utility hook for React Router integration
export const usePageTransition = (type: TransitionType = 'fade') => {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  const startTransition = React.useCallback(() => {
    setIsTransitioning(true);
  }, []);
  
  const endTransition = React.useCallback(() => {
    setIsTransitioning(false);
  }, []);
  
  return {
    isTransitioning,
    startTransition,
    endTransition,
    TransitionWrapper: ({ children }: { children: React.ReactNode }) => (
      <PageTransition type={type} loading={isTransitioning}>
        {children}
      </PageTransition>
    ),
  };
};

// Type exports
export type { PageTransitionProps, RouteTransitionProps };