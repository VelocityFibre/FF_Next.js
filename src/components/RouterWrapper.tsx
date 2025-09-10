import { useState, useEffect, ReactNode } from 'react';

interface RouterWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RouterWrapper component that safely handles router mounting issues
 * during SSR by only rendering children after the component has mounted
 */
export function RouterWrapper({ children, fallback = null }: RouterWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until after hydration to avoid router mounting issues
  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component that wraps a component with RouterWrapper
 */
export function withRouterWrapper<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <RouterWrapper fallback={fallback}>
      <Component {...props} />
    </RouterWrapper>
  );

  WrappedComponent.displayName = `withRouterWrapper(${Component.displayName || Component.name})`;

  return WrappedComponent;
}